// =============================================================================
// FW-13 — Value Exchange Design Handler
// =============================================================================
// Hybrid framework: designs the transaction as ritual.
// Inputs: V (productLadder, catalogue), E (gamification), FW-11, FW-12,
//         FW-08 (segments), FW-20 (sacredArtifacts)
// Outputs: XC.tierSegmentMap, XC.transactionRituals, XC.belongingSignals,
//          XC.exclusivityGradient, XC.monetizationMap
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";
import { SUPERFAN_STAGES } from "~/lib/types/frameworks/framework-descriptor";

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
  try {
    // Resolve inputs
    const productLadder = ctx.inputs["V.productLadder"] as Record<string, unknown>[] | null;
    const catalogue = ctx.inputs["V.catalogue"] as Record<string, unknown>[] | null;
    const gamification = ctx.inputs["E.gamification"] as Record<string, unknown> | null;
    const sacredArtifacts = ctx.inputs["MA.sacredArtifacts"] as Record<string, unknown>[] | null;
    const transitionMap = ctx.inputs["XA.transitionMap"] as Record<string, unknown>[] | null;
    const _narrativeArc = ctx.inputs["XB.narrativeArc"] as Record<string, unknown>[] | null;

    // Build tier-segment map
    const tierSegmentMap = SUPERFAN_STAGES.map((stage, idx) => ({
      stage,
      tier: TIER_NAMES[idx]!,
      priceRange: PRICE_RANGES[idx]!,
      accessLevel: ACCESS_LEVELS[idx]! as "PUBLIC" | "MEMBER" | "VIP" | "INNER_CIRCLE" | "SACRED",
      keyBenefits: deriveBenefits(stage, productLadder, catalogue),
      conversionTrigger: transitionMap?.[idx]
        ? String((transitionMap[idx] as Record<string, unknown>).triggerCondition ?? `Trigger ${stage}`)
        : `Accès au tier ${TIER_NAMES[idx]!}`,
      retentionMechanic: RETENTION_MECHANICS[idx]!,
    }));

    // Transaction rituals
    const transactionRituals = generateRituals(sacredArtifacts, gamification);

    // Belonging signals
    const belongingSignals = generateBelongingSignals(sacredArtifacts);

    // Exclusivity gradient
    const exclusivityGradient = SUPERFAN_STAGES.map((stage, idx) => ({
      stage,
      exclusivityLevel: Math.min(100, idx * 20),
      accessGates: GATES[idx]!,
      limitedEditions: idx >= 3,
      communitySize: COMMUNITY_SIZES[idx]!,
      scarcityMechanics: SCARCITY[idx]!,
    }));

    // Monetization map
    const monetizationMap = generateMonetizationStreams(productLadder, catalogue);

    return {
      success: true,
      data: {
        "XC.tierSegmentMap": tierSegmentMap,
        "XC.transactionRituals": transactionRituals,
        "XC.belongingSignals": belongingSignals,
        "XC.exclusivityGradient": exclusivityGradient,
        "XC.monetizationMap": monetizationMap,
      },
    };
  } catch (err) {
    return {
      success: false,
      data: {},
      error: err instanceof Error ? err.message : "Erreur FW-13",
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TIER_NAMES = [
  "Découverte",
  "Essentiel",
  "Premium",
  "Exclusif",
  "Cercle Sacré",
  "Conseil des Gardiens",
];

const PRICE_RANGES = [
  "Gratuit",
  "Entrée de gamme",
  "Milieu de gamme",
  "Haut de gamme",
  "Sur invitation",
  "Co-création",
];

const ACCESS_LEVELS = [
  "PUBLIC",
  "MEMBER",
  "VIP",
  "VIP",
  "INNER_CIRCLE",
  "SACRED",
] as const;

const RETENTION_MECHANICS = [
  "Contenu gratuit récurrent",
  "Avantages membre + points fidélité",
  "Expériences exclusives + early access",
  "Co-création + reconnaissance publique",
  "Accès direct au fondateur + rôle consultatif",
  "Equity symbolique + héritage de marque",
];

const GATES: string[][] = [
  ["Aucune barrière"],
  ["Inscription"],
  ["Premier achat"],
  ["3+ achats", "Engagement communautaire"],
  ["Invitation pair", "Track record advocacy"],
  ["Sélection par les pairs", "Contribution majeure"],
];

const COMMUNITY_SIZES = [
  "Illimité",
  "10 000+",
  "1 000-10 000",
  "100-1 000",
  "10-100",
  "< 10",
];

const SCARCITY = [
  "Aucune",
  "Offres temporaires",
  "Éditions limitées saisonnières",
  "Drops exclusifs, quantités limitées",
  "Sur mesure, pièces uniques",
  "Artefacts sacrés, non-reproductibles",
];

function deriveBenefits(
  stage: string,
  productLadder: Record<string, unknown>[] | null,
  _catalogue: Record<string, unknown>[] | null,
): string[] {
  const baseBenefits: Record<string, string[]> = {
    AUDIENCE: ["Contenu gratuit", "Newsletter"],
    FOLLOWER: ["Réductions bienvenue", "Accès communauté"],
    ENGAGED: ["Offres exclusives", "Events VIP", "Support prioritaire"],
    FAN: ["Co-création produit", "Early access", "Badge ambassadeur"],
    SUPERFAN: ["Cercle privé", "Mentorat", "Produits co-signés"],
    EVANGELIST: ["Advisory board", "Revenue share", "Legacy naming"],
  };

  const benefits = baseBenefits[stage] ?? ["Accès standard"];

  if (productLadder && productLadder.length > 0) {
    benefits.push("Accès produits dédiés");
  }

  return benefits;
}

function generateRituals(
  sacredArtifacts: Record<string, unknown>[] | null,
  _gamification: Record<string, unknown> | null,
): Array<Record<string, unknown>> {
  const rituals = [
    {
      id: "ritual-welcome",
      name: "Rituel de Bienvenue",
      stage: "FOLLOWER",
      type: "INITIATION",
      description: "Cérémonie d'accueil pour les nouveaux membres",
      emotionalPayoff: "Sentiment d'appartenance immédiat",
      touchpoints: ["Email", "App", "Package physique"],
      unboxingExperience: "Lettre personnalisée + premier artefact",
    },
    {
      id: "ritual-upgrade",
      name: "Ascension de Tier",
      stage: "ENGAGED",
      type: "UPGRADE",
      description: "Célébration du passage au tier supérieur",
      emotionalPayoff: "Fierté de la progression",
      touchpoints: ["Notification", "Badge", "Communauté"],
    },
    {
      id: "ritual-renewal",
      name: "Renouvellement Sacré",
      stage: "FAN",
      type: "RENEWAL",
      description: "Rituel annuel de renouvellement d'engagement",
      emotionalPayoff: "Réaffirmation de l'engagement mutuel",
      touchpoints: ["Email", "Gift", "Call"],
    },
    {
      id: "ritual-gifting",
      name: "Le Don Tribal",
      stage: "SUPERFAN",
      type: "GIFTING",
      description: "Offrir l'expérience à un proche pour l'initier",
      emotionalPayoff: "Générosité et transmission",
      touchpoints: ["Gift card", "Invitation", "Kit parrain"],
    },
  ];

  if (sacredArtifacts && sacredArtifacts.length > 0) {
    rituals.push({
      id: "ritual-artifact",
      name: "Remise de l'Artefact Sacré",
      stage: "EVANGELIST",
      type: "CELEBRATION",
      description: "Cérémonie de remise d'un artefact sacré de la marque",
      emotionalPayoff: "Connexion transcendante avec la marque",
      touchpoints: ["Événement physique", "Cérémonie privée"],
    });
  }

  return rituals;
}

function generateBelongingSignals(
  sacredArtifacts: Record<string, unknown>[] | null,
): Array<Record<string, unknown>> {
  const signals = [
    {
      id: "signal-vocabulary",
      name: "Vocabulaire Initié",
      stage: "FOLLOWER",
      type: "VOCABULARY",
      description: "Termes et expressions propres à la communauté",
      visibilityLevel: "TRIBAL",
      acquisitionMethod: "Immersion naturelle dans la communauté",
    },
    {
      id: "signal-badge",
      name: "Badge de Membre",
      stage: "ENGAGED",
      type: "BADGE",
      description: "Insigne visuel de membre actif",
      visibilityLevel: "PUBLIC",
      acquisitionMethod: "Atteinte du stade ENGAGED",
    },
    {
      id: "signal-gesture",
      name: "Geste de Reconnaissance",
      stage: "FAN",
      type: "GESTURE",
      description: "Geste ou signe de reconnaissance entre membres",
      visibilityLevel: "TRIBAL",
      acquisitionMethod: "Transmission par les pairs",
    },
    {
      id: "signal-ritual",
      name: "Rituel Partagé",
      stage: "SUPERFAN",
      type: "RITUAL",
      description: "Pratique régulière partagée par les superfans",
      visibilityLevel: "TRIBAL",
      acquisitionMethod: "Participation aux cercles internes",
    },
    {
      id: "signal-access",
      name: "Clé du Sanctuaire",
      stage: "EVANGELIST",
      type: "ACCESS",
      description: "Accès aux espaces les plus sacrés de la marque",
      visibilityLevel: "SECRET",
      acquisitionMethod: "Nomination par le conseil",
    },
  ];

  if (sacredArtifacts && sacredArtifacts.length > 0) {
    signals.push({
      id: "signal-artifact",
      name: "Artefact Sacré",
      stage: "SUPERFAN",
      type: "ARTIFACT",
      description: "Objet physique symbolique de la marque",
      visibilityLevel: "TRIBAL",
      acquisitionMethod: "Remise cérémonielle",
    });
  }

  return signals;
}

function generateMonetizationStreams(
  _productLadder: Record<string, unknown>[] | null,
  _catalogue: Record<string, unknown>[] | null,
): Array<Record<string, unknown>> {
  const streams = [
    {
      id: "stream-product",
      name: "Produits / Services Core",
      type: "PRODUCT",
      targetStages: ["FOLLOWER", "ENGAGED", "FAN"],
      revenueModel: "Vente directe",
      estimatedContribution: 40,
      scalability: "HIGH",
    },
    {
      id: "stream-subscription",
      name: "Abonnement Premium",
      type: "SUBSCRIPTION",
      targetStages: ["ENGAGED", "FAN", "SUPERFAN"],
      revenueModel: "Récurrent mensuel/annuel",
      estimatedContribution: 25,
      scalability: "HIGH",
    },
    {
      id: "stream-experience",
      name: "Expériences Exclusives",
      type: "EXPERIENCE",
      targetStages: ["FAN", "SUPERFAN", "EVANGELIST"],
      revenueModel: "Événementiel premium",
      estimatedContribution: 15,
      scalability: "MEDIUM",
    },
    {
      id: "stream-community",
      name: "Communauté & Membership",
      type: "COMMUNITY",
      targetStages: ["ENGAGED", "FAN", "SUPERFAN"],
      revenueModel: "Cotisation communautaire",
      estimatedContribution: 10,
      scalability: "HIGH",
    },
    {
      id: "stream-partnership",
      name: "Partenariats & Licensing",
      type: "PARTNERSHIP",
      targetStages: ["SUPERFAN", "EVANGELIST"],
      revenueModel: "Revenue share + licensing",
      estimatedContribution: 10,
      scalability: "MEDIUM",
    },
  ];

  return streams;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerFrameworkHandler("FW-13", execute);
