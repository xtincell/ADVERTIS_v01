// =============================================================================
// MCP Server — Creative ("Le Moteur")
// =============================================================================
// 39+ GLORY tools dynamically registered from the GLORY registry, plus
// audit and implementation generators. 4 resources.
//
// The key insight: every GLORY tool shares the same execution interface
// (generateGloryOutput), so we auto-register from the registry.
// =============================================================================

import { z, type ZodTypeAny } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAuthContext } from "../auth";
import { resolveStrategyId } from "../create-server";
import { formatResult, formatError, formatResource } from "../utils";
import type { GloryToolInput } from "~/lib/types/glory-tools";
import { GLORY_TOOLS } from "~/server/services/glory/registry";

// ---------------------------------------------------------------------------
// Zod schema builder: GloryToolInput[] → Record<string, ZodType>
// ---------------------------------------------------------------------------

function buildZodShape(
  inputs: GloryToolInput[],
): Record<string, ZodTypeAny> {
  const shape: Record<string, ZodTypeAny> = {};

  for (const input of inputs) {
    let field: ZodTypeAny;

    switch (input.type) {
      case "number":
        field = z.number().describe(input.helpText ?? input.label);
        break;
      case "toggle":
        field = z.boolean().describe(input.helpText ?? input.label);
        break;
      case "select":
        if (input.options && input.options.length > 0) {
          const values = input.options.map((o) => o.value);
          field = z
            .enum(values as [string, ...string[]])
            .describe(input.helpText ?? input.label);
        } else {
          field = z.string().describe(input.helpText ?? input.label);
        }
        break;
      case "multiselect":
        if (input.options && input.options.length > 0) {
          const values = input.options.map((o) => o.value);
          field = z
            .array(z.enum(values as [string, ...string[]]))
            .describe(input.helpText ?? input.label);
        } else {
          field = z.array(z.string()).describe(input.helpText ?? input.label);
        }
        break;
      default:
        // text, textarea
        field = z.string().describe(input.helpText ?? input.label);
        break;
    }

    if (!input.required) {
      field = field.optional();
    }

    shape[input.key] = field;
  }

  return shape;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerCreativeServer(
  server: McpServer,
  ctx: McpAuthContext,
): void {
  // =========================================================================
  // GLORY TOOLS (dynamically registered)
  // =========================================================================

  // P2-23: Track registered slugs to detect duplicates
  const registeredSlugs = new Set<string>();

  for (const tool of GLORY_TOOLS) {
    // P2-23: Validate tool descriptor before building schema
    if (!tool.slug || !tool.name || !tool.description) {
      console.warn(`[MCP Creative] Skipping tool with invalid descriptor: ${JSON.stringify({ slug: tool.slug, name: tool.name })}`);
      continue;
    }
    if (registeredSlugs.has(tool.slug)) {
      console.warn(`[MCP Creative] Duplicate tool slug detected: ${tool.slug}, skipping`);
      continue;
    }
    registeredSlugs.add(tool.slug);

    const inputShape = buildZodShape(tool.inputs);

    // Add strategyId to every tool
    inputShape.strategyId = z
      .string()
      .optional()
      .describe("Strategy ID (uses API key scope if omitted)");

    // Add optional save flag
    inputShape.save = z
      .boolean()
      .optional()
      .describe("Whether to persist the output (default: true)");

    // Add optional title
    inputShape.title = z
      .string()
      .optional()
      .describe("Custom title for the saved output");

    server.registerTool(
      tool.slug,
      {
        title: tool.name,
        description: `[${tool.layer}] ${tool.description}`,
        inputSchema: inputShape,
      },
      async (args: Record<string, unknown>) => {
        try {
          const { generateGloryOutput } = await import(
            "~/server/services/glory/generation"
          );
          const strategyId = await resolveStrategyId(
            args.strategyId as string | undefined,
            ctx,
          );

          // Extract user inputs (everything except strategyId, save, title)
          const userInputs: Record<string, unknown> = {};
          for (const input of tool.inputs) {
            if (args[input.key] !== undefined) {
              userInputs[input.key] = args[input.key];
            }
          }

          const result = await generateGloryOutput({
            toolSlug: tool.slug,
            strategyId,
            userInputs,
            userId: ctx.userId,
            save: (args.save as boolean) ?? true,
            title: args.title as string | undefined,
          });

          return formatResult({
            outputData: result.outputData,
            outputText: result.outputText,
            savedId: result.savedId,
          });
        } catch (e) {
          return formatError(e);
        }
      },
    );
  }

  // =========================================================================
  // EXTRA TOOLS (non-GLORY)
  // =========================================================================

  // --- generate_risk_audit ---
  server.registerTool(
    "generate_risk_audit",
    {
      description:
        "Generate a strategic risk audit for the brand based on its ADVE pillars.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
      },
    },
    async (args) => {
      try {
        const { generateRiskAudit } = await import("~/server/services/audit-generation");
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const strategy = await db.strategy.findUniqueOrThrow({
          where: { id: strategyId },
          include: { pillars: true },
        });
        const interviewData = (strategy.interviewData as Record<string, string>) ?? {};
        const ficheContent = strategy.pillars.map((p) => ({
          type: p.type,
          content: typeof p.content === "string" ? p.content : JSON.stringify(p.content),
        }));
        const audit = await generateRiskAudit(
          interviewData,
          ficheContent,
          strategy.brandName,
          strategy.sector ?? "",
        );
        return formatResult(audit);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- generate_track_audit ---
  server.registerTool(
    "generate_track_audit",
    {
      description:
        "Generate a track audit evaluating strategy execution across channels. Requires risk audit to exist.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
      },
    },
    async (args) => {
      try {
        const { generateTrackAudit } = await import("~/server/services/audit-generation");
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const strategy = await db.strategy.findUniqueOrThrow({
          where: { id: strategyId },
          include: { pillars: true },
        });
        // Load existing risk audit from translation documents
        const riskDoc = await db.translationDocument.findFirst({
          where: { strategyId, type: "RISK_AUDIT" },
          orderBy: { generatedAt: "desc" },
        });
        if (!riskDoc?.content) {
          throw new Error("Risk audit not found. Generate risk audit first.");
        }
        const interviewData = (strategy.interviewData as Record<string, string>) ?? {};
        const ficheContent = strategy.pillars.map((p) => ({
          type: p.type,
          content: typeof p.content === "string" ? p.content : JSON.stringify(p.content),
        }));
        const riskResults = riskDoc.content as Parameters<typeof generateTrackAudit>[2];
        const audit = await generateTrackAudit(
          interviewData,
          ficheContent,
          riskResults,
          strategy.brandName,
          strategy.sector ?? "",
        );
        return formatResult(audit);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- generate_implementation ---
  server.registerTool(
    "generate_implementation",
    {
      description:
        "Generate implementation data (action plan, timeline, KPIs) from the strategy. Requires both audits.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
      },
    },
    async (args) => {
      try {
        const { generateImplementationData } = await import(
          "~/server/services/implementation-generation"
        );
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const strategy = await db.strategy.findUniqueOrThrow({
          where: { id: strategyId },
          include: { pillars: true },
        });
        // Load existing audits
        const [riskDoc, trackDoc] = await Promise.all([
          db.translationDocument.findFirst({
            where: { strategyId, type: "RISK_AUDIT" },
            orderBy: { generatedAt: "desc" },
          }),
          db.translationDocument.findFirst({
            where: { strategyId, type: "TRACK_AUDIT" },
            orderBy: { generatedAt: "desc" },
          }),
        ]);
        if (!riskDoc?.content || !trackDoc?.content) {
          throw new Error("Both risk and track audits are required. Generate them first.");
        }
        const interviewData = (strategy.interviewData as Record<string, string>) ?? {};
        const ficheContent = strategy.pillars.map((p) => ({
          type: p.type,
          content: typeof p.content === "string" ? p.content : JSON.stringify(p.content),
        }));
        const data = await generateImplementationData(
          interviewData,
          riskDoc.content as Parameters<typeof generateImplementationData>[1],
          trackDoc.content as Parameters<typeof generateImplementationData>[2],
          ficheContent,
          strategy.brandName,
          strategy.sector ?? "",
        );
        return formatResult(data);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // =========================================================================
  // RESOURCES
  // =========================================================================

  // --- GLORY catalog (static) ---
  server.registerResource(
    "glory-catalog",
    "advertis://glory/catalog",
    {
      description:
        "Complete catalog of GLORY creative tools with their inputs, layers, and descriptions",
    },
    async (uri) => {
      const catalog = GLORY_TOOLS.map((t) => ({
        slug: t.slug,
        name: t.name,
        shortName: t.shortName,
        layer: t.layer,
        description: t.description,
        inputs: t.inputs.map((i) => ({
          key: i.key,
          label: i.label,
          type: i.type,
          required: i.required ?? false,
        })),
        persistable: t.persistable,
        tags: t.tags,
      }));
      return formatResource(uri.toString(), catalog);
    },
  );

  // --- GLORY outputs ---
  server.registerResource(
    "glory-outputs",
    new ResourceTemplate("advertis://strategy/{strategyId}/glory-outputs", {
      list: undefined,
    }),
    { description: "All saved GLORY outputs for a strategy" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(
          variables.strategyId as string,
          ctx,
        );
        const outputs = await db.gloryOutput.findMany({
          where: { strategyId },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            toolSlug: true,
            title: true,
            outputText: true,
            createdAt: true,
          },
        });
        return formatResource(uri.toString(), outputs);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- Translation documents ---
  server.registerResource(
    "documents",
    new ResourceTemplate("advertis://strategy/{strategyId}/documents", {
      list: undefined,
    }),
    { description: "Translation documents (fiches) for a strategy" },
    async (uri, variables) => {
      try {
        const { db } = await import("~/server/db");
        const strategyId = await resolveStrategyId(
          variables.strategyId as string,
          ctx,
        );
        const docs = await db.translationDocument.findMany({
          where: { strategyId },
          orderBy: { generatedAt: "desc" },
          take: 20,
        });
        return formatResource(uri.toString(), docs);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- Layer templates (static) ---
  server.registerResource(
    "glory-layers",
    "advertis://glory/layers",
    {
      description: "GLORY tool layers: CR (Concepteur-Rédacteur), DC (Direction de Création), HYBRID, BRAND",
    },
    async (uri) => {
      const layers: Record<string, { tools: string[]; count: number }> = {};
      for (const t of GLORY_TOOLS) {
        if (!layers[t.layer]) {
          layers[t.layer] = { tools: [], count: 0 };
        }
        layers[t.layer]!.tools.push(t.slug);
        layers[t.layer]!.count++;
      }
      return formatResource(uri.toString(), layers);
    },
  );
}
