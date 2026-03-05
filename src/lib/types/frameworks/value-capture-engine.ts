// =============================================================================
// FW-21 — Value Capture Engine Schema
// =============================================================================
// Defines revenue model, pricing mechanics, revenue scenarios (3 forecasts),
// community monetization pathways, and revenue mix targets.
// Mirror of FW-03 budget allocation (revenue side).
// =============================================================================

import { z } from "zod";
import { flexStringArray } from "../pillars/shared";
import { SuperfanStageSchema } from "./framework-descriptor";

// ---------------------------------------------------------------------------
// Revenue Model
// ---------------------------------------------------------------------------

export const RevenueStreamSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["PRODUCT", "SERVICE", "SUBSCRIPTION", "LICENSING", "ADVERTISING", "COMMUNITY", "PARTNERSHIP", "DATA"]),
  description: z.string(),
  /** Target superfan stages that feed this stream */
  targetStages: z.array(SuperfanStageSchema),
  /** Estimated annual revenue contribution % */
  estimatedContribution: z.number().min(0).max(100),
  /** Scalability assessment */
  scalability: z.enum(["LOW", "MEDIUM", "HIGH"]),
  /** Current maturity of this stream */
  maturity: z.enum(["CONCEPT", "PILOT", "GROWING", "MATURE", "DECLINING"]),
});

export const RevenueModelSchema = z.object({
  primaryModel: z.enum(["DIRECT_SALES", "SUBSCRIPTION", "FREEMIUM", "MARKETPLACE", "HYBRID"]),
  streams: z.array(RevenueStreamSchema).min(1),
  diversificationScore: z.number().min(0).max(100).describe("Score de diversification des revenus"),
});

export type RevenueModel = z.infer<typeof RevenueModelSchema>;

// ---------------------------------------------------------------------------
// Pricing Mechanics
// ---------------------------------------------------------------------------

export const PricingMechanicSchema = z.object({
  id: z.string(),
  name: z.string(),
  strategy: z.enum(["VALUE_BASED", "COMPETITIVE", "COST_PLUS", "DYNAMIC", "FREEMIUM", "TIERED", "PENETRATION", "PREMIUM"]),
  targetSegment: z.string(),
  priceRange: z.string(),
  psychologicalAnchors: flexStringArray.describe("Ancres psychologiques du pricing"),
  bundlingStrategy: z.string().optional(),
});

export type PricingMechanic = z.infer<typeof PricingMechanicSchema>;

// ---------------------------------------------------------------------------
// Revenue Scenarios
// ---------------------------------------------------------------------------

export const RevenueScenarioSchema = z.object({
  type: z.enum(["PESSIMISTIC", "BASE", "OPTIMISTIC"]),
  /** Monthly Recurring Revenue at 12 months */
  mrr12: z.number(),
  /** Annual Recurring Revenue at 12 months */
  arr12: z.number(),
  /** Total revenue Year 1 */
  totalYear1: z.number(),
  /** Total revenue Year 3 */
  totalYear3: z.number(),
  /** Assumptions driving this scenario */
  assumptions: flexStringArray,
  /** Key risks for this scenario */
  risks: flexStringArray,
  /** LTV:CAC ratio projection */
  ltvCacRatio: z.number().optional(),
});

export type RevenueScenario = z.infer<typeof RevenueScenarioSchema>;

// ---------------------------------------------------------------------------
// Community Monetization
// ---------------------------------------------------------------------------

export const CommunityMonetizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  mechanism: z.enum(["MEMBERSHIP", "MARKETPLACE_FEE", "EVENT_REVENUE", "UGC_LICENSING", "REFERRAL_COMMISSION", "CO_CREATION_ROYALTY"]),
  targetStage: SuperfanStageSchema,
  estimatedRevenuePerMember: z.number(),
  scalingCurve: z.enum(["LINEAR", "EXPONENTIAL", "LOGARITHMIC"]),
  description: z.string(),
});

export type CommunityMonetization = z.infer<typeof CommunityMonetizationSchema>;

// ---------------------------------------------------------------------------
// Revenue Mix Target
// ---------------------------------------------------------------------------

export const RevenueMixTargetSchema = z.object({
  streamId: z.string(),
  streamName: z.string(),
  currentPercent: z.number().min(0).max(100),
  targetPercent12m: z.number().min(0).max(100),
  targetPercent36m: z.number().min(0).max(100),
});

export type RevenueMixTarget = z.infer<typeof RevenueMixTargetSchema>;

// ---------------------------------------------------------------------------
// Value Capture Engine — Combined Output
// ---------------------------------------------------------------------------

export const ValueCaptureEngineOutputSchema = z.object({
  revenueModel: RevenueModelSchema,
  pricingMechanics: z.array(PricingMechanicSchema),
  revenueScenarios: z.array(RevenueScenarioSchema).length(3),
  communityMonetization: z.array(CommunityMonetizationSchema),
  revenueMixTarget: z.array(RevenueMixTargetSchema),
});

export type ValueCaptureEngineOutput = z.infer<typeof ValueCaptureEngineOutputSchema>;
