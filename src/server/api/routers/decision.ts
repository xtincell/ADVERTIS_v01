// =============================================================================
// ROUTER T.8 — Decision Router
// =============================================================================
// Strategic decision logging. CRUD for decisions, resolve, defer, priority mgmt.
// Decisions can be linked to signals for traceability.
//
// Procedures:
//   getByStrategy — Get all decisions for a strategy (sorted by priority, date)
//   create        — Create a new decision
//   update        — Update a decision
//   resolve       — Resolve a decision with a resolution text
//   defer         — Defer a decision
//   delete        — Delete a decision
//
// Dependencies:
//   ~/server/api/trpc          — createTRPCRouter, protectedProcedure, strategyProcedure
//   ~/server/errors            — AppErrors, throwNotFound
//   ~/lib/types/phase1-schemas — CreateDecisionSchema, UpdateDecisionSchema, ResolveDecisionSchema
// =============================================================================

import { z } from "zod";

import { createTRPCRouter, protectedProcedure, strategyProcedure } from "~/server/api/trpc";
import { AppErrors, throwNotFound } from "~/server/errors";
import {
  CreateDecisionSchema,
  UpdateDecisionSchema,
  ResolveDecisionSchema,
} from "~/lib/types/phase1-schemas";

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const decisionRouter = createTRPCRouter({
  /**
   * Get all decisions for a strategy, sorted by priority ASC then createdAt DESC.
   */
  getByStrategy: strategyProcedure
    .input(
      z.object({
        strategyId: z.string().min(1),
        status: z.string().optional(),
        priority: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { strategyId: input.strategyId };
      if (input.status) where.status = input.status;
      if (input.priority) where.priority = input.priority;

      return ctx.db.decision.findMany({
        where,
        include: {
          signal: {
            select: {
              id: true,
              title: true,
              layer: true,
              status: true,
              pillar: true,
            },
          },
        },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      });
    }),

  /**
   * Create a new decision.
   */
  create: strategyProcedure
    .input(CreateDecisionSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.decision.create({
        data: {
          strategyId: input.strategyId,
          title: input.title,
          description: input.description ?? null,
          priority: input.priority,
          status: "PENDING",
          deadline: input.deadline ?? null,
          deadlineType: input.deadlineType ?? null,
          signalId: input.signalId ?? null,
        },
        include: {
          signal: {
            select: {
              id: true,
              title: true,
              layer: true,
              status: true,
              pillar: true,
            },
          },
        },
      });
    }),

  /**
   * Update a decision.
   */
  update: protectedProcedure
    .input(UpdateDecisionSchema)
    .mutation(async ({ ctx, input }) => {
      const decision = await ctx.db.decision.findUnique({
        where: { id: input.id },
        select: { strategy: { select: { userId: true } } },
      });
      if (!decision || decision.strategy.userId !== ctx.session.user.id) {
        throwNotFound(AppErrors.DECISION_NOT_FOUND);
      }

      const { id, ...data } = input;
      return ctx.db.decision.update({
        where: { id },
        data,
        include: {
          signal: {
            select: {
              id: true,
              title: true,
              layer: true,
              status: true,
              pillar: true,
            },
          },
        },
      });
    }),

  /**
   * Resolve a decision with a resolution text.
   */
  resolve: protectedProcedure
    .input(ResolveDecisionSchema)
    .mutation(async ({ ctx, input }) => {
      const decision = await ctx.db.decision.findUnique({
        where: { id: input.id },
        select: { strategy: { select: { userId: true } } },
      });
      if (!decision || decision.strategy.userId !== ctx.session.user.id) {
        throwNotFound(AppErrors.DECISION_NOT_FOUND);
      }

      return ctx.db.decision.update({
        where: { id: input.id },
        data: {
          status: "RESOLVED",
          resolution: input.resolution,
          resolvedBy: ctx.session.user.id,
          resolvedAt: new Date(),
        },
        include: {
          signal: {
            select: {
              id: true,
              title: true,
              layer: true,
              status: true,
              pillar: true,
            },
          },
        },
      });
    }),

  /**
   * Defer a decision.
   */
  defer: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const decision = await ctx.db.decision.findUnique({
        where: { id: input.id },
        select: { strategy: { select: { userId: true } } },
      });
      if (!decision || decision.strategy.userId !== ctx.session.user.id) {
        throwNotFound(AppErrors.DECISION_NOT_FOUND);
      }

      return ctx.db.decision.update({
        where: { id: input.id },
        data: { status: "DEFERRED" },
        include: {
          signal: {
            select: {
              id: true,
              title: true,
              layer: true,
              status: true,
              pillar: true,
            },
          },
        },
      });
    }),

  /**
   * Delete a decision.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const decision = await ctx.db.decision.findUnique({
        where: { id: input.id },
        select: { strategy: { select: { userId: true } } },
      });
      if (!decision || decision.strategy.userId !== ctx.session.user.id) {
        throwNotFound(AppErrors.DECISION_NOT_FOUND);
      }

      await ctx.db.decision.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
