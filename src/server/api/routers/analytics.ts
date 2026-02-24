// =============================================================================
// ROUTER T.15 — Analytics Router
// =============================================================================
// Dashboard analytics and stats. Coherence, risk, BMF scores, agency overview.
//
// Procedures:
//   getDashboardStats      — Aggregate dashboard statistics for current user
//   recalculateScores      — Recalculate ALL scores (coherence, risk, BMF) and persist
//   recalculateCoherence   — Backward-compatible alias (returns only coherence)
//   getScoreHistory        — Get score evolution history (ScoreSnapshot records)
//   getAgencyOverview      — Agency-level KPIs, distributions, alerts, per-brand data
//   getBreakdowns          — Read-only score breakdowns for cockpit tooltips
//
// Dependencies:
//   ~/server/api/trpc                      — createTRPCRouter, protectedProcedure
//   ~/server/services/coherence-calculator — calculateCoherenceScore, getCoherenceBreakdown
//   ~/server/services/score-engine         — recalculateAllScores
//   ~/server/services/risk-calculator      — calculateRiskScore
//   ~/server/services/bmf-calculator       — calculateBrandMarketFit
//   ~/lib/types/pillar-parsers             — parsePillarContent
//   ~/lib/types/pillar-schemas             — RiskAuditResult, TrackAuditResult, etc.
//   ~/lib/constants                        — SECTORS, PHASE_CONFIG
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  calculateCoherenceScore,
  getCoherenceBreakdown,
} from "~/server/services/coherence-calculator";
import { recalculateAllScores } from "~/server/services/score-engine";
import { calculateRiskScore } from "~/server/services/risk-calculator";
import { calculateBrandMarketFit } from "~/server/services/bmf-calculator";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type {
  RiskAuditResult,
  TrackAuditResult,
  SynthesePillarData,
  ValeurPillarData,
} from "~/lib/types/pillar-schemas";
import { SECTORS, PHASE_CONFIG } from "~/lib/constants";
import type { Phase } from "~/lib/constants";

