// =============================================================================
// FW-17 — Brand Defense Protocol Handler
// =============================================================================
// Hybrid handler that computes brand defense assets: threat mapping, community
// defense mobilization metrics, crisis narrative playbook, and enemy-as-fuel
// conversion mechanics.
// Inputs: R.globalSwot (SWOT), FW-20 (existentialEnemy, doctrine),
//         FW-07 (cultIndex), FW-08 (segments with SUPERFAN/EVANGELIST counts)
// Outputs: BD.threatMap, BD.communityDefense, BD.crisisNarrative,
//          BD.enemyAsFuel
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THREAT_TEMPLATES: Array<{
  id: string;
  type: "COMPETITIVE" | "REPUTATIONAL" | "MARKET" | "INTERNAL" | "REGULATORY";
  name: string;
  description: string;
  baseSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  baseProbability: number;
  impact: string;
  mitigation: string;
  detectionSignals: string[];
}> = [
  {
    id: "threat-competitive",
    type: "COMPETITIVE",
    name: "Offensive concurrentielle directe",
    description: "Un concurrent lance une offre agressive ciblant notre base communautaire ou notre positionnement différenciant",
    baseSeverity: "HIGH",
    baseProbability: 0.6,
    impact: "Érosion de parts de marché et pression sur les prix, risque de défection des segments ENGAGED et FAN",
    mitigation: "Renforcer le lien communautaire, activer les Superfans comme bouclier, accélérer l'innovation produit",
    detectionSignals: [
      "Augmentation des mentions concurrentielles dans la communauté",
      "Baisse du NPS ou du Cult Index",
      "Perte de trafic organique sur les mots-clés de marque",
      "Offres promotionnelles agressives des concurrents",
    ],
  },
  {
    id: "threat-reputational",
    type: "REPUTATIONAL",
    name: "Crise de réputation",
    description: "Événement médiatique négatif, bad buzz sur les réseaux sociaux ou controverse publique affectant l'image de marque",
    baseSeverity: "CRITICAL",
    baseProbability: 0.3,
    impact: "Perte de confiance massive, départ des ambassadeurs, couverture médiatique négative et viralité du bad buzz",
    mitigation: "Activer le protocole de crise narrative, mobiliser les défenseurs communautaires, communiquer avec transparence radicale",
    detectionSignals: [
      "Spike de mentions négatives sur les réseaux sociaux",
      "Articles de presse critiques ou enquêtes journalistiques",
      "Hausse des réclamations clients",
      "Démission ou prise de distance d'ambassadeurs clés",
    ],
  },
  {
    id: "threat-market",
    type: "MARKET",
    name: "Disruption de marché",
    description: "Changement structurel du marché (nouvelle technologie, nouveau business model, évolution des habitudes de consommation)",
    baseSeverity: "MEDIUM",
    baseProbability: 0.4,
    impact: "Obsolescence potentielle de l'offre, déconnexion avec les attentes du marché, perte de pertinence narrative",
    mitigation: "Veille stratégique continue, pivoter le récit de marque pour embrasser le changement, co-créer avec la communauté",
    detectionSignals: [
      "Émergence de nouvelles catégories ou substituts",
      "Changement rapide des comportements d'achat",
      "Entrée de nouveaux acteurs disruptifs",
      "Baisse tendancielle de la demande sur le segment core",
    ],
  },
  {
    id: "threat-internal",
    type: "INTERNAL",
    name: "Fracture interne",
    description: "Désalignement entre la culture interne et la promesse de marque externe (incohérence valeurs/actions)",
    baseSeverity: "MEDIUM",
    baseProbability: 0.35,
    impact: "Perte de crédibilité authentique, fuite de talents clés, dégradation de l'expérience client par manque d'alignement",
    mitigation: "Renforcer le programme Internal Alignment (FW-18), auditer régulièrement la cohérence interne/externe, rituels d'alignement",
    detectionSignals: [
      "Baisse du eNPS (Employee Net Promoter Score)",
      "Turnover élevé dans les équipes clés",
      "Témoignages Glassdoor ou fuites internes négatifs",
      "Écart croissant entre promesse de marque et réalité vécue",
    ],
  },
  {
    id: "threat-regulatory",
    type: "REGULATORY",
    name: "Contrainte réglementaire",
    description: "Nouvelle réglementation impactant le business model, les pratiques marketing ou la collecte de données communautaires",
    baseSeverity: "LOW",
    baseProbability: 0.25,
    impact: "Obligation de restructurer certaines offres, coûts de mise en conformité, restriction des leviers de croissance communautaire",
    mitigation: "Veille juridique proactive, intégrer la conformité dans le design produit dès le départ, positionner la marque comme pionnière responsable",
    detectionSignals: [
      "Annonces de projets de loi ou consultations publiques",
      "Sanctions sur des concurrents pour des pratiques similaires",
      "Évolution des standards sectoriels",
      "Pression croissante des associations de consommateurs",
    ],
  },
];

