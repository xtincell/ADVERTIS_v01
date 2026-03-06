// =============================================================================
// MODULE 43 — Campaign Migration (Pillar I → Campaign entities)
// =============================================================================
// Migrates existing campaign data from Pillar I JSON (campaigns.annualCalendar[],
// campaigns.templates[]) into first-class Campaign entities.
//
// This is a one-time migration utility run per strategy.
//
// Dependencies:
//   - ~/server/db (Prisma — Pillar, Campaign, CampaignAction, CampaignBudgetLine)
// =============================================================================

import { db } from "~/server/db";

interface PillarICampaign {
  mois?: string;
  campagne?: string;
  objectif?: string;
  canaux?: string[];
  budget?: string;
  kpiCible?: string;
  actionsDetaillees?: string[];
  messagesCles?: string[];
  budgetDetail?: {
    production?: string;
    media?: string;
    talent?: string;
  };
  timeline?: { debut?: string; fin?: string };
  metriquesSucces?: string[];
}

interface PillarITemplate {
  nom?: string;
  type?: "lancement" | "recurrence" | "evenement" | "activation";
  description?: string;
  duree?: string;
  canauxPrincipaux?: string[];
  messagesCles?: string[];
  budgetEstime?: string;
  kpisAttendus?: string[];
}

const TYPE_MAP: Record<string, string> = {
  lancement: "LAUNCH",
  recurrence: "RECURRING",
  evenement: "EVENT",
  activation: "ACTIVATION",
};

/** Parse budget string like "5,000,000 XOF" → number */
function parseBudget(budget?: string): number | null {
  if (!budget) return null;
  const cleaned = budget.replace(/[^0-9.,]/g, "").replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Migrate all Pillar I campaigns for a strategy into Campaign entities.
 * Returns the list of created campaigns.
 */
export async function migratePillarICampaigns(
  strategyId: string,
  createdBy: string,
) {
  // Find Pillar I
  const pillar = await db.pillar.findFirst({
    where: { strategyId, type: "I" },
    select: { content: true },
  });

  if (!pillar?.content) {
    return { migrated: 0, campaigns: [] };
  }

  const content = pillar.content as Record<string, unknown>;
  const campaignsData = content.campaigns as {
    annualCalendar?: PillarICampaign[];
    templates?: PillarITemplate[];
  } | undefined;

  if (!campaignsData) {
    return { migrated: 0, campaigns: [] };
  }

  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    select: { currency: true },
  });

  const created = [];

  // Migrate annual calendar campaigns
  if (campaignsData.annualCalendar) {
    for (let i = 0; i < campaignsData.annualCalendar.length; i++) {
      const src = campaignsData.annualCalendar[i]!;
      const year = new Date().getFullYear();

      const campaign = await db.campaign.create({
        data: {
          strategyId,
          name: src.campagne ?? `Campagne ${i + 1}`,
          code: `CAMP-${year}-${String(i + 1).padStart(3, "0")}`,
          description: src.objectif ?? null,
          campaignType: "ACTIVATION",
          status: "BRIEF_DRAFT",
          priority: "P1",
          totalBudget: parseBudget(src.budget),
          currency: strategy.currency,
          channels: src.canaux ?? undefined,
          kpiTargets: src.metriquesSucces?.map((m) => ({
            name: m,
            target: 0,
            unit: "",
          })) ?? undefined,
          createdBy,
        },
      });

      // Create actions from actionsDetaillees
      if (src.actionsDetaillees) {
        for (const action of src.actionsDetaillees) {
          await db.campaignAction.create({
            data: {
              campaignId: campaign.id,
              name: action,
              actionLine: "TTL", // Default to TTL, user can reclassify
              actionType: "DIGITAL",
              currency: strategy.currency,
            },
          });
        }
      }

      // Create budget lines from budgetDetail
      if (src.budgetDetail) {
        const details = src.budgetDetail;
        if (details.production) {
          await db.campaignBudgetLine.create({
            data: {
              campaignId: campaign.id,
              category: "PRODUCTION",
              label: "Production",
              budgetAllocated: parseBudget(details.production) ?? 0,
              currency: strategy.currency,
            },
          });
        }
        if (details.media) {
          await db.campaignBudgetLine.create({
            data: {
              campaignId: campaign.id,
              category: "MEDIA",
              label: "Média",
              budgetAllocated: parseBudget(details.media) ?? 0,
              currency: strategy.currency,
            },
          });
        }
        if (details.talent) {
          await db.campaignBudgetLine.create({
            data: {
              campaignId: campaign.id,
              category: "TALENT",
              label: "Talent / Influenceurs",
              budgetAllocated: parseBudget(details.talent) ?? 0,
              currency: strategy.currency,
            },
          });
        }
      }

      created.push(campaign);
    }
  }

  // Migrate templates
  if (campaignsData.templates) {
    for (const tpl of campaignsData.templates) {
      const campaign = await db.campaign.create({
        data: {
          strategyId,
          name: tpl.nom ?? "Template sans nom",
          description: tpl.description ?? null,
          campaignType: TYPE_MAP[tpl.type ?? "activation"] ?? "ACTIVATION",
          status: "BRIEF_DRAFT",
          priority: "P1",
          isTemplate: true,
          totalBudget: parseBudget(tpl.budgetEstime),
          currency: strategy.currency,
          channels: tpl.canauxPrincipaux ?? undefined,
          kpiTargets: tpl.kpisAttendus?.map((k) => ({
            name: k,
            target: 0,
            unit: "",
          })) ?? undefined,
          createdBy,
        },
      });
      created.push(campaign);
    }
  }

  return { migrated: created.length, campaigns: created };
}
