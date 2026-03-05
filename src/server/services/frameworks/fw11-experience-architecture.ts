// =============================================================================
// FW-11 — Experience Architecture Handler
// =============================================================================
// Hybrid framework: maps the 5-stage superfan transition journey.
// Inputs: pillar E (touchpoints, rituels, gamification), pillar D (personas),
//         FW-08 segments, FW-20 (doctrine).
// Outputs: XA.transitionMap, XA.emotionalArc, XA.momentsDeTruth,
//          XA.frictionMap, XA.brandCoherenceScore
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";
import { SUPERFAN_STAGES } from "~/lib/types/frameworks/framework-descriptor";

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
  try {
    // Resolve relevant inputs
    const touchpoints = ctx.inputs["E.touchpoints"] as string[] | null;
    const rituels = ctx.inputs["E.rituels"] as Record<string, unknown> | null;
    const gamification = ctx.inputs["E.gamification"] as Record<string, unknown> | null;
    const personas = ctx.inputs["D.personas"] as Record<string, unknown>[] | null;
    const doctrine = ctx.inputs["MA.doctrine"] as Record<string, unknown> | null;

    // Build transition map for 5 transitions (AUDIENCE→FOLLOWER, FOLLOWER→ENGAGED, etc.)
    const stages = SUPERFAN_STAGES;
    const transitionMap = [];
    for (let i = 0; i < stages.length - 1; i++) {
      const from = stages[i]!;
      const to = stages[i + 1]!;

      transitionMap.push({
        fromStage: from,
        toStage: to,
        triggerCondition: deriveTrigger(from, to, touchpoints),
        keyExperience: deriveKeyExperience(from, to, rituels),
        emotionalShift: deriveEmotionalShift(from, to),
        proofOfTransition: deriveProof(from, to),
        touchpoints: deriveTouchpoints(from, to, touchpoints),
        estimatedConversionRate: estimateConversion(from, to),
      });
    }

    // Build emotional arc
    const emotionalArc = {
      points: stages.map((stage, idx) => ({
        stage,
        primaryEmotion: STAGE_EMOTIONS[idx]!,
        intensity: Math.min(10, 3 + idx * 1.5),
        brandRole: STAGE_BRAND_ROLES[idx]!,
      })),
      overallNarrative: doctrine
        ? `Arc émotionnel guidé par la doctrine : ${String((doctrine as Record<string, unknown>).summary ?? "transformation progressive")}`
        : "Progression émotionnelle de la curiosité à l'évangélisation",
    };

    // Generate moments of truth
    const momentsDeTruth = stages.slice(0, 5).map((stage, idx) => ({
      id: `mot-${idx + 1}`,
      name: MOMENT_NAMES[idx]!,
      stage,
      type: MOMENT_TYPES[idx]! as "DISCOVERY" | "FIRST_USE" | "COMMITMENT" | "ADVOCACY" | "CRISIS",
      description: `Moment critique dans la transition vers ${stages[idx + 1] ?? "EVANGELIST"}`,
      successCriteria: `Le prospect franchit le seuil vers ${stages[idx + 1] ?? "EVANGELIST"}`,
      failureConsequence: `Stagnation ou régression au stade ${stage}`,
      touchpoint: touchpoints?.[idx % (touchpoints?.length ?? 1)] ?? "digital",
    }));

    // Generate friction map
    const frictionMap = stages.slice(0, 5).map((stage, idx) => ({
      id: `fp-${idx + 1}`,
      stage,
      description: FRICTION_DESCRIPTIONS[idx]!,
      severity: (["MEDIUM", "HIGH", "HIGH", "MEDIUM", "LOW"] as const)[idx]!,
      mitigation: FRICTION_MITIGATIONS[idx]!,
      touchpoint: touchpoints?.[idx % (touchpoints?.length ?? 1)] ?? "multi-canal",
    }));

    // Compute brand coherence score
    let coherenceScore = 50;
    if (touchpoints && touchpoints.length > 3) coherenceScore += 10;
    if (rituels) coherenceScore += 10;
    if (gamification) coherenceScore += 10;
    if (personas && personas.length > 0) coherenceScore += 10;
    if (doctrine) coherenceScore += 10;
    coherenceScore = Math.min(100, coherenceScore);

    return {
      success: true,
      data: {
        "XA.transitionMap": transitionMap,
        "XA.emotionalArc": emotionalArc,
        "XA.momentsDeTruth": momentsDeTruth,
        "XA.frictionMap": frictionMap,
        "XA.brandCoherenceScore": coherenceScore,
      },
    };
  } catch (err) {
    return {
      success: false,
      data: {},
      error: err instanceof Error ? err.message : "Erreur FW-11",
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STAGE_EMOTIONS = [
  "Curiosité",
  "Intérêt",
  "Enthousiasme",
  "Passion",
  "Dévotion",
  "Ferveur missionnaire",
];

const STAGE_BRAND_ROLES = [
  "Attracteur",
  "Éducateur",
  "Compagnon",
  "Inspirateur",
  "Guide spirituel",
  "Mouvement",
];

const MOMENT_NAMES = [
  "Moment de Découverte",
  "Premier Engagement",
  "Point de Conviction",
  "Acte d'Advocacy",
  "Épreuve de Fidélité",
];

const MOMENT_TYPES = [
  "DISCOVERY",
  "FIRST_USE",
  "COMMITMENT",
  "ADVOCACY",
  "CRISIS",
] as const;

const FRICTION_DESCRIPTIONS = [
  "Manque de visibilité ou de notoriété initiale",
  "Complexité de la première interaction",
  "Hésitation avant l'engagement financier ou émotionnel",
  "Barrière au passage du statut passif à actif",
  "Risque de décrochage post-achat",
];

const FRICTION_MITIGATIONS = [
  "Contenu viral + preuve sociale",
  "Onboarding simplifié + quick wins",
  "Offre d'essai + témoignages pairs",
  "Programme ambassadeur + reconnaissance",
  "Communauté active + surprise & delight",
];

function deriveTrigger(from: string, to: string, touchpoints: string[] | null): string {
  const base = `Transition ${from} → ${to}`;
  if (touchpoints && touchpoints.length > 0) {
    return `${base} via ${touchpoints[0]}`;
  }
  return base;
}

function deriveKeyExperience(from: string, to: string, rituels: Record<string, unknown> | null): string {
  if (rituels) {
    const keys = Object.keys(rituels);
    if (keys.length > 0) return `Expérience rituelle : ${keys[0]}`;
  }
  return `Expérience clé pour passer de ${from} à ${to}`;
}

function deriveEmotionalShift(from: string, to: string): string {
  const shifts: Record<string, string> = {
    "AUDIENCE→FOLLOWER": "De l'indifférence à l'intérêt",
    "FOLLOWER→ENGAGED": "De l'intérêt à l'implication",
    "ENGAGED→FAN": "De l'implication à l'attachement",
    "FAN→SUPERFAN": "De l'attachement à la dévotion",
    "SUPERFAN→EVANGELIST": "De la dévotion à la mission",
  };
  return shifts[`${from}→${to}`] ?? `Évolution émotionnelle ${from} → ${to}`;
}

function deriveProof(from: string, to: string): string {
  const proofs: Record<string, string> = {
    "AUDIENCE→FOLLOWER": "Abonnement, inscription newsletter, follow social",
    "FOLLOWER→ENGAGED": "Premier achat, participation événement, commentaire",
    "ENGAGED→FAN": "Achats récurrents, recommandation spontanée",
    "FAN→SUPERFAN": "Défense active de la marque, création de contenu UGC",
    "SUPERFAN→EVANGELIST": "Recrutement actif, leadership communautaire",
  };
  return proofs[`${from}→${to}`] ?? `Preuve de transition ${from} → ${to}`;
}

function deriveTouchpoints(from: string, to: string, touchpoints: string[] | null): string[] {
  if (touchpoints && touchpoints.length > 0) {
    return touchpoints.slice(0, 3);
  }
  return [`Canal principal ${from}→${to}`];
}

function estimateConversion(from: string, to: string): number {
  const rates: Record<string, number> = {
    "AUDIENCE→FOLLOWER": 0.15,
    "FOLLOWER→ENGAGED": 0.25,
    "ENGAGED→FAN": 0.35,
    "FAN→SUPERFAN": 0.20,
    "SUPERFAN→EVANGELIST": 0.10,
  };
  return rates[`${from}→${to}`] ?? 0.15;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerFrameworkHandler("FW-11", execute);
