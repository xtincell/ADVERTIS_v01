// =============================================================================
// MCP Server — Intelligence ("Le Cerveau")
// =============================================================================
// Brand intelligence: scores, pillars, frameworks, variables, freshness.
// 9 tools + 6 resources. Wraps existing services with zero logic duplication.
// =============================================================================

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAuthContext } from "../auth";
import { resolveStrategyId } from "../create-server";
import { formatResult, formatError, formatResource } from "../utils";

// ---------------------------------------------------------------------------
// Lazy service imports (tree-shaking friendly)
// ---------------------------------------------------------------------------

async function loadServices() {
  const [
    { recalculateAllScores },
    { getStrategyFreshnessReport },
    { getVariables, getVariablesByPillar, getStaleVariables, setVariable, getHistory },
    { executeFramework },
    { materializePillar },
  ] = await Promise.all([
    import("~/server/services/score-engine"),
    import("~/server/services/freshness-checker"),
    import("~/server/services/variable-store"),
    import("~/server/services/framework-executor"),
    import("~/server/services/pillar-materializer"),
  ]);
  return {
    recalculateAllScores,
    getStrategyFreshnessReport,
    getVariables,
    getVariablesByPillar,
    getStaleVariables,
    setVariable,
    getHistory,
    executeFramework,
    materializePillar,
  };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerIntelligenceServer(
  server: McpServer,
  ctx: McpAuthContext,
): void {
  // =========================================================================
  // TOOLS
  // =========================================================================

  // --- recalculate_scores ---
  server.registerTool(
    "recalculate_scores",
    {
      description:
        "Recalculate all strategy scores (Coherence, Risk, BMF, Investment). Returns the full breakdown.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        trigger: z
          .enum(["pillar_update", "audit_review", "fiche_review", "manual", "generation"])
          .optional()
          .describe("What triggered the recalculation"),
      },
    },
    async (args) => {
      try {
        const { recalculateAllScores } = await loadServices();
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const scores = await recalculateAllScores(strategyId, args.trigger ?? "manual");
        return formatResult(scores);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- check_freshness ---
  server.registerTool(
    "check_freshness",
    {
      description:
        "Get the freshness report for a strategy. Shows which documents are FRESH, AGING, or STALE.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
      },
    },
    async (args) => {
      try {
        const { getStrategyFreshnessReport } = await loadServices();
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const report = await getStrategyFreshnessReport(strategyId);
        return formatResult(report);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- run_framework ---
  server.registerTool(
    "run_framework",
    {
      description:
        "Execute an ARTEMIS framework for a strategy. Returns execution result with runId.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        frameworkId: z.string().describe("Framework identifier to execute"),
      },
    },
    async (args) => {
      try {
        const { executeFramework } = await loadServices();
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const result = await executeFramework(args.frameworkId, strategyId, ctx.userId);
        return formatResult(result);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_variables ---
  server.registerTool(
    "get_variables",
    {
      description:
        "Read BrandVariables for a strategy. Can filter by specific keys or by pillar type (A/D/V/E/S).",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        keys: z.array(z.string()).optional().describe("Specific variable keys to retrieve"),
        pillarType: z.string().optional().describe("Pillar letter (A/D/V/E/S) to filter by"),
      },
    },
    async (args) => {
      try {
        const { getVariables, getVariablesByPillar } = await loadServices();
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const variables = args.pillarType
          ? await getVariablesByPillar(strategyId, args.pillarType)
          : await getVariables(strategyId, args.keys);
        return formatResult(variables);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- set_variable ---
  server.registerTool(
    "set_variable",
    {
      description:
        "Create or update a single BrandVariable. Automatically snapshots history.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        key: z.string().describe("Variable key (e.g., 'A.positioning.statement')"),
        value: z.any().describe("New value for the variable (string, number, object, or array)"),
        source: z
          .enum(["MANUAL", "AI_GENERATED", "INTERVIEW", "FRAMEWORK", "IMPORT"])
          .optional()
          .describe("Source of this value"),
        confidence: z
          .enum(["LOW", "MEDIUM", "HIGH"])
          .optional()
          .describe("Confidence level"),
        changeNote: z.string().optional().describe("Note explaining the change"),
      },
    },
    async (args) => {
      try {
        const { setVariable } = await loadServices();
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const sourceMap: Record<string, string> = {
          MANUAL: "manual_edit",
          AI_GENERATED: "ai_generation",
          INTERVIEW: "user_input",
          FRAMEWORK: "framework",
          IMPORT: "file_import",
        };
        const variable = await setVariable(strategyId, args.key, args.value, {
          source: (sourceMap[args.source ?? "MANUAL"] ?? "manual_edit") as Parameters<typeof setVariable>[3]["source"],
          confidence: args.confidence ?? "MEDIUM",
          changedBy: ctx.userId,
          changeNote: args.changeNote,
        });
        return formatResult(variable);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_stale_variables ---
  server.registerTool(
    "get_stale_variables",
    {
      description:
        "Get all stale BrandVariables for a strategy. These need refreshing.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
      },
    },
    async (args) => {
      try {
        const { getStaleVariables } = await loadServices();
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const variables = await getStaleVariables(strategyId);
        return formatResult(variables);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- materialize_pillar ---
  server.registerTool(
    "materialize_pillar",
    {
      description:
        "Reconstruct a pillar's JSON content from individual BrandVariables. Reverse of variable extraction.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        pillarType: z
          .string()
          .describe("Pillar letter to materialize (A/D/V/E/S)"),
      },
    },
    async (args) => {
      try {
        const { materializePillar } = await loadServices();
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const content = await materializePillar(strategyId, args.pillarType);
        return formatResult(content);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_variable_history ---
  server.registerTool(
    "get_variable_history",
    {
      description:
        "Get the version history for a specific BrandVariable by strategy + key.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        key: z.string().describe("Variable key (e.g., 'A.positioning.statement')"),
      },
    },
    async (args) => {
      try {
        const { getHistory } = await loadServices();
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const history = await getHistory(strategyId, args.key);
        return formatResult(history);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- generate_pillar ---
  server.registerTool(
    "generate_pillar",
    {
      description:
        "Generate strategic content for an ADVERTIS pillar using AI. Requires interview data from the strategy.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        pillarType: z
          .enum(["A", "D", "V", "E", "R", "T", "I", "S"])
          .describe("Pillar to generate: A(uthenticité), D(istinction), V(aleur), E(ngagement), R(ituel), T(ribu), I(mpact), S(ynthèse)"),
      },
    },
    async (args) => {
      try {
        const { generatePillarContent } = await import("~/server/services/ai-generation");
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);

        // Load strategy context
        const strategy = await db.strategy.findUniqueOrThrow({
          where: { id: strategyId },
          include: { pillars: true },
        });

        const interviewData =
          (strategy.interviewData as Record<string, string>) ?? {};
        const previousPillars = strategy.pillars
          .filter((p) => p.type !== args.pillarType)
          .map((p) => ({
            type: p.type,
            content: typeof p.content === "string" ? p.content : JSON.stringify(p.content),
          }));

        const result = await generatePillarContent(
          args.pillarType,
          interviewData,
          previousPillars,
          strategy.brandName,
          strategy.sector ?? "",
          undefined,
          strategy.tagline,
          strategy.currency as Parameters<typeof generatePillarContent>[7],
        );

        return formatResult(result);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // =========================================================================
  // RESOURCES
  // =========================================================================

  // --- pillars ---
  server.registerResource(
    "pillars",
    new ResourceTemplate("advertis://strategy/{strategyId}/pillars", {
      list: undefined,
    }),
    { description: "All pillars for a strategy with their generated content" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(
          variables.strategyId as string,
          ctx,
        );
        const pillars = await db.pillar.findMany({
          where: { strategyId },
          orderBy: { type: "asc" },
        });
        return formatResource(uri.toString(), pillars);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- scores ---
  server.registerResource(
    "scores",
    new ResourceTemplate("advertis://strategy/{strategyId}/scores", {
      list: undefined,
    }),
    { description: "Score snapshots (Coherence, Risk, BMF, Investment) with historical trends" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(
          variables.strategyId as string,
          ctx,
        );
        const snapshots = await db.scoreSnapshot.findMany({
          where: { strategyId },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
        return formatResource(uri.toString(), snapshots);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- variables ---
  server.registerResource(
    "variables",
    new ResourceTemplate("advertis://strategy/{strategyId}/variables", {
      list: undefined,
    }),
    { description: "All BrandVariables for a strategy — the atomized knowledge graph" },
    async (uri, variables) => {
      try {
        const { getVariables } = await loadServices();
        const strategyId = await resolveStrategyId(
          variables.strategyId as string,
          ctx,
        );
        const vars = await getVariables(strategyId);
        return formatResource(uri.toString(), vars);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- frameworks ---
  server.registerResource(
    "frameworks",
    new ResourceTemplate("advertis://strategy/{strategyId}/frameworks", {
      list: undefined,
    }),
    { description: "Framework execution outputs for a strategy (ARTEMIS results)" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(
          variables.strategyId as string,
          ctx,
        );
        const outputs = await db.frameworkOutput.findMany({
          where: { strategyId },
          orderBy: { updatedAt: "desc" },
        });
        return formatResource(uri.toString(), outputs);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- freshness ---
  server.registerResource(
    "freshness",
    new ResourceTemplate("advertis://strategy/{strategyId}/freshness", {
      list: undefined,
    }),
    { description: "Data freshness report — shows which data is FRESH, AGING, or STALE" },
    async (uri, variables) => {
      try {
        const { getStrategyFreshnessReport } = await loadServices();
        const strategyId = await resolveStrategyId(
          variables.strategyId as string,
          ctx,
        );
        const report = await getStrategyFreshnessReport(strategyId);
        return formatResource(uri.toString(), report);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- methodology (static) ---
  server.registerResource(
    "methodology",
    "advertis://methodology",
    {
      description:
        "The ADVERTIS methodology — 5 strategic pillars (A-D-V-E-S), 4 quantitative scores, variable system, and framework architecture",
    },
    async (uri) => {
      return formatResource(uri.toString(), {
        name: "ADVERTIS Methodology",
        version: "1.0",
        pillars: [
          { letter: "A", name: "Authenticité", description: "Founding mythology, DNA, heritage" },
          { letter: "D", name: "Distinction", description: "Positioning, competitive territory, uniqueness" },
          { letter: "V", name: "Valeur", description: "Value proposition, pricing strategy, business model" },
          { letter: "E", name: "Engagement", description: "Community, rituals, emotional connection" },
          { letter: "S", name: "Synthèse", description: "Strategic synthesis across all pillars" },
        ],
        scores: [
          { name: "Coherence", range: "0-100", description: "Internal consistency of brand strategy" },
          { name: "Risk", range: "0-100", description: "Strategic vulnerability assessment" },
          { name: "BMF (Brand-Market Fit)", range: "0-100", description: "Alignment with market expectations" },
          { name: "Investment Readiness", range: "0-100", description: "Readiness for investment" },
        ],
        systems: [
          "BrandVariable Store — Atomized knowledge graph with staleness tracking",
          "ARTEMIS Frameworks — Modular analytical frameworks (BCG, Porter, etc.)",
          "GLORY Tools — 39+ creative and strategic generation tools",
          "Cult Index — Proprietary brand cult-status measurement",
        ],
      });
    },
  );
}
