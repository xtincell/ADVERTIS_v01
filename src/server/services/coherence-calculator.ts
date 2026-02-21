// =============================================================================
// MODULE 6A — Coherence Score Calculator
// =============================================================================
//
// Deterministic formula for measuring strategic coherence (0-100).
// Uses 5 components that check pillar completion, variable coverage,
// content quality, cross-pillar alignment, and audit integration.
// Supports parent-child alignment for brand tree architectures.
//
// FORMULA (5+1 components, max 100) :
//   6A.1  pillarCompletion       (25) — % of 8 pillars with status "complete"
//   6A.2  variableCoverage       (20) — % of interview variables non-empty
//   6A.3  contentQuality         (15) — % of completed pillars with real content
//   6A.4  crossPillarAlignment   (25) — 7 inter-pillar coherence checks (A↔D↔V↔E)
//   6A.5  auditIntegration       (15) — R/T audit findings quality
//   6A.6  parentChildAlignment   (15) — Optional: child vs parent brand coherence
//
// PUBLIC API :
//   6A.7  calculateCoherenceScore()  — Returns total score (0-100)
//   6A.8  getCoherenceBreakdown()    — Returns full breakdown per component
//
// DEPENDENCIES :
//   - lib/constants → PILLAR_TYPES
//   - lib/types/pillar-schemas → typed pillar data interfaces
//
// CALLED BY :
//   - Module 6 (score-engine.ts)
//
// =============================================================================

import { PILLAR_TYPES } from "~/lib/constants";
import type {
  AuthenticitePillarData,
  DistinctionPillarData,
  ValeurPillarData,
  EngagementPillarData,
  RiskAuditResult,
  TrackAuditResult,
} from "~/lib/types/pillar-schemas";

/**
 * Shape expected for each pillar when calculating coherence.
 */
interface PillarInput {
  type: string;
  status: string;
  content: unknown;
}

/**
 * Breakdown of the five coherence sub-scores.
 */
