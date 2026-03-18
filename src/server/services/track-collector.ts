// =============================================================================
// MODULE 13+ — Track Collector Service
// =============================================================================
//
// Deep data collection service with 3 layers:
//
//   LAYER 1 — Internal Collection (R-powered)
//     Aggregates scores, KPIs, campaigns, variables, budget health
//
//   LAYER 2 — External Connectors (T-powered)
//     Pluggable connector architecture for Google Trends, Social Listening,
//     Competitor Watch, Market Data imports
//
//   LAYER 3 — Feedback Loop
//     Post-campaign analysis → weight adjustment → score recalculation
//     KPI target vs actual → coefficient tuning → media-mix re-optimization
//
// PUBLIC API:
//   collectInternalData(strategyId) → InternalSnapshot
//   runExternalConnectors(strategyId) → ExternalSnapshot
//   runFeedbackLoop(strategyId, campaignId) → FeedbackResult
//   runFullCollection(strategyId) → CollectionResult
//   getCollectionStatus(strategyId) → CollectionStatus
//
// CALLED BY:
//   - cockpit.runTrackCollection (manual trigger)
//   - campaign-manager.transitionCampaign (on POST_CAMPAIGN)
//   - score-engine.recalculateAllScores (post-score hook)
//
// =============================================================================

import { db } from "~/server/db";
import { recalculateAllScores } from "./score-engine";
import { calculateMediaMix } from "./media-mix-calculator";
import {
  calculateParametricBudget,
  validateCommBudget,
} from "./budget-formula";

// ── Types ──

export interface InternalSnapshot {
  strategyId: string;
  timestamp: string;
  scores: {
    coherence: number | null;
    risk: number | null;
    bmf: number | null;
    invest: number | null;
  };
  scoreEvolution: {
    coherenceDelta: number | null;
    riskDelta: number | null;
    bmfDelta: number | null;
    investDelta: number | null;
    periodDays: number;
  };
  budgetHealth: {
    annualBudget: number | null;
    formulaBudget: number | null;
    deviationPct: number | null;
    status: string;
    commBudget: number | null;
    commPctCA: number | null;
  };
  pillarCompletion: Record<string, { status: string; version: number; hasContent: boolean }>;
  kpiSummary: {
    total: number;
    onTrack: number;
    atRisk: number;
    missed: number;
  };
  campaignSummary: {
    total: number;
    active: number;
    completed: number;
    totalBudget: number;
    totalSpent: number;
    burnRate: number;
  };
  signals: InternalSignal[];
}

export interface InternalSignal {
  type: "score_drop" | "budget_overrun" | "kpi_miss" | "pillar_stale" | "campaign_delayed";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
}

export interface ExternalConnectorConfig {
  name: string;
  type: "google_trends" | "social_listening" | "competitor_watch" | "market_data" | "custom";
  enabled: boolean;
  lastSyncedAt: string | null;
}

export interface ExternalDataPoint {
  source: string;
  category: string;
  key: string;
  value: number | string;
  trend: "up" | "down" | "stable";
  confidence: "high" | "medium" | "low";
  timestamp: string;
}

export interface ExternalSnapshot {
  connectors: ExternalConnectorConfig[];
  dataPoints: ExternalDataPoint[];
  competitorUpdates: Array<{
    name: string;
    change: string;
    impact: "positive" | "negative" | "neutral";
  }>;
  trendAlerts: Array<{
    trend: string;
    direction: "up" | "down";
    relevance: "high" | "medium" | "low";
  }>;
  timestamp: string;
}

export interface FeedbackResult {
  campaignId: string;
  campaignName: string;
  kpiComparison: Array<{
    name: string;
    target: number;
    actual: number;
    variance: number;
    unit: string;
  }>;
  roiComparison: {
    projected: number | null;
    actual: number | null;
    variance: number | null;
  };
  channelPerformance: Array<{
    channel: string;
    effectiveness: number; // 0-100
    recommendation: "boost" | "maintain" | "reduce" | "cut";
  }>;
  mediaMixAdjustments: Array<{
    channel: string;
    previousWeight: number;
    newWeight: number;
    reason: string;
  }>;
  budgetCoefficientUpdate: {
    previousBeta: number;
    newBeta: number;
    adjustmentReason: string;
  } | null;
  scoreDelta: {
    before: { coherence: number | null; invest: number | null };
    after: { coherence: number | null; invest: number | null };
  };
  learnings: string[];
}

