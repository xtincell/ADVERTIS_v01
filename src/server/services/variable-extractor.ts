// =============================================================================
// MODULE 21 — Variable Extractor (Pillar → BrandVariables)
// =============================================================================
// After a pillar is generated (or manually edited), this service extracts the
// top-level sections from pillar.content and writes them as individual
// BrandVariable records via the Variable Store.
//
// Direction: Pillar.content JSON → BrandVariable rows
// (The reverse direction is handled by pillar-materializer.ts)
//
// Public API:
//   1. extractVariablesFromPillar() — Extract sections from a pillar's content
//   2. extractScoreVariables()      — Extract score values as BrandVariables
//
// Dependencies:
//   - ~/lib/types/pillar-parsers (parsePillarContent)
//   - ~/lib/variable-registry (getPillarSectionDefinitions)
//   - ./variable-store (setVariablesBatch)
//
// Called by:
//   - pipeline-orchestrator.ts (after pillar generation)
//   - pillar.ts router (after manual pillar edit)
//   - variable-backfill.ts (migration of existing data)
// =============================================================================

import { parsePillarContent } from "~/lib/types/pillar-parsers";
import { getPillarSectionDefinitions } from "~/lib/variable-registry";
import { setVariablesBatch, type BatchVariableEntry } from "./variable-store";
import type { VariableSource } from "~/lib/variable-registry";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extract BrandVariables from a pillar's generated content.
 *
 * Parses the content through the Zod schema (defaults applied), then creates
 * one BrandVariable per top-level section defined in the variable registry.
 *
 * @param strategyId - Strategy ID
 * @param pillarType - Pillar letter (A-S)
 * @param content - Raw pillar content (from Pillar.content JSON or AI output)
 * @param userId - User who triggered the extraction (for updatedBy)
 * @param source - Source of the data (defaults to "ai_generation")
 * @param sourceDetail - Optional detail (e.g., module ID, file name)
 * @returns Summary of extraction
 */
export async function extractVariablesFromPillar(
  strategyId: string,
  pillarType: string,
  content: unknown,
  userId: string,
  source: VariableSource = "ai_generation",
  sourceDetail?: string,
): Promise<{ extracted: number; keys: string[] }> {
  // 1. Parse content through Zod (applies defaults for missing fields)
  const { data } = parsePillarContent<Record<string, unknown>>(pillarType, content);

  // 2. Get the variable definitions for this pillar's sections
  const sectionDefs = getPillarSectionDefinitions(pillarType);

  if (sectionDefs.length === 0) {
    console.warn(
      `[VariableExtractor] No section definitions found for pillar ${pillarType}`,
    );
    return { extracted: 0, keys: [] };
  }

  // 3. Build batch entries: one per section definition
  const entries: BatchVariableEntry[] = [];

  for (const def of sectionDefs) {
    if (!def.pillarSection) continue;

    const sectionValue = data[def.pillarSection];

    // Skip undefined sections (shouldn't happen with Zod defaults, but be safe)
    if (sectionValue === undefined) continue;

    entries.push({
      key: def.key,
      value: sectionValue,
      options: {
        source,
        sourceDetail,
        confidence: "HIGH",
        changedBy: userId,
      },
    });
  }

  // 4. Batch upsert to database
  if (entries.length > 0) {
    await setVariablesBatch(strategyId, entries);
  }

  const keys = entries.map((e) => e.key);
  return { extracted: entries.length, keys };
}

/**
 * Extract score values as BrandVariables.
 *
 * Called after score recalculation to persist scores as tracked variables
 * with provenance and staleness tracking.
 *
 * @param strategyId - Strategy ID
 * @param scores - The 3 scores to extract
 */
export async function extractScoreVariables(
  strategyId: string,
  scores: {
    coherenceScore?: number | null;
    riskScore?: number | null;
    bmfScore?: number | null;
    investScore?: number | null;
  },
): Promise<void> {
  const entries: BatchVariableEntry[] = [];
  const opts = {
    source: "score_engine" as VariableSource,
    confidence: "HIGH" as const,
    changedBy: "system",
  };

  if (scores.coherenceScore != null) {
    entries.push({ key: "score.coherence", value: scores.coherenceScore, options: opts });
  }
  if (scores.riskScore != null) {
    entries.push({ key: "score.risk", value: scores.riskScore, options: opts });
  }
  if (scores.bmfScore != null) {
    entries.push({ key: "score.bmf", value: scores.bmfScore, options: opts });
  }
  if (scores.investScore != null) {
    entries.push({ key: "score.invest", value: scores.investScore, options: opts });
  }

  if (entries.length > 0) {
    await setVariablesBatch(strategyId, entries);
  }
}
