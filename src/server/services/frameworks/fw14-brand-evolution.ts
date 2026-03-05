// =============================================================================
// FW-14 — Brand Evolution Engine Handler
// =============================================================================
// Compute module that tracks brand identity stability, detects drift from core
// positioning, and identifies lifecycle stage.
// Inputs: brand coherence score, cult index, pillar A values
// Outputs: BE.identityCore, BE.driftDetection, BE.lifecycleStage
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type {
  FrameworkContext,
  FrameworkHandlerResult,
} from "../framework-executor";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DRIFT_ALERT_THRESHOLD = 15;
const DEFAULT_BASELINE = 75;

const IMMUTABLE_ELEMENTS = [
  { id: "imm-mission", element: "Mission", description: "Core purpose and reason for existence" },
  { id: "imm-vision", element: "Vision", description: "Long-term aspirational direction" },
  { id: "imm-core-values", element: "Core Values", description: "Fundamental principles that guide all decisions" },
  { id: "imm-brand-promise", element: "Brand Promise", description: "Central commitment to customers" },
] as const;

const MUTABLE_ELEMENTS = [
  { id: "mut-visual-identity", element: "Visual Identity", description: "Logo, colors, typography, and visual language" },
  { id: "mut-tone", element: "Tone of Voice", description: "Communication style and personality expression" },
  { id: "mut-pricing", element: "Pricing Strategy", description: "Price positioning and monetization approach" },
  { id: "mut-target-audience", element: "Target Audience", description: "Primary audience segments and demographics" },
  { id: "mut-channels", element: "Distribution Channels", description: "Platforms and channels for reach and engagement" },
] as const;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(
  ctx: FrameworkContext,
): Promise<FrameworkHandlerResult> {
  try {
    // ── Resolve inputs ────────────────────────────────────────────────────
    const coherenceScore = asNumber(ctx.inputs["A.brandCoherenceScore"]) ?? null;
    const cultIndex = asNumber(ctx.inputs["A.cultIndex"]) ?? null;
    const pillarA = ctx.inputs["A"] as Record<string, unknown> | null;

    // Gather all available pillar A keys to estimate completeness
    const pillarAKeys = pillarA ? Object.keys(pillarA) : [];
    const pillarAComplete = pillarAKeys.length;

    // ── 1. Identity Core ──────────────────────────────────────────────────
    const identityCore = buildIdentityCore(pillarA);

    // ── 2. Drift Detection ────────────────────────────────────────────────
    const driftDetection = buildDriftDetection(coherenceScore, cultIndex, pillarA);

    // ── 3. Lifecycle Detection ────────────────────────────────────────────
    const lifecycleStage = detectLifecycleStage(
      coherenceScore,
      cultIndex,
      pillarAComplete,
      driftDetection.overallDriftScore as number,
    );

    return {
      success: true,
      data: {
        "BE.identityCore": identityCore,
        "BE.driftDetection": driftDetection,
        "BE.lifecycleStage": lifecycleStage,
      },
    };
  } catch (err) {
    return {
      success: false,
      data: {},
      error: err instanceof Error ? err.message : "Erreur FW-14",
    };
  }
}

// ---------------------------------------------------------------------------
// Identity Core Builder
// ---------------------------------------------------------------------------

function buildIdentityCore(
  pillarA: Record<string, unknown> | null,
): Record<string, unknown> {
  // Classify immutable elements — check which ones have been populated
  const immutable = IMMUTABLE_ELEMENTS.map((el) => ({
    id: el.id,
    element: el.element,
    mutability: "IMMUTABLE" as const,
    description: el.description,
    lastChanged: null,
  }));

  const mutable = MUTABLE_ELEMENTS.map((el) => ({
    id: el.id,
    element: el.element,
    mutability: "MUTABLE" as const,
    description: el.description,
    lastChanged: null,
  }));

  // Core stability score: based on how many immutable elements are present
  // in pillar A data. Each of the 4 immutable elements contributes 25 points.
  let immutablePresent = 0;
  if (pillarA) {
    if (pillarA["A.mission"] || pillarA["mission"]) immutablePresent++;
    if (pillarA["A.vision"] || pillarA["vision"]) immutablePresent++;
    if (pillarA["A.coreValues"] || pillarA["coreValues"] || pillarA["values"]) immutablePresent++;
    if (pillarA["A.brandPromise"] || pillarA["brandPromise"] || pillarA["promise"]) immutablePresent++;
  }
  const coreStabilityScore = (immutablePresent / IMMUTABLE_ELEMENTS.length) * 100;

  return {
    immutable,
    mutable,
    coreStabilityScore,
  };
}

