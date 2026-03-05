// =============================================================================
// FW-19 — Growth Mechanics Engine Handler
// =============================================================================
// Computes growth engine classification, flywheel loops, scaling breakpoints,
// Ansoff expansion matrix, and community monetization pathways.
// Inputs: FW-07.cultIndex, FW-08.segments, FW-10.attribution, FW-21.revenue
// Outputs: GM.growthEngine, GM.flywheel, GM.scalingBreakpoints,
//          GM.expansionMatrix, GM.communityMonetization
// Category: hybrid (compute + heuristic enrichment)
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";

// ---------------------------------------------------------------------------
// Constants — Flywheel Steps
// ---------------------------------------------------------------------------

const FLYWHEEL_STEPS = [
  {
    id: "fw-step-attract",
    order: 1,
    name: "Attract",
    action: "Générer de la visibilité et attirer de nouveaux prospects via contenu et campagnes",
    output: "Nouveaux visiteurs qualifiés",
    feedsInto: "fw-step-engage",
    accelerator: "SEO, campagnes virales, partenariats stratégiques",
  },
  {
    id: "fw-step-engage",
    order: 2,
    name: "Engage",
    action: "Nourrir la relation avec du contenu de valeur et des interactions personnalisées",
    output: "Leads engagés et communauté active",
    feedsInto: "fw-step-convert",
    accelerator: "Automatisation email, communauté, contenu interactif",
  },
  {
    id: "fw-step-convert",
    order: 3,
    name: "Convert",
    action: "Transformer les leads engagés en clients payants via une proposition de valeur claire",
    output: "Nouveaux clients et premiers revenus",
    feedsInto: "fw-step-delight",
    accelerator: "Offres personnalisées, social proof, urgence calibrée",
  },
  {
    id: "fw-step-delight",
    order: 4,
    name: "Delight",
    action: "Surpasser les attentes client pour maximiser la rétention et la satisfaction",
    output: "Clients fidèles à haute LTV",
    feedsInto: "fw-step-advocate",
    accelerator: "Onboarding premium, support proactif, surprises positives",
  },
  {
    id: "fw-step-advocate",
    order: 5,
    name: "Advocate",
    action: "Activer les clients satisfaits comme ambassadeurs générant du bouche-à-oreille",
    output: "Nouveaux prospects organiques via recommandations",
    feedsInto: "fw-step-attract",
    accelerator: "Programme parrainage, UGC, témoignages, rewards",
  },
];

// ---------------------------------------------------------------------------
// Constants — Scaling Breakpoints
// ---------------------------------------------------------------------------

const SCALING_BREAKPOINTS = [
  {
    id: "bp-1k",
    name: "Traction initiale",
    triggerMetric: "Utilisateurs actifs",
    triggerValue: 1000,
    actions: [
      "Valider product-market fit avec métriques qualitatives",
      "Établir les canaux d'acquisition core",
      "Mettre en place l'infrastructure analytics",
    ],
    risks: [
      "Churn élevé si la proposition de valeur est floue",
      "Dépendance à un seul canal d'acquisition",
    ],
    estimatedTimeline: "0 – 6 mois",
  },
  {
    id: "bp-10k",
    name: "Croissance accélérée",
    triggerMetric: "Utilisateurs actifs",
    triggerValue: 10000,
    actions: [
      "Automatiser l'onboarding et le support client",
      "Diversifier les canaux d'acquisition",
      "Structurer l'équipe growth avec rôles dédiés",
    ],
    risks: [
      "Dégradation de l'expérience utilisateur à l'échelle",
      "Burn-rate qui dépasse la croissance des revenus",
    ],
    estimatedTimeline: "6 – 18 mois",
  },
  {
    id: "bp-100k",
    name: "Échelle & maturité",
    triggerMetric: "Utilisateurs actifs",
    triggerValue: 100000,
    actions: [
      "Internationaliser ou diversifier les marchés",
      "Optimiser l'unit economics et la rentabilité par cohorte",
      "Mettre en place des partenariats stratégiques de distribution",
    ],
    risks: [
      "Complexité organisationnelle ralentissant l'innovation",
      "Pression concurrentielle accrue sur les marges",
    ],
    estimatedTimeline: "18 – 36 mois",
  },
];

// ---------------------------------------------------------------------------
// Constants — Ansoff Expansion Matrix
// ---------------------------------------------------------------------------

