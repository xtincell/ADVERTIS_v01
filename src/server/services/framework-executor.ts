// =============================================================================
// MODULE 25 — Framework Executor
// =============================================================================
// Executes ARTEMIS frameworks for a strategy. Mirrors the module executor
// pattern (Module 18) but operates on framework descriptors + FrameworkOutput.
//
// Public API:
//   executeFramework(frameworkId, strategyId, userId, runId?)
//     → { success: boolean; runId: string; error?: string }
//
// Execution pipeline:
//   1. Validate framework exists + has implementation
//   2. Create or reuse FrameworkRun record
//   3. Resolve input variables from BrandVariable store
//   4. Execute framework handler (compute / AI / hybrid)
//   5. Persist output to FrameworkOutput (upsert)
//   6. Sync output variables to BrandVariable store
//   7. Update FrameworkRun status (complete / error)
//
// Dependencies:
//   - ~/lib/framework-registry (getFramework)
//   - ~/server/db (Prisma client)
//   - ./variable-store (getVariable, setVariable)
//   - ./staleness-propagator (propagateStaleness)
//
// Called by:
//   - framework.ts tRPC router (execute mutation)
//   - artemis-orchestrator.ts (Phase 12)
// =============================================================================

import { getFramework } from "~/lib/framework-registry";
import { db } from "~/server/db";
import { getVariable, setVariable } from "./variable-store";

// Auto-register all framework handlers (side-effect imports)
import "./frameworks";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FrameworkExecutionResult {
  success: boolean;
  runId: string;
  error?: string;
}

export interface FrameworkContext {
  strategyId: string;
  userId: string;
  inputs: Record<string, unknown>;
  nodeType: string;
}

export interface FrameworkHandlerResult {
  success: boolean;
  error?: string;
  /** Output data keyed by variable key (e.g., "MA.prophecy" → value) */
  data: Record<string, unknown>;
}

/**
 * Framework handler function signature.
 * Each framework implementation exports a handler matching this type.
 */
export type FrameworkHandler = (
  ctx: FrameworkContext,
) => Promise<FrameworkHandlerResult>;

// ---------------------------------------------------------------------------
// Handler Registry (populated by framework implementations in Phase 8+)
// ---------------------------------------------------------------------------

const handlers = new Map<string, FrameworkHandler>();

/**
 * Register a framework handler.
 * Called by framework implementation files (side-effect imports).
 */
export function registerFrameworkHandler(
  frameworkId: string,
  handler: FrameworkHandler,
): void {
  handlers.set(frameworkId, handler);
}

/**
 * Get a registered framework handler.
 */