export interface CollectionResult {
  internal: InternalSnapshot;
  external: ExternalSnapshot;
  feedbackApplied: boolean;
  timestamp: string;
}

export interface CollectionStatus {
  lastCollectedAt: string | null;
  isStale: boolean;
  staleSince: string | null;
  lastFeedbackAt: string | null;
  activeConnectors: number;
  totalSignals: number;
}

// ── Constants ──

const STALE_THRESHOLD_HOURS = 24;
const SCORE_DROP_THRESHOLD = 10; // points
const BUDGET_OVERRUN_THRESHOLD = 0.15; // 15%
const KPI_MISS_THRESHOLD = 0.20; // 20% below target

// ── LAYER 1: Internal Collection (R-powered) ──

export async function collectInternalData(
  strategyId: string,
): Promise<InternalSnapshot> {
  const now = new Date();

  // Load strategy with all relations
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    include: {
      pillars: {
        select: { type: true, status: true, version: true, content: true, updatedAt: true },
      },
    },
  });

  // 1. Current scores
  const latestSnapshot = await db.scoreSnapshot.findFirst({
    where: { strategyId },
    orderBy: { createdAt: "desc" },
  });

  const previousSnapshot = await db.scoreSnapshot.findFirst({
    where: { strategyId },
    orderBy: { createdAt: "desc" },
    skip: 1,
  });

  // Score evolution
  const periodDays = previousSnapshot
    ? Math.max(1, Math.round((now.getTime() - previousSnapshot.createdAt.getTime()) / 86400000))
    : 0;

  const scoreEvolution = {
    coherenceDelta:
      latestSnapshot && previousSnapshot
        ? latestSnapshot.coherenceScore - previousSnapshot.coherenceScore
        : null,
    riskDelta:
      latestSnapshot?.riskScore != null && previousSnapshot?.riskScore != null
        ? latestSnapshot.riskScore - previousSnapshot.riskScore
        : null,
    bmfDelta:
      latestSnapshot?.bmfScore != null && previousSnapshot?.bmfScore != null
        ? latestSnapshot.bmfScore - previousSnapshot.bmfScore
        : null,
    investDelta:
      latestSnapshot?.investScore != null && previousSnapshot?.investScore != null
        ? latestSnapshot.investScore - previousSnapshot.investScore
        : null,
    periodDays,
  };

  // 2. Budget health
  const budgetValidation = validateCommBudget(
    strategy.annualBudget,
    strategy.targetRevenue,
    strategy.sector,
    strategy.maturityProfile,
  );

  const formulaResult =
    strategy.targetRevenue && strategy.sector
      ? calculateParametricBudget(
          strategy.targetRevenue,
          strategy.sector,
          strategy.maturityProfile,
        )
      : null;

  const budgetHealth = {
    annualBudget: strategy.annualBudget,
    formulaBudget: budgetValidation.formulaBudget,
    deviationPct: budgetValidation.deviationPct,
    status: budgetValidation.status,
    commBudget: formulaResult?.commBudget ?? null,
    commPctCA: formulaResult?.commPourcentageCA ?? null,
  };

  // 3. Pillar completion map
  const pillarCompletion: Record<string, { status: string; version: number; hasContent: boolean }> = {};
  for (const p of strategy.pillars) {
    pillarCompletion[p.type] = {
      status: p.status,
      version: p.version,
      hasContent: p.content != null && Object.keys(p.content as Record<string, unknown>).length > 0,
    };
  }

  // 4. KPI summary from MetricThreshold
  const metrics = await db.metricThreshold.findMany({
    where: { strategyId },
  });

  let onTrack = 0;
  let atRisk = 0;
  let missed = 0;
  for (const m of metrics) {
    if (m.targetValue === 0) continue;
    const ratio = m.currentValue / m.targetValue;
    if (ratio >= 0.9) onTrack++;
    else if (ratio >= 1 - KPI_MISS_THRESHOLD) atRisk++;
    else missed++;
  }

  const kpiSummary = {
    total: metrics.length,
    onTrack,
    atRisk,
    missed,
  };

  // 5. Campaign summary
  const campaigns = await db.campaign.findMany({
    where: { strategyId, isTemplate: false },
    select: {
      status: true,
      totalBudget: true,
      budgetSpent: true,
    },
  });

  const activeCampaigns = campaigns.filter(
    (c) => !["ARCHIVED", "CANCELLED", "POST_CAMPAIGN"].includes(c.status),
  );
  const completedCampaigns = campaigns.filter(
    (c) => c.status === "POST_CAMPAIGN" || c.status === "ARCHIVED",
  );
  const totalBudget = campaigns.reduce((s, c) => s + (c.totalBudget ?? 0), 0);
  const totalSpent = campaigns.reduce((s, c) => s + (c.budgetSpent ?? 0), 0);

  const campaignSummary = {
    total: campaigns.length,
    active: activeCampaigns.length,
    completed: completedCampaigns.length,
    totalBudget,
    totalSpent,
    burnRate: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
  };

  // 6. Detect internal signals (weak signals, anomalies)
  const signals: InternalSignal[] = [];

  // Score drops
  if (scoreEvolution.coherenceDelta != null && scoreEvolution.coherenceDelta < -SCORE_DROP_THRESHOLD) {
    signals.push({
      type: "score_drop",
      severity: scoreEvolution.coherenceDelta < -20 ? "critical" : "high",
      message: `Score de cohérence en baisse de ${Math.abs(scoreEvolution.coherenceDelta)} pts`,
      metric: "coherence",
      value: latestSnapshot?.coherenceScore ?? 0,
      threshold: SCORE_DROP_THRESHOLD,
    });
  }

  if (scoreEvolution.bmfDelta != null && scoreEvolution.bmfDelta < -SCORE_DROP_THRESHOLD) {
    signals.push({
      type: "score_drop",
      severity: "high",
      message: `Brand-Market Fit en baisse de ${Math.abs(scoreEvolution.bmfDelta)} pts`,
      metric: "bmf",
      value: latestSnapshot?.bmfScore ?? 0,
    });
  }

  // Budget overruns
  for (const c of campaigns) {
    if (
      c.totalBudget &&
      c.budgetSpent > c.totalBudget * (1 + BUDGET_OVERRUN_THRESHOLD)
    ) {
      signals.push({
        type: "budget_overrun",
        severity: "high",
        message: `Dépassement budgétaire campagne (${Math.round((c.budgetSpent / c.totalBudget - 1) * 100)}%)`,
        value: c.budgetSpent,
        threshold: c.totalBudget,
      });
    }
  }

  // KPI misses
  for (const m of metrics) {
    if (m.targetValue > 0 && m.currentValue / m.targetValue < 1 - KPI_MISS_THRESHOLD) {
      signals.push({
        type: "kpi_miss",
        severity: "medium",
        message: `KPI "${m.metricLabel}" sous l'objectif (${Math.round(m.currentValue)}/${Math.round(m.targetValue)} ${m.unit})`,
        metric: m.metricKey,
        value: m.currentValue,
        threshold: m.targetValue,
      });
    }
  }

  // Stale pillars (not updated in 30+ days with status != complete)
  for (const p of strategy.pillars) {
    if (p.status !== "complete" && p.updatedAt) {
      const daysSince = Math.round(
        (now.getTime() - new Date(p.updatedAt).getTime()) / 86400000,
      );
      if (daysSince > 30) {
        signals.push({
          type: "pillar_stale",
          severity: "low",
          message: `Pilier ${p.type} incomplet depuis ${daysSince} jours`,
          metric: p.type,
        });
      }
    }
  }

  return {
    strategyId,
    timestamp: now.toISOString(),
    scores: {
      coherence: latestSnapshot?.coherenceScore ?? strategy.coherenceScore ?? null,
      risk: latestSnapshot?.riskScore ?? null,
      bmf: latestSnapshot?.bmfScore ?? null,
      invest: latestSnapshot?.investScore ?? null,
    },
    scoreEvolution,
    budgetHealth,
    pillarCompletion,
    kpiSummary,
    campaignSummary,
    signals,
  };
}

