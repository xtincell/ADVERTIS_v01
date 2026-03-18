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
  /** ARTEMIS global score (0-100) — composite of all frameworks */
  artemisScore?: number | null;
  /** Score per ARTEMIS layer */
  artemisLayerScores?: Record<string, number> | null;
  /** Quality gate results */
  qualityGates?: Array<{ gateId: string; name: string; passed: boolean; score: number; details: string[]; blockers: string[] }> | null;
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

  // --- 6.1.9b  Auto-populate S pillar (Synthèse) from aggregated data ---
  // When ≥5 pillars are complete and S pillar is empty, auto-fill with summary data
  // so the radar chart shows S data
  try {
    const completePillars = strategy.pillars.filter((p) => p.status === "complete");
    const sPillar = strategy.pillars.find((p) => p.type === "S");
    // P1-19: Safe null checks — sPillar.content may be null, string, or object
    const sPillarEmpty = !sPillar || !sPillar.content ||
      (typeof sPillar.content === "object" && sPillar.content !== null &&
        !(sPillar.content as Record<string, unknown>)?.syntheseExecutive);

    if (completePillars.length >= 5 && sPillarEmpty) {
      // Build summary data from available pillars
      const coherencePiliers = completePillars.map((p) => ({
        pilier: p.type,
        contribution: p.summary ?? "",
        articulation: p.status,
      }));

      // P1-19: Safe extraction from I pillar content — guard all nested accesses
      const iContent = pillarMap["I"] as Record<string, unknown> | undefined;
      const annualCalendar = Array.isArray(iContent?.annualCalendar) ? iContent.annualCalendar : [];
      const totalCampaigns = annualCalendar.length;
      const budgetTotal = typeof iContent?.enveloppeGlobale === "string" ? iContent.enveloppeGlobale : "";

      // Build KPI dashboard from available scores
      const kpiDashboard = [
        { pilier: "Global", kpi: "Cohérence", cible: "80+", statut: coherenceBreakdown.total >= 80 ? "Atteint" : "En cours" },
        ...(riskScore != null ? [{ pilier: "R", kpi: "Score Risque", cible: "<40", statut: riskScore < 40 ? "Atteint" : "À surveiller" }] : []),
        ...(bmfScore != null ? [{ pilier: "T", kpi: "Brand-Market Fit", cible: "70+", statut: bmfScore >= 70 ? "Atteint" : "En cours" }] : []),
        ...(investScore != null ? [{ pilier: "I", kpi: "Score Investissement", cible: "60+", statut: investScore >= 60 ? "Atteint" : "En cours" }] : []),
      ];

      // Build strategic axes from ADVE pillar summaries
      const axesStrategiques = ["A", "D", "V", "E"]
        .map((type) => {
          const pillar = strategy.pillars.find((p) => p.type === type);
          return pillar?.summary
            ? { axe: type, description: pillar.summary, piliersLies: [type], kpisCles: [] as string[] }
            : null;
        })
        .filter((a): a is NonNullable<typeof a> => a !== null);

      const synthContent = {
        syntheseExecutive: `Stratégie ${strategy.pillars.filter((p) => p.status === "complete").length}/8 piliers complétés. Score de cohérence : ${Math.round(coherenceBreakdown.total)}/100.`,
        visionStrategique: "",
        coherencePiliers: coherencePiliers,
        facteursClesSucces: [] as string[],
        recommandationsPrioritaires: [] as Array<{ action: string; priorite: number; impact: string; delai: string }>,
        scoreCoherence: coherenceBreakdown.total,
        axesStrategiques,
        sprint90Recap: { actions: [] as Array<{ action: string; owner: string; kpi: string; status: string }>, summary: "" },
        campaignsSummary: { totalCampaigns, highlights: [] as string[], budgetTotal },
        activationSummary: "",
        kpiDashboard,
      };

      if (sPillar) {
        await db.pillar.update({
          where: { id: sPillar.id },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: { content: synthContent as any, status: "complete" },
        });
      } else {
        await db.pillar.create({
          data: {
            strategyId,
            type: "S",
            title: "Synthèse Stratégique",
            order: 8,
            status: "complete",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content: synthContent as any,
            summary: `${completePillars.length}/8 piliers complétés`,
          },
        });
      }
    }
  } catch (error) {
    console.warn("[ScoreEngine] Failed to auto-populate S pillar:", error);
  }

  // --- 6.1.10  ARTEMIS Score (quality gates + layer scores) ---
  let artemisScore: number | null = null;
  let artemisLayerScores: Record<string, number> | null = null;
  let qualityGates: AllScores["qualityGates"] = null;

  try {
    const { evaluateQualityGates } = await import("./quality-gates");
    const gates = await evaluateQualityGates(strategyId);
    qualityGates = gates;

    // ARTEMIS score = weighted average of all gate scores
    if (gates.length > 0) {
      const totalGateScore = gates.reduce((sum, g) => sum + g.score, 0);
      artemisScore = Math.round(totalGateScore / gates.length);
    }

    // Layer scores: % of fresh outputs per layer
    const { getAllFrameworks } = await import("~/lib/framework-registry");
    const allFw = getAllFrameworks();
    const fwOutputs = await db.frameworkOutput.findMany({
      where: { strategyId },
      select: { frameworkId: true, isStale: true },
    });
    const outputLookup = new Map(fwOutputs.map((o) => [o.frameworkId, o]));

    const layerGroups = new Map<string, { total: number; fresh: number }>();
    for (const fw of allFw) {
      if (!fw.hasImplementation) continue;
      const entry = layerGroups.get(fw.layer) ?? { total: 0, fresh: 0 };
      entry.total++;
      const output = outputLookup.get(fw.id);
      if (output && !output.isStale) entry.fresh++;
      layerGroups.set(fw.layer, entry);
    }

    artemisLayerScores = {};
    for (const [layer, counts] of layerGroups) {
      artemisLayerScores[layer] = counts.total > 0
        ? Math.round((counts.fresh / counts.total) * 100)
        : 0;
    }
  } catch {
    // Quality gates or framework registry not available — skip ARTEMIS scores
  }

  // P2-02: Clamp all scores to 0-100 before returning
  const clampScore = (s: number | null): number | null =>
    s !== null ? Math.min(100, Math.max(0, Math.round(s))) : null;

  return {
    coherenceScore: clampScore(coherenceBreakdown.total) ?? 0,
    coherenceBreakdown,
    riskScore: clampScore(riskScore),
    riskBreakdown,
    bmfScore: clampScore(bmfScore),
    bmfBreakdown,
    investScore: clampScore(investScore),
    investBreakdown,
    parentCoherenceScore: clampScore(coherenceBreakdown.parentChildAlignment ?? null),
    artemisScore: clampScore(artemisScore),
    artemisLayerScores,
    qualityGates,
  };
}
