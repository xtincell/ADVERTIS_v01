// =============================================================================
// MODULE 14W1 — Superfan Tracker Widget
// =============================================================================
// Consumes pillar A (hierarchieCommunautaire) and pillar E (gamification,
// touchpoints, KPIs) to produce a fan scoring model, engagement matrix,
// per-level KPI recommendations, and a readiness score.
// Pure compute -- no AI calls.
//
// Category: community  |  minimumPhase: implementation  |  size: large
// Required pillars: A, E
//
// Public API (exported):
//   default handler  — registered with registerWidget() at import time
//
// Dependencies:
//   zod                              — SuperfanOutputSchema
//   ../registry                      — registerWidget
//   ~/lib/types/cockpit-widgets      — WidgetHandler, WidgetInput, WidgetResult
//
// Called by:
//   widgets/index.ts or auto-registration import
//   tRPC cockpit router (widget compute)
// =============================================================================

import { z } from "zod";
import { registerWidget } from "../registry";
import type { WidgetHandler, WidgetInput, WidgetResult } from "~/lib/types/cockpit-widgets";

// ---------------------------------------------------------------------------
// Output Schema
// ---------------------------------------------------------------------------

const SuperfanOutputSchema = z.object({
  /** Fan levels derived from community hierarchy + gamification */
  fanLevels: z.array(
    z.object({
      level: z.number(),
      name: z.string(),
      description: z.string(),
      privileges: z.string(),
      pointsThreshold: z.number(),
      engagementActions: z.array(z.string()),
    }),
  ),
  /** Touchpoint × fan level engagement matrix */
  engagementMatrix: z.array(
    z.object({
      touchpoint: z.string(),
      canal: z.string(),
      levelScores: z.record(z.string(), z.number()), // levelName → score 0-100
    }),
  ),
  /** Recommended KPIs per fan level */
  trackingKpis: z.array(
    z.object({
      level: z.string(),
      kpis: z.array(
        z.object({
          name: z.string(),
          target: z.string(),
          frequency: z.string(),
        }),
      ),
    }),
  ),
  /** Overall superfan readiness score */
  readinessScore: z.number(),
  /** Summary insights */
  insights: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Widget Descriptor
// ---------------------------------------------------------------------------

const descriptor = {
  id: "superfan_tracker",
  name: "Superfan Tracker",
  description:
    "Modèle de scoring et matrice d'engagement pour identifier et cultiver les superfans de la marque",
  icon: "Heart",
  category: "community" as const,
  requiredPillars: ["A", "E"],
  minimumPhase: "implementation",
  outputSchema: SuperfanOutputSchema,
  size: "large" as const,
};

// ---------------------------------------------------------------------------
// Compute Logic
// ---------------------------------------------------------------------------

interface HierarchyLevel {
  niveau: number;
  nom: string;
  description: string;
  privileges: string;
}

interface GamificationLevel {
  niveau: number;
  nom: string;
  condition: string;
  recompense: string;
}

interface Touchpoint {
  canal: string;
  type: string;
  role: string;
  priorite: number;
}

interface Kpi {
  variable?: string;
  nom: string;
  cible: string;
  frequence: string;
}

async function compute(input: WidgetInput): Promise<WidgetResult> {
  try {
    const aContent = input.pillars.A as Record<string, unknown> | undefined;
    const eContent = input.pillars.E as Record<string, unknown> | undefined;

    if (!aContent || !eContent) {
      return { success: false, data: null, error: "Pillar A or E data not available" };
    }

    // Extract data from pillars
    const hierarchy = (Array.isArray(aContent.hierarchieCommunautaire) ? aContent.hierarchieCommunautaire : []) as HierarchyLevel[];
    const gamification = (eContent.gamification ?? []) as GamificationLevel[];
    const touchpoints = (eContent.touchpoints ?? eContent.touchpointEcosystem ?? []) as Touchpoint[];
    const kpis = (eContent.kpis ?? eContent.kpiDashboard ?? []) as Kpi[];

    // Build fan levels by merging hierarchy + gamification
    const fanLevels = hierarchy.map((h) => {
      const gamLevel = gamification.find((g) => g.niveau === h.niveau);
      return {
        level: h.niveau,
        name: h.nom,
        description: h.description,
        privileges: h.privileges,
        pointsThreshold: h.niveau * 100,
        engagementActions: gamLevel
          ? [gamLevel.condition, gamLevel.recompense].filter(Boolean)
          : [],
      };
    });

    // Build engagement matrix: touchpoint × fan level
    const engagementMatrix = touchpoints.map((tp) => {
      const levelScores: Record<string, number> = {};
      for (const level of fanLevels) {
        // Higher level fans = higher engagement score per touchpoint
        // Priority touchpoints score higher
        const baseScore = Math.min(100, (level.level / Math.max(fanLevels.length, 1)) * 100);
        const priorityBonus = tp.priorite <= 2 ? 20 : tp.priorite <= 4 ? 10 : 0;
        levelScores[level.name] = Math.min(100, Math.round(baseScore + priorityBonus));
      }
      return {
        touchpoint: tp.role || tp.canal,
        canal: tp.canal,
        levelScores,
      };
    });

    // Distribute KPIs across fan levels
    const trackingKpis = fanLevels.map((level, idx) => {
      // Assign KPIs proportionally to level
      const levelKpis = kpis
        .slice(
          Math.floor((idx / fanLevels.length) * kpis.length),
          Math.floor(((idx + 1) / fanLevels.length) * kpis.length) || kpis.length,
        )
        .map((k) => ({
          name: k.nom || k.variable || "",
          target: k.cible || "",
          frequency: k.frequence || "mensuel",
        }));

      return {
        level: level.name,
        kpis: levelKpis.length > 0 ? levelKpis : [{ name: "Engagement", target: "À définir", frequency: "mensuel" }],
      };
    });

    // Calculate readiness score based on data completeness
    let readinessScore = 0;
    if (hierarchy.length > 0) readinessScore += 30;
    if (gamification.length > 0) readinessScore += 25;
    if (touchpoints.length > 0) readinessScore += 25;
    if (kpis.length > 0) readinessScore += 20;

    // Generate insights
    const insights: string[] = [];
    if (hierarchy.length === 0) {
      insights.push("Aucune hiérarchie communautaire définie — essentiel pour le scoring des superfans");
    }
    if (gamification.length === 0) {
      insights.push("Aucun système de gamification — ajouter des niveaux pour engager les fans");
    }
    if (fanLevels.length >= 4) {
      insights.push(`${fanLevels.length} niveaux de fans identifiés — bonne granularité pour le tracking`);
    }
    if (touchpoints.length > 5) {
      insights.push(`${touchpoints.length} touchpoints actifs — large surface d'engagement`);
    }

    return {
      success: true,
      data: {
        fanLevels,
        engagementMatrix,
        trackingKpis,
        readinessScore,
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
