// =============================================================================
// MODULE 14W7 — Narrative Health Widget
// =============================================================================
// Consumes FW-12 (Narrative Engineering) framework output to assess
// narrative coverage across superfan stages, sacred text completeness,
// vocabulary discipline, and story bank depth.
//
// Category: health  |  minimumPhase: cockpit  |  size: medium
// Required pillars: A, D
//
// Dependencies:
//   zod                              — NarrativeHealthOutputSchema
//   ../registry                      — registerWidget
//   ~/lib/types/cockpit-widgets      — WidgetHandler, WidgetInput, WidgetResult
//   ~/server/db                      — FrameworkOutput lookup
//
// Called by:
//   widgets/index.ts or auto-registration import
//   tRPC cockpit router (widget compute)
// =============================================================================

import { z } from "zod";
import { registerWidget } from "../registry";
import type {
  WidgetHandler,
  WidgetInput,
  WidgetResult,
} from "~/lib/types/cockpit-widgets";
import { db } from "~/server/db";

// ---------------------------------------------------------------------------
// Output Schema
// ---------------------------------------------------------------------------

const StageCoverageSchema = z.object({
  stage: z.string(),
  label: z.string(),
  hasNarrativeArc: z.boolean(),
  hasVocabulary: z.boolean(),
  narrativeTone: z.string().nullable(),
  coreMessage: z.string().nullable(),
  coverageScore: z.number().describe("0-100 coverage for this stage"),
});

const NarrativeHealthOutputSchema = z.object({
  /** Coverage per superfan stage */
  stageCoverage: z.array(StageCoverageSchema),
  /** Overall narrative health score 0-100 */
  healthScore: z.number(),
  /** Number of sacred texts defined */
  sacredTextCount: z.number(),
  /** Number of story bank entries */
  storyBankDepth: z.number(),
  /** Vocabulary discipline metrics */
  vocabularyMetrics: z.object({
    totalMustUse: z.number(),
    totalAvoid: z.number(),
    stagesWithVocabulary: z.number(),
  }),
  /** Narrative arc completeness (how many stages have arcs) */
  arcCompleteness: z.number(),
  /** Insights */
  insights: z.array(z.string()),
  /** Whether FW-12 data is available */
  hasFrameworkData: z.boolean(),
});

// ---------------------------------------------------------------------------
// Widget Descriptor
// ---------------------------------------------------------------------------

const descriptor = {
  id: "narrative_health",
  name: "Santé Narrative",
  description:
    "Évaluation de la couverture narrative par stade superfan, complétude des textes sacrés et discipline vocabulaire",
  icon: "BookOpen",
  category: "health" as const,
  requiredPillars: ["A", "D"],
  minimumPhase: "cockpit",
  outputSchema: NarrativeHealthOutputSchema,
  size: "medium" as const,
};

// ---------------------------------------------------------------------------
// Stage definitions
// ---------------------------------------------------------------------------

const STAGES = [
  { stage: "AUDIENCE", label: "Audience" },
  { stage: "FOLLOWER", label: "Follower" },
  { stage: "ENGAGED", label: "Engagé" },
  { stage: "FAN", label: "Fan" },
  { stage: "SUPERFAN", label: "Superfan" },
  { stage: "EVANGELIST", label: "Évangéliste" },
];

// ---------------------------------------------------------------------------
// Compute Logic
// ---------------------------------------------------------------------------

