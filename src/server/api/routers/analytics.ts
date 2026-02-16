import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  calculateCoherenceScore,
  getCoherenceBreakdown,
} from "~/server/services/coherence-calculator";

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
});
