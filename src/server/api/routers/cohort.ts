// =============================================================================
// ROUTER T.31 — Cohort Analysis (Retention & LTV)
// Cohort-based retention curves and LTV tracking.
// =============================================================================

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, roleProtectedProcedure } from "~/server/api/trpc";

export const cohortRouter = createTRPCRouter({
  // ── List cohort snapshots for a strategy ─────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        periodType: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.cohortSnapshot.findMany({
        where: {
          strategyId: input.strategyId,
          ...(input.periodType ? { periodType: input.periodType } : {}),
        },
        orderBy: { cohortPeriod: "desc" },
        take: input.limit,
      });
    }),

  // ── Get retention grid (matrix view) ─────────────────────────────────────
  getRetentionGrid: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        periodType: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"]).default("MONTHLY"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cohorts = await ctx.db.cohortSnapshot.findMany({
        where: {
          strategyId: input.strategyId,
          periodType: input.periodType,
        },
        orderBy: { cohortPeriod: "asc" },
      });

      // Build retention grid
      const grid = cohorts.map((cohort) => {
        const rawCurve = cohort.retentionCurve;
        const retentionCurve = Array.isArray(rawCurve)
          ? rawCurve.filter((v): v is number => typeof v === "number")
          : [];
        return {
          cohortPeriod: cohort.cohortPeriod,
          acquired: cohort.acquired,
          avgLtv: cohort.avgLtv,
          churnRate: cohort.churnRate,
          retentionCurve,
        };
      });

      // Compute averages across cohorts
      const lengths = grid.map((g) => g.retentionCurve.length);
      const maxOffset = lengths.length > 0 ? Math.max(...lengths, 0) : 0;
      const avgRetention: number[] = [];
      for (let i = 0; i < maxOffset; i++) {
        const vals = grid
          .map((g) => g.retentionCurve[i])
          .filter((v): v is number => v != null);
        avgRetention.push(
          vals.length > 0
            ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
            : 0,
        );
      }

      return {
        periodType: input.periodType,
        cohorts: grid,
        avgRetention,
        totalCohorts: grid.length,
      };
    }),

  // ── Get LTV evolution ────────────────────────────────────────────────────
  getLtvEvolution: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        periodType: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"]).default("MONTHLY"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cohorts = await ctx.db.cohortSnapshot.findMany({
        where: {
          strategyId: input.strategyId,
          periodType: input.periodType,
        },
        orderBy: { cohortPeriod: "asc" },
        select: {
          cohortPeriod: true,
          avgLtv: true,
          totalRevenue: true,
          acquired: true,
          churnRate: true,
          avgEngagement: true,
        },
      });

      return cohorts;
    }),

  // ── Create / update a cohort snapshot ─────────────────────────────────────
  upsert: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(
      z.object({
        strategyId: z.string(),
        cohortPeriod: z.string(),
        periodType: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"]).default("MONTHLY"),
        acquired: z.number().int().min(0),
        retentionCurve: z.array(z.number()).optional(),
        avgLtv: z.number().min(0).optional(),
        totalRevenue: z.number().min(0).optional(),
        avgEngagement: z.number().min(0).max(100).optional(),
        churnCount: z.number().int().min(0).optional(),
        churnRate: z.number().min(0).max(1).optional(),
        source: z.string().optional(),
        segmentBreakdown: z.record(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cohortSnapshot.upsert({
        where: {
          strategyId_cohortPeriod_periodType: {
            strategyId: input.strategyId,
            cohortPeriod: input.cohortPeriod,
            periodType: input.periodType,
          },
        },
        create: {
          strategyId: input.strategyId,
          cohortPeriod: input.cohortPeriod,
          periodType: input.periodType,
          acquired: input.acquired,
          retentionCurve: input.retentionCurve ?? undefined,
          avgLtv: input.avgLtv ?? 0,
          totalRevenue: input.totalRevenue ?? 0,
          avgEngagement: input.avgEngagement ?? 0,
          churnCount: input.churnCount ?? 0,
          churnRate: input.churnRate ?? 0,
          source: input.source,
          segmentBreakdown: input.segmentBreakdown ?? undefined,
        },
        update: {
          acquired: input.acquired,
          retentionCurve: input.retentionCurve ?? undefined,
          avgLtv: input.avgLtv,
          totalRevenue: input.totalRevenue,
          avgEngagement: input.avgEngagement,
          churnCount: input.churnCount,
          churnRate: input.churnRate,
          source: input.source,
          segmentBreakdown: input.segmentBreakdown ?? undefined,
        },
      });
    }),
});