async function compute(input: WidgetInput): Promise<WidgetResult> {
  try {
    // Load FW-12 framework output
    const fw12Output = await db.frameworkOutput.findFirst({
      where: {
        strategyId: input.strategyId,
        frameworkId: "FW-12",
        isStale: false,
      },
      select: { data: true },
    });

    const fw12Data = fw12Output?.data as Record<string, unknown> | null;
    const hasFrameworkData = !!fw12Data;

    const narrativeArcs = (fw12Data?.narrativeArc ?? []) as Array<Record<string, unknown>>;
    const sacredTexts = (fw12Data?.sacredTexts ?? []) as Array<Record<string, unknown>>;
    const vocabularyByStage = (fw12Data?.vocabularyByStage ?? []) as Array<Record<string, unknown>>;
    const storyBank = (fw12Data?.storyBank ?? []) as Array<Record<string, unknown>>;

    // Build per-stage coverage
    const stageCoverage = STAGES.map((s) => {
      const arc = narrativeArcs.find((a) => a.stage === s.stage);
      const vocab = vocabularyByStage.find((v) => v.stage === s.stage);

      const hasArc = !!arc;
      const hasVocab = !!vocab;

      // Coverage score: 50% for arc, 30% for vocabulary, 20% for tone/message completeness
      let score = 0;
      if (hasArc) score += 50;
      if (hasVocab) score += 30;
      if (arc?.narrativeTone) score += 10;
      if (arc?.coreMessage) score += 10;

      return {
        stage: s.stage,
        label: s.label,
        hasNarrativeArc: hasArc,
        hasVocabulary: hasVocab,
        narrativeTone: (arc?.narrativeTone as string) ?? null,
        coreMessage: (arc?.coreMessage as string) ?? null,
        coverageScore: score,
      };
    });

    // Calculate aggregates
    const arcCompleteness = Math.round(
      (stageCoverage.filter((s) => s.hasNarrativeArc).length / STAGES.length) * 100,
    );

    const stagesWithVocabulary = stageCoverage.filter((s) => s.hasVocabulary).length;

    // Count total vocabulary items
    let totalMustUse = 0;
    let totalAvoid = 0;
    for (const v of vocabularyByStage) {
      if (Array.isArray(v.mustUse)) totalMustUse += v.mustUse.length;
      if (Array.isArray(v.avoid)) totalAvoid += v.avoid.length;
    }

    // Overall health score: weighted average
    const avgCoverage =
      stageCoverage.reduce((sum, s) => sum + s.coverageScore, 0) / STAGES.length;
    const textBonus = Math.min(20, sacredTexts.length * 5); // max 20 from sacred texts
    const storyBonus = Math.min(10, storyBank.length * 2); // max 10 from story bank
    const healthScore = Math.round(Math.min(100, avgCoverage * 0.7 + textBonus + storyBonus));

    // Insights
    const insights: string[] = [];
    if (!hasFrameworkData) {
      insights.push(
        "Données FW-12 non disponibles — exécuter l'Ingénierie Narrative pour un diagnostic complet",
      );
    }
    if (arcCompleteness < 50) {
      insights.push(
        `Couverture narrative faible (${arcCompleteness}%) — ${STAGES.length - stageCoverage.filter((s) => s.hasNarrativeArc).length} stade(s) sans arc narratif`,
      );
    }
    if (sacredTexts.length === 0 && hasFrameworkData) {
      insights.push("Aucun texte sacré défini — créer les textes fondateurs de la marque");
    }
    if (stagesWithVocabulary < 3 && hasFrameworkData) {
      insights.push(
        `Vocabulaire défini pour ${stagesWithVocabulary}/${STAGES.length} stades — enrichir la discipline linguistique`,
      );
    }
    if (storyBank.length === 0 && hasFrameworkData) {
      insights.push("Banque d'histoires vide — alimenter avec des récits de marque");
    }
    if (healthScore >= 80) {
      insights.push("Santé narrative excellente — le système narratif est bien structuré");
    }

    // Check pillar data for basic narrative info
    const aContent = input.pillars.A as Record<string, unknown> | undefined;
    const dContent = input.pillars.D as Record<string, unknown> | undefined;
    if (!aContent?.herosJourney && !hasFrameworkData) {
      insights.push("Parcours du héros non défini dans le pilier A — fondation narrative manquante");
    }
    if (!dContent?.tonDeVoix && !hasFrameworkData) {
      insights.push("Ton de voix non défini dans le pilier D — base stylistique manquante");
    }

    return {
      success: true,
      data: {
        stageCoverage,
        healthScore,
        sacredTextCount: sacredTexts.length,
        storyBankDepth: storyBank.length,
        vocabularyMetrics: {
          totalMustUse,
          totalAvoid,
          stagesWithVocabulary,
        },
        arcCompleteness,
        insights,
        hasFrameworkData,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

const handler: WidgetHandler = { descriptor, compute };
registerWidget(handler);
export default handler;
