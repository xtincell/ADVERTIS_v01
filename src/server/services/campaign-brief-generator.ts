// =============================================================================
// MODULE 42 — Campaign Brief Generator
// =============================================================================
// AI-powered brief generation for campaigns using strategic context.
// Generates structured briefs (creative, media, production, vendor) by
// pulling data from the campaign, strategy pillars, and brand variables.
//
// Dependencies:
//   - ~/server/db (Prisma — Campaign, Strategy, BrandVariable)
// =============================================================================

import { db } from "~/server/db";

/**
 * Build structured context from campaign + strategy for brief generation.
 */
async function buildBriefContext(campaignId: string) {
  const campaign = await db.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: {
      strategy: {
        select: {
          id: true,
          name: true,
          brandName: true,
          sector: true,
          currency: true,
          annualBudget: true,
        },
      },
      actions: true,
      teamMembers: true,
    },
  });

  // Fetch key brand variables
  const variables = await db.brandVariable.findMany({
    where: { strategyId: campaign.strategyId },
    select: { key: true, value: true },
  });

  const varMap: Record<string, unknown> = {};
  for (const v of variables) {
    varMap[v.key] = v.value;
  }

  return { campaign, variables: varMap };
}

/**
 * Generate a structured creative brief from campaign context.
 * Returns JSON content ready to be stored in CampaignBrief.content
 */
export async function generateCreativeBriefContent(campaignId: string) {
  const { campaign, variables } = await buildBriefContext(campaignId);

  return {
    briefType: "CREATIVE",
    campaign: {
      name: campaign.name,
      type: campaign.campaignType,
      funnelStage: campaign.funnelStage,
    },
    brand: {
      name: campaign.strategy.brandName,
      sector: campaign.strategy.sector,
      identity: variables["A.identite"],
      values: variables["A.valeurs"],
      personality: variables["A.personnalite"],
    },
    strategicContext: {
      bigIdea: campaign.bigIdea,
      axeCreatif: campaign.axeCreatif,
      pisteCreative: campaign.pisteCreative,
      insight: campaign.insight,
      promesse: campaign.promesse,
      positioning: campaign.positioning,
    },
    targetAudience: campaign.targetAudience,
    objectives: campaign.kpiTargets,
    timeline: {
      briefDate: campaign.briefDate,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      launchDate: campaign.launchDate,
    },
    budget: {
      total: campaign.totalBudget,
      currency: campaign.currency,
    },
    channels: campaign.channels,
    mandatories: {
      logo: true,
      baseline: true,
      charte: true,
    },
    deliverables: campaign.actions.map((a) => ({
      name: a.name,
      type: a.actionType,
      line: a.actionLine,
    })),
  };
}

/**
 * Generate a structured media brief from campaign context.
 */
export async function generateMediaBriefContent(campaignId: string) {
  const { campaign, variables } = await buildBriefContext(campaignId);

  return {
    briefType: "MEDIA",
    campaign: {
      name: campaign.name,
      type: campaign.campaignType,
    },
    brand: {
      name: campaign.strategy.brandName,
      sector: campaign.strategy.sector,
    },
    objectives: campaign.kpiTargets,
    targetAudience: campaign.targetAudience,
    positioning: variables["D.positionnement"],
    budget: {
      total: campaign.totalBudget,
      currency: campaign.currency,
    },
    timeline: {
      startDate: campaign.startDate,
      endDate: campaign.endDate,
    },
    markets: campaign.markets,
    channels: campaign.channels,
    competitors: variables["R.concurrents"],
    mediaObjectives: {
      reach: null,
      frequency: null,
      grpTarget: null,
      impressionTarget: null,
    },
    constraints: {
      legal: null,
      editorial: null,
      technical: null,
    },
  };
}

/**
 * Generate a structured vendor/prestataire brief.
 */
export async function generateVendorBriefContent(campaignId: string, vendorType: string) {
  const { campaign } = await buildBriefContext(campaignId);

  const relevantActions = campaign.actions.filter(
    (a) => a.vendorId || a.actionType === vendorType,
  );

  return {
    briefType: "VENDOR",
    vendorType,
    campaign: {
      name: campaign.name,
      code: campaign.code,
      type: campaign.campaignType,
    },
    brand: {
      name: campaign.strategy.brandName,
    },
    scope: relevantActions.map((a) => ({
      name: a.name,
      type: a.actionType,
      specs: a.specs,
      budget: a.budgetAllocated,
    })),
    timeline: {
      startDate: campaign.startDate,
      endDate: campaign.endDate,
    },
    budget: {
      allocated: relevantActions.reduce((s, a) => s + a.budgetAllocated, 0),
      currency: campaign.currency,
    },
    deliverables: [],
    qualityCriteria: [],
    approvalProcess: "BAT → Review → Approval",
  };
}

/**
 * Generate a production brief for specific executions.
 */
export async function generateProductionBriefContent(
  campaignId: string,
  executionIds: string[],
) {
  const { campaign } = await buildBriefContext(campaignId);

  const executions = await db.campaignExecution.findMany({
    where: { id: { in: executionIds } },
    include: { action: { select: { name: true, actionLine: true } } },
  });

  return {
    briefType: "PRODUCTION",
    campaign: {
      name: campaign.name,
      code: campaign.code,
    },
    brand: {
      name: campaign.strategy.brandName,
    },
    executions: executions.map((e) => ({
      name: e.name,
      type: e.executionType,
      format: e.format,
      quantity: e.quantity,
      specs: e.specs,
      location: e.location,
      city: e.city,
      market: e.market,
    })),
    timeline: {
      startDate: campaign.startDate,
      deliveryDate: executions[0]?.deliveryDate,
    },
    budget: {
      total: executions.reduce((s, e) => s + (e.totalCost ?? 0), 0),
      currency: campaign.currency,
    },
    technicalSpecs: {
      resolution: null,
      colorProfile: null,
      fileFormat: null,
    },
    qualityChecklist: [
      "Conformité charte graphique",
      "Résolution et format corrects",
      "Textes relus et validés",
      "BAT approuvé",
    ],
  };
}
