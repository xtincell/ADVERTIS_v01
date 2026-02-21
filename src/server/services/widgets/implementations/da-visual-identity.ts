// =============================================================================
// MODULE 14W3 — DA Visual Identity Widget
// =============================================================================
// Consumes pillar D (identiteVisuelle, tonDeVoix, assetsLinguistiques) to
// produce a weighted visual-identity completeness score (0-100), component
// breakdown, and actionable insights on missing brand elements.
// Pure compute -- no AI calls.
//
// Category: analytics  |  minimumPhase: fiche  |  size: medium
// Required pillars: D
//
// Public API (exported):
//   default handler  — registered with registerWidget() at import time
//
// Dependencies:
//   zod                              — DaOutputSchema
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

const DaOutputSchema = z.object({
  visualIdentityScore: z.number(),
  components: z.object({
    hasDirectionArtistique: z.boolean(),
    hasPaletteCouleurs: z.boolean(),
    colorCount: z.number(),
    hasMood: z.boolean(),
    hasPersonnalite: z.boolean(),
    mantrasCount: z.number(),
    vocabulaireCount: z.number(),
    hasOnDit: z.boolean(),
    hasOnNeditPas: z.boolean(),
  }),
  completenessBreakdown: z.array(
    z.object({
      component: z.string(),
      filled: z.boolean(),
      weight: z.number(),
    }),
  ),
  insights: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Descriptor
// ---------------------------------------------------------------------------

const descriptor = {
  id: "da_visual_identity",
  name: "Direction Artistique",
  description:
    "Scoring et diagnostic de l'identite visuelle et linguistique de la marque",
  icon: "Palette",
  category: "analytics" as const,
  requiredPillars: ["D"],
  minimumPhase: "fiche",
  outputSchema: DaOutputSchema,
  size: "medium" as const,
};

// ---------------------------------------------------------------------------
// Types for pillar D data
// ---------------------------------------------------------------------------

interface DistinctionData {
  identiteVisuelle?: {
    directionArtistique?: string;
    paletteCouleurs?: string[];
    mood?: string;
  };
  tonDeVoix?: {
    personnalite?: string;
    onDit?: string[];
    onNeditPas?: string[];
  };
  assetsLinguistiques?: {
    mantras?: string[];
    vocabulaireProprietaire?: string[];
  };
}

// ---------------------------------------------------------------------------
// Compute
// ---------------------------------------------------------------------------

function hasContent(val: unknown): boolean {
  if (!val) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  return false;
}

async function compute(input: WidgetInput): Promise<WidgetResult> {
  try {
    const dContent = input.pillars.D as DistinctionData | undefined;

    if (!dContent) {
      return {
        success: false,
        data: null,
        error: "Pillar D data not available",
      };
    }

    const iv = dContent.identiteVisuelle;
    const tv = dContent.tonDeVoix;
    const al = dContent.assetsLinguistiques;

    // Component checks
    const hasDA = hasContent(iv?.directionArtistique);
    const palette = iv?.paletteCouleurs ?? [];
    const hasPalette = palette.length >= 3;
    const colorCount = palette.length;
    const hasMood = hasContent(iv?.mood);
    const hasPersonnalite = hasContent(tv?.personnalite);
    const mantras = al?.mantras ?? [];
    const mantrasCount = mantras.filter((m) => m.trim().length > 0).length;
    const vocabulaire = al?.vocabulaireProprietaire ?? [];
    const vocabulaireCount = vocabulaire.filter(
      (v) => v.trim().length > 0,
    ).length;
    const onDit = tv?.onDit ?? [];
    const hasOnDit = onDit.filter((d) => d.trim().length > 0).length >= 3;
    const onNeditPas = tv?.onNeditPas ?? [];
    const hasOnNeditPas =
      onNeditPas.filter((d) => d.trim().length > 0).length >= 2;

    // Weighted score (total = 100)
    const breakdown = [
      { component: "Direction Artistique", filled: hasDA, weight: 20 },
      {
        component: "Palette Couleurs (3+)",
        filled: hasPalette,
        weight: 15,
      },
      { component: "Mood / Atmosphere", filled: hasMood, weight: 10 },
      {
        component: "Personnalite de marque",
        filled: hasPersonnalite,
        weight: 15,
      },
      {
        component: "Mantras (2+)",
        filled: mantrasCount >= 2,
        weight: 10,
      },
      {
        component: "Vocabulaire proprietaire (3+)",
        filled: vocabulaireCount >= 3,
        weight: 10,
      },
      {
        component: "On dit (3+ expressions)",
        filled: hasOnDit,
        weight: 10,
      },
      {
        component: "On ne dit pas (2+ expressions)",
        filled: hasOnNeditPas,
        weight: 10,
      },
    ];

    const visualIdentityScore = breakdown.reduce(
      (sum, item) => sum + (item.filled ? item.weight : 0),
      0,
    );

    // Insights
    const insights: string[] = [];
    const missing = breakdown.filter((b) => !b.filled);
    if (missing.length === 0) {
      insights.push("Identite visuelle et linguistique complete");
    } else {
      for (const m of missing.slice(0, 3)) {
        insights.push(`Manquant : ${m.component}`);
      }
      if (missing.length > 3) {
        insights.push(
          `${missing.length - 3} autre${missing.length - 3 > 1 ? "s" : ""} element${missing.length - 3 > 1 ? "s" : ""} a completer`,
        );
      }
    }

    if (colorCount > 0 && colorCount < 3) {
      insights.push(
        `Seulement ${colorCount} couleur${colorCount > 1 ? "s" : ""} — minimum 3 recommande`,
      );
    }

    return {
      success: true,
      data: {
        visualIdentityScore,
        components: {
          hasDirectionArtistique: hasDA,
          hasPaletteCouleurs: hasPalette,
          colorCount,
          hasMood,
          hasPersonnalite,
          mantrasCount,
          vocabulaireCount,
          hasOnDit,
          hasOnNeditPas,
        },
        completenessBreakdown: breakdown,
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
