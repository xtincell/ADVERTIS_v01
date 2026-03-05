// =============================================================================
// FW-16 — Brand Architecture Schema
// =============================================================================
// Defines architecture model, inheritance rules, and cross-brand cult index.
// Architecture types: BRANDED_HOUSE | HOUSE_OF_BRANDS | ENDORSED | HYBRID_ARCH
// Variables: BA.architectureModel, BA.inheritanceRules, BA.crossBrandCultIndex
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Architecture Types
// ---------------------------------------------------------------------------

export const ArchitectureTypeSchema = z.enum([
  "BRANDED_HOUSE",
  "HOUSE_OF_BRANDS",
  "ENDORSED",
  "HYBRID_ARCH",
]);

export type ArchitectureType = z.infer<typeof ArchitectureTypeSchema>;

// ---------------------------------------------------------------------------
// Architecture Model
// ---------------------------------------------------------------------------

export const ArchitectureModelSchema = z.object({
  /** Selected architecture type */
  type: ArchitectureTypeSchema,
  /** Human-readable description of the chosen architecture */
  description: z.string(),
  /** Strategic implications of adopting this architecture */
  implications: z.array(z.string()),
  /** Key advantages of this architecture type */
  advantages: z.array(z.string()),
  /** Known risks and potential pitfalls */
  risks: z.array(z.string()),
});

export type ArchitectureModel = z.infer<typeof ArchitectureModelSchema>;

// ---------------------------------------------------------------------------
// Inheritance Rules
// ---------------------------------------------------------------------------

export const InheritanceRuleSchema = z.object({
  /** Unique rule identifier */
  id: z.string(),
  /** Variable from the parent brand */
  parentVariable: z.string(),
  /** Corresponding variable in the child brand */
  childVariable: z.string(),
  /** How the child inherits from the parent */
  inheritanceType: z.enum(["FULL", "PARTIAL", "OVERRIDE", "NONE"]),
  /** Human-readable description of the rule */
  description: z.string(),
  /** Conditions under which the rule applies */
  conditions: z.string(),
});

export type InheritanceRule = z.infer<typeof InheritanceRuleSchema>;

// ---------------------------------------------------------------------------
// Cross-Brand Metric (per brand)
// ---------------------------------------------------------------------------

export const CrossBrandMetricSchema = z.object({
  /** Unique brand identifier */
  brandId: z.string(),
  /** Display name of the brand */
  brandName: z.string(),
  /** Cult index score for this brand (0-100) */
  cultIndexScore: z.number().min(0).max(100),
  /** Coherence with the parent brand (0-100) */
  coherenceWithParent: z.number().min(0).max(100),
  /** Current lifecycle stage of the brand */
  stage: z.string(),
});

export type CrossBrandMetric = z.infer<typeof CrossBrandMetricSchema>;

// ---------------------------------------------------------------------------
// Cross-Brand Cult Index
// ---------------------------------------------------------------------------

export const CrossBrandCultIndexSchema = z.object({
  /** Aggregate score across all brands (0-100) */
  overallScore: z.number().min(0).max(100),
  /** Per-brand metrics */
  brands: z.array(CrossBrandMetricSchema),
  /** Cross-brand synergies identified */
  synergiesIdentified: z.array(z.string()),
  /** Cross-brand conflicts detected */
  conflictsDetected: z.array(z.string()),
});

export type CrossBrandCultIndex = z.infer<typeof CrossBrandCultIndexSchema>;

// ---------------------------------------------------------------------------
// Brand Architecture — Combined Output
// ---------------------------------------------------------------------------

export const BrandArchitectureOutputSchema = z.object({
  architectureModel: ArchitectureModelSchema,
  inheritanceRules: z.array(InheritanceRuleSchema),
  crossBrandCultIndex: CrossBrandCultIndexSchema,
});

export type BrandArchitectureOutput = z.infer<typeof BrandArchitectureOutputSchema>;
