// =============================================================================
// MODULE 6D — Media Mix Calculator
// =============================================================================
//
// Pure arithmetic media mix allocation (no AI). Weighs channels by
// performance data (Pillar T), seasonal boosts (OpportunityCalendar),
// and budget constraints (BudgetTier). Outputs channel-level allocations.
//
// PIPELINE (7 steps) :
//   6D.1  Load strategy + pillar data (E, T)
//   6D.2  Load budget tiers + active opportunities
//   6D.3  Determine total budget (selectedBudget or middle tier)
//   6D.4  Extract channels from Pillar E touchpoints
//   6D.5  Calculate performance weights from Pillar T
//   6D.6  Calculate seasonal boosts from OpportunityCalendar
//   6D.7  Compute weighted allocation (normalize to 100%)
//
// PUBLIC API :
//   6D.8  calculateMediaMix()      — Full pipeline → MediaMixResult
//   6D.9  formatMediaMixOutput()   — Formats result as BriefContent structure
//
// DEPENDENCIES :
//   - lib/types/pillar-parsers → parsePillarContent()
//   - lib/types/pillar-data → EngagementPillarData
//   - lib/types/pillar-schemas → TrackAuditResult
//   - Prisma: BudgetTier, OpportunityCalendar
//
// CALLED BY :
//   - tRPC router cockpit (media mix endpoint)
//   - Translation document generation
//
// =============================================================================

import { db } from "~/server/db";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type { EngagementPillarData } from "~/lib/types/pillar-data";
import type { TrackAuditResult } from "~/lib/types/pillar-schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChannelAllocation {
  channel: string;
  budgetPercent: number;
  budgetAmount: number;
  rationale: string;
  kpis: Array<{ metric: string; target: string }>;
}