const CRISIS_SCENARIO_TEMPLATES: Array<{
  id: string;
  scenarioName: string;
  triggerEvent: string;
  narrativeResponse: string;
  keyMessages: string[];
  spokesperson: string;
  channels: string[];
  timeline: string;
}> = [
  {
    id: "crisis-pr",
    scenarioName: "Crise PR / Bad Buzz",
    triggerEvent: "Publication virale négative ou controverse publique impliquant la marque",
    narrativeResponse: "Réponse transparente et empathique — reconnaître les faits, expliquer le contexte, engager des actions correctives immédiates et partager le plan de résolution avec la communauté",
    keyMessages: [
      "Nous prenons cette situation très au sérieux",
      "Voici les faits tels que nous les connaissons",
      "Voici les actions concrètes que nous engageons immédiatement",
      "Notre communauté mérite la transparence — nous vous tiendrons informés",
    ],
    spokesperson: "CEO / Fondateur (voix authentique et crédible)",
    channels: ["Réseaux sociaux (réponse directe)", "Communiqué de presse", "Email communauté", "Story / Live vidéo"],
    timeline: "0-2h : Accusé de réception → 2-6h : Réponse structurée → 24h : Plan d'action → 72h : Point de situation",
  },
  {
    id: "crisis-competitive",
    scenarioName: "Attaque concurrentielle frontale",
    triggerEvent: "Un concurrent lance une campagne agressive ciblant directement notre positionnement ou notre communauté",
    narrativeResponse: "Réponse par l'élévation — ne pas répondre sur le terrain de l'attaque mais réaffirmer notre mission unique, activer la communauté comme preuve vivante de notre valeur, et capitaliser sur l'attention générée",
    keyMessages: [
      "Nous restons concentrés sur notre mission qui dépasse la compétition",
      "Notre communauté est notre meilleure preuve — leurs témoignages parlent d'eux-mêmes",
      "La compétition valide la pertinence de notre vision",
      "Nous convertissons chaque attaque en carburant pour notre mouvement",
    ],
    spokesperson: "Directeur Marketing / Head of Community",
    channels: ["Contenu communautaire organique", "Témoignages Superfans", "PR stratégique", "Réseaux sociaux"],
    timeline: "0-4h : Veille et analyse → 4-12h : Activation communauté → 24-48h : Contre-narratif → 7j : Capitalisation",
  },
  {
    id: "crisis-market",
    scenarioName: "Disruption de marché majeure",
    triggerEvent: "Apparition d'une technologie, d'un business model ou d'un changement sociétal qui remet en cause les fondamentaux du marché",
    narrativeResponse: "Positionner la marque comme pionnière du changement — réinterpréter la disruption à travers le prisme de notre prophétie de marque, montrer comment notre vision anticipait cette évolution",
    keyMessages: [
      "Ce changement confirme la direction que nous avons toujours portée",
      "Notre communauté est prête pour cette évolution — nous l'avons construite pour ça",
      "Voici comment nous embrassons ce changement et ce que cela signifie pour vous",
      "Ensemble, nous ne subissons pas le changement — nous le menons",
    ],
    spokesperson: "CEO / Chief Strategy Officer",
    channels: ["Article de fond / Blog", "Newsletter stratégique", "Webinaire communauté", "PR et médias sectoriels"],
    timeline: "0-24h : Analyse stratégique → 24-72h : Prise de position publique → 7-14j : Plan de pivot → 30j : Nouveau récit intégré",
  },
];