// ── LAYER 2: External Connectors (T-powered) ──

/**
 * ExternalConnector interface — pluggable architecture for external data sources.
 * Each connector implements fetch() which returns structured data points.
 */
export interface ExternalConnector {
  name: string;
  type: ExternalConnectorConfig["type"];
  isAvailable(): boolean;
  fetch(strategyId: string, context: ConnectorContext): Promise<ExternalDataPoint[]>;
}

interface ConnectorContext {
  sector: string | null;
  brandName: string;
  competitors: string[];
  channels: string[];
}

// ── Built-in connectors ──

/**
 * Competitor Watch connector
 * Monitors CompetitorSnapshot changes and detects significant moves.
 */
const competitorWatchConnector: ExternalConnector = {
  name: "Competitor Watch",
  type: "competitor_watch",
  isAvailable: () => true, // Always available (uses internal DB)
  async fetch(strategyId: string): Promise<ExternalDataPoint[]> {
    const snapshots = await db.competitorSnapshot.findMany({
      where: { strategyId },
      orderBy: { lastUpdated: "desc" },
    });

    return snapshots.map((s) => ({
      source: "competitor_watch",
      category: "competitor",
      key: s.name,
      value: s.positioning ?? "unknown",
      trend: "stable" as const,
      confidence: "medium" as const,
      timestamp: s.lastUpdated.toISOString(),
    }));
  },
};

