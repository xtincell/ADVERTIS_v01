// =============================================================================
// FW-11 — Experience Architecture Schema
// =============================================================================
// Defines the 5-stage transition map from AUDIENCE → EVANGELIST.
// Each stage has trigger conditions, key experiences, emotional arcs,
// friction maps, and proof-of-transition criteria.
// =============================================================================

import { z } from "zod";
import { flexStringArray } from "../pillars/shared";
import { SuperfanStageSchema } from "./framework-descriptor";

// ---------------------------------------------------------------------------
// Transition Map — one per stage transition
// ---------------------------------------------------------------------------

export const TransitionSchema = z.object({
  /** From stage (e.g., "AUDIENCE") */
  fromStage: SuperfanStageSchema,
  /** To stage (e.g., "FOLLOWER") */
  toStage: SuperfanStageSchema,
  /** What triggers the transition */
  triggerCondition: z.string().describe("Condition déclenchant la transition"),
  /** Key experience that enables it */
  keyExperience: z.string().describe("Expérience clé facilitant la transition"),
  /** Emotional shift expected */
  emotionalShift: z.string().describe("Changement émotionnel attendu"),
  /** How to prove transition happened */
  proofOfTransition: z.string().describe("Preuve observable de la transition"),
  /** Touchpoints involved */
  touchpoints: flexStringArray.describe("Touchpoints impliqués"),
  /** Estimated conversion rate */
  estimatedConversionRate: z.number().min(0).max(1).optional(),
});

export type Transition = z.infer<typeof TransitionSchema>;

// ---------------------------------------------------------------------------
// Emotional Arc
// ---------------------------------------------------------------------------

export const EmotionalArcPointSchema = z.object({
  stage: SuperfanStageSchema,
  primaryEmotion: z.string(),
  intensity: z.number().min(1).max(10),
  brandRole: z.string().describe("Rôle de la marque à ce stade émotionnel"),
});

export const EmotionalArcSchema = z.object({
  points: z.array(EmotionalArcPointSchema),
  overallNarrative: z.string().describe("Arc narratif émotionnel global"),
});

export type EmotionalArc = z.infer<typeof EmotionalArcSchema>;

// ---------------------------------------------------------------------------
// Moments of Truth
// ---------------------------------------------------------------------------

export const MomentOfTruthSchema = z.object({
  id: z.string(),
  name: z.string(),
  stage: SuperfanStageSchema,
  type: z.enum(["DISCOVERY", "FIRST_USE", "COMMITMENT", "ADVOCACY", "CRISIS"]),
  description: z.string(),
  successCriteria: z.string(),
  failureConsequence: z.string(),
  touchpoint: z.string(),
});

export type MomentOfTruth = z.infer<typeof MomentOfTruthSchema>;

// ---------------------------------------------------------------------------
// Friction Map
// ---------------------------------------------------------------------------

export const FrictionPointSchema = z.object({
  id: z.string(),
  stage: SuperfanStageSchema,
  description: z.string(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  mitigation: z.string().describe("Stratégie de réduction de friction"),
  touchpoint: z.string(),
});

export type FrictionPoint = z.infer<typeof FrictionPointSchema>;

// ---------------------------------------------------------------------------
// Experience Architecture — Combined Output
// ---------------------------------------------------------------------------

export const ExperienceArchitectureOutputSchema = z.object({
  transitionMap: z.array(TransitionSchema).min(1).max(6),
  emotionalArc: EmotionalArcSchema,
  momentsDeTruth: z.array(MomentOfTruthSchema),
  frictionMap: z.array(FrictionPointSchema),
  brandCoherenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Score de cohérence de l'expérience de marque"),
});

export type ExperienceArchitectureOutput = z.infer<
  typeof ExperienceArchitectureOutputSchema
>;
