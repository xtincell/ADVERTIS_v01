// =============================================================================
// FW-21 — Value Capture Engine Handler
// =============================================================================
// Computes revenue model, pricing mechanics, 3 revenue scenarios, community
// monetization, and revenue mix targets.
// Inputs: V.productLadder, V.unitEconomics, FW-13.tierSegmentMap,
//         FW-13.monetizationMap, FW-08.segments, FW-10.attribution
// Outputs: VC.revenueModel, VC.pricingMechanics, VC.revenueScenarios,
//          VC.communityMonetization, VC.revenueMixTarget
// Category: hybrid (compute + AI enrichment)
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REVENUE_STREAM_TEMPLATES = [
  { id: "stream-core", name: "Produits / Services Core", type: "PRODUCT" as const, stages: ["FOLLOWER", "ENGAGED", "FAN"] as const, contribution: 40, scalability: "HIGH" as const },
  { id: "stream-premium", name: "Offres Premium", type: "SERVICE" as const, stages: ["FAN", "SUPERFAN"] as const, contribution: 25, scalability: "MEDIUM" as const },
  { id: "stream-community", name: "Revenus Communautaires", type: "COMMUNITY" as const, stages: ["ENGAGED", "FAN", "SUPERFAN", "EVANGELIST"] as const, contribution: 15, scalability: "HIGH" as const },
  { id: "stream-partnership", name: "Partenariats", type: "PARTNERSHIP" as const, stages: ["SUPERFAN", "EVANGELIST"] as const, contribution: 10, scalability: "MEDIUM" as const },
  { id: "stream-licensing", name: "Licensing & IP", type: "LICENSING" as const, stages: ["EVANGELIST"] as const, contribution: 10, scalability: "HIGH" as const },
];

const PRICING_STRATEGIES = [
  { id: "pricing-value", name: "Value-Based Core", strategy: "VALUE_BASED" as const, segment: "ENGAGED → FAN" },
  { id: "pricing-freemium", name: "Freemium Acquisition", strategy: "FREEMIUM" as const, segment: "AUDIENCE → FOLLOWER" },
  { id: "pricing-premium", name: "Premium Exclusif", strategy: "PREMIUM" as const, segment: "SUPERFAN → EVANGELIST" },
  { id: "pricing-tiered", name: "Tiered Access", strategy: "TIERED" as const, segment: "FOLLOWER → SUPERFAN" },
];

const COMMUNITY_MECHANISMS = [
  { id: "cm-membership", name: "Abonnement Communauté", mechanism: "MEMBERSHIP" as const, stage: "ENGAGED" as const, rpm: 15, curve: "LINEAR" as const },
  { id: "cm-marketplace", name: "Commission Marketplace", mechanism: "MARKETPLACE_FEE" as const, stage: "FAN" as const, rpm: 5, curve: "EXPONENTIAL" as const },
  { id: "cm-events", name: "Revenus Events", mechanism: "EVENT_REVENUE" as const, stage: "SUPERFAN" as const, rpm: 50, curve: "LINEAR" as const },
  { id: "cm-referral", name: "Commission Parrainage", mechanism: "REFERRAL_COMMISSION" as const, stage: "EVANGELIST" as const, rpm: 25, curve: "EXPONENTIAL" as const },
  { id: "cm-cocreation", name: "Royalties Co-Création", mechanism: "CO_CREATION_ROYALTY" as const, stage: "SUPERFAN" as const, rpm: 100, curve: "LOGARITHMIC" as const },
];

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
  try {
      // Resolve inputs
      const productLadder = ctx.inputs["V.productLadder"] as Record<string, unknown>[] | null;
      const _tierSegmentMap = ctx.inputs["XC.tierSegmentMap"] as Record<string, unknown>[] | null;
      const _monetizationMap = ctx.inputs["XC.monetizationMap"] as Record<string, unknown>[] | null;

      // Extract pricing data from product ladder if available
      const hasProductData = productLadder && productLadder.length > 0;
      const averagePrice = hasProductData
        ? productLadder.reduce((sum, p) => sum + (Number(p.prix) || Number(p.price) || 0), 0) / productLadder.length
        : 50000; // Default FCFA

      // Build revenue model
      const revenueModel = {
        primaryModel: hasProductData ? "HYBRID" as const : "DIRECT_SALES" as const,
        streams: REVENUE_STREAM_TEMPLATES.map((t) => ({
          id: t.id,
          name: t.name,
          type: t.type,
          description: `${t.name} — revenus provenant des stades ${t.stages.join(", ")}`,
          targetStages: [...t.stages],
          estimatedContribution: t.contribution,
          scalability: t.scalability,
          maturity: "CONCEPT" as const,
        })),
        diversificationScore: 65,
      };

      // Pricing mechanics
      const pricingMechanics = PRICING_STRATEGIES.map((s) => ({
        id: s.id,
        name: s.name,
        strategy: s.strategy,
        targetSegment: s.segment,
        priceRange: derivePriceRange(s.strategy, averagePrice),
        psychologicalAnchors: derivePriceAnchors(s.strategy),
        bundlingStrategy: s.strategy === "TIERED" ? "Bundle progressif par tier" : undefined,
      }));

      // Revenue scenarios
      const baseRevenue = averagePrice * 1000; // Rough year 1 estimate
      const revenueScenarios = [
        buildScenario("PESSIMISTIC", baseRevenue * 0.6),
        buildScenario("BASE", baseRevenue),
        buildScenario("OPTIMISTIC", baseRevenue * 1.5),
      ];

      // Community monetization
      const communityMonetization = COMMUNITY_MECHANISMS.map((cm) => ({
        id: cm.id,
        name: cm.name,
        mechanism: cm.mechanism,
        targetStage: cm.stage,
        estimatedRevenuePerMember: cm.rpm,
        scalingCurve: cm.curve,
        description: `${cm.name} — mécanisme ${cm.mechanism} pour les ${cm.stage}`,
      }));

      // Revenue mix targets
      const revenueMixTarget = REVENUE_STREAM_TEMPLATES.map((t) => ({
        streamId: t.id,
        streamName: t.name,
        currentPercent: 0,
        targetPercent12m: t.contribution,
        targetPercent36m: adjustTarget36m(t.type, t.contribution),
      }));

      return {
        success: true,
        data: {
          revenueModel,
          pricingMechanics,
          revenueScenarios,
          communityMonetization,
          revenueMixTarget,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {},
        error: error instanceof Error ? error.message : "FW-21 execution error",
      };
    }
}

