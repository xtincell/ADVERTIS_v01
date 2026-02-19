// Mathematical Brand-Market Fit Score Calculator
// Replaces AI-generated brandMarketFitScore with deterministic formula.
// Consumes structured data already present in TrackAuditResult.

import type { TrackAuditResult } from "~/lib/types/pillar-schemas";

// ---------------------------------------------------------------------------
// Breakdown interface
// ---------------------------------------------------------------------------

export interface BmfBreakdown {
  /** 0-25 — data source coverage (triangulation) */
  triangulationQuality: number;
  /** 0-30 — validated vs total hypotheses */
  hypothesisValidation: number;
  /** 0-20 — TAM/SAM/SOM completeness */
  marketSizing: number;
  /** 0-25 — benchmarks + recommendations + market reality */
  competitiveDifferentiation: number;
  /** 0-100 — total BMF score */
  total: number;
}

// ---------------------------------------------------------------------------
// Calculator
// ---------------------------------------------------------------------------

/**
 * Calculate a deterministic Brand-Market Fit score from Track Audit data.
 *
 * Formula (4 components, max 100):
 *   1. triangulationQuality       (25) — presence of 4 data sources
 *   2. hypothesisValidation       (30) — validated vs total
 *   3. marketSizing               (20) — TAM/SAM/SOM + methodology
 *   4. competitiveDifferentiation (25) — benchmarks, recs, market trends
 */
export function calculateBrandMarketFit(
  tData: TrackAuditResult,
): BmfBreakdown {
  // --- 1. triangulationQuality (max 25) ---
  const tri = tData.triangulation;
  let triScore = 0;
  if (tri?.internalData && tri.internalData.trim().length > 0) triScore += 8;
  if (tri?.marketData && tri.marketData.trim().length > 0) triScore += 8;
  if (tri?.customerData && tri.customerData.trim().length > 0) triScore += 5;
  if (tri?.synthesis && tri.synthesis.trim().length > 0) triScore += 4;

  // --- 2. hypothesisValidation (max 30) ---
  const hyps = tData.hypothesisValidation ?? [];
  let hypScore = 0;
  if (hyps.length > 0) {
    const validated = hyps.filter((h) => h.status === "validated").length;
    const toTest = hyps.filter((h) => h.status === "to_test").length;
    const validatedRatio = validated / hyps.length;
    const gapPenalty = toTest / hyps.length;
    hypScore = Math.round(validatedRatio * 25 + (1 - gapPenalty) * 5);
  }

  // --- 3. marketSizing (max 20) ---
  const tam = tData.tamSamSom;
  let msScore = 0;
  if (tam?.tam?.value && tam.tam.value.trim().length > 0) msScore += 6;
  if (tam?.sam?.value && tam.sam.value.trim().length > 0) msScore += 6;
  if (tam?.som?.value && tam.som.value.trim().length > 0) msScore += 4;
  if (tam?.methodology && tam.methodology.trim().length > 0) msScore += 4;

  // --- 4. competitiveDifferentiation (max 25) ---
  const benchmarks = tData.competitiveBenchmark ?? [];
  const recommendations = tData.strategicRecommendations ?? [];
  const marketReality = tData.marketReality;
  let compScore = 0;
  if (benchmarks.length >= 2) compScore += 10;
  else if (benchmarks.length >= 1) compScore += 5;
  if (recommendations.length >= 3) compScore += 8;
  else if (recommendations.length >= 1) compScore += 4;
  if (marketReality?.macroTrends?.length > 0) compScore += 4;
  if (marketReality?.weakSignals?.length > 0) compScore += 3;

  const total = Math.min(100, triScore + hypScore + msScore + compScore);

  return {
    triangulationQuality: triScore,
    hypothesisValidation: hypScore,
    marketSizing: msScore,
    competitiveDifferentiation: compScore,
    total,
  };
}
