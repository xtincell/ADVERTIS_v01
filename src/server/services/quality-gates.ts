// =============================================================================
// MODULE 27 — Quality Gates (Phase 12)
// =============================================================================
// Five quality gates that assess an ARTEMIS strategy's readiness across
// completeness, depth, soundness, coherence, and deliverable quality.
//
// Public API:
//   evaluateQualityGates(strategyId)
//     → QualityGateResult[]
//
// Gates:
//   1. DATA_COMPLETENESS      — Pillar coverage (A-D-V-E-R-T-I vs 7 total)
//   2. INSIGHT_DEPTH          — Framework output coverage for layers 0-5
//   3. STRATEGIC_SOUNDNESS    — Framework output coverage for layers 6-7
//   4. CROSS_FRAMEWORK_COHERENCE — Freshness ratio across all outputs
//   5. DELIVERABLE_QUALITY    — Global composite of all gate scores
//
// Dependencies:
//   - ~/server/db (Prisma client — Pillar, FrameworkOutput)
//   - ~/lib/framework-registry (getAllFrameworks)
//
// Called by:
//   - framework.ts tRPC router (quality gates query)
//   - artemis-orchestrator.ts (post-orchestration assessment)
//   - Dashboard UI components
// =============================================================================

import { db } from "~/server/db";
import { getAllFrameworks } from "~/lib/framework-registry";
import type { ArtemisLayer } from "~/lib/types/frameworks/framework-descriptor";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QualityGateResult {
  gateId: string;
  name: string;
  passed: boolean;
  score: number; // 0-100
  details: string[];
  blockers: string[];
}

// ---------------------------------------------------------------------------
// Layer groupings
// ---------------------------------------------------------------------------

/** Layers 0-5: PHILOSOPHY through EXECUTION (Insight Depth) */
const INSIGHT_LAYERS: ArtemisLayer[] = [
  "PHILOSOPHY",
  "IDENTITY",
  "VALUE",
  "EXPERIENCE",
  "VALIDATION",
  "EXECUTION",
];

/** Layers 6-7: GROWTH and SURVIVAL (Strategic Soundness) */
const STRATEGIC_LAYERS: ArtemisLayer[] = [
  "GROWTH",
  "SURVIVAL",
];

// ---------------------------------------------------------------------------
// Gate thresholds
// ---------------------------------------------------------------------------

const THRESHOLDS = {
  DATA_COMPLETENESS: 60,
  INSIGHT_DEPTH: 50,
  STRATEGIC_SOUNDNESS: 40,
  CROSS_FRAMEWORK_COHERENCE: 70,
  DELIVERABLE_QUALITY: 50,
} as const;

/** Total expected pillar types for completeness gate */
const TOTAL_PILLAR_TYPES = 7;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Evaluate all 5 quality gates for a strategy.
 *
 * @param strategyId - Strategy to evaluate
 * @returns Array of 5 QualityGateResult objects
 */
export async function evaluateQualityGates(
  strategyId: string,
): Promise<QualityGateResult[]> {
  // ── Pre-fetch shared data ───────────────────────────────────────────
  const allFrameworks = getAllFrameworks();

  const [pillars, frameworkOutputs] = await Promise.all([
    db.pillar.findMany({
      where: { strategyId },
      select: { type: true, status: true },
    }),
    db.frameworkOutput.findMany({
      where: { strategyId },
      select: { frameworkId: true, isStale: true },
    }),
  ]);

  // Build lookup: frameworkId → output record
  const outputMap = new Map(
    frameworkOutputs.map((o) => [o.frameworkId, o]),
  );

  // ── Gate 1: DATA_COMPLETENESS ───────────────────────────────────────
  const gate1 = evaluateDataCompleteness(pillars);

  // ── Gate 2: INSIGHT_DEPTH ───────────────────────────────────────────
  const gate2 = evaluateInsightDepth(allFrameworks, outputMap);

  // ── Gate 3: STRATEGIC_SOUNDNESS ─────────────────────────────────────
  const gate3 = evaluateStrategicSoundness(allFrameworks, outputMap);

  // ── Gate 4: CROSS_FRAMEWORK_COHERENCE ───────────────────────────────
  const gate4 = evaluateCrossFrameworkCoherence(frameworkOutputs);

  // ── Gate 5: DELIVERABLE_QUALITY ─────────────────────────────────────
  const gate5 = evaluateDeliverableQuality(
    allFrameworks,
    outputMap,
    [gate1, gate2, gate3, gate4],
  );

  return [gate1, gate2, gate3, gate4, gate5];
}

// ---------------------------------------------------------------------------
// Gate 1 — DATA_COMPLETENESS
// ---------------------------------------------------------------------------

