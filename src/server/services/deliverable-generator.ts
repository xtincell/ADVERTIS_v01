// =============================================================================
// MODULE 23 — Deliverable Generator
// =============================================================================
//
// AI-powered generation of UPGRADERS deliverables from existing pillar data.
// Each generator function reads the strategy's pillar data (A-D-V-E-R-T-I-S),
// builds a contextualised prompt, and returns validated structured JSON.
//
// PUBLIC API :
//   23.1  generateBigIdeaKit()         — T04: Big Idea Kit for an occasion
//   23.2  generateCreativeStrategy()   — T06: Full creative strategy
//   23.3  generateOperationalBudget()  — M1: 3-layer budget
//   23.4  generateChronoTasks()        — M2: Chrono-architecture tasks
//   23.5  generatePartners()           — M3: Partner recommendations
//   23.6  generateMarketAdaptation()   — M5: Multi-market adaptation
//   23.7  generateFunnelMapping()      — M7: Funnel mapping + matrices
//
// DEPENDENCIES :
//   - Module 5  (anthropic-client) → resilientGenerateText, anthropic, DEFAULT_MODEL
//   - Module 5B (prompt-helpers)   → injectSpecialization
//   - Module 22 (ai-cost-tracker)  → trackAICall
//   - lib/types/deliverable-schemas → Zod schemas for validation
//
// CALLED BY :
//   - deliverables tRPC router (generate mutations)
//
// =============================================================================

import {
  anthropic,
  DEFAULT_MODEL,
  resilientGenerateText,
} from "./anthropic-client";
import { injectSpecialization, type SpecializationOptions } from "./prompt-helpers";
import { trackAICall } from "./ai-cost-tracker";
import { db } from "~/server/db";

import {
  BigIdeaItemSchema,
  CreativeStrategyDataSchema,
  BudgetLayer1Schema,
  BudgetLayer2Schema,
  BudgetLayer3Schema,
  FunnelMappingContentSchema,
  type CreativeStrategyData,
  type FunnelMappingContent,
} from "~/lib/types/deliverable-schemas";
import type { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StrategyContext {
  brandName: string;
  sector: string;
  tagline?: string | null;
  currency: string;
  pillarSummary: string;
  implementationSummary: string;
  specialization?: SpecializationOptions | null;
}

interface GenerationResult<T> {
  data: T;
  tokensUsed: number;
}

// ---------------------------------------------------------------------------
// JSON Rules (shared)
// ---------------------------------------------------------------------------

const JSON_RULES = `RÈGLES CRITIQUES :
- Réponds UNIQUEMENT avec du JSON valide
- Pas de commentaires, pas de markdown, pas de texte avant/après le JSON
- Remplis TOUS les champs avec des données concrètes et spécifiques
- Si une donnée n'est pas disponible, propose une recommandation réaliste`;

// ---------------------------------------------------------------------------
// Context builder — assembles pillar data for prompts
// ---------------------------------------------------------------------------

export async function buildStrategyContext(
  strategyId: string,
): Promise<StrategyContext> {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: {
      id: true,
      brandName: true,
      sector: true,
      tagline: true,
      currency: true,
      vertical: true,
      maturityProfile: true,
      // Pillar contents
      pillars: {
        select: { type: true, content: true },
        orderBy: { type: "asc" },
      },
    },
  });

  if (!strategy) throw new Error("Stratégie non trouvée");

  // Build pillar summary (A-D-V-E-R-T-I-S truncated to keep prompt size manageable)
  const pillarSummary = (strategy.pillars ?? [])
    .map((p) => {
      const content = typeof p.content === "string"
        ? p.content
        : JSON.stringify(p.content ?? "");
      const truncated = content.length > 3000
        ? content.substring(0, 3000) + "\n[... tronqué ...]"
        : content;
      return `### Pilier ${p.type}\n${truncated}`;
    })
    .join("\n\n");

  // Build implementation summary from Pillar I
  let implementationSummary = "";
  const pillarI = (strategy.pillars ?? []).find((p) => p.type === "I");
  if (pillarI?.content) {
    const implStr = typeof pillarI.content === "string"
      ? pillarI.content
      : JSON.stringify(pillarI.content);
    implementationSummary = implStr.length > 5000
      ? implStr.substring(0, 5000) + "\n[... tronqué ...]"
      : implStr;
  }

  return {
    brandName: strategy.brandName ?? "Marque",
    sector: strategy.sector ?? "Non spécifié",
    tagline: strategy.tagline,
    currency: strategy.currency ?? "XAF",
    pillarSummary,
    implementationSummary,
    specialization: {
      vertical: strategy.vertical,
      maturityProfile: strategy.maturityProfile,
    },
  };
}

