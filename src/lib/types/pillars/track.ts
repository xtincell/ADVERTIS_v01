// =============================================================================
// Pilier T — Track Audit
// =============================================================================

import { z } from "zod";
import { flexStringArray } from "./shared";

export const TrackAuditResultSchema = z
  .object({
    triangulation: z
      .object({
        internalData: z.string().default(""),
        marketData: z.string().default(""),
        customerData: z.string().default(""),
        synthesis: z.string().default(""),
      })
      .default({}),
    hypothesisValidation: z
      .array(
        z.object({
          variableId: z.string().default(""),
          hypothesis: z.string().default(""),
          status: z
            .enum(["validated", "invalidated", "to_test"])
            .catch("to_test"),
          evidence: z.string().default(""),
        }),
      )
      .default([]),
    marketReality: z
      .object({
        macroTrends: flexStringArray,
        weakSignals: flexStringArray,
        emergingPatterns: flexStringArray,
      })
      .default({}),
    tamSamSom: z
      .object({
        tam: z
          .object({
            value: z.string().default(""),
            description: z.string().default(""),
          })
          .default({}),
        sam: z
          .object({
            value: z.string().default(""),
            description: z.string().default(""),
          })
          .default({}),
        som: z
          .object({
            value: z.string().default(""),
            description: z.string().default(""),
          })
          .default({}),
        methodology: z.string().default(""),
      })
      .default({}),
    competitiveBenchmark: z
      .array(
        z.object({
          competitor: z.string().default(""),
          strengths: flexStringArray,
          weaknesses: flexStringArray,
          marketShare: z.string().default(""),
        }),
      )
      .default([]),
    brandMarketFitScore: z.coerce.number().min(0).max(100).catch(50),
    brandMarketFitJustification: z.string().default(""),
    strategicRecommendations: flexStringArray,
    summary: z.string().default(""),
  })
  .strip();

export type TrackAuditResult = z.infer<typeof TrackAuditResultSchema>;
