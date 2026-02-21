// =============================================================================
// MODULE 21B — Freshness Checker
// =============================================================================
// Checks data freshness for the monitoring dashboard. Manages freshness of
// TranslationDocuments and their individual assertions via sourceRef.updatedAt.
// Classifies data as FRESH / AGING / STALE based on vertical-specific
// thresholds. Provides per-document and per-strategy freshness reports, badge
// generation for UI, and bulk stale-marking.
//
// Public API:
//   1. getFreshnessThresholds()       — Get thresholds for a vertical
//   2. getFreshnessBadge()            — Get UI badge for a date
//   3. checkDocumentFreshness()       — Check freshness of a single document
//   4. checkAssertionFreshness()      — Check freshness of a single assertion
//   5. getStrategyFreshnessReport()   — Full freshness report for a strategy
//   6. markStaleDocuments()           — Scan and mark stale documents
//
// Dependencies:
//   - ~/server/db (Prisma — TranslationDocument, Strategy)
//   - ~/lib/constants (FRESHNESS_THRESHOLDS)
//
// Called by:
//   - tRPC freshness router (freshness.check, freshness.report)
//   - Monitoring dashboard UI components
//   - Scheduled cron jobs (periodic staleness scan)
// =============================================================================

import { db } from "~/server/db";
import { FRESHNESS_THRESHOLDS } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FreshnessLevel = "FRESH" | "AGING" | "STALE";

export interface FreshnessBadge {
  status: FreshnessLevel;
  color: "green" | "orange" | "red";
  label: string;
  daysSince: number;
}

export interface DocumentFreshness {
  documentId: string;
  type: string;
  status: FreshnessLevel;
  daysSinceGeneration: number;
  oldestAssertionDays: number | null;
  staleAssertions: number;
  totalAssertions: number;
}

export interface FreshnessReport {
  strategyId: string;
  documents: DocumentFreshness[];
  summary: {
    total: number;
    fresh: number;
    aging: number;
    stale: number;
    oldestDataDays: number;
  };
}

// ---------------------------------------------------------------------------
// Core: Freshness thresholds
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
 * Calculate the number of days since a given date.
 */
function daysSince(date: Date | string | null | undefined): number {
  if (!date) return Infinity;
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
}

/**
 * Get freshness level for a given number of days.
 */
function getFreshnessLevel(
  days: number,
  vertical?: string | null,
): FreshnessLevel {
  if (days === Infinity) return "STALE";
  const thresholds = getFreshnessThresholds(vertical);
  if (days <= thresholds.fresh) return "FRESH";
  if (days <= thresholds.aging) return "AGING";
  return "STALE";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get a freshness badge for a date (used in UI components).
 */
export function getFreshnessBadge(
  date: Date | string | null | undefined,
  vertical?: string | null,
): FreshnessBadge {
  const days = daysSince(date);
  const status = getFreshnessLevel(days, vertical);

  const colorMap: Record<FreshnessLevel, "green" | "orange" | "red"> = {
    FRESH: "green",
    AGING: "orange",
    STALE: "red",
  };

  const labelMap: Record<FreshnessLevel, string> = {
    FRESH: `${days}j`,
    AGING: `${days}j`,
    STALE: days === Infinity ? "N/A" : `${days}j`,
  };

  return {
    status,
    color: colorMap[status],
    label: labelMap[status],
    daysSince: days === Infinity ? -1 : days,
  };
}

/**
 * Check freshness of a single TranslationDocument.
 */
export async function checkDocumentFreshness(
  documentId: string,
): Promise<DocumentFreshness> {
  const doc = await db.translationDocument.findUniqueOrThrow({
    where: { id: documentId },
    select: {
      id: true,
      type: true,
      generatedAt: true,
      content: true,
      strategy: { select: { vertical: true } },
    },
  });

  const vertical = doc.strategy.vertical;
  const genDays = daysSince(doc.generatedAt);
  const docStatus = getFreshnessLevel(genDays, vertical);

  // Analyze individual assertions for staleness
  const { oldestDays, staleCount, totalCount } = analyzeAssertionFreshness(
    doc.content,
    vertical,
  );

  return {
    documentId: doc.id,
    type: doc.type,
    status: docStatus,
    daysSinceGeneration: genDays === Infinity ? -1 : genDays,
    oldestAssertionDays: oldestDays === Infinity ? null : oldestDays,
    staleAssertions: staleCount,
    totalAssertions: totalCount,
  };
}

/**
 * Check freshness of a single assertion's sourceRef.
 */
export function checkAssertionFreshness(
  sourceRef: { updatedAt?: string | null },
  vertical?: string | null,
): FreshnessBadge {
  return getFreshnessBadge(sourceRef.updatedAt, vertical);
}

/**
 * Get a full freshness report for all TranslationDocuments of a strategy.
 */
export async function getStrategyFreshnessReport(
  strategyId: string,
): Promise<FreshnessReport> {
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    select: { vertical: true },
  });

  const docs = await db.translationDocument.findMany({
    where: { strategyId, status: { not: "ARCHIVED" } },
    select: {
      id: true,
      type: true,
      generatedAt: true,
      content: true,
    },
    orderBy: { generatedAt: "desc" },
  });

  const vertical = strategy.vertical;
  let globalOldestDays = 0;

  const documents: DocumentFreshness[] = docs.map((doc) => {
    const genDays = daysSince(doc.generatedAt);
    const docStatus = getFreshnessLevel(genDays, vertical);
    const { oldestDays, staleCount, totalCount } = analyzeAssertionFreshness(
      doc.content,
      vertical,
    );

    const effectiveOldest = oldestDays === Infinity ? genDays : oldestDays;
    if (effectiveOldest > globalOldestDays && effectiveOldest !== Infinity) {
      globalOldestDays = effectiveOldest;
    }

    return {
      documentId: doc.id,
      type: doc.type,
      status: docStatus,
      daysSinceGeneration: genDays === Infinity ? -1 : genDays,
      oldestAssertionDays: oldestDays === Infinity ? null : oldestDays,
      staleAssertions: staleCount,
      totalAssertions: totalCount,
    };
  });

  const summary = {
    total: documents.length,
    fresh: documents.filter((d) => d.status === "FRESH").length,
    aging: documents.filter((d) => d.status === "AGING").length,
    stale: documents.filter((d) => d.status === "STALE").length,
    oldestDataDays: globalOldestDays,
  };

  return { strategyId, documents, summary };
}

