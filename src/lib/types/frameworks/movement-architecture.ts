// =============================================================================
// FW-20 — Movement Architecture
// =============================================================================
// Couche 0 — PHILOSOPHIE
// Defines the civilizational project that the brand carries beyond commerce.
// Produces: MA.prophecy, MA.existentialEnemy, MA.doctrine,
//           MA.sacredArtifacts, MA.livingMythology
// =============================================================================

import { z } from "zod";
import { flexStringArray } from "../pillars/shared";
import { SuperfanStageSchema } from "./framework-descriptor";

// ---------------------------------------------------------------------------
// MA.prophecy — The world transformed when the movement wins
// ---------------------------------------------------------------------------

export const ProphecySchema = z
  .object({
    /** The world as it will be when the movement has won */
    worldTransformed: z.string().default(""),
    /** Why early adopters are pioneers */
    pioneers: z.string().default(""),
    /** Why joining NOW matters */
    urgency: z.string().default(""),
    /** Narrative deadline — "By 2030" or "In our lifetime" */
    horizon: z.string().default(""),
  })
  .default({});

// ---------------------------------------------------------------------------
// MA.existentialEnemy — The FORCE to defeat (not a competitor)
// ---------------------------------------------------------------------------

export const ExistentialEnemySchema = z
  .object({
    /** The systemic force to overcome */
    force: z.string().default(""),
    /** Concrete manifestations of this force */
    manifestations: flexStringArray,
    /** Why defeating this enemy matters morally */
    whyItMatters: z.string().default(""),
    /** How the movement wins against this force */
    howWeWin: z.string().default(""),
    /** The moral dimension of joining the fight */
    moralDimension: z.string().default(""),
  })
  .default({});

// ---------------------------------------------------------------------------
// MA.doctrine — Belief system (dogmas, principles, practices)
// ---------------------------------------------------------------------------

const DogmaSchema = z.object({
  belief: z.string().default(""),
  whyCounterIntuitive: z.string().default(""),
  implication: z.string().default(""),
});

const PrincipleSchema = z.object({
  principle: z.string().default(""),
  application: z.string().default(""),
});

const PracticeSchema = z.object({
  practice: z.string().default(""),
  frequency: z.string().default(""),
});

export const DoctrineSchema = z
  .object({
    /** 3-5 non-negotiable beliefs */
    dogmas: z.array(DogmaSchema).default([]),
    /** 5-7 derived principles */
    principles: z.array(PrincipleSchema).default([]),
    /** 7-10 concrete practices */
    practices: z.array(PracticeSchema).default([]),
  })
  .default({});

// ---------------------------------------------------------------------------
// MA.sacredArtifacts — Relics that materialize belonging (one per stage)
// ---------------------------------------------------------------------------

const ArtifactRaritySchema = z
  .enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"])
  .catch("COMMON");

export const SacredArtifactSchema = z.object({
  /** Name of the artifact */
  name: z.string().default(""),
  /** Physical form */
  form: z.string().default(""),
  /** Narrative meaning */
  narrative: z.string().default(""),
  /** Superfan stage this artifact is associated with */
  stage: SuperfanStageSchema.catch("AUDIENCE"),
  /** How and when the artifact is delivered */
  deliveryRitual: z.string().default(""),
  /** Rarity level (increases with stage) */
  rarity: ArtifactRaritySchema,
  /** Social signal — what others see */
  socialSignal: z.string().default(""),
});

// ---------------------------------------------------------------------------
// MA.livingMythology — Extensible mythology system
// ---------------------------------------------------------------------------

const CanonChapterSchema = z.object({
  title: z.string().default(""),
  narrative: z.string().default(""),
  date: z.string().default(""),
  significance: z.string().default(""),
});

export const LivingMythologySchema = z
  .object({
    canon: z
      .object({
        /** The founding myth (extended from A.herosJourney) */
        foundingMyth: z.string().default(""),
        /** Chapters added chronologically */
        chapters: z.array(CanonChapterSchema).default([]),
      })
      .default({}),
    extensionRules: z
      .object({
        /** Who can contribute to the canon */
        whoCanContribute: flexStringArray,
        /** How contributions are validated */
        validationProcess: z.string().default(""),
        /** Format constraints for new chapters */
        formatConstraints: z.string().default(""),
      })
      .default({}),
    captureSystem: z
      .object({
        /** Sources of community stories */
        sources: flexStringArray,
        /** How stories are integrated into the canon */
        integration: z.string().default(""),
      })
      .default({}),
  })
  .default({});

// ---------------------------------------------------------------------------
// Complete FW-20 Output Schema
// ---------------------------------------------------------------------------

export const MovementArchitectureSchema = z
  .object({
    prophecy: ProphecySchema,
    existentialEnemy: ExistentialEnemySchema,
    doctrine: DoctrineSchema,
    sacredArtifacts: z.array(SacredArtifactSchema).default([]),
    livingMythology: LivingMythologySchema,
  })
  .strip();

export type MovementArchitectureData = z.infer<
  typeof MovementArchitectureSchema
>;
export type Prophecy = z.infer<typeof ProphecySchema>;
export type ExistentialEnemy = z.infer<typeof ExistentialEnemySchema>;
export type Doctrine = z.infer<typeof DoctrineSchema>;
export type SacredArtifact = z.infer<typeof SacredArtifactSchema>;
export type LivingMythology = z.infer<typeof LivingMythologySchema>;
