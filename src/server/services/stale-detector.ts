// =============================================================================
// MODULE 12 — Stale Detector
// =============================================================================
//
// Monitors freshness of signals and pillars using configurable thresholds
// per vertical. Determines FRESH/AGING/STALE status and propagates
// staleness to dependent TranslationDocuments.
//
// PUBLIC API :
//   12.1  getFreshnessThresholds()     — Get thresholds for a vertical
//   12.2  getFreshnessStatus()         — Classify a date as FRESH/AGING/STALE
//   12.3  checkStaleness()             — Full staleness report for a strategy
//   12.4  markPillarStale()            — Mark a pillar as stale with reason
//   12.5  clearPillarStaleness()       — Clear stale status from a pillar
//   12.6  propagateToTranslationDocs() — Cascade staleness to affected briefs
//
// DEPENDENCIES :
//   - lib/constants → FRESHNESS_THRESHOLDS
//   - Prisma: Signal, Pillar, TranslationDocument
//
// CALLED BY :
//   - Module 10 (fiche-upgrade.ts) → clearPillarStaleness after regeneration
//   - API Route POST /api/ai/generate → clearPillarStaleness after generation
//   - tRPC router cockpit → checkStaleness for UI display
//   - Signal engine → propagateToTranslationDocs
//
// =============================================================================

import { db } from "~/server/db";
import { FRESHNESS_THRESHOLDS } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FreshnessStatus = "FRESH" | "AGING" | "STALE";

interface PillarStaleness {
  pillarId: string;
  pillarType: string;
  status: FreshnessStatus;
  daysSinceUpdate: number;
}

interface StalenessReport {
  staleSignals: Array<{
    signalId: string;
    title: string;
    status: FreshnessStatus;
    daysSinceCheck: number;
  }>;
  stalePillars: PillarStaleness[];
}

// ---------------------------------------------------------------------------
// 12.1-12.5  Core functions
// ---------------------------------------------------------------------------

/**
 * Get freshness thresholds for a given vertical.
 * Falls back to DEFAULT if vertical not found.
 */
export function getFreshnessThresholds(vertical?: string | null): {
  fresh: number;
  aging: number;
} {
  if (vertical && FRESHNESS_THRESHOLDS[vertical]) {
    return FRESHNESS_THRESHOLDS[vertical]!;
  }
  return FRESHNESS_THRESHOLDS.DEFAULT!;
}

/**
 * Determine freshness status based on a date and vertical thresholds.
 */
export function getFreshnessStatus(
  date: Date | string | null | undefined,
  vertical?: string | null,
): FreshnessStatus {
  if (!date) return "STALE";

  const thresholds = getFreshnessThresholds(vertical);
  const daysSince = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSince <= thresholds.fresh) return "FRESH";
  if (daysSince <= thresholds.aging) return "AGING";
  return "STALE";
}

/**
 * Get the number of days elapsed since a date.
 */
function daysSince(date: Date | string | null | undefined): number {
  if (!date) return Infinity;
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
}

/**
 * Check staleness for an entire strategy: signals + pillars.
 */
export async function checkStaleness(
  strategyId: string,
): Promise<StalenessReport> {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: { vertical: true },
  });

  const vertical = strategy?.vertical ?? null;

  // Check signals
  const signals = await db.signal.findMany({
    where: { strategyId },
    select: { id: true, title: true, lastCheckedAt: true },
  });

  const staleSignals = signals
    .map((s) => {
      const status = getFreshnessStatus(s.lastCheckedAt, vertical);
      const days = daysSince(s.lastCheckedAt);
      return {
        signalId: s.id,
        title: s.title,
        status,
        daysSinceCheck: days === Infinity ? 999 : days,
      };
    })
    .filter((s) => s.status !== "FRESH");

  // Check pillars
  const pillars = await db.pillar.findMany({
    where: { strategyId },
    select: { id: true, type: true, updatedAt: true, generatedAt: true },
  });

  const stalePillars: PillarStaleness[] = pillars
    .map((p) => {
      const lastTouch = p.generatedAt ?? p.updatedAt;
      const status = getFreshnessStatus(lastTouch, vertical);
      const days = daysSince(lastTouch);
      return {
        pillarId: p.id,
        pillarType: p.type,
        status,
        daysSinceUpdate: days === Infinity ? 999 : days,
      };
    })
    .filter((p) => p.status !== "FRESH");

  return { staleSignals, stalePillars };
}

/**
 * Mark a pillar as stale with a reason.
 * Uses the existing Pillar.staleReason and Pillar.staleSince fields.
 */
export async function markPillarStale(
  pillarId: string,
  reason: string,
) {
  return db.pillar.update({
    where: { id: pillarId },
    data: {
      staleReason: reason,
      staleSince: new Date(),
    },
  });
}

/**
 * Clear staleness from a pillar.
 */
export async function clearPillarStaleness(pillarId: string) {
  return db.pillar.update({
    where: { id: pillarId },
    data: {
      staleReason: null,
      staleSince: null,
    },
  });
}

// ---------------------------------------------------------------------------
// 12.6  Propagate staleness to TranslationDocuments
// ---------------------------------------------------------------------------

/**
 * When pillars are marked stale, propagate to all TranslationDocuments
 * whose sourcePillars include the stale pillar type.
 * This ensures briefs are flagged for regeneration when source data changes.
 */
export async function propagateToTranslationDocs(
  strategyId: string,
  stalePillarTypes: string[],
): Promise<{ markedStale: number }> {
  if (stalePillarTypes.length === 0) return { markedStale: 0 };

  // Find all non-archived TranslationDocuments for this strategy
  const docs = await db.translationDocument.findMany({
    where: {
      strategyId,
      status: { in: ["DRAFT", "VALIDATED"] },
    },
    select: { id: true, sourcePillars: true },
  });

  let markedStale = 0;

  for (const doc of docs) {
    const sourcePillars = Array.isArray(doc.sourcePillars)
      ? (doc.sourcePillars as string[])
      : [];

    // Check if any source pillar is in the stale list
    const affectedPillars = sourcePillars.filter((p) =>
      stalePillarTypes.includes(p),
    );

    if (affectedPillars.length > 0) {
      await db.translationDocument.update({
        where: { id: doc.id },
        data: {
          status: "STALE",
          staleReason: `Pilier(s) source obsolète(s) : ${affectedPillars.join(", ")}`,
          staleSince: new Date(),
        },
      });
      markedStale++;
    }
  }

  return { markedStale };
}
