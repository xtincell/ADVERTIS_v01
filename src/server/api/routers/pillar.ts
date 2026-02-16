import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const pillarRouter = createTRPCRouter({
  /**
   * Get all pillars for a strategy, ordered by `order`.
   * Verifies the strategy belongs to the current user.
   */
  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
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

      const pillars = await ctx.db.pillar.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { order: "asc" },
      });

      return pillars;
    }),

  /**
   * Get a single pillar by ID with its strategy.
   * Verifies ownership through the strategy.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const pillar = await ctx.db.pillar.findUnique({
        where: { id: input.id },
        include: {
          strategy: true,
        },
      });

      if (!pillar || pillar.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pilier non trouvé",
        });
      }

      return pillar;
    }),

  /**
   * Update pillar fields (content, summary, status).
   * Verifies ownership through the strategy.
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.any().optional(),
        summary: z.string().optional(),
        status: z
          .enum(["pending", "generating", "complete", "error"])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.pillar.findUnique({
        where: { id: input.id },
        include: {
          strategy: { select: { userId: true } },
        },
      });

      if (!existing || existing.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pilier non trouvé",
        });
      }

      const { id, ...data } = input;

      const pillar = await ctx.db.pillar.update({
        where: { id },
        data: {
          ...data,
          generatedAt:
            data.status === "complete" ? new Date() : undefined,
        },
      });

      return pillar;
    }),

  /**
   * Update pillar status with optional error message.
   * Verifies ownership through the strategy.
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "generating", "complete", "error"]),
        errorMessage: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.pillar.findUnique({
        where: { id: input.id },
        include: {
          strategy: { select: { userId: true } },
        },
      });

      if (!existing || existing.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pilier non trouvé",
        });
      }

      const pillar = await ctx.db.pillar.update({
        where: { id: input.id },
        data: {
          status: input.status,
          errorMessage:
            input.status === "error" ? input.errorMessage : null,
          generatedAt:
            input.status === "complete" ? new Date() : undefined,
        },
      });

      return pillar;
    }),
});
