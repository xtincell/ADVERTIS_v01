// =============================================================================
// ROUTER T.19 — Framework Router
// =============================================================================
// ARTEMIS framework system: list, inspect, execute, and track framework runs.
//
// Procedures:
//   list           — List all frameworks (optionally filtered by layer)
//   get            — Get a single framework descriptor by ID
//   getGraph       — Get the full dependency graph + execution order
//   getStale       — Get all stale FrameworkOutputs for a strategy
//   getOutput      — Get the latest FrameworkOutput for a framework + strategy
//   getOutputs     — Get all FrameworkOutputs for a strategy
//   execute        — Execute a framework for a strategy
//   getRunHistory  — Get run history for a strategy (optionally by framework)
//
// Dependencies:
//   ~/server/api/trpc                — createTRPCRouter, protectedProcedure, strategyProcedure
//   ~/lib/framework-registry         — framework descriptors + execution order
//   ~/lib/types/frameworks           — ArtemisLayer type
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, strategyProcedure } from "~/server/api/trpc";
import {
  getAllFrameworks,
  getFramework,
  getFrameworksForLayer,
  getExecutionOrder,
  getImplementedFrameworks,
  getFrameworksForNodeType,
} from "~/lib/framework-registry";
import type { ArtemisLayer } from "~/lib/types/frameworks/framework-descriptor";

// Valid layer values for input validation
const ARTEMIS_LAYERS: [ArtemisLayer, ...ArtemisLayer[]] = [
  "PHILOSOPHY",
  "IDENTITY",
  "VALUE",
  "EXPERIENCE",
  "VALIDATION",
  "EXECUTION",
  "MEASURE",
  "GROWTH",
  "SURVIVAL",
];

