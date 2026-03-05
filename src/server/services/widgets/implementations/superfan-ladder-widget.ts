// =============================================================================
// MODULE 14W5 — Superfan Ladder Widget
// =============================================================================
// Consumes FW-11 (Experience Architecture) framework output to produce
// a 6-stage superfan ladder with transition metrics, population distribution
// estimates, and stage-specific insights.
//
// Category: community  |  minimumPhase: cockpit  |  size: large
// Required pillars: A, E (for basic data), plus FrameworkOutput FW-11
//
// Dependencies:
//   zod                              — SuperfanLadderOutputSchema
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

const StageSchema = z.object({
  stage: z.string(),
  label: z.string(),
  population: z.number().describe("Estimated % of total audience at this stage"),
  conversionRate: z.number().describe("% converting to next stage"),
  emotionalShift: z.string(),
  keyExperience: z.string(),
  triggerCondition: z.string(),
  proofOfTransition: z.string(),
  status: z.enum(["active", "designed", "missing"]),
});

const SuperfanLadderOutputSchema = z.object({
  stages: z.array(StageSchema),
  totalStages: z.number(),
  brandCoherenceScore: z.number().nullable(),
  bottleneckStage: z.string().nullable().describe("Stage with lowest conversion rate"),
  insights: z.array(z.string()),
  hasFrameworkData: z.boolean(),
});

// ---------------------------------------------------------------------------
// Widget Descriptor
// ---------------------------------------------------------------------------

const descriptor = {
  id: "superfan_ladder",
  name: "Échelle Superfan",
  description:
    "Visualisation des 6 stades de l'échelle superfan AUDIENCE → ÉVANGÉLISTE avec métriques de transition et taux de conversion",
  icon: "TrendingUp",
  category: "community" as const,
  requiredPillars: ["A", "E"],
  minimumPhase: "cockpit",
  outputSchema: SuperfanLadderOutputSchema,
  size: "large" as const,
};

// ---------------------------------------------------------------------------
// Superfan stage definitions
// ---------------------------------------------------------------------------

const STAGES = [
  { stage: "AUDIENCE", label: "Audience", defaultPopulation: 50 },
  { stage: "FOLLOWER", label: "Follower", defaultPopulation: 25 },
  { stage: "ENGAGED", label: "Engagé", defaultPopulation: 12 },
  { stage: "FAN", label: "Fan", defaultPopulation: 8 },
  { stage: "SUPERFAN", label: "Superfan", defaultPopulation: 4 },
  { stage: "EVANGELIST", label: "Évangéliste", defaultPopulation: 1 },
];

// ---------------------------------------------------------------------------
// Compute Logic
// ---------------------------------------------------------------------------

async function compute(input: WidgetInput): Promise<WidgetResult> {
  try {
    // Try to load FW-11 framework output
    const fw11Output = await db.frameworkOutput.findFirst({
      where: {
        strategyId: input.strategyId,
        frameworkId: "FW-11",
        isStale: false,
      },
      select: { data: true },
    });

    const fw11Data = fw11Output?.data as Record<string, unknown> | null;
    const hasFrameworkData = !!fw11Data;

    // Build stages from FW-11 data or defaults
    const transitionMap = (fw11Data?.transitionMap ?? []) as Array<Record<string, unknown>>;
    const brandCoherenceScore = (fw11Data?.brandCoherenceScore as number) ?? null;

    const stages = STAGES.map((s, idx) => {
      // Find matching transition (transitions go FROM previous TO this stage)
      const transition = transitionMap.find((t) => t.toStage === s.stage);

      return {
        stage: s.stage,
        label: s.label,
        population: s.defaultPopulation,
        conversionRate: transition?.estimatedConversionRate
          ? Math.round((transition.estimatedConversionRate as number) * 100)
          : idx === 0
            ? 100
            : Math.round(50 - idx * 8), // Default declining conversion
        emotionalShift: (transition?.emotionalShift as string) ?? "—",
        keyExperience: (transition?.keyExperience as string) ?? "À définir",
        triggerCondition: (transition?.triggerCondition as string) ?? "À définir",
        proofOfTransition: (transition?.proofOfTransition as string) ?? "À définir",
        status: transition
          ? ("active" as const)
          : hasFrameworkData
            ? ("missing" as const)
            : ("designed" as const),
      };
    });

    // Identify bottleneck (stage with lowest conversion rate, excluding first)
    const convertingStages = stages.slice(1);
    const bottleneck = convertingStages.reduce(
      (min, s) => (s.conversionRate < min.conversionRate ? s : min),
      convertingStages[0]!,
    );

    // Insights
    const insights: string[] = [];
    if (!hasFrameworkData) {
      insights.push(
        "Données ARTEMIS FW-11 non disponibles — exécuter l'Architecture d'Expérience pour des données précises",
      );
    }
    if (bottleneck) {
      insights.push(
        `Goulot d'étranglement identifié : transition vers "${bottleneck.label}" (${bottleneck.conversionRate}% de conversion)`,
      );
    }
    if (brandCoherenceScore != null && brandCoherenceScore < 50) {
      insights.push(
        `Score de cohérence faible (${brandCoherenceScore}/100) — renforcer l'alignement entre les stades`,
      );
    }
    const missingCount = stages.filter((s) => s.status === "missing").length;
    if (missingCount > 0) {
      insights.push(
        `${missingCount} transition(s) non définie(s) dans FW-11 — compléter l'architecture d'expérience`,
      );
    }

    return {
      success: true,
      data: {
        stages,
        totalStages: stages.length,
        brandCoherenceScore,
        bottleneckStage: bottleneck?.stage ?? null,
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
