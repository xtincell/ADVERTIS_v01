// =============================================================================
// FW-19 — Growth Mechanics Engine Schema
// =============================================================================
// Defines growth engine classification, flywheel loops, scaling breakpoints,
// Ansoff expansion matrix, and community monetization pathways.
// Variables: GM.growthEngine, GM.flywheel, GM.scalingBreakpoints,
//            GM.expansionMatrix, GM.communityMonetization
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Growth Engine
// ---------------------------------------------------------------------------

export const GrowthEngineTypeSchema = z.enum(["VIRAL", "STICKY", "PAID"]);

export type GrowthEngineType = z.infer<typeof GrowthEngineTypeSchema>;

export const GrowthEngineSchema = z.object({
  primaryEngine: GrowthEngineTypeSchema,
  /** Viral coefficient (k-factor) — >1 means self-sustaining viral growth */
  viralCoefficient: z.number(),
  /** Sticky retention rate (%) — proportion of users retained period-over-period */
  stickyRetention: z.number().min(0).max(100),
  /** Paid customer acquisition cost (FCFA) */
  paidCac: z.number(),
  /** Blended growth score 0-100 across all engines */
  blendedScore: z.number().min(0).max(100),
  /** Strategic recommendation for growth engine focus */
  recommendation: z.string(),
});

export type GrowthEngine = z.infer<typeof GrowthEngineSchema>;

// ---------------------------------------------------------------------------
// Flywheel
// ---------------------------------------------------------------------------

export const FlywheelStepSchema = z.object({
  id: z.string(),
  order: z.number(),
  name: z.string(),
  action: z.string(),
  output: z.string(),
  /** ID of the step this feeds into */
  feedsInto: z.string(),
  /** Mechanism that accelerates this step */
  accelerator: z.string(),
});

export type FlywheelStep = z.infer<typeof FlywheelStepSchema>;

// ---------------------------------------------------------------------------
// Scaling Breakpoints
// ---------------------------------------------------------------------------

export const ScalingBreakpointSchema = z.object({
  id: z.string(),
  name: z.string(),
  triggerMetric: z.string(),
  triggerValue: z.number(),
  currentValue: z.number(),
  actions: z.array(z.string()),
  risks: z.array(z.string()),
  estimatedTimeline: z.string(),
});

export type ScalingBreakpoint = z.infer<typeof ScalingBreakpointSchema>;

// ---------------------------------------------------------------------------
// Ansoff Expansion Matrix
// ---------------------------------------------------------------------------

export const AnsoffQuadrantSchema = z.enum([
  "MARKET_PENETRATION",
  "MARKET_DEVELOPMENT",
  "PRODUCT_DEVELOPMENT",
  "DIVERSIFICATION",
]);

export type AnsoffQuadrant = z.infer<typeof AnsoffQuadrantSchema>;

export const ExpansionEntrySchema = z.object({
  quadrant: AnsoffQuadrantSchema,
  strategy: z.string(),
  risk: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
  priority: z.number(),
  estimatedRevenue: z.string(),
  timeToMarket: z.string(),
});

export type ExpansionEntry = z.infer<typeof ExpansionEntrySchema>;

// ---------------------------------------------------------------------------
// Community Monetization
// ---------------------------------------------------------------------------

export const GrowthCommunityMonetizationSchema = z.object({
  id: z.string(),
  mechanism: z.string(),
  segment: z.string(),
  revenuePerMember: z.number(),
  scalability: z.enum(["LINEAR", "EXPONENTIAL", "LOGARITHMIC"]),
  description: z.string(),
});

export type GrowthCommunityMonetization = z.infer<typeof GrowthCommunityMonetizationSchema>;

// ---------------------------------------------------------------------------
// Growth Mechanics Engine — Combined Output
// ---------------------------------------------------------------------------

export const GrowthMechanicsOutputSchema = z.object({
  growthEngine: GrowthEngineSchema,
  flywheel: z.array(FlywheelStepSchema),
  scalingBreakpoints: z.array(ScalingBreakpointSchema),
  expansionMatrix: z.array(ExpansionEntrySchema),
  communityMonetization: z.array(GrowthCommunityMonetizationSchema),
});

export type GrowthMechanicsOutput = z.infer<typeof GrowthMechanicsOutputSchema>;
