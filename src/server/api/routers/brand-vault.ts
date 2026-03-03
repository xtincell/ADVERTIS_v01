// =============================================================================
// ROUTER T.33 — Brand Vault (Brand Asset Library)
// CRUD + search for centralized brand asset management.
// =============================================================================

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, roleProtectedProcedure } from "~/server/api/trpc";

export const brandVaultRouter = createTRPCRouter({
  // ── List assets with filters ─────────────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        category: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        strategyId: input.strategyId,
        isLatest: true, // Only show latest versions
      };
      if (input.category) where.category = input.category;
      if (input.status) where.status = input.status;
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      return ctx.db.brandAsset.findMany({
        where,
        orderBy: [{ category: "asc" }, { updatedAt: "desc" }],
      });
    }),

  // ── Get asset by ID ──────────────────────────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.brandAsset.findUnique({
        where: { id: input.id },
      });
    }),

  // ── Get asset versions ───────────────────────────────────────────────────
  getVersions: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db.brandAsset.findUnique({
        where: { id: input.assetId },
      });
      if (!asset) return [];

      // Find all versions by following parentId chain + finding children
      const allVersions = await ctx.db.brandAsset.findMany({
        where: {
          strategyId: asset.strategyId,
          name: asset.name,
          category: asset.category,
        },
        orderBy: { version: "desc" },
      });

      return allVersions;
    }),

  // ── Stats per strategy ───────────────────────────────────────────────────
  getStats: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const assets = await ctx.db.brandAsset.findMany({
        where: { strategyId: input.strategyId, isLatest: true },
      });

      const total = assets.length;
      const active = assets.filter((a) => a.status === "ACTIVE").length;
      const totalSize = assets.reduce((s, a) => s + a.fileSize, 0);

      // Per category
      const perCategory: Record<string, number> = {};
      for (const asset of assets) {
        perCategory[asset.category] = (perCategory[asset.category] ?? 0) + 1;
      }

      // Per file type
      const perFileType: Record<string, number> = {};
      for (const asset of assets) {
        const ext = asset.fileType.split("/")[1] ?? asset.fileType;
        perFileType[ext] = (perFileType[ext] ?? 0) + 1;
      }

      return {
        total,
        active,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        perCategory,
        perFileType,
      };
    }),

  // ── Create asset ─────────────────────────────────────────────────────────
  create: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(
      z.object({
        strategyId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().default("OTHER"),
        subcategory: z.string().optional(),
        fileUrl: z.string().url(),
        fileType: z.string(),
        fileSize: z.number().int().min(0).default(0),
        thumbnailUrl: z.string().url().optional(),
        tags: z.array(z.string()).optional(),
        dimensions: z.object({ width: z.number(), height: z.number() }).optional(),
        colorProfile: z.object({ primary: z.string(), secondary: z.string().optional() }).optional(),
        usageRights: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.brandAsset.create({
        data: {
          strategyId: input.strategyId,
          userId: ctx.session.user.id,
          name: input.name,
          description: input.description,
          category: input.category,
          subcategory: input.subcategory,
          fileUrl: input.fileUrl,
          fileType: input.fileType,
          fileSize: input.fileSize,
          thumbnailUrl: input.thumbnailUrl,
          tags: input.tags ?? undefined,
          dimensions: input.dimensions ?? undefined,
          colorProfile: input.colorProfile ?? undefined,
          usageRights: input.usageRights,
        },
      });
    }),

  // ── Update asset ─────────────────────────────────────────────────────────
  update: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        tags: z.array(z.string()).optional(),
        status: z.string().optional(),
        usageRights: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, tags, ...data } = input;
      return ctx.db.brandAsset.update({
        where: { id },
        data: {
          ...data,
          tags: tags ?? undefined,
        },
      });
    }),

  // ── Upload new version ───────────────────────────────────────────────────
  uploadVersion: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(
      z.object({
        parentId: z.string(),
        fileUrl: z.string().url(),
        fileType: z.string(),
        fileSize: z.number().int().min(0).default(0),
        thumbnailUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const parent = await ctx.db.brandAsset.findUniqueOrThrow({
        where: { id: input.parentId },
      });

      // Use transaction to atomically mark parent as not latest + create new version
      const [, newVersion] = await ctx.db.$transaction([
        ctx.db.brandAsset.update({
          where: { id: input.parentId },
          data: { isLatest: false },
        }),
        ctx.db.brandAsset.create({
          data: {
            strategyId: parent.strategyId,
            userId: ctx.session.user.id,
            name: parent.name,
            description: parent.description,
            category: parent.category,
            subcategory: parent.subcategory,
            fileUrl: input.fileUrl,
            fileType: input.fileType,
            fileSize: input.fileSize,
            thumbnailUrl: input.thumbnailUrl,
            tags: parent.tags ?? undefined,
            dimensions: parent.dimensions ?? undefined,
            colorProfile: parent.colorProfile ?? undefined,
            usageRights: parent.usageRights,
            version: parent.version + 1,
            parentId: parent.id,
            isLatest: true,
          },
        }),
      ]);

      return newVersion;
    }),

  // ── Delete asset ─────────────────────────────────────────────────────────
  delete: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.brandAsset.delete({ where: { id: input.id } });
    }),
});

function formatFileSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`;
  return `${bytes} B`;
}
