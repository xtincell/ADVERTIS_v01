import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getAvailableDataSources } from "~/server/services/market-study/collection-orchestrator";
import { synthesizeMarketStudy } from "~/server/services/market-study/synthesis";
import type { ManualDataStore, ManualDataEntry } from "~/lib/types/market-study";

export const marketStudyRouter = createTRPCRouter({
  /**
   * Get the market study for a strategy. Returns null if none exists.
   */
  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify strategy ownership
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

      const marketStudy = await ctx.db.marketStudy.findUnique({
        where: { strategyId: input.strategyId },
      });

      return marketStudy;
    }),

  /**
   * Create a market study record for a strategy (if not exists).
   */
  create: protectedProcedure
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

      // Check if already exists
      const existing = await ctx.db.marketStudy.findUnique({
        where: { strategyId: input.strategyId },
      });

      if (existing) return existing;

      const marketStudy = await ctx.db.marketStudy.create({
        data: {
          strategyId: input.strategyId,
          status: "pending",
        },
      });

      return marketStudy;
    }),

  /**
   * Get the list of available data sources and their configuration status.
   */
  getDataSources: protectedProcedure.query(() => {
    return getAvailableDataSources();
  }),

  /**
   * Add a manual data entry (internal data, external report, or interview notes).
   */
  addManualData: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        title: z.string().min(1),
        content: z.string().min(1),
        category: z.enum(["internal", "external", "interview"]),
        sourceType: z.string().min(1),
      }),
    )
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

      // Ensure market study exists
      let marketStudy = await ctx.db.marketStudy.findUnique({
        where: { strategyId: input.strategyId },
      });

      if (!marketStudy) {
        marketStudy = await ctx.db.marketStudy.create({
          data: {
            strategyId: input.strategyId,
            status: "pending",
          },
        });
      }

      // Add the entry to manualData
      const currentData = (marketStudy.manualData as ManualDataStore | null) ?? {
        entries: [],
      };

      const newEntry: ManualDataEntry = {
        id: crypto.randomUUID(),
        title: input.title,
        content: input.content,
        category: input.category,
        sourceType: input.sourceType,
        addedAt: new Date().toISOString(),
      };

      currentData.entries.push(newEntry);

      const updated = await ctx.db.marketStudy.update({
        where: { strategyId: input.strategyId },
        data: {
          manualData: JSON.parse(JSON.stringify(currentData)),
        },
      });

      return updated;
    }),

  /**
   * Remove a manual data entry by ID.
   */
  removeManualData: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        entryId: z.string(),
      }),
    )
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

      const marketStudy = await ctx.db.marketStudy.findUnique({
        where: { strategyId: input.strategyId },
      });

      if (!marketStudy) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Étude de marché non trouvée",
        });
      }

      const currentData = (marketStudy.manualData as ManualDataStore | null) ?? {
        entries: [],
      };

      currentData.entries = currentData.entries.filter(
        (e) => e.id !== input.entryId,
      );

      const updated = await ctx.db.marketStudy.update({
        where: { strategyId: input.strategyId },
        data: {
          manualData: JSON.parse(JSON.stringify(currentData)),
        },
      });

      return updated;
    }),

  /**
   * Run AI synthesis on all collected data.
   */
  synthesize: protectedProcedure
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

      const synthesis = await synthesizeMarketStudy(input.strategyId);
      return synthesis;
    }),

  /**
   * Skip the market study phase and advance directly to audit-t.
   */
  skip: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      if (strategy.phase !== "market-study") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `La stratégie doit être en phase "market-study" pour sauter l'étude. Phase actuelle : "${strategy.phase}"`,
        });
      }

      // Mark study as skipped if it exists
      const existingStudy = await ctx.db.marketStudy.findUnique({
        where: { strategyId: input.strategyId },
      });

      if (existingStudy) {
        await ctx.db.marketStudy.update({
          where: { strategyId: input.strategyId },
          data: { status: "skipped" },
        });
      } else {
        await ctx.db.marketStudy.create({
          data: {
            strategyId: input.strategyId,
            status: "skipped",
          },
        });
      }

      // Advance to audit-t
      const updated = await ctx.db.strategy.update({
        where: { id: input.strategyId },
        data: {
          phase: "audit-t",
          status: "generating",
        },
        include: { pillars: { orderBy: { order: "asc" } } },
      });

      return updated;
    }),

  /**
   * Complete the market study standalone (does NOT advance the pipeline phase).
   * Used from the dedicated /strategy/[id]/market-study page.
   */
  completeStandalone: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      // Mark study as complete but don't change pipeline phase
      const marketStudy = await ctx.db.marketStudy.findUnique({
        where: { strategyId: input.strategyId },
      });

      if (!marketStudy) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Étude de marché non trouvée",
        });
      }

      const updated = await ctx.db.marketStudy.update({
        where: { strategyId: input.strategyId },
        data: { status: "complete" },
      });

      return updated;
    }),

  /**
   * Complete the market study and advance to audit-t.
   */
  complete: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      if (strategy.phase !== "market-study") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `La stratégie doit être en phase "market-study" pour valider l'étude. Phase actuelle : "${strategy.phase}"`,
        });
      }

      // Mark study as complete
      await ctx.db.marketStudy.update({
        where: { strategyId: input.strategyId },
        data: { status: "complete" },
      });

      // Advance to audit-t
      const updated = await ctx.db.strategy.update({
        where: { id: input.strategyId },
        data: {
          phase: "audit-t",
          status: "generating",
        },
        include: { pillars: { orderBy: { order: "asc" } } },
      });

      return updated;
    }),
});
