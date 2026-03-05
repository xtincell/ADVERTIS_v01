// =============================================================================
// FW-24 — Alliance Architecture Schema
// =============================================================================
// Defines partner taxonomy, partner packages by integration level,
// negotiation protocol, narrative integration strategy, and mutual value matrix.
// Integration levels: SPONSOR → GUILD → GUARDIAN_DEITY → ALLIANCE
// =============================================================================

import { z } from "zod";
import { flexStringArray } from "../pillars/shared";

// ---------------------------------------------------------------------------
// Partner Integration Levels
// ---------------------------------------------------------------------------

export const PartnerIntegrationLevelSchema = z.enum([
  "SPONSOR",
  "GUILD",
  "GUARDIAN_DEITY",
  "ALLIANCE",
]);

export type PartnerIntegrationLevel = z.infer<typeof PartnerIntegrationLevelSchema>;

// ---------------------------------------------------------------------------
// Partner Taxonomy
// ---------------------------------------------------------------------------

export const PartnerCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["MEDIA", "TECH", "DISTRIBUTION", "CONTENT", "COMMUNITY", "FINANCIAL", "INSTITUTIONAL", "CREATIVE"]),
  description: z.string(),
  /** Strategic fit score 0-100 */
  strategicFit: z.number().min(0).max(100),
  /** Potential partners identified */
  potentialPartners: flexStringArray,
  /** Ideal integration level */
  idealLevel: PartnerIntegrationLevelSchema,
});

export type PartnerCategory = z.infer<typeof PartnerCategorySchema>;

// ---------------------------------------------------------------------------
// Partner Packages
// ---------------------------------------------------------------------------

export const PartnerPackageSchema = z.object({
  id: z.string(),
  level: PartnerIntegrationLevelSchema,
  name: z.string(),
  description: z.string(),
  /** What the brand offers the partner */
  brandOffers: flexStringArray,
  /** What the brand receives from the partner */
  brandReceives: flexStringArray,
  /** Investment range */
  investmentRange: z.string(),
  /** Duration of partnership */
  duration: z.string(),
  /** KPIs for measuring partnership success */
  successKpis: flexStringArray,
  /** Exclusivity clause */
  exclusivity: z.boolean(),
});

export type PartnerPackage = z.infer<typeof PartnerPackageSchema>;

// ---------------------------------------------------------------------------
// Negotiation Protocol
// ---------------------------------------------------------------------------

export const NegotiationProtocolSchema = z.object({
  /** Stages of the negotiation process */
  stages: z.array(
    z.object({
      order: z.number(),
      name: z.string(),
      description: z.string(),
      deliverables: flexStringArray,
      duration: z.string(),
    }),
  ),
  /** Red lines — non-negotiable boundaries */
  redLines: flexStringArray,
  /** Value proposition template for partner pitches */
  valuePropTemplate: z.string(),
  /** Decision criteria for partner selection */
  selectionCriteria: flexStringArray,
});

export type NegotiationProtocol = z.infer<typeof NegotiationProtocolSchema>;

// ---------------------------------------------------------------------------
// Narrative Integration
// ---------------------------------------------------------------------------

export const NarrativeIntegrationSchema = z.object({
  id: z.string(),
  partnerType: z.string(),
  integrationLevel: PartnerIntegrationLevelSchema,
  /** How the partner fits into the brand narrative */
  narrativeRole: z.string(),
  /** Shared vocabulary / co-created messaging */
  sharedVocabulary: flexStringArray,
  /** Co-branding guidelines */
  coBrandingRules: flexStringArray,
  /** Story opportunities with this partner type */
  storyOpportunities: flexStringArray,
});

export type NarrativeIntegration = z.infer<typeof NarrativeIntegrationSchema>;

// ---------------------------------------------------------------------------
// Mutual Value Matrix
// ---------------------------------------------------------------------------

export const MutualValueEntrySchema = z.object({
  partnerCategory: z.string(),
  integrationLevel: PartnerIntegrationLevelSchema,
  /** Value the brand delivers to the partner */
  brandToPartner: z.object({
    tangible: flexStringArray,
    intangible: flexStringArray,
    estimatedValue: z.string(),
  }),
  /** Value the partner delivers to the brand */
  partnerToBrand: z.object({
    tangible: flexStringArray,
    intangible: flexStringArray,
    estimatedValue: z.string(),
  }),
  /** Overall mutual benefit score 0-100 */
  mutualBenefitScore: z.number().min(0).max(100),
});

export type MutualValueEntry = z.infer<typeof MutualValueEntrySchema>;

// ---------------------------------------------------------------------------
// Alliance Architecture — Combined Output
// ---------------------------------------------------------------------------

export const AllianceArchitectureOutputSchema = z.object({
  partnerTaxonomy: z.array(PartnerCategorySchema),
  partnerPackages: z.array(PartnerPackageSchema),
  negotiationProtocol: NegotiationProtocolSchema,
  narrativeIntegration: z.array(NarrativeIntegrationSchema),
  mutualValueMatrix: z.array(MutualValueEntrySchema),
});

export type AllianceArchitectureOutput = z.infer<typeof AllianceArchitectureOutputSchema>;