const EXPANSION_ENTRIES = [
  {
    quadrant: "MARKET_PENETRATION" as const,
    strategy: "Intensifier la part de marché existante via fidélisation, upsell et augmentation de fréquence d'achat",
    risk: "LOW" as const,
    priority: 1,
    estimatedRevenue: "Augmentation de 15-25% du revenu par client existant",
    timeToMarket: "1 – 3 mois",
  },
  {
    quadrant: "MARKET_DEVELOPMENT" as const,
    strategy: "Étendre vers de nouveaux segments géographiques ou démographiques avec l'offre actuelle",
    risk: "MEDIUM" as const,
    priority: 2,
    estimatedRevenue: "Ouverture de 20-40% de revenu additionnel sur nouveaux segments",
    timeToMarket: "3 – 9 mois",
  },
  {
    quadrant: "PRODUCT_DEVELOPMENT" as const,
    strategy: "Développer de nouvelles offres ou fonctionnalités pour la base client existante",
    risk: "HIGH" as const,
    priority: 3,
    estimatedRevenue: "Potentiel de 30-50% de revenus complémentaires à horizon 12 mois",
    timeToMarket: "6 – 12 mois",
  },
  {
    quadrant: "DIVERSIFICATION" as const,
    strategy: "Lancer une offre entièrement nouvelle vers un marché non exploré",
    risk: "VERY_HIGH" as const,
    priority: 4,
    estimatedRevenue: "Potentiel disruptif mais incertain — validation requise",
    timeToMarket: "12 – 24 mois",
  },
];

// ---------------------------------------------------------------------------
// Constants — Community Monetization
// ---------------------------------------------------------------------------

const COMMUNITY_MONETIZATION_TEMPLATES = [
  {
    id: "gm-cm-membership",
    mechanism: "Membership",
    segment: "Membres engagés de la communauté (ENGAGED → FAN)",
    revenuePerMember: 5000,
    scalability: "LINEAR" as const,
    description: "Abonnement communautaire récurrent offrant contenu exclusif, accès anticipé et statut privilégié",
  },
  {
    id: "gm-cm-marketplace",
    mechanism: "Marketplace",
    segment: "Créateurs et consommateurs actifs (FAN → SUPERFAN)",
    revenuePerMember: 2500,
    scalability: "EXPONENTIAL" as const,
    description: "Place de marché facilitant les échanges entre membres avec commission sur transactions",
  },
  {
    id: "gm-cm-events",
    mechanism: "Events",
    segment: "Superfans et évangélistes (SUPERFAN → EVANGELIST)",
    revenuePerMember: 25000,
    scalability: "LOGARITHMIC" as const,
    description: "Événements exclusifs (masterclass, meetups, conférences) monétisés via billetterie et sponsoring",
  },
];

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
  try {
    // -----------------------------------------------------------------
    // Resolve upstream inputs
    // -----------------------------------------------------------------
    const cultIndex = ctx.inputs["FW-07.cultIndex"] as number | null;
    const segments = ctx.inputs["FW-08.segments"] as Record<string, unknown>[] | null;
    const attribution = ctx.inputs["FW-10.attribution"] as Record<string, unknown> | null;
    const revenue = ctx.inputs["FW-21.revenue"] as Record<string, unknown> | null;

    // -----------------------------------------------------------------
    // 1. Growth Engine classification
    // -----------------------------------------------------------------
    const viralCoefficient = deriveViralCoefficient(cultIndex);
    const stickyRetention = deriveStickyRetention(segments);
    const paidCac = derivePaidCac(attribution);

    const primaryEngine = classifyPrimaryEngine(viralCoefficient, stickyRetention, paidCac);
    const blendedScore = computeBlendedScore(viralCoefficient, stickyRetention, paidCac);

    const growthEngine = {
      primaryEngine,
      viralCoefficient,
      stickyRetention,
      paidCac,
      blendedScore,
      recommendation: buildEngineRecommendation(primaryEngine, viralCoefficient, stickyRetention, paidCac),
    };

    // -----------------------------------------------------------------
    // 2. Flywheel — 5-step cycle
    // -----------------------------------------------------------------
    const flywheel = FLYWHEEL_STEPS.map((step) => ({ ...step }));

    // -----------------------------------------------------------------
    // 3. Scaling Breakpoints (3 milestones)
    // -----------------------------------------------------------------
    const currentUserEstimate = estimateCurrentUsers(segments);
    const scalingBreakpoints = SCALING_BREAKPOINTS.map((bp) => ({
      ...bp,
      currentValue: currentUserEstimate,
    }));

    // -----------------------------------------------------------------
    // 4. Ansoff Expansion Matrix (4 quadrants)
    // -----------------------------------------------------------------
    const expansionMatrix = EXPANSION_ENTRIES.map((entry) => ({ ...entry }));

    // -----------------------------------------------------------------
    // 5. Community Monetization (3 mechanisms)
    // -----------------------------------------------------------------
    const revenueScale = deriveRevenueScale(revenue);
    const communityMonetization = COMMUNITY_MONETIZATION_TEMPLATES.map((cm) => ({
      ...cm,
      revenuePerMember: Math.round(cm.revenuePerMember * revenueScale),
    }));

    return {
      success: true,
      data: {
        growthEngine,
        flywheel,
        scalingBreakpoints,
        expansionMatrix,
        communityMonetization,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {},
      error: error instanceof Error ? error.message : "FW-19 execution error",
    };
  }
}

registerFrameworkHandler("FW-19", execute);

// ---------------------------------------------------------------------------
// Helpers — Growth Engine derivation
// ---------------------------------------------------------------------------

