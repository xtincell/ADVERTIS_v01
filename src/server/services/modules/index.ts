// =============================================================================
// MODULE 23.0 — Module System Index
// =============================================================================
// Barrel re-export for the pluggable module system. Also triggers
// auto-registration of every module implementation via side-effect imports.
//
// To add a new module:
//   1. Create a file in ./implementations/ (e.g., my-module.ts)
//   2. Import and call registerModule() with your ModuleHandler
//   3. Import the file here so it auto-registers at startup
//
// Public API (re-exported):
//   registerModule, getModule, getAllModules,
//   getModulesForPillar, getModulesByCategory   — from ./registry
//   executeModule                                — from ./executor
//   resolveModuleInputs                          — from ./input-resolver
//   applyModuleOutputs                           — from ./output-applier
//
// Dependencies:
//   ./registry  ·  ./executor  ·  ./input-resolver  ·  ./output-applier
//   ./implementations/*  (side-effect auto-registration)
//
// Called by:
//   tRPC module router  ·  any server code needing module system access
// =============================================================================

export { registerModule, getModule, getAllModules, getModulesForPillar, getModulesByCategory } from "./registry";
export { executeModule } from "./executor";
export { resolveModuleInputs } from "./input-resolver";
export { applyModuleOutputs } from "./output-applier";

// ---------------------------------------------------------------------------
// Auto-register module implementations
// ---------------------------------------------------------------------------
// Import new modules here to register them at startup.
import "./implementations/data-quality-scorer";
