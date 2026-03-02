// =============================================================================
// MODULE 24 — Staleness Propagator (Dependency Graph BFS)
// =============================================================================
// When a BrandVariable changes, cascades staleness to all downstream dependents
// via BFS traversal of the dependency graph. Also bridges to the existing
// Pillar.staleReason system for backward compatibility.
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

  return { markedStale };
}
