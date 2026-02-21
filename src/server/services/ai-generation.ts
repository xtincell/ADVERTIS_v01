// =============================================================================
// MODULE 7 — AI Generation Engine (Pillars A-D-V-E + Synthese S)
// =============================================================================
//
// Generates strategic content for ADVERTIS pillars using Claude AI.
// All pillars produce structured JSON (not markdown). Each pillar builds
// on context from previously generated pillars (cascade pattern).
//
// PUBLIC API :
//   7.1  generatePillarContent()    — Generates A/D/V/E pillar content (structured JSON)
//   7.2  generateSyntheseContent()  — Generates Pillar S (strategic synthesis)
//
// INTERNAL :
//   7.H1  getSystemPrompt()     — Pillar-specific system prompt builder
//   7.H2  buildUserPrompt()     — Interview data + cascade context assembler
//   7.H3  parseAiResponse()     — JSON extraction from AI output
//
// DEPENDENCIES :
//   - Module 5  (anthropic-client) → resilientGenerateText, anthropic, DEFAULT_MODEL
//   - Module 5B (prompt-helpers)   → injectSpecialization (via GenerationOptions)
//   - lib/constants (PILLAR_CONFIG, VERTICAL_DICTIONARY, MATURITY_CONFIG)
//   - lib/interview-schema → getInterviewSchema()
//
// CALLED BY :
//   - API Route POST /api/ai/generate (pillarType A/D/V/E/S)
//   - Module 10 (fiche-upgrade.ts) → regenerateAllPillars()
//
// =============================================================================

import { PILLAR_CONFIG, VERTICAL_DICTIONARY, MATURITY_CONFIG } from "~/lib/constants";
import type { PillarType, MaturityProfile } from "~/lib/constants";
import { getInterviewSchema } from "~/lib/interview-schema";
import { anthropic, DEFAULT_MODEL, resilientGenerateText } from "./anthropic-client";

import type { SynthesePillarData } from "~/lib/types/pillar-data";
import { parseAiGeneratedContent } from "~/lib/types/pillar-parsers";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Options for Phase 1 brand tree / vertical / maturity context injection.
 */
export interface GenerationOptions {
  parentContext?: {
    brandName: string;
    nodeType?: string;
    pillars: Array<{ type: string; summary: string | null }>;
  };
  vertical?: string;
  maturityProfile?: string;
}

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
  options?: GenerationOptions,
  tagline?: string | null,
): Promise<unknown> {
  const systemPrompt = getSystemPrompt(pillarType, options);
  const userPrompt = buildUserPrompt(
    pillarType,
    interviewData,
    previousPillars,
    brandName,
    sector,
    options,
    tagline,
  );

  const result = await resilientGenerateText({
    label: `pillar-${pillarType}`,
    model: anthropic(DEFAULT_MODEL),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 6000,
  });

  // Parse + validate with Zod schema (applies defaults for missing fields)
  const { data, errors } = parseAiGeneratedContent(pillarType, result.text);
  if (errors?.length) {
    console.warn(`[AI Generation] Pillar ${pillarType} validation issues:`, errors);
  }
  return data;
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
  options?: GenerationOptions,
  tagline?: string | null,
): Promise<SynthesePillarData> {
  const systemPrompt = getSystemPrompt("S", options);
  const userPrompt = buildUserPrompt(
    "S",
    interviewData,
    allPillars,
    brandName,
    sector,
    options,
    tagline,
  );

  const result = await resilientGenerateText({
    label: "pillar-S-synthese",
    model: anthropic(DEFAULT_MODEL),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 8000,
    temperature: 0.3,
  });

  const { data, errors } = parseAiGeneratedContent<SynthesePillarData>("S", result.text);
  if (errors?.length) {
    console.warn("[AI Generation] Pillar S validation issues:", errors);
  }
  return data;
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
  "scoreCoherence": 75,
  "axesStrategiques": [
    {
      "axe": "Nom de l'axe stratégique (ex: Différenciation premium)",
      "description": "Description détaillée de l'axe et comment il se décline",
      "piliersLies": ["A", "D", "V"],
      "kpisCles": ["KPI mesurable 1", "KPI mesurable 2"]
    }
  ],
  "sprint90Recap": {
    "actions": [
      { "action": "Action prioritaire sprint 90j", "owner": "Qui (ex: Marketing)", "kpi": "KPI de suivi", "status": "à faire" }
    ],
    "summary": "Résumé narratif du sprint 90 jours"
  },
  "campaignsSummary": {
    "totalCampaigns": 6,
    "highlights": ["Campagne 1 — desc courte", "Campagne 2 — desc courte"],
    "budgetTotal": "Budget annuel estimé"
  },
  "activationSummary": "Résumé du dispositif d'activation : canaux, outils, stack techno",
  "kpiDashboard": [
    { "pilier": "A", "kpi": "Reconnaissance de marque", "cible": "+20% en 6 mois", "statut": "à mesurer" }
  ]
}