/**
 * Market Data connector (manual import)
 * Reads from OpportunityCalendar entries tagged as market data.
 */
const marketDataConnector: ExternalConnector = {
  name: "Market Data",
  type: "market_data",
  isAvailable: () => true,
  async fetch(strategyId: string): Promise<ExternalDataPoint[]> {
    const opportunities = await db.opportunityCalendar.findMany({
      where: { strategyId },
      orderBy: { startDate: "desc" },
      take: 50,
    });

    return opportunities.map((o) => ({
      source: "market_data",
      category: o.type,
      key: o.title,
      value: o.impact,
      trend: "stable" as const,
      confidence: "medium" as const,
      timestamp: o.startDate.toISOString(),
    }));
  },
};

/**
 * Google Trends connector (placeholder)
 * When API key is configured, fetches interest-over-time for brand + competitors.
 */
const googleTrendsConnector: ExternalConnector = {
  name: "Google Trends",
  type: "google_trends",
  isAvailable: () => !!process.env.GOOGLE_TRENDS_API_KEY,
  async fetch(
    _strategyId: string,
    context: ConnectorContext,
  ): Promise<ExternalDataPoint[]> {
    // Placeholder: when Google Trends API is configured, fetch here
    // For now, return empty — the connector architecture is ready
    const points: ExternalDataPoint[] = [];

    if (!process.env.GOOGLE_TRENDS_API_KEY) return points;

    // Future implementation:
    // const trends = await fetchGoogleTrends(context.brandName, context.competitors);
    // Transform to ExternalDataPoint[]
    console.log(
      `[Track Collector] Google Trends: would fetch for "${context.brandName}" + ${context.competitors.length} competitors`,
    );

    return points;
  },
};

/**
 * Social Listening connector (placeholder)
 * When configured, pulls engagement metrics from Meta/Instagram/TikTok.
 */
