// =============================================================================
// MCP Server — Pulse ("Le Système Nerveux")
// =============================================================================
// Brand monitoring & health: Cult Index, signals, score trends, social health,
// superfans, competitors, opportunities. 11 tools + 7 resources.
// =============================================================================

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAuthContext } from "../auth";
import { resolveStrategyId } from "../create-server";
import { formatResult, formatError, formatResource } from "../utils";

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerPulseServer(
  server: McpServer,
  ctx: McpAuthContext,
): void {
  // =========================================================================
  // TOOLS
  // =========================================================================

  // --- calculate_cult_index ---
  server.registerTool(
    "calculate_cult_index",
    {
      description:
        "Calculate the Cult Index score (0-100) for a brand. Measures cult-status across 7 dimensions.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
      },
    },
    async (args) => {
      try {
        const { computeCultIndex } = await import("~/server/services/cult-index-engine");
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);

        // Aggregate metrics from DB
        const [superfanAgg, communitySnapshot, recentSuperfans, prevSuperfans] =
          await Promise.all([
            db.superfanProfile.aggregate({
              where: { strategyId },
              _count: { _all: true },
              _avg: { engagementDepth: true },
              _sum: {
                ugcCount: true,
                defenseCount: true,
                shareCount: true,
                referralCount: true,
              },
            }),
            db.communitySnapshot.findFirst({
              where: { strategyId },
              orderBy: { periodStart: "desc" },
            }),
            db.superfanProfile.count({
              where: {
                strategyId,
                createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
              },
            }),
            db.superfanProfile.count({
              where: {
                strategyId,
                createdAt: {
                  gte: new Date(Date.now() - 60 * 86400000),
                  lt: new Date(Date.now() - 30 * 86400000),
                },
              },
            }),
          ]);

        // No tier field — count evangelists by engagementDepth threshold
        const evangelistCount = await db.superfanProfile.count({
          where: { strategyId, engagementDepth: { gte: 80 } },
        });

        const metrics = {
          totalCommunity: communitySnapshot?.totalMembers ?? 0,
          superfanCount: superfanAgg._count._all,
          evangelistCount,
          avgEngagementDepth: superfanAgg._avg?.engagementDepth ?? 0,
          totalUGC: superfanAgg._sum?.ugcCount ?? 0,
          totalDefenses: superfanAgg._sum?.defenseCount ?? 0,
          totalShares: superfanAgg._sum?.shareCount ?? 0,
          totalReferrals: superfanAgg._sum?.referralCount ?? 0,
          retentionRate: communitySnapshot?.retentionRate ?? 0,
          activityRate: communitySnapshot?.activityRate ?? 0,
          growthRate: communitySnapshot?.growthRate ?? 0,
          newSuperfans30d: recentSuperfans,
          newSuperfansPrev30d: prevSuperfans,
        };

        const result = computeCultIndex(metrics);
        return formatResult(result);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_signals ---
  server.registerTool(
    "get_signals",
    {
      description: "Get brand signals for a strategy. Optional filters by layer and status.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        layer: z.string().optional().describe("Filter by pillar/layer"),
        status: z.string().optional().describe("Filter by status (ACTIVE, RESOLVED, etc.)"),
      },
    },
    async (args) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const where: Record<string, unknown> = { strategyId };
        if (args.layer) where.pillar = args.layer;
        if (args.status) where.status = args.status;
        const signals = await db.signal.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 50,
        });
        return formatResult(signals);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- create_signal ---
  server.registerTool(
    "create_signal",
    {
      description: "Create a new brand signal (alert, insight, anomaly).",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        title: z.string().describe("Signal title"),
        pillar: z.string().describe("Related pillar (A/D/V/E/S)"),
        layer: z.string().describe("Signal layer/category"),
        description: z.string().optional().describe("Detailed description"),
        confidence: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      },
    },
    async (args) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const signal = await db.signal.create({
          data: {
            strategyId,
            title: args.title,
            pillar: args.pillar,
            layer: args.layer,
            description: args.description,
            confidence: args.confidence ?? "MEDIUM",
            status: "ACTIVE",
            source: "MCP",
          },
        });
        return formatResult(signal);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_score_trends ---
  server.registerTool(
    "get_score_trends",
    {
      description: "Get score evolution over time (snapshots). Supports 7d, 30d, 90d periods.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        period: z.enum(["7d", "30d", "90d"]).optional().describe("Time period (default: 30d)"),
      },
    },
    async (args) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const days = args.period === "7d" ? 7 : args.period === "90d" ? 90 : 30;
        const since = new Date(Date.now() - days * 86400000);
        const snapshots = await db.scoreSnapshot.findMany({
          where: { strategyId, createdAt: { gte: since } },
          orderBy: { createdAt: "asc" },
        });
        return formatResult(snapshots);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_social_health ---
  server.registerTool(
    "get_social_health",
    {
      description: "Get social channel health metrics for a strategy.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
      },
    },
    async (args) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const channels = await db.socialChannel.findMany({
          where: { strategyId },
          orderBy: { platform: "asc" },
        });
        return formatResult(channels);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_superfans ---
  server.registerTool(
    "get_superfans",
    {
      description: "Get superfan profiles for a strategy. Optional engagement depth filter.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        minEngagement: z.number().optional().describe("Minimum engagement depth (0-100)"),
      },
    },
    async (args) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const fans = await db.superfanProfile.findMany({
          where: {
            strategyId,
            ...(args.minEngagement ? { engagementDepth: { gte: args.minEngagement } } : {}),
          },
          orderBy: { engagementDepth: "desc" },
          take: 100,
        });
        return formatResult(fans);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_competitor_snapshot ---
  server.registerTool(
    "get_competitor_snapshot",
    {
      description: "Get competitor analysis snapshots for a strategy.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
      },
    },
    async (args) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const competitors = await db.competitorSnapshot.findMany({
          where: { strategyId },
          orderBy: { lastUpdated: "desc" },
        });
        return formatResult(competitors);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_opportunities ---
  server.registerTool(
    "get_opportunities",
    {
      description: "Get opportunity calendar entries for a strategy.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
      },
    },
    async (args) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const opportunities = await db.opportunityCalendar.findMany({
          where: { strategyId },
          orderBy: { startDate: "asc" },
        });
        return formatResult(opportunities);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_metric_thresholds ---
  server.registerTool(
    "get_metric_thresholds",
    {
      description: "Get metric alert thresholds configured for a strategy.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        pillar: z.string().optional().describe("Filter by pillar"),
      },
    },
    async (args) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const where: Record<string, unknown> = { strategyId };
        if (args.pillar) where.pillar = args.pillar;
        const thresholds = await db.metricThreshold.findMany({ where });
        return formatResult(thresholds);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- check_brand_health ---
  server.registerTool(
    "check_brand_health",
    {
      description:
        "Comprehensive brand health check: aggregates latest scores, active signals, social health, and freshness.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
      },
    },
    async (args) => {
      try {
        const { db } = await import("~/server/db");
        const { getStrategyFreshnessReport } = await import(
          "~/server/services/freshness-checker"
        );
        const strategyId = await resolveStrategyId(args.strategyId, ctx);

        const [strategy, latestScores, activeSignals, socialChannels, freshnessReport] =
          await Promise.all([
            db.strategy.findUniqueOrThrow({
              where: { id: strategyId },
              select: {
                brandName: true,
                coherenceScore: true,
              },
            }),
            db.scoreSnapshot.findFirst({
              where: { strategyId },
              orderBy: { createdAt: "desc" },
            }),
            db.signal.findMany({
              where: { strategyId, status: "ACTIVE" },
              orderBy: { createdAt: "desc" },
              take: 10,
            }),
            db.socialChannel.findMany({
              where: { strategyId },
            }),
            getStrategyFreshnessReport(strategyId),
          ]);

        return formatResult({
          brand: strategy.brandName,
          coherenceScore: strategy.coherenceScore,
          latestSnapshot: latestScores,
          activeSignals: {
            count: activeSignals.length,
            signals: activeSignals,
          },
          socialHealth: {
            channels: socialChannels.length,
            data: socialChannels,
          },
          freshness: freshnessReport.summary,
        });
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_decisions ---
  server.registerTool(
    "get_decisions",
    {
      description: "Get strategic decisions logged for a strategy.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        status: z.string().optional().describe("Filter by status"),
      },
    },
    async (args) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const where: Record<string, unknown> = { strategyId };
        if (args.status) where.status = args.status;
        const decisions = await db.decision.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 50,
        });
        return formatResult(decisions);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // =========================================================================
  // RESOURCES
  // =========================================================================

  // --- cult-index ---
  server.registerResource(
    "cult-index",
    new ResourceTemplate("advertis://strategy/{strategyId}/cult-index", {
      list: undefined,
    }),
    { description: "Latest Cult Index snapshot for a strategy" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(variables.strategyId as string, ctx);
        const snapshot = await db.cultIndexSnapshot.findFirst({
          where: { strategyId },
          orderBy: { createdAt: "desc" },
        });
        return formatResource(uri.toString(), snapshot);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- signals ---
  server.registerResource(
    "signals",
    new ResourceTemplate("advertis://strategy/{strategyId}/signals", {
      list: undefined,
    }),
    { description: "All active brand signals" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(variables.strategyId as string, ctx);
        const signals = await db.signal.findMany({
          where: { strategyId, status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        });
        return formatResource(uri.toString(), signals);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- social channels ---
  server.registerResource(
    "social-channels",
    new ResourceTemplate("advertis://strategy/{strategyId}/social-channels", {
      list: undefined,
    }),
    { description: "Social channel health data" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(variables.strategyId as string, ctx);
        const channels = await db.socialChannel.findMany({
          where: { strategyId },
        });
        return formatResource(uri.toString(), channels);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- community ---
  server.registerResource(
    "community",
    new ResourceTemplate("advertis://strategy/{strategyId}/community", {
      list: undefined,
    }),
    { description: "Latest community snapshot (membership, growth, retention)" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(variables.strategyId as string, ctx);
        const snapshot = await db.communitySnapshot.findFirst({
          where: { strategyId },
          orderBy: { periodStart: "desc" },
        });
        return formatResource(uri.toString(), snapshot);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- superfans ---
  server.registerResource(
    "superfans",
    new ResourceTemplate("advertis://strategy/{strategyId}/superfans", {
      list: undefined,
    }),
    { description: "Superfan profiles with engagement metrics" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(variables.strategyId as string, ctx);
        const fans = await db.superfanProfile.findMany({
          where: { strategyId },
          orderBy: { engagementDepth: "desc" },
          take: 100,
        });
        return formatResource(uri.toString(), fans);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- competitors ---
  server.registerResource(
    "competitors",
    new ResourceTemplate("advertis://strategy/{strategyId}/competitors", {
      list: undefined,
    }),
    { description: "Competitor snapshots and analysis" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(variables.strategyId as string, ctx);
        const competitors = await db.competitorSnapshot.findMany({
          where: { strategyId },
          orderBy: { lastUpdated: "desc" },
        });
        return formatResource(uri.toString(), competitors);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- opportunities ---
  server.registerResource(
    "opportunities",
    new ResourceTemplate("advertis://strategy/{strategyId}/opportunities", {
      list: undefined,
    }),
    { description: "Opportunity calendar entries (events, seasons, cultural moments)" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(variables.strategyId as string, ctx);
        const opportunities = await db.opportunityCalendar.findMany({
          where: { strategyId },
          orderBy: { startDate: "asc" },
        });
        return formatResource(uri.toString(), opportunities);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );
}