export interface CoherenceBreakdown {
  /** 0-25 — percentage of pillars with status "complete" */
  pillarCompletion: number;
  /** 0-20 — percentage of interview variables that are non-empty */
  variableCoverage: number;
  /** 0-15 — content quality (non-trivial content per completed pillar) */
  contentQuality: number;
  /** 0-25 — cross-pillar alignment checks */
  crossPillarAlignment: number;
  /** 0-15 — audit integration quality */
  auditIntegration: number;
  /** 0-15 — parent-child alignment (only for child strategies in brand tree) */
  parentChildAlignment?: number;
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
// Cross-Pillar Alignment (max 25)
// ---------------------------------------------------------------------------

/**
 * 7 boolean checks that verify strategic coherence across base pillars A-D-V-E.
 * Each check asks: "Does pillar X inform pillar Y as expected?"
 */
function calculateCrossPillarAlignment(
  pillarMap: Record<string, unknown> | undefined,
): number {
  if (!pillarMap) return 0;

  const maxScore = 25;
  const aData = pillarMap.A as AuthenticitePillarData | undefined;
  const dData = pillarMap.D as DistinctionPillarData | undefined;
  const vData = pillarMap.V as ValeurPillarData | undefined;
  const eData = pillarMap.E as EngagementPillarData | undefined;

  let checks = 0;
  let passes = 0;

  // Check 1: A.valeurs → D.tonDeVoix (values should inform voice)
  checks++;
  if (
    aData?.valeurs &&
    aData.valeurs.length > 0 &&
    dData?.tonDeVoix?.personnalite &&
    dData.tonDeVoix.personnalite.trim().length > 0
  ) {
    passes++;
  }

  // Check 2: D.personas → E.touchpoints (personas guide touchpoints)
  checks++;
  if (
    dData?.personas &&
    dData.personas.length > 0 &&
    eData?.touchpoints &&
    eData.touchpoints.length > 0
  ) {
    passes++;
  }

  // Check 3: V.productLadder → D.positionnement (pricing aligns with positioning)
  checks++;
  if (
    vData?.productLadder &&
    vData.productLadder.length > 0 &&
    dData?.positionnement &&
    dData.positionnement.trim().length > 0
  ) {
    passes++;
  }

  // Check 4: A.hierarchieCommunautaire → E.gamification (community = gamification levels)
  checks++;
  if (
    aData?.hierarchieCommunautaire &&
    aData.hierarchieCommunautaire.length > 0 &&
    eData?.gamification &&
    eData.gamification.length > 0
  ) {
    passes++;
  }

  // Check 5: V.unitEconomics.cac+ltv → E.kpis (economics guide KPIs)
  checks++;
  if (
    vData?.unitEconomics?.cac &&
    vData.unitEconomics.cac.trim().length > 0 &&
    vData?.unitEconomics?.ltv &&
    vData.unitEconomics.ltv.trim().length > 0 &&
    eData?.kpis &&
    eData.kpis.length > 0
  ) {
    passes++;
  }

  // Check 6: D.promessesDeMarque.promesseMaitre → A.ikigai (promise flows from ikigai)
  checks++;
  if (
    dData?.promessesDeMarque?.promesseMaitre &&
    dData.promessesDeMarque.promesseMaitre.trim().length > 0 &&
    aData?.ikigai?.aimer &&
    aData.ikigai.aimer.trim().length > 0
  ) {
    passes++;
  }

  // Check 7: E.aarrr >= 3/5 → V.coutClient.frictions (funnel addresses frictions)
  checks++;
  const aarrrFilled = [
    eData?.aarrr?.acquisition,
    eData?.aarrr?.activation,
    eData?.aarrr?.retention,
    eData?.aarrr?.revenue,
    eData?.aarrr?.referral,
  ].filter((v) => v && typeof v === "string" && v.trim().length > 0).length;
  if (
    aarrrFilled >= 3 &&
    vData?.coutClient?.frictions &&
    vData.coutClient.frictions.length > 0
  ) {
    passes++;
  }

  return checks > 0 ? Math.round((passes / checks) * maxScore) : 0;
}

// ---------------------------------------------------------------------------
// Audit Integration (max 15)
// ---------------------------------------------------------------------------

/**
 * Measures whether R/T audit findings have improved the overall strategy.
 * Only scored when audits exist (no penalty if audits haven't run yet).
 */
function calculateAuditIntegration(
  pillarMap: Record<string, unknown> | undefined,
): number {
  if (!pillarMap) return 0;

  const maxScore = 15;
  const rData = pillarMap.R as RiskAuditResult | undefined;
  const tData = pillarMap.T as TrackAuditResult | undefined;

  if (!rData && !tData) return 0; // No audits yet — not penalized

  let points = 0;
  let totalChecks = 0;

  // R-based checks
  if (rData && rData.microSwots && rData.microSwots.length > 0) {
    const highRisks = rData.microSwots.filter(
      (s) => s.riskLevel === "high",
    );

    // R-check 1: No high risks OR mitigations exist
    totalChecks++;
    if (
      highRisks.length === 0 ||
      (rData.mitigationPriorities && rData.mitigationPriorities.length > 0)
    ) {
      points++;
    }

    // R-check 2: Strengths >= Weaknesses in global SWOT
    totalChecks++;
    const ss = rData.globalSwot?.strengths?.length ?? 0;
    const sw = rData.globalSwot?.weaknesses?.length ?? 0;
    if (ss >= sw) points++;

    // R-check 3: Probability-Impact matrix populated
    totalChecks++;
    if (
      rData.probabilityImpactMatrix &&
      rData.probabilityImpactMatrix.length > 0
    ) {
      points++;
    }
  }

  // T-based checks
  if (tData && tData.hypothesisValidation && tData.hypothesisValidation.length > 0) {
    // T-check 1: More validated than invalidated
    totalChecks++;
    const validated = tData.hypothesisValidation.filter(
      (h) => h.status === "validated",
    ).length;
    const invalidated = tData.hypothesisValidation.filter(
      (h) => h.status === "invalidated",
    ).length;
    if (validated > invalidated) points++;

    // T-check 2: TAM/SAM populated
    totalChecks++;
    if (
      tData.tamSamSom?.tam?.value &&
      tData.tamSamSom.tam.value.trim().length > 0 &&
      tData.tamSamSom?.sam?.value &&
      tData.tamSamSom.sam.value.trim().length > 0
    ) {
      points++;
    }

    // T-check 3: Competitive benchmarks exist
    totalChecks++;
    if (
      tData.competitiveBenchmark &&
      tData.competitiveBenchmark.length >= 2
    ) {
      points++;
    }
  }

  return totalChecks > 0
    ? Math.round((points / totalChecks) * maxScore)
    : 0;
}

// ---------------------------------------------------------------------------
// Parent-Child Alignment (max 15 — replaces auditIntegration when parent exists)
// ---------------------------------------------------------------------------

/**
 * Measures coherence between a child strategy and its parent.
 * 3 checks: values alignment, positioning consistency, tone of voice compatibility.
 */
function calculateParentChildAlignment(
  childPillarMap: Record<string, unknown> | undefined,
  parentPillarMap: Record<string, unknown> | undefined,
): number {
  if (!childPillarMap || !parentPillarMap) return 0;

  const maxScore = 15;
  let checks = 0;
  let passes = 0;

  const childA = childPillarMap.A as AuthenticitePillarData | undefined;
  const parentA = parentPillarMap.A as AuthenticitePillarData | undefined;
  const childD = childPillarMap.D as DistinctionPillarData | undefined;
  const parentD = parentPillarMap.D as DistinctionPillarData | undefined;

  // Check 1: Child values overlap with parent values
  checks++;
  if (childA?.valeurs && parentA?.valeurs) {
    const childVals = childA.valeurs.map((v) => v.valeur?.toLowerCase()).filter(Boolean);
    const parentVals = parentA.valeurs.map((v) => v.valeur?.toLowerCase()).filter(Boolean);
    // At least 1 shared value = pass
    const overlap = childVals.some((cv) => parentVals.includes(cv));
    if (overlap || childVals.length === 0 || parentVals.length === 0) passes++;
  } else {
    passes++; // No data to compare = no penalty
  }

  // Check 2: Positioning consistency (child should reference parent's positioning)
  checks++;
  if (childD?.positionnement && parentD?.positionnement) {
    // Both have positioning = aligned enough (detailed check would require NLP)
    if (
      childD.positionnement.trim().length > 0 &&
      parentD.positionnement.trim().length > 0
    ) {
      passes++;
    }
  } else {
    passes++;
  }

  // Check 3: Tone of voice compatibility
  checks++;
  if (childD?.tonDeVoix?.personnalite && parentD?.tonDeVoix?.personnalite) {
    // Both exist = pass (tone may differ for sub-brands but must be defined)
    passes++;
  } else if (!childD?.tonDeVoix?.personnalite && !parentD?.tonDeVoix?.personnalite) {
    passes++; // Neither has it = no penalty
  }

  return checks > 0 ? Math.round((passes / checks) * maxScore) : 0;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculate the Coherence Score (0-100) for a strategy.
 *
 * Formula with 5 components:
 *   1. Pillar completion       (25%) — % of pillars with status "complete"
 *   2. Variable coverage       (20%) — % of interview variables non-empty
 *   3. Content quality         (15%) — % of completed pillars with real content
 *   4. Cross-pillar alignment  (25%) — 7 inter-pillar coherence checks
 *   5. Audit integration       (15%) — R/T audit findings integration
 *
 * @returns An integer between 0 and 100 (inclusive).
 */
export function calculateCoherenceScore(
  pillars: PillarInput[],
  interviewData?: Record<string, unknown> | null,
  pillarMap?: Record<string, unknown>,
  parentPillarMap?: Record<string, unknown>,
): number {
  const breakdown = getCoherenceBreakdown(pillars, interviewData, pillarMap, parentPillarMap);
  return breakdown.total;
}

/**
 * Return the full breakdown of the coherence score per category.
 * When parentPillarMap is provided (child strategy), adds parentChildAlignment dimension.
 */
export function getCoherenceBreakdown(
  pillars: PillarInput[],
  interviewData?: Record<string, unknown> | null,
  pillarMap?: Record<string, unknown>,
  parentPillarMap?: Record<string, unknown>,
): CoherenceBreakdown {
  // --- 1. Pillar completion (max 25) ---
  const totalPillars = PILLAR_TYPES.length; // 8
  const completedPillars = pillars.filter(
    (p) => p.status === "complete",
  ).length;
  const pillarCompletion = Math.round(
    (completedPillars / totalPillars) * 25,
  );

  // --- 2. Variable coverage (max 20) ---
  const { filled, total } = countInterviewVariables(
    interviewData as Record<string, unknown> | undefined,
  );
  const variableCoverage =
    total > 0 ? Math.round((filled / total) * 20) : 0;

  // --- 3. Content quality (max 15) ---
  let qualityRatio = 0;
  if (completedPillars > 0) {
    const withContent = pillars.filter(
      (p) => p.status === "complete" && hasNonTrivialContent(p.content) === 1,
    ).length;
    qualityRatio = withContent / totalPillars;
  }
  const contentQuality = Math.round(qualityRatio * 15);

  // --- 4. Cross-pillar alignment (max 25) ---
  const crossPillarAlignment = calculateCrossPillarAlignment(pillarMap);

  // --- 5. Audit integration (max 15) ---
  const auditIntegration = calculateAuditIntegration(pillarMap);

  // --- 6. Parent-child alignment (optional, max 15 — only for child strategies) ---
  const parentChildAlignment = parentPillarMap
    ? calculateParentChildAlignment(pillarMap, parentPillarMap)
    : undefined;

  const total_ =
    pillarCompletion +
    variableCoverage +
    contentQuality +
    crossPillarAlignment +
    auditIntegration +
    (parentChildAlignment ?? 0);

  return {
    pillarCompletion,
    variableCoverage,
    contentQuality,
    crossPillarAlignment,
    auditIntegration,
    parentChildAlignment,
    total: Math.min(total_, 100),
  };
}