const DEFAULT_MOBILIZATION_PROTOCOL = [
  "Étape 1 — Détection : Monitoring continu des signaux faibles via social listening et veille communautaire",
  "Étape 2 — Évaluation : Classification de la menace (type, sévérité, probabilité d'escalade) sous 30 minutes",
  "Étape 3 — Alerte : Notification de la cellule de crise et des Brand Champions concernés",
  "Étape 4 — Mobilisation : Activation des défenseurs communautaires par segment (Superfans puis Evangelists)",
  "Étape 5 — Réponse : Déploiement du narratif de crise adapté au scénario identifié",
  "Étape 6 — Amplification : Les agents communautaires relaient le message et contrent les narratifs négatifs",
  "Étape 7 — Suivi : Monitoring de l'impact, ajustement du narratif, reporting à J+1, J+3, J+7",
];

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
  try {
    // -----------------------------------------------------------------
    // Resolve upstream inputs
    // -----------------------------------------------------------------
    const globalSwot = ctx.inputs["R.globalSwot"] as Record<string, unknown> | null;
    const existentialEnemy = ctx.inputs["MA.existentialEnemy"] as Record<string, unknown> | null;
    const doctrine = ctx.inputs["MA.doctrine"] as Record<string, unknown> | null;
    const cultIndex = ctx.inputs["FW-07.cultIndex"] as number | null;
    const segments = ctx.inputs["FW-08.segments"] as Record<string, unknown>[] | null;

    // -----------------------------------------------------------------
    // 1. Threat Map — One threat per type, severity adjusted by data
    // -----------------------------------------------------------------
    const threatMap = THREAT_TEMPLATES.map((t) => ({
      id: t.id,
      type: t.type,
      name: t.name,
      description: t.description,
      severity: adjustSeverity(t.baseSeverity, t.type, globalSwot, cultIndex),
      probability: adjustProbability(t.baseProbability, t.type, globalSwot),
      impact: t.impact,
      mitigation: t.mitigation,
      detectionSignals: t.detectionSignals,
    }));

    // -----------------------------------------------------------------
    // 2. Community Defense — Agents by segment + mobilization protocol
    // -----------------------------------------------------------------
    const communityDefense = buildCommunityDefense(segments, cultIndex);

    // -----------------------------------------------------------------
    // 3. Crisis Narrative — 3 template scenarios
    // -----------------------------------------------------------------
    const crisisNarrative = CRISIS_SCENARIO_TEMPLATES.map((scenario) => ({
      id: scenario.id,
      scenarioName: scenario.scenarioName,
      triggerEvent: scenario.triggerEvent,
      narrativeResponse: enrichNarrativeResponse(scenario.narrativeResponse, doctrine),
      keyMessages: scenario.keyMessages,
      spokesperson: scenario.spokesperson,
      channels: scenario.channels,
      timeline: scenario.timeline,
    }));

    // -----------------------------------------------------------------
    // 4. Enemy As Fuel — Convert existential enemy into brand energy
    // -----------------------------------------------------------------
    const enemyAsFuel = buildEnemyAsFuel(existentialEnemy, doctrine);

    return {
      success: true,
      data: {
        threatMap,
        communityDefense,
        crisisNarrative,
        enemyAsFuel,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {},
      error: error instanceof Error ? error.message : "FW-17 execution error",
    };
  }
}

registerFrameworkHandler("FW-17", execute);

// ---------------------------------------------------------------------------
// Helpers — Threat Map
// ---------------------------------------------------------------------------

/** Adjust threat severity based on SWOT data and cult index */
function adjustSeverity(
  base: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  type: string,
  globalSwot: Record<string, unknown> | null,
  cultIndex: number | null,
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const severityOrder: Array<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL"> = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
  ];
  let idx = severityOrder.indexOf(base);

  // SWOT threats increase severity for matching types
  if (globalSwot) {
    const threats = extractSwotList(globalSwot, "threats");
    const weaknesses = extractSwotList(globalSwot, "weaknesses");

    if (type === "COMPETITIVE" && threats.length > 2) {
      idx = Math.min(idx + 1, 3);
    }
    if (type === "INTERNAL" && weaknesses.length > 2) {
      idx = Math.min(idx + 1, 3);
    }
    if (type === "REPUTATIONAL" && (threats.length > 3 || weaknesses.length > 3)) {
      idx = Math.min(idx + 1, 3);
    }
  }

  // High cult index reduces competitive and reputational severity (loyal community)
  if (cultIndex !== null && cultIndex > 70) {
    if (type === "COMPETITIVE" || type === "REPUTATIONAL") {
      idx = Math.max(idx - 1, 0);
    }
  }

  return severityOrder[idx]!;
}

