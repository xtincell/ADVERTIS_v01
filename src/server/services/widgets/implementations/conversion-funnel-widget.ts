// =============================================================================
// MODULE 14W6 — Conversion Funnel Widget
// =============================================================================
// Consumes FW-11 (Experience Architecture) transition data + pillar E (AARRR)
// to produce a combined conversion funnel showing both the Superfan ladder
// transitions and AARRR pirate metrics side by side.
//
// Category: analytics  |  minimumPhase: cockpit  |  size: medium
// Required pillars: E
//
// Dependencies:
//   zod                              — ConversionFunnelOutputSchema
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

const FunnelStepSchema = z.object({
  stage: z.string(),
  label: z.string(),
  /** AARRR mapping (which AARRR stage this corresponds to) */
  aarrMapping: z.string().nullable(),
  /** Estimated volume/percentage at this step */
  volume: z.number(),
  /** Drop-off % from previous step */
  dropOff: z.number(),
  /** Friction points at this step */
  frictionPoints: z.array(z.string()),
  /** Moments of truth at this step */
  momentsOfTruth: z.array(z.string()),
});

const ConversionFunnelOutputSchema = z.object({
  steps: z.array(FunnelStepSchema),
  overallConversion: z.number().describe("End-to-end conversion rate %"),
  worstDropOff: z.object({
    stage: z.string(),
    dropOff: z.number(),
  }).nullable(),
  aarrCoverage: z.number().describe("% of AARRR stages covered"),
  insights: z.array(z.string()),
  hasFrameworkData: z.boolean(),
});

// ---------------------------------------------------------------------------
// Widget Descriptor
// ---------------------------------------------------------------------------

const descriptor = {
  id: "conversion_funnel",
  name: "Entonnoir de Conversion",
  description:
    "Entonnoir AARRR enrichi avec les transitions superfan FW-11, les points de friction et moments de vérité",
  icon: "Filter",
  category: "analytics" as const,
  requiredPillars: ["E"],
  minimumPhase: "cockpit",
  outputSchema: ConversionFunnelOutputSchema,
  size: "medium" as const,
};

// ---------------------------------------------------------------------------
// AARRR ↔ Superfan mapping
// ---------------------------------------------------------------------------

const AARRR_STAGE_MAP: Record<string, string> = {
  AUDIENCE: "Acquisition",
  FOLLOWER: "Activation",
  ENGAGED: "Retention",
  FAN: "Revenue",
  SUPERFAN: "Revenue",
  EVANGELIST: "Referral",
};

const AARRR_STAGES = ["Acquisition", "Activation", "Retention", "Revenue", "Referral"];

// ---------------------------------------------------------------------------
// Compute Logic
// ---------------------------------------------------------------------------

async function compute(input: WidgetInput): Promise<WidgetResult> {
  try {
    const eContent = input.pillars.E as Record<string, unknown> | undefined;
    const aarrr = (eContent?.aarrr ?? []) as Array<Record<string, unknown>>;

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

    const transitionMap = (fw11Data?.transitionMap ?? []) as Array<Record<string, unknown>>;
    const frictionMap = (fw11Data?.frictionMap ?? []) as Array<Record<string, unknown>>;
    const momentsOfTruth = (fw11Data?.momentsDeTruth ?? []) as Array<Record<string, unknown>>;

    // Build funnel steps
    const superfanStages = ["AUDIENCE", "FOLLOWER", "ENGAGED", "FAN", "SUPERFAN", "EVANGELIST"];
    const stageLabels: Record<string, string> = {
      AUDIENCE: "Audience",
      FOLLOWER: "Follower",
      ENGAGED: "Engagé",
      FAN: "Fan",
      SUPERFAN: "Superfan",
      EVANGELIST: "Évangéliste",
    };

    let cumulativeVolume = 100;
    const steps = superfanStages.map((stage, idx) => {
      const transition = transitionMap.find((t) => t.toStage === stage);
      const convRate = transition?.estimatedConversionRate
        ? (transition.estimatedConversionRate as number)
        : idx === 0
          ? 1
          : 0.5 - idx * 0.06;

      const prevVolume = cumulativeVolume;
      if (idx > 0) {
        cumulativeVolume = Math.round(cumulativeVolume * convRate * 100) / 100;
      }
      const dropOff = idx === 0 ? 0 : Math.round((1 - cumulativeVolume / prevVolume) * 100);

      // Collect friction points for this stage
      const stageFriction = frictionMap
        .filter((f) => f.stage === stage)
        .map((f) => `${f.description} (${f.severity})`);

      // Collect moments of truth for this stage
      const stageMots = momentsOfTruth
        .filter((m) => m.stage === stage)
        .map((m) => m.name as string);

      return {
        stage,
        label: stageLabels[stage] ?? stage,
        aarrMapping: AARRR_STAGE_MAP[stage] ?? null,
        volume: Math.round(cumulativeVolume * 100) / 100,
        dropOff,
        frictionPoints: stageFriction,
        momentsOfTruth: stageMots,
      };
    });

    // Calculate overall conversion (first → last)
    const firstVolume = steps[0]?.volume ?? 100;
    const lastVolume = steps[steps.length - 1]?.volume ?? 0;
    const overallConversion = Math.round((lastVolume / firstVolume) * 100 * 100) / 100;

    // Find worst drop-off
    const droppingSteps = steps.filter((s) => s.dropOff > 0);
    const worstDropOff =
      droppingSteps.length > 0
        ? droppingSteps.reduce((max, s) => (s.dropOff > max.dropOff ? s : max), droppingSteps[0]!)
        : null;

    // Calculate AARRR coverage
    const coveredAarrStages = new Set(steps.map((s) => s.aarrMapping).filter(Boolean));
    const aarrCoverage = Math.round((coveredAarrStages.size / AARRR_STAGES.length) * 100);

    // Insights
    const insights: string[] = [];
    if (!hasFrameworkData) {
      insights.push("Données FW-11 non disponibles — entonnoir basé sur des estimations");
    }
    if (worstDropOff && worstDropOff.dropOff > 60) {
      insights.push(
        `Déperdition critique à "${stageLabels[worstDropOff.stage] ?? worstDropOff.stage}" : ${worstDropOff.dropOff}% de perte`,
      );
    }
    if (overallConversion < 1) {
      insights.push(
        `Taux de conversion global très faible (${overallConversion}%) — revoir les mécaniques de transition`,
      );
    }

    // Check AARRR data from pillar E
    if (aarrr.length > 0) {
      insights.push(`${aarrr.length} étapes AARRR documentées dans le pilier E`);
    } else {
      insights.push("Modèle AARRR non renseigné dans le pilier E — compléter pour enrichir l'entonnoir");
    }

    const totalFriction = steps.reduce((sum, s) => sum + s.frictionPoints.length, 0);
    if (totalFriction > 0) {
      insights.push(`${totalFriction} point(s) de friction identifié(s) dans l'entonnoir`);
    }

    return {
      success: true,
      data: {
        steps,
        overallConversion,
        worstDropOff: worstDropOff
          ? { stage: worstDropOff.stage, dropOff: worstDropOff.dropOff }
          : null,
        aarrCoverage,
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
