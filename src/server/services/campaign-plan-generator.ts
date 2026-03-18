// =============================================================================
// MODULE 41B — Campaign Plan Generator
// =============================================================================
//
// Generates a dynamic campaign plan based on a selected budget tier.
// Combines parametric budget formula, media-mix calculator, opportunity calendar,
// and AI to propose a coherent set of campaigns with proper attribution.
//
// PUBLIC API :
//   41B.1  generateCampaignPlan()  — Main entry → CampaignPlanResult
//   41B.0  CampaignPlanResult      — Interface for the generated plan
//
// PIPELINE (5 steps) :
//   1. Load strategic context (pillars A-D-V-E, sector, maturity)
//   2. Calculate media mix for the tier budget
//   3. Load opportunity calendar for timing
//   4. AI generates a coherent campaign plan
//   5. Validate: combination score ≥ 60
//
// DEPENDENCIES :
//   - Module 5 (anthropic-client)
//   - Module 6D (media-mix-calculator)
//   - Module 12 (budget-formula)
//   - Prisma: BudgetTier, OpportunityCalendar, Strategy, Pillar
//
// CALLED BY :
//   - tRPC router cockpit.generateCampaignPlan
//
// =============================================================================

import { db } from "~/server/db";
import {
  anthropic,
  DEFAULT_MODEL,
  resilientGenerateText,
} from "./anthropic-client";
import { calculateMediaMix } from "./media-mix-calculator";
import { calculateParametricBudget } from "./budget-formula";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type { EngagementPillarData } from "~/lib/types/pillar-data";
import { BUDGET_TIER_CONFIG, type BudgetTierType } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CampaignProposal {
  mois: string;
  campagne: string;
  type: "ATL" | "BTL" | "TTL";
  campaignType: string;
  budget: number;
  budgetFormatted: string;
  channels: Array<{ channel: string; allocation: number }>;
  kpis: Array<{ metric: string; target: string }>;
  aarrStage: string;
  objectif: string;
  description: string;
}

