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
  /** 0-50 — percentage of pillars with status "complete" */
  pillarCompletion: number;
  /** 0-30 — percentage of interview variables that are non-empty */
  variableCoverage: number;
  /** 0-20 — content quality (non-trivial content per completed pillar) */
  contentQuality: number;
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
 * Checks whether a pillar's content is non-trivial (has real data).
 * Works with both structured JSON objects and markdown strings.
 * Returns 1 for non-empty content, 0 otherwise.
 */
function hasNonTrivialContent(content: unknown): number {
  if (content === null || content === undefined) return 0;

  // String content (legacy markdown) — must have at least 100 chars of real text
  if (typeof content === "string") {
    return content.trim().length >= 100 ? 1 : 0;
  }

  // Object content (structured JSON) — must have at least one non-empty key
  if (typeof content === "object") {
    try {
      const json = JSON.stringify(content);
      // A trivial JSON like {} or {"key":""} is < 20 chars
      return json.length >= 20 ? 1 : 0;
    } catch {
      return 0;
    }
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculate the Coherence Score (0-100) for a strategy.
 *
 * Revised formula that actually reaches 100% when all pillars are complete:
 *   1. Pillar completion  (50%) — % of pillars with status "complete" -> 0-50 pts
 *   2. Variable coverage  (30%) — % of interview variables non-empty  -> 0-30 pts
 *   3. Content quality    (20%) — % of completed pillars with real content -> 0-20 pts
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
  // --- 1. Pillar completion (max 50) ---
  const totalPillars = PILLAR_TYPES.length; // 8
  const completedPillars = pillars.filter(
    (p) => p.status === "complete",
  ).length;
  const pillarCompletion = Math.round(
    (completedPillars / totalPillars) * 50,
  );

  // --- 2. Variable coverage (max 30) ---
  const { filled, total } = countInterviewVariables(
    interviewData as Record<string, unknown> | undefined,
  );
  const variableCoverage =
    total > 0 ? Math.round((filled / total) * 30) : 0;

  // --- 3. Content quality (max 20) ---
  // Counts completed pillars that have non-trivial content.
  // No arbitrary character length threshold — just checks for real data.
  let qualityRatio = 0;
  if (completedPillars > 0) {
    const withContent = pillars.filter(
      (p) => p.status === "complete" && hasNonTrivialContent(p.content) === 1,
    ).length;
    qualityRatio = withContent / totalPillars;
  }
  const contentQuality = Math.round(qualityRatio * 20);

  const total_ = pillarCompletion + variableCoverage + contentQuality;

  return {
    pillarCompletion,
    variableCoverage,
    contentQuality,
    total: Math.min(total_, 100),
  };
}
