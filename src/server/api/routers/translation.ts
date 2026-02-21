// =============================================================================
// ROUTER T.10 — Translation Router
// =============================================================================
// Brief translation operations (Couche 2 of ADVERTIS architecture).
// CRUD for TranslationDocuments + brief generation + preset management.
// Composed of 2 sub-routers: documents and presets.
//
// Sub-routers:
//   documents — getByStrategy, getById, generate, generateFromPreset,
//               bulkGenerate, regenerate, updateStatus, delete, getFreshness
//   presets   — getAll, create, update, delete, seedDefaults
//
// Helpers:
//   verifyStrategyOwnership — Shared ownership check
//
// Dependencies:
//   ~/server/api/trpc                     — createTRPCRouter, protectedProcedure
//   ~/lib/types/phase2-schemas            — GenerateBriefSchema, GenerateFromPresetSchema,
//                                           BulkGenerateSchema, UpdateTranslationSchema,
//                                           CreatePresetSchema, UpdatePresetSchema
//   ~/lib/constants                       — SYSTEM_PRESETS, BRIEF_TYPES
//   ~/server/services/translation-generator — generateBrief, generateFromPreset,
//                                           bulkGenerate, regenerateBrief
//   ~/server/services/freshness-checker   — getStrategyFreshnessReport
//   ~/server/db                           — Prisma client (for helper typing)
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  GenerateBriefSchema,
  GenerateFromPresetSchema,
  BulkGenerateSchema,
  UpdateTranslationSchema,
  CreatePresetSchema,
  UpdatePresetSchema,
} from "~/lib/types/phase2-schemas";
import { SYSTEM_PRESETS, BRIEF_TYPES } from "~/lib/constants";
import { db as prismaDb } from "~/server/db";

import {
  generateBrief,
  generateFromPreset,
  bulkGenerate,
  regenerateBrief,
} from "~/server/services/translation-generator";
import { getStrategyFreshnessReport } from "~/server/services/freshness-checker";

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
// Documents sub-router
// ---------------------------------------------------------------------------

const documentsRouter = createTRPCRouter({
  /**
   * Get all TranslationDocuments for a strategy, with optional filters.
   */
  getByStrategy: protectedProcedure
    .input(
      z.object({
        strategyId: z.string().min(1),
        type: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      const where: Record<string, unknown> = { strategyId: input.strategyId };
      if (input.type) where.type = input.type;
      if (input.status) where.status = input.status;

      return ctx.db.translationDocument.findMany({
        where,
        orderBy: [{ type: "asc" }, { version: "desc" }],
        select: {
          id: true,
          type: true,
          version: true,
          status: true,
          staleReason: true,
          staleSince: true,
          sourcePillars: true,
          generatedAt: true,
          generatedBy: true,
          approvedBy: true,
          approvedAt: true,
          metadata: true,
          createdAt: true,
          // Exclude content for list view (can be large)
        },
      });
    }),

  /**
   * Get a single TranslationDocument with full content.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const doc = await ctx.db.translationDocument.findUnique({
        where: { id: input.id },
        include: {
          strategy: { select: { userId: true, vertical: true, brandName: true } },
        },
      });
      if (!doc || doc.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document non trouvé",
        });
      }
      return doc;
    }),

  /**
   * Generate a single brief.
   */
  generate: protectedProcedure
    .input(GenerateBriefSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      return generateBrief(
        input.strategyId,
        input.type,
        ctx.session.user.id,
        input.metadata,
      );
    }),

  /**
   * Generate all briefs from a preset.
   */
  generateFromPreset: protectedProcedure
    .input(GenerateFromPresetSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      return generateFromPreset(
        input.strategyId,
        input.presetId,
        ctx.session.user.id,
      );
    }),

  /**
   * Generate multiple briefs in parallel.
   */
  bulkGenerate: protectedProcedure
    .input(BulkGenerateSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      return bulkGenerate(
        input.strategyId,
        input.briefTypes,
        ctx.session.user.id,
      );
    }),

  /**
   * Regenerate an existing brief (new version).
   */
  regenerate: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.db.translationDocument.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document non trouvé" });
      }
      await verifyStrategyOwnership(ctx.db, doc.strategyId, ctx.session.user.id);

      return regenerateBrief(input.id, ctx.session.user.id);
    }),

  /**
   * Update document status (DRAFT→VALIDATED, approve, etc.).
   */
  updateStatus: protectedProcedure
    .input(UpdateTranslationSchema)
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.db.translationDocument.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document non trouvé" });
      }
      await verifyStrategyOwnership(ctx.db, doc.strategyId, ctx.session.user.id);

      const updateData: Record<string, unknown> = {};
      if (input.status) {
        updateData.status = input.status;
        // Clear stale fields when validating
        if (input.status === "VALIDATED") {
          updateData.staleReason = null;
          updateData.staleSince = null;
          updateData.approvedBy = input.approvedBy ?? ctx.session.user.id;
          updateData.approvedAt = new Date();
        }
      }
      if (input.content !== undefined) {
        updateData.content = input.content;
      }

      return ctx.db.translationDocument.update({
        where: { id: input.id },
        data: updateData,
      });
    }),

  /**
   * Delete a TranslationDocument.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.db.translationDocument.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document non trouvé" });
      }
      await verifyStrategyOwnership(ctx.db, doc.strategyId, ctx.session.user.id);

      await ctx.db.translationDocument.delete({ where: { id: input.id } });
      return { success: true };
    }),

  /**
   * Get freshness report for a strategy's documents.
   */
  getFreshness: protectedProcedure
    .input(z.object({ strategyId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return getStrategyFreshnessReport(input.strategyId);
    }),
});

