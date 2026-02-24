// =============================================================================
// LIB L.11 — Phase 1 Schemas
// =============================================================================
// Zod input validation schemas for Phase 1 (Fiche) data operations.
// Covers: SIS signals, decisions, competitors, opportunities, budget tiers,
// child strategies, and freshness thresholds.
// Exports: Create/Update/Mutate Signal schemas, Create/Update/Resolve Decision
//   schemas, UpsertCompetitor, CreateOpportunity, UpsertBudgetTier,
//   CreateChildStrategy, UpsertThreshold — plus all inferred *Input types.
// Used by: phase1 tRPC router, SIS UI, decision board, brand tree.
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Signal schemas
// ---------------------------------------------------------------------------

export const CreateSignalSchema = z.object({
  strategyId: z.string().min(1),
  pillar: z.string().min(1),
  layer: z.enum(["METRIC", "STRONG", "WEAK"]),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().min(1),
  source: z.string().optional(),
  evidence: z.any().optional(),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  reputationFlag: z.boolean().default(false),
});
export type CreateSignalInput = z.infer<typeof CreateSignalSchema>;

export const UpdateSignalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  evidence: z.any().optional(),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  reputationFlag: z.boolean().optional(),
});
export type UpdateSignalInput = z.infer<typeof UpdateSignalSchema>;

export const MutateSignalSchema = z.object({
  signalId: z.string().min(1),
  newStatus: z.string().min(1),
  reason: z.string().optional(),
});
export type MutateSignalInput = z.infer<typeof MutateSignalSchema>;

// ---------------------------------------------------------------------------
// Decision schemas
// ---------------------------------------------------------------------------

export const CreateDecisionSchema = z.object({
  strategyId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["P0", "P1", "P2"]).default("P1"),
  deadline: z.coerce.date().optional(),
  deadlineType: z.enum(["MARKETING", "INSTITUTIONAL", "STARTUP"]).optional(),
  signalId: z.string().optional(),
});
export type CreateDecisionInput = z.infer<typeof CreateDecisionSchema>;

export const UpdateDecisionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["P0", "P1", "P2"]).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "DEFERRED"]).optional(),
  deadline: z.coerce.date().optional(),
  deadlineType: z.enum(["MARKETING", "INSTITUTIONAL", "STARTUP"]).optional(),
});
export type UpdateDecisionInput = z.infer<typeof UpdateDecisionSchema>;

export const ResolveDecisionSchema = z.object({
  id: z.string().min(1),
  resolution: z.string().min(1),
});
export type ResolveDecisionInput = z.infer<typeof ResolveDecisionSchema>;

// ---------------------------------------------------------------------------
// Competitor schemas
// ---------------------------------------------------------------------------

export const UpsertCompetitorSchema = z.object({
  strategyId: z.string().min(1),
  name: z.string().min(1),
  sov: z.number().min(0).max(100).optional(),
  positioning: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  recentMoves: z.array(z.string()).optional(),
});
export type UpsertCompetitorInput = z.infer<typeof UpsertCompetitorSchema>;

// ---------------------------------------------------------------------------
// Opportunity schemas
// ---------------------------------------------------------------------------

export const CreateOpportunitySchema = z.object({
  strategyId: z.string().min(1),
  title: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  type: z.enum(["SEASONAL", "CULTURAL", "COMPETITIVE", "INTERNAL"]),
  impact: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  channels: z.array(z.string()).optional(),
  linkedAxes: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
export type CreateOpportunityInput = z.infer<typeof CreateOpportunitySchema>;

export const UpdateOpportunitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  type: z.enum(["SEASONAL", "CULTURAL", "COMPETITIVE", "INTERNAL"]).optional(),
  impact: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  channels: z.array(z.string()).optional(),
  linkedAxes: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
export type UpdateOpportunityInput = z.infer<typeof UpdateOpportunitySchema>;

// ---------------------------------------------------------------------------
// Budget Tier schemas
// ---------------------------------------------------------------------------

export const UpsertBudgetTierSchema = z.object({
  strategyId: z.string().min(1),
  tier: z.enum(["MICRO", "STARTER", "IMPACT", "CAMPAIGN", "DOMINATION"]),
  minBudget: z.number().int().min(0),
  maxBudget: z.number().int().min(0),
  channels: z.array(z.object({
    channel: z.string(),
    allocation: z.number(),
  })),
  kpis: z.array(z.object({
    kpi: z.string(),
    target: z.string(),
  })),
  description: z.string().optional(),
});
export type UpsertBudgetTierInput = z.infer<typeof UpsertBudgetTierSchema>;

// ---------------------------------------------------------------------------
// Strategy Tree schemas
// ---------------------------------------------------------------------------

export const CreateChildStrategySchema = z.object({
  parentId: z.string().min(1),
  name: z.string().min(1),
  brandName: z.string().min(1),
  sector: z.string().optional(),
  description: z.string().optional(),
  nodeType: z.enum([
    "BRAND", "PRODUCT", "CAMPAIGN", "CHARACTER", "ENVIRONMENT",
    "EVENT", "SKU", "COLLECTION", "ZONE", "EDITION", "COMMUNITY",
  ]).default("BRAND"),
  deliveryMode: z.enum(["ONE_SHOT", "PLACEMENT", "RETAINER"]).optional(),
  vertical: z.enum(["FMCG", "TECH", "HEALTH_PUBLIC", "INSTITUTIONAL", "CULTURE", "LUXURY", "NGO"]).optional(),
  maturityProfile: z.enum(["MATURE", "GROWTH", "STARTUP", "LAUNCH"]).optional(),
  currency: z.string().optional(),
});
export type CreateChildStrategyInput = z.infer<typeof CreateChildStrategySchema>;

// ---------------------------------------------------------------------------
// Metric Threshold schemas
// ---------------------------------------------------------------------------

export const UpsertThresholdSchema = z.object({
  strategyId: z.string().min(1),
  pillar: z.string().min(1),
  metricKey: z.string().min(1),
  metricLabel: z.string().min(1),
  currentValue: z.number().default(0),
  targetValue: z.number().default(0),
  alertMin: z.number().optional(),
  alertMax: z.number().optional(),
  unit: z.string().default("%"),
  cadence: z.string().default("MONTHLY"),
});
export type UpsertThresholdInput = z.infer<typeof UpsertThresholdSchema>;
