// =============================================================================
// ROUTER T.3 — Market Context Router
// =============================================================================
// Competitors, opportunities, budget tiers, and cross-brand intelligence.
// Composed of 4 sub-routers, each with strategy ownership checks.
//
// Sub-routers:
//   competitors   — getByStrategy, upsert, delete
//   opportunities — getByStrategy, create, update, delete
//   budgetTiers   — getByStrategy, upsert, delete, seedDefaults
//   crossBrand    — getAll (aggregated market data across all user strategies)
//
// Helpers:
//   verifyStrategyOwnership — Shared ownership check
//
// Dependencies:
//   ~/server/api/trpc          — createTRPCRouter, protectedProcedure
//   ~/lib/types/phase1-schemas — UpsertCompetitorSchema, CreateOpportunitySchema,
//                                UpdateOpportunitySchema, UpsertBudgetTierSchema
//   ~/lib/constants            — BUDGET_TIER_CONFIG
//   ~/server/db                — Prisma client (for helper typing)
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  UpsertCompetitorSchema,
  CreateOpportunitySchema,
  UpdateOpportunitySchema,
  UpsertBudgetTierSchema,
} from "~/lib/types/phase1-schemas";
import { BUDGET_TIER_CONFIG } from "~/lib/constants";
import { db as prismaDb } from "~/server/db";

// ---------------------------------------------------------------------------
// Helper — verify strategy ownership
// ---------------------------------------------------------------------------

async function verifyStrategyOwnership(
  db: typeof prismaDb,
  strategyId: string,
  userId: string,
) {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: { id: true, userId: true },
  });
  if (!strategy || strategy.userId !== userId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Stratégie non trouvée",
    });
  }
  return strategy;
}

// ---------------------------------------------------------------------------
// Competitors sub-router
// ---------------------------------------------------------------------------