export const analyticsRouter = createTRPCRouter({
  /**
   * Aggregate dashboard statistics for the current user.
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const strategies = await ctx.db.strategy.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        pillars: {
          select: {
            id: true,
            type: true,
            status: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalStrategies = strategies.length;

    const completedStrategies = strategies.filter(
      (s) => s.status === "complete",
    ).length;

    const inProgressStrategies = strategies.filter(
      (s) => s.status === "draft" || s.status === "generating",
    ).length;

    // Total pillars with status "complete" across all strategies
    const totalPillarsGenerated = strategies.reduce(
      (count, s) =>
        count + s.pillars.filter((p) => p.status === "complete").length,
      0,
    );

    // Average coherence score (use stored value when available, else compute)
    const scores: number[] = [];
    for (const strategy of strategies) {
      if (strategy.coherenceScore != null) {
        scores.push(strategy.coherenceScore);
      } else if (strategy.pillars.length > 0) {
        const computed = calculateCoherenceScore(
          strategy.pillars,
          strategy.interviewData as Record<string, unknown> | undefined,
        );
        scores.push(computed);
      }
    }
    const avgCoherence =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    return {
      totalStrategies,
      completedStrategies,
      inProgressStrategies,
      totalPillarsGenerated,
      avgCoherence,
      strategies: strategies.map((s) => ({
        id: s.id,
        name: s.name,
        brandName: s.brandName,
        status: s.status,
        coherenceScore: s.coherenceScore,
        createdAt: s.createdAt,
        pillars: s.pillars.map((p) => ({
          type: p.type,
          status: p.status,
          content: p.content,
        })),
      })),
    };
  }),

  /**
   * Recalculate ALL scores for a strategy (coherence, risk, BMF) and persist them.
   * Returns full breakdowns for all 3 scores.
   */
  recalculateScores: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        select: { userId: true },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      const scores = await recalculateAllScores(input.strategyId, "manual");
      return scores;
    }),

  /**
   * Backward-compatible alias for recalculateScores (returns only coherence).
   */
  recalculateCoherence: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        select: { userId: true },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      const scores = await recalculateAllScores(input.strategyId, "manual");
      return {
        score: scores.coherenceScore,
        breakdown: scores.coherenceBreakdown,
      };
    }),

  /**
   * Get score evolution history for a strategy.
   */
  getScoreHistory: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        limit: z.number().int().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        select: { userId: true },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      const snapshots = await ctx.db.scoreSnapshot.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return snapshots;
    }),

  /**
   * Agency-level overview: KPIs, distributions, health alerts, and per-brand data.
   * Powers the redesigned agency dashboard.
   */
  getAgencyOverview: protectedProcedure.query(async ({ ctx }) => {
    const strategies = await ctx.db.strategy.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        pillars: {
          select: {
            id: true,
            type: true,
            status: true,
            content: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // ---------------------------------------------------------------
    // Helper maps
    // ---------------------------------------------------------------
    const sectorLabelMap = new Map<string, string>(
      SECTORS.map((s) => [s.value, s.label]),
    );
    const phaseLabelMap = new Map(
      (Object.entries(PHASE_CONFIG) as [Phase, (typeof PHASE_CONFIG)[Phase]][]).map(
        ([key, cfg]) => [key, cfg.title],
      ),
    );
    const phaseOrderMap = new Map(
      (Object.entries(PHASE_CONFIG) as [Phase, (typeof PHASE_CONFIG)[Phase]][]).map(
        ([key, cfg]) => [key, cfg.order],
      ),
    );

    // ---------------------------------------------------------------
    // Per-brand extraction
    // ---------------------------------------------------------------
    type BrandData = {
      id: string;
      name: string;
      brandName: string;
      sector: string | null;
      sectorLabel: string;
      phase: string;
      phaseLabel: string;
      phaseOrder: number;
      status: string;
      coherenceScore: number | null;
      riskScore: number | null;
      brandMarketFitScore: number | null;
      unitEconomics: {
        cac: string;
        ltv: string;
        ratio: string;
        pointMort: string;
        marges: string;
      } | null;
      pillars: Array<{ type: string; status: string; content: unknown; updatedAt: Date }>;
      pillarCompletionCount: number;
      createdAt: Date;
      updatedAt: Date;
    };

    const brands: BrandData[] = [];
    const coherenceScores: number[] = [];
    const riskScores: number[] = [];
    const bmfScores: number[] = [];
    let totalPillarsGenerated = 0;

    // Distribution accumulators
    const sectorCounts = new Map<string, number>();
    const phaseCounts = new Map<string, number>();
    const statusCounts = new Map<string, number>();

    // Alerts
    type AlertEntry = {
      strategyId: string;
      brandName: string;
      reason: "low_coherence" | "high_risk" | "stalled" | "error_pillars";
      detail: string;
    };
    const alerts: AlertEntry[] = [];

    const now = Date.now();
    const STALE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

    for (const s of strategies) {
      try {
        // --- Score extraction per pillar ---
        let riskScore: number | null = null;
        let bmfScore: number | null = null;
        let synthCoherence: number | null = null;
        let unitEcon: BrandData["unitEconomics"] = null;

        const pillarR = s.pillars.find((p) => p.type === "R");
        if (pillarR?.status === "complete" && pillarR.content) {
          const parsed = parsePillarContent<RiskAuditResult>("R", pillarR.content);
          if (parsed.success) riskScore = parsed.data.riskScore;
        }

        const pillarT = s.pillars.find((p) => p.type === "T");
        if (pillarT?.status === "complete" && pillarT.content) {
          const parsed = parsePillarContent<TrackAuditResult>("T", pillarT.content);
          if (parsed.success) bmfScore = parsed.data.brandMarketFitScore;
        }

        const pillarS = s.pillars.find((p) => p.type === "S");
        if (pillarS?.status === "complete" && pillarS.content) {
          const parsed = parsePillarContent<SynthesePillarData>("S", pillarS.content);
          if (parsed.success) synthCoherence = parsed.data.scoreCoherence;
        }

        const pillarV = s.pillars.find((p) => p.type === "V");
        if (pillarV?.status === "complete" && pillarV.content) {
          const parsed = parsePillarContent<ValeurPillarData>("V", pillarV.content);
          if (parsed.success) {
            const ue = parsed.data.unitEconomics;
            if (ue && (ue.cac || ue.ltv || ue.ratio)) {
              unitEcon = {
                cac: ue.cac,
                ltv: ue.ltv,
                ratio: ue.ratio,
                pointMort: ue.pointMort,
                marges: ue.marges,
              };
            }
          }
        }

        // Best coherence: use stored (Strategy.coherenceScore) or synthèse-derived
        const coherence = s.coherenceScore ?? synthCoherence;

        const completedPillars = s.pillars.filter(
          (p) => p.status === "complete",
        ).length;
        totalPillarsGenerated += completedPillars;

        // Accumulate averages
        if (coherence != null) coherenceScores.push(coherence);
        if (riskScore != null) riskScores.push(riskScore);
        if (bmfScore != null) bmfScores.push(bmfScore);

        // Distributions
        const sectorKey = s.sector ?? "other";
        sectorCounts.set(sectorKey, (sectorCounts.get(sectorKey) ?? 0) + 1);
        phaseCounts.set(s.phase, (phaseCounts.get(s.phase) ?? 0) + 1);
        statusCounts.set(s.status, (statusCounts.get(s.status) ?? 0) + 1);

        // Alerts
        if (coherence != null && coherence < 40) {
          alerts.push({
            strategyId: s.id,
            brandName: s.brandName,
            reason: "low_coherence",
            detail: `Score de cohérence faible : ${coherence}/100`,
          });
        }
        if (riskScore != null && riskScore > 70) {
          alerts.push({
            strategyId: s.id,
            brandName: s.brandName,
            reason: "high_risk",
            detail: `Score de risque élevé : ${riskScore}/100`,
          });
        }
        if (
          s.status !== "complete" &&
          s.status !== "archived" &&
          now - s.updatedAt.getTime() > STALE_MS
        ) {
          alerts.push({
            strategyId: s.id,
            brandName: s.brandName,
            reason: "stalled",
            detail: `Aucune mise à jour depuis plus de 14 jours`,
          });
        }
        if (s.pillars.some((p) => p.status === "error")) {
          alerts.push({
            strategyId: s.id,
            brandName: s.brandName,
            reason: "error_pillars",
            detail: `${s.pillars.filter((p) => p.status === "error").length} pilier(s) en erreur`,
          });
        }

        brands.push({
          id: s.id,
          name: s.name,
          brandName: s.brandName,
          sector: s.sector,
          sectorLabel: sectorLabelMap.get(s.sector ?? "other") ?? "Autre",
          phase: s.phase,
          phaseLabel: phaseLabelMap.get(s.phase as Phase) ?? s.phase,
          phaseOrder: phaseOrderMap.get(s.phase as Phase) ?? 99,
          status: s.status,
          coherenceScore: coherence,
          riskScore,
          brandMarketFitScore: bmfScore,
          unitEconomics: unitEcon,
          pillars: s.pillars.map((p) => ({
            type: p.type,
            status: p.status,
            content: p.content,
            updatedAt: p.updatedAt,
          })),
          pillarCompletionCount: completedPillars,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        });
      } catch (err) {
        console.error(`[getAgencyOverview] Error processing strategy ${s.id}:`, err);
        // Skip this strategy but continue with others
        continue;
      }
    }

    // ---------------------------------------------------------------
    // Aggregates
    // ---------------------------------------------------------------
    const avg = (arr: number[]) =>
      arr.length > 0
        ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
        : 0;

    const totalBrands = strategies.length;
    const completionRate =
      totalBrands > 0
        ? Math.round(
            (strategies.filter((s) => s.status === "complete").length /
              totalBrands) *
              100,
          )
        : 0;

    // ---------------------------------------------------------------
    // Distributions as sorted arrays
    // ---------------------------------------------------------------
    const bySector = Array.from(sectorCounts.entries())
      .map(([sector, count]) => ({
        sector,
        label: sectorLabelMap.get(sector) ?? sector,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const byPhase = Array.from(phaseCounts.entries())
      .map(([phase, count]) => ({
        phase,
        label: phaseLabelMap.get(phase as Phase) ?? phase,
        count,
        order: phaseOrderMap.get(phase as Phase) ?? 99,
      }))
      .sort((a, b) => a.order - b.order);

    const statusLabelMap: Record<string, string> = {
      draft: "Brouillon",
      generating: "Génération",
      complete: "Terminée",
      archived: "Archivée",
    };
    const byStatus = Array.from(statusCounts.entries())
      .map(([status, count]) => ({
        status,
        label: statusLabelMap[status] ?? status,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // ---------------------------------------------------------------
    // Recent activity (last 10 updated strategies with context)
    // ---------------------------------------------------------------
    const recentActivity = strategies.slice(0, 10).map((s) => {
      // Determine latest pillar activity
      const latestPillar = s.pillars
        .filter((p) => p.updatedAt)
        .sort(
          (a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0),
        )[0];

      let action = "Mise à jour";
      if (s.status === "complete") action = "Fiche terminée";
      else if (
        latestPillar?.status === "complete"
      )
        action = `Pilier ${latestPillar.type} complété`;
      else if (
        latestPillar?.status === "generating"
      )
        action = `Pilier ${latestPillar.type} en génération`;
      else if (
        latestPillar?.status === "error"
      )
        action = `Erreur pilier ${latestPillar.type}`;

      return {
        strategyId: s.id,
        brandName: s.brandName,
        action,
        updatedAt: s.updatedAt,
      };
    });

    return {
      totalBrands,
      avgCoherence: avg(coherenceScores),
      avgRisk: avg(riskScores),
      avgBrandMarketFit: avg(bmfScores),
      completionRate,
      totalPillarsGenerated,
      bySector,
      byPhase,
      byStatus,
      alerts,
      brands,
      recentActivity,
    };
  }),

  /**
   * Sector-level benchmarks: for each sector, compute avg/median/p25/p75 for coherence, risk, BMF.
   * Optionally, for a given strategy, compute its percentile within its sector.
   */
  getSectorBenchmarks: protectedProcedure
    .input(
      z
        .object({
          strategyId: z.string().optional(), // optional: compute percentile for this strategy
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const strategies = await ctx.db.strategy.findMany({
        where: { userId: ctx.session.user.id },
        select: {
          id: true,
          brandName: true,
          sector: true,
          coherenceScore: true,
          pillars: {
            where: { type: { in: ["R", "T"] }, status: "complete" },
            select: { type: true, content: true },
          },
        },
      });

      // Build per-sector score arrays
      type SectorScores = {
        coherence: number[];
        risk: number[];
        bmf: number[];
      };
      const sectorMap = new Map<string, SectorScores>();

      // Per-strategy scores for percentile lookups
      const strategyScores = new Map<
        string,
        { sector: string; coherence: number | null; risk: number | null; bmf: number | null }
      >();

      for (const s of strategies) {
        const sector = s.sector ?? "other";
        if (!sectorMap.has(sector)) {
          sectorMap.set(sector, { coherence: [], risk: [], bmf: [] });
        }
        const acc = sectorMap.get(sector)!;

        const coherence = s.coherenceScore;
        let risk: number | null = null;
        let bmf: number | null = null;

        const rPillar = s.pillars.find((p) => p.type === "R");
        if (rPillar?.content) {
          const parsed = parsePillarContent<RiskAuditResult>("R", rPillar.content);
          if (parsed.success) risk = parsed.data.riskScore;
        }

        const tPillar = s.pillars.find((p) => p.type === "T");
        if (tPillar?.content) {
          const parsed = parsePillarContent<TrackAuditResult>("T", tPillar.content);
          if (parsed.success) bmf = parsed.data.brandMarketFitScore;
        }

        if (coherence != null) acc.coherence.push(coherence);
        if (risk != null) acc.risk.push(risk);
        if (bmf != null) acc.bmf.push(bmf);

        strategyScores.set(s.id, { sector, coherence, risk, bmf });
      }

      // Helper functions
      const median = (arr: number[]) => {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
          ? sorted[mid]!
          : Math.round(((sorted[mid - 1]! + sorted[mid]!) / 2));
      };
      const percentile = (arr: number[], p: number) => {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const idx = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[Math.max(0, idx)]!;
      };
      const avg = (arr: number[]) =>
        arr.length > 0
          ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
          : 0;
      const computePercentileRank = (arr: number[], value: number) => {
        if (arr.length === 0) return 0;
        const below = arr.filter((v) => v < value).length;
        return Math.round((below / arr.length) * 100);
      };

      const sectorLabelMap = new Map<string, string>(
        SECTORS.map((s) => [s.value, s.label]),
      );

      // Build sector benchmarks
      const sectors = Array.from(sectorMap.entries()).map(([sector, scores]) => ({
        sector,
        label: sectorLabelMap.get(sector) ?? sector,
        count: strategies.filter((s) => (s.sector ?? "other") === sector).length,
        coherence: {
          avg: avg(scores.coherence),
          median: median(scores.coherence),
          p25: percentile(scores.coherence, 25),
          p75: percentile(scores.coherence, 75),
        },
        risk: {
          avg: avg(scores.risk),
          median: median(scores.risk),
          p25: percentile(scores.risk, 25),
          p75: percentile(scores.risk, 75),
        },
        bmf: {
          avg: avg(scores.bmf),
          median: median(scores.bmf),
          p25: percentile(scores.bmf, 25),
          p75: percentile(scores.bmf, 75),
        },
      }));

      // If a specific strategy is requested, compute its percentile within sector
      let strategyPercentile: {
        strategyId: string;
        sector: string;
        coherencePercentile: number;
        riskPercentile: number;
        bmfPercentile: number;
      } | null = null;

      if (input?.strategyId) {
        const entry = strategyScores.get(input.strategyId);
        if (entry) {
          const sectorScores = sectorMap.get(entry.sector);
          if (sectorScores) {
            strategyPercentile = {
              strategyId: input.strategyId,
              sector: entry.sector,
              coherencePercentile: entry.coherence != null
                ? computePercentileRank(sectorScores.coherence, entry.coherence)
                : 0,
              riskPercentile: entry.risk != null
                ? computePercentileRank(sectorScores.risk, entry.risk)
                : 0,
              bmfPercentile: entry.bmf != null
                ? computePercentileRank(sectorScores.bmf, entry.bmf)
                : 0,
            };
          }
        }
      }

      return { sectors, strategyPercentile };
    }),

  /**
   * Get score breakdowns for a strategy (read-only, no persistence).
   * Computes coherence, risk, and BMF breakdowns on-the-fly for display in cockpit tooltips.
   */
  getBreakdowns: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        include: { pillars: true },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      // Parse pillar data
      const pillarMap: Record<string, unknown> = {};
      for (const p of strategy.pillars) {
        const { data } = parsePillarContent(p.type, p.content);
        pillarMap[p.type] = data;
      }

      // Load parent pillars for parent-child coherence (if child strategy)
      let parentPillarMap: Record<string, unknown> | undefined;
      if (strategy.parentId) {
        try {
          const parent = await ctx.db.strategy.findUnique({
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
          // Parent not found — continue without parent context
        }
      }

      // 1. Coherence breakdown
      const coherenceBreakdown = getCoherenceBreakdown(
        strategy.pillars,
        strategy.interviewData as Record<string, unknown> | undefined,
        pillarMap,
        parentPillarMap,
      );

      // 2. Risk breakdown (only if R pillar is complete)
      let riskBreakdown = null;
      const rPillar = strategy.pillars.find((p) => p.type === "R");
      if (rPillar?.status === "complete" && rPillar.content) {
        const { data: rData } = parsePillarContent<RiskAuditResult>("R", rPillar.content);
        if (rData) {
          riskBreakdown = calculateRiskScore(rData);
        }
      }

      // 3. BMF breakdown (only if T pillar is complete)
      let bmfBreakdown = null;
      const tPillar = strategy.pillars.find((p) => p.type === "T");
      if (tPillar?.status === "complete" && tPillar.content) {
        const { data: tData } = parsePillarContent<TrackAuditResult>("T", tPillar.content);
        if (tData) {
          bmfBreakdown = calculateBrandMarketFit(tData);
        }
      }

      return {
        coherenceBreakdown,
        riskBreakdown,
        bmfBreakdown,
      };
    }),
});
