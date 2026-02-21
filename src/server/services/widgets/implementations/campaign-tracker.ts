// =============================================================================
// MODULE 14W2 — Campaign Tracker Widget
// =============================================================================
// Consumes pillar I (campaigns calendar, Big Idea, activation plan, budget)
// to produce a campaign readiness dashboard with annual calendar view,
// activation phase completion, budget summary, and readiness score (0-100).
// Pure compute -- no AI calls.
//
// Category: analytics  |  minimumPhase: implementation  |  size: large
// Required pillars: I
//
// Public API (exported):
//   default handler  — registered with registerWidget() at import time
//
// Dependencies:
//   zod                              — CampaignTrackerOutputSchema
//   ../registry                      — registerWidget
//   ~/lib/types/cockpit-widgets      — WidgetHandler, WidgetInput, WidgetResult
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

// ---------------------------------------------------------------------------
// Output Schema
// ---------------------------------------------------------------------------

const CampaignTrackerOutputSchema = z.object({
  bigIdea: z
    .object({
      concept: z.string(),
      mechanism: z.string(),
      declinaisonCount: z.number(),
    })
    .nullable(),
  annualCalendar: z.array(
    z.object({
      mois: z.string(),
      campagne: z.string(),
      objectif: z.string(),
      canaux: z.array(z.string()),
      budget: z.string(),
      kpiCible: z.string(),
    }),
  ),
  campaignTemplateCount: z.number(),
  activationPhases: z.object({
    teasing: z.boolean(),
    lancement: z.boolean(),
    amplification: z.boolean(),
    fidelisation: z.boolean(),
  }),
  totalBudgetAllocated: z.string(),
  campaignReadinessScore: z.number(),
  insights: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Descriptor
// ---------------------------------------------------------------------------

const descriptor = {
  id: "campaign_tracker",
  name: "Campagnes de l'Annee",
  description:
    "Calendrier annuel, Big Idea, et suivi des campagnes de la marque",
  icon: "CalendarDays",
  category: "analytics" as const,
  requiredPillars: ["I"],
  minimumPhase: "implementation",
  outputSchema: CampaignTrackerOutputSchema,
  size: "large" as const,
};

// ---------------------------------------------------------------------------
// Types for pillar I data
// ---------------------------------------------------------------------------

interface CalendarEntry {
  mois: string;
  campagne: string;
  objectif: string;
  canaux: string[];
  budget: string;
  kpiCible: string;
}

interface CampaignTemplate {
  nom: string;
  type: string;
  description: string;
  duree: string;
  canauxPrincipaux: string[];
  messagesCles: string[];
}

interface ActivationPlan {
  phase1Teasing: string;
  phase2Lancement: string;
  phase3Amplification: string;
  phase4Fidelisation: string;
}

interface BigIdea {
  concept: string;
  mechanism: string;
  insightLink: string;
  declinaisons: Array<{ support: string; description: string }>;
}

interface BudgetAllocation {
  enveloppeGlobale: string;
  parPoste: Array<{
    poste: string;
    montant: string;
    pourcentage: number;
    justification: string;
  }>;
}

// ---------------------------------------------------------------------------
// Compute
// ---------------------------------------------------------------------------

async function compute(input: WidgetInput): Promise<WidgetResult> {
  try {
    const iContent = input.pillars.I as Record<string, unknown> | undefined;

    if (!iContent) {
      return {
        success: false,
        data: null,
        error: "Pillar I data not available",
      };
    }

    // Extract campaign data
    const campaigns = iContent.campaigns as
      | {
          annualCalendar?: CalendarEntry[];
          templates?: CampaignTemplate[];
          activationPlan?: ActivationPlan;
        }
      | undefined;

    const annualCalendar = campaigns?.annualCalendar ?? [];
    const templates = campaigns?.templates ?? [];
    const activationPlan = campaigns?.activationPlan;
    const bigIdeaRaw = iContent.bigIdea as BigIdea | undefined;
    const budget = iContent.budgetAllocation as BudgetAllocation | undefined;

    // Big Idea extraction
    const bigIdea =
      bigIdeaRaw?.concept && bigIdeaRaw.concept.trim().length > 0
        ? {
            concept: bigIdeaRaw.concept,
            mechanism: bigIdeaRaw.mechanism || "",
            declinaisonCount: bigIdeaRaw.declinaisons?.length ?? 0,
          }
        : null;

    // Activation phases (boolean checks)
    const activationPhases = {
      teasing:
        (activationPlan?.phase1Teasing?.trim().length ?? 0) > 0,
      lancement:
        (activationPlan?.phase2Lancement?.trim().length ?? 0) > 0,
      amplification:
        (activationPlan?.phase3Amplification?.trim().length ?? 0) > 0,
      fidelisation:
        (activationPlan?.phase4Fidelisation?.trim().length ?? 0) > 0,
    };

    // Budget summary
    const totalBudgetAllocated = budget?.enveloppeGlobale || "";

    // ---- Readiness Score (0-100) ----
    let readinessScore = 0;

    // Annual calendar >= 6 months: +30
    if (annualCalendar.length >= 6) readinessScore += 30;
    else if (annualCalendar.length >= 3) readinessScore += 15;
    else if (annualCalendar.length >= 1) readinessScore += 5;

    // Big Idea concept non-empty: +25
    if (bigIdea) readinessScore += 25;

    // Templates >= 2: +15
    if (templates.length >= 2) readinessScore += 15;
    else if (templates.length >= 1) readinessScore += 8;

    // All 4 activation phases: +15
    const activePhasesCount = Object.values(activationPhases).filter(
      Boolean,
    ).length;
    if (activePhasesCount === 4) readinessScore += 15;
    else if (activePhasesCount >= 2)
      readinessScore += Math.round((activePhasesCount / 4) * 15);

    // Budget non-empty: +15
    if (totalBudgetAllocated.trim().length > 0) readinessScore += 15;

    // ---- Insights ----
    const insights: string[] = [];
    if (annualCalendar.length === 0) {
      insights.push(
        "Aucun calendrier annuel de campagnes — planifier les temps forts",
      );
    } else {
      insights.push(
        `${annualCalendar.length} campagne${annualCalendar.length > 1 ? "s" : ""} planifiee${annualCalendar.length > 1 ? "s" : ""} sur l'annee`,
      );
    }
    if (!bigIdea) {
      insights.push(
        "Pas de Big Idea definie — concept central indispensable",
      );
    } else if (bigIdea.declinaisonCount >= 3) {
      insights.push(
        `Big Idea declinee en ${bigIdea.declinaisonCount} supports`,
      );
    }
    if (templates.length === 0) {
      insights.push("Aucun template de campagne — creer des modeles replicables");
    }
    if (activePhasesCount < 4) {
      insights.push(
        `${4 - activePhasesCount} phase${4 - activePhasesCount > 1 ? "s" : ""} d'activation manquante${4 - activePhasesCount > 1 ? "s" : ""}`,
      );
    }

    return {
      success: true,
      data: {
        bigIdea,
        annualCalendar,
        campaignTemplateCount: templates.length,
        activationPhases,
        totalBudgetAllocated,
        campaignReadinessScore: Math.min(100, readinessScore),
        insights,
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