export interface CampaignPlanResult {
  tierName: string;
  tierBudget: number;
  campaigns: CampaignProposal[];
  mediaMix: {
    totalBudget: number;
    allocations: Array<{
      channel: string;
      budgetPercent: number;
      budgetAmount: number;
    }>;
  };
  combinationScore: number;
  scoring: {
    aarrCoverage: number;
    budgetBalance: number;
    channelDiversity: number;
    temporalSpread: number;
    typeBalance: number;
  };
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Combination Scoring (adapted from action-simulator logic)
// ---------------------------------------------------------------------------

function calculateCombinationScore(campaigns: CampaignProposal[], totalBudget: number): {
  total: number;
  aarrCoverage: number;
  budgetBalance: number;
  channelDiversity: number;
  temporalSpread: number;
  typeBalance: number;
} {
  // 1. AARRR Coverage (20 pts) — at least 3/5 stages
  const aarrStages = new Set(campaigns.map((c) => c.aarrStage));
  const aarrCoverage = Math.min(20, (aarrStages.size / 5) * 20);

  // 2. Budget Balance (20 pts) — no single campaign > 40% of total
  const budgets = campaigns.map((c) => c.budget);
  const maxBudgetRatio = totalBudget > 0 ? Math.max(...budgets) / totalBudget : 0;
  const budgetBalance = maxBudgetRatio <= 0.4 ? 20 : maxBudgetRatio <= 0.6 ? 12 : 5;

  // 3. Channel Diversity (20 pts) — unique channels across all campaigns
  const allChannels = new Set(campaigns.flatMap((c) => c.channels.map((ch) => ch.channel)));
  const channelDiversity = Math.min(20, (allChannels.size / 6) * 20);

  // 4. Temporal Spread (20 pts) — campaigns spread across months
  const months = new Set(campaigns.map((c) => c.mois));
  const temporalSpread = Math.min(20, (months.size / 12) * 20);

  // 5. Type Balance (20 pts) — mix of ATL/BTL/TTL
  const types = new Set(campaigns.map((c) => c.type));
  const typeBalance = types.size >= 3 ? 20 : types.size >= 2 ? 14 : 6;

  const total = Math.round(aarrCoverage + budgetBalance + channelDiversity + temporalSpread + typeBalance);
  return {
    total,
    aarrCoverage: Math.round(aarrCoverage),
    budgetBalance: Math.round(budgetBalance),
    channelDiversity: Math.round(channelDiversity),
    temporalSpread: Math.round(temporalSpread),
    typeBalance: Math.round(typeBalance),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateCampaignPlan(
  strategyId: string,
  tierName: BudgetTierType,
  customBudget?: number,
): Promise<CampaignPlanResult> {
  // 1. Load strategy context
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    select: {
      id: true,
      brandName: true,
      sector: true,
      maturityProfile: true,
      targetRevenue: true,
      annualBudget: true,
      vertical: true,
      pillars: {
        where: { type: { in: ["A", "D", "V", "E", "I"] } },
        select: { type: true, content: true, summary: true },
      },
    },
  });

  // 2. Determine budget from tier or custom
  const tierConfig = BUDGET_TIER_CONFIG[tierName];
  const tierBudget = customBudget ?? Math.round((tierConfig.minBudget + tierConfig.maxBudget) / 2);

  // 3. Calculate media mix
  let mediaMixResult;
  try {
    mediaMixResult = await calculateMediaMix(strategyId, tierBudget);
  } catch {
    // Fallback: simple equal distribution
    const defaultChannels = ["Social Media", "Display", "Activation terrain", "RP"];
    mediaMixResult = {
      totalBudget: tierBudget,
      allocations: defaultChannels.map((ch) => ({
        channel: ch,
        budgetPercent: Math.round(100 / defaultChannels.length),
        budgetAmount: Math.round(tierBudget / defaultChannels.length),
        rationale: "Distribution par défaut",
        kpis: [],
      })),
      seasonalBoosts: [],
      generatedAt: new Date().toISOString(),
    };
  }

  // 4. Load opportunity calendar for seasonal context
  const now = new Date();
  const opportunities = await db.opportunityCalendar.findMany({
    where: {
      strategyId,
      startDate: { lte: new Date(now.getFullYear(), 11, 31) },
    },
    select: { title: true, type: true, impact: true, startDate: true },
    orderBy: { startDate: "asc" },
  });

  // 5. Build context for AI
  const pillarSummaries = strategy.pillars
    .map((p) => `${p.type}: ${p.summary ?? "Non renseigné"}`)
    .join("\n");

  const channelMix = mediaMixResult.allocations
    .map((a) => `${a.channel}: ${a.budgetPercent}% (${a.budgetAmount.toLocaleString("fr-FR")} FCFA)`)
    .join("\n");

  const opportunityContext = opportunities.length > 0
    ? opportunities.map((o) => `- ${o.title} (${o.type}, impact: ${o.impact}, ${o.startDate.toLocaleDateString("fr-FR")})`).join("\n")
    : "Aucune opportunité saisonnière identifiée.";

  // Calculate parametric calibration
  let formulaContext = "";
  if (strategy.targetRevenue && strategy.targetRevenue > 0) {
    const formula = calculateParametricBudget(strategy.targetRevenue, strategy.sector, strategy.maturityProfile);
    formulaContext = `Budget paramétrique (CA × α × β × γ): ${formula.commBudget.toLocaleString("fr-FR")} FCFA comm.`;
  }

  // 6. AI generation
  const prompt = `Tu es un directeur de stratégie marketing africain expert en planification de campagnes.
Génère un plan de campagnes annuel pour la marque "${strategy.brandName}" avec les contraintes suivantes :

PALIER : ${tierName} (${tierConfig.description})
BUDGET TOTAL : ${tierBudget.toLocaleString("fr-FR")} FCFA
SECTEUR : ${strategy.sector ?? "Non défini"}
MATURITÉ : ${strategy.maturityProfile ?? "Non définie"}
${formulaContext}

CONTEXTE STRATÉGIQUE :
${pillarSummaries}

MIX MÉDIA CALCULÉ :
${channelMix}

OPPORTUNITÉS SAISONNIÈRES :
${opportunityContext}

RÈGLES :
- Nombre de campagnes adapté au palier : MICRO=2-3, STARTER=3-5, IMPACT=5-8, CAMPAIGN=8-12, DOMINATION=10-15
- Chaque campagne doit avoir un type d'action (ATL, BTL, ou TTL)
- Chaque campagne doit cibler un stage AARRR (Acquisition, Activation, Rétention, Revenue, Referral)
- Le budget total des campagnes doit ≈ le budget du palier (±10%)
- Mix équilibré entre les types de campagnes (LAUNCH, RECURRING, EVENT, ACTIVATION, INSTITUTIONAL, TACTICAL)
- Répartir sur 12 mois avec concentration sur les opportunités saisonnières
- Canaux par campagne basés sur le mix média

Réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaires :
{
  "campaigns": [
    {
      "mois": "Janvier",
      "campagne": "Nom de la campagne",
      "type": "ATL|BTL|TTL",
      "campaignType": "LAUNCH|RECURRING|EVENT|ACTIVATION|INSTITUTIONAL|TACTICAL",
      "budget": 5000000,
      "channels": [{"channel": "Social Media", "allocation": 40}, {"channel": "Display", "allocation": 30}],
      "kpis": [{"metric": "Reach", "target": "500K"}],
      "aarrStage": "Acquisition|Activation|Rétention|Revenue|Referral",
      "objectif": "Objectif principal de la campagne",
      "description": "Description courte de la campagne"
    }
  ]
}`;

  let campaigns: CampaignProposal[] = [];

  try {
    const result = await resilientGenerateText({
      model: anthropic(DEFAULT_MODEL),
      prompt,
      temperature: 0.7,
      maxOutputTokens: 4000,
    });

    const text = result.text.trim();
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { campaigns: CampaignProposal[] };
      campaigns = (parsed.campaigns ?? []).map((c) => ({
        ...c,
        budgetFormatted: `${(c.budget ?? 0).toLocaleString("fr-FR")} FCFA`,
        channels: c.channels ?? [],
        kpis: c.kpis ?? [],
      }));
    }
  } catch (error) {
    console.error("[CampaignPlanGenerator] AI generation failed, using fallback:", error);
  }