// ---------------------------------------------------------------------------
// Presets sub-router
// ---------------------------------------------------------------------------

const presetsRouter = createTRPCRouter({
  /**
   * Get all presets (system + custom), optionally filtered by vertical.
   */
  getAll: protectedProcedure
    .input(z.object({ vertical: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input?.vertical) {
        where.OR = [
          { vertical: input.vertical },
          { vertical: null }, // Universal presets
        ];
      }

      return ctx.db.briefPreset.findMany({
        where,
        orderBy: [{ isSystem: "desc" }, { name: "asc" }],
      });
    }),

  /**
   * Create a custom preset.
   */
  create: protectedProcedure
    .input(CreatePresetSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.briefPreset.create({
        data: {
          name: input.name,
          description: input.description ?? null,
          briefTypes: input.briefTypes,
          vertical: input.vertical ?? null,
          isSystem: false,
          createdBy: ctx.session.user.id,
        },
      });
    }),

  /**
   * Update a preset (only custom, not system presets).
   */
  update: protectedProcedure
    .input(UpdatePresetSchema)
    .mutation(async ({ ctx, input }) => {
      const preset = await ctx.db.briefPreset.findUnique({
        where: { id: input.id },
      });
      if (!preset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Preset non trouvé" });
      }
      if (preset.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Impossible de modifier un preset système",
        });
      }

      const { id, ...data } = input;
      return ctx.db.briefPreset.update({
        where: { id },
        data,
      });
    }),

  /**
   * Delete a preset (only custom, not system presets).
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const preset = await ctx.db.briefPreset.findUnique({
        where: { id: input.id },
      });
      if (!preset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Preset non trouvé" });
      }
      if (preset.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Impossible de supprimer un preset système",
        });
      }

      await ctx.db.briefPreset.delete({ where: { id: input.id } });
      return { success: true };
    }),

  /**
   * Seed the 6 system presets from SYSTEM_PRESETS constant.
   */
  seedDefaults: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Delete existing system presets first
      await ctx.db.briefPreset.deleteMany({
        where: { isSystem: true },
      });

      const presets = SYSTEM_PRESETS.map((p) => ({
        name: p.name,
        description: p.description,
        briefTypes: p.briefTypes,
        vertical: p.vertical,
        isSystem: true,
        createdBy: ctx.session.user.id,
      }));

      await ctx.db.briefPreset.createMany({ data: presets });

      return ctx.db.briefPreset.findMany({
        where: { isSystem: true },
        orderBy: { name: "asc" },
      });
    }),
});

// ---------------------------------------------------------------------------
// Main translation router (combines sub-routers)
// ---------------------------------------------------------------------------

export const translationRouter = createTRPCRouter({
  documents: documentsRouter,
  presets: presetsRouter,
});
