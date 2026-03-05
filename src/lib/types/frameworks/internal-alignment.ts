// =============================================================================
// FW-18 — Internal Alignment System Schema
// =============================================================================
// Defines internalization mapping, internal rituals, clergy (brand champion)
// mapping, and brand-culture fit scorecard.
// Variables: IA.internalization, IA.internalRituals, IA.clergyMapping,
//            IA.brandCultureFit
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Internalization — How brand values translate into concrete internal actions
// ---------------------------------------------------------------------------

export const InternalizationItemSchema = z.object({
  value: z.string(),
  actionableForm: z.string(),
  department: z.string(),
  kpi: z.string(),
  adoptionRate: z.number().min(0).max(100),
});

export type InternalizationItem = z.infer<typeof InternalizationItemSchema>;

export const InternalizationSchema = z.array(InternalizationItemSchema);

export type Internalization = z.infer<typeof InternalizationSchema>;

// ---------------------------------------------------------------------------
// Internal Rituals — Rituals that reinforce brand culture
// ---------------------------------------------------------------------------

export const RitualFrequencySchema = z.enum([
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "ANNUAL",
]);

export type RitualFrequency = z.infer<typeof RitualFrequencySchema>;

export const RitualTypeSchema = z.enum([
  "ONBOARDING",
  "CELEBRATION",
  "ALIGNMENT",
  "RECOGNITION",
  "STORYTELLING",
]);

export type RitualType = z.infer<typeof RitualTypeSchema>;

export const InternalRitualSchema = z.object({
  id: z.string(),
  name: z.string(),
  frequency: RitualFrequencySchema,
  type: RitualTypeSchema,
  description: z.string(),
  participants: z.string(),
  emotionalTarget: z.string(),
});

export type InternalRitual = z.infer<typeof InternalRitualSchema>;

// ---------------------------------------------------------------------------
// Clergy Mapping — Internal brand champions
// ---------------------------------------------------------------------------

export const BrandAmbassadorLevelSchema = z.enum([
  "INITIATE",
  "GUARDIAN",
  "PRIEST",
  "HIGH_PRIEST",
]);

export type BrandAmbassadorLevel = z.infer<typeof BrandAmbassadorLevelSchema>;

export const ClergyMemberSchema = z.object({
  id: z.string(),
  role: z.string(),
  department: z.string(),
  missionBrief: z.string(),
  brandAmbassadorLevel: BrandAmbassadorLevelSchema,
  responsibilities: z.array(z.string()),
});

export type ClergyMember = z.infer<typeof ClergyMemberSchema>;

// ---------------------------------------------------------------------------
// Brand-Culture Fit — Scorecard assessing internal alignment health
// ---------------------------------------------------------------------------

export const BrandCultureDimensionsSchema = z.object({
  valueAlignment: z.number().min(0).max(100),
  behavioralConsistency: z.number().min(0).max(100),
  narrativeAdoption: z.number().min(0).max(100),
  ritualParticipation: z.number().min(0).max(100),
  symbolRecognition: z.number().min(0).max(100),
});

export type BrandCultureDimensions = z.infer<typeof BrandCultureDimensionsSchema>;

export const BrandCultureGapSchema = z.object({
  dimension: z.string(),
  current: z.number().min(0).max(100),
  target: z.number().min(0).max(100),
  actionPlan: z.string(),
});

export type BrandCultureGap = z.infer<typeof BrandCultureGapSchema>;

export const BrandCultureFitSchema = z.object({
  score: z.number().min(0).max(100),
  dimensions: BrandCultureDimensionsSchema,
  gaps: z.array(BrandCultureGapSchema),
  overallAssessment: z.string(),
});

export type BrandCultureFit = z.infer<typeof BrandCultureFitSchema>;

// ---------------------------------------------------------------------------
// Internal Alignment — Combined Output
// ---------------------------------------------------------------------------

export const InternalAlignmentOutputSchema = z.object({
  internalization: InternalizationSchema,
  internalRituals: z.array(InternalRitualSchema),
  clergyMapping: z.array(ClergyMemberSchema),
  brandCultureFit: BrandCultureFitSchema,
});

export type InternalAlignmentOutput = z.infer<typeof InternalAlignmentOutputSchema>;
