// Cost of Doing Business Widget
// Consumes pillar V (unitEconomics, coutMarque, coutClient)
// and optionally pillar I (budgetAllocation) for a financial readiness view.

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

const CodbOutputSchema = z.object({
  unitEconomics: z.object({
    cac: z.string(),
    ltv: z.string(),
    ltvCacRatio: z.string(),
    pointMort: z.string(),
    marges: z.string(),
  }),
  costStructure: z.object({
    capex: z.string(),
    opex: z.string(),
    hiddenCosts: z.array(z.string()),
    frictionCount: z.number(),
  }),
  budgetSummary: z
    .object({
      totalEnveloppe: z.string(),
      topPostes: z.array(
        z.object({
          poste: z.string(),
          montant: z.string(),
          pourcentage: z.number(),
        }),
      ),
      roiProjections: z
        .object({
          mois6: z.string(),
          mois12: z.string(),
          mois24: z.string(),
        })
        .nullable(),
    })
    .nullable(),
  healthIndicators: z.object({
    ltvCacHealthy: z.boolean(),
    hasBreakeven: z.boolean(),
    hasMargins: z.boolean(),
    hasBudget: z.boolean(),
  }),
  codbReadinessScore: z.number(),
  insights: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Descriptor
// ---------------------------------------------------------------------------

const descriptor = {
  id: "codb_calculator",
  name: "Cost of Doing Business",
  description:
    "Calcul du cout d'acquisition et de la rentabilite de la marque",
  icon: "Calculator",
  category: "financial" as const,
  requiredPillars: ["V"],
  minimumPhase: "fiche",
  outputSchema: CodbOutputSchema,
  size: "medium" as const,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ValeurData {
  unitEconomics?: {
    cac?: string;
    ltv?: string;
    ratio?: string;
    pointMort?: string;
    marges?: string;
    notes?: string;
  };
  coutMarque?: {
    capex?: string;
    opex?: string;
    coutsCaches?: string[];
  };
  coutClient?: {
    frictions?: Array<{ friction: string; solution: string }>;
  };
}

interface ImplBudget {
  budgetAllocation?: {
    enveloppeGlobale?: string;
    parPoste?: Array<{
      poste: string;
      montant: string;
      pourcentage: number;
      justification: string;
    }>;
    roiProjections?: {
      mois6?: string;
      mois12?: string;
      mois24?: string;
    };
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Attempt to parse a numeric value from a string (e.g. "150 000 FCFA" → 150000).
 */
function parseNumeric(val: string | undefined): number | null {
  if (!val || val.trim().length === 0) return null;
  // Remove common currency symbols and spaces
  const cleaned = val
    .replace(/[^\d.,\-]/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function hasValue(val: string | undefined): boolean {
  return !!val && val.trim().length > 0;
}

// ---------------------------------------------------------------------------
// Compute
// ---------------------------------------------------------------------------

async function compute(input: WidgetInput): Promise<WidgetResult> {
  try {
    const vContent = input.pillars.V as ValeurData | undefined;
    const iContent = input.pillars.I as ImplBudget | undefined;

    if (!vContent) {
      return {
        success: false,
        data: null,
        error: "Pillar V data not available",
      };
    }

    const ue = vContent.unitEconomics;
    const cm = vContent.coutMarque;
    const cc = vContent.coutClient;
    const budget = iContent?.budgetAllocation;

    // Unit economics
    const cac = ue?.cac || "";
    const ltv = ue?.ltv || "";
    const existingRatio = ue?.ratio || "";
    const pointMort = ue?.pointMort || "";
    const marges = ue?.marges || "";

    // Try computing LTV/CAC ratio mathematically
    let ltvCacRatio = existingRatio;
    const cacNum = parseNumeric(cac);
    const ltvNum = parseNumeric(ltv);
    if (cacNum && ltvNum && cacNum > 0) {
      const ratio = ltvNum / cacNum;
      ltvCacRatio = ratio.toFixed(1) + "x";
    }

    // Cost structure
    const capex = cm?.capex || "";
    const opex = cm?.opex || "";
    const hiddenCosts = cm?.coutsCaches?.filter((c) => c.trim().length > 0) ?? [];
    const frictions = cc?.frictions ?? [];
    const frictionCount = frictions.length;

    // Budget summary (from I pillar if available)
    let budgetSummary = null;
    if (budget && hasValue(budget.enveloppeGlobale)) {
      const topPostes = (budget.parPoste ?? [])
        .filter((p) => hasValue(p.poste))
        .sort((a, b) => b.pourcentage - a.pourcentage)
        .slice(0, 5)
        .map((p) => ({
          poste: p.poste,
          montant: p.montant,
          pourcentage: p.pourcentage,
        }));

      const roi = budget.roiProjections;
      const roiProjections =
        roi && (hasValue(roi.mois6) || hasValue(roi.mois12) || hasValue(roi.mois24))
          ? {
              mois6: roi.mois6 || "",
              mois12: roi.mois12 || "",
              mois24: roi.mois24 || "",
            }
          : null;

      budgetSummary = {
        totalEnveloppe: budget.enveloppeGlobale || "",
        topPostes,
        roiProjections,
      };
    }

    // Health indicators
    const ratioNum = parseNumeric(ltvCacRatio);
    const ltvCacHealthy = ratioNum !== null && ratioNum >= 3;

    const healthIndicators = {
      ltvCacHealthy,
      hasBreakeven: hasValue(pointMort),
      hasMargins: hasValue(marges),
      hasBudget: budgetSummary !== null,
    };

    // ---- Readiness Score (0-100) ----
    let readinessScore = 0;

    // CAC + LTV present: +30
    if (hasValue(cac) && hasValue(ltv)) readinessScore += 30;
    else if (hasValue(cac) || hasValue(ltv)) readinessScore += 15;

    // Ratio calculable: +15
    if (ltvCacRatio.trim().length > 0) readinessScore += 15;

    // Point mort: +10
    if (hasValue(pointMort)) readinessScore += 10;

    // Marges: +10
    if (hasValue(marges)) readinessScore += 10;

    // Budget (from I): +15
    if (budgetSummary) readinessScore += 15;

    // Cout client frictions: +10
    if (frictionCount > 0) readinessScore += 10;

    // ROI projections: +10
    if (budgetSummary?.roiProjections) readinessScore += 10;

    // ---- Insights ----
    const insights: string[] = [];

    if (!hasValue(cac) || !hasValue(ltv)) {
      insights.push("CAC et/ou LTV manquants — donnees essentielles");
    }
    if (ltvCacHealthy) {
      insights.push(
        `Ratio LTV/CAC de ${ltvCacRatio} — sain (> 3x)`,
      );
    } else if (ratioNum !== null && ratioNum > 0) {
      insights.push(
        `Ratio LTV/CAC de ${ltvCacRatio} — en dessous du seuil de rentabilite (3x)`,
      );
    }
    if (hiddenCosts.length > 0) {
      insights.push(`${hiddenCosts.length} cout${hiddenCosts.length > 1 ? "s" : ""} cache${hiddenCosts.length > 1 ? "s" : ""} identifie${hiddenCosts.length > 1 ? "s" : ""}`);
    }
    if (frictionCount > 0) {
      insights.push(
        `${frictionCount} friction${frictionCount > 1 ? "s" : ""} client identifiee${frictionCount > 1 ? "s" : ""}`,
      );
    }
    if (!budgetSummary) {
      insights.push(
        "Budget non renseigne — generer le pilier Implementation (I)",
      );
    }

    return {
      success: true,
      data: {
        unitEconomics: {
          cac,
          ltv,
          ltvCacRatio,
          pointMort,
          marges,
        },
        costStructure: {
          capex,
          opex,
          hiddenCosts,
          frictionCount,
        },
        budgetSummary,
        healthIndicators,
        codbReadinessScore: Math.min(100, readinessScore),
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