/**
 * Derive viral coefficient from cult index.
 * Higher cult engagement produces a higher k-factor.
 * Default: 1.2 when no upstream data is available.
 */
function deriveViralCoefficient(cultIndex: number | null): number {
  if (cultIndex == null) return 1.2;
  // cultIndex is 0-100; map to 0.5 – 2.5 range
  return Math.round((0.5 + (cultIndex / 100) * 2.0) * 100) / 100;
}

/**
 * Derive sticky retention rate from segment data.
 * Default: 60% when no segment data is available.
 */
function deriveStickyRetention(segments: Record<string, unknown>[] | null): number {
  if (!segments || segments.length === 0) return 60;
  // Average loyalty-like score across segments, mapped to 0-100
  const loyaltyValues = segments.map(
    (s) => Number(s.loyalty ?? s.retention ?? s.engagementScore ?? 50),
  );
  const avg = loyaltyValues.reduce((a, b) => a + b, 0) / loyaltyValues.length;
  return Math.round(Math.min(100, Math.max(0, avg)));
}

/**
 * Derive paid CAC from attribution data.
 * Default: 15 000 FCFA when no attribution data is available.
 */
function derivePaidCac(attribution: Record<string, unknown> | null): number {
  if (!attribution) return 15000;
  const cac = Number(attribution.cac ?? attribution.customerAcquisitionCost ?? 15000);
  return Math.round(Math.max(0, cac));
}

/**
 * Classify which engine dominates based on metrics.
 */
function classifyPrimaryEngine(
  viral: number,
  retention: number,
  cac: number,
): "VIRAL" | "STICKY" | "PAID" {
  // Viral dominates when k > 1.0 and it outscores other signals
  const viralScore = viral > 1.0 ? (viral - 1.0) * 100 : 0;
  // Sticky dominates when retention is very high
  const stickyScore = retention > 50 ? (retention - 50) * 2 : 0;
  // Paid dominates when CAC is competitive (lower = better)
  const paidScore = cac < 20000 ? ((20000 - cac) / 20000) * 100 : 0;

  if (viralScore >= stickyScore && viralScore >= paidScore) return "VIRAL";
  if (stickyScore >= viralScore && stickyScore >= paidScore) return "STICKY";
  return "PAID";
}

/**
 * Compute a blended growth score (0-100) across all three engines.
 */
function computeBlendedScore(viral: number, retention: number, cac: number): number {
  const viralNorm = Math.min(100, Math.max(0, (viral / 2.0) * 100));
  const retentionNorm = Math.min(100, Math.max(0, retention));
  const cacNorm = Math.min(100, Math.max(0, ((30000 - cac) / 30000) * 100));
  return Math.round((viralNorm * 0.35 + retentionNorm * 0.40 + cacNorm * 0.25));
}

/**
 * Build a human-readable recommendation based on the primary engine.
 */
function buildEngineRecommendation(
  engine: "VIRAL" | "STICKY" | "PAID",
  viral: number,
  retention: number,
  cac: number,
): string {
  switch (engine) {
    case "VIRAL":
      return `Le moteur viral est dominant (k=${viral}). Priorité : amplifier les boucles de partage, ` +
        `activer le programme de parrainage et exploiter le contenu généré par les utilisateurs. ` +
        `Consolider la rétention (${retention}%) pour éviter le "leaky bucket".`;
    case "STICKY":
      return `Le moteur sticky est dominant (rétention=${retention}%). Priorité : renforcer les rituels ` +
        `d'engagement récurrent, améliorer l'onboarding et créer des habitudes produit. ` +
        `Explorer les leviers viraux (k=${viral}) pour accélérer l'acquisition organique.`;
    case "PAID":
      return `Le moteur paid est dominant (CAC=${new Intl.NumberFormat("fr-FR").format(cac)} FCFA). ` +
        `Priorité : optimiser les coûts d'acquisition, améliorer le ciblage et les créatives. ` +
        `Investir dans la rétention (${retention}%) et le viral (k=${viral}) pour réduire la dépendance au paid.`;
  }
}

// ---------------------------------------------------------------------------
// Helpers — Contextual estimations
// ---------------------------------------------------------------------------

/**
 * Estimate current user count from segment data.
 * Returns a rough estimate or 0 if no data is available.
 */
function estimateCurrentUsers(segments: Record<string, unknown>[] | null): number {
  if (!segments || segments.length === 0) return 0;
  return segments.reduce((total, s) => total + (Number(s.size ?? s.count ?? s.population ?? 0)), 0);
}

/**
 * Derive a revenue scaling factor from FW-21 revenue data.
 * Used to adjust community monetization estimates proportionally.
 */
function deriveRevenueScale(revenue: Record<string, unknown> | null): number {
  if (!revenue) return 1.0;
  const arr = Number(revenue.arr12 ?? revenue.totalYear1 ?? 0);
  if (arr <= 0) return 1.0;
  // Scale relative to a baseline of 50M FCFA ARR
  return Math.max(0.5, Math.min(3.0, arr / 50_000_000));
}
