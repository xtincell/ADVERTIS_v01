// =============================================================================
// Pilier E — Engagement
// =============================================================================

import { z } from "zod";
import { flexStringArray, num } from "./shared";

const TouchpointTypeEnum = z
  .enum(["physique", "digital", "humain"])
  .catch("digital");

const RituelTypeEnum = z.enum(["always-on", "cyclique"]).catch("always-on");

export const EngagementPillarSchema = z
  .object({
    touchpoints: z
      .array(
        z.object({
          canal: z.string().default(""),
          type: TouchpointTypeEnum,
          role: z.string().default(""),
          priorite: num,
        }),
      )
      .default([]),
    rituels: z
      .array(
        z.object({
          nom: z.string().default(""),
          type: RituelTypeEnum,
          frequence: z.string().default(""),
          description: z.string().default(""),
        }),
      )
      .default([]),
    principesCommunautaires: z
      .object({
        principes: flexStringArray,
        tabous: flexStringArray,
      })
      .default({}),
    gamification: z
      .array(
        z.object({
          niveau: num,
          nom: z.string().default(""),
          condition: z.string().default(""),
          recompense: z.string().default(""),
        }),
      )
      .default([]),
    aarrr: z
      .object({
        acquisition: z.string().default(""),
        activation: z.string().default(""),
        retention: z.string().default(""),
        revenue: z.string().default(""),
        referral: z.string().default(""),
      })
      .default({}),
    kpis: z
      .array(
        z.object({
          variable: z.string().default(""),
          nom: z.string().default(""),
          cible: z.string().default(""),
          frequence: z.string().default(""),
        }),
      )
      .default([]),

    // ── ARTEMIS — Variables from ADVE Cult Marketing ──────────────────
    /** Sacred calendar: brand-owned moments (distinct from marketing calendar) */
    sacredCalendar: z
      .array(
        z.object({
          nom: z.string().default(""),
          date: z.string().default(""),
          type: z.string().default(""),
          signification: z.string().default(""),
          rituel: z.string().default(""),
        }),
      )
      .default([]),
    /** Commandments: 10 structured rules for the community */
    commandments: z
      .array(
        z.object({
          numero: num,
          commandement: z.string().default(""),
          justification: z.string().default(""),
          consequence: z.string().default(""),
        }),
      )
      .default([]),
    /** Rites de passage: 5 stages with entry ritual, status symbols, rewards */
    ritesDePassage: z
      .array(
        z.object({
          stade: z.string().default(""),
          rituelEntree: z.string().default(""),
          symbolesStatut: flexStringArray,
          recompenses: flexStringArray,
          prochainPas: z.string().default(""),
        }),
      )
      .default([]),
    /** Sacraments: AARRR reformulated as rituals with Trigger → Action → Reward */
    sacraments: z
      .array(
        z.object({
          nom: z.string().default(""),
          etapeAarrr: z.string().default(""),
          trigger: z.string().default(""),
          action: z.string().default(""),
          reward: z.string().default(""),
          kpi: z.string().default(""),
        }),
      )
      .default([]),
  })
  .strip();

export type EngagementPillarData = z.infer<typeof EngagementPillarSchema>;
