// =============================================================================
// FW-15 — Cultural Expansion Protocol Schema
// =============================================================================
// Defines cultural transposition matrix, local legitimacy assessments,
// and federalism governance model for cross-market brand expansion.
// Variables: CE.culturalTransposition, CE.localLegitimacy, CE.federalism
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Transposition Categories
// ---------------------------------------------------------------------------

export const TranspositionCategorySchema = z.enum([
  "UNIVERSAL",
  "ADAPTABLE",
  "LOCAL",
]);

export type TranspositionCategory = z.infer<typeof TranspositionCategorySchema>;

// ---------------------------------------------------------------------------
// Cultural Element — A single brand element classified for transposition
// ---------------------------------------------------------------------------

export const CulturalElementSchema = z.object({
  id: z.string(),
  element: z.string(),
  category: TranspositionCategorySchema,
  description: z.string(),
  adaptationNotes: z.string(),
});

export type CulturalElement = z.infer<typeof CulturalElementSchema>;

// ---------------------------------------------------------------------------
// Cultural Transposition — Matrix of brand elements by category
// ---------------------------------------------------------------------------

export const CulturalTranspositionSchema = z.object({
  universals: z.array(CulturalElementSchema),
  adaptables: z.array(CulturalElementSchema),
  locals: z.array(CulturalElementSchema),
  /** Ratio of universal elements — higher means more portable brand */
  transpositionScore: z.number(),
});

export type CulturalTransposition = z.infer<typeof CulturalTranspositionSchema>;

// ---------------------------------------------------------------------------
// Local Legitimacy — Per-market cultural fit assessment
// ---------------------------------------------------------------------------

export const LocalLegitimacySchema = z.object({
  id: z.string(),
  market: z.string(),
  /** Cultural fit score 0-100 */
  culturalFit: z.number(),
  barriers: z.array(z.string()),
  enablers: z.array(z.string()),
  adaptationStrategy: z.string(),
  localPartnerRequired: z.boolean(),
  estimatedTimeToLegitimacy: z.string(),
});

export type LocalLegitimacy = z.infer<typeof LocalLegitimacySchema>;

// ---------------------------------------------------------------------------
// Federalism Model — Governance model for multi-market operations
// ---------------------------------------------------------------------------

export const FederalismModelSchema = z.enum([
  "CENTRALIZED",
  "FEDERATED",
  "CONFEDERATED",
  "HYBRID_FEDERAL",
]);

export type FederalismModel = z.infer<typeof FederalismModelSchema>;

export const FederalismSchema = z.object({
  model: FederalismModelSchema,
  description: z.string(),
  governanceRules: z.array(z.string()),
  /** Autonomy level granted to local markets 0-100 */
  autonomyLevel: z.number().min(0).max(100),
  coordinationMechanisms: z.array(z.string()),
});

export type Federalism = z.infer<typeof FederalismSchema>;

// ---------------------------------------------------------------------------
// Cultural Expansion — Combined Output
// ---------------------------------------------------------------------------

export const CulturalExpansionOutputSchema = z.object({
  culturalTransposition: CulturalTranspositionSchema,
  localLegitimacy: z.array(LocalLegitimacySchema),
  federalism: FederalismSchema,
});

export type CulturalExpansionOutput = z.infer<typeof CulturalExpansionOutputSchema>;