// ---------------------------------------------------------------------------
// JSON parsing helper
// ---------------------------------------------------------------------------

function parseJsonResponse(text: string): unknown {
  let jsonString = text.trim();
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    jsonString = jsonMatch[1].trim();
  }
  return JSON.parse(jsonString);
}

// ---------------------------------------------------------------------------
// 23.1  T04 — Big Idea Kit Generator
// ---------------------------------------------------------------------------

interface BigIdeaKitResult {
  occasion: string;
  insight: string;
  ideas: Array<{
    id: string;
    title: string;
    concept: string;
    copy?: string;
    visual?: string;
    priority: "P0" | "P1" | "P2";
    funnelStage?: string;
  }>;
}

export async function generateBigIdeaKit(
  strategyId: string,
  occasion: string,
  userId: string,
): Promise<BigIdeaKitResult> {
  const ctx = await buildStrategyContext(strategyId);
  const start = Date.now();

  const { text, usage } = await resilientGenerateText({
    label: "deliverable-big-idea-kit",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`Tu es un directeur de création publicitaire senior utilisant la méthodologie ADVERTIS.
Tu génères un Big Idea Kit pour une occasion/moment marketing spécifique.

CONTEXTE MARQUE :
- Marque : ${ctx.brandName}
- Secteur : ${ctx.sector}
${ctx.tagline ? `- Accroche : "${ctx.tagline}"` : ""}

DONNÉES STRATÉGIQUES :
${ctx.pillarSummary.substring(0, 4000)}

OCCASION CIBLE : "${occasion}"

INSTRUCTIONS :
1. Formule un insight consommateur lié à cette occasion
2. Génère 3 à 5 idées créatives avec copies et indications visuelles
3. Classe chaque idée en priorité (P0=nécessaire, P1=recommandé, P2=facultatif)
4. Assigne un étage funnel à chaque idée (awareness/consideration/conversion/loyalty)

FORMAT JSON :
{
  "occasion": "${occasion}",
  "insight": "Insight consommateur puissant...",
  "ideas": [
    {
      "id": "idea-1",
      "title": "Titre court de l'idée",
      "concept": "Description du concept créatif (2-3 phrases)",
      "copy": "Accroche / copy principale",
      "visual": "Description du visuel recommandé",
      "priority": "P0",
      "funnelStage": "awareness"
    }
  ]
}

${JSON_RULES}`, ctx.specialization),
    prompt: `Génère un Big Idea Kit pour l'occasion "${occasion}" pour la marque "${ctx.brandName}" (secteur: ${ctx.sector}).`,
    maxOutputTokens: 4000,
    temperature: 0.5,
  });

  const parsed = parseJsonResponse(text) as BigIdeaKitResult;

  // Validate ideas
  const validatedIdeas = (parsed.ideas ?? []).map((idea, i) => {
    const result = BigIdeaItemSchema.safeParse({
      ...idea,
      id: idea.id ?? `idea-${i + 1}`,
    });
    return result.success ? result.data : {
      id: `idea-${i + 1}`,
      title: idea.title ?? `Idée ${i + 1}`,
      concept: idea.concept ?? "",
      priority: "P1" as const,
    };
  });

  // Track cost
  const elapsed = Date.now() - start;
  await trackAICall({
    model: DEFAULT_MODEL,
    tokensIn: usage?.inputTokens ?? 0,
    tokensOut: usage?.outputTokens ?? 0,
    generationType: "deliverable-big-idea-kit",
    strategyId,
    durationMs: elapsed,
  }, userId).catch(console.error);

  return {
    occasion: parsed.occasion ?? occasion,
    insight: parsed.insight ?? "",
    ideas: validatedIdeas,
  };
}

