// =============================================================================
// FW-17 — Brand Defense Protocol Schema
// =============================================================================
// Defines threat mapping, community defense mobilization, crisis narrative
// playbook, and enemy-as-fuel conversion mechanics.
// Variables: BD.threatMap, BD.communityDefense, BD.crisisNarrative,
//            BD.enemyAsFuel
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Threat Type & Severity Enums
// ---------------------------------------------------------------------------

export const ThreatTypeSchema = z.enum([
  "COMPETITIVE",
  "REPUTATIONAL",
  "MARKET",
  "INTERNAL",
  "REGULATORY",
]);

export type ThreatType = z.infer<typeof ThreatTypeSchema>;

export const ThreatSeveritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export type ThreatSeverity = z.infer<typeof ThreatSeveritySchema>;

// ---------------------------------------------------------------------------
// Threat — Individual threat entry in the threat map
// ---------------------------------------------------------------------------

export const ThreatSchema = z.object({
  id: z.string(),
  type: ThreatTypeSchema,
  name: z.string(),
  description: z.string(),
  severity: ThreatSeveritySchema,
  /** Probability of occurrence (0 = impossible, 1 = certain) */
  probability: z.number().min(0).max(1),
  impact: z.string(),
  mitigation: z.string(),
  detectionSignals: z.array(z.string()),
});

export type Threat = z.infer<typeof ThreatSchema>;

// ---------------------------------------------------------------------------
// Community Defense — Mobilization metrics and protocol
// ---------------------------------------------------------------------------

export const CommunityDefenseSchema = z.object({
  agentsBySegment: z.array(
    z.object({
      segment: z.string(),
      count: z.number(),
      activationRate: z.number(),
    }),
  ),
  /** Overall brand defense rate (0-100) derived from cult index */
  brandDefenseRate: z.number(),
  mobilizationProtocol: z.array(z.string()),
  responseTimeTarget: z.string(),
});

export type CommunityDefense = z.infer<typeof CommunityDefenseSchema>;

// ---------------------------------------------------------------------------
// Crisis Narrative — Pre-built response playbook per scenario
// ---------------------------------------------------------------------------

export const CrisisNarrativeSchema = z.object({
  id: z.string(),
  scenarioName: z.string(),
  triggerEvent: z.string(),
  narrativeResponse: z.string(),
  keyMessages: z.array(z.string()),
  spokesperson: z.string(),
  channels: z.array(z.string()),
  timeline: z.string(),
});

export type CrisisNarrative = z.infer<typeof CrisisNarrativeSchema>;

// ---------------------------------------------------------------------------
// Enemy As Fuel — Converting competitive/existential threats into energy
// ---------------------------------------------------------------------------

export const EnemyAsFuelSchema = z.object({
  existentialEnemy: z.string(),
  fuelMechanism: z.string(),
  communityRallyPoints: z.array(z.string()),
  contentOpportunities: z.array(z.string()),
  competitiveAdvantage: z.string(),
});

export type EnemyAsFuel = z.infer<typeof EnemyAsFuelSchema>;

// ---------------------------------------------------------------------------
// Brand Defense — Combined Output
// ---------------------------------------------------------------------------

export const BrandDefenseOutputSchema = z.object({
  threatMap: z.array(ThreatSchema),
  communityDefense: CommunityDefenseSchema,
  crisisNarrative: z.array(CrisisNarrativeSchema),
  enemyAsFuel: EnemyAsFuelSchema,
});

export type BrandDefenseOutput = z.infer<typeof BrandDefenseOutputSchema>;
