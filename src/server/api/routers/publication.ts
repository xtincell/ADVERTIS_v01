// =============================================================================
// ROUTER T.28 — Publication (Editorial Calendar)
// CRUD + calendar + stats for content publication management.
// =============================================================================

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, roleProtectedProcedure } from "~/server/api/trpc";

export const publicationRouter = createTRPCRouter({
  // ── List publications with filters ───────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        status: z.string().optional(),
        channel: z.string().optional(),
        contentType: z.string().optional(),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        strategyId: input.strategyId,
      };
      if (input.status) where.status = input.status;
      if (input.channel) where.channel = input.channel;
      if (input.contentType) where.contentType = input.contentType;

      // Date range filter
      if (input.from || input.to) {
        const dateFilter: Record<string, Date> = {};
        if (input.from) dateFilter.gte = input.from;
        if (input.to) dateFilter.lte = input.to;
        where.scheduledAt = dateFilter;
      }

      return ctx.db.publication.findMany({
        where,
        orderBy: [
          { scheduledAt: "asc" },
          { createdAt: "desc" },
        ],
      });
    }),

  // ── Calendar view: publications grouped by week ──────────────────────────
  getCalendar: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        month: z.number().int().min(1).max(12),
        year: z.number().int(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59);

      const publications = await ctx.db.publication.findMany({
        where: {
          strategyId: input.strategyId,
          OR: [
            { scheduledAt: { gte: startDate, lte: endDate } },
            { publishedAt: { gte: startDate, lte: endDate } },
            {
              scheduledAt: null,
              createdAt: { gte: startDate, lte: endDate },
              status: { in: ["IDEA", "DRAFT", "REVIEW"] },
            },
          ],
        },
        orderBy: { scheduledAt: "asc" },
      });

      // Group by day
      const byDay: Record<string, typeof publications> = {};
      for (const pub of publications) {
        const date = pub.scheduledAt ?? pub.publishedAt ?? pub.createdAt;
        const key = date.toISOString().split("T")[0]!;
        if (!byDay[key]) byDay[key] = [];
        byDay[key]!.push(pub);
      }

      return {
        month: input.month,
        year: input.year,
        publications,
        byDay,
        total: publications.length,
      };
    }),

  // ── Stats per strategy ───────────────────────────────────────────────────
  getStats: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const publications = await ctx.db.publication.findMany({
        where: { strategyId: input.strategyId },
      });

      const total = publications.length;
      const published = publications.filter((p) => p.status === "PUBLISHED").length;
      const scheduled = publications.filter((p) => p.status === "SCHEDULED").length;
      const inPipeline = publications.filter((p) =>
        ["IDEA", "DRAFT", "REVIEW", "APPROVED"].includes(p.status),
      ).length;

      // Per channel
      const perChannel: Record<string, number> = {};
      for (const pub of publications) {
        perChannel[pub.channel] = (perChannel[pub.channel] ?? 0) + 1;
      }

      // Per content type
      const perType: Record<string, number> = {};
      for (const pub of publications) {
        perType[pub.contentType] = (perType[pub.contentType] ?? 0) + 1;
      }

      // Aggregate reach & engagement for published
      const publishedPubs = publications.filter((p) => p.status === "PUBLISHED");
      const totalReach = publishedPubs.reduce((s, p) => s + (p.reach ?? 0), 0);
      const totalEngagement = publishedPubs.reduce((s, p) => s + (p.engagement ?? 0), 0);

      return {
        total,
        published,
        scheduled,
        inPipeline,
        totalReach,
        totalEngagement,
        perChannel,
        perType,
      };
    }),

  // ── Get single publication ───────────────────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.publication.findUnique({
        where: { id: input.id },
      });
    }),

  // ── Create publication ───────────────────────────────────────────────────
  create: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(
      z.object({
        strategyId: z.string(),
        title: z.string().min(1),
        body: z.string().optional(),
        contentType: z.string().default("POST"),
        format: z.string().optional(), // image, video, carousel, text, link
        channel: z.string().default("INSTAGRAM"),
        scheduledAt: z.date().optional(),
        aarrStage: z.string().optional(),
        campaignTag: z.string().optional(),
        tags: z.array(z.string()).optional(),
        mediaUrls: z.array(z.string().url()).optional(),
        pillar: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.publication.create({
        data: {
          strategyId: input.strategyId,
          userId: ctx.session.user.id,
          title: input.title,
          body: input.body,
          contentType: input.contentType,
          format: input.format,
          channel: input.channel,
          scheduledAt: input.scheduledAt,
          status: input.scheduledAt ? "SCHEDULED" : "IDEA",
          aarrStage: input.aarrStage,
          campaignTag: input.campaignTag,
          tags: input.tags ?? undefined,
          mediaUrls: input.mediaUrls ?? undefined,
          pillar: input.pillar,
          notes: input.notes,
        },
      });
    }),

  // ── Update publication ───────────────────────────────────────────────────
  update: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        body: z.string().optional(),
        contentType: z.string().optional(),
        format: z.string().optional(),
        channel: z.string().optional(),
        scheduledAt: z.date().optional(),
        status: z.string().optional(),
        aarrStage: z.string().optional(),
        campaignTag: z.string().optional(),
        tags: z.array(z.string()).optional(),
        mediaUrls: z.array(z.string().url()).optional(),
        pillar: z.string().optional(),
        notes: z.string().optional(),
        // Post-publish metrics
        reach: z.number().int().optional(),
        impressions: z.number().int().optional(),
        engagement: z.number().int().optional(),
        clicks: z.number().int().optional(),
        shares: z.number().int().optional(),
        saves: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, tags, mediaUrls, ...data } = input;

      const updateData: Record<string, unknown> = { ...data };
      if (tags) updateData.tags = tags;
      if (mediaUrls) updateData.mediaUrls = mediaUrls;

      // Auto-set publishedAt when transitioning to PUBLISHED
      if (data.status === "PUBLISHED") {
        updateData.publishedAt = new Date();
      }

      return ctx.db.publication.update({
        where: { id },
        data: updateData,
      });
    }),

  // ── Delete publication ───────────────────────────────────────────────────
  delete: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.publication.delete({
        where: { id: input.id },
      });
    }),
});
