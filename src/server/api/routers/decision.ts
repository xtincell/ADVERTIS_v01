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
// Helpers:
//   verifyStrategyOwnership — Shared ownership check
//
// Dependencies:
//   ~/server/api/trpc          — createTRPCRouter, protectedProcedure
//   ~/lib/types/phase1-schemas — CreateDecisionSchema, UpdateDecisionSchema, ResolveDecisionSchema
//   ~/server/db                — Prisma client (for helper typing)
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  CreateDecisionSchema,
  UpdateDecisionSchema,
  ResolveDecisionSchema,
} from "~/lib/types/phase1-schemas";
import { db as prismaDb } from "~/server/db";

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
// Router
// ---------------------------------------------------------------------------

export const decisionRouter = createTRPCRouter({
  /**
   * Get all decisions for a strategy, sorted by priority ASC then createdAt DESC.
   */
  getByStrategy: protectedProcedure
    .input(
      z.object({
        strategyId: z.string().min(1),
        status: z.string().optional(),
        priority: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

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
  create: protectedProcedure
    .input(CreateDecisionSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

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
        select: { strategyId: true },
      });
      if (!decision) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Décision non trouvée",
        });
      }
      await verifyStrategyOwnership(ctx.db, decision.strategyId, ctx.session.user.id);

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
        select: { strategyId: true },
      });
      if (!decision) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Décision non trouvée",
        });
      }
      await verifyStrategyOwnership(ctx.db, decision.strategyId, ctx.session.user.id);

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
        select: { strategyId: true },
      });
      if (!decision) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Décision non trouvée",
        });
      }
      await verifyStrategyOwnership(ctx.db, decision.strategyId, ctx.session.user.id);

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
        select: { strategyId: true },
      });
      if (!decision) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Décision non trouvée",
        });
      }
      await verifyStrategyOwnership(ctx.db, decision.strategyId, ctx.session.user.id);

      await ctx.db.decision.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
