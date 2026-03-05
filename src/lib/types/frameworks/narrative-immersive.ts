// =============================================================================
// FW-04 — Narrative Immersive
// =============================================================================
// Couche 3 — EXPÉRIENCE (specialization EVENT)
// Template for designing events where narrative IS the infrastructure.
// Activated when nodeType = "EVENT" or "EDITION".
// Produces: NI.northStar, NI.architectureNarrative, NI.spatialMap,
//           NI.questSystem, NI.npcSystem, NI.diegeticSponsoring
// =============================================================================

import { z } from "zod";
import { flexStringArray } from "../pillars/shared";
import { SuperfanStageSchema } from "./framework-descriptor";

// ---------------------------------------------------------------------------
// NI.northStar — 6 keywords + multimodal coherence charter
// ---------------------------------------------------------------------------

export const NorthStarSchema = z
  .object({
    /** 6 keywords defining the event's DNA */
    keywords: z.array(z.string()).default([]),
    charteDeCoherence: z
      .object({
        visuelle: z.string().default(""),
        sonore: z.string().default(""),
        lexicale: z.string().default(""),
        olfactive: z.string().default(""),
        tactile: z.string().default(""),
      })
      .default({}),
  })
  .default({});

// ---------------------------------------------------------------------------
// NI.architectureNarrative — Founding myth + faction system
// ---------------------------------------------------------------------------

const FactionSchema = z.object({
  name: z.string().default(""),
  archetype: z.string().default(""),
  territory: z.string().default(""),
  signesReconnaissance: flexStringArray,
  valeurs: flexStringArray,
  rivalities: flexStringArray,
});

export const ArchitectureNarrativeSchema = z
  .object({
    /** Founding myth — 150-300 words creating the narrative universe */
    mytheFondateur: z.string().default(""),
    /** Faction system — competing groups within the universe */
    factions: z.array(FactionSchema).default([]),
  })
  .default({});

// ---------------------------------------------------------------------------
// NI.spatialMap — Narrative zones with flow and transitions
// ---------------------------------------------------------------------------

const ZoneAmbianceSchema = z.object({
  sonore: z.string().default(""),
  visuelle: z.string().default(""),
  densiteHumaine: z.string().default(""),
});

const ZoneSchema = z.object({
  name: z.string().default(""),
  narrativeRole: z.string().default(""),
  superfanStage: SuperfanStageSchema.catch("AUDIENCE"),
  ambiance: ZoneAmbianceSchema.default({}),
  activities: flexStringArray,
  npcsPresents: flexStringArray,
});

const FluxSchema = z.object({
  from: z.string().default(""),
  to: z.string().default(""),
  transition: z.string().default(""),
  narrativeMeaning: z.string().default(""),
});

export const SpatialMapSchema = z
  .object({
    zones: z.array(ZoneSchema).default([]),
    flux: z.array(FluxSchema).default([]),
  })
  .default({});

// ---------------------------------------------------------------------------
// NI.questSystem — Diegetic gamification
// ---------------------------------------------------------------------------

const MainQuestSchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
  stages: flexStringArray,
  reward: z.string().default(""),
  narrativeLink: z.string().default(""),
});

const QuestTypeSchema = z
  .enum(["EXPLORATION", "CREATION", "SOCIAL", "COLLECTION"])
  .catch("EXPLORATION");

const SideQuestSchema = z.object({
  name: z.string().default(""),
  type: QuestTypeSchema,
  reward: z.string().default(""),
  hidden: z.boolean().default(false),
});

const HiddenQuestRaritySchema = z
  .enum(["RARE", "EPIC", "LEGENDARY"])
  .catch("RARE");

const HiddenQuestSchema = z.object({
  name: z.string().default(""),
  trigger: z.string().default(""),
  reward: z.string().default(""),
  rarity: HiddenQuestRaritySchema,
});

export const QuestSystemSchema = z
  .object({
    mainQuests: z.array(MainQuestSchema).default([]),
    sideQuests: z.array(SideQuestSchema).default([]),
    hiddenQuests: z.array(HiddenQuestSchema).default([]),
  })
  .default({});

// ---------------------------------------------------------------------------
// NI.npcSystem — Non-player characters with scripts and triggers
// ---------------------------------------------------------------------------

const NpcReactionSchema = z.object({
  trigger: z.string().default(""),
  response: z.string().default(""),
});

const NpcSchema = z.object({
  name: z.string().default(""),
  role: z.string().default(""),
  faction: z.string().nullable().default(null),
  script: z
    .object({
      greeting: z.string().default(""),
      questGiving: z.string().default(""),
      reactions: z.array(NpcReactionSchema).default([]),
    })
    .default({}),
  costume: z.string().default(""),
  breakingImmersionProtocol: z.string().default(""),
});

export const NpcSystemSchema = z
  .object({
    npcs: z.array(NpcSchema).default([]),
  })
  .default({});

// ---------------------------------------------------------------------------
// NI.diegeticSponsoring — Sponsor integration into the narrative
// ---------------------------------------------------------------------------

const DiegeticSponsoringEntrySchema = z.object({
  partner: z.string().default(""),
  narrativeRole: z.string().default(""),
  activation: z
    .object({
      name: z.string().default(""),
      inUniverse: z.string().default(""),
      realWorld: z.string().default(""),
    })
    .default({}),
  brandingRules: z.string().default(""),
});

// ---------------------------------------------------------------------------
// NI.ruptureImmersion — Immersion-breaking examples + mitigations
// ---------------------------------------------------------------------------

const RuptureImmersionSchema = z.object({
  example: z.string().default(""),
  mitigation: z.string().default(""),
});

// ---------------------------------------------------------------------------
// Complete FW-04 Output Schema
// ---------------------------------------------------------------------------

export const NarrativeImmersiveSchema = z
  .object({
    northStar: NorthStarSchema,
    architectureNarrative: ArchitectureNarrativeSchema,
    spatialMap: SpatialMapSchema,
    questSystem: QuestSystemSchema,
    npcSystem: NpcSystemSchema,
    diegeticSponsoring: z.array(DiegeticSponsoringEntrySchema).default([]),
    ruptureImmersion: z.array(RuptureImmersionSchema).default([]),
  })
  .strip();

export type NarrativeImmersiveData = z.infer<typeof NarrativeImmersiveSchema>;
export type NorthStar = z.infer<typeof NorthStarSchema>;
export type ArchitectureNarrative = z.infer<typeof ArchitectureNarrativeSchema>;
export type SpatialMap = z.infer<typeof SpatialMapSchema>;
export type QuestSystem = z.infer<typeof QuestSystemSchema>;
export type NpcSystem = z.infer<typeof NpcSystemSchema>;
