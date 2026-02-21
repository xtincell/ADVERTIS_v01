// =============================================================================
// ROUTER T.13 — Market Pricing Router
// =============================================================================
// Pricing models, rates, and AI cost dashboard.
// Combines market pricing management with AI cost tracking queries.
// ADMIN/OPERATOR-only for pricing mutations; ADMIN-only for delete.
//
// Procedures:
//   getByMarket    — Get pricing data by market
//   getByCategory  — Get pricing data by market + category
//   search         — Search pricing entries by query string
//   upsert         — Upsert a pricing entry (ADMIN/OPERATOR)
//   delete         — Delete a pricing entry (ADMIN only)
//   seedDefaults   — Seed default pricing data for a market (ADMIN/OPERATOR)
//   calculateCost  — Estimate mission cost from assignments + market
//   getCostSummary — Get agency-level AI cost overview
//   getCostByMission — Get AI cost summary for a specific mission
//   getMonthlyCosts  — Get AI cost summary by month
//
// Dependencies:
//   ~/server/api/trpc                 — createTRPCRouter, protectedProcedure, roleProtectedProcedure
//   ~/lib/types/phase3-schemas        — UpsertMarketPricingSchema
//   ~/lib/constants                   — MARKETS, PRICING_CATEGORIES
//   ~/server/services/market-pricing  — upsertPricing, deletePricing, getPricingByMarket, etc.
//   ~/server/services/ai-cost-tracker — getAgencyCostOverview, getCostSummaryByMission, etc.
// =============================================================================

import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  roleProtectedProcedure,
} from "~/server/api/trpc";
import { UpsertMarketPricingSchema } from "~/lib/types/phase3-schemas";
import { MARKETS, PRICING_CATEGORIES } from "~/lib/constants";
import {
  upsertPricing,
  deletePricing,
  getPricingByMarket,
  getPricingByCategory,
  searchPricing,
  calculateMissionCost,
  seedDefaultPricing,
} from "~/server/services/market-pricing";
import {
  getAgencyCostOverview,
  getCostSummaryByMission,
  getCostSummaryByMonth,
} from "~/server/services/ai-cost-tracker";

const opsProcedure = roleProtectedProcedure(["ADMIN", "OPERATOR"]);
const adminProcedure = roleProtectedProcedure(["ADMIN"]);

export const marketPricingRouter = createTRPCRouter({
  // ── Pricing Queries ──

  getByMarket: protectedProcedure
    .input(z.object({ market: z.enum(MARKETS) }))
    .query(async ({ input }) => {
      return getPricingByMarket(input.market);
    }),

  getByCategory: protectedProcedure
    .input(
      z.object({
        market: z.enum(MARKETS),
        category: z.enum(PRICING_CATEGORIES),
      }),
    )
    .query(async ({ input }) => {
      return getPricingByCategory(input.market, input.category);
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      return searchPricing(input.query);
    }),

  // ── Pricing Mutations ──

  upsert: opsProcedure
    .input(UpsertMarketPricingSchema)
    .mutation(async ({ ctx, input }) => {
      return upsertPricing(input, ctx.session.user.id);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return deletePricing(input.id);
    }),

  seedDefaults: opsProcedure
    .input(z.object({ market: z.enum(MARKETS) }))
    .mutation(async ({ ctx, input }) => {
      return seedDefaultPricing(input.market, ctx.session.user.id);
    }),

  // ── Mission Cost Estimation ──

  calculateCost: protectedProcedure
    .input(
      z.object({
        assignments: z.array(
          z.object({
            role: z.string(),
            estimatedDays: z.number(),
            dayRate: z.number().optional(),
          }),
        ),
        market: z.enum(MARKETS),
      }),
    )
    .query(async ({ input }) => {
      return calculateMissionCost(input.assignments, input.market);
    }),

  // ── AI Cost Dashboard ──

  getCostSummary: protectedProcedure.query(async ({ ctx }) => {
    return getAgencyCostOverview(ctx.session.user.id);
  }),

  getCostByMission: protectedProcedure
    .input(z.object({ missionId: z.string().min(1) }))
    .query(async ({ input }) => {
      return getCostSummaryByMission(input.missionId);
    }),

  getMonthlyCosts: protectedProcedure
    .input(
      z.object({
        year: z.number().int().min(2020).max(2030),
        month: z.number().int().min(1).max(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      return getCostSummaryByMonth(ctx.session.user.id, input.year, input.month);
    }),
});