// ---------------------------------------------------------------------------
// Drift Detection Builder
// ---------------------------------------------------------------------------

function buildDriftDetection(
  coherenceScore: number | null,
  cultIndex: number | null,
  pillarA: Record<string, unknown> | null,
): Record<string, unknown> {
  const indicators: Array<Record<string, unknown>> = [];

  // Indicator 1: Coherence Score Drift
  const coherenceCurrent = coherenceScore ?? DEFAULT_BASELINE;
  const coherenceDrift = Math.abs(coherenceCurrent - DEFAULT_BASELINE);
  indicators.push({
    id: "drift-coherence",
    indicator: "Brand Coherence Score",
    currentValue: coherenceCurrent,
    baselineValue: DEFAULT_BASELINE,
    driftMagnitude: coherenceDrift,
    direction: deriveDirection(coherenceCurrent, DEFAULT_BASELINE),
    alert: coherenceDrift > DRIFT_ALERT_THRESHOLD,
  });

  // Indicator 2: Cult Index Drift
  const cultCurrent = cultIndex ?? DEFAULT_BASELINE;
  const cultDrift = Math.abs(cultCurrent - DEFAULT_BASELINE);
  indicators.push({
    id: "drift-cult-index",
    indicator: "Cult Index",
    currentValue: cultCurrent,
    baselineValue: DEFAULT_BASELINE,
    driftMagnitude: cultDrift,
    direction: deriveDirection(cultCurrent, DEFAULT_BASELINE),
    alert: cultDrift > DRIFT_ALERT_THRESHOLD,
  });

  // Indicator 3: Audience Perception Drift (derived from pillar A signals)
  const audiencePerception = deriveAudiencePerception(pillarA);
  const audienceDrift = Math.abs(audiencePerception - DEFAULT_BASELINE);
  indicators.push({
    id: "drift-audience",
    indicator: "Audience Perception",
    currentValue: audiencePerception,
    baselineValue: DEFAULT_BASELINE,
    driftMagnitude: audienceDrift,
    direction: deriveDirection(audiencePerception, DEFAULT_BASELINE),
    alert: audienceDrift > DRIFT_ALERT_THRESHOLD,
  });

  // Indicator 4: Market Position Drift (derived from available data)
  const marketPosition = deriveMarketPosition(coherenceScore, cultIndex);
  const marketDrift = Math.abs(marketPosition - DEFAULT_BASELINE);
  indicators.push({
    id: "drift-market",
    indicator: "Market Position",
    currentValue: marketPosition,
    baselineValue: DEFAULT_BASELINE,
    driftMagnitude: marketDrift,
    direction: deriveDirection(marketPosition, DEFAULT_BASELINE),
    alert: marketDrift > DRIFT_ALERT_THRESHOLD,
  });

  // Overall drift score: average of all drift magnitudes, capped at 100
  const overallDriftScore = Math.min(
    100,
    indicators.reduce((sum, ind) => sum + (ind.driftMagnitude as number), 0) / indicators.length,
  );

  // Status determination
  const alertCount = indicators.filter((ind) => ind.alert).length;
  let status: "STABLE" | "DRIFTING" | "CRITICAL";
  if (alertCount >= 3) {
    status = "CRITICAL";
  } else if (alertCount >= 1) {
    status = "DRIFTING";
  } else {
    status = "STABLE";
  }

  // Recommendation
  let recommendation: string;
  if (status === "CRITICAL") {
    recommendation =
      "Audit de marque urgent requis. Plusieurs indicateurs montrent une d\u00e9rive critique par rapport au positionnement de base.";
  } else if (status === "DRIFTING") {
    recommendation =
      "Surveiller les indicateurs en d\u00e9rive et planifier des actions correctives cibl\u00e9es pour r\u00e9aligner la marque.";
  } else {
    recommendation =
      "La marque est stable. Continuer le monitoring r\u00e9gulier et maintenir la coh\u00e9rence du positionnement.";
  }

  return {
    indicators,
    overallDriftScore,
    status,
    recommendation,
  };
}

