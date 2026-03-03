// =============================================================================
// ROUTER T.27 — Ambassador Program (Programme Apôtres)
// CRUD + stats for brand ambassador management.
// =============================================================================

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, roleProtectedProcedure } from "~/server/api/trpc";
import { AMBASSADOR_TIERS, AMBASSADOR_TIER_THRESHOLDS } from "~/lib/constants";

export const ambassadorRouter = createTRPCRouter({
  // ── List ambassadors for a strategy ──────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        tier: z.string().optional(),
        status: z.string().optional(),
        market: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        strategyId: input.strategyId,
      };
      if (input.tier) where.tier = input.tier;
      if (input.status) where.status = input.status;
      if (input.market) where.market = input.market;

      return ctx.db.ambassadorProgram.findMany({
        where,
        orderBy: { engagementScore: "desc" },
      });
    }),

  // ── Get ambassador by ID ─────────────────────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.ambassadorProgram.findUnique({
        where: { id: input.id },
      });
    }),

  // ── Ambassador stats per strategy ────────────────────────────────────────
  getStats: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ambassadors = await ctx.db.ambassadorProgram.findMany({
        where: { strategyId: input.strategyId },
      });

      const total = ambassadors.length;
      const active = ambassadors.filter((a) => a.status === "ACTIVE").length;
      const totalReferrals = ambassadors.reduce((s, a) => s + a.referralCount, 0);
      const totalRevenue = ambassadors.reduce((s, a) => s + a.revenueGenerated, 0);
      const totalContent = ambassadors.reduce((s, a) => s + a.contentCount, 0);
      const avgEngagement =
        total > 0
          ? Math.round(ambassadors.reduce((s, a) => s + a.engagementScore, 0) / total)
          : 0;

      // Per tier breakdown
      const perTier = AMBASSADOR_TIERS.reduce(
        (acc, tier) => {
          acc[tier] = ambassadors.filter((a) => a.tier === tier).length;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        total,
        active,
        totalReferrals,
        totalRevenue,
        totalContent,
        avgEngagement,
        perTier,
      };
    }),

  // ── Create ambassador ────────────────────────────────────────────────────
  create: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(
      z.object({
        strategyId: z.string(),
        displayName: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        market: z.string().optional(),
        city: z.string().optional(),
        handles: z.record(z.string()).optional(),
        audienceSize: z.number().int().min(0).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ambassadorProgram.create({
        data: {
          strategyId: input.strategyId,
          displayName: input.displayName,
          email: input.email,
          phone: input.phone,
          market: input.market,
          city: input.city,
          handles: input.handles ?? undefined,
          audienceSize: input.audienceSize ?? 0,
          notes: input.notes,
          tier: "BRONZE",
          status: "INVITED",
        },
      });
    }),

  // ── Update ambassador ────────────────────────────────────────────────────
  update: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(
      z.object({
        id: z.string(),
        displayName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        market: z.string().optional(),
        city: z.string().optional(),
        status: z.string().optional(),
        tier: z.string().optional(),
        handles: z.record(z.string()).optional(),
        audienceSize: z.number().int().min(0).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.ambassadorProgram.update({
        where: { id },
        data: {
          ...data,
          handles: data.handles ?? undefined,
        },
      });
    }),

  // ── Log ambassador activity (increment counters) ─────────────────────────
  logActivity: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(
      z.object({
        id: z.string(),
        type: z.enum(["referral", "content", "event"]),
        points: z.number().int().min(1).default(10),
        revenueAmount: z.number().min(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ambassador = await ctx.db.ambassadorProgram.findUniqueOrThrow({
        where: { id: input.id },
      });

      const incrementData: Record<string, unknown> = {
        pointsBalance: { increment: input.points },
        totalPointsEarned: { increment: input.points },
        lastActiveAt: new Date(),
      };

      if (input.type === "referral") {
        incrementData.referralCount = { increment: 1 };
      } else if (input.type === "content") {
        incrementData.contentCount = { increment: 1 };
      } else if (input.type === "event") {
        incrementData.eventCount = { increment: 1 };
      }

      if (input.revenueAmount) {
        incrementData.revenueGenerated = { increment: input.revenueAmount };
      }

      // Auto-tier upgrade based on total points
      const newTotal = ambassador.totalPointsEarned + input.points;
      let newTier = ambassador.tier;
      for (const t of [...AMBASSADOR_TIERS].reverse()) {
        if (newTotal >= AMBASSADOR_TIER_THRESHOLDS[t]) {
          newTier = t;
          break;
        }
      }
      if (newTier !== ambassador.tier) {
        incrementData.tier = newTier;
      }

      // Recalculate engagement score
      const refScore = Math.min((ambassador.referralCount + (input.type === "referral" ? 1 : 0)) * 10, 40);
      const contentScore = Math.min((ambassador.contentCount + (input.type === "content" ? 1 : 0)) * 5, 30);
      const eventScore = Math.min((ambassador.eventCount + (input.type === "event" ? 1 : 0)) * 8, 20);
      const audienceScore = Math.min(ambassador.audienceSize / 1000, 10);
      incrementData.engagementScore = Math.min(refScore + contentScore + eventScore + audienceScore, 100);

      return ctx.db.ambassadorProgram.update({
        where: { id: input.id },
        data: incrementData,
      });
    }),

  // ── Delete ambassador ────────────────────────────────────────────────────
  delete: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ambassadorProgram.delete({
        where: { id: input.id },
      });
    }),
});
