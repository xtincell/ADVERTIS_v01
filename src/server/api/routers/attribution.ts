// =============================================================================
// ROUTER T.32 — Attribution (Channel Attribution)
// Multi-touch attribution tracking and analysis.
// =============================================================================

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, roleProtectedProcedure } from "~/server/api/trpc";

export const attributionRouter = createTRPCRouter({
  // ── Get attribution summary per channel ──────────────────────────────────
  getChannelSummary: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        model: z.string().default("LINEAR"),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        strategyId: input.strategyId,
      };
      if (input.from || input.to) {
        const dateFilter: Record<string, Date> = {};
        if (input.from) dateFilter.gte = input.from;
        if (input.to) dateFilter.lte = input.to;
        where.occurredAt = dateFilter;
      }

      const events = await ctx.db.attributionEvent.findMany({ where });

      // Aggregate by channel
      const channels: Record<string, {
        channel: string;
        impressions: number;
        clicks: number;
        engagements: number;
        conversions: number;
        revenue: number;
        events: number;
      }> = {};

      for (const evt of events) {
        if (!channels[evt.channel]) {
          channels[evt.channel] = {
            channel: evt.channel,
            impressions: 0,
            clicks: 0,
            engagements: 0,
            conversions: 0,
            revenue: 0,
            events: 0,
          };
        }
        const ch = channels[evt.channel]!;
        ch.events++;

        switch (evt.eventType) {
          case "IMPRESSION": ch.impressions++; break;
          case "CLICK": ch.clicks++; break;
          case "ENGAGEMENT": ch.engagements++; break;
          case "CONVERSION": ch.conversions++; break;
          case "REVENUE": ch.revenue += evt.value * evt.weight; break;
        }
      }

      const summary = Object.values(channels).sort((a, b) => b.revenue - a.revenue);
      const totalRevenue = summary.reduce((s, c) => s + c.revenue, 0);
      const totalConversions = summary.reduce((s, c) => s + c.conversions, 0);

      return {
        model: input.model,
        channels: summary,
        totalRevenue,
        totalConversions,
        totalEvents: events.length,
      };
    }),

  // ── Get attribution flow (funnel: impression → click → engagement → conversion → revenue) ──
  getFunnel: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        channel: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        strategyId: input.strategyId,
      };
      if (input.channel) where.channel = input.channel;

      const events = await ctx.db.attributionEvent.findMany({ where });

      const funnel = {
        impressions: events.filter((e) => e.eventType === "IMPRESSION").length,
        clicks: events.filter((e) => e.eventType === "CLICK").length,
        engagements: events.filter((e) => e.eventType === "ENGAGEMENT").length,
        conversions: events.filter((e) => e.eventType === "CONVERSION").length,
        revenue: events
          .filter((e) => e.eventType === "REVENUE")
          .reduce((s, e) => s + e.value, 0),
      };

      return funnel;
    }),

  // ── Log attribution event ────────────────────────────────────────────────
  logEvent: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(
      z.object({
        strategyId: z.string(),
        eventType: z.enum(["IMPRESSION", "CLICK", "ENGAGEMENT", "CONVERSION", "REVENUE"]),
        channel: z.string(),
        touchpoint: z.string().optional(),
        campaignTag: z.string().optional(),
        value: z.number().min(0).default(0),
        weight: z.number().min(0).max(1).default(1),
        model: z.string().default("LINEAR"),
        sessionId: z.string().optional(),
        superfanId: z.string().optional(),
        metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
        occurredAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.attributionEvent.create({
        data: {
          strategyId: input.strategyId,
          eventType: input.eventType,
          channel: input.channel,
          touchpoint: input.touchpoint,
          campaignTag: input.campaignTag,
          value: input.value,
          weight: input.weight,
          model: input.model,
          sessionId: input.sessionId,
          superfanId: input.superfanId,
          metadata: input.metadata ? (input.metadata as Record<string, string | number | boolean>) : undefined,
          occurredAt: input.occurredAt ?? new Date(),
        },
      });
    }),

  // ── Batch log events ─────────────────────────────────────────────────────
  logBatch: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(
      z.object({
        events: z.array(
          z.object({
            strategyId: z.string(),
            eventType: z.enum(["IMPRESSION", "CLICK", "ENGAGEMENT", "CONVERSION", "REVENUE"]),
            channel: z.string(),
            touchpoint: z.string().optional(),
            campaignTag: z.string().optional(),
            value: z.number().min(0).default(0),
            weight: z.number().min(0).max(1).default(1),
            model: z.string().default("LINEAR"),
            occurredAt: z.date().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.attributionEvent.createMany({
        data: input.events.map((evt) => ({
          ...evt,
          metadata: undefined,
          occurredAt: evt.occurredAt ?? new Date(),
        })),
      });
      return { count: result.count };
    }),

  // ── Get time series (events over time) ───────────────────────────────────
  getTimeSeries: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        channel: z.string().optional(),
        granularity: z.enum(["DAY", "WEEK", "MONTH"]).default("DAY"),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        strategyId: input.strategyId,
      };
      if (input.channel) where.channel = input.channel;
      if (input.from || input.to) {
        const dateFilter: Record<string, Date> = {};
        if (input.from) dateFilter.gte = input.from;
        if (input.to) dateFilter.lte = input.to;
        where.occurredAt = dateFilter;
      }

      const events = await ctx.db.attributionEvent.findMany({
        where,
        orderBy: { occurredAt: "asc" },
      });

      // Group by time bucket
      const buckets: Record<string, { conversions: number; revenue: number; events: number }> = {};
      for (const evt of events) {
        const date = evt.occurredAt;
        let key: string;
        if (input.granularity === "MONTH") {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        } else if (input.granularity === "WEEK") {
          const d = new Date(date);
          d.setDate(d.getDate() - d.getDay());
          key = d.toISOString().split("T")[0]!;
        } else {
          key = date.toISOString().split("T")[0]!;
        }

        if (!buckets[key]) buckets[key] = { conversions: 0, revenue: 0, events: 0 };
        buckets[key]!.events++;
        if (evt.eventType === "CONVERSION") buckets[key]!.conversions++;
        if (evt.eventType === "REVENUE") buckets[key]!.revenue += evt.value;
      }

      return Object.entries(buckets)
        .map(([period, data]) => ({ period, ...data }))
        .sort((a, b) => a.period.localeCompare(b.period));
    }),
});
