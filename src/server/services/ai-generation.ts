// ADVERTIS AI Generation Engine
// Generates strategic content for each of the 8 ADVERTIS pillars sequentially,
// using the Vercel AI SDK with Anthropic Claude.
//
// All pillars now generate structured JSON (not markdown).

import { generateText } from "ai";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { getInterviewSchema } from "~/lib/interview-schema";
import { anthropic, DEFAULT_MODEL } from "./anthropic-client";

import type { AuthenticitePillarData } from "~/lib/types/pillar-data";
import type { DistinctionPillarData } from "~/lib/types/pillar-data";
import type { ValeurPillarData } from "~/lib/types/pillar-data";
import type { EngagementPillarData } from "~/lib/types/pillar-data";
import type { SynthesePillarData } from "~/lib/types/pillar-data";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates the strategic content for one ADVERTIS pillar.
 * Returns structured JSON data (not markdown).
 */
export async function generatePillarContent(
  pillarType: string,
  interviewData: Record<string, string>,
  previousPillars: Array<{ type: string; content: string }>,
  brandName: string,
  sector: string,
): Promise<unknown> {
  const systemPrompt = getSystemPrompt(pillarType);
  const userPrompt = buildUserPrompt(
    pillarType,
    interviewData,
    previousPillars,
    brandName,
    sector,
  );

  const result = await generateText({
    model: anthropic(DEFAULT_MODEL),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 6000,
  });

  // Parse JSON response and apply defaults
  const parsed = parseJsonObject(result.text);

  // Apply pillar-specific defaults
  return applyDefaults(pillarType, parsed);
}

/**
 * Generates the Pillar S (Synthèse) content.
 * Requires all previous pillar data for cross-referencing.
 */
export async function generateSyntheseContent(
  interviewData: Record<string, string>,
  allPillars: Array<{ type: string; content: string }>,
  brandName: string,
  sector: string,
): Promise<SynthesePillarData> {
  const systemPrompt = getSystemPrompt("S");
  const userPrompt = buildUserPrompt(
    "S",
    interviewData,
    allPillars,
    brandName,
    sector,
  );

  const result = await generateText({
    model: anthropic(DEFAULT_MODEL),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 8000,
    temperature: 0.3,
  });

  const parsed = parseJsonObject(result.text) as Partial<SynthesePillarData>;

  return {
    syntheseExecutive: parsed.syntheseExecutive ?? "",
    visionStrategique: parsed.visionStrategique ?? "",
    coherencePiliers: Array.isArray(parsed.coherencePiliers) ? parsed.coherencePiliers : [],
    facteursClesSucces: Array.isArray(parsed.facteursClesSucces) ? parsed.facteursClesSucces : [],
    recommandationsPrioritaires: Array.isArray(parsed.recommandationsPrioritaires) ? parsed.recommandationsPrioritaires : [],
    scoreCoherence: parsed.scoreCoherence ?? 50,
  };
}

// ---------------------------------------------------------------------------
// System prompts — structured JSON output for each pillar
// ---------------------------------------------------------------------------

const JSON_RULES = `
RÈGLES CRITIQUES :
- Réponds UNIQUEMENT avec du JSON valide
- Pas de commentaires, pas de markdown, pas de texte avant/après le JSON
- Remplis TOUS les champs avec des données concrètes, spécifiques à la marque
- Si une donnée n'est pas fournie, propose une recommandation réaliste basée sur le secteur
- Utilise le français pour toutes les valeurs textuelles`;

