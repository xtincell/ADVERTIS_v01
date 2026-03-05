// =============================================================================
// MODULE 24 — Staleness Propagator (Dependency Graph BFS)
// =============================================================================
// When a BrandVariable changes, cascades staleness to all downstream dependents
// via BFS traversal of the dependency graph. Also bridges to the existing
// Pillar.staleReason system and FrameworkOutput.isStale for backward compatibility.
//
// Public API:
//   propagateStaleness(strategyId, changedKeys)
//     → { markedStale: string[] }
//
// Dependencies:
//   - ~/lib/variable-registry (getDependents, getVariableDefinition)
//   - ./variable-store (markStale)
//   - ./stale-detector (markPillarStale, propagateToTranslationDocs)
//   - ~/server/db (Prisma client — for pillar lookup)
//
// Called by:
//   - strategy.ts router (after updateInterviewData / confirmImport)
//   - variable.ts router (after manual variable edit)
// =============================================================================

import { getDependents, getVariableDefinition } from "~/lib/variable-registry";
import { getAllFrameworks } from "~/lib/framework-registry";
import { markStale } from "./variable-store";
import { markPillarStale, propagateToTranslationDocs } from "./stale-detector";
import { db } from "~/server/db";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Propagate staleness from changed keys to all downstream dependents via BFS.
 *
 * 1. Takes the set of changed keys
 * 2. For each → finds downstream dependents (getDependents)
 * 3. Marks each dependent as stale with a descriptive reason
 * 4. Continues BFS from newly-stale keys until exhaustion
 * 5. Bridges to existing Pillar.staleReason for pillar-level variables
 * 6. Propagates to TranslationDocuments for translation staleness
 *
 * @param strategyId - Strategy ID
 * @param changedKeys - Variable keys that were modified
 * @returns List of all keys that were marked stale
 */
export async function propagateStaleness(
  strategyId: string,
  changedKeys: string[],
): Promise<{ markedStale: string[] }> {
  if (changedKeys.length === 0) return { markedStale: [] };

  const visited = new Set<string>();
  const queue = [...changedKeys];
  const markedStale: string[] = [];

  // Track which pillar types need Pillar.staleReason updates
  const stalePillarTypes = new Set<string>();

  // BFS
  while (queue.length > 0) {
    const current = queue.shift()!;

    // Skip if already processed
    if (visited.has(current)) continue;
    visited.add(current);

    // Get all downstream dependents of this key
    const dependents = getDependents(current);

    for (const depKey of dependents) {
      if (visited.has(depKey)) continue;

      // Build a human-readable reason
      const currentDef = getVariableDefinition(current);
      const reason = `Dépendance modifiée : ${currentDef?.label ?? current}`;

      // Mark the BrandVariable as stale
      await markStale(strategyId, depKey, reason);
      markedStale.push(depKey);

      // Track pillar type for bridge update
      const depDef = getVariableDefinition(depKey);
      if (depDef?.pillarType && depDef.category === "pillar") {
        stalePillarTypes.add(depDef.pillarType);
      }

      // Add to BFS queue (cascade further downstream)
      queue.push(depKey);
    }
  }

  // Bridge: mark Pillar records as stale for backward compatibility
  if (stalePillarTypes.size > 0) {
    // Build a reason from the original changed keys
    const changedLabels = changedKeys
      .map((k) => getVariableDefinition(k)?.label ?? k)
      .slice(0, 3)
      .join(", ");
    const reason = `Variables modifiées : ${changedLabels}${changedKeys.length > 3 ? ` (+${changedKeys.length - 3})` : ""}`;

    const pillars = await db.pillar.findMany({
      where: {
        strategyId,
        type: { in: Array.from(stalePillarTypes) },
      },
      select: { id: true, type: true },
    });

    for (const pillar of pillars) {
      await markPillarStale(pillar.id, reason).catch(() => {
        // Non-critical — don't crash propagation
      });
    }

    // Also propagate to translation documents
    void propagateToTranslationDocs(strategyId, Array.from(stalePillarTypes)).catch(
      () => {},
    );
  }

  // Bridge: mark FrameworkOutput records as stale for framework-category variables
  if (markedStale.length > 0) {
    await propagateToFrameworkOutputs(strategyId, markedStale).catch(() => {
      // Non-critical — don't crash propagation
    });
  }

  return { markedStale };
}

