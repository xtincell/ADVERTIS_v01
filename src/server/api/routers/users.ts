// =============================================================================
// ROUTER T.19 — Users & Admin Router
// =============================================================================
// Admin-only user + strategy management procedures.
//
// Procedures:
//   list             — List all users (ADMIN only)
//   updateRole       — Change a user's role (ADMIN only)
//   countByRole      — Count users by role (ADMIN, OPERATOR)
//   listStrategies   — List all strategies with owner info (ADMIN only)
//   updateStrategy   — Update strategy status/deliveryMode/owner (ADMIN only)
//
// Dependencies:
//   ~/server/api/trpc — createTRPCRouter, roleProtectedProcedure
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, roleProtectedProcedure } from "~/server/api/trpc";
import { USER_ROLES, DELIVERY_MODES } from "~/lib/constants";

const adminProcedure = roleProtectedProcedure(["ADMIN"]);
const internalProcedure = roleProtectedProcedure(["ADMIN", "OPERATOR"]);

export const usersRouter = createTRPCRouter({
  /** List all users — ADMIN only. */
  list: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        role: true,
        createdAt: true,
        image: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return users;
  }),

  /** Update a user's role — ADMIN only. */
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(USER_ROLES),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent self-demotion
      if (input.userId === ctx.session.user.id && input.role !== "ADMIN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vous ne pouvez pas modifier votre propre rôle",
        });
      }

      const user = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return user;
    }),

  /** Count users grouped by role — ADMIN + OPERATOR. */
  countByRole: internalProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.groupBy({
      by: ["role"],
      _count: { role: true },
    });

    const counts: Record<string, number> = {};
    let total = 0;
    for (const group of users) {
      counts[group.role] = group._count.role;
      total += group._count.role;
    }

    return { counts, total };
  }),

  // =========================================================================
  // Strategy Admin
  // =========================================================================

  /** List ALL strategies with owner info — ADMIN only. */
  listStrategies: adminProcedure.query(async ({ ctx }) => {
    const strategies = await ctx.db.strategy.findMany({
      select: {
        id: true,
        brandName: true,
        name: true,
        status: true,
        phase: true,
        deliveryMode: true,
        sector: true,
        coherenceScore: true,
        createdAt: true,
        userId: true,
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return strategies;
  }),

  /** Update strategy admin fields — ADMIN only. */
  updateStrategy: adminProcedure
    .input(
      z.object({
        strategyId: z.string(),
        status: z.enum(["draft", "generating", "complete", "archived"]).optional(),
        deliveryMode: z.enum(DELIVERY_MODES).nullable().optional(),
        userId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { strategyId, ...data } = input;

      // Build update payload — only include provided fields
      const updateData: Record<string, unknown> = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.deliveryMode !== undefined) updateData.deliveryMode = data.deliveryMode;
      if (data.userId !== undefined) {
        // Verify target user exists
        const targetUser = await ctx.db.user.findUnique({ where: { id: data.userId } });
        if (!targetUser) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur introuvable" });
        }
        updateData.userId = data.userId;
      }

      const strategy = await ctx.db.strategy.update({
        where: { id: strategyId },
        data: updateData,
        select: {
          id: true,
          brandName: true,
          status: true,
          deliveryMode: true,
          userId: true,
        },
      });

      return strategy;
    }),
});