// ---------------------------------------------------------------------------
// 23.2  T06 — Creative Strategy Generator
// ---------------------------------------------------------------------------

export async function generateCreativeStrategy(
  strategyId: string,
  userId: string,
): Promise<CreativeStrategyData> {
  const ctx = await buildStrategyContext(strategyId);
  const start = Date.now();

  const { text, usage } = await resilientGenerateText({
    label: "deliverable-creative-strategy",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`Tu es un directeur artistique et stratège créatif utilisant la méthodologie ADVERTIS.
Tu génères une stratégie créative complète à partir des données stratégiques de la marque.

CONTEXTE MARQUE :
- Marque : ${ctx.brandName}
- Secteur : ${ctx.sector}
${ctx.tagline ? `- Accroche : "${ctx.tagline}"` : ""}

DONNÉES STRATÉGIQUES :
${ctx.pillarSummary.substring(0, 5000)}

${ctx.implementationSummary ? `DONNÉES D'IMPLÉMENTATION :\n${ctx.implementationSummary.substring(0, 3000)}` : ""}

INSTRUCTIONS — Génère une stratégie créative complète avec :
1. Key Visual : description détaillée, éléments graphiques clés, palette couleurs (codes hex)
2. Système Graphique : typographie recommandée, couleurs codifiées (nom + hex + usage), guidelines
3. Manifeste : texte inspirant de marque (4-8 phrases)
4. Copies par canal : 4-6 adaptations (headline + body + CTA par canal)
5. Guidelines tonales : ton de voix + liste DO / DON'T

FORMAT JSON :
{
  "moodboard": [
    { "description": "Ambiance visuelle 1", "tags": ["tag1", "tag2"] }
  ],
  "keyVisual": {
    "description": "Description détaillée du key visual",
    "elements": ["élément1", "élément2", "élément3"],
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"]
  },
  "graphicSystem": {
    "typography": "Police principale + secondaire + recommandations",
    "colorCodes": [
      { "name": "Couleur primaire", "hex": "#000000", "usage": "Titres et accents" }
    ],
    "guidelines": ["Guideline 1", "Guideline 2"]
  },
  "manifesto": "Texte du manifeste de marque...",
  "copiesByChannel": [
    { "channel": "Instagram", "headline": "Accroche", "body": "Texte", "cta": "Action", "format": "Carousel" }
  ],
  "tonalGuidelines": {
    "tone": "Description du ton de voix",
    "doList": ["Faire 1", "Faire 2"],
    "dontList": ["Ne pas faire 1", "Ne pas faire 2"]
  }
}

${JSON_RULES}`, ctx.specialization),
    prompt: `Génère la stratégie créative complète pour la marque "${ctx.brandName}" (secteur: ${ctx.sector}).`,
    maxOutputTokens: 6000,
    temperature: 0.4,
  });

  const parsed = parseJsonResponse(text);
  const validated = CreativeStrategyDataSchema.safeParse(parsed);

  const elapsed = Date.now() - start;
  await trackAICall({
    model: DEFAULT_MODEL,
    tokensIn: usage?.inputTokens ?? 0,
    tokensOut: usage?.outputTokens ?? 0,
    generationType: "deliverable-creative-strategy",
    strategyId,
    durationMs: elapsed,
  }, userId).catch(console.error);

  if (validated.success) return validated.data;

  // Fallback: return partial data with defaults
  console.warn("[Deliverable Gen] Creative strategy validation issues:", validated.error.errors);
  return CreativeStrategyDataSchema.parse(parsed ?? {});
}

// ---------------------------------------------------------------------------
// 23.3  M1 — Operational Budget Generator (3 layers)
// ---------------------------------------------------------------------------

interface OperationalBudgetResult {
  layer1Vision: ReturnType<typeof BudgetLayer1Schema.parse>;
  layer2Detail: ReturnType<typeof BudgetLayer2Schema.parse>;
  layer3Scenarios: ReturnType<typeof BudgetLayer3Schema.parse>;
  currency: string;
}

export async function generateOperationalBudget(
  strategyId: string,
  userId: string,
): Promise<OperationalBudgetResult> {
  const ctx = await buildStrategyContext(strategyId);
  const start = Date.now();

  const { text, usage } = await resilientGenerateText({
    label: "deliverable-operational-budget",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`Tu es un expert en gestion budgétaire de campagnes publicitaires utilisant la méthodologie ADVERTIS.
Tu génères un budget opérationnel 3 couches.

CONTEXTE MARQUE :
- Marque : ${ctx.brandName}
- Secteur : ${ctx.sector}
- Devise : ${ctx.currency}
${ctx.tagline ? `- Accroche : "${ctx.tagline}"` : ""}

DONNÉES STRATÉGIQUES :
${ctx.pillarSummary.substring(0, 3000)}

${ctx.implementationSummary ? `DONNÉES D'IMPLÉMENTATION (budget/campagnes) :\n${ctx.implementationSummary.substring(0, 4000)}` : ""}

INSTRUCTIONS — Génère un budget à 3 couches :

COUCHE 1 — VISION PHASE : Répartition globale par phase de campagne
COUCHE 2 — DÉTAIL : Liste détaillée des activations avec coûts unitaires × quantités
COUCHE 3 — SCÉNARIOS P0/P1/P2 : Ventilation prioritaire

Les montants doivent être en ${ctx.currency} et réalistes pour le secteur "${ctx.sector}".

FORMAT JSON :
{
  "layer1Vision": {
    "phases": [
      { "name": "Préparation", "allocation": 3000000, "percentage": 15 },
      { "name": "Lancement", "allocation": 8000000, "percentage": 40 },
      { "name": "Activation", "allocation": 6000000, "percentage": 30 },
      { "name": "Bilan & Optimisation", "allocation": 3000000, "percentage": 15 }
    ],
    "totalBudget": 20000000,
    "decisionView": "Synthèse décisionnelle en 2-3 phrases"
  },
  "layer2Detail": {
    "activations": [
      { "name": "Production vidéo", "category": "Production", "unitCost": 500000, "quantity": 3, "subtotal": 1500000, "supplier": "Studio X" },
      { "name": "Campagne Facebook Ads", "category": "Média Digital", "unitCost": 200000, "quantity": 6, "subtotal": 1200000 }
    ]
  },
  "layer3Scenarios": {
    "P0": {
      "items": [{ "name": "Activation essentielle", "cost": 5000000 }],
      "total": 5000000
    },
    "P1": {
      "items": [{ "name": "Activation recommandée", "cost": 8000000 }],
      "total": 8000000
    },
    "P2": {
      "items": [{ "name": "Activation optionnelle", "cost": 7000000 }],
      "total": 7000000
    },
    "grandTotal": 20000000
  }
}

RÈGLES SPÉCIFIQUES :
- layer1Vision.phases : 3-5 phases, pourcentages totalisant 100%
- layer2Detail.activations : 8-15 lignes réalistes avec coûts unitaires cohérents
- layer3Scenarios : P0 = 25-35% du total, P1 = 35-45%, P2 = 20-30%
- Tous les montants sont des entiers (pas de décimales)
${JSON_RULES}`, ctx.specialization),
    prompt: `Génère le budget opérationnel 3 couches pour "${ctx.brandName}" (${ctx.sector}, devise: ${ctx.currency}).`,
    maxOutputTokens: 6000,
    temperature: 0.3,
  });

  const parsed = parseJsonResponse(text) as Record<string, unknown>;

  const l1 = BudgetLayer1Schema.parse(parsed.layer1Vision ?? {});
  const l2 = BudgetLayer2Schema.parse(parsed.layer2Detail ?? {});
  const l3 = BudgetLayer3Schema.parse(parsed.layer3Scenarios ?? {});

  const elapsed = Date.now() - start;
  await trackAICall({
    model: DEFAULT_MODEL,
    tokensIn: usage?.inputTokens ?? 0,
    tokensOut: usage?.outputTokens ?? 0,
    generationType: "deliverable-operational-budget",
    strategyId,
    durationMs: elapsed,
  }, userId).catch(console.error);

  return { layer1Vision: l1, layer2Detail: l2, layer3Scenarios: l3, currency: ctx.currency };
}

// ---------------------------------------------------------------------------
// 23.4  M2 — Chrono-Architecture Generator
// ---------------------------------------------------------------------------

interface ChronoTaskRaw {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  week: number;
  phase: string;
  owner?: string;
  status: string;
  priority: string;
  isValidationMilestone: boolean;
  dependencies?: string[];
}

export async function generateChronoTasks(
  strategyId: string,
  userId: string,
): Promise<ChronoTaskRaw[]> {
  const ctx = await buildStrategyContext(strategyId);
  const start = Date.now();

  const { text, usage } = await resilientGenerateText({
    label: "deliverable-chrono-tasks",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`Tu es un chef de projet campagne publicitaire senior utilisant la méthodologie ADVERTIS.
Tu génères un chronogramme détaillé (Gantt) pour la campagne.

CONTEXTE MARQUE :
- Marque : ${ctx.brandName}
- Secteur : ${ctx.sector}

DONNÉES STRATÉGIQUES :
${ctx.pillarSummary.substring(0, 3000)}

${ctx.implementationSummary ? `DONNÉES D'IMPLÉMENTATION :\n${ctx.implementationSummary.substring(0, 3000)}` : ""}

INSTRUCTIONS :
Génère 15-25 tâches réparties sur 12-16 semaines en 4 phases :
1. Préparation (S1-S3) : brief, validation, production
2. Lancement (S4-S7) : déploiement média, activation
3. Activation (S8-S12) : optimisation, engagement continu
4. Bilan (S13-S16) : reporting, capitalisation

Chaque tâche a une date de début/fin, un numéro de semaine, un responsable, une priorité, et peut être un jalon de validation.

FORMAT JSON — Tableau de tâches :
[
  {
    "title": "Brief créatif",
    "description": "Rédaction et validation du brief créatif principal",
    "startDate": "2026-03-02",
    "endDate": "2026-03-06",
    "week": 1,
    "phase": "Préparation",
    "owner": "Directeur Créatif",
    "status": "pending",
    "priority": "P0",
    "isValidationMilestone": false,
    "dependencies": []
  },
  {
    "title": "Validation Key Visual",
    "description": "Validation finale du key visual par le client",
    "startDate": "2026-03-09",
    "endDate": "2026-03-10",
    "week": 2,
    "phase": "Préparation",
    "owner": "Client",
    "status": "pending",
    "priority": "P0",
    "isValidationMilestone": true,
    "dependencies": ["Brief créatif"]
  }
]

RÈGLES :
- phase : "Préparation" | "Lancement" | "Activation" | "Bilan" (exact)
- status : "pending" pour toutes les tâches (générées, pas encore démarrées)
- priority : "P0" | "P1" | "P2"
- 3-5 jalons de validation (isValidationMilestone: true)
- Dates cohérentes, startDate <= endDate, semaines séquentielles
${JSON_RULES}`, ctx.specialization),
    prompt: `Génère le chronogramme de campagne pour "${ctx.brandName}" (${ctx.sector}).`,
    maxOutputTokens: 6000,
    temperature: 0.3,
  });

  const parsed = parseJsonResponse(text) as ChronoTaskRaw[];

  const elapsed = Date.now() - start;
  await trackAICall({
    model: DEFAULT_MODEL,
    tokensIn: usage?.inputTokens ?? 0,
    tokensOut: usage?.outputTokens ?? 0,
    generationType: "deliverable-chrono-tasks",
    strategyId,
    durationMs: elapsed,
  }, userId).catch(console.error);

  // Validate and filter
  return (Array.isArray(parsed) ? parsed : []).filter((t) =>
    t.title && t.startDate && t.endDate && t.week && t.phase,
  );
}

// ---------------------------------------------------------------------------
// 23.5  M3 — Partners Generator
// ---------------------------------------------------------------------------

interface PartnerRaw {
  name: string;
  type: string;
  category?: string;
  metrics?: {
    followers?: number;
    engagementRate?: number;
    reach?: number;
    audienceDemo?: string;
  };
  costEstimate?: number;
  market?: string;
  notes?: string;
}

export async function generatePartners(
  strategyId: string,
  userId: string,
  markets?: string[],
): Promise<PartnerRaw[]> {
  const ctx = await buildStrategyContext(strategyId);
  const start = Date.now();

  const marketsStr = markets?.length ? markets.join(", ") : "Cameroun";

  const { text, usage } = await resilientGenerateText({
    label: "deliverable-partners",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`Tu es un expert en partenariats et activation terrain utilisant la méthodologie ADVERTIS.
Tu recommandes des profils de partenaires pertinents pour la campagne.

CONTEXTE MARQUE :
- Marque : ${ctx.brandName}
- Secteur : ${ctx.sector}
- Marchés cibles : ${marketsStr}
- Devise : ${ctx.currency}

DONNÉES STRATÉGIQUES :
${ctx.pillarSummary.substring(0, 3000)}

INSTRUCTIONS :
Recommande 8-12 profils de partenaires répartis en 4 types :
1. INFLUENCER : Influenceurs/créateurs de contenu pertinents
2. TERRAIN : Partenaires d'activation terrain (événements, POS)
3. INSTITUTIONAL : Organisations, ONG, associations sectorielles
4. MEDIA : Régies, médias, plateformes

Pour chaque partenaire, donne un profil-type réaliste (pas de noms réels de personnes).

FORMAT JSON — Tableau de partenaires :
[
  {
    "name": "Profil Micro-Influenceur Lifestyle",
    "type": "INFLUENCER",
    "category": "Lifestyle & Mode",
    "metrics": {
      "followers": 50000,
      "engagementRate": 4.5,
      "reach": 25000,
      "audienceDemo": "18-35 ans, urbain, CSP+"
    },
    "costEstimate": 250000,
    "market": "CM",
    "notes": "Profil aligné avec le positionnement premium de la marque"
  }
]

RÈGLES :
- type : "INFLUENCER" | "TERRAIN" | "INSTITUTIONAL" | "MEDIA" (exact)
- costEstimate en ${ctx.currency} (entier)
- market : code ISO pays (CM, CI, SN, GH, NG, etc.)
- Minimum 2 partenaires par type
- Métriques réalistes pour le marché africain
${JSON_RULES}`, ctx.specialization),
    prompt: `Recommande des partenaires pour "${ctx.brandName}" (${ctx.sector}) sur les marchés : ${marketsStr}.`,
    maxOutputTokens: 4000,
    temperature: 0.4,
  });

  const parsed = parseJsonResponse(text) as PartnerRaw[];

  const elapsed = Date.now() - start;
  await trackAICall({
    model: DEFAULT_MODEL,
    tokensIn: usage?.inputTokens ?? 0,
    tokensOut: usage?.outputTokens ?? 0,
    generationType: "deliverable-partners",
    strategyId,
    durationMs: elapsed,
  }, userId).catch(console.error);

  return (Array.isArray(parsed) ? parsed : []).filter((p) => p.name && p.type);
}

// ---------------------------------------------------------------------------
// 23.6  M5 — Market Adaptation Generator
// ---------------------------------------------------------------------------

interface MarketAdaptationRaw {
  linguistic: {
    language?: string;
    dialect?: string;
    adaptations: string[];
    translations: Array<{ original: string; adapted: string; note?: string }>;
  };
  cultural: {
    taboos: string[];
    celebrations: string[];
    localInsights: string[];
    colorMeaning: Array<{ color: string; meaning: string }>;
  };
  distribution: {
    channels: string[];
    partnerships: string[];
    logistics: string;
  };
  media: {
    topChannels: string[];
    mediaHabits: string;
    digitalPenetration: number;
    costs: Array<{ channel: string; cost: number; unit: string }>;
  };
  regulatory: {
    restrictions: string[];
    requiredMentions: string[];
    approvalProcess: string;
  };
}

export async function generateMarketAdaptation(
  strategyId: string,
  countryCode: string,
  countryName: string,
  userId: string,
): Promise<MarketAdaptationRaw> {
  const ctx = await buildStrategyContext(strategyId);
  const start = Date.now();

  const { text, usage } = await resilientGenerateText({
    label: `deliverable-market-adaptation-${countryCode}`,
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`Tu es un expert en marketing international pour l'Afrique utilisant la méthodologie ADVERTIS.
Tu génères les 5 dimensions d'adaptation pour un marché cible.

CONTEXTE MARQUE :
- Marque : ${ctx.brandName}
- Secteur : ${ctx.sector}
- Marché cible : ${countryName} (${countryCode})

DONNÉES STRATÉGIQUES :
${ctx.pillarSummary.substring(0, 3000)}

INSTRUCTIONS — 5 dimensions d'adaptation pour ${countryName} :

1. LINGUISTIQUE : langue officielle, dialectes, adaptations sémantiques, traductions clés
2. CULTURELLE : tabous, célébrations locales, insights culturels, symbolique des couleurs
3. DISTRIBUTION : canaux de distribution, partenariats locaux, logistique
4. MÉDIA : top chaînes/médias, habitudes, pénétration digitale (%), coûts média
5. RÉGLEMENTAIRE : restrictions pub, mentions obligatoires, processus d'approbation

FORMAT JSON :
{
  "linguistic": {
    "language": "Français",
    "dialect": "Français camerounais / Pidgin",
    "adaptations": ["Adaptation 1", "Adaptation 2"],
    "translations": [
      { "original": "Terme original", "adapted": "Adaptation locale", "note": "Contexte" }
    ]
  },
  "cultural": {
    "taboos": ["Tabou 1"],
    "celebrations": ["Fête de la Jeunesse (11 février)", "Noël"],
    "localInsights": ["Insight local 1"],
    "colorMeaning": [{ "color": "Vert", "meaning": "Espoir, nature" }]
  },
  "distribution": {
    "channels": ["Supermarchés", "Marchés traditionnels", "E-commerce"],
    "partnerships": ["Partenaire local 1"],
    "logistics": "Notes logistiques"
  },
  "media": {
    "topChannels": ["CRTV", "Canal 2", "Facebook", "WhatsApp"],
    "mediaHabits": "Description des habitudes média",
    "digitalPenetration": 45,
    "costs": [{ "channel": "Facebook Ads", "cost": 150, "unit": "CPM XAF" }]
  },
  "regulatory": {
    "restrictions": ["Restriction 1"],
    "requiredMentions": ["Mention obligatoire 1"],
    "approvalProcess": "Process d'approbation"
  }
}

${JSON_RULES}`, ctx.specialization),
    prompt: `Génère les 5 dimensions d'adaptation pour "${ctx.brandName}" sur le marché ${countryName} (${countryCode}).`,
    maxOutputTokens: 5000,
    temperature: 0.3,
  });

  const parsed = parseJsonResponse(text) as MarketAdaptationRaw;

  const elapsed = Date.now() - start;
  await trackAICall({
    model: DEFAULT_MODEL,
    tokensIn: usage?.inputTokens ?? 0,
    tokensOut: usage?.outputTokens ?? 0,
    generationType: "deliverable-market-adaptation",
    strategyId,
    durationMs: elapsed,
    metadata: { country: countryCode },
  }, userId).catch(console.error);

  return parsed;
}

