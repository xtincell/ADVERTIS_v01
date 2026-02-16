// Variable Mapper Service
// Uses AI to map extracted text from imported files to ADVERTIS A-E variables.
// Takes raw text and returns a Record<variableId, extractedValue>.

import { generateText } from "ai";

import { anthropic, DEFAULT_MODEL } from "./anthropic-client";
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

Important : inclus TOUTES les variables (A1 à E6), même celles sans valeur (valeur = "").`;

  const userPrompt = `Document importé pour la marque "${brandName}" (secteur : ${sector}) :

---
${extractedText}
---

Extrais les informations pertinentes et mappe-les aux variables ADVERTIS A-E.`;

  const { text } = await generateText({
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
 * Parse the AI response text as JSON, with fallback extraction.
 */
function parseAIResponse(
  responseText: string,
  validIds: string[],
): Record<string, string> {
  // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
  let jsonString = responseText.trim();

  // Remove markdown code block if present
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    jsonString = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonString) as Record<string, unknown>;
    const result: Record<string, string> = {};

    for (const id of validIds) {
      const value = parsed[id];
      result[id] = typeof value === "string" ? value : "";
    }

    return result;
  } catch {
    // If JSON parsing fails, return empty mapping
    console.error(
      "Failed to parse AI variable mapping response:",
      responseText.substring(0, 200),
    );
    const result: Record<string, string> = {};
    for (const id of validIds) {
      result[id] = "";
    }
    return result;
  }
}
