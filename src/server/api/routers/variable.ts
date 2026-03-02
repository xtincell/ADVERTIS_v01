// =============================================================================
// ROUTER T.10 — Variable Router
// =============================================================================
// CRUD + exploration for BrandVariable entities (atomic variable registry).
//
// Procedures:
//   list             — All variables for a strategy (with filters)
//   get              — Single variable by key
//   getByPillar      — Variables for a specific pillar type
//   getStale         — All stale variables for a strategy
//   getHistory       — Version history for a variable
//   getStats         — Summary stats (total, filled, stale, by source)
//   getDependencyMap — Static dependency graph (all 103 definitions)
//   update           — Manual edit of a variable (with history + staleness cascade)
//   materialize      — Reconstruct pillar content from BrandVariables
//   backfill         — Extract BrandVariables from existing data (admin)
//
// Dependencies:
//   ~/server/api/trpc           — createTRPCRouter, protectedProcedure
//   ~/server/services/variable-store     — CRUD operations
//   ~/server/services/variable-extractor — extraction utilities
//   ~/server/services/pillar-materializer — materialization
//   ~/server/services/staleness-propagator — staleness cascade
//   ~/server/services/variable-backfill   — migration backfill
//   ~/lib/variable-registry     — definitions, dependency graph
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  getVariable,
  getVariables,
  getVariablesByPillar,
  getStaleVariables,
  setVariable,
  getHistory,
  getVariableStats,
} from "~/server/services/variable-store";
import { materializeAndPersist } from "~/server/services/pillar-materializer";
import { propagateStaleness } from "~/server/services/staleness-propagator";
import {
  getDependencyMap,
  VARIABLE_DEFINITIONS,
  ALL_VARIABLE_KEYS,
  getVariableDefinition,
} from "~/lib/variable-registry";

// ---------------------------------------------------------------------------
// Helper: verify strategy ownership
// ---------------------------------------------------------------------------

async function verifyOwnership(
  db: { strategy: { findUnique: (args: { where: { id: string }; select: { userId: true } }) => Promise<{ userId: string } | null> } },
  strategyId: string,
  userId: string,
) {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: { userId: true },
  });
  if (!strategy || strategy.userId !== userId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Stratégie non trouvée",
    });
  }
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const variableRouter = createTRPCRouter({
  /**
   * List all BrandVariables for a strategy.
   * Optional filters: category, staleOnly, pillarType.
   */
  list: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        category: z.enum(["interview", "pillar", "score"]).optional(),
        staleOnly: z.boolean().optional(),
        pillarType: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      if (input.staleOnly) {
        return getStaleVariables(input.strategyId);
      }

      if (input.pillarType) {
        return getVariablesByPillar(input.strategyId, input.pillarType);
      }

      // Filter keys by category if specified
      let keys: string[] | undefined;
      if (input.category) {
        keys = VARIABLE_DEFINITIONS
          .filter((d) => d.category === input.category)
          .map((d) => d.key);
      }

      return getVariables(input.strategyId, keys);
    }),

  /**
   * Get a single variable by key.
   */
  get: protectedProcedure
    .input(z.object({ strategyId: z.string(), key: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      const variable = await getVariable(input.strategyId, input.key);
      if (!variable) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Variable non trouvée" });
      }
      return variable;
    }),

  /**
   * Get all variables for a pillar type.
   */
  getByPillar: protectedProcedure
    .input(z.object({ strategyId: z.string(), pillarType: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return getVariablesByPillar(input.strategyId, input.pillarType);
    }),

  /**
   * Get all stale variables.
   */
  getStale: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return getStaleVariables(input.strategyId);
    }),

  /**
   * Get version history for a variable.
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        key: z.string(),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return getHistory(input.strategyId, input.key, input.limit);
    }),

  /**
   * Get summary stats for a strategy's variables.
   */
  getStats: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return getVariableStats(input.strategyId);
    }),

  /**
   * Get the static dependency graph (all 103 definitions).
   * Returns definitions + forward/reverse dependency map.
   */
  getDependencyMap: protectedProcedure.query(() => {
    return {
      definitions: VARIABLE_DEFINITIONS.map((d) => ({
        key: d.key,
        label: d.label,
        category: d.category,
        pillarType: d.pillarType,
        pillarSection: d.pillarSection,
        interviewId: d.interviewId,
        description: d.description,
        dependsOnCount: d.dependsOn.length,
      })),
      totalKeys: ALL_VARIABLE_KEYS.length,
      graph: getDependencyMap(),
    };
  }),

  /**
   * Manually update a single variable.
   * Creates history snapshot + propagates staleness downstream.
   */
  update: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        key: z.string(),
        value: z.union([z.string(), z.number(), z.boolean(), z.array(z.unknown()), z.record(z.string(), z.unknown()), z.null()]),
        changeNote: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      // Validate that key exists in registry
      const def = getVariableDefinition(input.key);
      if (!def) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Clé de variable inconnue : ${input.key}`,
        });
      }

      const variable = await setVariable(input.strategyId, input.key, input.value, {
        source: "manual_edit",
        changedBy: ctx.session.user.id,
        changeNote: input.changeNote,
      });

      // Propagate staleness downstream (fire-and-forget)
      void propagateStaleness(input.strategyId, [input.key]);

      return variable;
    }),

  /**
   * Reconstruct a pillar's content from its BrandVariables and persist to DB.
   */
  materialize: protectedProcedure
    .input(z.object({ strategyId: z.string(), pillarType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return materializeAndPersist(
        input.strategyId,
        input.pillarType,
        ctx.session.user.id,
      );
    }),

  /**
   * Backfill: Extract BrandVariables from an existing strategy's data.
   * Admin-level operation for migrating existing strategies.
   */
  backfill: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      // Lazy import to avoid circular dependencies
      const { backfillStrategy } = await import(
        "~/server/services/variable-backfill"
      );

      return backfillStrategy(input.strategyId);
    }),
});
