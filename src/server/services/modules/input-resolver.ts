// Input Resolver — Fetches and extracts data from the database
// based on a module's declared ModuleInputSource[].

import { db } from "~/server/db";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type { ModuleDescriptor, ModuleInputSource } from "~/lib/types/module-system";

// ---------------------------------------------------------------------------
// Deep-get utility for dot-notation paths
// ---------------------------------------------------------------------------

function deepGet(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// ---------------------------------------------------------------------------
// Resolve a single input source
// ---------------------------------------------------------------------------

async function resolveSource(
  source: ModuleInputSource,
  strategyId: string,
): Promise<{ key: string; value: unknown }> {
  switch (source.type) {
    case "pillar": {
      const pillar = await db.pillar.findUnique({
        where: { strategyId_type: { strategyId, type: source.pillarType } },
        select: { content: true },
      });
      const { data } = parsePillarContent(source.pillarType, pillar?.content);
      const value = source.path ? deepGet(data, source.path) : data;
      const key = source.path
        ? `pillar_${source.pillarType}_${source.path.replace(/\./g, "_")}`
        : `pillar_${source.pillarType}`;
      return { key, value };
    }

    case "interview": {
      const strategy = await db.strategy.findUnique({
        where: { id: strategyId },
        select: { interviewData: true },
      });
      const interviewData = (strategy?.interviewData ?? {}) as Record<string, string>;
      const extracted: Record<string, string> = {};
      for (const varId of source.variableIds) {
        extracted[varId] = interviewData[varId] ?? "";
      }
      return { key: "interview", value: extracted };
    }

    case "strategy": {
      const strategy = await db.strategy.findUnique({
        where: { id: strategyId },
      });
      if (!strategy) return { key: "strategy", value: {} };
      const extracted: Record<string, unknown> = {};
      for (const field of source.fields) {
        extracted[field] = (strategy as Record<string, unknown>)[field];
      }
      return { key: "strategy", value: extracted };
    }

    case "marketStudy": {
      const ms = await db.marketStudy.findUnique({
        where: { strategyId },
      });
      if (!ms) return { key: "marketStudy", value: null };
      if (!source.fields) return { key: "marketStudy", value: ms };
      const extracted: Record<string, unknown> = {};
      for (const field of source.fields) {
        extracted[field] = (ms as Record<string, unknown>)[field];
      }
      return { key: "marketStudy", value: extracted };
    }

    case "moduleOutput": {
      // Get the most recent successful run of the dependency module
      const run = await db.moduleRun.findFirst({
        where: { strategyId, moduleId: source.moduleId, status: "complete" },
        orderBy: { createdAt: "desc" },
        select: { outputData: true },
      });
      return { key: `module_${source.moduleId}`, value: run?.outputData ?? null };
    }
  }
}

// ---------------------------------------------------------------------------
// Resolve all inputs for a module
// ---------------------------------------------------------------------------

/** Resolve all declared inputs for a module from the database. */
export async function resolveModuleInputs(
  descriptor: ModuleDescriptor,
  strategyId: string,
): Promise<Record<string, unknown>> {
  const results = await Promise.all(
    descriptor.inputs.map((source) => resolveSource(source, strategyId)),
  );

  const inputs: Record<string, unknown> = {};
  for (const { key, value } of results) {
    inputs[key] = value;
  }

  // Also flatten strategy-level fields to top level for convenience
  if (inputs.strategy && typeof inputs.strategy === "object") {
    Object.assign(inputs, inputs.strategy);
  }

  return inputs;
}
