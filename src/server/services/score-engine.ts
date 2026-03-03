// =============================================================================
// MODULE 6 — Score Engine (Unified Score Recalculation)
// =============================================================================
//
// Single entry point for recalculating ALL strategy scores. Orchestrates
// the 4 mathematical calculators, persists results to DB, and creates
// ScoreSnapshot records for evolution tracking.
//
// PUBLIC API :
//   6.1  recalculateAllScores() — Recomputes coherence + risk + BMF + invest scores
//
// SCORE COMPONENTS :
//   - Coherence (0-100) → Module 6A (coherence-calculator.ts)
//   - Risk      (0-100) → Module 6B (risk-calculator.ts)
//   - BMF       (0-100) → Module 6C (bmf-calculator.ts)
//   - Invest    (0-100) → Module 6D (investment-calculator.ts)
//
// DEPENDENCIES :
//   - Module 6A (coherence-calculator)
//   - Module 6B (risk-calculator)
//   - Module 6C (bmf-calculator)
//   - Module 6D (investment-calculator)
//   - lib/types/pillar-parsers → parsePillarContent()
//   - Prisma: Strategy, Pillar, ScoreSnapshot
//
// CALLED BY :
//   - API Route POST /api/ai/generate (after each pillar generation)
//   - Module 10 (fiche-upgrade.ts) → after full regeneration
//   - tRPC router strategy.recalcScores
//
// =============================================================================

import { db } from "~/server/db";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import { extractScoreVariables } from "./variable-extractor";
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
import {
  calculateInvestmentScore,
  type InvestBreakdown,
} from "./investment-calculator";
import type { RiskAuditResult, TrackAuditResult, ImplementationData } from "~/lib/types/pillar-schemas";

// ---------------------------------------------------------------------------
// 6.0  Types
// ---------------------------------------------------------------------------

export interface AllScores {
  coherenceScore: number;
  coherenceBreakdown: CoherenceBreakdown;
  riskScore: number | null;
  riskBreakdown: RiskBreakdown | null;
  bmfScore: number | null;
  bmfBreakdown: BmfBreakdown | null;
  investScore: number | null;
  investBreakdown: InvestBreakdown | null;
  /** Only present for child strategies in the brand tree */
  parentCoherenceScore?: number | null;
}

// ---------------------------------------------------------------------------
// 6.1  recalculateAllScores — Main recalculation function
// ---------------------------------------------------------------------------

/**
 * Recalculate ALL scores for a strategy using deterministic mathematical formulas.
 *
 * 1. Loads strategy + all pillars
 * 2. Parses pillar content via Zod
 * 3. Computes coherence (5), risk (4), BMF (4), invest (5) components
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

  // --- Phase 1: Load parent pillars for parent-child coherence ---
  let parentPillarMap: Record<string, unknown> | undefined;
  if (strategy.parentId) {
    try {
      const parent = await db.strategy.findUnique({
        where: { id: strategy.parentId },
        include: { pillars: true },
      });
      if (parent) {
        parentPillarMap = {};
        for (const p of parent.pillars) {
          const { data } = parsePillarContent(p.type, p.content);
          parentPillarMap[p.type] = data;
        }
      }
    } catch {
      // Parent not found or error — continue without parent context
    }
  }

  // --- 6.1.1  Coherence Score (always calculable) ---
  const coherenceBreakdown = getCoherenceBreakdown(
    strategy.pillars,
    strategy.interviewData as Record<string, unknown> | undefined,
    pillarMap,
    parentPillarMap,
  );

  // --- 6.1.2  Risk Score (only if R pillar is complete) ---
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

  // --- 6.1.3  Brand-Market Fit Score (only if T pillar is complete) ---
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

  // --- 6.1.4  Investment Score (only if I pillar is complete) ---
  let investScore: number | null = null;
  let investBreakdown: InvestBreakdown | null = null;
  const iPillar = strategy.pillars.find((p) => p.type === "I");
  if (iPillar?.status === "complete" && iPillar.content) {
    const { data: iData } = parsePillarContent<ImplementationData>(
      "I",
      iPillar.content,
    );
    if (iData) {
      investBreakdown = calculateInvestmentScore(
        iData,
        strategy.annualBudget,
        strategy.targetRevenue,
        strategy.sector,
        strategy.maturityProfile,
      );
      investScore = investBreakdown.total;
    }
  }

  // --- 6.1.5  Persist Strategy.coherenceScore ---
  await db.strategy.update({
    where: { id: strategyId },
    data: { coherenceScore: coherenceBreakdown.total },
  });

  // --- 6.1.6  Persist riskScore inside R pillar content (overwrite AI snapshot) ---
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

  // --- 6.1.7  Persist bmfScore inside T pillar content (overwrite AI snapshot) ---
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

  // --- 6.1.8  Persist investScore inside I pillar content ---
  if (investScore !== null && iPillar) {
    const iContent =
      typeof iPillar.content === "object" && iPillar.content !== null
        ? (iPillar.content as Record<string, unknown>)
        : {};
    const updatedIContent = {
      ...iContent,
      investScore,
      investScoreFormula: investBreakdown
        ? JSON.parse(JSON.stringify(investBreakdown))
        : null,
    };
    await db.pillar.update({
      where: { id: iPillar.id },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: updatedIContent as any,
      },
    });
  }

  // --- 6.1.9  Create ScoreSnapshot for evolution tracking ---
  try {
    await db.scoreSnapshot.create({
      data: {
        strategyId,
        coherenceScore: coherenceBreakdown.total,
        riskScore,
        bmfScore,
        investScore,
        trigger,
      },
    });
  } catch {
    // ScoreSnapshot table might not exist yet (pre-migration) — don't crash
    console.warn("[ScoreEngine] Failed to create ScoreSnapshot — table may not exist yet");
  }

  // Sync scores to BrandVariable registry (fire-and-forget)
  void extractScoreVariables(strategyId, {
    coherenceScore: coherenceBreakdown.total,
    riskScore,
    bmfScore,
    investScore,
  });

  return {
    coherenceScore: coherenceBreakdown.total,
    coherenceBreakdown,
    riskScore,
    riskBreakdown,
    bmfScore,
    bmfBreakdown,
    investScore,
    investBreakdown,
    parentCoherenceScore: coherenceBreakdown.parentChildAlignment ?? null,
  };
}