/** Adjust probability based on SWOT context */
function adjustProbability(
  base: number,
  type: string,
  globalSwot: Record<string, unknown> | null,
): number {
  if (!globalSwot) return base;

  const threats = extractSwotList(globalSwot, "threats");
  const opportunities = extractSwotList(globalSwot, "opportunities");

  // More SWOT threats → higher probability for external threat types
  if ((type === "COMPETITIVE" || type === "MARKET" || type === "REGULATORY") && threats.length > 2) {
    return Math.min(base + 0.1, 1);
  }

  // Strong opportunities can lower market disruption probability
  if (type === "MARKET" && opportunities.length > 3) {
    return Math.max(base - 0.1, 0);
  }

  return base;
}

/** Extract a named list from the SWOT object (handles various shapes) */
function extractSwotList(
  swot: Record<string, unknown>,
  key: string,
): string[] {
  const value = swot[key];
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "string" ? v : String(v)));
  }
  // Try French variants
  const frenchKeys: Record<string, string> = {
    threats: "menaces",
    weaknesses: "faiblesses",
    strengths: "forces",
    opportunities: "opportunités",
  };
  const frenchValue = swot[frenchKeys[key] ?? key];
  if (Array.isArray(frenchValue)) {
    return frenchValue.map((v) => (typeof v === "string" ? v : String(v)));
  }
  return [];
}

// ---------------------------------------------------------------------------
// Helpers — Community Defense
// ---------------------------------------------------------------------------

/** Build community defense data from FW-08 segments and cult index */
function buildCommunityDefense(
  segments: Record<string, unknown>[] | null,
  cultIndex: number | null,
): {
  agentsBySegment: Array<{ segment: string; count: number; activationRate: number }>;
  brandDefenseRate: number;
  mobilizationProtocol: string[];
  responseTimeTarget: string;
} {
  const agentsBySegment = deriveAgentsBySegment(segments);
  const brandDefenseRate = deriveBrandDefenseRate(cultIndex, agentsBySegment);
  const responseTimeTarget = brandDefenseRate >= 70
    ? "< 1 heure (mobilisation rapide)"
    : brandDefenseRate >= 50
      ? "< 4 heures (mobilisation standard)"
      : "< 12 heures (mobilisation lente — communauté à renforcer)";

  return {
    agentsBySegment,
    brandDefenseRate,
    mobilizationProtocol: DEFAULT_MOBILIZATION_PROTOCOL,
    responseTimeTarget,
  };
}

/** Derive agent counts per segment from FW-08 data */
function deriveAgentsBySegment(
  segments: Record<string, unknown>[] | null,
): Array<{ segment: string; count: number; activationRate: number }> {
  if (!segments || segments.length === 0) {
    // Default fallback when no FW-08 data available
    return [
      { segment: "SUPERFAN", count: 50, activationRate: 0.75 },
      { segment: "EVANGELIST", count: 15, activationRate: 0.90 },
      { segment: "FAN", count: 200, activationRate: 0.35 },
      { segment: "ENGAGED", count: 500, activationRate: 0.15 },
    ];
  }

  // Extract SUPERFAN and EVANGELIST counts from FW-08 segments
  const defenseSegments = ["SUPERFAN", "EVANGELIST", "FAN", "ENGAGED"];
  const activationRates: Record<string, number> = {
    SUPERFAN: 0.75,
    EVANGELIST: 0.90,
    FAN: 0.35,
    ENGAGED: 0.15,
    FOLLOWER: 0.05,
  };

  return defenseSegments.map((segName) => {
    const match = segments.find((s) => {
      const name = String(s.name ?? s.stage ?? s.segment ?? "").toUpperCase();
      return name === segName;
    });
    const count = match ? (Number(match.count) || Number(match.size) || Number(match.total) || 0) : 0;
    return {
      segment: segName,
      count,
      activationRate: activationRates[segName] ?? 0.1,
    };
  });
}

