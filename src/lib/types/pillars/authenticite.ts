// =============================================================================
// Pilier A — Authenticité
// =============================================================================

import { z } from "zod";
import { flexStringArray, num } from "./shared";

export const AuthenticitePillarSchema = z
  .object({
    identite: z
      .object({
        archetype: z.string().default(""),
        citationFondatrice: z.string().default(""),
        noyauIdentitaire: z.string().default(""),
      })
      .default({}),
    herosJourney: z
      .object({
        acte1Origines: z.string().default(""),
        acte2Appel: z.string().default(""),
        acte3Epreuves: z.string().default(""),
        acte4Transformation: z.string().default(""),
        acte5Revelation: z.string().default(""),
      })
      .default({}),
    ikigai: z
      .object({
        aimer: z.string().default(""),
        competence: z.string().default(""),
        besoinMonde: z.string().default(""),
        remuneration: z.string().default(""),
      })
      .default({}),
    valeurs: z
      .array(
        z.object({
          valeur: z.string().default(""),
          rang: num,
          justification: z.string().default(""),
        }),
      )
      .default([]),
    hierarchieCommunautaire: z
      .array(
        z.object({
          niveau: num,
          nom: z.string().default(""),
          description: z.string().default(""),
          privileges: z.string().default(""),
        }),
      )
      .default([]),
    timelineNarrative: z
      .object({
        origines: z.string().default(""),
        croissance: z.string().default(""),
        pivot: z.string().default(""),
        futur: z.string().default(""),
      })
      .default({}),

    // ── ARTEMIS — Variables from FW-20 Movement Architecture ──────────
    /** Prophecy: the world transformed when the movement wins (FW-20) */
    prophecy: z
      .object({
        worldTransformed: z.string().default(""),
        pioneers: z.string().default(""),
        urgency: z.string().default(""),
        horizon: z.string().default(""),
      })
      .default({}),
    /** Existential enemy: the FORCE to defeat (FW-20) */
    enemy: z
      .object({
        force: z.string().default(""),
        manifestations: flexStringArray,
        whyItMatters: z.string().default(""),
        howWeWin: z.string().default(""),
        moralDimension: z.string().default(""),
      })
      .default({}),
    /** Doctrine: dogmas, principles, practices (FW-20) */
    doctrine: z
      .object({
        dogmas: z
          .array(
            z.object({
              belief: z.string().default(""),
              whyCounterIntuitive: z.string().default(""),
              implication: z.string().default(""),
            }),
          )
          .default([]),
        principles: z
          .array(
            z.object({
              principle: z.string().default(""),
              application: z.string().default(""),
            }),
          )
          .default([]),
        practices: z
          .array(
            z.object({
              practice: z.string().default(""),
              frequency: z.string().default(""),
            }),
          )
          .default([]),
      })
      .default({}),
    /** Living mythology: extensible canon (FW-20, extends herosJourney) */
    livingMythology: z
      .object({
        canon: z
          .object({
            foundingMyth: z.string().default(""),
            chapters: z
              .array(
                z.object({
                  title: z.string().default(""),
                  narrative: z.string().default(""),
                  date: z.string().default(""),
                  significance: z.string().default(""),
                }),
              )
              .default([]),
          })
          .default({}),
        extensionRules: z
          .object({
            whoCanContribute: flexStringArray,
            validationProcess: z.string().default(""),
            formatConstraints: z.string().default(""),
          })
          .default({}),
        captureSystem: z
          .object({
            sources: flexStringArray,
            integration: z.string().default(""),
          })
          .default({}),
      })
      .default({}),
  })
  .strip();

export type AuthenticitePillarData = z.infer<typeof AuthenticitePillarSchema>;