const competitorsRouter = createTRPCRouter({
  /**
   * Get all competitors for a strategy.
   */
  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      return ctx.db.competitorSnapshot.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { name: "asc" },
      });
    }),

  /**
   * Upsert a competitor (insert or update on @@unique([strategyId, name])).
   */
  upsert: protectedProcedure
    .input(UpsertCompetitorSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      return ctx.db.competitorSnapshot.upsert({
        where: {
          strategyId_name: {
            strategyId: input.strategyId,
            name: input.name,
          },
        },
        create: {
          strategyId: input.strategyId,
          name: input.name,
          sov: input.sov ?? null,
          positioning: input.positioning ?? null,
          strengths: input.strengths ?? [],
          weaknesses: input.weaknesses ?? [],
          recentMoves: input.recentMoves ?? [],
        },
        update: {
          sov: input.sov,
          positioning: input.positioning,
          strengths: input.strengths,
          weaknesses: input.weaknesses,
          recentMoves: input.recentMoves,
        },
      });
    }),

  /**
   * Delete a competitor.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const competitor = await ctx.db.competitorSnapshot.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!competitor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Concurrent non trouvé",
        });
      }
      await verifyStrategyOwnership(ctx.db, competitor.strategyId, ctx.session.user.id);

      await ctx.db.competitorSnapshot.delete({ where: { id: input.id } });
      return { success: true };
    }),
});

// ---------------------------------------------------------------------------
// Opportunities sub-router
// ---------------------------------------------------------------------------

const opportunitiesRouter = createTRPCRouter({
  /**
   * Get all opportunities for a strategy, sorted by startDate.
   */
  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      return ctx.db.opportunityCalendar.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { startDate: "asc" },
      });
    }),

  /**
   * Create a new opportunity.
   */
  create: protectedProcedure
    .input(CreateOpportunitySchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      return ctx.db.opportunityCalendar.create({
        data: {
          strategyId: input.strategyId,
          title: input.title,
          startDate: input.startDate,
          endDate: input.endDate ?? null,
          type: input.type,
          impact: input.impact,
          channels: input.channels ?? [],
          linkedAxes: input.linkedAxes ?? [],
          notes: input.notes ?? null,
        },
      });
    }),

  /**
   * Update an opportunity.
   */
  update: protectedProcedure
    .input(UpdateOpportunitySchema)
    .mutation(async ({ ctx, input }) => {
      const opp = await ctx.db.opportunityCalendar.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!opp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opportunité non trouvée",
        });
      }
      await verifyStrategyOwnership(ctx.db, opp.strategyId, ctx.session.user.id);

      const { id, ...data } = input;
      return ctx.db.opportunityCalendar.update({
        where: { id },
        data,
      });
    }),

  /**
   * Delete an opportunity.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const opp = await ctx.db.opportunityCalendar.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!opp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opportunité non trouvée",
        });
      }
      await verifyStrategyOwnership(ctx.db, opp.strategyId, ctx.session.user.id);

      await ctx.db.opportunityCalendar.delete({ where: { id: input.id } });
      return { success: true };
    }),
});

// ---------------------------------------------------------------------------
// Budget Tiers sub-router
// ---------------------------------------------------------------------------

const budgetTiersRouter = createTRPCRouter({
  /**
   * Get all budget tiers for a strategy, ordered by minBudget.
   */
  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      return ctx.db.budgetTier.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { minBudget: "asc" },
      });
    }),

  /**
   * Upsert a budget tier (insert or update on @@unique([strategyId, tier])).
   */
  upsert: protectedProcedure
    .input(UpsertBudgetTierSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      return ctx.db.budgetTier.upsert({
        where: {
          strategyId_tier: {
            strategyId: input.strategyId,
            tier: input.tier,
          },
        },
        create: {
          strategyId: input.strategyId,
          tier: input.tier,
          minBudget: input.minBudget,
          maxBudget: input.maxBudget,
          channels: input.channels,
          kpis: input.kpis,
          description: input.description ?? null,
        },
        update: {
          minBudget: input.minBudget,
          maxBudget: input.maxBudget,
          channels: input.channels,
          kpis: input.kpis,
          description: input.description,
        },
      });
    }),

  /**
   * Delete a budget tier.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const tier = await ctx.db.budgetTier.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!tier) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Palier budgétaire non trouvé",
        });
      }
      await verifyStrategyOwnership(ctx.db, tier.strategyId, ctx.session.user.id);

      await ctx.db.budgetTier.delete({ where: { id: input.id } });
      return { success: true };
    }),

  /**
   * Seed default budget tiers from BUDGET_TIER_CONFIG constants.
   * Creates 5 tiers with default channels/KPIs.
   */
  seedDefaults: protectedProcedure
    .input(z.object({ strategyId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      const tiers = Object.entries(BUDGET_TIER_CONFIG).map(([tier, config]) => ({
        strategyId: input.strategyId,
        tier,
        minBudget: config.minBudget,
        maxBudget: config.maxBudget,
        channels: [] as Array<{ channel: string; allocation: number }>,
        kpis: [] as Array<{ kpi: string; target: string }>,
        description: `${config.label} (${config.range})`,
      }));

      // Delete existing tiers first, then create fresh
      await ctx.db.budgetTier.deleteMany({
        where: { strategyId: input.strategyId },
      });

      await ctx.db.budgetTier.createMany({ data: tiers });

      return ctx.db.budgetTier.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { minBudget: "asc" },
      });
    }),
});

// ---------------------------------------------------------------------------
// Cross-brand intelligence — aggregated market data across all user strategies
// ---------------------------------------------------------------------------

const crossBrandRouter = createTRPCRouter({
  /**
   * Get aggregated market intelligence across ALL strategies of the current user.
   * Returns: strategies with T pillar data, all competitors, all opportunities.
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // 1. Load all strategies with their T pillar + market study status
    const strategies = await ctx.db.strategy.findMany({
      where: { userId },
      select: {
        id: true,
        brandName: true,
        tagline: true,
        sector: true,
        phase: true,
        updatedAt: true,
        pillars: {
          where: { type: "T" },
          select: { content: true, status: true, updatedAt: true },
        },
        marketStudy: {
          select: { status: true, synthesizedAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 2. Load all competitors across all user strategies
    const competitors = await ctx.db.competitorSnapshot.findMany({
      where: { strategy: { userId } },
      include: { strategy: { select: { id: true, brandName: true } } },
      orderBy: { name: "asc" },
    });

    // 3. Load all opportunities across all user strategies
    const opportunities = await ctx.db.opportunityCalendar.findMany({
      where: { strategy: { userId } },
      include: { strategy: { select: { id: true, brandName: true } } },
      orderBy: { startDate: "asc" },
    });

    return { strategies, competitors, opportunities };
  }),
});

// ---------------------------------------------------------------------------
// Main market-context router (combines sub-routers)
// ---------------------------------------------------------------------------

export const marketContextRouter = createTRPCRouter({
  competitors: competitorsRouter,
  opportunities: opportunitiesRouter,
  budgetTiers: budgetTiersRouter,
  crossBrand: crossBrandRouter,
});
