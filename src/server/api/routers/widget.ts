// =============================================================================
// ROUTER T.5 — Widget Router
// =============================================================================
// Widget computation + listing for cockpit dashboard widgets.
// Auto-registers widget implementations on import.
//
// Procedures:
//   listAvailable — List all registered widgets with availability status
//   compute       — Compute (or recompute) a single widget for a strategy
//   getData       — Get cached widget data
//   computeAll    — Compute all available widgets for a strategy
//
// Auto-registered implementations:
//   superfan-tracker, campaign-tracker, da-visual-identity, codb-calculator,
//   superfan-ladder-widget, conversion-funnel-widget, narrative-health-widget
//
// Dependencies:
//   ~/server/api/trpc                        — createTRPCRouter, protectedProcedure
//   ~/server/services/widgets/registry       — getAllWidgets, getWidget
//   ~/server/services/widgets/compute-engine — computeWidget, computeAllWidgets
// =============================================================================

import { z } from "zod";
import { createTRPCRouter, strategyProcedure } from "~/server/api/trpc";
import { AppErrors, throwNotFound, throwInternal } from "~/server/errors";
import { getAllWidgets, getWidget } from "~/server/services/widgets/registry";
import { computeWidget, computeAllWidgets } from "~/server/services/widgets/compute-engine";

// Auto-register widget implementations
import "~/server/services/widgets/implementations/superfan-tracker";
import "~/server/services/widgets/implementations/campaign-tracker";
import "~/server/services/widgets/implementations/da-visual-identity";
import "~/server/services/widgets/implementations/codb-calculator";
// Phase 8 — ARTEMIS Conversion Engine widgets
import "~/server/services/widgets/implementations/superfan-ladder-widget";
import "~/server/services/widgets/implementations/conversion-funnel-widget";
import "~/server/services/widgets/implementations/narrative-health-widget";
// Phase 9 — Financial & Partnerships widgets
import "~/server/services/widgets/implementations/financial-health-widget";

export const widgetRouter = createTRPCRouter({
  /**
   * List all registered widgets with availability status for a strategy.
   */
  listAvailable: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx }) => {
      // ctx.strategy is ownership-verified; re-query with includes
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: ctx.strategy.id },
        include: {
          pillars: { select: { type: true, status: true } },
          cockpitWidgets: true,
        },
      });

      if (!strategy) throwNotFound(AppErrors.STRATEGY_NOT_FOUND);

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
  compute: strategyProcedure
    .input(
      z.object({
        widgetId: z.string(),
        strategyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // ctx.strategy is ownership-verified
      const handler = getWidget(input.widgetId);
      if (!handler) {
        throwNotFound(AppErrors.WIDGET_NOT_FOUND);
      }

      const result = await computeWidget(input.widgetId, ctx.strategy.id);

      if (!result.success) {
        throwInternal(result.error ?? AppErrors.MODULE_EXECUTION_FAILED);
      }

      return { success: true };
    }),

  /**
   * Get cached widget data.
   */
  getData: strategyProcedure
    .input(
      z.object({
        widgetId: z.string(),
        strategyId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // ctx.strategy is ownership-verified; query widget directly
      const widget = await ctx.db.cockpitWidget.findUnique({
        where: {
          strategyId_widgetType: {
            strategyId: ctx.strategy.id,
            widgetType: input.widgetId,
          },
        },
      });

      if (!widget) {
        throwNotFound(AppErrors.WIDGET_NOT_FOUND);
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
  computeAll: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx }) => {
      // ctx.strategy is ownership-verified
      return computeAllWidgets(ctx.strategy.id);
    }),
});