// ---------------------------------------------------------------------------
// Lifecycle Stage Detection
// ---------------------------------------------------------------------------

function detectLifecycleStage(
  coherenceScore: number | null,
  cultIndex: number | null,
  pillarAComplete: number,
  overallDriftScore: number,
): Record<string, unknown> {
  let currentStage: string;
  let confidence: number;
  const transitionSignals: string[] = [];
  let nextLikelyStage: string | null = null;
  const recommendations: string[] = [];

  const coherence = coherenceScore ?? DEFAULT_BASELINE;
  const cult = cultIndex ?? DEFAULT_BASELINE;

  // LAUNCH detection: few pillars complete, brand is being established
  if (pillarAComplete < 3) {
    currentStage = "LAUNCH";
    confidence = 75;
    transitionSignals.push("Few brand pillars defined");
    transitionSignals.push("Brand identity still being established");
    nextLikelyStage = "GROWTH";
    recommendations.push("Focus on defining core identity elements before expanding");
    recommendations.push("Establish immutable brand elements early");
    recommendations.push("Build initial audience through consistent messaging");
  }
  // MATURITY detection: high coherence + high cult index
  else if (coherence >= 80 && cult >= 80) {
    currentStage = "MATURITY";
    confidence = 70;
    transitionSignals.push("High brand coherence score");
    transitionSignals.push("Strong cult index indicating loyal community");
    nextLikelyStage = overallDriftScore > 10 ? "DECLINE" : null;
    recommendations.push("Innovate within brand boundaries to prevent stagnation");
    recommendations.push("Invest in community deepening over acquisition");
    recommendations.push("Explore brand extension opportunities aligned with core values");
  }
  // DECLINE detection: dropping scores or high drift
  else if (
    (coherence < 50 && cult < 50) ||
    overallDriftScore > 30
  ) {
    currentStage = "DECLINE";
    confidence = 65;
    transitionSignals.push("Significant brand metric deterioration");
    if (overallDriftScore > 30) {
      transitionSignals.push("High overall drift from brand baseline");
    }
    if (coherence < 50) {
      transitionSignals.push("Brand coherence below critical threshold");
    }
    nextLikelyStage = "REVITALIZATION";
    recommendations.push("Conduct comprehensive brand audit immediately");
    recommendations.push("Reconnect with core brand promise and values");
    recommendations.push("Consider brand revitalization strategy");
  }
  // Default: GROWTH
  else {
    currentStage = "GROWTH";
    confidence = 60;
    transitionSignals.push("Brand metrics indicate active growth phase");
    if (coherence >= 70) {
      transitionSignals.push("Coherence trending toward maturity");
      nextLikelyStage = "MATURITY";
    }
    recommendations.push("Scale acquisition channels while maintaining brand consistency");
    recommendations.push("Deepen superfan pipeline and conversion rituals");
    recommendations.push("Monitor drift indicators to ensure growth stays on-brand");
  }

  return {
    currentStage,
    confidence,
    transitionSignals,
    nextLikelyStage,
    recommendations,
  };
}

// ---------------------------------------------------------------------------
// Utility Helpers
// ---------------------------------------------------------------------------

function asNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

function deriveDirection(
  current: number,
  baseline: number,
): "POSITIVE" | "NEGATIVE" | "NEUTRAL" {
  const diff = current - baseline;
  if (diff > 2) return "POSITIVE";
  if (diff < -2) return "NEGATIVE";
  return "NEUTRAL";
}

function deriveAudiencePerception(
  pillarA: Record<string, unknown> | null,
): number {
  if (!pillarA) return DEFAULT_BASELINE;

  // Estimate audience perception from available pillar A data density
  const keyCount = Object.keys(pillarA).length;
  // More data points suggest more audience insight, slight positive bias
  return Math.min(100, DEFAULT_BASELINE + Math.min(keyCount * 2, 15));
}

function deriveMarketPosition(
  coherenceScore: number | null,
  cultIndex: number | null,
): number {
  // Market position is a composite of coherence and cult index
  const coherence = coherenceScore ?? DEFAULT_BASELINE;
  const cult = cultIndex ?? DEFAULT_BASELINE;
  return Math.round((coherence * 0.6 + cult * 0.4));
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerFrameworkHandler("FW-14", execute);
