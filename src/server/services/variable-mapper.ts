// =============================================================================
// MODULE 16B — Variable Mapper
// =============================================================================
// Maps parsed file content to interview schema variables using AI. Takes raw
// text extracted by the File Parser (Module 16) and returns a mapping of
// ADVERTIS A-E variable IDs to their extracted values. Includes confidence
// scoring and unmapped variable tracking.
//
// Public API:
//   1. mapTextToVariables() — Map extracted text to ADVERTIS A-E variables
//
// Dependencies:
//   - anthropic-client (anthropic, DEFAULT_MODEL, resilientGenerateText)
//   - ~/lib/interview-schema (getFicheDeMarqueSchema, getAllFicheVariableIds)
//
// Called by:
//   - tRPC import router (import.mapVariables)
//   - File Parser pipeline (post-parsing step)
// =============================================================================

import {
  anthropic,
  DEFAULT_MODEL,
  resilientGenerateText,
} from "./anthropic-client";
import {
  getFicheDeMarqueSchema,
  getAllFicheVariableIds,
} from "~/lib/interview-schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MappingResult {
  mappedVariables: Record<string, string>; // { A1: "...", D3: "...", ... }
  confidence: number; // 0-100 — how many variables were successfully mapped
  unmappedVariables: string[]; // Variable IDs that couldn't be mapped
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Maps extracted text to ADVERTIS A-E variables using AI.
 *
 * @param extractedText - Raw text extracted from the uploaded file
 * @param brandName - Name of the brand (for context)
 * @param sector - Industry sector (for context)
 * @returns Mapped variables ready to merge into interviewData
 */
export async function mapTextToVariables(
  extractedText: string,
  brandName: string,
  sector: string,
): Promise<MappingResult> {
  const schema = getFicheDeMarqueSchema();
  const allVariableIds = getAllFicheVariableIds();

  // Build the variable reference for the prompt
  const variableReference = schema
    .map((section) => {
      const vars = section.variables
        .map((v) => `  - ${v.id} (${v.label}): ${v.description}`)
        .join("\n");
      return `Pilier ${section.pillarType} — ${section.title}:\n${vars}`;
    })
    .join("\n\n");

  const systemPrompt = `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS.
Ta tâche est d'analyser un document importé et d'en extraire les informations pertinentes pour remplir les variables de la Fiche de Marque (piliers A, D, V, E).

Voici les variables à remplir :

${variableReference}

INSTRUCTIONS :
1. Lis attentivement le texte fourni
2. Pour chaque variable, extrais ou déduis l'information pertinente du texte
3. Si une information n'est pas clairement disponible dans le texte, laisse la valeur vide ("")
4. Conserve les détails concrets : chiffres, noms, dates, données spécifiques
5. Rédige en français, de manière structurée et professionnelle
6. Ne fabrique JAMAIS d'information — n'extrais que ce qui est dans le texte

FORMAT DE RÉPONSE :
Réponds UNIQUEMENT avec un objet JSON valide mappant les IDs de variables à leurs valeurs extraites.
Exemple : { "A1": "Description de l'identité...", "D1": "Persona principal...", "V3": "" }

Important : inclus TOUTES les variables (A0 à E6), même celles sans valeur (valeur = "").`;

  const userPrompt = `Document importé pour la marque "${brandName}" (secteur : ${sector}) :

---
${extractedText}
---

Extrais les informations pertinentes et mappe-les aux variables ADVERTIS A-E.`;

  const { text } = await resilientGenerateText({
    label: "variable-mapper",
    model: anthropic(DEFAULT_MODEL),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 6000,
    temperature: 0.3,
  });

  // Parse the AI response as JSON
  const mappedVariables = parseAIResponse(text, allVariableIds);

  // Calculate confidence score
  const filledCount = Object.values(mappedVariables).filter(
    (v) => v.trim().length > 0,
  ).length;
  const confidence = Math.round((filledCount / allVariableIds.length) * 100);

  const unmappedVariables = allVariableIds.filter(
    (id) => !mappedVariables[id] || mappedVariables[id]!.trim().length === 0,
  );

  return {
    mappedVariables,
    confidence,
    unmappedVariables,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse the AI response text as JSON, with multi-strategy fallback extraction.
 * Strategies (tried in order):
 *   1. Markdown code fence extraction (```json ... ```)
 *   2. First { ... } brace detection
 *   3. Regex key-value extraction as last resort
 * On total failure, returns empty mapping with error log showing data loss.
 */
function parseAIResponse(
  responseText: string,
  validIds: string[],
): Record<string, string> {
  const rawText = responseText.trim();

  // --- Strategy 1: Markdown code fence ---
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) {
    const parsed = tryParseJson(fenceMatch[1].trim(), validIds);
    if (parsed) return parsed;
  }

  // --- Strategy 2: Find first { ... } block ---
  const braceStart = rawText.indexOf("{");
  const braceEnd = rawText.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) {
    const parsed = tryParseJson(rawText.substring(braceStart, braceEnd + 1), validIds);
    if (parsed) return parsed;
  }

  // --- Strategy 3: Regex key-value extraction ---
  // Handles cases where JSON is broken but key-value pairs are recognizable
  const regexResult = extractByRegex(rawText, validIds);
  if (regexResult) {
    const filledCount = Object.values(regexResult).filter((v) => v.trim().length > 0).length;
    console.warn(
      `[VariableMapper] JSON parse failed, regex fallback recovered ${filledCount}/${validIds.length} variables.`,
    );
    return regexResult;
  }

  // --- Total failure: return empty mapping with clear error ---
  console.error(
    `[VariableMapper] TOTAL PARSE FAILURE — ALL ${validIds.length} variables lost. ` +
    `Response preview: "${rawText.substring(0, 300)}..."`,
  );
  const result: Record<string, string> = {};
  for (const id of validIds) {
    result[id] = "";
  }
  return result;
}

/**
 * Try to parse a JSON string and extract valid variable IDs.
 * Returns null on failure (caller should try next strategy).
 */
function tryParseJson(
  jsonString: string,
  validIds: string[],
): Record<string, string> | null {
  try {
    const parsed = JSON.parse(jsonString) as Record<string, unknown>;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    const result: Record<string, string> = {};
    let hasAnyValue = false;

    for (const id of validIds) {
      const value = parsed[id];
      if (typeof value === "string" && value.trim().length > 0) {
        result[id] = value;
        hasAnyValue = true;
      } else if (typeof value === "object" && value !== null) {
        // AI sometimes wraps a string in an object — stringify it
        result[id] = JSON.stringify(value);
        hasAnyValue = true;
      } else {
        result[id] = "";
      }
    }

    // Only succeed if at least ONE variable was extracted
    return hasAnyValue ? result : null;
  } catch {
    return null;
  }
}

/**
 * Last resort: extract variable values via regex patterns.
 * Looks for patterns like "A1": "some value" or "A1": "..."
 * Returns null if no variables found at all.
 */
function extractByRegex(
  text: string,
  validIds: string[],
): Record<string, string> | null {
  const result: Record<string, string> = {};
  let foundAny = false;

  for (const id of validIds) {
    // Match "ID" : "value" (with possible escaping)
    const pattern = new RegExp(
      `"${id}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`
    );
    const match = text.match(pattern);
    if (match?.[1]) {
      // Unescape JSON string escapes
      try {
        result[id] = JSON.parse(`"${match[1]}"`);
      } catch {
        result[id] = match[1];
      }
      foundAny = true;
    } else {
      result[id] = "";
    }
  }

  return foundAny ? result : null;
}