const SYSTEM_PROMPTS: Record<string, string> = {
  A: `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS.
Tu génères le contenu structuré du Pilier A — Authenticité.

Ton rôle est de définir l'ADN profond de la marque : son identité, ses valeurs fondatrices, sa raison d'être (Ikigai), son archétype, et l'histoire de la marque (Hero's Journey).

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict) :
{
  "identite": {
    "archetype": "L'archétype de marque dominant (ex: Le Magicien, Le Héros, L'Explorateur...)",
    "citationFondatrice": "La citation ou le mantra fondateur de la marque",
    "noyauIdentitaire": "Le noyau identitaire en 2-3 phrases — ce qui rend la marque unique"
  },
  "herosJourney": {
    "acte1Origines": "Acte 1 — Les origines : contexte de naissance de la marque",
    "acte2Appel": "Acte 2 — L'appel : le déclencheur, le problème identifié",
    "acte3Epreuves": "Acte 3 — Les épreuves : obstacles surmontés",
    "acte4Transformation": "Acte 4 — La transformation : le pivot ou l'innovation",
    "acte5Revelation": "Acte 5 — La révélation : la vision et la promesse actuelle"
  },
  "ikigai": {
    "aimer": "Ce que la marque aime / sa passion",
    "competence": "Ce dans quoi la marque excelle",
    "besoinMonde": "Ce dont le monde a besoin (le problème résolu)",
    "remuneration": "Ce pour quoi les clients paient"
  },
  "valeurs": [
    { "valeur": "Nom de la valeur", "rang": 1, "justification": "Pourquoi cette valeur est prioritaire" }
  ],
  "hierarchieCommunautaire": [
    { "niveau": 1, "nom": "Nom du niveau", "description": "Description", "privileges": "Avantages spécifiques" }
  ],
  "timelineNarrative": {
    "origines": "Les origines et la genèse",
    "croissance": "La phase de croissance",
    "pivot": "Le pivot stratégique",
    "futur": "La vision future"
  }
}

Génère 3-5 valeurs ordonnées et 4-6 niveaux de hiérarchie communautaire.
${JSON_RULES}`,

  D: `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS.
Tu génères le contenu structuré du Pilier D — Distinction.

Ton rôle est de définir comment la marque se différencie : personas, positionnement, promesses, identité visuelle et vocale.

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict) :
{
  "personas": [
    {
      "nom": "Nom du persona",
      "demographie": "Âge, CSP, localisation",
      "psychographie": "Valeurs, style de vie, centres d'intérêt",
      "motivations": "Ce qui les pousse à acheter",
      "freins": "Ce qui les retient",
      "priorite": 1
    }
  ],
  "paysageConcurrentiel": {
    "concurrents": [
      { "nom": "Nom", "forces": "Points forts", "faiblesses": "Points faibles", "partDeMarche": "Estimation" }
    ],
    "avantagesCompetitifs": ["Avantage 1", "Avantage 2"]
  },
  "promessesDeMarque": {
    "promesseMaitre": "La promesse de marque principale",
    "sousPromesses": ["Sous-promesse 1", "Sous-promesse 2"]
  },
  "positionnement": "Pour [cible], [marque] est [catégorie] qui [différence] parce que [preuve]",
  "tonDeVoix": {
    "personnalite": "Description de la personnalité vocale",
    "onDit": ["Expression typique 1", "Expression typique 2"],
    "onNeditPas": ["À éviter 1", "À éviter 2"]
  },
  "identiteVisuelle": {
    "directionArtistique": "Description de la DA",
    "paletteCouleurs": ["#HEX1 — Signification", "#HEX2 — Signification"],
    "mood": "Ambiance générale et univers visuel"
  },
  "assetsLinguistiques": {
    "mantras": ["Mantra 1", "Mantra 2"],
    "vocabulaireProprietaire": ["Terme 1", "Terme 2"]
  }
}

Génère 2-4 personas, 3-5 concurrents, 3-5 avantages compétitifs.
Appuie-toi sur les insights du Pilier A pour garantir la cohérence.
${JSON_RULES}`,

  V: `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS.
Tu génères le contenu structuré du Pilier V — Valeur.

Ton rôle est de définir la proposition de valeur, l'architecture de l'offre, et les métriques économiques.

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict) :
{
  "productLadder": [
    { "tier": "Nom du niveau", "prix": "Fourchette de prix", "description": "Description de l'offre", "cible": "Persona visé" }
  ],
  "valeurMarque": {
    "tangible": ["Actif tangible 1", "Actif tangible 2"],
    "intangible": ["Actif intangible 1", "Actif intangible 2"]
  },
  "valeurClient": {
    "fonctionnels": ["Gain fonctionnel 1"],
    "emotionnels": ["Gain émotionnel 1"],
    "sociaux": ["Gain social 1"]
  },
  "coutMarque": {
    "capex": "Investissements initiaux",
    "opex": "Coûts opérationnels récurrents",
    "coutsCaches": ["Coût caché 1"]
  },
  "coutClient": {
    "frictions": [
      { "friction": "Point de friction", "solution": "Solution proposée" }
    ]
  },
  "unitEconomics": {
    "cac": "Coût d'acquisition client estimé",
    "ltv": "Valeur vie client estimée",
    "ratio": "Ratio LTV/CAC",
    "pointMort": "Estimation du point mort",
    "marges": "Marges brutes estimées",
    "notes": "Hypothèses et notes"
  }
}

Génère 2-4 tiers, 2-3 frictions. Relie la valeur au positionnement des piliers précédents.
${JSON_RULES}`,

  E: `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS.
Tu génères le contenu structuré du Pilier E — Engagement.

Ton rôle est de définir les mécanismes d'engagement : touchpoints, rituels, communauté, gamification et métriques AARRR.

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict) :
{
  "touchpoints": [
    { "canal": "Nom", "type": "physique", "role": "Rôle dans le parcours", "priorite": 1 }
  ],
  "rituels": [
    { "nom": "Nom", "type": "always-on", "frequence": "Fréquence", "description": "Description" }
  ],
  "principesCommunautaires": {
    "principes": ["Principe 1"],
    "tabous": ["Tabou 1"]
  },
  "gamification": [
    { "niveau": 1, "nom": "Nom du niveau", "condition": "Condition d'accès", "recompense": "Récompense" }
  ],
  "aarrr": {
    "acquisition": "Stratégie d'acquisition",
    "activation": "Premier aha moment",
    "retention": "Boucles d'engagement",
    "revenue": "Stratégie de monétisation",
    "referral": "Stratégie virale"
  },
  "kpis": [
    { "variable": "E1", "nom": "Nom du KPI", "cible": "Objectif chiffré", "frequence": "Mensuel" }
  ]
}

Le champ "type" dans touchpoints est "physique", "digital" ou "humain".
Le champ "type" dans rituels est "always-on" ou "cyclique".
Génère 5-8 touchpoints, 3-5 rituels, 5-10 principes, 3-5 niveaux, 6-10 KPIs.
${JSON_RULES}`,

  R: `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS.
Tu génères le contenu du Pilier R — Risk.

NOTE : Ce prompt est un fallback. Le pilier R est normalement généré par audit-generation.ts.

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict) :
{
  "microSwots": [],
  "globalSwot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "riskScore": 50,
  "riskScoreJustification": "",
  "probabilityImpactMatrix": [],
  "mitigationPriorities": [],
  "summary": ""
}
${JSON_RULES}`,

  T: `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS.
Tu génères le contenu du Pilier T — Track.

NOTE : Ce prompt est un fallback. Le pilier T est normalement généré par audit-generation.ts.

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict) :
{
  "triangulation": { "internalData": "", "marketData": "", "customerData": "", "synthesis": "" },
  "hypothesisValidation": [],
  "marketReality": { "macroTrends": [], "weakSignals": [], "emergingPatterns": [] },
  "tamSamSom": { "tam": { "value": "", "description": "" }, "sam": { "value": "", "description": "" }, "som": { "value": "", "description": "" }, "methodology": "" },
  "competitiveBenchmark": [],
  "brandMarketFitScore": 50,
  "brandMarketFitJustification": "",
  "strategicRecommendations": [],
  "summary": ""
}
${JSON_RULES}`,

  I: `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS.
Tu génères le contenu du Pilier I — Implémentation.

NOTE : Ce prompt est un fallback. Le pilier I est normalement généré par implementation-generation.ts.
${JSON_RULES}`,

  S: `Tu es un consultant stratégique senior utilisant la méthodologie ADVERTIS.
Tu génères le Pilier S — Synthèse Stratégique, la bible stratégique finale.

Ce pilier compile les insights des 7 piliers précédents en une synthèse cohérente et actionable.

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict) :
{
  "syntheseExecutive": "Résumé exécutif complet en 10-15 phrases.",
  "visionStrategique": "Vision stratégique à 3-5 ans.",
  "coherencePiliers": [
    { "pilier": "A — Authenticité", "contribution": "Ce que ce pilier apporte", "articulation": "Comment il s'articule avec les autres" },
    { "pilier": "D — Distinction", "contribution": "...", "articulation": "..." },
    { "pilier": "V — Valeur", "contribution": "...", "articulation": "..." },
    { "pilier": "E — Engagement", "contribution": "...", "articulation": "..." },
    { "pilier": "R — Risk", "contribution": "...", "articulation": "..." },
    { "pilier": "T — Track", "contribution": "...", "articulation": "..." },
    { "pilier": "I — Implémentation", "contribution": "...", "articulation": "..." }
  ],
  "facteursClesSucces": ["Facteur 1", "Facteur 2", "Facteur 3", "Facteur 4", "Facteur 5"],
  "recommandationsPrioritaires": [
    { "action": "Action concrète", "priorite": 1, "impact": "Impact attendu", "delai": "Délai" }
  ],
  "scoreCoherence": 75
}

Génère 5-7 facteurs clés de succès et 8-10 recommandations prioritaires ordonnées.
Le scoreCoherence reflète la cohérence globale observée entre les piliers (0-100).
${JSON_RULES}`,
};