/**
 * Check how many pillar types exist with "complete" status for the strategy.
 * Score = (completed pillars / 7 total) * 100. Passes if >= 60.
 */
function evaluateDataCompleteness(
  pillars: Array<{ type: string; status: string }>,
): QualityGateResult {
  const completedTypes = new Set(
    pillars
      .filter((p) => p.status === "complete")
      .map((p) => p.type),
  );

  const completedCount = completedTypes.size;
  const score = Math.round((completedCount / TOTAL_PILLAR_TYPES) * 100);
  const threshold = THRESHOLDS.DATA_COMPLETENESS;
  const passed = score >= threshold;

  const details = [
    `${completedCount}/${TOTAL_PILLAR_TYPES} pillar types completed`,
    `Score: ${score}/100 (threshold: ${threshold})`,
  ];

  const allExpectedTypes = ["A", "D", "V", "E", "R", "T", "I"];
  const blockers: string[] = [];
  for (const type of allExpectedTypes) {
    if (!completedTypes.has(type)) {
      blockers.push(`Pillar "${type}" is not complete`);
    }
  }

  return {
    gateId: "DATA_COMPLETENESS",
    name: "Data Completeness",
    passed,
    score,
    details,
    blockers,
  };
}

// ---------------------------------------------------------------------------
// Gate 2 — INSIGHT_DEPTH
// ---------------------------------------------------------------------------

/**
 * Check FrameworkOutputs for layers 0-5 (PHILOSOPHY through EXECUTION).
 * Score = (non-stale outputs for layers 0-5 / total implemented frameworks
 *          in those layers) * 100. Passes if >= 50.
 */
function evaluateInsightDepth(
  allFrameworks: ReturnType<typeof getAllFrameworks>,
  outputMap: Map<string, { frameworkId: string; isStale: boolean }>,
): QualityGateResult {
  const layerSet = new Set<ArtemisLayer>(INSIGHT_LAYERS);

  const implementedInLayers = allFrameworks.filter(
    (fw) => fw.hasImplementation && layerSet.has(fw.layer),
  );

  const totalImplemented = implementedInLayers.length;
  let freshCount = 0;
  const missingFrameworks: string[] = [];

  for (const fw of implementedInLayers) {
    const output = outputMap.get(fw.id);
    if (output && !output.isStale) {
      freshCount++;
    } else {
      const reason = output
        ? `${fw.name} (${fw.id}): output is stale`
        : `${fw.name} (${fw.id}): no output generated`;
      missingFrameworks.push(reason);
    }
  }

  const score =
    totalImplemented > 0
      ? Math.round((freshCount / totalImplemented) * 100)
      : 0;
  const threshold = THRESHOLDS.INSIGHT_DEPTH;
  const passed = score >= threshold;

  const details = [
    `${freshCount}/${totalImplemented} implemented frameworks in layers 0-5 have fresh outputs`,
    `Layers checked: ${INSIGHT_LAYERS.join(", ")}`,
    `Score: ${score}/100 (threshold: ${threshold})`,
  ];

  return {
    gateId: "INSIGHT_DEPTH",
    name: "Insight Depth",
    passed,
    score,
    details,
    blockers: missingFrameworks,
  };
}

// ---------------------------------------------------------------------------
// Gate 3 — STRATEGIC_SOUNDNESS
// ---------------------------------------------------------------------------

/**
 * Check FrameworkOutputs for layers 6-7 (GROWTH, SURVIVAL).
 * Score = (non-stale outputs / total implemented in those layers) * 100.
 * Passes if >= 40.
 */
function evaluateStrategicSoundness(
  allFrameworks: ReturnType<typeof getAllFrameworks>,
  outputMap: Map<string, { frameworkId: string; isStale: boolean }>,
): QualityGateResult {
  const layerSet = new Set<ArtemisLayer>(STRATEGIC_LAYERS);

  const implementedInLayers = allFrameworks.filter(
    (fw) => fw.hasImplementation && layerSet.has(fw.layer),
  );

  const totalImplemented = implementedInLayers.length;
  let freshCount = 0;
  const missingFrameworks: string[] = [];

  for (const fw of implementedInLayers) {
    const output = outputMap.get(fw.id);
    if (output && !output.isStale) {
      freshCount++;
    } else {
      const reason = output
        ? `${fw.name} (${fw.id}): output is stale`
        : `${fw.name} (${fw.id}): no output generated`;
      missingFrameworks.push(reason);
    }
  }

  const score =
    totalImplemented > 0
      ? Math.round((freshCount / totalImplemented) * 100)
      : 0;
  const threshold = THRESHOLDS.STRATEGIC_SOUNDNESS;
  const passed = score >= threshold;

  const details = [
    `${freshCount}/${totalImplemented} implemented frameworks in layers 6-7 have fresh outputs`,
    `Layers checked: ${STRATEGIC_LAYERS.join(", ")}`,
    `Score: ${score}/100 (threshold: ${threshold})`,
  ];

  return {
    gateId: "STRATEGIC_SOUNDNESS",
    name: "Strategic Soundness",
    passed,
    score,
    details,
    blockers: missingFrameworks,
  };
}

