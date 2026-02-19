import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getAllWidgets, getWidget } from "~/server/services/widgets/registry";
import { computeWidget, computeAllWidgets } from "~/server/services/widgets/compute-engine";

// Auto-register widget implementations
import "~/server/services/widgets/implementations/superfan-tracker";
import "~/server/services/widgets/implementations/campaign-tracker";
import "~/server/services/widgets/implementations/da-visual-identity";
import "~/server/services/widgets/implementations/codb-calculator";

export const widgetRouter = createTRPCRouter({
  /**
   * List all registered widgets with availability status for a strategy.
   */
  listAvailable: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        include: {
          pillars: { select: { type: true, status: true } },
          cockpitWidgets: true,
        },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      const completedPillars = strategy.pillars
        .filter((p) => p.status === "complete")
        .map((p) => p.type);

      return getAllWidgets().map((w) => {
        const existing = strategy.cockpitWidgets.find(
          (cw) => cw.widgetType === w.descriptor.id,
        );
        const available = w.descriptor.requiredPillars.every((p) =>
          completedPillars.includes(p),
        );

        return {
          ...w.descriptor,
          // Strip outputSchema from response (not serializable)
          outputSchema: undefined,
          available,
          status: existing?.status ?? "pending",
          computedAt: existing?.computedAt,
        };
      });
    }),

  /**
   * Compute (or recompute) a single widget for a strategy.
   */
  compute: protectedProcedure
    .input(
      z.object({
        widgetId: z.string(),
        strategyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const handler = getWidget(input.widgetId);
      if (!handler) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Widget non trouvé : ${input.widgetId}`,
        });
      }

      // Verify ownership
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

      const result = await computeWidget(input.widgetId, input.strategyId);

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error ?? "Erreur de calcul du widget",
        });
      }

      return { success: true };
    }),

  /**
   * Get cached widget data.
   */
  getData: protectedProcedure
    .input(
      z.object({
        widgetId: z.string(),
        strategyId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const widget = await ctx.db.cockpitWidget.findUnique({
        where: {
          strategyId_widgetType: {
            strategyId: input.strategyId,
            widgetType: input.widgetId,
          },
        },
        include: {
          strategy: { select: { userId: true } },
        },
      });

      if (!widget || widget.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Widget non trouvé",
        });
      }

      return {
        widgetType: widget.widgetType,
        status: widget.status,
        data: widget.data,
        computedAt: widget.computedAt,
        errorMessage: widget.errorMessage,
      };
    }),

  /**
   * Compute all available widgets for a strategy.
   */
  computeAll: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

      return computeAllWidgets(input.strategyId);
    }),
});
