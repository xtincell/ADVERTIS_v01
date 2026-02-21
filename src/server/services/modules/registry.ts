// =============================================================================
// MODULE 23 — Module Registry
// =============================================================================
// Central Map-based registry for pluggable strategy modules.
// Follows the same singleton-Map pattern as PILLAR_SCHEMAS and Widget Registry.
//
// Public API:
//   registerModule(handler)          — Register (or overwrite) a ModuleHandler
//   getModule(moduleId)              — Retrieve a single handler by ID
//   getAllModules()                   — List every registered handler
//   getModulesForPillar(pillarType)  — Filter modules that output to a pillar
//   getModulesByCategory(category)   — Filter modules by category
//
// Dependencies:
//   ~/lib/types/module-system        — ModuleHandler type
//
// Called by:
//   modules/index.ts (re-exports)  ·  modules/executor.ts (getModule)
//   module implementations (registerModule at import-time)
//   tRPC module router (getAllModules, getModulesForPillar)
// =============================================================================

import type { ModuleHandler } from "~/lib/types/module-system";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const MODULE_REGISTRY = new Map<string, ModuleHandler>();

/** Register a module handler. Overwrites if already registered. */
export function registerModule(handler: ModuleHandler): void {
  if (MODULE_REGISTRY.has(handler.descriptor.id)) {
    console.warn(
      `[ModuleRegistry] Overwriting module: ${handler.descriptor.id}`,
    );
  }
  MODULE_REGISTRY.set(handler.descriptor.id, handler);
}

/** Get a single module by ID. */
export function getModule(moduleId: string): ModuleHandler | undefined {
  return MODULE_REGISTRY.get(moduleId);
}

/** Get all registered modules. */
export function getAllModules(): ModuleHandler[] {
  return Array.from(MODULE_REGISTRY.values());
}

/** Get modules that output to a specific pillar type. */
export function getModulesForPillar(pillarType: string): ModuleHandler[] {
  return getAllModules().filter((m) =>
    m.descriptor.outputs.some((o) => o.pillarType === pillarType),
  );
}

/** Get modules by category. */
export function getModulesByCategory(
  category: ModuleHandler["descriptor"]["category"],
): ModuleHandler[] {
  return getAllModules().filter((m) => m.descriptor.category === category);
}