INSTRUCTIONS :
- Génère 5-7 facteurs clés de succès et 8-10 recommandations prioritaires ordonnées.
- Le scoreCoherence reflète la cohérence globale entre les piliers (0-100).
- axesStrategiques : 3-5 axes déduits des piliers D (positionnement, promesses) + I (activation). Chaque axe doit lier au moins 2 piliers.
- sprint90Recap : Extrait les 8-12 actions les plus urgentes du pilier I (sprint90Days) avec propriétaire et KPI.
- campaignsSummary : Résume le calendrier annuel de campagnes du pilier I (campaigns.annualCalendar). Nombre total, highlights, budget.
- activationSummary : Résume le dispositif d'activation du pilier I (activationDispositif) en 3-5 phrases.
- kpiDashboard : Consolide 1-2 KPIs par pilier (A-D-V-E-R-T-I) pour un tableau de bord stratégique global.
${JSON_RULES}`,
};

function getSystemPrompt(pillarType: string, options?: GenerationOptions): string {
  let prompt =
    SYSTEM_PROMPTS[pillarType] ??
    `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS. Génère le contenu stratégique structuré pour le pilier ${pillarType} en JSON.
${JSON_RULES}`;

  // Append maturity profile instructions
  if (options?.maturityProfile) {
    const config = MATURITY_CONFIG[options.maturityProfile as MaturityProfile];
    if (config) {
      prompt += `\n\nPROFIL DE MATURITÉ : ${options.maturityProfile} (${config.ratio} descriptif/projectif)
- Mode de génération : ${config.generationMode}
- Focus cockpit : ${config.cockpitFocus}
- Si le profil est STARTUP ou LAUNCH, privilégie les recommandations et hypothèses plutôt que les descriptions factuelles.
- Si le profil est MATURE, base-toi uniquement sur les données fournies, pas de projections.`;
    }
  }

  // Append vertical vocabulary instructions (system-level reinforcement)
  if (options?.vertical && VERTICAL_DICTIONARY[options.vertical]) {
    const dict = VERTICAL_DICTIONARY[options.vertical]!;
    const vocab = Object.entries(dict)
      .map(([key, val]) => `${key}="${val}"`)
      .join(", ");
    prompt += `\n\nVERTICAL : ${options.vertical}\nVocabulaire sectoriel : ${vocab}\nIMPORTANT : Utilise systématiquement le vocabulaire sectoriel ci-dessus au lieu des termes génériques.`;
  }

  return prompt;
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
  options?: GenerationOptions,
  tagline?: string | null,
): string {
  const pillarConfig = PILLAR_CONFIG[pillarType as PillarType];
  const schema = getInterviewSchema();
  const pillarSection = schema.find((s) => s.pillarType === pillarType);

  // Header
  const lines: string[] = [
    `# Marque : ${brandName}`,
    ...(tagline ? [`# Accroche : "${tagline}"`] : []),
    `# Secteur : ${sector || "Non spécifié"}`,
    `# Pilier : ${pillarType} — ${pillarConfig?.title ?? pillarType}`,
  ];

  // Vertical vocabulary injection
  if (options?.vertical && VERTICAL_DICTIONARY[options.vertical]) {
    const dict = VERTICAL_DICTIONARY[options.vertical]!;
    const vocabParts = Object.entries(dict)
      .map(([key, val]) => `${key}="${val}"`)
      .join(", ");
    lines.push(`# Vertical : ${options.vertical}`);
    lines.push(`# Vocabulaire sectoriel : ${vocabParts}`);
    lines.push(
      "IMPORTANT : Utilise le vocabulaire sectoriel ci-dessus au lieu des termes génériques.",
    );
  }

  lines.push("");

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

  // Parent brand context (for child strategies in brand tree)
  if (options?.parentContext) {
    const pc = options.parentContext;
    lines.push("## Contexte de la marque parente");
    lines.push(
      `Ce nœud est un ${options.parentContext.nodeType ?? "enfant"} de la marque **${pc.brandName}**.`,
    );
    lines.push(
      "Le contenu généré doit être cohérent avec la stratégie parent tout en étant spécifique à ce nœud.",
    );
    lines.push("");

    for (const pp of pc.pillars) {
      if (pp.summary) {
        const ppConfig = PILLAR_CONFIG[pp.type as PillarType];
        lines.push(
          `- **Pilier ${pp.type} — ${ppConfig?.title ?? pp.type}** : ${pp.summary.substring(0, 500)}`,
        );
      }
    }
    lines.push("");
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
// JSON parsing + defaults: handled by Zod schemas in pillar-parsers.ts
// ---------------------------------------------------------------------------
