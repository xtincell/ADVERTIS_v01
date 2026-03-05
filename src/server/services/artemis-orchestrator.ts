// =============================================================================
// MODULE 26 — ARTEMIS Orchestrator (Phase 12)
// =============================================================================
// Central orchestrator that executes all ARTEMIS frameworks in topological
// order. Handles subset selection, staleness-aware skipping, and error
// aggregation so the caller receives a single consolidated result.
//
// Public API:
//   executeArtemisOrchestration(strategyId, userId, options?)
//     → OrchestrationResult
//
// Execution pipeline:
//   1. Retrieve topological execution order from the framework registry
//   2. If frameworkIds specified, filter to that subset while preserving order
//   3. For each framework in order:
//      a. Skip if no implementation (hasImplementation === false)
//      b. Skip if output is fresh and forceRerun is not set
//      c. Execute via framework-executor
//      d. Track timing and result
//      e. Break early if stopOnError is set and execution failed
//   4. Return aggregated OrchestrationResult
//
// Dependencies:
//   - ~/lib/framework-registry (getExecutionOrder, getFramework)
//   - ~/server/db (Prisma client — FrameworkOutput staleness check)
//   - ./framework-executor (executeFramework)
//
// Called by:
//   - framework.ts tRPC router (orchestrate mutation)
//   - Cron / manual "run all" triggers
// =============================================================================

import {
  getExecutionOrder,
  getFramework,
} from "~/lib/framework-registry";
import { db } from "~/server/db";
import { executeFramework } from "./framework-executor";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FrameworkRunResult {
  frameworkId: string;
  success: boolean;
  runId: string;
  error?: string;
  durationMs: number;
}

export interface OrchestrationResult {
  success: boolean;
  totalFrameworks: number;
  executed: number;
  skipped: number;
  errors: number;
  results: FrameworkRunResult[];
  totalDurationMs: number;
}

export interface OrchestrationOptions {
  /** Execute only these framework IDs (subset). Order is still topological. */
  frameworkIds?: string[];
  /** Re-run frameworks even if their output is not stale. */
  forceRerun?: boolean;
  /** Stop pipeline on first error (default: false — continue). */
  stopOnError?: boolean;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Execute ARTEMIS frameworks in topological order for a strategy.
 *
 * @param strategyId - Strategy to execute frameworks for
 * @param userId     - User who triggered the orchestration
 * @param options    - Optional subset, force-rerun, stop-on-error flags
 */
export async function executeArtemisOrchestration(
  strategyId: string,
  userId: string,
  options?: OrchestrationOptions,
): Promise<OrchestrationResult> {
  const orchestrationStart = Date.now();

  const frameworkIds = options?.frameworkIds;
  const forceRerun = options?.forceRerun ?? false;
  const stopOnError = options?.stopOnError ?? false;

  // ── Step 1: Get topological execution order ─────────────────────────
  let executionOrder = getExecutionOrder();

  // ── Step 2: Filter to requested subset (preserve topological order) ─
  if (frameworkIds && frameworkIds.length > 0) {
    const requested = new Set(frameworkIds);
    executionOrder = executionOrder.filter((id) => requested.has(id));
  }

  const totalFrameworks = executionOrder.length;

  // ── Step 3: Pre-fetch existing outputs for staleness check ──────────
  // Single query instead of N queries inside the loop
  const existingOutputs = forceRerun
    ? []
    : await db.frameworkOutput.findMany({
        where: {
          strategyId,
          frameworkId: { in: executionOrder },
        },
        select: {
          frameworkId: true,
          isStale: true,
        },
      });

  const outputMap = new Map<string, { frameworkId: string; isStale: boolean }>(
    existingOutputs.map((o) => [o.frameworkId, o]),
  );

  // ── Step 4: Execute frameworks sequentially in order ─────────────────
  const results: FrameworkRunResult[] = [];
  let executed = 0;
  let skipped = 0;
  let errors = 0;

  for (const fwId of executionOrder) {
    const descriptor = getFramework(fwId);

    // 4a. Skip if framework not found or has no implementation
    if (!descriptor || !descriptor.hasImplementation) {
      skipped++;
      results.push({
        frameworkId: fwId,
        success: true,
        runId: "",
        error: descriptor
          ? `Skipped: no implementation (${descriptor.name})`
          : `Skipped: framework not found`,
        durationMs: 0,
      });
      continue;
    }

    // 4b. Skip if output is fresh and forceRerun is not set
    if (!forceRerun) {
      const existing = outputMap.get(fwId);
      if (existing && !existing.isStale) {
        skipped++;
        results.push({
          frameworkId: fwId,
          success: true,
          runId: "",
          error: `Skipped: output is fresh`,
          durationMs: 0,
        });
        continue;
      }
    }

    // 4c. Execute the framework
    const fwStart = Date.now();
    const result = await executeFramework(fwId, strategyId, userId);
    const fwDuration = Date.now() - fwStart;

    // 4d. Track result
    if (result.success) {
      executed++;
    } else {
      errors++;
    }

    results.push({
      frameworkId: fwId,
      success: result.success,
      runId: result.runId,
      error: result.error,
      durationMs: fwDuration,
    });

    // 4e. Break early on error if requested
    if (stopOnError && !result.success) {
      // Mark remaining frameworks as skipped
      const currentIndex = executionOrder.indexOf(fwId);
      const remaining = executionOrder.slice(currentIndex + 1);
      for (const remainingId of remaining) {
        skipped++;
        results.push({
          frameworkId: remainingId,
          success: false,
          runId: "",
          error: `Skipped: pipeline stopped after error in ${fwId}`,
          durationMs: 0,
        });
      }
      break;
    }
  }

  // ── Step 5: Return aggregated result ────────────────────────────────
  const totalDurationMs = Date.now() - orchestrationStart;

  return {
    success: errors === 0,
    totalFrameworks,
    executed,
    skipped,
    errors,
    results,
    totalDurationMs,
  };
}
