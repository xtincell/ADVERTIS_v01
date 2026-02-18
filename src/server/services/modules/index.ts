// Module System — Barrel export + auto-registration of module implementations.
//
// To add a new module:
// 1. Create a file in ./implementations/ (e.g., my-module.ts)
// 2. Import and call registerModule() with your ModuleHandler
// 3. Import the file here so it auto-registers at startup

export { registerModule, getModule, getAllModules, getModulesForPillar, getModulesByCategory } from "./registry";
export { executeModule } from "./executor";
export { resolveModuleInputs } from "./input-resolver";
export { applyModuleOutputs } from "./output-applier";

// ---------------------------------------------------------------------------
// Auto-register module implementations
// ---------------------------------------------------------------------------
// Import new modules here to register them at startup.
// Example:
// import "./implementations/da-corpus-refiner";
// import "./implementations/codb-calculator";
