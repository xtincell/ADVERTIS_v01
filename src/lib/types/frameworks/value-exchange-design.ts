// =============================================================================
// FW-13 — Value Exchange Design Schema
// =============================================================================
// Designs the transaction as ritual: tier-segment mapping, transaction
// rituals, belonging signals, exclusivity gradients, and monetization.
// =============================================================================

import { z } from "zod";
import { flexStringArray } from "../pillars/shared";
import { SuperfanStageSchema } from "./framework-descriptor";

// ---------------------------------------------------------------------------
// Tier-Segment Map — how segments map to offer tiers
// ---------------------------------------------------------------------------

export const TierSegmentSchema = z.object({
  stage: SuperfanStageSchema,
  tier: z.string().describe("Nom du tier d'offre"),
  priceRange: z.string().describe("Fourchette de prix"),
  accessLevel: z.enum(["PUBLIC", "MEMBER", "VIP", "INNER_CIRCLE", "SACRED"]),
  keyBenefits: flexStringArray,
  conversionTrigger: z.string().describe("Déclencheur de conversion vers ce tier"),
  retentionMechanic: z.string().describe("Mécanique de rétention"),
});

export type TierSegment = z.infer<typeof TierSegmentSchema>;

// ---------------------------------------------------------------------------
// Transaction Rituals — making purchase a ceremony
// ---------------------------------------------------------------------------

export const TransactionRitualSchema = z.object({
  id: z.string(),
  name: z.string(),
  stage: SuperfanStageSchema,
  type: z.enum([
    "INITIATION",
    "UPGRADE",
    "RENEWAL",
    "GIFTING",
    "CELEBRATION",
    "REDEMPTION",
  ]),
  description: z.string(),
  emotionalPayoff: z.string().describe("Récompense émotionnelle"),
  touchpoints: flexStringArray,
  unboxingExperience: z.string().optional().describe("Expérience de déballage"),
});

export type TransactionRitual = z.infer<typeof TransactionRitualSchema>;

// ---------------------------------------------------------------------------
// Belonging Signals — markers of tribal membership
// ---------------------------------------------------------------------------

export const BelongingSignalSchema = z.object({
  id: z.string(),
  name: z.string(),
  stage: SuperfanStageSchema,
  type: z.enum([
    "BADGE",
    "VOCABULARY",
    "GESTURE",
    "ARTIFACT",
    "RITUAL",
    "ACCESS",
  ]),
  description: z.string(),
  visibilityLevel: z.enum(["PUBLIC", "TRIBAL", "SECRET"]),
  acquisitionMethod: z.string(),
});

export type BelongingSignal = z.infer<typeof BelongingSignalSchema>;

// ---------------------------------------------------------------------------
// Exclusivity Gradient — progressive access restriction
// ---------------------------------------------------------------------------

export const ExclusivityGradientSchema = z.object({
  stage: SuperfanStageSchema,
  exclusivityLevel: z.number().min(0).max(100),
  accessGates: flexStringArray.describe("Portes d'accès à franchir"),
  limitedEditions: z.boolean().describe("Éditions limitées à ce stade"),
  communitySize: z.string().describe("Taille cible de la communauté à ce stade"),
  scarcityMechanics: z.string().describe("Mécaniques de rareté"),
});

export type ExclusivityGradient = z.infer<typeof ExclusivityGradientSchema>;

// ---------------------------------------------------------------------------
// Monetization Map
// ---------------------------------------------------------------------------

export const MonetizationStreamSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    "PRODUCT",
    "SERVICE",
    "SUBSCRIPTION",
    "EXPERIENCE",
    "CONTENT",
    "COMMUNITY",
    "LICENSING",
    "PARTNERSHIP",
  ]),
  targetStages: z.array(SuperfanStageSchema),
  revenueModel: z.string(),
  estimatedContribution: z.number().min(0).max(100).optional(),
  scalability: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export type MonetizationStream = z.infer<typeof MonetizationStreamSchema>;

// ---------------------------------------------------------------------------
// Value Exchange Design — Combined Output
// ---------------------------------------------------------------------------

export const ValueExchangeDesignOutputSchema = z.object({
  tierSegmentMap: z.array(TierSegmentSchema).min(1),
  transactionRituals: z.array(TransactionRitualSchema),
  belongingSignals: z.array(BelongingSignalSchema),
  exclusivityGradient: z.array(ExclusivityGradientSchema).min(1).max(6),
  monetizationMap: z.array(MonetizationStreamSchema),
});

export type ValueExchangeDesignOutput = z.infer<
  typeof ValueExchangeDesignOutputSchema
>;
