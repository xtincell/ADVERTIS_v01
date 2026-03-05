// =============================================================================
// FW-14 — Brand Evolution Engine Schema
// =============================================================================
// Tracks brand identity stability, detects drift from core positioning, and
// identifies lifecycle stage to guide evolution strategy.
// Variables: BE.identityCore, BE.driftDetection, BE.lifecycleStage
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Identity Core — immutable vs mutable brand elements
// ---------------------------------------------------------------------------

export const IdentityCoreElementSchema = z.object({
  id: z.string(),
  element: z.string().describe("Brand element name"),
  mutability: z.enum(["IMMUTABLE", "MUTABLE"]),
  description: z.string().describe("Description of this brand element"),
  lastChanged: z.string().nullable().describe("ISO date of last change, null if never changed"),
});

export type IdentityCoreElement = z.infer<typeof IdentityCoreElementSchema>;

export const IdentityCoreSchema = z.object({
  immutable: z.array(IdentityCoreElementSchema).describe("Brand elements that must not change"),
  mutable: z.array(IdentityCoreElementSchema).describe("Brand elements that can evolve"),
  coreStabilityScore: z.number().min(0).max(100).describe("Stability score of the identity core (0-100)"),
});

export type IdentityCore = z.infer<typeof IdentityCoreSchema>;

// ---------------------------------------------------------------------------
// Drift Detection — monitoring deviation from brand baseline
// ---------------------------------------------------------------------------

export const DriftIndicatorSchema = z.object({
  id: z.string(),
  indicator: z.string().describe("Name of the drift indicator"),
  currentValue: z.number().describe("Current measured value"),
  baselineValue: z.number().describe("Baseline reference value"),
  driftMagnitude: z.number().describe("Absolute drift from baseline"),
  direction: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
  alert: z.boolean().describe("Whether drift exceeds alert threshold"),
});

export type DriftIndicator = z.infer<typeof DriftIndicatorSchema>;

export const DriftDetectionSchema = z.object({
  indicators: z.array(DriftIndicatorSchema),
  overallDriftScore: z.number().min(0).max(100).describe("Aggregate drift score (0-100)"),
  status: z.enum(["STABLE", "DRIFTING", "CRITICAL"]),
  recommendation: z.string().describe("Action recommendation based on drift analysis"),
});

export type DriftDetection = z.infer<typeof DriftDetectionSchema>;

// ---------------------------------------------------------------------------
// Lifecycle Stage — brand maturity detection
// ---------------------------------------------------------------------------

export const LifecycleStageSchema = z.enum([
  "LAUNCH",
  "GROWTH",
  "MATURITY",
  "DECLINE",
  "REVITALIZATION",
]);

export type LifecycleStage = z.infer<typeof LifecycleStageSchema>;

export const LifecycleDetectionSchema = z.object({
  currentStage: LifecycleStageSchema,
  confidence: z.number().min(0).max(100).describe("Confidence in stage detection (0-100)"),
  transitionSignals: z.array(z.string()).describe("Signals indicating possible stage transition"),
  nextLikelyStage: LifecycleStageSchema.nullable().describe("Predicted next lifecycle stage"),
  recommendations: z.array(z.string()).describe("Strategic recommendations for current stage"),
});

export type LifecycleDetection = z.infer<typeof LifecycleDetectionSchema>;

// ---------------------------------------------------------------------------
// Brand Evolution Engine — Combined Output
// ---------------------------------------------------------------------------

export const BrandEvolutionOutputSchema = z.object({
  identityCore: IdentityCoreSchema,
  driftDetection: DriftDetectionSchema,
  lifecycleStage: LifecycleDetectionSchema,
});

export type BrandEvolutionOutput = z.infer<typeof BrandEvolutionOutputSchema>;