export const frameworkRouter = createTRPCRouter({
  /**
   * List all frameworks, optionally filtered by layer or nodeType.
   */
  list: protectedProcedure
    .input(
      z
        .object({
          layer: z.enum(ARTEMIS_LAYERS).optional(),
          nodeType: z.string().optional(),
          implementedOnly: z.boolean().optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      let frameworks = input?.layer
        ? getFrameworksForLayer(input.layer)
        : input?.implementedOnly
          ? getImplementedFrameworks()
          : getAllFrameworks();

      // Filter by nodeType if specified
      if (input?.nodeType) {
        const nodeTypeFrameworks = getFrameworksForNodeType(input.nodeType);
        const nodeTypeIds = new Set(nodeTypeFrameworks.map((f) => f.id));
        frameworks = frameworks.filter((f) => nodeTypeIds.has(f.id));
      }

      return frameworks.map((fw) => ({
        id: fw.id,
        name: fw.name,
        description: fw.description,
        layer: fw.layer,
        category: fw.category,
        hasImplementation: fw.hasImplementation,
        inputCount: fw.inputVariables.length,
        outputCount: fw.outputVariables.length,
        dependsOnCount: fw.dependsOnFrameworks.length,
      }));
    }),

  /**
   * Get a single framework descriptor by ID (full details).
   */
  get: protectedProcedure
    .input(z.object({ frameworkId: z.string() }))
    .query(({ input }) => {
      const fw = getFramework(input.frameworkId);
      if (!fw) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Framework non trouvé : ${input.frameworkId}`,
        });
      }

      return {
        id: fw.id,
        name: fw.name,
        description: fw.description,
        layer: fw.layer,
        category: fw.category,
        hasImplementation: fw.hasImplementation,
        inputVariables: fw.inputVariables,
        outputVariables: fw.outputVariables,
        dependsOnFrameworks: fw.dependsOnFrameworks,
        condition: fw.condition,
      };
    }),

  /**
   * Get the full framework dependency graph and execution order.
   */
  getGraph: protectedProcedure.query(() => {
    const frameworks = getAllFrameworks();
    const executionOrder = getExecutionOrder();

    // Build adjacency list for the graph
    const nodes = frameworks.map((fw) => ({
      id: fw.id,
      name: fw.name,
      layer: fw.layer,
      category: fw.category,
      hasImplementation: fw.hasImplementation,
    }));

    const edges = frameworks.flatMap((fw) =>
      fw.dependsOnFrameworks.map((depId) => ({
        from: depId,
        to: fw.id,
      })),
    );

    return {
      nodes,
      edges,
      executionOrder,
      totalFrameworks: frameworks.length,
      implementedCount: frameworks.filter((f) => f.hasImplementation).length,
    };
  }),

  /**
   * Get all stale FrameworkOutputs for a strategy.
   */
  getStale: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const staleOutputs = await ctx.db.frameworkOutput.findMany({
        where: {
          strategyId: input.strategyId,
          isStale: true,
        },
        orderBy: { updatedAt: "desc" },
      });

      // Enrich with framework metadata
      return staleOutputs.map((output) => {
        const fw = getFramework(output.frameworkId);
        return {
          ...output,
          frameworkName: fw?.name ?? output.frameworkId,
          frameworkLayer: fw?.layer ?? "PHILOSOPHY",
        };
      });
    }),

  /**
   * Get the latest FrameworkOutput for a specific framework + strategy.
   */
  getOutput: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        frameworkId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const output = await ctx.db.frameworkOutput.findUnique({
        where: {
          strategyId_frameworkId: {
            strategyId: input.strategyId,
            frameworkId: input.frameworkId,
          },
        },
      });

      return output;
    }),

  /**
   * Get all FrameworkOutputs for a strategy.
   */
  getOutputs: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        layer: z.enum(ARTEMIS_LAYERS).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const outputs = await ctx.db.frameworkOutput.findMany({
        where: {
          strategyId: input.strategyId,
        },
        orderBy: { updatedAt: "desc" },
      });

      // Enrich with framework metadata + optional layer filter
      const enriched = outputs
        .map((output) => {
          const fw = getFramework(output.frameworkId);
          return {
            ...output,
            frameworkName: fw?.name ?? output.frameworkId,
            frameworkLayer: fw?.layer ?? ("PHILOSOPHY" as ArtemisLayer),
          };
        })
        .filter((o) => !input.layer || o.frameworkLayer === input.layer);

      return enriched;
    }),

  /**
   * Execute a framework for a strategy.
   * Creates a FrameworkRun, delegates to the framework executor (Phase 7.8).
   */
  execute: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        frameworkId: z.string(),
        forceRerun: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fw = getFramework(input.frameworkId);
      if (!fw) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Framework non trouvé : ${input.frameworkId}`,
        });
      }

      if (!fw.hasImplementation) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Framework ${input.frameworkId} (${fw.name}) n'a pas d'implémentation exécutable`,
        });
      }

      // Check if output exists and is not stale (skip unless forceRerun)
      if (!input.forceRerun) {
        const existing = await ctx.db.frameworkOutput.findUnique({
          where: {
            strategyId_frameworkId: {
              strategyId: input.strategyId,
              frameworkId: input.frameworkId,
            },
          },
        });

        if (existing && !existing.isStale) {
          return {
            skipped: true,
            reason: "Output existant et à jour. Utilisez forceRerun pour forcer.",
            outputId: existing.id,
          };
        }
      }

      // Create a FrameworkRun record
      const run = await ctx.db.frameworkRun.create({
        data: {
          frameworkId: input.frameworkId,
          strategyId: input.strategyId,
          userId: ctx.session.user.id,
          status: "pending",
          triggeredBy: "manual",
        },
      });

      // Delegate to framework executor (lazy import to avoid circular deps)
      // The executor will update the run status and create/update FrameworkOutput
      const { executeFramework } = await import(
        "~/server/services/framework-executor"
      );

      // Fire-and-forget for long-running frameworks, or await for compute
      if (fw.category === "ai" || fw.category === "hybrid") {
        // AI frameworks run async — return run ID for polling
        void executeFramework(
          input.frameworkId,
          input.strategyId,
          ctx.session.user.id,
          run.id,
        ).catch(() => {
          // Error is persisted in the FrameworkRun record
        });

        return { skipped: false, runId: run.id, async: true };
      }

      // Compute frameworks run synchronously
      const result = await executeFramework(
        input.frameworkId,
        input.strategyId,
        ctx.session.user.id,
        run.id,
      );

      return {
        skipped: false,
        runId: run.id,
        async: false,
        success: result.success,
        error: result.error,
      };
    }),

  /**
   * Get framework run history for a strategy.
   */
  getRunHistory: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        frameworkId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const runs = await ctx.db.frameworkRun.findMany({
        where: {
          strategyId: input.strategyId,
          ...(input.frameworkId ? { frameworkId: input.frameworkId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      // Enrich with framework names
      return runs.map((run) => {
        const fw = getFramework(run.frameworkId);
        return {
          ...run,
          frameworkName: fw?.name ?? run.frameworkId,
        };
      });
    }),

  /**
   * Execute ARTEMIS orchestration (all or subset of frameworks).
   */
  orchestrate: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        frameworkIds: z.array(z.string()).optional(),
        forceRerun: z.boolean().optional(),
        stopOnError: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { executeArtemisOrchestration } = await import(
        "~/server/services/artemis-orchestrator"
      );

      const result = await executeArtemisOrchestration(
        input.strategyId,
        ctx.session.user.id,
        {
          frameworkIds: input.frameworkIds,
          forceRerun: input.forceRerun,
          stopOnError: input.stopOnError,
        },
      );

      return result;
    }),

  /**
   * Evaluate all 5 quality gates for a strategy.
   */
  getQualityGates: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ input }) => {
      const { evaluateQualityGates } = await import(
        "~/server/services/quality-gates"
      );
      return evaluateQualityGates(input.strategyId);
    }),

  /**
   * Get ARTEMIS global score and layer scores for a strategy.
   */
  getArtemisScore: strategyProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { evaluateQualityGates } = await import(
        "~/server/services/quality-gates"
      );

      const gates = await evaluateQualityGates(input.strategyId);
      const globalScore =
        gates.length > 0
          ? Math.round(gates.reduce((sum, g) => sum + g.score, 0) / gates.length)
          : null;

      // Layer scores
      const allFw = getAllFrameworks();
      const fwOutputs = await ctx.db.frameworkOutput.findMany({
        where: { strategyId: input.strategyId },
        select: { frameworkId: true, isStale: true },
      });
      const outputLookup = new Map(fwOutputs.map((o) => [o.frameworkId, o]));

      const layerScores: Record<string, number> = {};
      const layerGroups = new Map<string, { total: number; fresh: number }>();
      for (const fw of allFw) {
        if (!fw.hasImplementation) continue;
        const entry = layerGroups.get(fw.layer) ?? { total: 0, fresh: 0 };
        entry.total++;
        const output = outputLookup.get(fw.id);
        if (output && !output.isStale) entry.fresh++;
        layerGroups.set(fw.layer, entry);
      }
      for (const [layer, counts] of layerGroups) {
        layerScores[layer] = counts.total > 0
          ? Math.round((counts.fresh / counts.total) * 100)
          : 0;
      }

      return {
        globalScore,
        layerScores,
        gates,
      };
    }),

  /**
   * Get orchestration history (FrameworkRuns grouped by trigger timestamp).
   */
  getOrchestrationHistory: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const runs = await ctx.db.frameworkRun.findMany({
        where: {
          strategyId: input.strategyId,
          triggeredBy: "orchestration",
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      // Enrich with framework names
      return runs.map((run) => {
        const fw = getFramework(run.frameworkId);
        return {
          ...run,
          frameworkName: fw?.name ?? run.frameworkId,
        };
      });
    }),

  /**
   * Get detailed info for a specific ARTEMIS layer.
   */
  getLayerDetail: strategyProcedure
    .input(
      z.object({
        strategyId: z.string(),
        layer: z.enum(ARTEMIS_LAYERS),
      }),
    )
    .query(async ({ ctx, input }) => {
      const layerFrameworks = getFrameworksForLayer(input.layer);

      // Get outputs for these frameworks
      const outputs = await ctx.db.frameworkOutput.findMany({
        where: {
          strategyId: input.strategyId,
          frameworkId: { in: layerFrameworks.map((fw) => fw.id) },
        },
      });
      const outputMap = new Map(outputs.map((o) => [o.frameworkId, o]));

      // Get recent runs
      const runs = await ctx.db.frameworkRun.findMany({
        where: {
          strategyId: input.strategyId,
          frameworkId: { in: layerFrameworks.map((fw) => fw.id) },
        },
        orderBy: { createdAt: "desc" },
        take: layerFrameworks.length * 3,
      });
      const runsByFramework = new Map<string, typeof runs>();
      for (const run of runs) {
        const existing = runsByFramework.get(run.frameworkId) ?? [];
        existing.push(run);
        runsByFramework.set(run.frameworkId, existing);
      }

      const frameworks = layerFrameworks.map((fw) => {
        const output = outputMap.get(fw.id);
        const fwRuns = runsByFramework.get(fw.id) ?? [];
        let status: "complete" | "stale" | "error" | "pending" | "running" = "pending";
        if (output) {
          status = output.isStale ? "stale" : "complete";
        }
        const lastRun = fwRuns[0];
        if (lastRun?.status === "error") status = "error";
        if (lastRun?.status === "running") status = "running";

        return {
          id: fw.id,
          name: fw.name,
          description: fw.description,
          category: fw.category,
          hasImplementation: fw.hasImplementation,
          status,
          lastRunAt: lastRun?.createdAt ?? null,
          lastRunDurationMs: lastRun?.durationMs ?? null,
          outputIsStale: output?.isStale ?? null,
          inputCount: fw.inputVariables.length,
          outputCount: fw.outputVariables.length,
        };
      });

      // Layer score
      const implemented = frameworks.filter((f) => f.hasImplementation);
      const fresh = implemented.filter((f) => f.status === "complete");
      const layerScore = implemented.length > 0
        ? Math.round((fresh.length / implemented.length) * 100)
        : 0;

      return {
        layer: input.layer,
        frameworks,
        layerScore,
        totalFrameworks: frameworks.length,
        implementedCount: implemented.length,
        freshCount: fresh.length,
      };
    }),
});
