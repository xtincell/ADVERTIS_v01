// =============================================================================
// ROUTER T.1 — Strategy Router
// =============================================================================
// CRUD + phase management + score recalculation for Strategy entities.
//
// Procedures:
//   create            — Create a new strategy with 8 empty ADVERTIS pillars
//   getAll            — List all strategies for current user (optional tree view)
//   getById           — Get a single strategy by ID (ownership check)
//   update            — Update strategy fields (name, brand, sector, etc.)
//   delete            — Delete a strategy (cascade deletes pillars)
//   duplicate         — Duplicate a strategy and all its pillars
//   archive           — Archive a strategy
//   unarchive         — Unarchive a strategy (back to "draft")
//   updateInterviewData — Update the interviewData JSON field
//   confirmImport     — Merge imported file data into interviewData
//   advancePhase      — Advance strategy to the next phase
//   revertPhase       — Revert strategy to a previous phase
//   validateFicheReview — Validate fiche review + advance to audit-r
//   validateAuditReview — Validate audit review + advance to implementation
//   createChild       — Create a child strategy (brand tree)
//   getTree           — Get nested strategy tree (up to 3 levels)
//   getAncestors      — Get ancestor chain from current to root
//   getChildren       — Get direct children of a strategy
//
// Dependencies:
//   ~/server/api/trpc          — createTRPCRouter, protectedProcedure
//   ~/lib/constants            — PILLAR_TYPES, PILLAR_CONFIG
//   ~/server/services/score-engine — recalculateAllScores
//   ~/server/services/pipeline-orchestrator — validatePhaseTransition, validatePhaseReversion
//   ~/lib/types/phase1-schemas — CreateChildStrategySchema
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { PILLAR_TYPES, PILLAR_CONFIG, SUPPORTED_CURRENCIES } from "~/lib/constants";
import type { Phase } from "~/lib/constants";
import { recalculateAllScores } from "~/server/services/score-engine";
import {
  validatePhaseTransition,
  validatePhaseReversion,
} from "~/server/services/pipeline-orchestrator";
import { CreateChildStrategySchema } from "~/lib/types/phase1-schemas";

