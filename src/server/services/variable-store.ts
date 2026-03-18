// =============================================================================
// MODULE 20 — Variable Store (CRUD + Auto-History)
// =============================================================================
// Persistence layer for BrandVariable entities. Provides atomic CRUD operations
// with automatic history tracking for individual edits, and a high-performance
// batch upsert for AI generation (no history for perf).
//
// Public API:
//   1. getVariable()          — Read one variable by key
//   2. getVariables()         — Read multiple variables (optional key filter)
//   3. getVariablesByPillar() — Read all variables for a pillar type
//   4. getStaleVariables()    — Read all stale variables for a strategy
//   5. setVariable()          — Upsert one variable + snapshot history
//   6. setVariablesBatch()    — Batch upsert (no history, for generation perf)
//   7. markStale()            — Mark a variable as stale
//   8. markFresh()            — Clear stale flag on a variable
//   9. getHistory()           — Read version history for a variable
//
// Dependencies:
//   - ~/server/db (Prisma client)
//   - ~/lib/variable-registry (VariableSource type)
//
// Called by:
//   - variable-extractor (setVariablesBatch after pillar generation)
//   - staleness-propagator (markStale, markFresh)
//   - strategy.ts router (setVariablesBatch for interview data)
//   - variable.ts router (setVariable for manual edits, getters)
//   - pillar-materializer (getVariablesByPillar)
//   - variable-backfill (setVariablesBatch)
// =============================================================================

import { db } from "~/server/db";
import type { VariableSource } from "~/lib/variable-registry";

// ---------------------------------------------------------------------------
// Local types matching Prisma schema (will be replaced by Prisma generated
// types after `prisma generate` runs with new BrandVariable models).
// ---------------------------------------------------------------------------

