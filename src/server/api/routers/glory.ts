// =============================================================================
// ROUTER T.GLORY — Glory Operational Tools Router
// =============================================================================
// tRPC router for the GLORY platform. Provides tool listing, AI generation,
// and output management (CRUD for persisted outputs).
//
// Procedures:
//   listTools       — List all registered GLORY tools (optionally by layer)
//   generate        — Generate AI output for a tool + strategy
//   getOutputs      — List persisted outputs (filterable by strategy/tool)
//   getOutput       — Get a single output by ID
//   deleteOutput    — Delete a persisted output
//   toggleFavorite  — Toggle favorite status on an output
//
// Dependencies:
//   ~/server/api/trpc                       — createTRPCRouter, protectedProcedure
//   ~/server/services/glory/registry        — getAllTools, getToolsByLayer
//   ~/server/services/glory/generation      — generateGloryOutput
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getAllTools, getToolsByLayer } from "~/server/services/glory/registry";
import { generateGloryOutput } from "~/server/services/glory/generation";
import { enrichFields } from "~/server/services/glory/field-enricher";

export const gloryRouter = createTRPCRouter({
  /**
   * List all registered GLORY tools, optionally filtered by layer.
   */
  listTools: protectedProcedure
    .input(
      z
        .object({
          layer: z.enum(["CR", "DC", "HYBRID"]).optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      const tools = input?.layer
        ? getToolsByLayer(input.layer)
        : getAllTools();

      return tools.map((t) => ({
        slug: t.slug,
        name: t.name,
        shortName: t.shortName,
        layer: t.layer,
        description: t.description,
        icon: t.icon,
        persistable: t.persistable,
        inputs: t.inputs,
        requiredPillars: t.requiredPillars,
        outputFormat: t.outputFormat,
      }));
    }),

  /**
   * Generate AI output for a GLORY tool.
   */
  generate: protectedProcedure
    .input(
      z.object({
        toolSlug: z.string(),
        strategyId: z.string(),
        inputs: z.record(z.unknown()),
        save: z.boolean().default(false),
        title: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify strategy ownership
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

      try {
        const result = await generateGloryOutput({
          toolSlug: input.toolSlug,
          strategyId: input.strategyId,
          userInputs: input.inputs,
          userId: ctx.session.user.id,
          save: input.save,
          title: input.title,
        });

        return result;
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "Erreur lors de la génération GLORY",
        });
      }
    }),

  /**
   * List persisted GLORY outputs with optional filters.
   */
  getOutputs: protectedProcedure
    .input(
      z.object({
        strategyId: z.string().optional(),
        toolSlug: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        createdBy: ctx.session.user.id,
      };
      if (input.strategyId) where.strategyId = input.strategyId;
      if (input.toolSlug) where.toolSlug = input.toolSlug;
      if (input.cursor) {
        where.id = { lt: input.cursor };
      }

      const outputs = await ctx.db.gloryOutput.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        include: {
          strategy: {
            select: { brandName: true, sector: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (outputs.length > input.limit) {
        const next = outputs.pop();
        nextCursor = next?.id;
      }

      return { outputs, nextCursor };
    }),

  /**
   * Get a single persisted output by ID.
   */
  getOutput: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const output = await ctx.db.gloryOutput.findUnique({
        where: { id: input.id },
        include: {
          strategy: {
            select: { brandName: true, sector: true, id: true },
          },
        },
      });

      if (!output || output.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Output non trouvé",
        });
      }

      return output;
    }),

  /**
   * Delete a persisted output.
   */
  deleteOutput: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const output = await ctx.db.gloryOutput.findUnique({
        where: { id: input.id },
        select: { createdBy: true },
      });

      if (!output || output.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Output non trouvé",
        });
      }

      await ctx.db.gloryOutput.delete({ where: { id: input.id } });
      return { success: true };
    }),

  /**
   * List GLORY outputs available for attaching to mission deliverables.
   * Returns completed outputs for a given strategy, optimized for picker UI.
   */
  listForPicker: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        toolSlug: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.gloryOutput.findMany({
        where: {
          strategyId: input.strategyId,
          createdBy: ctx.session.user.id,
          status: "complete",
          ...(input.toolSlug ? { toolSlug: input.toolSlug } : {}),
        },
        select: {
          id: true,
          toolSlug: true,
          layer: true,
          title: true,
          isFavorite: true,
          createdAt: true,
        },
        orderBy: [{ isFavorite: "desc" }, { createdAt: "desc" }],
        take: 50,
      });
    }),

  /**
   * Get field enrichment data for a GLORY tool form.
   * Returns suggestions, default values, dynamic options per field.
   */
  getFieldEnrichment: protectedProcedure
    .input(
      z.object({
        toolSlug: z.string(),
        strategyId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify strategy ownership
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

      return enrichFields(input.toolSlug, input.strategyId, ctx.db);
    }),

  /**
   * Toggle favorite status on an output.
   */
  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const output = await ctx.db.gloryOutput.findUnique({
        where: { id: input.id },
        select: { createdBy: true, isFavorite: true },
      });

      if (!output || output.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Output non trouvé",
        });
      }

      const updated = await ctx.db.gloryOutput.update({
        where: { id: input.id },
        data: { isFavorite: !output.isFavorite },
      });

      return { isFavorite: updated.isFavorite };
    }),
});
