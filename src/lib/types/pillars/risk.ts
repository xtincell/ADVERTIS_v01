// =============================================================================
// Pilier R — Risk Audit
// =============================================================================

import { z } from "zod";
import { flexStringArray } from "./shared";

const RiskLevelEnum = z.enum(["low", "medium", "high"]).catch("medium");

export const MicroSwotSchema = z
  .object({
    variableId: z.string().default(""),
    variableLabel: z.string().default(""),
    strengths: flexStringArray,
    weaknesses: flexStringArray,
    opportunities: flexStringArray,
    threats: flexStringArray,
    riskLevel: RiskLevelEnum,
    commentary: z.string().default(""),
  })
  .strip();

export const RiskAuditResultSchema = z
  .object({
    microSwots: z.array(MicroSwotSchema).default([]),
    globalSwot: z
      .object({
        strengths: flexStringArray,
        weaknesses: flexStringArray,
        opportunities: flexStringArray,
        threats: flexStringArray,
      })
      .default({}),
    riskScore: z.coerce.number().min(0).max(100).catch(50),
    riskScoreJustification: z.string().default(""),
    probabilityImpactMatrix: z
      .array(
        z.object({
          risk: z.string().default(""),
          probability: RiskLevelEnum,
          impact: RiskLevelEnum,
          priority: z.coerce.number().min(1).max(5).catch(3),
        }),
      )
      .default([]),
    mitigationPriorities: z
      .array(
        z.object({
          risk: z.string().default(""),
          action: z.string().default(""),
          urgency: z
            .enum(["immediate", "short_term", "medium_term"])
            .catch("medium_term"),
          effort: RiskLevelEnum,
        }),
      )
      .default([]),
    summary: z.string().default(""),
  })
  .strip();

export type MicroSwot = z.infer<typeof MicroSwotSchema>;
export type RiskAuditResult = z.infer<typeof RiskAuditResultSchema>;
