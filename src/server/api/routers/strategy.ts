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
//   ~/server/api/trpc          — createTRPCRouter, protectedProcedure, strategyProcedure
//   ~/server/errors            — AppErrors, throwNotFound
//   ~/lib/constants            — PILLAR_TYPES, PILLAR_CONFIG
//   ~/server/services/score-engine — recalculateAllScores
//   ~/server/services/pipeline-orchestrator — validatePhaseTransition, validatePhaseReversion
//   ~/lib/types/phase1-schemas — CreateChildStrategySchema
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, strategyProcedure } from "~/server/api/trpc";
import { AppErrors, throwNotFound } from "~/server/errors";
import { PILLAR_TYPES, PILLAR_CONFIG, SUPPORTED_CURRENCIES, AVAILABLE_MODELS, AI_PHASES } from "~/lib/constants";
import type { Phase } from "~/lib/constants";
import { recalculateAllScores } from "~/server/services/score-engine";
import {
  validatePhaseTransition,
  validatePhaseReversion,
} from "~/server/services/pipeline-orchestrator";
import { CreateChildStrategySchema } from "~/lib/types/phase1-schemas";
import { setVariablesBatch, type BatchVariableEntry } from "~/server/services/variable-store";
import { propagateStaleness } from "~/server/services/staleness-propagator";

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
        country: z.string().length(2).optional(),
        annualBudget: z.number().int().positive().optional(),
        targetRevenue: z.number().int().positive().optional(),
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
          country: input.country ?? null,
          annualBudget: input.annualBudget ?? null,
          targetRevenue: input.targetRevenue ?? null,
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
   * Ownership verified by strategyProcedure middleware.
   */
  getById: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      // ctx.strategy proves ownership; re-fetch with pillars included
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        include: {
          pillars: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!strategy) {
        throwNotFound(AppErrors.STRATEGY_NOT_FOUND);
      }

      return strategy;
    }),

  /**
   * Update strategy fields. Ownership verified by strategyProcedure middleware.
   */
  update: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        name: z.string().min(1).optional(),
        brandName: z.string().min(1).optional(),
        tagline: z.string().optional(),
        sector: z.string().optional(),
        description: z.string().optional(),
        interviewData: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())])).optional(),
        currency: z.string().optional(),
        country: z.string().length(2).nullable().optional(),
        deliveryMode: z.string().nullable().optional(),
        annualBudget: z.number().int().positive().nullable().optional(),
        targetRevenue: z.number().int().positive().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // ctx.strategy proves ownership — no manual check needed
      const { strategyId, ...rawData } = input;

      // Filter out undefined fields to prevent Prisma from overwriting
      // existing values with null when only some fields are updated.
      const data: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(rawData)) {
        if (value !== undefined) {
          data[key] = value;
        }
      }

      if (Object.keys(data).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Aucun champ à mettre à jour",
        });
      }

      const strategy = await ctx.db.strategy.update({
        where: { id: strategyId },
        data,
        include: {
          pillars: {
            orderBy: { order: "asc" },
          },
        },
      });

      // Sync interview variables to BrandVariable registry if interviewData changed
      if (input.interviewData && typeof input.interviewData === "object") {
        const entries: BatchVariableEntry[] = Object.entries(
          input.interviewData as Record<string, string>,
        )
          .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
          .map(([varId, value]) => ({
            key: `interview.${varId}`,
            value,
            options: { source: "user_input" as const, changedBy: ctx.session.user.id },
          }));
        if (entries.length > 0) {
          void setVariablesBatch(strategyId, entries);
          void propagateStaleness(strategyId, entries.map((e) => e.key));
        }
      }

      return strategy;
    }),

  /**
   * Delete a strategy (cascade deletes pillars). Ownership verified by strategyProcedure middleware.
   */
  delete: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ctx.strategy proves ownership — no manual check needed
      await ctx.db.strategy.delete({
        where: { id: input.strategyId },
      });

      return { success: true };
    }),

  /**
   * Duplicate a strategy and all its pillars.
   * Appends " (copie)" to the name and resets status to "draft".
   * Ownership verified by strategyProcedure middleware.
   */
  duplicate: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ctx.strategy proves ownership; re-fetch with pillars for duplication
      const source = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        include: {
          pillars: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!source) {
        throwNotFound(AppErrors.STRATEGY_NOT_FOUND);
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
   * Archive a strategy. Ownership verified by strategyProcedure middleware.
   */
  archive: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ctx.strategy proves ownership — no manual check needed
      const strategy = await ctx.db.strategy.update({
        where: { id: input.strategyId },
        data: { status: "archived" },
      });

      return strategy;
    }),

  /**
   * Unarchive a strategy (set status back to "draft"). Ownership verified by strategyProcedure middleware.
   */
  unarchive: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ctx.strategy proves ownership — no manual check needed
      const strategy = await ctx.db.strategy.update({
        where: { id: input.strategyId },
        data: { status: "draft" },
      });

      return strategy;
    }),

  /**
   * Update the interviewData JSON field. Ownership verified by strategyProcedure middleware.
   * Values are trimmed strings keyed by variable IDs (e.g. A1, D3).
   */
  updateInterviewData: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        data: z.record(
          z.string().regex(/^[A-Z]\d{1,2}$/, "Clé de variable invalide"),
          z.string().max(10000, "La réponse ne doit pas dépasser 10 000 caractères").transform((v) => v.trim()),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // ctx.strategy proves ownership — no manual check needed
      const strategy = await ctx.db.strategy.update({
        where: { id: input.strategyId },
        data: { interviewData: input.data },
      });

      // Sync to BrandVariable registry (fire-and-forget)
      const entries: BatchVariableEntry[] = Object.entries(input.data)
        .filter(([, v]) => v.trim().length > 0)
        .map(([varId, value]) => ({
          key: `interview.${varId}`,
          value,
          options: { source: "user_input" as const, changedBy: ctx.session.user.id },
        }));
      if (entries.length > 0) {
        void setVariablesBatch(input.strategyId, entries);
        void propagateStaleness(input.strategyId, entries.map((e) => e.key));
      }

      return strategy;
    }),

  /**
   * Confirm file import: merge mapped variables into interviewData.
   * Updates the ImportedFile status to "confirmed".
   * Ownership verified by strategyProcedure middleware.
   */
  confirmImport: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        importedFileId: z.string(),
        confirmedData: z.record(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // ctx.strategy proves ownership — no manual check needed

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
      const existingData = (ctx.strategy.interviewData as Record<string, string>) ?? {};
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

      // Sync imported data to BrandVariable registry (fire-and-forget)
      const importEntries: BatchVariableEntry[] = Object.entries(input.confirmedData)
        .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
        .map(([varId, value]) => ({
          key: `interview.${varId}`,
          value,
          options: {
            source: "file_import" as const,
            sourceDetail: importedFile.fileName ?? undefined,
            changedBy: ctx.session.user.id,
          },
        }));
      if (importEntries.length > 0) {
        void setVariablesBatch(input.strategyId, importEntries);
        void propagateStaleness(input.strategyId, importEntries.map((e) => e.key));
      }

      return updatedStrategy;
    }),

  /**
   * Advance the strategy to the next phase.
   * Validates that the transition is allowed.
   * Ownership verified by strategyProcedure middleware.
   */
  advancePhase: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
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
      // ctx.strategy proves ownership — use it directly for phase validation
      const transition = validatePhaseTransition(ctx.strategy.phase, input.targetPhase);
      if (!transition.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: transition.error!,
        });
      }

      const updatedStrategy = await ctx.db.strategy.update({
        where: { id: input.strategyId },
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
   * Ownership verified by strategyProcedure middleware.
   */
  revertPhase: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
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
      // ctx.strategy proves ownership — use it directly for phase validation
      const reversion = validatePhaseReversion(ctx.strategy.phase, input.targetPhase);
      if (!reversion.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: reversion.error!,
        });
      }

      const updatedStrategy = await ctx.db.strategy.update({
        where: { id: input.strategyId },
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
   * Ownership verified by strategyProcedure middleware.
   */
  validateFicheReview: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        interviewData: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())])),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // ctx.strategy proves ownership — use it directly for phase check
      if (ctx.strategy.phase !== "fiche-review") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `La stratégie doit être en phase "fiche-review" pour valider la fiche. Phase actuelle : "${ctx.strategy.phase}"`,
        });
      }

      const updatedStrategy = await ctx.db.strategy.update({
        where: { id: input.strategyId },
        data: {
          interviewData: input.interviewData as never,
          phase: "audit-r",
          status: "generating",
        },
        include: { pillars: { orderBy: { order: "asc" } } },
      });

      // Recalculate scores after fiche review validation
      void recalculateAllScores(input.strategyId, "fiche_review");

      // Sync review data to BrandVariable registry (fire-and-forget)
      if (input.interviewData && typeof input.interviewData === "object") {
        const reviewEntries: BatchVariableEntry[] = Object.entries(
          input.interviewData as Record<string, string>,
        )
          .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
          .map(([varId, value]) => ({
            key: `interview.${varId}`,
            value,
            options: { source: "user_input" as const, changedBy: ctx.session.user.id },
          }));
        if (reviewEntries.length > 0) {
          void setVariablesBatch(input.strategyId, reviewEntries);
          void propagateStaleness(input.strategyId, reviewEntries.map((e) => e.key));
        }
      }

      return updatedStrategy;
    }),

  /**
   * Validate the audit review: save edited R+T data and advance to implementation phase.
   * Called when the user finishes reviewing/editing the audit results.
   * Ownership verified by strategyProcedure middleware.
   */
  validateAuditReview: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        riskAuditData: z.record(z.string(), z.unknown()),
        trackAuditData: z.record(z.string(), z.unknown()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // ctx.strategy proves ownership; re-fetch with pillars for R/T lookup
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        include: {
          pillars: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!strategy) {
        throwNotFound(AppErrors.STRATEGY_NOT_FOUND);
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
          where: { id: input.strategyId },
          data: {
            phase: "implementation",
            status: "generating",
          },
          include: { pillars: { orderBy: { order: "asc" } } },
        }),
        ctx.db.pillar.update({
          where: { id: pillarR.id },
          data: {
            content: input.riskAuditData as never,
          },
        }),
        ctx.db.pillar.update({
          where: { id: pillarT.id },
          data: {
            content: input.trackAuditData as never,
          },
        }),
      ]);

      // Recalculate scores after audit review validation
      void recalculateAllScores(input.strategyId, "audit_review");

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
   * Ownership verified by strategyProcedure middleware.
   */
  getTree: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      // ctx.strategy proves ownership; re-fetch with nested children includes
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
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

      if (!strategy) {
        throwNotFound(AppErrors.STRATEGY_NOT_FOUND);
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
   * Ownership verified by strategyProcedure middleware.
   */
  getChildren: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      // ctx.strategy proves ownership — no manual check needed
      return ctx.db.strategy.findMany({
        where: { parentId: input.strategyId },
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

  /**
   * Update per-phase AI model configuration.
   * Ownership verified by strategyProcedure middleware.
   */
  updateModelConfig: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        phase: z.string(),
        modelId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate phase
      if (!AI_PHASES.includes(input.phase as Phase)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Phase "${input.phase}" ne supporte pas la sélection de modèle`,
        });
      }

      // Validate model
      const validModelIds = AVAILABLE_MODELS.map((m) => m.id);
      if (!validModelIds.includes(input.modelId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Modèle "${input.modelId}" non disponible`,
        });
      }

      // Merge into existing modelConfig
      const existing = (ctx.strategy.modelConfig as Record<string, string> | null) ?? {};
      const updated = { ...existing, [input.phase]: input.modelId };

      return ctx.db.strategy.update({
        where: { id: input.strategyId },
        data: { modelConfig: updated },
      });
    }),
});