// ---------------------------------------------------------------------------
// Auto-trigger cascade (Phase 12.5)
// ---------------------------------------------------------------------------

/**
 * Optionally re-execute frameworks whose outputs became stale.
 * This is an opt-in feature controlled by BrandOSConfig.
 *
 * Called after propagateStaleness() when auto-trigger is enabled.
 *
 * @param strategyId - Strategy ID
 * @param userId - User who triggered the change (for audit)
 * @param staleKeys - Keys that were marked stale
 */
export async function autoTriggerStaleFrameworks(
  strategyId: string,
  userId: string,
  staleKeys: string[],
): Promise<{ reExecuted: string[] }> {
  if (staleKeys.length === 0) return { reExecuted: [] };

  // Build reverse map: variable key → framework ID
  const varToFramework = new Map<string, string>();
  for (const fw of getAllFrameworks()) {
    for (const outputVar of fw.outputVariables) {
      varToFramework.set(outputVar, fw.id);
    }
  }

  // Collect unique framework IDs that have stale output variables
  const staleFrameworkIds = new Set<string>();
  for (const key of staleKeys) {
    const fwId = varToFramework.get(key);
    if (fwId) staleFrameworkIds.add(fwId);
  }

  if (staleFrameworkIds.size === 0) return { reExecuted: [] };

  // Lazy import to avoid circular dependencies
  const { executeFramework } = await import("./framework-executor");

  const reExecuted: string[] = [];
  for (const fwId of staleFrameworkIds) {
    try {
      const result = await executeFramework(fwId, strategyId, userId);
      if (result.success) {
        reExecuted.push(fwId);
      }
    } catch {
      // Non-critical — log and continue
      console.warn(`[AutoTrigger] Failed to re-execute ${fwId}`);
    }
  }

  return { reExecuted };
}

// ---------------------------------------------------------------------------
// Framework Output staleness bridge
// ---------------------------------------------------------------------------

/**
 * When framework output variables are marked stale, find the corresponding
 * FrameworkOutput records and mark them as stale too.
 *
 * This maps variable keys (e.g., "MA.prophecy") to framework IDs (e.g., "FW-20")
 * using the framework registry's outputVariables declarations.
 */
async function propagateToFrameworkOutputs(
  strategyId: string,
  staleKeys: string[],
): Promise<void> {
  // Build reverse map: variable key → framework ID
  const varToFramework = new Map<string, string>();
  for (const fw of getAllFrameworks()) {
    for (const outputVar of fw.outputVariables) {
      varToFramework.set(outputVar, fw.id);
    }
  }

  // Collect unique framework IDs that have stale output variables
  const staleFrameworkIds = new Set<string>();
  for (const key of staleKeys) {
    const fwId = varToFramework.get(key);
    if (fwId) staleFrameworkIds.add(fwId);
  }

  if (staleFrameworkIds.size === 0) return;

  // Build reason from stale keys
  const staleLabels = staleKeys
    .filter((k) => varToFramework.has(k))
    .map((k) => getVariableDefinition(k)?.label ?? k)
    .slice(0, 3)
    .join(", ");
  const reason = `Variables framework modifiées : ${staleLabels}${staleKeys.length > 3 ? ` (+${staleKeys.length - 3})` : ""}`;

  // Update FrameworkOutput records
  await db.frameworkOutput.updateMany({
    where: {
      strategyId,
      frameworkId: { in: Array.from(staleFrameworkIds) },
      isStale: false,
    },
    data: {
      isStale: true,
      staleReason: reason,
    },
  });
}
