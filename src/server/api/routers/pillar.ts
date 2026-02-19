import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { validatePillarContent } from "~/lib/types/pillar-parsers";
import { invalidateWidgetsForPillar } from "~/server/services/widgets/compute-engine";
import { recalculateAllScores } from "~/server/services/score-engine";

export const pillarRouter = createTRPCRouter({
  /**
   * Get all pillars for a strategy, ordered by `order`.
   * Verifies the strategy belongs to the current user.
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

      const pillars = await ctx.db.pillar.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { order: "asc" },
      });

      return pillars;
    }),

  /**
   * Get a single pillar by ID with its strategy.
   * Verifies ownership through the strategy.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const pillar = await ctx.db.pillar.findUnique({
        where: { id: input.id },
        include: {
          strategy: true,
        },
      });

      if (!pillar || pillar.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pilier non trouvé",
        });
      }

      return pillar;
    }),

  /**
   * Update pillar fields (content, summary, status).
   * Verifies ownership through the strategy.
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: z.any().optional() as z.ZodOptional<z.ZodType<any>>,
        summary: z.string().optional(),
        status: z
          .enum(["pending", "generating", "complete", "error"])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.pillar.findUnique({
        where: { id: input.id },
        include: {
          strategy: { select: { userId: true } },
        },
      });

      if (!existing || existing.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pilier non trouvé",
        });
      }

      // Soft validation: log warnings but still save (avoid data loss during edits)
      if (input.content !== undefined) {
        const validation = validatePillarContent(existing.type, input.content);
        if (!validation.success) {
          console.warn(
            `[Pillar Save] Validation warnings for pillar ${existing.type} (${existing.id}):`,
            validation.errors,
          );
        }
      }

      // Snapshot current content before overwriting (version history)
      if (input.content !== undefined && existing.content != null) {
        await ctx.db.pillarVersion.create({
          data: {
            pillarId: existing.id,
            version: existing.version,
            content: existing.content,
            summary: existing.summary,
            source: "manual_edit",
            createdBy: ctx.session.user.id,
          },
        });
      }

      const { id, ...data } = input;

      const pillar = await ctx.db.pillar.update({
        where: { id },
        data: {
          ...data,
          generatedAt:
            data.status === "complete" ? new Date() : undefined,
          // Increment version + reset staleness when content changes
          ...(input.content !== undefined
            ? { version: { increment: 1 }, staleReason: null, staleSince: null }
            : {}),
        },
      });

      // Invalidate cockpit widgets that depend on this pillar type
      if (input.content !== undefined) {
        void invalidateWidgetsForPillar(existing.strategyId, existing.type);
        // Recalculate all scores reactively on every content change
        void recalculateAllScores(existing.strategyId, "pillar_update");
      }

      return pillar;
    }),

  /**
   * Get all stale pillars for a strategy.
   * Returns pillars where staleReason is not null.
   */
  getStale: protectedProcedure
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

      const stalePillars = await ctx.db.pillar.findMany({
        where: {
          strategyId: input.strategyId,
          staleReason: { not: null },
        },
        orderBy: { order: "asc" },
      });

      return stalePillars;
    }),

  /**
   * Update pillar status with optional error message.
   * Verifies ownership through the strategy.
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "generating", "complete", "error"]),
        errorMessage: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.pillar.findUnique({
        where: { id: input.id },
        include: {
          strategy: { select: { userId: true } },
        },
      });

      if (!existing || existing.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pilier non trouvé",
        });
      }

      const pillar = await ctx.db.pillar.update({
        where: { id: input.id },
        data: {
          status: input.status,
          errorMessage:
            input.status === "error" ? input.errorMessage : null,
          generatedAt:
            input.status === "complete" ? new Date() : undefined,
        },
      });

      return pillar;
    }),

  /**
   * Get version history for a pillar.
   * Returns versions ordered by version DESC (newest first).
   */
  getVersions: protectedProcedure
    .input(
      z.object({
        pillarId: z.string(),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const pillar = await ctx.db.pillar.findUnique({
        where: { id: input.pillarId },
        include: {
          strategy: { select: { userId: true } },
        },
      });

      if (!pillar || pillar.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pilier non trouvé",
        });
      }

      const versions = await ctx.db.pillarVersion.findMany({
        where: { pillarId: input.pillarId },
        orderBy: { version: "desc" },
        take: input.limit,
        select: {
          id: true,
          version: true,
          source: true,
          changeNote: true,
          summary: true,
          createdBy: true,
          createdAt: true,
        },
      });

      return {
        currentVersion: pillar.version,
        versions,
      };
    }),

  /**
   * Restore pillar content from a previous version.
   * Snapshots current content first, then replaces with the selected version.
   */
  restoreVersion: protectedProcedure
    .input(
      z.object({
        pillarId: z.string(),
        versionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const pillar = await ctx.db.pillar.findUnique({
        where: { id: input.pillarId },
        include: {
          strategy: { select: { userId: true } },
        },
      });

      if (!pillar || pillar.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pilier non trouvé",
        });
      }

      const targetVersion = await ctx.db.pillarVersion.findUnique({
        where: { id: input.versionId },
      });

      if (!targetVersion || targetVersion.pillarId !== input.pillarId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Version non trouvée",
        });
      }

      // Snapshot current content before restoring
      if (pillar.content != null) {
        await ctx.db.pillarVersion.create({
          data: {
            pillarId: pillar.id,
            version: pillar.version,
            content: pillar.content,
            summary: pillar.summary,
            source: "restore",
            changeNote: `Avant restauration vers la version ${targetVersion.version}`,
            createdBy: ctx.session.user.id,
          },
        });
      }

      // Restore content from target version
      const updated = await ctx.db.pillar.update({
        where: { id: input.pillarId },
        data: {
          content: targetVersion.content ?? undefined,
          summary: targetVersion.summary,
          version: { increment: 1 },
          staleReason: null,
          staleSince: null,
        },
      });

      // Invalidate widgets + recalculate scores
      void invalidateWidgetsForPillar(pillar.strategyId, pillar.type);
      void recalculateAllScores(pillar.strategyId, "pillar_update");

      return updated;
    }),
});
