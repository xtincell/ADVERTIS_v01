// =============================================================================
// MODULE 25 — Variable Backfill (Migration Service)
// =============================================================================
// Extracts BrandVariable records from existing strategy data (interviewData,
// pillar content, scores) that was created before the Variable Registry system.
//
// This is a one-time migration helper, but can safely be re-run at any time
// (idempotent — uses upsert semantics via setVariablesBatch).
//
// Public API:
//   backfillStrategy(strategyId)      → { variables: number }
//   backfillAllStrategies(opts?)      → { processed: number, variables: number, errors: string[] }
//
// Dependencies:
//   - ~/server/db (Prisma client)
//   - ~/lib/types/pillar-parsers (parsePillarContent)
//   - ~/lib/variable-registry (getPillarSectionDefinitions)
//   - ./variable-store (setVariablesBatch)
//   - ./variable-extractor (extractVariablesFromPillar, extractScoreVariables)
//
// Called by:
//   - variable.ts router (backfill procedure — admin only)
// =============================================================================

import { db } from "~/server/db";
import { extractVariablesFromPillar, extractScoreVariables } from "./variable-extractor";
import { setVariablesBatch, type BatchVariableEntry } from "./variable-store";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Backfill BrandVariable records for a single strategy.
 *
 * 1. Extracts interview variables from strategy.interviewData
 * 2. Extracts pillar section variables from all completed pillars
 * 3. Extracts score variables from strategy.coherenceScore + pillar content
 *
 * Safe to re-run: uses upsert semantics (existing records are updated).
 *
 * @param strategyId - Strategy to backfill
 * @returns Count of variables created/updated
 */
export async function backfillStrategy(
  strategyId: string,
): Promise<{ variables: number }> {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: { pillars: true },
  });

  if (!strategy) {
    throw new Error(`[VariableBackfill] Strategy not found: ${strategyId}`);
  }

  let totalVariables = 0;

  // --- Phase 1: Interview data ---
  const interviewData = strategy.interviewData as Record<string, unknown> | null;
  if (interviewData && typeof interviewData === "object") {
    const entries: BatchVariableEntry[] = [];

    for (const [varId, value] of Object.entries(interviewData)) {
      // Skip empty/null values
      if (value === null || value === undefined || value === "") continue;

      entries.push({
        key: `interview.${varId}`,
        value,
        options: {
          source: "user_input",
          confidence: "HIGH",
          changedBy: "backfill",
        },
      });
    }

    if (entries.length > 0) {
      await setVariablesBatch(strategyId, entries);
      totalVariables += entries.length;
    }
  }

  // --- Phase 2: Pillar content ---
  for (const pillar of strategy.pillars) {
    if (pillar.status !== "complete" || !pillar.content) continue;

    try {
      const result = await extractVariablesFromPillar(
        strategyId,
        pillar.type,
        pillar.content,
        "backfill",
        "user_input", // Treat existing data as user-validated
        "backfill-migration",
      );
      totalVariables += result.extracted;
    } catch (err) {
      console.warn(
        `[VariableBackfill] Failed to extract pillar ${pillar.type} for strategy ${strategyId}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  // --- Phase 3: Scores ---
  try {
    const scores: { coherenceScore?: number | null; riskScore?: number | null; bmfScore?: number | null } = {};

    // Coherence score from strategy record
    if (strategy.coherenceScore != null) {
      scores.coherenceScore = strategy.coherenceScore;
      totalVariables++;
    }

    // Risk score from R pillar content
    const rPillar = strategy.pillars.find((p) => p.type === "R");
    if (rPillar?.content && typeof rPillar.content === "object") {
      const rContent = rPillar.content as Record<string, unknown>;
      if (typeof rContent.riskScore === "number") {
        scores.riskScore = rContent.riskScore;
        totalVariables++;
      }
    }

    // BMF score from T pillar content
    const tPillar = strategy.pillars.find((p) => p.type === "T");
    if (tPillar?.content && typeof tPillar.content === "object") {
      const tContent = tPillar.content as Record<string, unknown>;
      if (typeof tContent.brandMarketFitScore === "number") {
        scores.bmfScore = tContent.brandMarketFitScore;
        totalVariables++;
      }
    }

    if (scores.coherenceScore != null || scores.riskScore != null || scores.bmfScore != null) {
      await extractScoreVariables(strategyId, scores);
    }
  } catch (err) {
    console.warn(
      `[VariableBackfill] Failed to extract scores for strategy ${strategyId}:`,
      err instanceof Error ? err.message : err,
    );
  }

  return { variables: totalVariables };
}

/**
 * Backfill BrandVariable records for ALL strategies in the database.
 *
 * Processes strategies in batches to avoid memory issues.
 * Safe to re-run: uses upsert semantics.
 *
 * @param opts - Optional configuration
 * @param opts.batchSize - Number of strategies to process at once (default: 10)
 * @param opts.onProgress - Progress callback
 * @returns Summary of backfill operation
 */
export async function backfillAllStrategies(opts?: {
  batchSize?: number;
  onProgress?: (processed: number, total: number) => void;
}): Promise<{ processed: number; variables: number; errors: string[] }> {
  const batchSize = opts?.batchSize ?? 10;

  // Get total count
  const total = await db.strategy.count();

  let processed = 0;
  let totalVariables = 0;
  const errors: string[] = [];

  // Process in batches
  let cursor: string | undefined;

  while (processed < total) {
    const strategies = await db.strategy.findMany({
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    if (strategies.length === 0) break;

    for (const strategy of strategies) {
      try {
        const result = await backfillStrategy(strategy.id);
        totalVariables += result.variables;
      } catch (err) {
        const msg = `Strategy ${strategy.id}: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(msg);
        console.error(`[VariableBackfill] Error:`, msg);
      }

      processed++;
      opts?.onProgress?.(processed, total);
    }

    cursor = strategies[strategies.length - 1]?.id;
  }

  return { processed, variables: totalVariables, errors };
}
