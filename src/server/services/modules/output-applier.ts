// =============================================================================
// MODULE 23C — Module Output Applier
// =============================================================================
// Applies module outputs as partial (deep) updates to pillar JSON content.
// Uses dot-notation paths to deep-set values, supports three merge strategies
// (replace, append, merge), then re-validates the updated pillar with its
// Zod schema before persisting.
//
// Public API:
//   applyModuleOutputs(descriptor, strategyId, outputData)
//     -> void (writes to DB)
//
// Internal helpers:
//   deepSet(obj, dotPath, value)     — Dot-notation property setter
//   deepGet(obj, dotPath)            — Dot-notation property getter
//   applyMerge(existing, incoming, strategy) — Replace / append / merge
//
// Dependencies:
//   ~/server/db                      — Prisma client (pillar)
//   ~/lib/types/pillar-parsers       — parsePillarContent
//   ~/lib/types/pillar-schemas       — PILLAR_SCHEMAS (Zod re-validation)
//   ~/lib/types/module-system        — ModuleDescriptor, ModuleOutputTarget
//
// Called by:
//   modules/executor.ts (step 5 of run lifecycle)
//   modules/index.ts (re-exports)
// =============================================================================

import { db } from "~/server/db";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import { PILLAR_SCHEMAS } from "~/lib/types/pillar-schemas";
import type { ModuleDescriptor, ModuleOutputTarget } from "~/lib/types/module-system";

// ---------------------------------------------------------------------------
// Deep-set utility for dot-notation paths
// ---------------------------------------------------------------------------

function deepSet(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const parts = path.split(".");
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (current[part] == null || typeof current[part] !== "object") {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1]!;
  current[lastPart] = value;
}

// ---------------------------------------------------------------------------
// Merge strategies
// ---------------------------------------------------------------------------

function applyMerge(
  existing: unknown,
  incoming: unknown,
  strategy: ModuleOutputTarget["mergeStrategy"],
): unknown {
  switch (strategy) {
    case "replace":
      return incoming;

    case "append":
      if (Array.isArray(existing) && Array.isArray(incoming)) {
        return [...existing, ...incoming];
      }
      if (typeof existing === "string" && typeof incoming === "string") {
        return existing + "\n" + incoming;
      }
      return incoming;

    case "merge":
      if (
        existing != null &&
        typeof existing === "object" &&
        !Array.isArray(existing) &&
        incoming != null &&
        typeof incoming === "object" &&
        !Array.isArray(incoming)
      ) {
        return { ...existing, ...incoming };
      }
      return incoming;
  }
}

// ---------------------------------------------------------------------------
// Deep-get utility
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
// Apply outputs to pillar data
// ---------------------------------------------------------------------------

/** Apply module outputs to the target pillar(s) in the database. */
export async function applyModuleOutputs(
  descriptor: ModuleDescriptor,
  strategyId: string,
  outputData: Record<string, unknown>,
): Promise<void> {
  // Group outputs by pillar type (a module may write to multiple pillars)
  const byPillar = new Map<string, ModuleOutputTarget[]>();
  for (const output of descriptor.outputs) {
    const existing = byPillar.get(output.pillarType) ?? [];
    existing.push(output);
    byPillar.set(output.pillarType, existing);
  }

  // Process each target pillar
  for (const [pillarType, outputs] of byPillar) {
    // 1. Read current pillar content
    const pillar = await db.pillar.findUnique({
      where: { strategyId_type: { strategyId, type: pillarType } },
      select: { id: true, content: true },
    });

    if (!pillar) {
      console.warn(
        `[OutputApplier] Pillar ${pillarType} not found for strategy ${strategyId}`,
      );
      continue;
    }

    // 2. Parse existing content (applies defaults for missing fields)
    const { data: currentData } = parsePillarContent(pillarType, pillar.content);
    const updated = JSON.parse(JSON.stringify(currentData)) as Record<string, unknown>;

    // 3. Apply each output target
    for (const output of outputs) {
      // The output data key matches the path's last segment or the full path
      // Module outputs are flat: { directionArtistique: "...", mood: "..." }
      const incomingValue = outputData[output.path.split(".").pop()!] ?? outputData[output.path];
      if (incomingValue === undefined) continue;

      const existingValue = deepGet(updated, output.path);
      const mergedValue = applyMerge(existingValue, incomingValue, output.mergeStrategy);
      deepSet(updated, output.path, mergedValue);
    }

    // 4. Re-validate with pillar's Zod schema (soft — log warnings, don't block)
    const schema = PILLAR_SCHEMAS[pillarType];
    if (schema) {
      const validation = schema.safeParse(updated);
      if (!validation.success) {
        console.warn(
          `[OutputApplier] Validation warnings for pillar ${pillarType} after module update:`,
          validation.error.issues.map((i) => i.message),
        );
      }
    }

    // 5. Write back to database
    await db.pillar.update({
      where: { id: pillar.id },
      data: { content: JSON.parse(JSON.stringify(updated)) },
    });
  }
}
