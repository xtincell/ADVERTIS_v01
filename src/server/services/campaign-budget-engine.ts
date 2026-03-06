// =============================================================================
// MODULE 41 — Campaign Budget Engine
// =============================================================================
// Dedicated financial logic for campaign-level budget management.
// Handles allocation from budget tiers, variance calculation, burn rate
// forecasting, invoice reconciliation, and cost-per-KPI analysis.
//
// Dependencies:
//   - ~/server/db (Prisma — Campaign, CampaignBudgetLine, BudgetTier, Invoice)
// =============================================================================

import { db } from "~/server/db";

/**
 * Auto-allocate budget from a BudgetTier into campaign budget lines.
 * Reads the tier's channel allocations and creates budget lines.
 */
export async function allocateBudgetFromTier(campaignId: string, tierId: string) {
  const tier = await db.budgetTier.findUniqueOrThrow({ where: { id: tierId } });
  const campaign = await db.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    select: { totalBudget: true, currency: true },
  });

  if (!campaign.totalBudget) {
    throw new Error("Le budget total de la campagne doit être défini avant l'allocation.");
  }

  const allocations = tier.channels as Record<string, number> | null;
  if (!allocations) return [];

  const lines = [];
  for (const [channel, percentage] of Object.entries(allocations)) {
    const amount = campaign.totalBudget * (percentage / 100);
    const line = await db.campaignBudgetLine.create({
      data: {
        campaignId,
        category: "MEDIA",
        subcategory: channel,
        label: `Allocation ${channel} (${percentage}%)`,
        budgetAllocated: amount,
        currency: campaign.currency,
      },
    });
    lines.push(line);
  }

  // Update campaign allocated total
  const totalAllocated = lines.reduce((sum, l) => sum + l.budgetAllocated, 0);
  await db.campaign.update({
    where: { id: campaignId },
    data: { budgetAllocated: totalAllocated },
  });

  return lines;
}

/**
 * Calculate budget variance per category.
 */
export async function calculateBudgetVariance(campaignId: string) {
  const lines = await db.campaignBudgetLine.findMany({ where: { campaignId } });
  const campaign = await db.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    select: { totalBudget: true, currency: true },
  });

  const categories: Record<string, {
    allocated: number;
    committed: number;
    spent: number;
    variance: number;
    utilizationRate: number;
  }> = {};

  for (const line of lines) {
    if (!categories[line.category]) {
      categories[line.category] = {
        allocated: 0, committed: 0, spent: 0, variance: 0, utilizationRate: 0,
      };
    }
    const cat = categories[line.category]!;
    cat.allocated += line.budgetAllocated;
    cat.committed += line.budgetCommitted;
    cat.spent += line.budgetSpent;
  }

  // Calculate variance and utilization
  for (const cat of Object.values(categories)) {
    cat.variance = cat.allocated - cat.spent;
    cat.utilizationRate = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
  }

  const totalAllocated = Object.values(categories).reduce((s, c) => s + c.allocated, 0);
  const totalSpent = Object.values(categories).reduce((s, c) => s + c.spent, 0);

  return {
    totalBudget: campaign.totalBudget ?? 0,
    totalAllocated,
    totalSpent,
    totalVariance: (campaign.totalBudget ?? 0) - totalSpent,
    overallUtilization: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
    currency: campaign.currency,
    categories,
  };
}

/**
 * Forecast budget burn rate based on current spend velocity.
 */
export async function forecastBudgetBurn(campaignId: string) {
  const campaign = await db.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    select: {
      totalBudget: true, budgetSpent: true, startDate: true, endDate: true, currency: true,
    },
  });

  if (!campaign.startDate || !campaign.totalBudget) {
    return { burnRate: 0, projectedOverspend: 0, daysRemaining: null };
  }

  const now = new Date();
  const start = campaign.startDate;
  const end = campaign.endDate ?? new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const daysElapsed = Math.max(1, (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  const totalDays = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
  const daysRemaining = Math.max(0, (end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  const dailyBurnRate = campaign.budgetSpent / daysElapsed;
  const projectedTotalSpend = dailyBurnRate * totalDays;
  const projectedOverspend = projectedTotalSpend - campaign.totalBudget;

  return {
    dailyBurnRate,
    projectedTotalSpend,
    projectedOverspend,
    daysElapsed: Math.floor(daysElapsed),
    daysRemaining: Math.floor(daysRemaining),
    totalDays: Math.floor(totalDays),
    budgetHealthPercent: campaign.totalBudget > 0
      ? Math.max(0, 100 - (campaign.budgetSpent / campaign.totalBudget) * 100)
      : 0,
    currency: campaign.currency,
  };
}

/**
 * Get spend breakdown by action line (ATL/BTL/TTL).
 */
export async function getSpendByActionLine(campaignId: string) {
  const actions = await db.campaignAction.findMany({
    where: { campaignId },
    select: { actionLine: true, budgetAllocated: true, budgetSpent: true },
  });

  const byLine: Record<string, { allocated: number; spent: number; count: number }> = {};
  for (const a of actions) {
    if (!byLine[a.actionLine]) {
      byLine[a.actionLine] = { allocated: 0, spent: 0, count: 0 };
    }
    byLine[a.actionLine]!.allocated += a.budgetAllocated;
    byLine[a.actionLine]!.spent += a.budgetSpent;
    byLine[a.actionLine]!.count++;
  }

  return byLine;
}

/**
 * Calculate cost efficiency per KPI.
 */
export async function getCostPerKPI(campaignId: string) {
  const campaign = await db.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    select: { budgetSpent: true, kpiTargets: true, kpiResults: true, currency: true },
  });

  const results = campaign.kpiResults as Array<{ name: string; actual: number; unit: string }> | null;
  if (!results || results.length === 0) return [];

  return results.map((kpi) => ({
    name: kpi.name,
    actual: kpi.actual,
    unit: kpi.unit,
    costPer: kpi.actual > 0 ? campaign.budgetSpent / kpi.actual : 0,
    currency: campaign.currency,
  }));
}
