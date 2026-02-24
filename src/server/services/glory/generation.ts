// =============================================================================
// SERVICE S.GLORY.4 — Glory Generation Engine
// =============================================================================
// Main AI generation service for all GLORY tools.
// Orchestrates: registry lookup → context build → prompt assembly → AI call → parse → persist.
// Called by: tRPC glory.generate mutation
// Dependencies:
//   ~/server/services/anthropic-client (resilientGenerateText, anthropic, DEFAULT_MODEL)
//   ~/server/services/prompt-helpers (injectSpecialization)
//   ~/server/services/glory/registry (getToolBySlug)
//   ~/server/services/glory/prompts (GLORY_SYSTEM_PROMPTS)
//   ~/server/services/glory/context-builder (buildStrategyContext)
//   ~/server/db
// =============================================================================

import {
  resilientGenerateText,
  anthropic,
  DEFAULT_MODEL,
} from "~/server/services/anthropic-client";
import { injectSpecialization } from "~/server/services/prompt-helpers";
import { getToolBySlug } from "~/server/services/glory/registry";
import { GLORY_SYSTEM_PROMPTS } from "~/server/services/glory/prompts";
import { buildStrategyContext } from "~/server/services/glory/context-builder";
import { db } from "~/server/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenerateOpts {
  toolSlug: string;
  strategyId: string;
  userInputs: Record<string, unknown>;
  userId: string;
  save?: boolean;
  title?: string;
}

interface GenerateResult {
  outputData: unknown;
  outputText: string;
  savedId?: string;
}

// ---------------------------------------------------------------------------
// 4.1  JSON extraction helpers
// ---------------------------------------------------------------------------

/**
 * Robustly extracts JSON from AI response text.
 * Handles: raw JSON, markdown-fenced JSON (```json ... ```), and partial wrapping.
 */
function extractJsonFromText(text: string): unknown | null {
  // 1. Try direct parse first (cheapest path)
  try {
    return JSON.parse(text);
  } catch {
    // not valid JSON as-is, continue
  }

  // 2. Try extracting from markdown code fences (```json ... ``` or ``` ... ```)
  const fencePattern = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/;
  const fenceMatch = fencePattern.exec(text);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // fence content isn't valid JSON either
    }
  }

  // 3. Try to find the outermost { ... } block
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {
      // still not parseable
    }
  }

  // 4. Try to find the outermost [ ... ] block (arrays)
  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(text.slice(firstBracket, lastBracket + 1));
    } catch {
      // not parseable
    }
  }

  return null;
}

/**
 * Build a plain-text summary from parsed output data.
 * Walks top-level keys and produces a readable text version.
 */
function buildOutputText(data: unknown): string {
  if (typeof data === "string") return data;
  if (data === null || data === undefined) return "";

  if (typeof data !== "object") return String(data);

  const lines: string[] = [];

  if (Array.isArray(data)) {
    for (const item of data) {
      lines.push(typeof item === "string" ? `- ${item}` : `- ${JSON.stringify(item)}`);
    }
    return lines.join("\n");
  }

  // Object — enumerate top-level keys
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (typeof value === "string") {
      lines.push(`## ${key}\n${value}`);
    } else if (Array.isArray(value)) {
      lines.push(`## ${key}`);
      for (const item of value) {
        lines.push(typeof item === "string" ? `- ${item}` : `- ${JSON.stringify(item)}`);
      }
    } else if (value !== null && value !== undefined) {
      lines.push(`## ${key}\n${JSON.stringify(value, null, 2)}`);
    }
  }

  return lines.join("\n\n");
}

// ---------------------------------------------------------------------------
// 4.2  Format user inputs for the prompt
// ---------------------------------------------------------------------------

function formatUserInputs(inputs: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(inputs)) {
    if (value === undefined || value === null || value === "") continue;
    const displayKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
    if (typeof value === "object") {
      lines.push(`- **${displayKey}** : ${JSON.stringify(value)}`);
    } else {
      lines.push(`- **${displayKey}** : ${String(value)}`);
    }
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// 4.3  Main export — generateGloryOutput
// ---------------------------------------------------------------------------

export async function generateGloryOutput(opts: GenerateOpts): Promise<GenerateResult> {
  // 1. Registry lookup
  const tool = getToolBySlug(opts.toolSlug);
  if (!tool) {
    throw new Error(
      `Outil GLORY introuvable : "${opts.toolSlug}". Vérifiez le slug dans le registre.`,
    );
  }

  // 2. Build strategy context
  const { context, strategy } = await buildStrategyContext(
    opts.strategyId,
    tool.requiredPillars,
  );

  // 3. Get system prompt
  const systemPrompt = GLORY_SYSTEM_PROMPTS[opts.toolSlug];
  if (!systemPrompt) {
    throw new Error(
      `Prompt système manquant pour l'outil GLORY "${opts.toolSlug}". Ajoutez-le dans glory/prompts.ts.`,
    );
  }

  // 4. Inject vertical/maturity specialization
  const enrichedSystemPrompt = injectSpecialization(systemPrompt, {
    vertical: strategy.vertical,
    maturityProfile: strategy.maturityProfile,
  });

  // 5. Build user prompt
  const formattedInputs = formatUserInputs(opts.userInputs);
  const userPrompt = [
    "# DONNÉES STRATÉGIQUES DE LA MARQUE",
    context,
    "",
    "# INPUTS DE L'UTILISATEUR",
    formattedInputs,
    "",
    "Génère maintenant le résultat demandé en respectant le format JSON spécifié.",
  ].join("\n");

  // 6. Call AI
  const aiResult = await resilientGenerateText({
    label: `glory-${opts.toolSlug}`,
    model: anthropic(DEFAULT_MODEL),
    system: enrichedSystemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 8000,
    temperature: 0.7,
  });

  const rawText: string = typeof aiResult.text === "string" ? aiResult.text : String(aiResult.text);

  // 7. Parse response
  let outputData: unknown;
  let outputText: string;

  if (tool.outputFormat === "markdown") {
    // For markdown tools, keep the raw text as-is
    outputData = { markdown: rawText };
    outputText = rawText;
  } else {
    // Try to extract structured JSON
    const parsed = extractJsonFromText(rawText);
    if (parsed !== null) {
      outputData = parsed;
      outputText = buildOutputText(parsed);
    } else {
      // Fallback: treat the whole response as text
      outputData = { rawResponse: rawText };
      outputText = rawText;
    }
  }

  // 8. Persist if requested and tool allows it
  let savedId: string | undefined;

  if (opts.save && tool.persistable) {
    const autoTitle =
      opts.title ?? `${tool.shortName} — ${strategy.brandName}`;

    const record = await db.gloryOutput.create({
      data: {
        strategyId: opts.strategyId,
        toolSlug: opts.toolSlug,
        layer: tool.layer,
        title: autoTitle,
        inputData: opts.userInputs as object,
        outputData: outputData as object,
        outputText,
        status: "complete",
        version: 1,
        createdBy: opts.userId,
      },
    });

    savedId = record.id;
  }

  // 9. Return
  return { outputData, outputText, savedId };
}
