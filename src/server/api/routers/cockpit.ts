import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// Simple hash function for cockpit share passwords
// In production, use bcrypt — keeping it simple here for now
async function hashPassword(password: string): Promise<string> {
  const { createHash } = await import("crypto");
  return createHash("sha256").update(password).digest("hex");
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hash;
}

export const cockpitRouter = createTRPCRouter({
  /**
   * Get cockpit data for a strategy (authenticated owner).
   * Returns all pillar content + documents + strategy metadata.
   */
  getData: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
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

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      return strategy;
    }),

  /**
   * Create a shareable cockpit link with password protection.
   */
  createShare: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        password: z.string().min(4, "Le mot de passe doit faire au moins 4 caractères"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        include: { cockpitShare: true },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      // If share already exists, update it
      if (strategy.cockpitShare) {
        const hashedPassword = await hashPassword(input.password);
        const share = await ctx.db.cockpitShare.update({
          where: { id: strategy.cockpitShare.id },
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
          strategyId: input.strategyId,
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
  disableShare: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        include: { cockpitShare: true },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      if (!strategy.cockpitShare) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aucun partage trouvé",
        });
      }

      await ctx.db.cockpitShare.update({
        where: { id: strategy.cockpitShare.id },
        data: { isActive: false },
      });

      return { success: true };
    }),

  /**
   * Re-enable cockpit sharing.
   */
  enableShare: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        include: { cockpitShare: true },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      if (!strategy.cockpitShare) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aucun partage trouvé",
        });
      }

      await ctx.db.cockpitShare.update({
        where: { id: strategy.cockpitShare.id },
        data: { isActive: true },
      });

      return { success: true };
    }),

  /**
   * Get share status for a strategy.
   */
  getShareStatus: protectedProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        include: {
          cockpitShare: {
            select: {
              slug: true,
              isActive: true,
              viewCount: true,
              createdAt: true,
            },
          },
        },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      return strategy.cockpitShare ?? null;
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cockpit non trouvé ou désactivé",
        });
      }

      // Verify password
      const valid = await verifyPassword(input.password, share.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Mot de passe incorrect",
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