// ---------------------------------------------------------------------------
// Gate 4 — CROSS_FRAMEWORK_COHERENCE
// ---------------------------------------------------------------------------

/**
 * Check that connected frameworks have fresh outputs (not stale).
 * Score = (non-stale outputs / total outputs) * 100. Passes if >= 70.
 */
function evaluateCrossFrameworkCoherence(
  frameworkOutputs: Array<{ frameworkId: string; isStale: boolean }>,
): QualityGateResult {
  const totalOutputs = frameworkOutputs.length;
  const staleOutputs = frameworkOutputs.filter((o) => o.isStale);
  const freshOutputs = totalOutputs - staleOutputs.length;

  const score =
    totalOutputs > 0
      ? Math.round((freshOutputs / totalOutputs) * 100)
      : 0;
  const threshold = THRESHOLDS.CROSS_FRAMEWORK_COHERENCE;
  const passed = score >= threshold;

  const details = [
    `${freshOutputs}/${totalOutputs} framework outputs are fresh (non-stale)`,
    `${staleOutputs.length} stale outputs detected`,
    `Score: ${score}/100 (threshold: ${threshold})`,
  ];

  const blockers: string[] = staleOutputs.map(
    (o) => `${o.frameworkId}: output is stale`,
  );

  return {
    gateId: "CROSS_FRAMEWORK_COHERENCE",
    name: "Cross-Framework Coherence",
    passed,
    score,
    details,
    blockers,
  };
}

// ---------------------------------------------------------------------------
// Gate 5 — DELIVERABLE_QUALITY
// ---------------------------------------------------------------------------

/**
 * Global check: all implemented frameworks have outputs AND overall ARTEMIS
 * score exceeds threshold. Score = weighted average of all gate scores.
 * Passes if >= 50.
 */
function evaluateDeliverableQuality(
  allFrameworks: ReturnType<typeof getAllFrameworks>,
  outputMap: Map<string, { frameworkId: string; isStale: boolean }>,
  priorGates: QualityGateResult[],
): QualityGateResult {
  // Check coverage: how many implemented frameworks actually have outputs
  const implementedFrameworks = allFrameworks.filter((fw) => fw.hasImplementation);
  const totalImplemented = implementedFrameworks.length;
  const withOutput = implementedFrameworks.filter((fw) =>
    outputMap.has(fw.id),
  ).length;

  const coverageRatio =
    totalImplemented > 0 ? withOutput / totalImplemented : 0;

  // Weighted average of all prior gate scores
  // Weights: DATA_COMPLETENESS=25%, INSIGHT_DEPTH=25%, STRATEGIC_SOUNDNESS=20%,
  //          CROSS_FRAMEWORK_COHERENCE=30%
  const weights = [0.25, 0.25, 0.2, 0.3];
  let weightedSum = 0;
  for (let i = 0; i < priorGates.length; i++) {
    weightedSum += (priorGates[i]?.score ?? 0) * (weights[i] ?? 0);
  }

  // Final score blends weighted gate average (70%) + coverage ratio (30%)
  const score = Math.round(weightedSum * 0.7 + coverageRatio * 100 * 0.3);
  const threshold = THRESHOLDS.DELIVERABLE_QUALITY;
  const passed = score >= threshold;

  const details = [
    `${withOutput}/${totalImplemented} implemented frameworks have outputs`,
    `Weighted gate average: ${Math.round(weightedSum)}/100`,
    `Coverage ratio: ${Math.round(coverageRatio * 100)}%`,
    `Score: ${score}/100 (threshold: ${threshold})`,
  ];

  const blockers: string[] = [];
  const missingOutputFrameworks = implementedFrameworks.filter(
    (fw) => !outputMap.has(fw.id),
  );
  for (const fw of missingOutputFrameworks) {
    blockers.push(`${fw.name} (${fw.id}): no output generated`);
  }

  // Also flag any prior gate that did not pass
  for (const gate of priorGates) {
    if (!gate.passed) {
      blockers.push(`Gate "${gate.name}" did not pass (score: ${gate.score})`);
    }
  }

  return {
    gateId: "DELIVERABLE_QUALITY",
    name: "Deliverable Quality",
    passed,
    score,
    details,
    blockers,
  };
}
