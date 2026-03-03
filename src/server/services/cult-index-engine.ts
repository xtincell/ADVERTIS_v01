// =============================================================================
// SERVICE — Cult Index Engine
// Computes the proprietary Cult Index score for a brand.
// Formula: weighted sum of 7 engagement dimensions (0-100 each).
// =============================================================================

import { type CultIndexBreakdown, type CultIndexWeights, DEFAULT_CULT_WEIGHTS } from "~/lib/types/brand-os";
import type { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CultInputMetrics {
  // From SuperfanProfile aggregates
  totalCommunity: number;
  superfanCount: number;
  evangelistCount: number;
  avgEngagementDepth: number;
  totalUGC: number;
  totalDefenses: number;
  totalShares: number;
  totalReferrals: number;

  // From CommunitySnapshot (latest)
  retentionRate: number;
  activityRate: number;
  growthRate: number;

  // Velocity: new superfans in last 30 days vs previous 30 days
  newSuperfans30d: number;
  newSuperfansPrev30d: number;
}

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate each dimension score (0-100) from raw metrics.
 */
function computeDimensions(metrics: CultInputMetrics): Omit<CultIndexBreakdown, "cultIndex"> {
  const { totalCommunity, superfanCount, evangelistCount } = metrics;
  const safeCommunity = Math.max(totalCommunity, 1);

  // 1. Engagement Depth — average depth score across all profiles
  const engagementDepth = clamp(metrics.avgEngagementDepth);

  // 2. Superfan Velocity — growth acceleration of superfans
  //    Score 50 = stable, >50 = accelerating, <50 = decelerating
  const prevRate = metrics.newSuperfansPrev30d || 1;
  const velocityRatio = metrics.newSuperfans30d / prevRate;
  const superfanVelocity = clamp(
    velocityRatio >= 1
      ? 50 + Math.min(50, (velocityRatio - 1) * 50)
      : Math.max(0, velocityRatio * 50),
  );

  // 3. Community Cohesion — retention × activity (how tight is the community)
  const communityCohesion = clamp(
    (metrics.retentionRate * 0.6 + metrics.activityRate * 0.4) * 100,
  );

  // 4. Brand Defense Rate — % of superfans who actively defend the brand
  const defenderRatio = superfanCount > 0
    ? metrics.totalDefenses / (superfanCount * 3) // normalize: 3 defenses per superfan = 100%
    : 0;
  const brandDefenseRate = clamp(defenderRatio * 100);

  // 5. UGC Generation Rate — user content per 1000 community members
  const ugcPer1000 = (metrics.totalUGC / safeCommunity) * 1000;
  const ugcGenerationRate = clamp(Math.min(100, ugcPer1000 * 2)); // 50 UGC per 1000 = score 100

  // 6. Ritual Adoption — proxy: share frequency (regular sharing = ritual behavior)
  const sharesPer1000 = (metrics.totalShares / safeCommunity) * 1000;
  const ritualAdoption = clamp(Math.min(100, sharesPer1000));

  // 7. Evangelism Score — evangelist ratio + referral intensity
  const evangelistRatio = evangelistCount / safeCommunity;
  const referralIntensity = metrics.totalReferrals / Math.max(superfanCount, 1);
  const evangelismScore = clamp(
    (evangelistRatio * 500 + referralIntensity * 20) / 2,
  );

  return {
    engagementDepth,
    superfanVelocity,
    communityCohesion,
    brandDefenseRate,
    ugcGenerationRate,
    ritualAdoption,
    evangelismScore,
    superfanCount,
    totalCommunity,
  };
}

/**
 * Compute the final Cult Index from dimensions + weights.
 */
export function computeCultIndex(
  metrics: CultInputMetrics,
  weights: CultIndexWeights = DEFAULT_CULT_WEIGHTS,
): CultIndexBreakdown {
  const dims = computeDimensions(metrics);

  const cultIndex = clamp(Math.round(
    dims.engagementDepth * weights.engagementDepth +
    dims.superfanVelocity * weights.superfanVelocity +
    dims.communityCohesion * weights.communityCohesion +
    dims.brandDefenseRate * weights.brandDefenseRate +
    dims.ugcGenerationRate * weights.ugcGenerationRate +
    dims.ritualAdoption * weights.ritualAdoption +
    dims.evangelismScore * weights.evangelismScore,
  ));

  return { cultIndex, ...dims };
}

// ---------------------------------------------------------------------------
// Database-driven calculation
// ---------------------------------------------------------------------------

/**
 * Gather raw metrics from the database and compute the Cult Index for a strategy.
 */
export async function calculateCultIndexForStrategy(
  db: PrismaClient,
  strategyId: string,
): Promise<CultIndexBreakdown> {
  // Load custom weights if configured
  const config = await db.brandOSConfig.findUnique({
    where: { strategyId },
    select: { cultWeights: true },
  });
  const weights = (config?.cultWeights as CultIndexWeights | null) ?? DEFAULT_CULT_WEIGHTS;

  // Aggregate superfan profiles
  const profileAgg = await db.superfanProfile.aggregate({
    where: { strategyId },
    _count: true,
    _avg: { engagementDepth: true },
    _sum: {
      ugcCount: true,
      defenseCount: true,
      shareCount: true,
      referralCount: true,
    },
  });

  const superfanCount = await db.superfanProfile.count({
    where: { strategyId, segment: { in: ["SUPERFAN", "EVANGELIST"] } },
  });

  const evangelistCount = await db.superfanProfile.count({
    where: { strategyId, segment: "EVANGELIST" },
  });

  // Superfan velocity: new superfans promoted in last 30d vs previous 30d
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 86400000);
  const d60 = new Date(now.getTime() - 60 * 86400000);

  const newSuperfans30d = await db.superfanProfile.count({
    where: {
      strategyId,
      segment: { in: ["SUPERFAN", "EVANGELIST"] },
      promotedAt: { gte: d30 },
    },
  });
  const newSuperfansPrev30d = await db.superfanProfile.count({
    where: {
      strategyId,
      segment: { in: ["SUPERFAN", "EVANGELIST"] },
      promotedAt: { gte: d60, lt: d30 },
    },
  });

  // Latest community snapshot
  const latestSnapshot = await db.communitySnapshot.findFirst({
    where: { strategyId },
    orderBy: { createdAt: "desc" },
  });

  // Channel followers sum as totalCommunity fallback
  const channelAgg = await db.socialChannel.aggregate({
    where: { strategyId },
    _sum: { followers: true },
  });

  const totalCommunity = channelAgg._sum.followers ?? profileAgg._count ?? 0;

  const metrics: CultInputMetrics = {
    totalCommunity: Math.max(totalCommunity, 1),
    superfanCount,
    evangelistCount,
    avgEngagementDepth: profileAgg._avg.engagementDepth ?? 0,
    totalUGC: profileAgg._sum.ugcCount ?? 0,
    totalDefenses: profileAgg._sum.defenseCount ?? 0,
    totalShares: profileAgg._sum.shareCount ?? 0,
    totalReferrals: profileAgg._sum.referralCount ?? 0,
    retentionRate: latestSnapshot?.retentionRate ?? 0.5,
    activityRate: latestSnapshot?.activityRate ?? 0.3,
    growthRate: latestSnapshot?.growthRate ?? 0,
    newSuperfans30d,
    newSuperfansPrev30d,
  };

  return computeCultIndex(metrics, weights);
}
