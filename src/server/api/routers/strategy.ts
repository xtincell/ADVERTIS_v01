import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { PILLAR_TYPES, PILLAR_CONFIG, PHASES, SKIPPABLE_PHASES, LEGACY_PHASE_MAP } from "~/lib/constants";
import type { Phase } from "~/lib/constants";

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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.db.strategy.create({
        data: {
          name: input.name,
          brandName: input.brandName,
          sector: input.sector,
          description: input.description,
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
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const strategies = await ctx.db.strategy.findMany({
      where: { userId: ctx.session.user.id },
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
        sector: z.string().optional(),
        description: z.string().optional(),
        interviewData: z.any().optional(),
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

      // Resolve legacy phase names for backward compatibility
      const resolvedPhase = LEGACY_PHASE_MAP[strategy.phase] ?? strategy.phase;

      // Validate phase transition order
      const currentPhaseIndex = PHASES.indexOf(resolvedPhase as Phase);
      const targetPhaseIndex = PHASES.indexOf(input.targetPhase);

      if (currentPhaseIndex === -1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Phase actuelle inconnue : "${strategy.phase}"`,
        });
      }

      if (targetPhaseIndex <= currentPhaseIndex) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Impossible de revenir à la phase "${input.targetPhase}" depuis "${strategy.phase}"`,
        });
      }

      // Allow skipping skippable phases (e.g., market-study)
      // Check that we're jumping at most over skippable phases
      if (targetPhaseIndex > currentPhaseIndex + 1) {
        const skippedPhases = PHASES.slice(currentPhaseIndex + 1, targetPhaseIndex);
        const allSkippable = skippedPhases.every((p) => SKIPPABLE_PHASES.includes(p));

        if (!allSkippable) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Impossible de sauter directement à la phase "${input.targetPhase}". Complétez d'abord la phase en cours.`,
          });
        }
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

      // Resolve legacy phase names
      const resolvedPhase = LEGACY_PHASE_MAP[strategy.phase] ?? strategy.phase;
      const currentPhaseIndex = PHASES.indexOf(resolvedPhase as Phase);
      const targetPhaseIndex = PHASES.indexOf(input.targetPhase);

      if (currentPhaseIndex === -1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Phase actuelle inconnue : "${strategy.phase}"`,
        });
      }

      if (targetPhaseIndex >= currentPhaseIndex) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Impossible de revenir à la phase "${input.targetPhase}" — la stratégie est déjà en phase "${strategy.phase}" ou antérieure.`,
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

      return updatedStrategy;
    }),
});
