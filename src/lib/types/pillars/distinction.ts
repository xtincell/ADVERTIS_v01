// =============================================================================
// Pilier D — Distinction
// =============================================================================

import { z } from "zod";
import { flexStringArray, num } from "./shared";

export const DistinctionPillarSchema = z
  .object({
    personas: z
      .array(
        z.object({
          nom: z.string().default(""),
          demographie: z.string().default(""),
          psychographie: z.string().default(""),
          motivations: z.string().default(""),
          freins: z.string().default(""),
          priorite: num,
        }),
      )
      .default([]),
    paysageConcurrentiel: z
      .object({
        concurrents: z
          .array(
            z.object({
              nom: z.string().default(""),
              forces: z.string().default(""),
              faiblesses: z.string().default(""),
              partDeMarche: z.string().default(""),
            }),
          )
          .default([]),
        avantagesCompetitifs: flexStringArray,
      })
      .default({}),
    promessesDeMarque: z
      .object({
        promesseMaitre: z.string().default(""),
        sousPromesses: flexStringArray,
      })
      .default({}),
    positionnement: z.string().default(""),
    tonDeVoix: z
      .object({
        personnalite: z.string().default(""),
        onDit: flexStringArray,
        onNeditPas: flexStringArray,
      })
      .default({}),
    identiteVisuelle: z
      .object({
        directionArtistique: z.string().default(""),
        paletteCouleurs: flexStringArray,
        mood: z.string().default(""),
      })
      .default({}),
    assetsLinguistiques: z
      .object({
        mantras: flexStringArray,
        vocabulaireProprietaire: flexStringArray,
      })
      .default({}),

    // ── ARTEMIS — Variables from FW-20 + ADVE ─────────────────────────
    /** Sacred objects: symbolic artifacts distinct from catalogue SKUs (FW-20) */
    sacredObjects: z
      .array(
        z.object({
          name: z.string().default(""),
          form: z.string().default(""),
          narrative: z.string().default(""),
          stage: z.string().default(""),
          socialSignal: z.string().default(""),
        }),
      )
      .default([]),
    /** Proof points: quantified achievements, certifications, testimonials (ADVE) */
    proofPoints: z
      .array(
        z.object({
          type: z.string().default(""),
          claim: z.string().default(""),
          evidence: z.string().default(""),
          source: z.string().default(""),
        }),
      )
      .default([]),
    /** Core brand symbols with meanings and usage contexts (ADVE) */
    symboles: z
      .array(
        z.object({
          name: z.string().default(""),
          signification: z.string().default(""),
          contextesUsage: flexStringArray,
          source: z.string().default(""),
        }),
      )
      .default([]),
  })
  .strip();

export type DistinctionPillarData = z.infer<typeof DistinctionPillarSchema>;
