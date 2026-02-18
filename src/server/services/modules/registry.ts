// Module Registry — Map-based registry for pluggable modules.
// Follows the same pattern as PILLAR_SCHEMAS in pillar-schemas.ts.

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