export interface MediaMixResult {
  totalBudget: number;
  allocations: ChannelAllocation[];
  seasonalBoosts: Array<{ channel: string; boost: number; reason: string }>;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Default channel weights (used when no performance data is available)
// ---------------------------------------------------------------------------

const DEFAULT_CHANNEL_WEIGHTS: Record<string, number> = {
  "Digital - Social Media": 0.25,
  "Digital - Search": 0.15,
  "Digital - Display": 0.10,
  "TV": 0.15,
  "Radio": 0.10,
  "OOH": 0.08,
  "Print": 0.05,
  "Activation terrain": 0.07,
  "RP": 0.05,
};

// ---------------------------------------------------------------------------
// Core: Calculate media mix
// ---------------------------------------------------------------------------

/**
 * Calculate the optimal media mix allocation for a strategy.
 * Uses pillar E (channels + budget), pillar T (performance), budget tiers,
 * and active opportunities for seasonal boosts.
 */
export async function calculateMediaMix(
  strategyId: string,
  selectedBudget?: number,
): Promise<MediaMixResult> {
  // 1. Load strategy & pillar data
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    select: { id: true, vertical: true },
  });

  const pillars = await db.pillar.findMany({
    where: { strategyId, type: { in: ["E", "T"] } },
    select: { type: true, content: true },
  });

  const ePillar = pillars.find((p) => p.type === "E");
  const tPillar = pillars.find((p) => p.type === "T");

  const { data: eContent } = parsePillarContent<EngagementPillarData>("E", ePillar?.content);
  const { data: tContent } = parsePillarContent<TrackAuditResult>("T", tPillar?.content);

  // 2. Load budget tiers and active opportunities
  const budgetTiers = await db.budgetTier.findMany({
    where: { strategyId },
    orderBy: { minBudget: "asc" },
  });

  const now = new Date();
  const opportunities = await db.opportunityCalendar.findMany({
    where: {
      strategyId,
      startDate: { lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) }, // next 90 days
    },
    select: { title: true, type: true, channels: true, impact: true },
  });

  // 3. Determine total budget
  let totalBudget = selectedBudget ?? 0;
  if (!totalBudget && budgetTiers.length > 0) {
    // Default to middle tier (IMPACT)
    const midTier = budgetTiers[Math.floor(budgetTiers.length / 2)];
    totalBudget = midTier ? Math.round((midTier.minBudget + midTier.maxBudget) / 2) : 0;
  }

  // 4. Extract channels from pillar E
  const channels = extractChannels(eContent);

  // 5. Calculate performance weights from pillar T
  const performanceWeights = extractPerformanceWeights(tContent);

  // 6. Calculate seasonal boosts from opportunities
  const seasonalBoosts = calculateSeasonalBoosts(opportunities);

  // 7. Compute allocation
  const allocations = computeAllocation(
    channels,
    totalBudget,
    performanceWeights,
    seasonalBoosts,
  );

  return {
    totalBudget,
    allocations,
    seasonalBoosts,
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractChannels(
  eContent: EngagementPillarData | null,
): Array<{ name: string; baseWeight: number }> {
  if (!eContent) {
    return Object.entries(DEFAULT_CHANNEL_WEIGHTS).map(([name, weight]) => ({
      name,
      baseWeight: weight,
    }));
  }

  // Try to extract from pillarE touchpoints/activations
  const touchpoints = eContent.touchpoints ?? [];
  if (touchpoints.length > 0) {
    const total = touchpoints.length;
    return touchpoints.map((tp) => ({
      name: typeof tp === "string" ? tp : ((tp as Record<string, unknown>).canal as string) ?? "Unknown",
      baseWeight: 1 / total,
    }));
  }

  return Object.entries(DEFAULT_CHANNEL_WEIGHTS).map(([name, weight]) => ({
    name,
    baseWeight: weight,
  }));
}

function extractPerformanceWeights(
  tContent: TrackAuditResult | null,
): Record<string, number> {
  const weights: Record<string, number> = {};

  if (!tContent) return weights;

  // Extract from BMF validation or macro trends
  const macroTrends = (tContent as Record<string, unknown>).macroTrends;
  if (Array.isArray(macroTrends)) {
    for (const trend of macroTrends) {
      const t = trend as Record<string, unknown>;
      if (t.category && t.impact) {
        const category = String(t.category);
        const impact = String(t.impact);
        weights[category] = impact === "HIGH" ? 1.3 : impact === "MEDIUM" ? 1.0 : 0.8;
      }
    }
  }

  return weights;
}

function calculateSeasonalBoosts(
  opportunities: Array<{
    title: string;
    type: string;
    channels: unknown;
    impact: string;
  }>,
): Array<{ channel: string; boost: number; reason: string }> {
  const boosts: Array<{ channel: string; boost: number; reason: string }> = [];

  for (const opp of opportunities) {
    const impactMultiplier = opp.impact === "HIGH" ? 1.5 : opp.impact === "MEDIUM" ? 1.2 : 1.1;
    const channels = Array.isArray(opp.channels) ? opp.channels : [];

    for (const ch of channels) {
      const channelName = typeof ch === "string" ? ch : String(ch);
      boosts.push({
        channel: channelName,
        boost: impactMultiplier,
        reason: `Opportunité "${opp.title}" (${opp.type})`,
      });
    }
  }

  return boosts;
}

function computeAllocation(
  channels: Array<{ name: string; baseWeight: number }>,
  totalBudget: number,
  performanceWeights: Record<string, number>,
  seasonalBoosts: Array<{ channel: string; boost: number; reason: string }>,
): ChannelAllocation[] {
  // Apply performance weights and seasonal boosts
  const weighted = channels.map((ch) => {
    let weight = ch.baseWeight;

    // Apply performance weight
    const perfWeight = performanceWeights[ch.name];
    if (perfWeight) {
      weight *= perfWeight;
    }

    // Apply seasonal boosts
    const boosts = seasonalBoosts.filter((b) =>
      b.channel.toLowerCase().includes(ch.name.toLowerCase()) ||
      ch.name.toLowerCase().includes(b.channel.toLowerCase()),
    );
    for (const boost of boosts) {
      weight *= boost.boost;
    }

    return { ...ch, adjustedWeight: weight };
  });

  // Normalize weights to sum to 1
  const totalWeight = weighted.reduce((sum, ch) => sum + ch.adjustedWeight, 0);
  const normalized = weighted.map((ch) => ({
    ...ch,
    normalizedWeight: totalWeight > 0 ? ch.adjustedWeight / totalWeight : 1 / weighted.length,
  }));

  // Calculate allocations
  return normalized.map((ch) => ({
    channel: ch.name,
    budgetPercent: Math.round(ch.normalizedWeight * 100),
    budgetAmount: Math.round(ch.normalizedWeight * totalBudget),
    rationale: `Base: ${Math.round(ch.baseWeight * 100)}% → Ajusté: ${Math.round(ch.normalizedWeight * 100)}%`,
    kpis: [], // Filled by caller or AI enrichment
  }));
}

/**
 * Format media mix result as BriefContent-compatible structure
 * for inclusion in a TranslationDocument.
 */
export function formatMediaMixOutput(result: MediaMixResult): Record<string, unknown> {
  return {
    title: "Recommandation Media Mix",
    briefType: "MEDIA_MIX",
    sections: [
      {
        heading: "Budget Total",
        blocks: [
          {
            assertion: `Budget recommandé : ${result.totalBudget.toLocaleString("fr-FR")} FCFA`,
            sourceRef: {
              pillar: "E",
              variableKey: "budget.total",
              variableValue: String(result.totalBudget),
              why: "Budget basé sur les paliers budgétaires configurés",
              updatedAt: result.generatedAt,
              source: "generation",
            },
            type: "insight",
          },
        ],
      },
      {
        heading: "Allocation par Canal",
        blocks: result.allocations.map((a) => ({
          assertion: `${a.channel} : ${a.budgetPercent}% (${a.budgetAmount.toLocaleString("fr-FR")} FCFA) — ${a.rationale}`,
          sourceRef: {
            pillar: "E",
            variableKey: `channel.${a.channel.toLowerCase().replace(/\s+/g, "_")}`,
            variableValue: `${a.budgetPercent}%`,
            why: `Allocation calculée par pondération performance × saisonnalité`,
            updatedAt: result.generatedAt,
            source: "generation" as const,
          },
          type: "recommendation" as const,
        })),
      },
      ...(result.seasonalBoosts.length > 0
        ? [
            {
              heading: "Ajustements Saisonniers",
              blocks: result.seasonalBoosts.map((b) => ({
                assertion: `${b.channel} : boost ×${b.boost} — ${b.reason}`,
                sourceRef: {
                  pillar: "T",
                  variableKey: `opportunity.${b.channel.toLowerCase().replace(/\s+/g, "_")}`,
                  variableValue: `×${b.boost}`,
                  why: b.reason,
                  updatedAt: result.generatedAt,
                  source: "generation" as const,
                },
                type: "insight" as const,
              })),
            },
          ]
        : []),
    ],
  };
}