function getSystemPrompt(pillarType: string): string {
  return (
    SYSTEM_PROMPTS[pillarType] ??
    `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS. Génère le contenu stratégique structuré pour le pilier ${pillarType} en JSON.
${JSON_RULES}`
  );
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(
  pillarType: string,
  interviewData: Record<string, string>,
  previousPillars: Array<{ type: string; content: string }>,
  brandName: string,
  sector: string,
): string {
  const pillarConfig = PILLAR_CONFIG[pillarType as PillarType];
  const schema = getInterviewSchema();
  const pillarSection = schema.find((s) => s.pillarType === pillarType);

  // Header
  const lines: string[] = [
    `# Marque : ${brandName}`,
    `# Secteur : ${sector || "Non spécifié"}`,
    `# Pilier : ${pillarType} — ${pillarConfig?.title ?? pillarType}`,
    "",
  ];

  // Interview data for this pillar
  if (pillarSection && pillarSection.variables.length > 0) {
    lines.push("## Données d'entretien pour ce pilier");
    lines.push("");

    for (const variable of pillarSection.variables) {
      const raw = interviewData[variable.id];
      const value = typeof raw === "string" ? raw : (raw != null ? JSON.stringify(raw) : "");
      if (value.trim()) {
        lines.push(`### ${variable.id} — ${variable.label}`);
        lines.push(value.trim());
        lines.push("");
      } else {
        lines.push(
          `### ${variable.id} — ${variable.label} : *Non renseigné — génère une proposition basée sur le contexte.*`,
        );
        lines.push("");
      }
    }
  }

  // For Pillar S, also include interview data from ALL pillars
  if (pillarType === "S") {
    lines.push("## Données d'entretien globales");
    lines.push("");
    for (const section of schema) {
      for (const variable of section.variables) {
        const raw = interviewData[variable.id];
        const value = typeof raw === "string" ? raw : (raw != null ? JSON.stringify(raw) : "");
        if (value.trim()) {
          lines.push(`- **${variable.id} (${variable.label})** : ${value.trim()}`);
        }
      }
    }
    lines.push("");
  }

  // Context from previously generated pillars
  if (previousPillars.length > 0) {
    lines.push("## Contexte des piliers précédents");
    lines.push(
      "Utilise les insights suivants pour assurer la cohérence avec les piliers déjà générés :",
    );
    lines.push("");

    for (const prev of previousPillars) {
      const prevConfig = PILLAR_CONFIG[prev.type as PillarType];
      lines.push(
        `### Pilier ${prev.type} — ${prevConfig?.title ?? prev.type}`,
      );
      // Include a truncated version to stay within token limits
      const truncated =
        prev.content.length > 2000
          ? prev.content.substring(0, 2000) + "\n\n[... contenu tronqué ...]"
          : prev.content;
      lines.push(truncated);
      lines.push("");
    }
  }

  lines.push("---");
  lines.push(
    `Génère maintenant le contenu stratégique structuré en JSON pour le Pilier ${pillarType} — ${pillarConfig?.title ?? pillarType}.`,
  );
  lines.push(
    "Réponds UNIQUEMENT avec du JSON valide, sans aucun texte avant ou après.",
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// JSON parsing + defaults
// ---------------------------------------------------------------------------

function parseJsonObject(responseText: string): Record<string, unknown> {
  let jsonString = responseText.trim();

  // Remove markdown code block if present
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    jsonString = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(jsonString) as Record<string, unknown>;
  } catch {
    console.error(
      "[AI Generation] Failed to parse JSON:",
      responseText.substring(0, 200),
    );
    return {};
  }
}

function applyDefaults(pillarType: string, parsed: Record<string, unknown>): unknown {
  switch (pillarType) {
    case "A":
      return applyAuthenticiteDefaults(parsed as Partial<AuthenticitePillarData>);
    case "D":
      return applyDistinctionDefaults(parsed as Partial<DistinctionPillarData>);
    case "V":
      return applyValeurDefaults(parsed as Partial<ValeurPillarData>);
    case "E":
      return applyEngagementDefaults(parsed as Partial<EngagementPillarData>);
    default:
      return parsed;
  }
}

function applyAuthenticiteDefaults(p: Partial<AuthenticitePillarData>): AuthenticitePillarData {
  return {
    identite: p.identite ?? { archetype: "", citationFondatrice: "", noyauIdentitaire: "" },
    herosJourney: p.herosJourney ?? { acte1Origines: "", acte2Appel: "", acte3Epreuves: "", acte4Transformation: "", acte5Revelation: "" },
    ikigai: p.ikigai ?? { aimer: "", competence: "", besoinMonde: "", remuneration: "" },
    valeurs: Array.isArray(p.valeurs) ? p.valeurs : [],
    hierarchieCommunautaire: Array.isArray(p.hierarchieCommunautaire) ? p.hierarchieCommunautaire : [],
    timelineNarrative: p.timelineNarrative ?? { origines: "", croissance: "", pivot: "", futur: "" },
  };
}

function applyDistinctionDefaults(p: Partial<DistinctionPillarData>): DistinctionPillarData {
  return {
    personas: Array.isArray(p.personas) ? p.personas : [],
    paysageConcurrentiel: p.paysageConcurrentiel ?? { concurrents: [], avantagesCompetitifs: [] },
    promessesDeMarque: p.promessesDeMarque ?? { promesseMaitre: "", sousPromesses: [] },
    positionnement: p.positionnement ?? "",
    tonDeVoix: p.tonDeVoix ?? { personnalite: "", onDit: [], onNeditPas: [] },
    identiteVisuelle: p.identiteVisuelle ?? { directionArtistique: "", paletteCouleurs: [], mood: "" },
    assetsLinguistiques: p.assetsLinguistiques ?? { mantras: [], vocabulaireProprietaire: [] },
  };
}

function applyValeurDefaults(p: Partial<ValeurPillarData>): ValeurPillarData {
  return {
    productLadder: Array.isArray(p.productLadder) ? p.productLadder : [],
    valeurMarque: p.valeurMarque ?? { tangible: [], intangible: [] },
    valeurClient: p.valeurClient ?? { fonctionnels: [], emotionnels: [], sociaux: [] },
    coutMarque: p.coutMarque ?? { capex: "", opex: "", coutsCaches: [] },
    coutClient: p.coutClient ?? { frictions: [] },
    unitEconomics: p.unitEconomics ?? { cac: "", ltv: "", ratio: "", pointMort: "", marges: "", notes: "" },
  };
}

function applyEngagementDefaults(p: Partial<EngagementPillarData>): EngagementPillarData {
  return {
    touchpoints: Array.isArray(p.touchpoints) ? p.touchpoints : [],
    rituels: Array.isArray(p.rituels) ? p.rituels : [],
    principesCommunautaires: p.principesCommunautaires ?? { principes: [], tabous: [] },
    gamification: Array.isArray(p.gamification) ? p.gamification : [],
    aarrr: p.aarrr ?? { acquisition: "", activation: "", retention: "", revenue: "", referral: "" },
    kpis: Array.isArray(p.kpis) ? p.kpis : [],
  };
}
