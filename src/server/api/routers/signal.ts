// =============================================================================
// ROUTER T.7 — Signal Router
// =============================================================================
// Strategic signal management (Signal Intelligence System — SIS).
// CRUD for signals, status mutations with audit trail, bulk import from audits.
//
// Procedures:
//   getByStrategy       — Get all signals for a strategy (with optional filters)
//   getByPillar         — Get signals for a specific pillar
//   create              — Create a new signal
//   mutate              — Mutate a signal's status (with audit trail)
//   delete              — Delete a signal
//   getMutationHistory  — Get mutation history for a signal
//   bulkCreateFromAudit — Bulk-create signals from T and R audit data
//
// Dependencies:
//   ~/server/api/trpc            — createTRPCRouter, protectedProcedure, strategyProcedure
//   ~/server/errors              — AppErrors, throwNotFound
//   ~/lib/types/phase1-schemas   — CreateSignalSchema, MutateSignalSchema
//   ~/server/services/signal-engine — createSignal, mutateSignal, getSignalsByStrategy, etc.
//   ~/lib/types/pillar-parsers   — parsePillarContent
//   ~/lib/types/pillar-schemas   — TrackAuditResult, RiskAuditResult
// =============================================================================

import { z } from "zod";

import { createTRPCRouter, protectedProcedure, strategyProcedure } from "~/server/api/trpc";
import { AppErrors, throwNotFound } from "~/server/errors";
import {
  CreateSignalSchema,
  MutateSignalSchema,
} from "~/lib/types/phase1-schemas";
import {
  createSignal,
  mutateSignal,
  getSignalsByStrategy,
  getSignalsByPillar,
  getMutationHistory,
  deleteSignal,
  bulkCreateFromAudit,
} from "~/server/services/signal-engine";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type { TrackAuditResult, RiskAuditResult } from "~/lib/types/pillar-schemas";

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const signalRouter = createTRPCRouter({
  /**
   * Get all signals for a strategy, with optional filters.
   */
  getByStrategy: strategyProcedure
    .input(
      z.object({
        strategyId: z.string().min(1),
        layer: z.string().optional(),
        pillar: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      return getSignalsByStrategy(input.strategyId, {
        layer: input.layer,
        pillar: input.pillar,
        status: input.status,
      });
    }),

  /**
   * Get signals for a specific pillar.
   */
  getByPillar: strategyProcedure
    .input(
      z.object({
        strategyId: z.string().min(1),
        pillar: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      return getSignalsByPillar(input.strategyId, input.pillar);
    }),

  /**
   * Create a new signal.
   */
  create: strategyProcedure
    .input(CreateSignalSchema)
    .mutation(async ({ input }) => {
      const { strategyId, ...data } = input;
      return createSignal(strategyId, data);
    }),

  /**
   * Mutate a signal's status (with audit trail).
   */
  mutate: protectedProcedure
    .input(MutateSignalSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify signal ownership through its strategy
      const signal = await ctx.db.signal.findUnique({
        where: { id: input.signalId },
        select: { strategy: { select: { userId: true } } },
      });
      if (!signal || signal.strategy.userId !== ctx.session.user.id) {
        throwNotFound(AppErrors.SIGNAL_NOT_FOUND);
      }

      return mutateSignal(
        input.signalId,
        input.newStatus,
        input.reason,
        ctx.session.user.id,
      );
    }),

  /**
   * Delete a signal.
   */
  delete: protectedProcedure
    .input(z.object({ signalId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const signal = await ctx.db.signal.findUnique({
        where: { id: input.signalId },
        select: { strategy: { select: { userId: true } } },
      });
      if (!signal || signal.strategy.userId !== ctx.session.user.id) {
        throwNotFound(AppErrors.SIGNAL_NOT_FOUND);
      }

      await deleteSignal(input.signalId);
      return { success: true };
    }),

  /**
   * Get mutation history for a signal.
   */
  getMutationHistory: protectedProcedure
    .input(z.object({ signalId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const signal = await ctx.db.signal.findUnique({
        where: { id: input.signalId },
        select: { strategy: { select: { userId: true } } },
      });
      if (!signal || signal.strategy.userId !== ctx.session.user.id) {
        throwNotFound(AppErrors.SIGNAL_NOT_FOUND);
      }

      return getMutationHistory(input.signalId);
    }),

  /**
   * Bulk-create signals from T and R audit data.
   * Parses existing pillar content and extracts signals.
   */
  bulkCreateFromAudit: strategyProcedure
    .input(z.object({ strategyId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Load T and R pillar content
      const pillars = await ctx.db.pillar.findMany({
        where: {
          strategyId: input.strategyId,
          type: { in: ["T", "R"] },
          status: "complete",
        },
      });

      let tData: TrackAuditResult | null = null;
      let rData: RiskAuditResult | null = null;

      for (const p of pillars) {
        if (p.type === "T" && p.content) {
          const { data } = parsePillarContent<TrackAuditResult>("T", p.content);
          tData = data;
        }
        if (p.type === "R" && p.content) {
          const { data } = parsePillarContent<RiskAuditResult>("R", p.content);
          rData = data;
        }
      }

      return bulkCreateFromAudit(input.strategyId, tData, rData);
    }),
});