const socialListeningConnector: ExternalConnector = {
  name: "Social Listening",
  type: "social_listening",
  isAvailable: () =>
    !!(process.env.META_ACCESS_TOKEN ?? process.env.SOCIAL_LISTENING_API_KEY),
  async fetch(
    _strategyId: string,
    context: ConnectorContext,
  ): Promise<ExternalDataPoint[]> {
    const points: ExternalDataPoint[] = [];

    if (!process.env.META_ACCESS_TOKEN && !process.env.SOCIAL_LISTENING_API_KEY) {
      return points;
    }

    // Future implementation:
    // const insights = await fetchMetaInsights(context.brandName);
    // const tiktokData = await fetchTikTokAnalytics(context.brandName);
    console.log(
      `[Track Collector] Social Listening: would fetch for "${context.brandName}"`,
    );

    return points;
  },
};

// Registry of all connectors
const CONNECTORS: ExternalConnector[] = [
  competitorWatchConnector,
  marketDataConnector,
  googleTrendsConnector,
  socialListeningConnector,
];

/**
 * Register a custom external connector at runtime.
 */
export function registerConnector(connector: ExternalConnector): void {
  CONNECTORS.push(connector);
}

export async function runExternalConnectors(
  strategyId: string,
): Promise<ExternalSnapshot> {
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    select: {
      brandName: true,
      sector: true,
      pillars: {
        where: { type: "E" },
        select: { content: true },
      },
    },
  });

  // Load competitor names
  const competitors = await db.competitorSnapshot.findMany({
    where: { strategyId },
    select: { name: true },
  });

  // Extract channels from E pillar
  const ePillar = strategy.pillars[0];
  let channels: string[] = [];
  if (ePillar?.content && typeof ePillar.content === "object") {
    const content = ePillar.content as Record<string, unknown>;
    const touchpoints = content.touchpoints;
    if (Array.isArray(touchpoints)) {
      channels = touchpoints
        .filter((t): t is { canal: string } => !!t && typeof t === "object" && "canal" in t)
        .map((t) => t.canal);
    }
  }

  const context: ConnectorContext = {
    sector: strategy.sector,
    brandName: strategy.brandName,
    competitors: competitors.map((c) => c.name),
    channels,
  };

  // Run all available connectors
  const allDataPoints: ExternalDataPoint[] = [];
  const connectorConfigs: ExternalConnectorConfig[] = [];

  for (const connector of CONNECTORS) {
    const available = connector.isAvailable();
    connectorConfigs.push({
      name: connector.name,
      type: connector.type,
      enabled: available,
      lastSyncedAt: available ? new Date().toISOString() : null,
    });

    if (available) {
      try {
        const points = await connector.fetch(strategyId, context);
        allDataPoints.push(...points);
      } catch (err) {
        console.error(`[Track Collector] Connector "${connector.name}" failed:`, err);
      }
    }
  }

  // Derive competitor updates from data points
  const competitorUpdates = allDataPoints
    .filter((p) => p.source === "competitor_watch")
    .map((p) => ({
      name: p.key,
      change: typeof p.value === "string" ? p.value : String(p.value),
      impact: "neutral" as const,
    }));

  // Derive trend alerts from market data
  const trendAlerts = allDataPoints
    .filter((p) => p.source === "market_data" && p.category === "PREDICTIVE")
    .map((p) => ({
      trend: p.key,
      direction: p.trend === "down" ? ("down" as const) : ("up" as const),
      relevance: p.confidence === "high" ? ("high" as const) : ("medium" as const),
    }));

  return {
    connectors: connectorConfigs,
    dataPoints: allDataPoints,
    competitorUpdates,
    trendAlerts,
    timestamp: new Date().toISOString(),
  };
}

// ── LAYER 3: Feedback Loop ──

/**
 * Run the feedback loop for a completed campaign.
 * Compares KPI targets vs actuals, adjusts media-mix weights,
 * updates budget coefficients, and triggers score recalculation.
 */
