// =============================================================================
// MODULE 23A — Module Executor
// =============================================================================
// Orchestrates the full lifecycle of a single module run:
//   create run record -> resolve inputs -> validate inputs -> execute handler
//   -> validate outputs -> apply outputs to pillars -> update run record.
// Mirrors the collection-orchestrator pattern from the market-study system.
//
// Public API:
//   executeModule(moduleId, strategyId, userId, triggeredBy?)
//     -> { success, runId, error? }
//
// Dependencies:
//   ~/server/db                      — Prisma client (moduleRun, strategy)
//   ./registry                       — getModule
//   ./input-resolver                 — resolveModuleInputs
//   ./output-applier                 — applyModuleOutputs
//   ~/lib/types/module-system        — ModuleContext, ModuleResult, ModuleTriggeredBy
//
// Called by:
//   modules/index.ts (re-exports)  ·  tRPC module.execute mutation
// =============================================================================

import { db } from "~/server/db";
import { getModule } from "./registry";
import { resolveModuleInputs } from "./input-resolver";
import { applyModuleOutputs } from "./output-applier";
import type { ModuleContext, ModuleResult, ModuleTriggeredBy } from "~/lib/types/module-system";

// ---------------------------------------------------------------------------
// Execute a single module
// ---------------------------------------------------------------------------

export async function executeModule(
  moduleId: string,
  strategyId: string,
  userId: string,
  triggeredBy: ModuleTriggeredBy = "manual",
): Promise<{ success: boolean; runId: string; error?: string }> {
  const handler = getModule(moduleId);
  if (!handler) {
    return { success: false, runId: "", error: `Module not found: ${moduleId}` };
  }

  // Verify strategy ownership
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: { userId: true },
  });

  if (!strategy || strategy.userId !== userId) {
    return { success: false, runId: "", error: "Strategy not found or unauthorized" };
  }

  // Create run record
  const run = await db.moduleRun.create({
    data: {
      moduleId,
      strategyId,
      userId,
      status: "running",
      triggeredBy,
    },
  });

  const startTime = Date.now();

  try {
    // 1. Resolve inputs from database
    const inputs = await resolveModuleInputs(handler.descriptor, strategyId);

    // 2. Validate inputs against module's inputSchema
    const inputValidation = handler.descriptor.inputSchema.safeParse(inputs);
    if (!inputValidation.success) {
      throw new Error(
        `Input validation failed: ${inputValidation.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    // 3. Execute the module
    const ctx: ModuleContext = { strategyId, userId, inputs };
    const result: ModuleResult = await handler.execute(ctx);

    if (!result.success) {
      throw new Error(result.error ?? "Module execution failed");
    }

    // 4. Validate outputs against module's outputSchema
    const outputValidation = handler.descriptor.outputSchema.safeParse(result.data);
    if (!outputValidation.success) {
      throw new Error(
        `Output validation failed: ${outputValidation.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    // 5. Apply outputs to pillar data (partial updates)
    await applyModuleOutputs(handler.descriptor, strategyId, result.data);

    // 6. Update run record — success
    await db.moduleRun.update({
      where: { id: run.id },
      data: {
        status: "complete",
        outputData: JSON.parse(JSON.stringify(result.data)),
        inputSnapshot: JSON.parse(JSON.stringify(inputs)),
        durationMs: Date.now() - startTime,
      },
    });

    return { success: true, runId: run.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await db.moduleRun.update({
      where: { id: run.id },
      data: {
        status: "error",
        errorMessage: message,
        durationMs: Date.now() - startTime,
      },
    });

    return { success: false, runId: run.id, error: message };
  }
}