export const strategyRouter = createTRPCRouter({
  /**
   * Create a new strategy with 8 empty ADVERTIS pillars.
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Le nom est requis"),
        brandName: z.string().min(1, "Le nom de marque est requis"),
        sector: z.string().optional(),
        description: z.string().optional(),
        nodeType: z.string().optional(),
        vertical: z.string().optional(),
        maturityProfile: z.string().optional(),
        deliveryMode: z.string().optional(),
        inputMethod: z.string().optional(),
        currency: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.create({
        data: {
          name: input.name,
          brandName: input.brandName,
          sector: input.sector,
          description: input.description,
          nodeType: input.nodeType ?? "BRAND",
          vertical: input.vertical ?? null,
          maturityProfile: input.maturityProfile ?? null,
          deliveryMode: input.deliveryMode ?? null,
          inputMethod: input.inputMethod ?? null,
          currency: input.currency ?? "XOF",
          status: "draft",
          userId: ctx.session.user.id,
          pillars: {
            create: PILLAR_TYPES.map((type) => ({
              type,
              title: PILLAR_CONFIG[type].title,
              order: PILLAR_CONFIG[type].order,
              status: "pending",
            })),
          },
        },
        include: {
          pillars: {
            orderBy: { order: "asc" },
          },
        },
      });

      return strategy;
    }),

  /**
   * Get all strategies for the current user, ordered by updatedAt desc.
   * Includes a count of completed pillars for each strategy.
   */
  getAll: protectedProcedure
    .input(
      z.object({
        treeView: z.boolean().optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { userId: ctx.session.user.id };

      // Tree view: only show root strategies (no parent)
      if (input?.treeView) {
        where.parentId = null;
      }

      const strategies = await ctx.db.strategy.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          pillars: {
            select: {
              id: true,
              type: true,
              status: true,
            },
          },
          _count: {
            select: {
              pillars: {
                where: { status: "complete" },
              },
              children: true,
            },
          },
        },
      });

      return strategies;
    }),

  /**
   * Get a single strategy by ID with all pillars ordered by `order`.
   * Verifies ownership.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.id },
        include: {
          pillars: {
            orderBy: { order: "asc" },
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
   * Update strategy fields. Verifies ownership.
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        brandName: z.string().min(1).optional(),
        tagline: z.string().optional(),
        sector: z.string().optional(),
        description: z.string().optional(),
        interviewData: z.any().optional(),
        currency: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.strategy.findUnique({
        where: { id: input.id },
      });

      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      const { id, ...data } = input;

      const strategy = await ctx.db.strategy.update({
        where: { id },
        data,
        include: {
          pillars: {
            orderBy: { order: "asc" },
          },
        },
      });

      return strategy;
    }),

  /**
   * Delete a strategy (cascade deletes pillars). Verifies ownership.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.strategy.findUnique({
        where: { id: input.id },
      });

      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      await ctx.db.strategy.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Duplicate a strategy and all its pillars.
   * Appends " (copie)" to the name and resets status to "draft".
   * Verifies ownership of the source strategy.
   */
  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.db.strategy.findUnique({
        where: { id: input.id },
        include: {
          pillars: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!source || source.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      const duplicate = await ctx.db.strategy.create({
        data: {
          name: `${source.name} (copie)`,
          brandName: source.brandName,
          sector: source.sector,
          description: source.description,
          status: "draft",
          interviewData: source.interviewData ?? undefined,
          generationMode: source.generationMode,
          currency: source.currency ?? "XOF",
          userId: ctx.session.user.id,
          pillars: {
            create: source.pillars.map((pillar) => ({
              type: pillar.type,
              title: pillar.title,
              order: pillar.order,
              status: "pending",
              summary: pillar.summary,
              content: pillar.content ?? undefined,
            })),
          },
        },
        include: {
          pillars: {
            orderBy: { order: "asc" },
          },
        },
      });

      return duplicate;
    }),

  /**
   * Archive a strategy. Verifies ownership.
   */
  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.strategy.findUnique({
        where: { id: input.id },
      });

      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      const strategy = await ctx.db.strategy.update({
        where: { id: input.id },
        data: { status: "archived" },
      });

      return strategy;
    }),

  /**
   * Unarchive a strategy (set status back to "draft"). Verifies ownership.
   */
  unarchive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.strategy.findUnique({
        where: { id: input.id },
      });

      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      const strategy = await ctx.db.strategy.update({
        where: { id: input.id },
        data: { status: "draft" },
      });

      return strategy;
    }),

  /**
   * Update the interviewData JSON field. Verifies ownership.
   */
  updateInterviewData: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.record(z.any()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.strategy.findUnique({
        where: { id: input.id },
      });

      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      const strategy = await ctx.db.strategy.update({
        where: { id: input.id },
        data: { interviewData: input.data },
      });

      return strategy;
    }),

  /**
   * Confirm file import: merge mapped variables into interviewData.
   * Updates the ImportedFile status to "confirmed".
   */
  confirmImport: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        importedFileId: z.string(),
        confirmedData: z.record(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify strategy ownership
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      // Verify imported file belongs to this strategy
      const importedFile = await ctx.db.importedFile.findUnique({
        where: { id: input.importedFileId },
      });

      if (!importedFile || importedFile.strategyId !== input.strategyId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fichier importé non trouvé",
        });
      }

      // Merge confirmed data into existing interviewData
      const existingData = (strategy.interviewData as Record<string, string>) ?? {};
      const mergedData = { ...existingData, ...input.confirmedData };

      // Update strategy and imported file
      const [updatedStrategy] = await ctx.db.$transaction([
        ctx.db.strategy.update({
          where: { id: input.strategyId },
          data: { interviewData: mergedData },
          include: { pillars: { orderBy: { order: "asc" } } },
        }),
        ctx.db.importedFile.update({
          where: { id: input.importedFileId },
          data: { status: "confirmed" },
        }),
      ]);

      return updatedStrategy;
    }),

  /**
   * Advance the strategy to the next phase.
   * Validates that the transition is allowed.
   */
  advancePhase: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        targetPhase: z.enum([
          "fiche-review",
          "audit-r",
          "market-study",
          "audit-t",
          "audit-review",
          "implementation",
          "cockpit",
          "complete",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.id },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      // Validate phase transition via pipeline orchestrator
      const transition = validatePhaseTransition(strategy.phase, input.targetPhase);
      if (!transition.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: transition.error!,
        });
      }

      const updatedStrategy = await ctx.db.strategy.update({
        where: { id: input.id },
        data: {
          phase: input.targetPhase,
          status: input.targetPhase === "complete" ? "complete" : "generating",
        },
        include: { pillars: { orderBy: { order: "asc" } } },
      });

      return updatedStrategy;
    }),

  /**
   * Revert the strategy to a previous phase.
   * Data from later phases is PRESERVED (not deleted).
   */
  revertPhase: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        targetPhase: z.enum([
          "fiche",
          "fiche-review",
          "audit-r",
          "market-study",
          "audit-t",
          "audit-review",
          "implementation",
          "cockpit",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.id },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      // Validate phase reversion via pipeline orchestrator
      const reversion = validatePhaseReversion(strategy.phase, input.targetPhase);
      if (!reversion.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: reversion.error!,
        });
      }

      const updatedStrategy = await ctx.db.strategy.update({
        where: { id: input.id },
        data: {
          phase: input.targetPhase,
          status: "generating",
        },
        include: { pillars: { orderBy: { order: "asc" } } },
      });

      return updatedStrategy;
    }),

  /**
   * Validate the fiche review: save edited A-D-V-E interview data and advance to audit-r.
   */
  validateFicheReview: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        interviewData: z.record(z.any()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.id },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      if (strategy.phase !== "fiche-review") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `La stratégie doit être en phase "fiche-review" pour valider la fiche. Phase actuelle : "${strategy.phase}"`,
        });
      }

      const updatedStrategy = await ctx.db.strategy.update({
        where: { id: input.id },
        data: {
          interviewData: input.interviewData,
          phase: "audit-r",
          status: "generating",
        },
        include: { pillars: { orderBy: { order: "asc" } } },
      });

      // Recalculate scores after fiche review validation
      void recalculateAllScores(input.id, "fiche_review");

      return updatedStrategy;
    }),

  /**
   * Validate the audit review: save edited R+T data and advance to implementation phase.
   * Called when the user finishes reviewing/editing the audit results.
   */
  validateAuditReview: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        riskAuditData: z.any(),
        trackAuditData: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.id },
        include: {
          pillars: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      // Verify we're in the right phase
      if (strategy.phase !== "audit-review") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `La stratégie doit être en phase "audit-review" pour valider l'audit. Phase actuelle : "${strategy.phase}"`,
        });
      }

      // Find R and T pillars
      const pillarR = strategy.pillars.find((p) => p.type === "R");
      const pillarT = strategy.pillars.find((p) => p.type === "T");

      if (!pillarR || !pillarT) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Piliers R ou T introuvables",
        });
      }

      // Update both pillars and advance phase in a transaction
      const [updatedStrategy] = await ctx.db.$transaction([
        ctx.db.strategy.update({
          where: { id: input.id },
          data: {
            phase: "implementation",
            status: "generating",
          },
          include: { pillars: { orderBy: { order: "asc" } } },
        }),
        ctx.db.pillar.update({
          where: { id: pillarR.id },
          data: {
            content: input.riskAuditData,
          },
        }),
        ctx.db.pillar.update({
          where: { id: pillarT.id },
          data: {
            content: input.trackAuditData,
          },
        }),
      ]);

      // Recalculate scores after audit review validation
      void recalculateAllScores(input.id, "audit_review");

      return updatedStrategy;
    }),

  // =========================================================================
  // Brand Tree procedures
  // =========================================================================

  /**
   * Create a child strategy under a parent.
   * Inherits userId from parent, sets depth = parent.depth + 1, creates 8 empty pillars.
   */
  createChild: protectedProcedure
    .input(CreateChildStrategySchema)
    .mutation(async ({ ctx, input }) => {
      const parent = await ctx.db.strategy.findUnique({
        where: { id: input.parentId },
        select: { id: true, userId: true, depth: true, vertical: true, currency: true },
      });

      if (!parent || parent.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie parente non trouvée",
        });
      }

      const child = await ctx.db.strategy.create({
        data: {
          name: input.name,
          brandName: input.brandName,
          sector: input.sector ?? null,
          description: input.description ?? null,
          status: "draft",
          userId: ctx.session.user.id,
          parentId: input.parentId,
          depth: parent.depth + 1,
          nodeType: input.nodeType ?? "BRAND",
          deliveryMode: input.deliveryMode ?? null,
          vertical: input.vertical ?? parent.vertical ?? null,
          maturityProfile: input.maturityProfile ?? null,
          currency: input.currency ?? parent.currency ?? "XOF",
          pillars: {
            create: PILLAR_TYPES.map((type) => ({
              type,
              title: PILLAR_CONFIG[type].title,
              order: PILLAR_CONFIG[type].order,
              status: "pending",
            })),
          },
        },
        include: {
          pillars: { orderBy: { order: "asc" } },
        },
      });

      return child;
    }),

  /**
   * Get the full strategy tree starting from a root strategy.
   * Returns nested children up to 3 levels deep.
   */
  getTree: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.id },
        include: {
          pillars: {
            select: { id: true, type: true, status: true },
            orderBy: { order: "asc" },
          },
          children: {
            include: {
              pillars: {
                select: { id: true, type: true, status: true },
                orderBy: { order: "asc" },
              },
              children: {
                include: {
                  pillars: {
                    select: { id: true, type: true, status: true },
                    orderBy: { order: "asc" },
                  },
                  children: {
                    include: {
                      pillars: {
                        select: { id: true, type: true, status: true },
                        orderBy: { order: "asc" },
                      },
                    },
                    orderBy: { createdAt: "asc" },
                  },
                },
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
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
   * Get ancestors of a strategy (from current up to root).
   */
  getAncestors: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ancestors: Array<{
        id: string;
        name: string;
        brandName: string;
        nodeType: string;
        depth: number;
      }> = [];

      let currentId: string | null = input.id;

      // Walk up the tree (max 10 levels to prevent infinite loops)
      for (let i = 0; i < 10 && currentId; i++) {
        const node: {
          id: string;
          name: string;
          brandName: string;
          nodeType: string;
          depth: number;
          parentId: string | null;
          userId: string;
        } | null = await ctx.db.strategy.findUnique({
          where: { id: currentId },
          select: {
            id: true,
            name: true,
            brandName: true,
            nodeType: true,
            depth: true,
            parentId: true,
            userId: true,
          },
        });

        if (!node || node.userId !== ctx.session.user.id) break;

        // Don't include the starting node itself
        if (node.id !== input.id) {
          ancestors.unshift({
            id: node.id,
            name: node.name,
            brandName: node.brandName,
            nodeType: node.nodeType,
            depth: node.depth,
          });
        }

        currentId = node.parentId;
      }

      return ancestors;
    }),

  /**
   * Get direct children of a strategy.
   */
  getChildren: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.id },
        select: { id: true, userId: true },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      return ctx.db.strategy.findMany({
        where: { parentId: input.id },
        include: {
          pillars: {
            select: { id: true, type: true, status: true },
            orderBy: { order: "asc" },
          },
          _count: {
            select: { children: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }),
});