export async function runFeedbackLoop(
  strategyId: string,
  campaignId: string,
): Promise<FeedbackResult> {
  // 1. Load campaign with amplifications (media buying data for channel analysis)
  const campaign = await db.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: {
      amplifications: {
        select: {
          mediaType: true,
          platform: true,
          totalCost: true,
          impressions: true,
          clicks: true,
          conversions: true,
          ctr: true,
          conversionRate: true,
        },
      },
    },
  });

  if (campaign.strategyId !== strategyId) {
    throw new Error("Campaign does not belong to this strategy");
  }

  // 2. KPI comparison
  const kpiTargets = (campaign.kpiTargets ?? []) as Array<{
    name: string;
    target: number;
    unit: string;
  }>;
  const kpiResults = (campaign.kpiResults ?? []) as Array<{
    name: string;
    actual: number;
    unit: string;
    variance?: number;
  }>;

  const kpiComparison = kpiTargets.map((target) => {
    const result = kpiResults.find((r) => r.name === target.name);
    const actual = result?.actual ?? 0;
    const variance = target.target > 0
      ? Math.round(((actual - target.target) / target.target) * 100)
      : 0;
    return {
      name: target.name,
      target: target.target,
      actual,
      variance,
      unit: target.unit,
    };
  });

  // 3. ROI comparison
  const roiComparison = {
    projected: campaign.roiTarget,
    actual: campaign.roiActual,
    variance:
      campaign.roiTarget != null && campaign.roiActual != null
        ? Math.round(((campaign.roiActual - campaign.roiTarget) / campaign.roiTarget) * 100)
        : null,
  };

  // 4. Channel performance analysis from executions
  const channelPerformance: FeedbackResult["channelPerformance"] = [];
  const mediaMixAdjustments: FeedbackResult["mediaMixAdjustments"] = [];

  // Get current media mix for comparison
  let currentMediaMix: Awaited<ReturnType<typeof calculateMediaMix>> | null = null;
  try {
    currentMediaMix = await calculateMediaMix(strategyId);
  } catch {
    // Non-blocking
  }

  // Group amplifications by mediaType for channel-level analysis
  const channelMap = new Map<string, {
    totalSpend: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>();

  for (const amp of campaign.amplifications) {
    const channel = amp.platform ?? amp.mediaType;
    const existing = channelMap.get(channel) ?? {
      totalSpend: 0, impressions: 0, clicks: 0, conversions: 0,
    };
    existing.totalSpend += amp.totalCost;
    existing.impressions += amp.impressions ?? 0;
    existing.clicks += amp.clicks ?? 0;
    existing.conversions += amp.conversions ?? 0;
    channelMap.set(channel, existing);
  }

  for (const [channel, metrics] of channelMap) {
    // Effectiveness heuristic: weighted score from CTR, conversion rate, cost efficiency
    const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
    const cvr = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;
    const effectiveness = Math.min(
      100,
      Math.round(
        (Math.min(ctr * 10, 40)) + // CTR component (max 40)
        (Math.min(cvr * 5, 40)) + // Conversion component (max 40)
        (metrics.conversions > 0 ? 20 : metrics.clicks > 0 ? 10 : 0), // Activity bonus
      ),
    );

    const recommendation =
      effectiveness >= 80
        ? "boost"
        : effectiveness >= 50
          ? "maintain"
          : effectiveness >= 30
            ? "reduce"
            : "cut";

    channelPerformance.push({ channel, effectiveness, recommendation });

    // Media mix adjustment: if we have current allocations, suggest changes
    if (currentMediaMix) {
      const currentAlloc = currentMediaMix.allocations.find(
        (a) => a.channel.toLowerCase() === channel.toLowerCase(),
      );
      if (currentAlloc) {
        const weightMultiplier =
          recommendation === "boost"
            ? 1.15
            : recommendation === "maintain"
              ? 1.0
              : recommendation === "reduce"
                ? 0.85
                : 0.5;

        const newWeight = Math.round(currentAlloc.budgetPercent * weightMultiplier * 10) / 10;

        if (Math.abs(newWeight - currentAlloc.budgetPercent) > 0.5) {
          mediaMixAdjustments.push({
            channel,
            previousWeight: currentAlloc.budgetPercent,
            newWeight,
            reason:
              recommendation === "boost"
                ? `Performance élevée (${effectiveness}/100) → augmenter`
                : recommendation === "reduce"
                  ? `Performance faible (${effectiveness}/100) → réduire`
                  : `Performance très faible (${effectiveness}/100) → couper`,
          });
        }
      }
    }
  }

  // 5. Budget coefficient update
  // If ROI significantly differs from target, adjust maturity beta
  let budgetCoefficientUpdate: FeedbackResult["budgetCoefficientUpdate"] = null;

  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    select: { maturityProfile: true, targetRevenue: true, sector: true },
  });

  if (
    roiComparison.variance != null &&
    Math.abs(roiComparison.variance) > 15 &&
    strategy.targetRevenue &&
    strategy.sector
  ) {
    const currentFormula = calculateParametricBudget(
      strategy.targetRevenue,
      strategy.sector,
      strategy.maturityProfile,
    );

    // Derive a beta adjustment: if ROI was better than expected, we can invest less
    // If ROI was worse, we should invest more
    const adjustmentFactor =
      roiComparison.variance > 0
        ? 0.95 // Positive ROI → slightly reduce beta (efficient)
        : 1.05; // Negative ROI → slightly increase beta (need more investment)

    // We don't directly modify the formula constants (they're static),
    // but we log the recommendation for the strategist
    const currentBeta = currentFormula.postes[0]?.beta ?? 1.0;
    budgetCoefficientUpdate = {
      previousBeta: currentBeta,
      newBeta: Math.round(currentBeta * adjustmentFactor * 100) / 100,
      adjustmentReason:
        roiComparison.variance > 0
          ? `ROI supérieur aux attentes (+${roiComparison.variance}%) → budget optimal, possibilité de réduire`
          : `ROI inférieur aux attentes (${roiComparison.variance}%) → envisager d'augmenter l'investissement`,
    };
  }

  // 6. Generate learnings
  const learnings: string[] = [];

  const overperforming = channelPerformance.filter((c) => c.recommendation === "boost");
  const underperforming = channelPerformance.filter(
    (c) => c.recommendation === "reduce" || c.recommendation === "cut",
  );

  if (overperforming.length > 0) {
    learnings.push(
      `Canaux performants : ${overperforming.map((c) => c.channel).join(", ")} — augmenter l'allocation`,
    );
  }
  if (underperforming.length > 0) {
    learnings.push(
      `Canaux sous-performants : ${underperforming.map((c) => c.channel).join(", ")} — réduire ou réaffecter`,
    );
  }

  const kpiMisses = kpiComparison.filter((k) => k.variance < -20);
  if (kpiMisses.length > 0) {
    learnings.push(
      `KPIs manqués significativement : ${kpiMisses.map((k) => `${k.name} (${k.variance}%)`).join(", ")}`,
    );
  }

  const kpiWins = kpiComparison.filter((k) => k.variance > 20);
  if (kpiWins.length > 0) {
    learnings.push(
      `KPIs dépassés : ${kpiWins.map((k) => `${k.name} (+${k.variance}%)`).join(", ")}`,
    );
  }

  if (campaign.totalBudget && campaign.budgetSpent > campaign.totalBudget * 1.1) {
    learnings.push(
      `Dépassement budgétaire de ${Math.round(((campaign.budgetSpent / campaign.totalBudget) - 1) * 100)}% — revoir les postes budgétaires`,
    );
  }

  // 7. Trigger score recalculation with fresh data
  const scoresBefore = {
    coherence: (await db.strategy.findUnique({
      where: { id: strategyId },
      select: { coherenceScore: true },
    }))?.coherenceScore ?? null,
    invest: null as number | null,
  };

  // Recalculate scores to incorporate feedback
  const newScores = await recalculateAllScores(strategyId, "manual");

  const scoresAfter = {
    coherence: newScores.coherenceScore,
    invest: newScores.investScore ?? null,
  };

  // 8. Persist feedback as a ScoreSnapshot
  await db.scoreSnapshot.create({
    data: {
      strategyId,
      coherenceScore: newScores.coherenceScore,
      riskScore: newScores.riskScore,
      bmfScore: newScores.bmfScore,
      investScore: newScores.investScore,
      trigger: "feedback_loop",
    },
  });

  // 9. Update T pillar with learnings (append to marketReality.weakSignals)
  const tPillar = await db.pillar.findFirst({
    where: { strategyId, type: "T" },
  });

  if (tPillar?.content && typeof tPillar.content === "object") {
    const tContent = { ...(tPillar.content as Record<string, unknown>) };
    const marketReality = (tContent.marketReality ?? {}) as Record<string, unknown>;
    const existingSignals = Array.isArray(marketReality.weakSignals)
      ? (marketReality.weakSignals as string[])
      : [];

    // Add feedback learnings as new weak signals
    const newSignals = learnings.map(
      (l) => `[Feedback ${campaign.name}] ${l}`,
    );

    tContent.marketReality = {
      ...marketReality,
      weakSignals: [...existingSignals, ...newSignals].slice(-20), // Keep last 20
    };

    await db.pillar.update({
      where: { id: tPillar.id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { content: tContent as any },
    });
  }

  console.log(
    `[Track Collector] Feedback loop completed for campaign "${campaign.name}" (${campaignId})`,
  );

  return {
    campaignId,
    campaignName: campaign.name,
    kpiComparison,
    roiComparison,
    channelPerformance,
    mediaMixAdjustments,
    budgetCoefficientUpdate,
    scoreDelta: { before: scoresBefore, after: scoresAfter },
    learnings,
  };
}

