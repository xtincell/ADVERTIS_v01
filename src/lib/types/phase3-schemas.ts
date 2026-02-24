// =============================================================================
// LIB L.13 — Phase 3 Schemas
// =============================================================================
// Zod validation schemas for Phase 3 (Upgraders Ops / Implementation) data.
// Covers: mission workflow (create, update, transition, assignments,
// deliverables, debrief), intervention requests, market pricing, AI usage logs.
// Exports: CreateMission, UpdateMission, TransitionMission, CreateAssignment,
//   UpdateAssignment, CreateDeliverable, ReviewDeliverable, CreateDebrief,
//   CreateIntervention, ResolveIntervention, UpsertMarketPricing, LogAIUsage
//   — schemas and inferred *Input types.
// Used by: phase3 tRPC router, mission board UI, ops dashboard.
// =============================================================================

import { z } from "zod";
import {
  MISSION_STATUSES,
  ASSIGNMENT_ROLES,
  INTERVENTION_TYPES,
  MARKETS,
  PRICING_CATEGORIES,
} from "~/lib/constants";

// ============================================
// MISSION SCHEMAS
// ============================================

export const CreateMissionSchema = z.object({
  strategyId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(["P0", "P1", "P2"]).default("P1"),
  briefTypes: z.array(z.string()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const UpdateMissionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  priority: z.enum(["P0", "P1", "P2"]).optional(),
  estimatedCharge: z.number().optional(),
  actualCharge: z.number().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const TransitionMissionSchema = z.object({
  id: z.string().min(1),
  newStatus: z.enum(MISSION_STATUSES),
});

// ============================================
// ASSIGNMENT SCHEMAS
// ============================================

export const CreateAssignmentSchema = z.object({
  missionId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(ASSIGNMENT_ROLES),
  briefType: z.string().optional(),
  dayRate: z.number().min(0).optional(),
  estimatedDays: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const UpdateAssignmentSchema = z.object({
  id: z.string().min(1),
  status: z.string().optional(),
  dayRate: z.number().min(0).optional(),
  estimatedDays: z.number().min(0).optional(),
  actualDays: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// ============================================
// DELIVERABLE SCHEMAS
// ============================================

export const CreateDeliverableSchema = z.object({
  missionId: z.string().min(1),
  assignmentId: z.string().optional(),
  gloryOutputId: z.string().optional(),
  title: z.string().min(1),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().int().optional(),
});

export const ReviewDeliverableSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNotes: z.string().optional(),
});

// ============================================
// DEBRIEF SCHEMAS
// ============================================

export const CreateDebriefSchema = z.object({
  missionId: z.string().min(1),
  summary: z.string().min(10),
  lessonsLearned: z.array(z.string()).optional(),
  clientFeedback: z.string().optional(),
  qualityScore: z.number().int().min(0).max(100).optional(),
  onTime: z.boolean().optional(),
  onBudget: z.boolean().optional(),
  signalsSuggested: z.any().optional(),
  pricingInsights: z.any().optional(),
});

// ============================================
// INTERVENTION SCHEMAS
// ============================================

export const CreateInterventionSchema = z.object({
  missionId: z.string().optional(),
  strategyId: z.string().optional(),
  type: z.enum(INTERVENTION_TYPES),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(["P0", "P1", "P2"]).default("P1"),
});

export const ResolveInterventionSchema = z.object({
  id: z.string().min(1),
  resolution: z.string().min(1),
  // Optional: create a signal in SIS when resolving
  createSignal: z.boolean().optional(),
  signalPillar: z.enum(["A", "D", "V", "E", "R", "T", "I", "S"]).optional(),
  signalTitle: z.string().min(1).optional(),
});

// ============================================
// MARKET PRICING SCHEMAS
// ============================================

export const UpsertMarketPricingSchema = z.object({
  market: z.enum(MARKETS),
  category: z.enum(PRICING_CATEGORIES),
  subcategory: z.string().min(1),
  label: z.string().min(1),
  minPrice: z.number().min(0),
  maxPrice: z.number().min(0),
  avgPrice: z.number().optional(),
  currency: z.string().default("XAF"),
  unit: z.string().min(1),
  source: z.string().optional(),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
});

// ============================================
// AI USAGE LOG SCHEMA (internal, for service use)
// ============================================

export const LogAIUsageSchema = z.object({
  missionId: z.string().optional(),
  strategyId: z.string().optional(),
  generationType: z.string().min(1),
  model: z.string().min(1),
  tokensIn: z.number().int().min(0),
  tokensOut: z.number().int().min(0),
  costUsd: z.number().min(0),
  costXaf: z.number().min(0),
  durationMs: z.number().int().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================
// INFERRED TYPES
// ============================================

export type CreateMissionInput = z.infer<typeof CreateMissionSchema>;
export type UpdateMissionInput = z.infer<typeof UpdateMissionSchema>;
export type TransitionMissionInput = z.infer<typeof TransitionMissionSchema>;
export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof UpdateAssignmentSchema>;
export type CreateDeliverableInput = z.infer<typeof CreateDeliverableSchema>;
export type ReviewDeliverableInput = z.infer<typeof ReviewDeliverableSchema>;
export type CreateDebriefInput = z.infer<typeof CreateDebriefSchema>;
export type CreateInterventionInput = z.infer<typeof CreateInterventionSchema>;
export type ResolveInterventionInput = z.infer<typeof ResolveInterventionSchema>;
export type UpsertMarketPricingInput = z.infer<typeof UpsertMarketPricingSchema>;
export type LogAIUsageInput = z.infer<typeof LogAIUsageSchema>;
