// Mathematical Risk Score Calculator
// Replaces AI-generated riskScore with deterministic formula.
// Consumes structured data already present in RiskAuditResult.

import type { RiskAuditResult } from "~/lib/types/pillar-schemas";

// ---------------------------------------------------------------------------
// Breakdown interface
// ---------------------------------------------------------------------------

export interface RiskBreakdown {
  /** 0-40 — weighted average of micro-SWOT risk levels */
  microSwotRisk: number;
  /** 0-30 — aggregate from probability × impact matrix */
  probabilityImpactRisk: number;
  /** 0-20 — negative vs total SWOT balance */
  globalSwotBalance: number;
  /** 0-10 — penalty for high risks without mitigations */
  mitigationCoverage: number;
  /** 0-100 — total risk score */
  total: number;
}

// ---------------------------------------------------------------------------
// Calculator
// ---------------------------------------------------------------------------

const RISK_LEVEL_VALUES: Record<string, number> = {
  low: 0,
  medium: 0.5,
  high: 1,
};

const PI_VALUES: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * Calculate a deterministic risk score from structured Risk Audit data.
 *
 * Formula (4 components, max 100):
 *   1. microSwotRisk      (40) — avg risk level across micro-SWOTs
 *   2. probabilityImpact  (30) — from P×I matrix (1-9 per item)
 *   3. globalSwotBalance   (20) — weakness+threats ratio
 *   4. mitigationCoverage (10) — penalty for uncovered high risks
 */
export function calculateRiskScore(rData: RiskAuditResult): RiskBreakdown {
  // --- 1. microSwotRisk (max 40) ---
  const microSwots = rData.microSwots ?? [];
  let avgMicroRisk: number;
  if (microSwots.length > 0) {
    const sum = microSwots.reduce(
      (acc, s) => acc + (RISK_LEVEL_VALUES[s.riskLevel] ?? 0.5),
      0,
    );
    avgMicroRisk = sum / microSwots.length;
  } else {
    avgMicroRisk = 0.5; // neutral default when no data
  }
  const microSwotRisk = Math.round(avgMicroRisk * 40);

  // --- 2. probabilityImpactRisk (max 30) ---
  const matrix = rData.probabilityImpactMatrix ?? [];
  let piScore: number;
  if (matrix.length > 0) {
    const totalPI = matrix.reduce((sum, item) => {
      const p = PI_VALUES[item.probability] ?? 2;
      const i = PI_VALUES[item.impact] ?? 2;
      return sum + p * i; // 1-9 per item
    }, 0);
    const maxPI = matrix.length * 9;
    piScore = Math.round((totalPI / maxPI) * 30);
  } else {
    piScore = 15; // neutral default
  }

  // --- 3. globalSwotBalance (max 20) ---
  const gs = rData.globalSwot;
  const positives =
    (gs?.strengths?.length ?? 0) + (gs?.opportunities?.length ?? 0);
  const negatives =
    (gs?.weaknesses?.length ?? 0) + (gs?.threats?.length ?? 0);
  const swotTotal = positives + negatives;
  const balanceRisk =
    swotTotal > 0 ? Math.round((negatives / swotTotal) * 20) : 10;

  // --- 4. mitigationCoverage (max 10, penalty) ---
  const highRiskCount = microSwots.filter(
    (s) => s.riskLevel === "high",
  ).length;
  const mitigationCount = rData.mitigationPriorities?.length ?? 0;
  let mitigationPenalty = 0;
  if (highRiskCount > 0) {
    const coverageRatio = Math.min(1, mitigationCount / highRiskCount);
    mitigationPenalty = Math.round((1 - coverageRatio) * 10);
  }

  const total = Math.min(
    100,
    microSwotRisk + piScore + balanceRisk + mitigationPenalty,
  );

  return {
    microSwotRisk,
    probabilityImpactRisk: piScore,
    globalSwotBalance: balanceRisk,
    mitigationCoverage: mitigationPenalty,
    total,
  };
}
