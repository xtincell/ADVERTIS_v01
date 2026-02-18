import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  calculateCoherenceScore,
  getCoherenceBreakdown,
} from "~/server/services/coherence-calculator";
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
   * Recalculate the coherence score for a single strategy and persist it.
   */
  recalculateCoherence: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        include: {
          pillars: {
            select: {
              type: true,
              status: true,
              content: true,
            },
          },
        },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      const breakdown = getCoherenceBreakdown(
        strategy.pillars,
        strategy.interviewData as Record<string, unknown> | undefined,
      );

      await ctx.db.strategy.update({
        where: { id: input.strategyId },
        data: { coherenceScore: breakdown.total },
      });

      return {
        score: breakdown.total,
        breakdown,
      };
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
      pillars: Array<{ type: string; status: string; content: unknown }>;
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
        })),
        pillarCompletionCount: completedPillars,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      });
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
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
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
});
