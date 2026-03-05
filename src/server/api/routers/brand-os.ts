// =============================================================================
// ROUTER T.19 — Brand OS (Retainer Portal)
// tRPC router for the living brand operating system.
// Provides: Cult Index, Superfan data, Community health, Touchpoints,
//           Actions, Opportunities, Strategy Lab projections, Executive Bridge.
// =============================================================================

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { AppErrors, throwNotFound, throwForbidden } from "~/server/errors";
import { calculateCultIndexForStrategy } from "~/server/services/cult-index-engine";
import type { db as dbInstance } from "~/server/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type DbClient = typeof dbInstance;

async function verifyStrategyAccess(
  db: DbClient,
  strategyId: string,
  user: { id: string; role?: string | null },
) {
  const isInternal = user.role === "ADMIN" || user.role === "OPERATOR";
  const where: Record<string, unknown> = { id: strategyId };
  if (!isInternal) {
    where.userId = user.id;
  }
  const strategy = await db.strategy.findFirst({
    where,
    select: { id: true, brandName: true },
  });
  if (!strategy) {
    throwNotFound(AppErrors.STRATEGY_NOT_FOUND);
  }
  return strategy;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const brandOSRouter = createTRPCRouter({
  // =========================================================================
  // CONFIG
  // =========================================================================

  /** Get or create Brand OS config for a strategy */
  getConfig: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      let config = await ctx.db.brandOSConfig.findUnique({
        where: { strategyId: input.strategyId },
      });
      if (!config) {
        config = await ctx.db.brandOSConfig.create({
          data: { strategyId: input.strategyId },
        });
      }
      return config;
    }),

  /** Update Brand OS config */
  updateConfig: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      theme: z.any().optional(),
      enabledViews: z.array(z.string()).optional(),
      refreshCadence: z.enum(["HOURLY", "DAILY", "WEEKLY"]).optional(),
      cultWeights: z.record(z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      const { strategyId, ...data } = input;
      return ctx.db.brandOSConfig.upsert({
        where: { strategyId },
        create: { strategyId, ...data },
        update: data,
      });
    }),

  // =========================================================================
  // NUCLEUS — Cult Index & Superfans
  // =========================================================================

  /** Compute and return the current Cult Index */
  getCultIndex: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      return calculateCultIndexForStrategy(ctx.db, input.strategyId);
    }),

  /** Get Cult Index history (for trend chart) */
  getCultIndexHistory: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      limit: z.number().min(1).max(365).default(90),
    }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      return ctx.db.cultIndexSnapshot.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  /** Save a Cult Index snapshot */
  saveCultIndexSnapshot: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      const breakdown = await calculateCultIndexForStrategy(ctx.db, input.strategyId);
      return ctx.db.cultIndexSnapshot.create({
        data: {
          strategyId: input.strategyId,
          cultIndex: breakdown.cultIndex,
          engagementDepth: breakdown.engagementDepth,
          superfanVelocity: breakdown.superfanVelocity,
          communityCohesion: breakdown.communityCohesion,
          brandDefenseRate: breakdown.brandDefenseRate,
          ugcGenerationRate: breakdown.ugcGenerationRate,
          ritualAdoption: breakdown.ritualAdoption,
          evangelismScore: breakdown.evangelismScore,
          superfanCount: breakdown.superfanCount,
          totalCommunity: breakdown.totalCommunity,
          trigger: "manual",
        },
      });
    }),

  /** Get superfan funnel counts (per segment) */
  getSuperfanFunnel: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      const segments = await ctx.db.superfanProfile.groupBy({
        by: ["segment"],
        where: { strategyId: input.strategyId },
        _count: true,
      });
      return segments.map((s) => ({ segment: s.segment, count: s._count }));
    }),

  /** Get top superfans (ordered by engagement depth) */
  getTopSuperfans: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      return ctx.db.superfanProfile.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { engagementDepth: "desc" },
        take: input.limit,
      });
    }),

  /** Get superfan distribution by market (for heatmap) */
  getSuperfansByMarket: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      const markets = await ctx.db.superfanProfile.groupBy({
        by: ["market"],
        where: { strategyId: input.strategyId, market: { not: null } },
        _count: true,
        _avg: { engagementDepth: true },
      });
      return markets.map((m) => ({
        market: m.market,
        count: m._count,
        avgDepth: Math.round(m._avg.engagementDepth ?? 0),
      }));
    }),

  // =========================================================================
  // PULSE — Community Health
  // =========================================================================

  /** Get latest community health snapshot */
  getCommunityHealth: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      return ctx.db.communitySnapshot.findFirst({
        where: { strategyId: input.strategyId },
        orderBy: { createdAt: "desc" },
      });
    }),

  /** Get community health history */
  getCommunityHistory: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      period: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("DAILY"),
      limit: z.number().min(1).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      return ctx.db.communitySnapshot.findMany({
        where: { strategyId: input.strategyId, period: input.period },
        orderBy: { periodStart: "desc" },
        take: input.limit,
      });
    }),

  // =========================================================================
  // TOUCHPOINTS — Channel Matrix
  // =========================================================================

  /** Get all connected channels with metrics */
  getChannels: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      return ctx.db.socialChannel.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { followers: "desc" },
      });
    }),

  /** Upsert a social channel */
  upsertChannel: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      platform: z.string(),
      accountName: z.string().optional(),
      followers: z.number().optional(),
      engagementRate: z.number().optional(),
      avgReach: z.number().optional(),
      healthStatus: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      const { strategyId, platform, ...data } = input;
      return ctx.db.socialChannel.upsert({
        where: { strategyId_platform: { strategyId, platform } },
        create: { strategyId, platform, ...data },
        update: { ...data, lastSyncAt: new Date() },
      });
    }),

  // =========================================================================
  // ACTIONS — Command Center
  // =========================================================================

  /** Get action items (filterable) */
  getActions: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      status: z.string().optional(),
      priority: z.string().optional(),
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      const where: Record<string, unknown> = { strategyId: input.strategyId };
      if (input.status) where.status = input.status;
      if (input.priority) where.priority = input.priority;
      if (input.category) where.category = input.category;
      return ctx.db.oSActionItem.findMany({
        where,
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      });
    }),

  /** Create an action item */
  createAction: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.string(),
      priority: z.enum(["P0", "P1", "P2"]).default("P1"),
      effort: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
      impact: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
      channel: z.string().optional(),
      deadline: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      return ctx.db.oSActionItem.create({ data: input });
    }),

  /** Update action status */
  updateActionStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["TODO", "IN_PROGRESS", "DONE", "DISMISSED"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const action = await ctx.db.oSActionItem.findUnique({
        where: { id: input.id },
        include: { strategy: { select: { userId: true } } },
      });
      if (!action || action.strategy.userId !== ctx.session.user.id) {
        throwNotFound();
      }
      return ctx.db.oSActionItem.update({
        where: { id: input.id },
        data: {
          status: input.status,
          completedAt: input.status === "DONE" ? new Date() : null,
          completedBy: input.status === "DONE" ? ctx.session.user.id : null,
        },
      });
    }),

  // =========================================================================
  // OPPORTUNITIES — Radar
  // =========================================================================

  /** Get opportunities */
  getOpportunities: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      type: z.string().optional(),
      status: z.string().optional(),
      timing: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      const where: Record<string, unknown> = { strategyId: input.strategyId };
      if (input.type) where.type = input.type;
      if (input.status) where.status = input.status;
      if (input.timing) where.timing = input.timing;
      return ctx.db.oSOpportunity.findMany({
        where,
        orderBy: [{ relevance: "desc" }, { createdAt: "desc" }],
      });
    }),

  /** Create an opportunity */
  createOpportunity: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      type: z.string(),
      relevance: z.number().min(0).max(100).default(50),
      timing: z.string().default("THIS_WEEK"),
      estimatedROI: z.string().optional(),
      budgetNeeded: z.number().optional(),
      channels: z.array(z.string()).optional(),
      expiresAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      return ctx.db.oSOpportunity.create({ data: input });
    }),

  // =========================================================================
  // STRATEGY LAB — Budget Scenarios
  // =========================================================================

  /** Get budget scenario projections */
  getScenarios: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);

      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        select: { annualBudget: true, targetRevenue: true, currency: true, sector: true },
      });

      const budgetTiers = await ctx.db.budgetTier.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { minBudget: "asc" },
      });

      const channels = await ctx.db.socialChannel.findMany({
        where: { strategyId: input.strategyId },
        select: { platform: true, followers: true, engagementRate: true },
      });

      return {
        currentBudget: strategy?.annualBudget ?? 0,
        targetRevenue: strategy?.targetRevenue ?? 0,
        currency: strategy?.currency ?? "XAF",
        sector: strategy?.sector,
        tiers: budgetTiers,
        channels,
      };
    }),

  // =========================================================================
  // EXECUTIVE BRIDGE — CEO View
  // =========================================================================

  /** Get executive summary (all key metrics in one call) */
  getExecutiveSummary: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);

      // Cult Index
      const cultIndex = await calculateCultIndexForStrategy(ctx.db, input.strategyId);

      // Previous Cult Index (for trend)
      const prevSnapshot = await ctx.db.cultIndexSnapshot.findFirst({
        where: { strategyId: input.strategyId },
        orderBy: { createdAt: "desc" },
        select: { cultIndex: true, createdAt: true },
      });

      // Community health
      const health = await ctx.db.communitySnapshot.findFirst({
        where: { strategyId: input.strategyId },
        orderBy: { createdAt: "desc" },
        select: { healthScore: true, growthRate: true, sentimentAvg: true },
      });

      // Strategy scores
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        select: {
          brandName: true, coherenceScore: true, annualBudget: true,
          currency: true, sector: true,
        },
      });

      // Top actions (P0 + P1 TODO)
      const topActions = await ctx.db.oSActionItem.findMany({
        where: {
          strategyId: input.strategyId,
          status: "TODO",
          priority: { in: ["P0", "P1"] },
        },
        orderBy: { priority: "asc" },
        take: 3,
      });

      // Active opportunities count
      const opportunityCount = await ctx.db.oSOpportunity.count({
        where: { strategyId: input.strategyId, status: "NEW" },
      });

      // Channel count
      const channelCount = await ctx.db.socialChannel.count({
        where: { strategyId: input.strategyId, isConnected: true },
      });

      return {
        brandName: strategy?.brandName ?? "—",
        cultIndex: cultIndex.cultIndex,
        cultIndexPrev: prevSnapshot?.cultIndex ?? null,
        cultIndexTrend: prevSnapshot
          ? cultIndex.cultIndex - prevSnapshot.cultIndex
          : null,
        superfanCount: cultIndex.superfanCount,
        communityHealth: health?.healthScore ?? null,
        communityGrowth: health?.growthRate ?? null,
        sentiment: health?.sentimentAvg ?? null,
        coherenceScore: strategy?.coherenceScore ?? null,
        topActions,
        opportunityCount,
        channelCount,
        budget: strategy?.annualBudget ?? null,
        currency: strategy?.currency ?? "XAF",
      };
    }),

  // =========================================================================
  // OVERVIEW — Multi-brand portfolio
  // =========================================================================

  /** Delete a social channel */
  deleteChannel: protectedProcedure
    .input(z.object({
      strategyId: z.string(),
      platform: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyAccess(ctx.db, input.strategyId, ctx.session.user);
      return ctx.db.socialChannel.delete({
        where: {
          strategyId_platform: {
            strategyId: input.strategyId,
            platform: input.platform,
          },
        },
      });
    }),

  /** Seed demo data for a strategy (admin/operator only) */
  seedDemoData: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
        throwForbidden(AppErrors.FORBIDDEN);
      }
      await verifyStrategyAccess(ctx.db, input.strategyId, user);

      // Clean existing Brand OS data
      await ctx.db.cultIndexSnapshot.deleteMany({ where: { strategyId: input.strategyId } });
      await ctx.db.communitySnapshot.deleteMany({ where: { strategyId: input.strategyId } });
      await ctx.db.superfanProfile.deleteMany({ where: { strategyId: input.strategyId } });
      await ctx.db.socialChannel.deleteMany({ where: { strategyId: input.strategyId } });
      await ctx.db.brandOSConfig.deleteMany({ where: { strategyId: input.strategyId } });

      // Config
      await ctx.db.brandOSConfig.create({
        data: {
          strategyId: input.strategyId,
          isActive: true,
          refreshCadence: "DAILY",
          enabledViews: ["nucleus", "pulse", "touchpoints", "community", "command"],
          cultWeights: {
            engagementDepth: 0.20,
            superfanVelocity: 0.15,
            communityCohesion: 0.15,
            brandDefenseRate: 0.10,
            ugcGenerationRate: 0.15,
            ritualAdoption: 0.10,
            evangelismScore: 0.15,
          },
        },
      });

      // Channels
      const daysAgo = (n: number) => {
        const d = new Date();
        d.setDate(d.getDate() - n);
        d.setHours(8, 0, 0, 0);
        return d;
      };

      const channels = [
        { platform: "INSTAGRAM", accountName: "@demo.brand", isConnected: true, category: "SOCIAL", followers: 47200, engagementRate: 4.8, avgReach: 18500, avgImpressions: 32000, postFrequency: 5.2, responseTime: 45, sentimentScore: 0.72, healthStatus: "HEALTHY", lastActivityAt: daysAgo(0) },
        { platform: "FACEBOOK", accountName: "Demo Brand", isConnected: true, category: "SOCIAL", followers: 23800, engagementRate: 2.1, avgReach: 9200, avgImpressions: 15400, postFrequency: 3.0, responseTime: 120, sentimentScore: 0.65, healthStatus: "HEALTHY", lastActivityAt: daysAgo(1) },
        { platform: "TIKTOK", accountName: "@demo_brand", isConnected: true, category: "SOCIAL", followers: 12400, engagementRate: 8.3, avgReach: 42000, avgImpressions: 68000, postFrequency: 2.5, sentimentScore: 0.81, healthStatus: "HEALTHY", lastActivityAt: daysAgo(0) },
        { platform: "TWITTER", accountName: "@DemoBrand", isConnected: true, category: "SOCIAL", followers: 8900, engagementRate: 1.4, avgReach: 5200, avgImpressions: 11000, postFrequency: 7.0, responseTime: 30, sentimentScore: 0.58, healthStatus: "WARNING", lastActivityAt: daysAgo(2) },
        { platform: "LINKEDIN", accountName: "Demo Brand Group", isConnected: true, category: "OWNED", followers: 5600, engagementRate: 3.2, avgReach: 3800, avgImpressions: 7200, postFrequency: 1.5, sentimentScore: 0.77, healthStatus: "HEALTHY", lastActivityAt: daysAgo(3) },
      ];
      for (const ch of channels) {
        await ctx.db.socialChannel.create({ data: { strategyId: input.strategyId, ...ch } });
      }

      // Cult index snapshots (30 days)
      const clamp = (v: number, min: number, max: number) => Math.round(Math.min(max, Math.max(min, v)) * 100) / 100;
      const snapshots = [];
      for (let i = 29; i >= 0; i--) {
        const base = 62 + (29 - i) * 0.4 + (Math.random() - 0.5) * 3;
        snapshots.push({
          strategyId: input.strategyId,
          cultIndex: clamp(base, 0, 100),
          engagementDepth: clamp(68 + (Math.random() - 0.4) * 10, 0, 100),
          superfanVelocity: clamp(55 + (Math.random() - 0.3) * 12, 0, 100),
          communityCohesion: clamp(72 + (Math.random() - 0.5) * 8, 0, 100),
          brandDefenseRate: clamp(45 + (Math.random() - 0.3) * 15, 0, 100),
          ugcGenerationRate: clamp(58 + (Math.random() - 0.4) * 10, 0, 100),
          ritualAdoption: clamp(38 + (Math.random() - 0.3) * 12, 0, 100),
          evangelismScore: clamp(52 + (Math.random() - 0.4) * 10, 0, 100),
          superfanCount: 340 + Math.floor((29 - i) * 2.5 + Math.random() * 5),
          totalCommunity: 97300 + Math.floor((29 - i) * 120 + Math.random() * 200),
          trigger: "scheduled",
          createdAt: daysAgo(i),
        });
      }
      await ctx.db.cultIndexSnapshot.createMany({ data: snapshots });

      // Community snapshots (30 days)
      const communitySnaps = [];
      for (let i = 29; i >= 0; i--) {
        const d = daysAgo(i);
        const nextD = daysAgo(i - 1);
        communitySnaps.push({
          strategyId: input.strategyId,
          healthScore: clamp(71 + (29 - i) * 0.3 + (Math.random() - 0.5) * 5, 0, 100),
          growthRate: clamp(1.2 + (Math.random() - 0.4) * 0.8, -2, 10),
          retentionRate: clamp(88 + (Math.random() - 0.5) * 6, 50, 100),
          activityRate: clamp(24 + (Math.random() - 0.5) * 8, 5, 80),
          sentimentAvg: clamp(0.68 + (Math.random() - 0.5) * 0.15, -1, 1),
          totalMembers: 97300 + Math.floor((29 - i) * 120),
          activeMembersD7: 23000 + Math.floor(Math.random() * 2000),
          newMembers: 100 + Math.floor(Math.random() * 80),
          lostMembers: 30 + Math.floor(Math.random() * 25),
          mentionCount: 180 + Math.floor(Math.random() * 120),
          conversationVol: 450 + Math.floor(Math.random() * 200),
          avgResponseTime: 35 + Math.floor(Math.random() * 30),
          toxicityLevel: clamp(0.03 + Math.random() * 0.04, 0, 1),
          topTopics: [
            { topic: "Campagne digitale", volume: 85, sentiment: 0.82, trend: "up" },
            { topic: "Événement communautaire", volume: 72, sentiment: 0.91, trend: "stable" },
            { topic: "Service client", volume: 45, sentiment: -0.3, trend: "down" },
          ],
          period: "DAILY",
          periodStart: d,
          periodEnd: nextD,
          createdAt: d,
        });
      }
      await ctx.db.communitySnapshot.createMany({ data: communitySnaps });

      // Superfan profiles (30)
      const markets = ["CM", "CI", "SN", "GH", "NG"];
      const cities: Record<string, string[]> = {
        CM: ["Douala", "Yaoundé"], CI: ["Abidjan", "Bouaké"], SN: ["Dakar", "Thiès"],
        GH: ["Accra", "Kumasi"], NG: ["Lagos", "Abuja"],
      };
      const segments = ["AUDIENCE", "FOLLOWER", "ENGAGED", "FAN", "SUPERFAN", "EVANGELIST"];
      const segmentWeights = [5, 15, 30, 25, 18, 7];
      const pick = () => {
        const total = segmentWeights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < segments.length; i++) {
          r -= segmentWeights[i]!;
          if (r <= 0) return segments[i]!;
        }
        return segments[segments.length - 1]!;
      };
      const depthFor = (seg: string) => {
        const base: Record<string, number> = { AUDIENCE: 5, FOLLOWER: 18, ENGAGED: 42, FAN: 65, SUPERFAN: 82, EVANGELIST: 94 };
        return clamp((base[seg] ?? 30) + (Math.random() - 0.5) * 12, 0, 100);
      };

      const superfans = [];
      for (let i = 0; i < 30; i++) {
        const market = markets[Math.floor(Math.random() * markets.length)]!;
        const cityList = cities[market]!;
        const segment = pick();
        const depth = depthFor(segment);
        superfans.push({
          strategyId: input.strategyId,
          displayName: `Demo User ${i + 1}`,
          market,
          city: cityList[Math.floor(Math.random() * cityList.length)],
          segment,
          engagementDepth: depth,
          totalInteractions: Math.floor(depth * 8 + Math.random() * 50),
          ugcCount: segment === "EVANGELIST" ? Math.floor(5 + Math.random() * 15) : Math.floor(Math.random() * 5),
          defenseCount: segment === "SUPERFAN" || segment === "EVANGELIST" ? Math.floor(2 + Math.random() * 8) : Math.floor(Math.random() * 2),
          shareCount: Math.floor(depth * 0.3 + Math.random() * 10),
          purchaseCount: Math.floor(1 + Math.random() * 6),
          referralCount: segment === "EVANGELIST" ? Math.floor(3 + Math.random() * 7) : Math.floor(Math.random() * 3),
          firstSeenAt: daysAgo(Math.floor(30 + Math.random() * 300)),
          lastActiveAt: daysAgo(Math.floor(Math.random() * 14)),
        });
      }
      await ctx.db.superfanProfile.createMany({ data: superfans });

      return { success: true, channels: channels.length, snapshots: snapshots.length, superfans: superfans.length };
    }),

  /** Get Brand OS overview for all brands owned by user (or all retainer brands for ADMIN/OPERATOR) */
  getPortfolio: protectedProcedure
    .query(async ({ ctx }) => {
      const role = ctx.session.user.role ?? "OPERATOR";
      const isInternal = role === "ADMIN" || role === "OPERATOR";

      const where: Record<string, unknown> = {
        status: { not: "archived" },
        deliveryMode: "RETAINER",
      };

      // Clients only see their own brands; ADMIN/OPERATOR see all retainer brands
      if (!isInternal) {
        where.userId = ctx.session.user.id;
      }

      const strategies = await ctx.db.strategy.findMany({
        where,
        select: {
          id: true, brandName: true, sector: true, currency: true,
          coherenceScore: true, annualBudget: true,
        },
        orderBy: { brandName: "asc" },
      });

      // For each strategy, get the latest cult index snapshot (graceful if tables don't exist yet)
      const results = await Promise.all(
        strategies.map(async (s) => {
          let cultIndex: number | null = null;
          let superfanCount = 0;
          let totalCommunity = 0;
          let communityHealth: number | null = null;

          try {
            const snapshot = await ctx.db.cultIndexSnapshot.findFirst({
              where: { strategyId: s.id },
              orderBy: { createdAt: "desc" },
              select: { cultIndex: true, superfanCount: true, totalCommunity: true },
            });
            if (snapshot) {
              cultIndex = snapshot.cultIndex;
              superfanCount = snapshot.superfanCount;
              totalCommunity = snapshot.totalCommunity;
            }
          } catch {
            // Table may not exist yet — ignore
          }

          try {
            const health = await ctx.db.communitySnapshot.findFirst({
              where: { strategyId: s.id },
              orderBy: { createdAt: "desc" },
              select: { healthScore: true },
            });
            if (health) {
              communityHealth = health.healthScore;
            }
          } catch {
            // Table may not exist yet — ignore
          }

          return {
            ...s,
            cultIndex,
            superfanCount,
            totalCommunity,
            communityHealth,
          };
        }),
      );

      return results;
    }),
});