registerFrameworkHandler("FW-21", execute);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function derivePriceRange(strategy: string, avgPrice: number): string {
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));
  switch (strategy) {
    case "FREEMIUM": return `Gratuit → ${fmt(avgPrice * 0.3)}`;
    case "VALUE_BASED": return `${fmt(avgPrice * 0.5)} → ${fmt(avgPrice * 1.5)}`;
    case "PREMIUM": return `${fmt(avgPrice * 2)} → ${fmt(avgPrice * 5)}`;
    case "TIERED": return `${fmt(avgPrice * 0.2)} → ${fmt(avgPrice * 3)}`;
    default: return `${fmt(avgPrice * 0.5)} → ${fmt(avgPrice * 2)}`;
  }
}

function derivePriceAnchors(strategy: string): string[] {
  switch (strategy) {
    case "FREEMIUM": return ["Valeur perçue du gratuit", "Effet de comparaison premium"];
    case "VALUE_BASED": return ["ROI démontrable", "Comparaison alternative"];
    case "PREMIUM": return ["Exclusivité", "Effet Veblen", "Rareté perçue"];
    case "TIERED": return ["Effet leurre (decoy)", "Ancrage du tier supérieur"];
    default: return ["Prix du marché"];
  }
}

function buildScenario(
  type: "PESSIMISTIC" | "BASE" | "OPTIMISTIC",
  yearRevenue: number,
): {
  type: "PESSIMISTIC" | "BASE" | "OPTIMISTIC";
  mrr12: number;
  arr12: number;
  totalYear1: number;
  totalYear3: number;
  assumptions: string[];
  risks: string[];
  ltvCacRatio: number;
} {
  const multiplier = type === "PESSIMISTIC" ? 0.6 : type === "OPTIMISTIC" ? 1.8 : 1;
  return {
    type,
    mrr12: Math.round(yearRevenue / 12),
    arr12: Math.round(yearRevenue),
    totalYear1: Math.round(yearRevenue * 0.7), // Ramp-up year 1
    totalYear3: Math.round(yearRevenue * 2.5 * multiplier),
    assumptions: type === "PESSIMISTIC"
      ? ["Adoption lente", "Marché compétitif saturé", "Budget marketing limité"]
      : type === "OPTIMISTIC"
        ? ["Adoption virale", "First-mover advantage", "Partenariats clés sécurisés"]
        : ["Croissance organique stable", "Budget marketing nominal", "Rétention moyenne"],
    risks: type === "PESSIMISTIC"
      ? ["Cash-flow négatif > 18 mois", "Impossibilité de pivoter"]
      : type === "OPTIMISTIC"
        ? ["Scaling prématuré", "Sur-promesse marché"]
        : ["Concurrence accrue", "Churn au-dessus des prévisions"],
    ltvCacRatio: type === "PESSIMISTIC" ? 1.5 : type === "OPTIMISTIC" ? 5.0 : 3.0,
  };
}

function adjustTarget36m(streamType: string, contribution12m: number): number {
  // Community and licensing streams should grow more over 3 years
  if (streamType === "COMMUNITY" || streamType === "LICENSING") {
    return Math.min(100, contribution12m * 1.5);
  }
  // Core product shrinks proportionally as other streams grow
  if (streamType === "PRODUCT") {
    return Math.max(20, contribution12m * 0.8);
  }
  return contribution12m;
}
