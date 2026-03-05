// =============================================================================
// ROUTER T.4 — Cockpit Router
// =============================================================================
// Cockpit data aggregation + password-protected sharing for strategy cockpits.
//
// Procedures:
//   getData          — Get cockpit data for a strategy (authenticated owner)
//   createShare      — Create a shareable cockpit link with password protection
//   disableShare     — Disable cockpit sharing
//   enableShare      — Re-enable cockpit sharing
//   getShareStatus   — Get share status for a strategy
//   getPublicCockpit — Public endpoint: verify password and get cockpit data
//
// Helpers:
//   hashPassword     — SHA-256 password hashing
//   verifyPassword   — Password verification against stored hash
//
// Dependencies:
//   ~/server/api/trpc — createTRPCRouter, protectedProcedure, publicProcedure
//   crypto            — randomBytes for slug generation
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

import {
  createTRPCRouter,
  publicProcedure,
  strategyProcedure,
} from "~/server/api/trpc";
import { AppErrors, throwNotFound } from "~/server/errors";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const cockpitRouter = createTRPCRouter({
  /**
   * Get cockpit data for a strategy (authenticated owner).
   * Returns all pillar content + documents + strategy metadata.
   */
  getData: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx }) => {
      // ctx.strategy is ownership-verified; re-query with includes
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: ctx.strategy.id },
        include: {
          pillars: { orderBy: { order: "asc" } },
          documents: { orderBy: { createdAt: "asc" } },
          cockpitShare: {
            select: {
              id: true,
              slug: true,
              isActive: true,
              viewCount: true,
              createdAt: true,
            },
          },
        },
      });

      if (!strategy) throwNotFound(AppErrors.STRATEGY_NOT_FOUND);

      return strategy;
    }),

  /**
   * Create a shareable cockpit link with password protection.
   */
  createShare: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        password: z.string().min(4, "Le mot de passe doit faire au moins 4 caractères"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // ctx.strategy is ownership-verified; load cockpitShare relation
      const existing = await ctx.db.cockpitShare.findUnique({
        where: { strategyId: ctx.strategy.id },
      });

      // If share already exists, update it
      if (existing) {
        const hashedPassword = await hashPassword(input.password);
        const share = await ctx.db.cockpitShare.update({
          where: { id: existing.id },
          data: {
            password: hashedPassword,
            isActive: true,
          },
        });

        return {
          slug: share.slug,
          isActive: share.isActive,
          viewCount: share.viewCount,
        };
      }

      // Create new share
      const slug = randomBytes(8).toString("hex"); // 16-char random slug
      const hashedPassword = await hashPassword(input.password);

      const share = await ctx.db.cockpitShare.create({
        data: {
          slug,
          password: hashedPassword,
          strategyId: ctx.strategy.id,
        },
      });

      return {
        slug: share.slug,
        isActive: share.isActive,
        viewCount: share.viewCount,
      };
    }),

  /**
   * Disable cockpit sharing.
   */
  disableShare: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx }) => {
      // ctx.strategy is ownership-verified
      const share = await ctx.db.cockpitShare.findUnique({
        where: { strategyId: ctx.strategy.id },
      });

      if (!share) {
        throwNotFound("Aucun partage trouvé");
      }

      await ctx.db.cockpitShare.update({
        where: { id: share.id },
        data: { isActive: false },
      });

      return { success: true };
    }),

  /**
   * Re-enable cockpit sharing.
   */
  enableShare: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx }) => {
      // ctx.strategy is ownership-verified
      const share = await ctx.db.cockpitShare.findUnique({
        where: { strategyId: ctx.strategy.id },
      });

      if (!share) {
        throwNotFound("Aucun partage trouvé");
      }

      await ctx.db.cockpitShare.update({
        where: { id: share.id },
        data: { isActive: true },
      });

      return { success: true };
    }),

  /**
   * Get share status for a strategy.
   */
  getShareStatus: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx }) => {
      // ctx.strategy is ownership-verified; query cockpitShare
      const share = await ctx.db.cockpitShare.findUnique({
        where: { strategyId: ctx.strategy.id },
        select: {
          slug: true,
          isActive: true,
          viewCount: true,
          createdAt: true,
        },
      });

      return share ?? null;
    }),

  /**
   * Public endpoint: verify password and get cockpit data.
   * No authentication required — uses slug + password.
   */
  getPublicCockpit: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        password: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const share = await ctx.db.cockpitShare.findUnique({
        where: { slug: input.slug },
        include: {
          strategy: {
            include: {
              pillars: { orderBy: { order: "asc" } },
              documents: {
                orderBy: { createdAt: "asc" },
                select: {
                  id: true,
                  type: true,
                  title: true,
                  status: true,
                  pageCount: true,
                  sections: true,
                },
              },
            },
          },
        },
      });

      if (!share || !share.isActive) {
        throwNotFound("Cockpit non trouvé ou désactivé");
      }

      // Verify password
      const valid = await verifyPassword(input.password, share.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: AppErrors.UNAUTHORIZED,
        });
      }

      // Increment view count
      await ctx.db.cockpitShare.update({
        where: { id: share.id },
        data: { viewCount: { increment: 1 } },
      });

      return {
        brandName: share.strategy.brandName,
        name: share.strategy.name,
        sector: share.strategy.sector,
        description: share.strategy.description,
        phase: share.strategy.phase,
        coherenceScore: share.strategy.coherenceScore,
        pillars: share.strategy.pillars.map((p) => ({
          type: p.type,
          title: p.title,
          status: p.status,
          summary: p.summary,
          content: p.content,
        })),
        documents: share.strategy.documents,
      };
    }),
});
