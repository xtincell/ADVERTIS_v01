import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { REPORT_TYPES } from "~/lib/constants";

export const documentRouter = createTRPCRouter({
  /**
   * Get all documents for a strategy. Verifies ownership.
   */
  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
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

      const documents = await ctx.db.document.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { createdAt: "asc" },
      });

      return documents;
    }),

  /**
   * Get a single document by ID. Verifies ownership via strategy.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.db.document.findUnique({
        where: { id: input.id },
        include: {
          strategy: {
            select: { userId: true },
          },
        },
      });

      if (!document || document.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document non trouvé",
        });
      }

      return document;
    }),

  /**
   * Get document generation status for a strategy.
   * Returns a lightweight summary of all documents.
   */
  getStatus: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
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

      const documents = await ctx.db.document.findMany({
        where: { strategyId: input.strategyId },
        select: {
          id: true,
          type: true,
          title: true,
          status: true,
          pageCount: true,
          errorMessage: true,
          generatedAt: true,
        },
        orderBy: { createdAt: "asc" },
      });

      return documents;
    }),

  /**
   * Regenerate a single section of a document.
   * Only works on completed documents.
   */
  regenerateSection: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        sectionIndex: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.document.findUnique({
        where: { id: input.documentId },
        include: {
          strategy: {
            select: { userId: true },
          },
        },
      });

      if (!document || document.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document non trouvé",
        });
      }

      if (document.status !== "complete") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Le document doit être complet avant de pouvoir régénérer une section",
        });
      }

      const sections = document.sections as Array<{
        title: string;
        content: string;
        order: number;
        wordCount: number;
      }> | null;

      if (
        !sections ||
        input.sectionIndex < 0 ||
        input.sectionIndex >= sections.length
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Index de section invalide",
        });
      }

      // Mark as regenerating (keep existing content visible)
      await ctx.db.document.update({
        where: { id: input.documentId },
        data: { status: "generating" },
      });

      // Note: actual regeneration will be triggered via the /api/ai/generate endpoint
      // This mutation just marks the document for regeneration

      return { success: true, sectionIndex: input.sectionIndex };
    }),

  /**
   * Delete a document. Verifies ownership.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.document.findUnique({
        where: { id: input.id },
        include: {
          strategy: {
            select: { userId: true },
          },
        },
      });

      if (!document || document.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document non trouvé",
        });
      }

      await ctx.db.document.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