/**
 * Scan all TranslationDocuments of a strategy and mark stale ones.
 */
export async function markStaleDocuments(
  strategyId: string,
): Promise<{ markedStale: number }> {
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    select: { vertical: true },
  });

  const docs = await db.translationDocument.findMany({
    where: { strategyId, status: { in: ["DRAFT", "VALIDATED"] } },
    select: { id: true, generatedAt: true, content: true },
  });

  const vertical = strategy.vertical;
  let markedStale = 0;

  for (const doc of docs) {
    const genDays = daysSince(doc.generatedAt);
    const status = getFreshnessLevel(genDays, vertical);

    if (status === "STALE") {
      await db.translationDocument.update({
        where: { id: doc.id },
        data: {
          status: "STALE",
          staleReason: `Document généré il y a ${genDays} jours (seuil dépassé)`,
          staleSince: new Date(),
        },
      });
      markedStale++;
    }
  }

  return { markedStale };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Analyze assertion freshness within a document's content JSON.
 */
function analyzeAssertionFreshness(
  content: unknown,
  vertical?: string | null,
): { oldestDays: number; staleCount: number; totalCount: number } {
  let oldestDays = 0;
  let staleCount = 0;
  let totalCount = 0;

  if (!content || typeof content !== "object") {
    return { oldestDays: Infinity, staleCount: 0, totalCount: 0 };
  }

  const briefContent = content as Record<string, unknown>;
  const sections = briefContent.sections;

  if (!Array.isArray(sections)) {
    return { oldestDays: Infinity, staleCount: 0, totalCount: 0 };
  }

  for (const section of sections) {
    const s = section as Record<string, unknown>;
    const blocks = s.blocks;
    if (!Array.isArray(blocks)) continue;

    for (const block of blocks) {
      const b = block as Record<string, unknown>;
      const sourceRef = b.sourceRef as Record<string, unknown> | undefined;

      if (sourceRef?.updatedAt) {
        totalCount++;
        const days = daysSince(sourceRef.updatedAt as string);

        if (days !== Infinity && days > oldestDays) {
          oldestDays = days;
        }

        const level = getFreshnessLevel(days, vertical);
        if (level === "STALE") {
          staleCount++;
        }
      } else {
        totalCount++;
      }
    }
  }

  return { oldestDays: oldestDays || Infinity, staleCount, totalCount };
}