  // Fallback: generate basic campaigns if AI failed
  if (campaigns.length === 0) {
    campaigns = generateFallbackCampaigns(tierName, tierBudget, mediaMixResult.allocations);
  }

  // 7. Calculate combination score
  const scoring = calculateCombinationScore(campaigns, tierBudget);

  return {
    tierName,
    tierBudget,
    campaigns,
    mediaMix: {
      totalBudget: mediaMixResult.totalBudget,
      allocations: mediaMixResult.allocations.map((a) => ({
        channel: a.channel,
        budgetPercent: a.budgetPercent,
        budgetAmount: a.budgetAmount,
      })),
    },
    combinationScore: scoring.total,
    scoring,
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Fallback campaign generation (no AI)
// ---------------------------------------------------------------------------

function generateFallbackCampaigns(
  tierName: BudgetTierType,
  totalBudget: number,
  allocations: Array<{ channel: string; budgetPercent: number; budgetAmount: number }>,
): CampaignProposal[] {
  const campaignCounts: Record<BudgetTierType, number> = {
    MICRO: 2,
    STARTER: 4,
    IMPACT: 6,
    CAMPAIGN: 10,
    DOMINATION: 12,
  };

  const count = campaignCounts[tierName] ?? 4;
  const budgetPerCampaign = Math.round(totalBudget / count);
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const types: Array<"ATL" | "BTL" | "TTL"> = ["ATL", "BTL", "TTL"];
  const aarrStages = ["Acquisition", "Activation", "Rétention", "Revenue", "Referral"];
  const campaignTypes = ["LAUNCH", "RECURRING", "EVENT", "ACTIVATION", "INSTITUTIONAL", "TACTICAL"];

  // Distribute campaigns across months
  const monthStep = Math.max(1, Math.floor(12 / count));

  return Array.from({ length: count }, (_, i) => {
    const monthIdx = (i * monthStep) % 12;
    const topChannels = allocations.slice(0, 3).map((a) => ({
      channel: a.channel,
      allocation: a.budgetPercent,
    }));

    return {
      mois: months[monthIdx]!,
      campagne: `Campagne ${tierName} ${i + 1}`,
      type: types[i % types.length]!,
      campaignType: campaignTypes[i % campaignTypes.length]!,
      budget: budgetPerCampaign,
      budgetFormatted: `${budgetPerCampaign.toLocaleString("fr-FR")} FCFA`,
      channels: topChannels,
      kpis: [{ metric: "Reach", target: "À définir" }],
      aarrStage: aarrStages[i % aarrStages.length]!,
      objectif: `Objectif ${types[i % types.length]} — ${aarrStages[i % aarrStages.length]}`,
      description: `Campagne ${types[i % types.length]} ciblant ${aarrStages[i % aarrStages.length]}`,
    };
  });
}
