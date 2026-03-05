// =============================================================================
// Pilier S — Synthèse Stratégique
// =============================================================================

import { z } from "zod";
import { flexStringArray, num } from "./shared";

export const SynthesePillarSchema = z
  .object({
    syntheseExecutive: z.string().default(""),
    visionStrategique: z.string().default(""),
    coherencePiliers: z
      .array(
        z.object({
          pilier: z.string().default(""),
          contribution: z.string().default(""),
          articulation: z.string().default(""),
        }),
      )
      .default([]),
    facteursClesSucces: flexStringArray,
    recommandationsPrioritaires: z
      .array(
        z.object({
          action: z.string().default(""),
          priorite: num,
          impact: z.string().default(""),
          delai: z.string().default(""),
        }),
      )
      .default([]),
    scoreCoherence: z.coerce.number().min(0).max(100).catch(0),

    // --- Enriched fields ---

    axesStrategiques: z
      .array(
        z.object({
          axe: z.string().default(""),
          description: z.string().default(""),
          piliersLies: flexStringArray,
          kpisCles: flexStringArray,
        }),
      )
      .default([]),
    sprint90Recap: z
      .object({
        actions: z
          .array(
            z.object({
              action: z.string().default(""),
              owner: z.string().default(""),
              kpi: z.string().default(""),
              status: z.string().default("à faire"),
            }),
          )
          .default([]),
        summary: z.string().default(""),
      })
      .default({}),
    campaignsSummary: z
      .object({
        totalCampaigns: z.coerce.number().default(0),
        highlights: flexStringArray,
        budgetTotal: z.string().default(""),
      })
      .default({}),
    activationSummary: z.string().default(""),
    kpiDashboard: z
      .array(
        z.object({
          pilier: z.string().default(""),
          kpi: z.string().default(""),
          cible: z.string().default(""),
          statut: z.string().default(""),
        }),
      )
      .default([]),
  })
  .strip();

export type SynthesePillarData = z.infer<typeof SynthesePillarSchema>;
