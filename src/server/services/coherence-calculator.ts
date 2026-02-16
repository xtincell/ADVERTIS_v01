import { PILLAR_TYPES } from "~/lib/constants";

/**
 * Shape expected for each pillar when calculating coherence.
 */
interface PillarInput {
  type: string;
  status: string;
  content: unknown;
}

/**
 * Breakdown of the three coherence sub-scores.
 */
export interface CoherenceBreakdown {
  /** 0-40 — percentage of pillars with status "complete" */
  pillarCompletion: number;
  /** 0-30 — percentage of interview variables that are non-empty */
  variableCoverage: number;
  /** 0-30 — average content depth across pillars (normalized) */
  contentDepth: number;
  /** 0-100 — total score */
  total: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the number of non-empty top-level values inside an interview data
 * record.  Both the total key count and the filled key count are returned so
 * the caller can derive a percentage.
 */
function countInterviewVariables(
  interviewData: Record<string, unknown> | undefined | null,
): { filled: number; total: number } {
  if (!interviewData || typeof interviewData !== "object") {
    return { filled: 0, total: 0 };
  }

  const keys = Object.keys(interviewData);
  const total = keys.length;

  if (total === 0) return { filled: 0, total: 0 };

  let filled = 0;
  for (const key of keys) {
    const value = interviewData[key];
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    filled++;
  }

  return { filled, total };
}

/**
 * Rough measure of "content depth" for a single pillar's content field.
 * Returns a value between 0 and 1.
 *
 * Strategy:
 *  - Stringify the content JSON and measure its character length.
 *  - Normalize against a reference length (5 000 chars = 1.0).
 *  - Cap at 1.0.
 */
function contentDepthScore(content: unknown): number {
  if (content === null || content === undefined) return 0;

  let length: number;
  if (typeof content === "string") {
    length = content.length;
  } else {
    try {
      length = JSON.stringify(content).length;
    } catch {
      return 0;
    }
  }

  const REFERENCE_LENGTH = 5_000;
  return Math.min(length / REFERENCE_LENGTH, 1);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculate the Campaign Coherence Score (0-100) for a strategy.
 *
 * Score = weighted combination of:
 *   1. Pillar completion  (40%) — % of pillars with status "complete" -> 0-40 pts
 *   2. Variable coverage  (30%) — % of interview variables non-empty  -> 0-30 pts
 *   3. Content depth      (30%) — avg content length across pillars   -> 0-30 pts
 *
 * @returns An integer between 0 and 100 (inclusive).
 */
export function calculateCoherenceScore(
  pillars: PillarInput[],
  interviewData?: Record<string, unknown> | null,
): number {
  const breakdown = getCoherenceBreakdown(pillars, interviewData);
  return breakdown.total;
}

/**
 * Return the full breakdown of the coherence score per category.
 */
export function getCoherenceBreakdown(
  pillars: PillarInput[],
  interviewData?: Record<string, unknown> | null,
): CoherenceBreakdown {
  // --- 1. Pillar completion (max 40) ---
  const totalPillars = PILLAR_TYPES.length; // 8
  const completedPillars = pillars.filter(
    (p) => p.status === "complete",
  ).length;
  const pillarCompletion = Math.round(
    (completedPillars / totalPillars) * 40,
  );

  // --- 2. Variable coverage (max 30) ---
  const { filled, total } = countInterviewVariables(
    interviewData as Record<string, unknown> | undefined,
  );
  const variableCoverage =
    total > 0 ? Math.round((filled / total) * 30) : 0;

  // --- 3. Content depth (max 30) ---
  let avgDepth = 0;
  if (pillars.length > 0) {
    const sum = pillars.reduce(
      (acc, p) => acc + contentDepthScore(p.content),
      0,
    );
    avgDepth = sum / pillars.length;
  }
  const contentDepth = Math.round(avgDepth * 30);

  const total_ = pillarCompletion + variableCoverage + contentDepth;

  return {
    pillarCompletion,
    variableCoverage,
    contentDepth,
    total: Math.min(total_, 100),
  };
}
