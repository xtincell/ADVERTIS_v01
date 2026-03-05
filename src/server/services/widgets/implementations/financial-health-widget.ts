// =============================================================================
// MODULE 14W8 — Financial Health Widget
// =============================================================================
// Consumes FW-21 (Value Capture Engine) framework output + FinancialSnapshot
// data to produce a financial health dashboard with revenue model summary,
// scenario comparison, runway, and LTV:CAC ratio.
//
// Category: financial  |  minimumPhase: cockpit  |  size: large
// Required pillars: V
//
// Dependencies:
//   zod                              — FinancialHealthOutputSchema
//   ../registry                      — registerWidget
//   ~/lib/types/cockpit-widgets      — WidgetHandler, WidgetInput, WidgetResult
//   ~/server/db                      — FrameworkOutput, FinancialSnapshot lookup
//
// Called by:
//   widgets/index.ts or auto-registration import
//   tRPC cockpit router (widget compute)
// =============================================================================

import { z } from "zod";
import { registerWidget } from "../registry";
import type {
  WidgetHandler,
  WidgetInput,
  WidgetResult,
} from "~/lib/types/cockpit-widgets";
import { db } from "~/server/db";

// ---------------------------------------------------------------------------
// Output Schema
// ---------------------------------------------------------------------------

const ScenarioSummarySchema = z.object({
  type: z.string(),
  totalYear1: z.number(),
  totalYear3: z.number(),
  ltvCacRatio: z.number().nullable(),
});

const FinancialHealthOutputSchema = z.object({
  /** Overall financial health score 0-100 */
  healthScore: z.number(),
  /** Revenue model type */
  revenueModelType: z.string().nullable(),
  /** Number of revenue streams */
  streamCount: z.number(),
  /** Revenue diversification score 0-100 */
  diversificationScore: z.number().nullable(),
  /** Revenue scenario summaries */
  scenarios: z.array(ScenarioSummarySchema),
  /** Latest financial snapshot */
  latestSnapshot: z.object({
    burnRate: z.number().nullable(),
    runway: z.number().nullable(),
    ltvCacRatio: z.number().nullable(),
    budgetUtilization: z.number().nullable(),
    projectedRoi12: z.number().nullable(),
    snapshotDate: z.string().nullable(),
  }).nullable(),
  /** Community monetization count */
  communityMonetizationCount: z.number(),
  /** Insights */
  insights: z.array(z.string()),
  /** Whether FW-21 data is available */
  hasFrameworkData: z.boolean(),
});

// ---------------------------------------------------------------------------
// Widget Descriptor
// ---------------------------------------------------------------------------

const descriptor = {
  id: "financial_health",
  name: "Santé Financière",
  description:
    "Score de santé financière, modèle de revenus, scénarios de croissance et métriques clés (runway, LTV/CAC, burn rate)",
  icon: "DollarSign",
  category: "financial" as const,
  requiredPillars: ["V"],
  minimumPhase: "cockpit",
  outputSchema: FinancialHealthOutputSchema,
  size: "large" as const,
};

// ---------------------------------------------------------------------------
// Compute Logic
// ---------------------------------------------------------------------------

async function compute(input: WidgetInput): Promise<WidgetResult> {
  try {
    // Load FW-21 output
    const fw21Output = await db.frameworkOutput.findFirst({
      where: { strategyId: input.strategyId, frameworkId: "FW-21", isStale: false },
      select: { data: true },
    });

    // Load latest financial snapshot
    const latestSnap = await db.financialSnapshot.findFirst({
      where: { strategyId: input.strategyId },
      orderBy: { snapshotDate: "desc" },
    });

    const fw21Data = fw21Output?.data as Record<string, unknown> | null;
    const hasFrameworkData = !!fw21Data;

    // Extract FW-21 data
    const revenueModel = fw21Data?.revenueModel as Record<string, unknown> | null;
    const scenarios = (fw21Data?.revenueScenarios ?? []) as Array<Record<string, unknown>>;
    const communityMon = (fw21Data?.communityMonetization ?? []) as Array<Record<string, unknown>>;
    const streams = (revenueModel?.streams ?? []) as Array<Record<string, unknown>>;

    // Build scenario summaries
    const scenarioSummaries = scenarios.map((s) => ({
      type: String(s.type ?? "UNKNOWN"),
      totalYear1: Number(s.totalYear1 ?? 0),
      totalYear3: Number(s.totalYear3 ?? 0),
      ltvCacRatio: s.ltvCacRatio != null ? Number(s.ltvCacRatio) : null,
    }));

    // Calculate health score
    let healthScore = 50; // Base
    if (hasFrameworkData) {
      healthScore += 15; // Has revenue model
      if (streams.length >= 3) healthScore += 10;
      if (scenarioSummaries.length === 3) healthScore += 5;
    }
    if (latestSnap) {
      if (latestSnap.ltvCacRatio && latestSnap.ltvCacRatio >= 3) healthScore += 10;
      if (latestSnap.runway && latestSnap.runway >= 12) healthScore += 10;
      healthScore = Math.min(100, healthScore);
    }

    // Latest snapshot
    const snapshotData = latestSnap
      ? {
          burnRate: latestSnap.burnRate,
          runway: latestSnap.runway,
          ltvCacRatio: latestSnap.ltvCacRatio,
          budgetUtilization:
            latestSnap.budgetUsed != null && latestSnap.budgetTotal
              ? Math.round((latestSnap.budgetUsed / latestSnap.budgetTotal) * 100)
              : null,
          projectedRoi12: latestSnap.projectedRoi12,
          snapshotDate: latestSnap.snapshotDate.toISOString(),
        }
      : null;

    // Insights
    const insights: string[] = [];
    if (!hasFrameworkData) {
      insights.push("Données FW-21 non disponibles — exécuter le Value Capture Engine");
    }
    if (streams.length < 3) {
      insights.push("Moins de 3 sources de revenus — risque de concentration");
    }
    if (latestSnap?.ltvCacRatio && latestSnap.ltvCacRatio < 3) {
      insights.push(
        `Ratio LTV/CAC (${latestSnap.ltvCacRatio.toFixed(1)}) inférieur au seuil de viabilité (3.0)`,
      );
    }
    if (latestSnap?.runway && latestSnap.runway < 6) {
      insights.push(
        `Runway critique : ${latestSnap.runway.toFixed(0)} mois restants — sécuriser le financement`,
      );
    }
    if (communityMon.length > 0) {
      insights.push(
        `${communityMon.length} mécanisme(s) de monétisation communautaire identifié(s)`,
      );
    }

    return {
      success: true,
      data: {
        healthScore,
        revenueModelType: revenueModel
          ? String(revenueModel.primaryModel ?? null)
          : null,
        streamCount: streams.length,
        diversificationScore: revenueModel?.diversificationScore
          ? Number(revenueModel.diversificationScore)
          : null,
        scenarios: scenarioSummaries,
        latestSnapshot: snapshotData,
        communityMonetizationCount: communityMon.length,
        insights,
        hasFrameworkData,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

const handler: WidgetHandler = { descriptor, compute };
registerWidget(handler);
export default handler;
