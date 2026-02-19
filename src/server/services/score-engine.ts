// Unified Score Engine — Single entry point for recalculating ALL strategy scores.
// Calls the 3 mathematical calculators, persists results, and creates snapshots.

import { db } from "~/server/db";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import {
  getCoherenceBreakdown,
  type CoherenceBreakdown,
} from "./coherence-calculator";
import {
  calculateRiskScore,
  type RiskBreakdown,
} from "./risk-calculator";
import {
  calculateBrandMarketFit,
  type BmfBreakdown,
} from "./bmf-calculator";
import type { RiskAuditResult, TrackAuditResult } from "~/lib/types/pillar-schemas";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface AllScores {
  coherenceScore: number;
  coherenceBreakdown: CoherenceBreakdown;
  riskScore: number | null;
  riskBreakdown: RiskBreakdown | null;
  bmfScore: number | null;
  bmfBreakdown: BmfBreakdown | null;
}

// ---------------------------------------------------------------------------
// Main recalculation function
// ---------------------------------------------------------------------------

/**
 * Recalculate ALL scores for a strategy using deterministic mathematical formulas.
 *
 * 1. Loads strategy + all pillars
 * 2. Parses pillar content via Zod
 * 3. Computes coherence (5 components), risk (4 components), BMF (4 components)
 * 4. Persists updated scores in DB
 * 5. Creates a ScoreSnapshot for evolution tracking
 *
 * @param trigger — What caused this recalculation (for snapshot audit trail)
 */
export async function recalculateAllScores(
  strategyId: string,
  trigger:
    | "pillar_update"
    | "audit_review"
    | "fiche_review"
    | "manual"
    | "generation" = "pillar_update",
): Promise<AllScores> {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: { pillars: true },
  });

  if (!strategy) {
    throw new Error(`Strategy not found: ${strategyId}`);
  }

  // Parse all pillar data into typed objects
  const pillarMap: Record<string, unknown> = {};
  for (const p of strategy.pillars) {
    const { data } = parsePillarContent(p.type, p.content);
    pillarMap[p.type] = data;
  }

  // --- 1. Coherence Score (always calculable) ---
  const coherenceBreakdown = getCoherenceBreakdown(
    strategy.pillars,
    strategy.interviewData as Record<string, unknown> | undefined,
    pillarMap,
  );

  // --- 2. Risk Score (only if R pillar is complete) ---
  let riskScore: number | null = null;
  let riskBreakdown: RiskBreakdown | null = null;
  const rPillar = strategy.pillars.find((p) => p.type === "R");
  if (rPillar?.status === "complete" && rPillar.content) {
    const { data: rData } = parsePillarContent<RiskAuditResult>(
      "R",
      rPillar.content,
    );
    if (rData) {
      riskBreakdown = calculateRiskScore(rData);
      riskScore = riskBreakdown.total;
    }
  }

  // --- 3. Brand-Market Fit Score (only if T pillar is complete) ---
  let bmfScore: number | null = null;
  let bmfBreakdown: BmfBreakdown | null = null;
  const tPillar = strategy.pillars.find((p) => p.type === "T");
  if (tPillar?.status === "complete" && tPillar.content) {
    const { data: tData } = parsePillarContent<TrackAuditResult>(
      "T",
      tPillar.content,
    );
    if (tData) {
      bmfBreakdown = calculateBrandMarketFit(tData);
      bmfScore = bmfBreakdown.total;
    }
  }

  // --- 4. Persist Strategy.coherenceScore ---
  await db.strategy.update({
    where: { id: strategyId },
    data: { coherenceScore: coherenceBreakdown.total },
  });

  // --- 5. Persist riskScore inside R pillar content (overwrite AI snapshot) ---
  if (riskScore !== null && rPillar) {
    const rContent =
      typeof rPillar.content === "object" && rPillar.content !== null
        ? (rPillar.content as Record<string, unknown>)
        : {};
    const updatedRContent = {
      ...rContent,
      riskScore,
      riskScoreFormula: riskBreakdown
        ? JSON.parse(JSON.stringify(riskBreakdown))
        : null,
    };
    await db.pillar.update({
      where: { id: rPillar.id },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: updatedRContent as any,
      },
    });
  }

  // --- 6. Persist bmfScore inside T pillar content (overwrite AI snapshot) ---
  if (bmfScore !== null && tPillar) {
    const tContent =
      typeof tPillar.content === "object" && tPillar.content !== null
        ? (tPillar.content as Record<string, unknown>)
        : {};
    const updatedTContent = {
      ...tContent,
      brandMarketFitScore: bmfScore,
      bmfScoreFormula: bmfBreakdown
        ? JSON.parse(JSON.stringify(bmfBreakdown))
        : null,
    };
    await db.pillar.update({
      where: { id: tPillar.id },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: updatedTContent as any,
      },
    });
  }

  // --- 7. Create ScoreSnapshot for evolution tracking ---
  try {
    await db.scoreSnapshot.create({
      data: {
        strategyId,
        coherenceScore: coherenceBreakdown.total,
        riskScore,
        bmfScore,
        trigger,
      },
    });
  } catch {
    // ScoreSnapshot table might not exist yet (pre-migration) — don't crash
    console.warn("[ScoreEngine] Failed to create ScoreSnapshot — table may not exist yet");
  }

  return {
    coherenceScore: coherenceBreakdown.total,
    coherenceBreakdown,
    riskScore,
    riskBreakdown,
    bmfScore,
    bmfBreakdown,
  };
}