export function getFrameworkHandler(
  frameworkId: string,
): FrameworkHandler | undefined {
  return handlers.get(frameworkId);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Execute a single ARTEMIS framework for a strategy.
 *
 * @param frameworkId - Framework ID (e.g., "FW-20")
 * @param strategyId - Strategy ID
 * @param userId     - User who triggered the execution
 * @param runId      - Optional existing FrameworkRun ID (reuse if provided)
 */
export async function executeFramework(
  frameworkId: string,
  strategyId: string,
  userId: string,
  runId?: string,
): Promise<FrameworkExecutionResult> {
  const startTime = Date.now();

  // ── Step 0: Validate framework ──────────────────────────────────────
  const descriptor = getFramework(frameworkId);
  if (!descriptor) {
    return { success: false, runId: runId ?? "", error: `Framework non trouvé : ${frameworkId}` };
  }

  if (!descriptor.hasImplementation) {
    return {
      success: false,
      runId: runId ?? "",
      error: `Framework ${frameworkId} (${descriptor.name}) est théorique — pas d'implémentation`,
    };
  }

  const handler = handlers.get(frameworkId);
  if (!handler) {
    return {
      success: false,
      runId: runId ?? "",
      error: `Aucun handler enregistré pour ${frameworkId}. Implémentation attendue dans une phase ultérieure.`,
    };
  }

  // ── Step 1: Create or reuse FrameworkRun ─────────────────────────────
  let actualRunId = runId;
  if (!actualRunId) {
    const run = await db.frameworkRun.create({
      data: {
        frameworkId,
        strategyId,
        userId,
        status: "running",
        triggeredBy: "manual",
      },
    });
    actualRunId = run.id;
  } else {
    await db.frameworkRun.update({
      where: { id: actualRunId },
      data: { status: "running" },
    });
  }

  try {
    // ── Step 2: Resolve input variables ─────────────────────────────────
    const inputs: Record<string, unknown> = {};
    for (const varKey of descriptor.inputVariables) {
      const variable = await getVariable(strategyId, varKey);
      inputs[varKey] = variable?.value ?? null;
    }

    // ── Step 3: Get strategy nodeType ───────────────────────────────────
    const strategy = await db.strategy.findUnique({
      where: { id: strategyId },
      select: { nodeType: true },
    });
    const nodeType = (strategy?.nodeType as string) ?? "BRAND";

    // ── Step 4: Check nodeType condition ────────────────────────────────
    // condition is NodeType[] — framework only runs if strategy.nodeType is in the list
    if (descriptor.condition && descriptor.condition.length > 0) {
      if (!descriptor.condition.includes(nodeType as never)) {
        // Framework not applicable for this nodeType — skip silently
        await db.frameworkRun.update({
          where: { id: actualRunId },
          data: {
            status: "skipped",
            errorMessage: `Ignoré : nodeType "${nodeType}" non inclus dans [${descriptor.condition.join(", ")}]`,
            durationMs: Date.now() - startTime,
          },
        });
        return { success: true, runId: actualRunId };
      }
    }

    // ── Step 5: Execute handler ─────────────────────────────────────────
    const ctx: FrameworkContext = { strategyId, userId, inputs, nodeType };
    const result = await handler(ctx);

    if (!result.success) {
      throw new Error(result.error ?? "Erreur d'exécution du framework");
    }

    // ── Step 6: Persist FrameworkOutput (upsert) ────────────────────────
    await db.frameworkOutput.upsert({
      where: {
        strategyId_frameworkId: {
          strategyId,
          frameworkId,
        },
      },
      create: {
        strategyId,
        frameworkId,
        data: JSON.parse(JSON.stringify(result.data)),
        isStale: false,
        staleReason: null,
        generatedBy: userId,
        version: 1,
      },
      update: {
        data: JSON.parse(JSON.stringify(result.data)),
        isStale: false,
        staleReason: null,
        generatedBy: userId,
        version: { increment: 1 },
      },
    });

    // ── Step 7: Sync output variables to BrandVariable store ────────────
    for (const varKey of descriptor.outputVariables) {
      const value = result.data[varKey];
      if (value !== undefined) {
        await setVariable(strategyId, varKey, value, {
          source: "framework",
          changedBy: userId,
          changeNote: `Généré par ${descriptor.name} (${frameworkId})`,
        }).catch(() => {
          // Non-critical — don't crash execution
        });
      }
    }

    // ── Step 8: Update FrameworkRun → complete ──────────────────────────
    await db.frameworkRun.update({
      where: { id: actualRunId },
      data: {
        status: "complete",
        outputData: JSON.parse(JSON.stringify(result.data)),
        inputSnapshot: JSON.parse(JSON.stringify(inputs)),
        durationMs: Date.now() - startTime,
      },
    });

    return { success: true, runId: actualRunId };
  } catch (err) {
    // ── Error handling ──────────────────────────────────────────────────
    const errorMessage =
      err instanceof Error ? err.message : "Erreur inconnue";

    await db.frameworkRun
      .update({
        where: { id: actualRunId },
        data: {
          status: "error",
          errorMessage,
          durationMs: Date.now() - startTime,
        },
      })
      .catch(() => {
        // Can't even update the run — silently fail
      });

    return { success: false, runId: actualRunId, error: errorMessage };
  }
}