/** Derive brand defense rate from cult index and community agents */
function deriveBrandDefenseRate(
  cultIndex: number | null,
  agents: Array<{ count: number; activationRate: number }>,
): number {
  // Base from cult index (0-100 → 0-60 contribution)
  const cultContribution = cultIndex !== null
    ? Math.round((cultIndex / 100) * 60)
    : 30;

  // Community agent contribution (total activated agents → 0-40 contribution)
  const totalActivated = agents.reduce((sum, a) => sum + Math.round(a.count * a.activationRate), 0);
  const agentContribution = Math.min(Math.round((totalActivated / 200) * 40), 40);

  return Math.min(cultContribution + agentContribution, 100);
}

// ---------------------------------------------------------------------------
// Helpers — Crisis Narrative
// ---------------------------------------------------------------------------

/** Enrich narrative response with doctrine context if available */
function enrichNarrativeResponse(
  baseResponse: string,
  doctrine: Record<string, unknown> | null,
): string {
  if (!doctrine || typeof doctrine !== "object") return baseResponse;

  const coreValue = String(
    doctrine.coreValue ?? doctrine.valeurFondamentale ?? doctrine.essence ?? "",
  );

  if (coreValue) {
    return `${baseResponse}. Ce narratif s'ancre dans notre doctrine fondamentale : « ${coreValue} ».`;
  }

  return baseResponse;
}

// ---------------------------------------------------------------------------
// Helpers — Enemy As Fuel
// ---------------------------------------------------------------------------

/** Build enemy-as-fuel from FW-20 existentialEnemy or defaults */
function buildEnemyAsFuel(
  existentialEnemy: Record<string, unknown> | null,
  doctrine: Record<string, unknown> | null,
): {
  existentialEnemy: string;
  fuelMechanism: string;
  communityRallyPoints: string[];
  contentOpportunities: string[];
  competitiveAdvantage: string;
} {
  // Extract existential enemy name from FW-20
  const enemyName = existentialEnemy
    ? String(
        existentialEnemy.name ??
          existentialEnemy.enemy ??
          existentialEnemy.ennemi ??
          existentialEnemy.nom ??
          "Le statu quo",
      )
    : "Le statu quo";

  const doctrineMission = doctrine
    ? String(doctrine.mission ?? doctrine.prophecy ?? doctrine.vision ?? "")
    : "";

  const fuelMechanism = doctrineMission
    ? `Chaque manifestation de « ${enemyName} » est convertie en énergie mobilisatrice pour notre communauté, renforçant notre mission : ${doctrineMission}`
    : `Chaque manifestation de « ${enemyName} » est convertie en énergie mobilisatrice — la résistance au statu quo unit notre communauté et amplifie notre raison d'être`;

  const communityRallyPoints = [
    `Témoignages de victimes de « ${enemyName} » convertis en histoires de transformation`,
    `Comparaisons avant/après montrant l'alternative que notre marque incarne`,
    `Moments de mobilisation collective contre les pratiques de « ${enemyName} »`,
    `Célébrations des victoires communautaires face à « ${enemyName} »`,
  ];

  const contentOpportunities = [
    `Série « Les Combattants » — portraits de membres qui ont vaincu « ${enemyName} »`,
    `Rapport annuel d'impact : mesure concrète de notre lutte contre « ${enemyName} »`,
    `Campagnes de sensibilisation communautaires contre « ${enemyName} »`,
    `User-generated content : la communauté documente sa résistance à « ${enemyName} »`,
    `Événements live : sommets et rassemblements autour de la cause commune`,
  ];

  const competitiveAdvantage = `Notre positionnement contre « ${enemyName} » crée un lien émotionnel que les concurrents ne peuvent pas répliquer — notre communauté ne défend pas seulement une marque, elle défend une cause`;

  return {
    existentialEnemy: enemyName,
    fuelMechanism,
    communityRallyPoints,
    contentOpportunities,
    competitiveAdvantage,
  };
}
