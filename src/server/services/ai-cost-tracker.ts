// =============================================================================
// MODULE 22 — AI Cost Tracker
// =============================================================================
// Tracks API usage costs per strategy/operation. Centralizes AI usage logging
// and cost calculation for all AI calls in the app. Maintains a model pricing
// table (USD per 1M tokens) and converts to XAF. Provides cost dashboards
// aggregated by mission, strategy, month, and generation type.
//
// Public API:
//   1. calculateCost()              — Calculate cost for model + token counts
//   2. logAIUsage()                 — Log an AI usage event
//   3. trackAICall()                — Calculate cost + log in one step
//   4. getCostSummaryByMission()    — Cost summary for a mission
//   5. getCostSummaryByStrategy()   — Cost summary for a strategy
//   6. getCostSummaryByMonth()      — Monthly cost breakdown for a user
//   7. getAgencyCostOverview()      — Agency-wide cost overview dashboard
//
// Dependencies:
//   - ~/server/db (Prisma — AIUsageLog)
//   - ~/lib/constants (USD_TO_XAF_RATE)
//   - ~/lib/types/phase3-schemas (LogAIUsageInput)
//
// Called by:
//   - All AI generation services (pillar generation, report, template, etc.)
//   - tRPC cost router (cost.summary, cost.overview)
//   - Admin dashboard
// =============================================================================

import { db } from "~/server/db";
import { USD_TO_XAF_RATE } from "~/lib/constants";
import type { LogAIUsageInput } from "~/lib/types/phase3-schemas";

// ============================================
// MODEL PRICING TABLE (USD per 1M tokens)
// ============================================

const MODEL_PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  "claude-sonnet-4-20250514": { inputPer1M: 3, outputPer1M: 15 },
  "claude-3-5-sonnet-20241022": { inputPer1M: 3, outputPer1M: 15 },
  "claude-3-5-haiku-20241022": { inputPer1M: 0.8, outputPer1M: 4 },
  "claude-3-haiku-20240307": { inputPer1M: 0.25, outputPer1M: 1.25 },
};

// Default pricing for unknown models
const DEFAULT_PRICING = { inputPer1M: 3, outputPer1M: 15 };

// ============================================
// COST CALCULATION
// ============================================

/**
 * Calculate the cost for a given model and token counts.
 */
export function calculateCost(
  model: string,
  tokensIn: number,
  tokensOut: number,
): { costUsd: number; costXaf: number } {
  const pricing = MODEL_PRICING[model] ?? DEFAULT_PRICING;
  const costUsd =
    (tokensIn / 1_000_000) * pricing.inputPer1M +
    (tokensOut / 1_000_000) * pricing.outputPer1M;
  const costXaf = costUsd * USD_TO_XAF_RATE;

  return {
    costUsd: Math.round(costUsd * 10000) / 10000, // 4 decimal places
    costXaf: Math.round(costXaf * 100) / 100, // 2 decimal places
  };
}

// ============================================
// LOGGING
// ============================================

/**
 * Log an AI usage event. Should be called after every AI generation.
 */
export async function logAIUsage(data: LogAIUsageInput, userId: string) {
  return db.aIUsageLog.create({
    data: {
      missionId: data.missionId,
      strategyId: data.strategyId,
      userId,
      generationType: data.generationType,
      model: data.model,
      tokensIn: data.tokensIn,
      tokensOut: data.tokensOut,
      costUsd: data.costUsd,
      costXaf: data.costXaf,
      durationMs: data.durationMs,
      metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
    },
  });
}

/**
 * Convenience: calculate cost and log in one step.
 */
export async function trackAICall(
  params: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    generationType: string;
    missionId?: string;
    strategyId?: string;
    durationMs?: number;
    metadata?: Record<string, unknown>;
  },
  userId: string,
) {
  const { costUsd, costXaf } = calculateCost(
    params.model,
    params.tokensIn,
    params.tokensOut,
  );

  return logAIUsage(
    {
      ...params,
      costUsd,
      costXaf,
    },
    userId,
  );
}

// ============================================
// DASHBOARDS
// ============================================

/**
 * Get cost summary for a specific mission.
 */
export async function getCostSummaryByMission(missionId: string) {
  const logs = await db.aIUsageLog.findMany({
    where: { missionId },
    orderBy: { createdAt: "desc" },
  });

  return aggregateCosts(logs);
}

/**
 * Get cost summary for a specific strategy.
 */
export async function getCostSummaryByStrategy(strategyId: string) {
  const logs = await db.aIUsageLog.findMany({
    where: { strategyId },
    orderBy: { createdAt: "desc" },
  });

  return aggregateCosts(logs);
}

/**
 * Get monthly cost breakdown for a user.
 */
export async function getCostSummaryByMonth(
  userId: string,
  year: number,
  month: number,
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const logs = await db.aIUsageLog.findMany({
    where: {
      userId,
      createdAt: { gte: startDate, lt: endDate },
    },
    orderBy: { createdAt: "desc" },
  });

  return aggregateCosts(logs);
}

/**
 * Get agency-wide cost overview for the dashboard.
 */
export async function getAgencyCostOverview(userId: string) {
  // All logs for this user's strategies
  const logs = await db.aIUsageLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const summary = aggregateCosts(logs);

  // Group by month
  const byMonth: Record<string, { costUsd: number; costXaf: number; count: number }> = {};
  for (const log of logs) {
    const monthKey = `${log.createdAt.getFullYear()}-${String(log.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { costUsd: 0, costXaf: 0, count: 0 };
    }
    byMonth[monthKey]!.costUsd += log.costUsd;
    byMonth[monthKey]!.costXaf += log.costXaf;
    byMonth[monthKey]!.count += 1;
  }

  // Group by generation type
  const byType: Record<string, { costUsd: number; costXaf: number; count: number }> = {};
  for (const log of logs) {
    if (!byType[log.generationType]) {
      byType[log.generationType] = { costUsd: 0, costXaf: 0, count: 0 };
    }
    byType[log.generationType]!.costUsd += log.costUsd;
    byType[log.generationType]!.costXaf += log.costXaf;
    byType[log.generationType]!.count += 1;
  }

  return {
    ...summary,
    byMonth: Object.entries(byMonth)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    byType: Object.entries(byType)
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.costUsd - a.costUsd),
  };
}

// ============================================
// HELPERS
// ============================================

interface AggregatedCosts {
  totalCostUsd: number;
  totalCostXaf: number;
  totalTokensIn: number;
  totalTokensOut: number;
  callCount: number;
  avgCostPerCall: number;
}

function aggregateCosts(
  logs: Array<{
    costUsd: number;
    costXaf: number;
    tokensIn: number;
    tokensOut: number;
  }>,
): AggregatedCosts {
  let totalCostUsd = 0;
  let totalCostXaf = 0;
  let totalTokensIn = 0;
  let totalTokensOut = 0;

  for (const log of logs) {
    totalCostUsd += log.costUsd;
    totalCostXaf += log.costXaf;
    totalTokensIn += log.tokensIn;
    totalTokensOut += log.tokensOut;
  }

  return {
    totalCostUsd: Math.round(totalCostUsd * 100) / 100,
    totalCostXaf: Math.round(totalCostXaf),
    totalTokensIn,
    totalTokensOut,
    callCount: logs.length,
    avgCostPerCall: logs.length > 0
      ? Math.round((totalCostUsd / logs.length) * 10000) / 10000
      : 0,
  };
}