interface BrandVariable {
  id: string;
  strategyId: string;
  key: string;
  value: unknown;
  source: string;
  sourceDetail: string | null;
  confidence: string;
  isStale: boolean;
  staleReason: string | null;
  staleSince: Date | null;
  version: number;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BrandVariableHistory {
  id: string;
  variableId: string;
  version: number;
  value: unknown;
  source: string;
  sourceDetail: string | null;
  confidence: string;
  changeNote: string | null;
  changedBy: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SetVariableOptions {
  source: VariableSource;
  sourceDetail?: string;
  confidence?: "LOW" | "MEDIUM" | "HIGH";
  changedBy: string;
  changeNote?: string;
}

export interface BatchVariableEntry {
  key: string;
  value: unknown;
  options: Omit<SetVariableOptions, "changeNote">;
}

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

/**
 * Read a single BrandVariable by strategy + key.
 */
export async function getVariable(
  strategyId: string,
  key: string,
): Promise<BrandVariable | null> {
  return db.brandVariable.findUnique({
    where: { strategyId_key: { strategyId, key } },
  });
}

/**
 * Read multiple BrandVariables for a strategy.
 * If `keys` is provided, filters to only those keys.
 * Otherwise returns all variables for the strategy.
 */
export async function getVariables(
  strategyId: string,
  keys?: string[],
): Promise<BrandVariable[]> {
  if (keys && keys.length > 0) {
    return db.brandVariable.findMany({
      where: { strategyId, key: { in: keys } },
      orderBy: { key: "asc" },
    });
  }
  return db.brandVariable.findMany({
    where: { strategyId },
    orderBy: { key: "asc" },
  });
}

/**
 * Read all BrandVariables for a specific pillar type.
 * Matches keys starting with `{pillarType}.` (e.g., "A." for pillar A sections).
 */
export async function getVariablesByPillar(
  strategyId: string,
  pillarType: string,
): Promise<BrandVariable[]> {
  return db.brandVariable.findMany({
    where: {
      strategyId,
      key: { startsWith: `${pillarType}.` },
    },
    orderBy: { key: "asc" },
  });
}

/**
 * Read all stale BrandVariables for a strategy.
 */
export async function getStaleVariables(
  strategyId: string,
): Promise<BrandVariable[]> {
  return db.brandVariable.findMany({
    where: { strategyId, isStale: true },
    orderBy: { key: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

/**
 * Upsert a single BrandVariable with automatic history snapshot.
 * Uses a Prisma transaction: snapshot existing value → upsert → increment version.
 * Best for manual edits where full audit trail is important.
 */
export async function setVariable(
  strategyId: string,
  key: string,
  value: unknown,
  opts: SetVariableOptions,
): Promise<BrandVariable> {
  return db.$transaction(async (tx) => {
    // 1. Read existing variable (if any) for history snapshot
    const existing = await tx.brandVariable.findUnique({
      where: { strategyId_key: { strategyId, key } },
    });

    const nextVersion = existing ? existing.version + 1 : 1;

    // P1-12: Conflict detection — warn when AI overwrites manual edit or vice versa
    if (existing && existing.source !== opts.source) {
      const isAiOverwritingManual = existing.source === "manual_edit" && opts.source === "ai_generation";
      const isManualOverwritingAi = existing.source === "ai_generation" && opts.source === "manual_edit";
      if (isAiOverwritingManual) {
        console.warn(
          `[VariableStore] CONFLICT: AI generation is overwriting manual edit for key "${key}" (strategy ${strategyId}). ` +
          `Previous source: ${existing.source}, new source: ${opts.source}`
        );
      }
      // Manual overwriting AI is expected (human takes precedence), no warning needed
    }

    // 2. Snapshot history if there was a previous value
    if (existing) {
      await tx.brandVariableHistory.create({
        data: {
          variableId: existing.id,
          version: existing.version,
          value: existing.value ?? undefined,
          source: existing.source,
          sourceDetail: existing.sourceDetail,
          confidence: existing.confidence,
          changeNote: opts.changeNote ?? null,
          changedBy: opts.changedBy,
        },
      });
    }

    // 3. Upsert the variable
    const variable = await tx.brandVariable.upsert({
      where: { strategyId_key: { strategyId, key } },
      create: {
        strategyId,
        key,
        value: value as never,
        source: opts.source,
        sourceDetail: opts.sourceDetail ?? null,
        confidence: opts.confidence ?? "HIGH",
        isStale: false,
        staleReason: null,
        staleSince: null,
        version: 1,
        updatedBy: opts.changedBy,
      },
      update: {
        value: value as never,
        source: opts.source,
        sourceDetail: opts.sourceDetail ?? null,
        confidence: opts.confidence ?? "HIGH",
        isStale: false,
        staleReason: null,
        staleSince: null,
        version: nextVersion,
        updatedBy: opts.changedBy,
      },
    });

    return variable;
  });
}

/**
 * Batch upsert multiple BrandVariables without history snapshots.
 * Optimized for AI generation where we write many variables at once.
 * Uses a single transaction with individual upserts for atomicity.
 */
export async function setVariablesBatch(
  strategyId: string,
  entries: BatchVariableEntry[],
): Promise<void> {
  if (entries.length === 0) return;

  await db.$transaction(
    entries.map((entry) =>
      db.brandVariable.upsert({
        where: { strategyId_key: { strategyId, key: entry.key } },
        create: {
          strategyId,
          key: entry.key,
          value: entry.value as never,
          source: entry.options.source,
          sourceDetail: entry.options.sourceDetail ?? null,
          confidence: entry.options.confidence ?? "HIGH",
          isStale: false,
          staleReason: null,
          staleSince: null,
          version: 1,
          updatedBy: entry.options.changedBy,
        },
        update: {
          value: entry.value as never,
          source: entry.options.source,
          sourceDetail: entry.options.sourceDetail ?? null,
          confidence: entry.options.confidence ?? "HIGH",
          isStale: false,
          staleReason: null,
          staleSince: null,
          // P2-07: Known race condition — version increment is not atomic in Prisma upsert.
          // Two concurrent writes may both read version=N and both write version=N+1.
          // Mitigation: use db.$transaction with serializable isolation for critical paths.
          // Accepted for fire-and-forget generation; manual edits should use setVariable() directly.
          version: { increment: 1 },
          updatedBy: entry.options.changedBy,
        },
      }),
    ),
  );
}

// ---------------------------------------------------------------------------
// Staleness operations
// ---------------------------------------------------------------------------

/**
 * Mark a variable as stale with a reason.
 * No-op if the variable doesn't exist (it may not have been extracted yet).
 */
export async function markStale(
  strategyId: string,
  key: string,
  reason: string,
): Promise<void> {
  await db.brandVariable.updateMany({
    where: { strategyId, key, isStale: false },
    data: {
      isStale: true,
      staleReason: reason,
      staleSince: new Date(),
    },
  });
}

/**
 * Mark a variable as fresh (clear stale flag).
 */
export async function markFresh(
  strategyId: string,
  key: string,
): Promise<void> {
  await db.brandVariable.updateMany({
    where: { strategyId, key },
    data: {
      isStale: false,
      staleReason: null,
      staleSince: null,
    },
  });
}

/**
 * Mark multiple variables as fresh in one operation.
 */
export async function markFreshBatch(
  strategyId: string,
  keys: string[],
): Promise<void> {
  if (keys.length === 0) return;
  await db.brandVariable.updateMany({
    where: { strategyId, key: { in: keys } },
    data: {
      isStale: false,
      staleReason: null,
      staleSince: null,
    },
  });
}

// ---------------------------------------------------------------------------
// History operations
// ---------------------------------------------------------------------------

/**
 * Read the version history for a variable, most recent first.
 */
export async function getHistory(
  strategyId: string,
  key: string,
  limit = 20,
): Promise<BrandVariableHistory[]> {
  const variable = await db.brandVariable.findUnique({
    where: { strategyId_key: { strategyId, key } },
    select: { id: true },
  });

  if (!variable) return [];

  return db.brandVariableHistory.findMany({
    where: { variableId: variable.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get summary stats for a strategy's variables.
 */
export async function getVariableStats(strategyId: string): Promise<{
  total: number;
  filled: number;
  stale: number;
  bySource: Record<string, number>;
}> {
  const variables = await db.brandVariable.findMany({
    where: { strategyId },
    select: { value: true, isStale: true, source: true },
  });

  const bySource: Record<string, number> = {};
  let filled = 0;
  let stale = 0;

  for (const v of variables) {
    if (v.value !== null) filled++;
    if (v.isStale) stale++;
    bySource[v.source] = (bySource[v.source] ?? 0) + 1;
  }

  return {
    total: variables.length,
    filled,
    stale,
    bySource,
  };
}