// ---------------------------------------------------------------------------
// 23.7  M7 — Funnel Mapping Generator
// ---------------------------------------------------------------------------

export async function generateFunnelMapping(
  strategyId: string,
  userId: string,
): Promise<FunnelMappingContent> {
  const ctx = await buildStrategyContext(strategyId);

  // Also fetch existing big idea kits for the matrix
  const bigIdeaKits = await db.bigIdeaKit.findMany({
    where: { strategyId },
    select: { id: true, occasion: true, ideas: true },
  });

  const bigIdeasContext = bigIdeaKits.length > 0
    ? `\nBIG IDEA KITS EXISTANTS :\n${bigIdeaKits.map((k) => {
        const ideas = Array.isArray(k.ideas) ? k.ideas as Array<{ title?: string; id?: string }> : [];
        return `- ${k.occasion}: ${ideas.map((i) => i.title ?? i.id ?? "").join(", ")}`;
      }).join("\n")}`
    : "";

  const start = Date.now();

  const { text, usage } = await resilientGenerateText({
    label: "deliverable-funnel-mapping",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`Tu es un expert en stratégie d'engagement et conversion utilisant la méthodologie ADVERTIS.
Tu génères le mapping funnel complet avec matrices.

CONTEXTE MARQUE :
- Marque : ${ctx.brandName}
- Secteur : ${ctx.sector}

DONNÉES STRATÉGIQUES :
${ctx.pillarSummary.substring(0, 3000)}

${ctx.implementationSummary ? `DONNÉES D'IMPLÉMENTATION :\n${ctx.implementationSummary.substring(0, 2000)}` : ""}
${bigIdeasContext}

INSTRUCTIONS — Funnel Mapping complet :

1. STAGES : Pour chaque étape (awareness/consideration/conversion/loyalty), définir :
   - Objectifs (2-3 par étape)
   - Canaux utilisés
   - KPIs avec cibles chiffrées

2. MATRICE BIG IDEA × FUNNEL : Si des Big Ideas existent, mapper chacune aux étapes pertinentes

3. MATRICE DE DÉCISION : Lister 5-10 activations avec coût, impact, priorité, étape funnel

FORMAT JSON :
{
  "stages": {
    "awareness": {
      "objectives": ["Objectif 1", "Objectif 2"],
      "channels": ["Facebook", "Instagram", "Affichage"],
      "kpis": [{ "metric": "Reach", "target": "500K impressions/mois", "source": "Meta Ads" }],
      "bigIdeas": []
    },
    "consideration": { ... },
    "conversion": { ... },
    "loyalty": { ... }
  },
  "bigIdeaMatrix": [
    { "ideaId": "idea-1", "ideaTitle": "Titre", "stages": ["awareness", "consideration"], "priority": "P0" }
  ],
  "decisionMatrix": [
    { "activation": "Campagne social ads", "cost": 2000000, "impact": "Fort", "priority": "P0", "stage": "awareness" }
  ]
}

RÈGLES :
- stages : les 4 étapes OBLIGATOIRES (awareness/consideration/conversion/loyalty)
- KPIs : cibles CHIFFRÉES et réalistes
- decisionMatrix : 5-10 lignes, coûts en ${ctx.currency}
- priority : "P0" | "P1" | "P2"
${JSON_RULES}`, ctx.specialization),
    prompt: `Génère le funnel mapping pour "${ctx.brandName}" (${ctx.sector}).`,
    maxOutputTokens: 5000,
    temperature: 0.3,
  });

  const parsed = parseJsonResponse(text);
  const validated = FunnelMappingContentSchema.safeParse(parsed);

  const elapsed = Date.now() - start;
  await trackAICall({
    model: DEFAULT_MODEL,
    tokensIn: usage?.inputTokens ?? 0,
    tokensOut: usage?.outputTokens ?? 0,
    generationType: "deliverable-funnel-mapping",
    strategyId,
    durationMs: elapsed,
  }, userId).catch(console.error);

  if (validated.success) return validated.data;

  console.warn("[Deliverable Gen] Funnel mapping validation issues:", validated.error.errors);
  return FunnelMappingContentSchema.parse(parsed ?? {});
}
