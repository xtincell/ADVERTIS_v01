// =============================================================================
// FW-12 — Narrative Engineering Schema
// =============================================================================
// AI-native narrative framework: story arcs per superfan stage,
// sacred texts, vocabulary levels, and story bank.
// =============================================================================

import { z } from "zod";
import { flexStringArray } from "../pillars/shared";
import { SuperfanStageSchema } from "./framework-descriptor";

// ---------------------------------------------------------------------------
// Narrative Arc — one per stage
// ---------------------------------------------------------------------------

export const NarrativeArcSchema = z.object({
  stage: SuperfanStageSchema,
  archetype: z.string().describe("Archétype narratif dominant pour ce stade"),
  hook: z.string().describe("Accroche narrative pour attirer à ce stade"),
  coreMessage: z.string().describe("Message central pour ce stade"),
  emotionalTone: z.string().describe("Ton émotionnel"),
  callToAction: z.string().describe("Appel à l'action pour progresser"),
  channels: flexStringArray.describe("Canaux privilégiés pour cette narrative"),
});

export type NarrativeArc = z.infer<typeof NarrativeArcSchema>;

// ---------------------------------------------------------------------------
// Sacred Texts — foundational brand narratives
// ---------------------------------------------------------------------------

export const SacredTextSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum([
    "ORIGIN_STORY",
    "MANIFESTO",
    "CREDO",
    "FOUNDING_MYTH",
    "PROPHECY_NARRATIVE",
    "ENEMY_DECLARATION",
  ]),
  content: z.string().describe("Texte narratif sacré"),
  audience: SuperfanStageSchema
    .optional()
    .describe("Stade cible, ou tous si absent"),
  usageGuidelines: z.string().optional(),
});

export type SacredText = z.infer<typeof SacredTextSchema>;

// ---------------------------------------------------------------------------
// Vocabulary by Stage
// ---------------------------------------------------------------------------

export const VocabularyStageSchema = z.object({
  stage: SuperfanStageSchema,
  registerLevel: z.enum(["ACCESSIBLE", "INITIATED", "INSIDER", "SACRED"]),
  authorizedTerms: flexStringArray,
  forbiddenTerms: flexStringArray,
  toneDirectives: z.string().describe("Directives de ton pour ce stade"),
  jargonLevel: z.number().min(0).max(10).describe("Niveau de jargon 0-10"),
});

export type VocabularyStage = z.infer<typeof VocabularyStageSchema>;

// ---------------------------------------------------------------------------
// Story Bank — reusable story templates
// ---------------------------------------------------------------------------

export const StoryBankEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum([
    "TESTIMONY",
    "CASE_STUDY",
    "PARABLE",
    "HERO_STORY",
    "TRANSFORMATION",
    "COMMUNITY_MOMENT",
  ]),
  targetStage: SuperfanStageSchema,
  synopsis: z.string(),
  keyMessage: z.string(),
  channels: flexStringArray,
  emotionalImpact: z.string(),
});

export type StoryBankEntry = z.infer<typeof StoryBankEntrySchema>;

// ---------------------------------------------------------------------------
// Narrative Engineering — Combined Output
// ---------------------------------------------------------------------------

export const NarrativeEngineeringOutputSchema = z.object({
  narrativeArc: z.array(NarrativeArcSchema).min(1).max(6),
  sacredTexts: z.array(SacredTextSchema),
  vocabularyByStage: z.array(VocabularyStageSchema).min(1).max(6),
  storyBank: z.array(StoryBankEntrySchema),
});

export type NarrativeEngineeringOutput = z.infer<
  typeof NarrativeEngineeringOutputSchema
>;