// ── ORCHESTRATION ──

/**
 * Run full collection: internal + external + optional feedback.
 */
export async function runFullCollection(
  strategyId: string,
): Promise<CollectionResult> {
  const [internal, external] = await Promise.all([
    collectInternalData(strategyId),
    runExternalConnectors(strategyId),
  ]);

  // Check for recently completed campaigns that need feedback
  let feedbackApplied = false;
  const recentPostCampaigns = await db.campaign.findMany({
    where: {
      strategyId,
      status: "POST_CAMPAIGN",
      isTemplate: false,
      // Only campaigns transitioned to POST_CAMPAIGN in the last 7 days
      updatedAt: { gte: new Date(Date.now() - 7 * 86400000) },
    },
    select: { id: true },
    take: 5,
  });

  for (const campaign of recentPostCampaigns) {
    try {
      await runFeedbackLoop(strategyId, campaign.id);
      feedbackApplied = true;
    } catch (err) {
      console.error(
        `[Track Collector] Feedback loop failed for campaign ${campaign.id}:`,
        err,
      );
    }
  }

  return {
    internal,
    external,
    feedbackApplied,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get collection status for a strategy.
 */
export async function getCollectionStatus(
  strategyId: string,
): Promise<CollectionStatus> {
  // Last score snapshot = proxy for last collection
  const lastSnapshot = await db.scoreSnapshot.findFirst({
    where: { strategyId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, trigger: true },
  });

  const lastFeedback = await db.scoreSnapshot.findFirst({
    where: { strategyId, trigger: "feedback_loop" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const now = new Date();
  const lastCollectedAt = lastSnapshot?.createdAt ?? null;
  const hoursSinceCollection = lastCollectedAt
    ? (now.getTime() - lastCollectedAt.getTime()) / 3600000
    : Infinity;

  const isStale = hoursSinceCollection > STALE_THRESHOLD_HOURS;

  // Count active connectors
  const activeConnectors = CONNECTORS.filter((c) => c.isAvailable()).length;

  // Count recent signals (quick check from metrics where current < target)
  const allMetrics = await db.metricThreshold.findMany({
    where: { strategyId },
    select: { currentValue: true, targetValue: true },
  });
  const atRiskCount = allMetrics.filter(
    (m) => m.targetValue > 0 && m.currentValue < m.targetValue * 0.8,
  ).length;

  return {
    lastCollectedAt: lastCollectedAt?.toISOString() ?? null,
    isStale,
    staleSince: isStale && lastCollectedAt ? lastCollectedAt.toISOString() : null,
    lastFeedbackAt: lastFeedback?.createdAt.toISOString() ?? null,
    activeConnectors,
    totalSignals: atRiskCount,
  };
}
