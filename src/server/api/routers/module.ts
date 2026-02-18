import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getAllModules, getModule, getModulesForPillar, executeModule } from "~/server/services/modules";

export const moduleRouter = createTRPCRouter({
  /**
   * List all registered modules, optionally filtered by pillar type.
   */
  list: protectedProcedure
    .input(
      z.object({
        pillarType: z.string().optional(),
      }).optional(),
    )
    .query(({ input }) => {
      const modules = input?.pillarType
        ? getModulesForPillar(input.pillarType)
        : getAllModules();

      return modules.map((m) => ({
        id: m.descriptor.id,
        name: m.descriptor.name,
        description: m.descriptor.description,
        category: m.descriptor.category,
        inputs: m.descriptor.inputs,
        outputs: m.descriptor.outputs,
        autoTrigger: m.descriptor.autoTrigger,
      }));
    }),

  /**
   * Execute a module for a strategy.
   */
  execute: protectedProcedure
    .input(
      z.object({
        moduleId: z.string(),
        strategyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const handler = getModule(input.moduleId);
      if (!handler) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Module non trouvé : ${input.moduleId}`,
        });
      }

      const result = await executeModule(
        input.moduleId,
        input.strategyId,
        ctx.session.user.id,
        "manual",
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error ?? "Erreur d'exécution du module",
        });
      }

      return { runId: result.runId };
    }),

  /**
   * Get module run history for a strategy.
   */
  getRuns: protectedProcedure
    .input(
      z.object({
        strategyId: z.string(),
        moduleId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify strategy ownership
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        select: { userId: true },
      });

      if (!strategy || strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stratégie non trouvée",
        });
      }

      const runs = await ctx.db.moduleRun.findMany({
        where: {
          strategyId: input.strategyId,
          ...(input.moduleId ? { moduleId: input.moduleId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return runs;
    }),

  /**
   * Get a single module run by ID.
   */
  getRunById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const run = await ctx.db.moduleRun.findUnique({
        where: { id: input.id },
        include: {
          strategy: { select: { userId: true } },
        },
      });

      if (!run || run.strategy.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Exécution non trouvée",
        });
      }

      return run;
    }),
});
