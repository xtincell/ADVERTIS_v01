// =============================================================================
// SERVICE S.GLORY.5 — Glory Field Enricher
// =============================================================================
// Enriches GLORY tool form fields with data from the strategy and related models.
// Returns suggestions, default values, dynamic options and contextual hints
// that make forms intelligent and pre-populated.
// Called by: tRPC glory.getFieldEnrichment
// =============================================================================

import { type PrismaClient } from "@prisma/client";
import { getToolBySlug } from "~/server/services/glory/registry";
import type { FieldEnrichment } from "~/lib/types/glory-tools";

// ---------------------------------------------------------------------------
// Types for queried data (cached per call)
// ---------------------------------------------------------------------------

interface StrategyData {
  brandName: string;
  sector: string | null;
  tagline: string | null;
  vertical: string | null;
  maturityProfile: string | null;
  currency: string;
  pillars: { type: string; content: unknown }[];
}

interface EnrichmentContext {
  strategy: StrategyData;
  budgetTiers: { tier: string; minBudget: number; maxBudget: number; channels: unknown; kpis: unknown; description: string | null }[];
  opportunities: { title: string; startDate: Date; endDate: Date | null; type: string; impact: string; channels: unknown }[];
  missions: { title: string; status: string; priority: string; description: string | null; estimatedCharge: number | null; currency: string }[];
  recentOutputs: { toolSlug: string; title: string; outputText: string | null }[];
}

// ---------------------------------------------------------------------------
// Safe JSON accessors
// ---------------------------------------------------------------------------

function safeGet(content: unknown, key: string): unknown {
  if (content && typeof content === "object" && key in (content as Record<string, unknown>)) {
    return (content as Record<string, unknown>)[key];
  }
  return undefined;
}

function safeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
  if (typeof value === "string") return [value];
  return [];
}

function safePillar(pillars: { type: string; content: unknown }[], type: string): unknown {
  return pillars.find((p) => p.type === type)?.content ?? null;
}

function formatCurrency(amount: number, currency: string): string {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} ${currency}`;
}

// ---------------------------------------------------------------------------
// Load all enrichment data in one batch
// ---------------------------------------------------------------------------

async function loadEnrichmentContext(
  strategyId: string,
  prisma: PrismaClient,
): Promise<EnrichmentContext | null> {
  const strategy = await prisma.strategy.findUnique({
    where: { id: strategyId },
    include: {
      pillars: {
        where: { status: "complete" },
        select: { type: true, content: true },
      },
    },
  });

  if (!strategy) return null;

  const [budgetTiers, opportunities, missions, recentOutputs] = await Promise.all([
    prisma.budgetTier.findMany({
      where: { strategyId },
      orderBy: { minBudget: "asc" },
    }),
    prisma.opportunityCalendar.findMany({
      where: { strategyId },
      orderBy: { startDate: "asc" },
    }),
    prisma.mission.findMany({
      where: { strategyId, status: { not: "CLOSED" } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.gloryOutput.findMany({
      where: { strategyId, status: "complete" },
      select: { toolSlug: true, title: true, outputText: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    strategy: {
      brandName: strategy.brandName,
      sector: strategy.sector,
      tagline: strategy.tagline,
      vertical: strategy.vertical,
      maturityProfile: strategy.maturityProfile,
      currency: strategy.currency,
      pillars: strategy.pillars,
    },
    budgetTiers,
    opportunities,
    missions,
    recentOutputs,
  };
}

// ---------------------------------------------------------------------------
// Per-field enrichment extractors
// ---------------------------------------------------------------------------

/** Extract campaign objective suggestions from pillar S axes + missions */
function enrichCampaignObjective(ctx: EnrichmentContext): FieldEnrichment {
  const suggestions: string[] = [];

  // From pillar S — axes stratégiques
  const pillarS = safePillar(ctx.strategy.pillars, "S");
  const axes = safeGet(pillarS, "axesStrategiques");
  if (axes) {
    const axeList = safeArray(axes);
    for (const a of axeList.slice(0, 5)) {
      if (typeof a === "string" && a.length > 5) suggestions.push(a);
    }
  }

  // From pillar I — roadmap objectives
  const pillarI = safePillar(ctx.strategy.pillars, "I");
  const roadmap = safeGet(pillarI, "roadmap");
  if (roadmap && typeof roadmap === "object" && !Array.isArray(roadmap)) {
    const items = safeGet(roadmap, "items") ?? safeGet(roadmap, "phases");
    if (Array.isArray(items)) {
      for (const item of items.slice(0, 3)) {
        const name = typeof item === "string" ? item : (item as Record<string, unknown>)?.name ?? (item as Record<string, unknown>)?.objectif;
        if (typeof name === "string" && name.length > 5) suggestions.push(name);
      }
    }
  }

  // From active missions
  for (const m of ctx.missions.slice(0, 3)) {
    if (m.title && m.title.length > 5) suggestions.push(m.title);
  }

  return { suggestions: [...new Set(suggestions)].slice(0, 6) };
}

/** Extract big idea suggestions from recent concept-generator outputs */
function enrichBigIdea(ctx: EnrichmentContext): FieldEnrichment {
  const suggestions: string[] = [];
  const conceptOutputs = ctx.recentOutputs.filter((o) => o.toolSlug === "concept-generator");
  for (const o of conceptOutputs.slice(0, 5)) {
    if (o.title) suggestions.push(o.title);
  }
  if (suggestions.length === 0) {
    // Fallback: from pillar A archetype
    const pillarA = safePillar(ctx.strategy.pillars, "A");
    const archetype = safeGet(pillarA, "archetype");
    if (archetype && typeof archetype === "string") {
      suggestions.push(`Big idea basée sur l'archétype : ${archetype.substring(0, 100)}`);
    }
  }
  return { suggestions };
}

/** Extract budget default from BudgetTiers or pillar I */
function enrichBudget(ctx: EnrichmentContext): FieldEnrichment {
  const currency = ctx.strategy.currency;

  if (ctx.budgetTiers.length > 0) {
    // Find a middle tier (IMPACT or the median)
    const midTier = ctx.budgetTiers.find((t) => t.tier === "IMPACT")
      ?? ctx.budgetTiers[Math.floor(ctx.budgetTiers.length / 2)];

    if (midTier) {
      const min = formatCurrency(midTier.minBudget, currency);
      const max = formatCurrency(midTier.maxBudget, currency);
      return {
        defaultValue: formatCurrency(midTier.minBudget, currency),
        contextHint: `Tier ${midTier.tier} : ${min} — ${max}`,
        suggestions: ctx.budgetTiers.map(
          (t) => `${t.tier}: ${formatCurrency(t.minBudget, currency)} — ${formatCurrency(t.maxBudget, currency)}`,
        ),
      };
    }
  }

  // Fallback from pillar I budget
  const pillarI = safePillar(ctx.strategy.pillars, "I");
  const budget = safeGet(pillarI, "budget");
  if (budget) {
    const enveloppe = safeGet(budget, "enveloppeGlobale") ?? safeGet(budget, "total");
    if (enveloppe && typeof enveloppe === "string") {
      return { defaultValue: enveloppe, contextHint: `Budget global (Pilier I) : ${enveloppe}` };
    }
  }

  return {};
}

/** Extract duration suggestions from OpportunityCalendar windows */
function enrichDuration(ctx: EnrichmentContext): FieldEnrichment {
  if (ctx.opportunities.length === 0) return {};

  const suggestions: string[] = [];
  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });

  for (const opp of ctx.opportunities.slice(0, 4)) {
    const start = fmt(opp.startDate);
    const end = opp.endDate ? fmt(opp.endDate) : "";
    suggestions.push(`${opp.title} (${start}${end ? ` — ${end}` : ""})`);
  }

  return { suggestions };
}

/** Extract channel options from BudgetTier channels + pillar E touchpoints */
function enrichChannels(ctx: EnrichmentContext): FieldEnrichment {
  const channelSet = new Set<string>();

  // From BudgetTiers
  for (const t of ctx.budgetTiers) {
    if (Array.isArray(t.channels)) {
      for (const ch of t.channels) {
        const name = typeof ch === "string" ? ch : (ch as Record<string, unknown>)?.channel;
        if (typeof name === "string") channelSet.add(name.toLowerCase());
      }
    }
  }

  // From pillar E touchpoints
  const pillarE = safePillar(ctx.strategy.pillars, "E");
  const touchpoints = safeGet(pillarE, "touchpoints");
  if (touchpoints) {
    const tpList = safeArray(touchpoints);
    for (const tp of tpList) channelSet.add(tp.toLowerCase());
  }

  if (channelSet.size === 0) return {};

  const dynamicOptions = Array.from(channelSet).map((ch) => ({
    value: ch,
    label: ch.charAt(0).toUpperCase() + ch.slice(1),
  }));

  return { dynamicOptions };
}

/** Extract insight suggestions from pillar D personas */
function enrichInsight(ctx: EnrichmentContext): FieldEnrichment {
  const suggestions: string[] = [];

  const pillarD = safePillar(ctx.strategy.pillars, "D");
  const personas = safeGet(pillarD, "personas");
  if (Array.isArray(personas)) {
    for (const p of personas.slice(0, 4)) {
      const insight = (p as Record<string, unknown>)?.insight
        ?? (p as Record<string, unknown>)?.frustration
        ?? (p as Record<string, unknown>)?.besoin;
      if (typeof insight === "string" && insight.length > 5) suggestions.push(insight);
    }
  }

  // From pillar T market reality
  const pillarT = safePillar(ctx.strategy.pillars, "T");
  const marketReality = safeGet(pillarT, "marketReality");
  if (typeof marketReality === "string" && marketReality.length > 10) {
    suggestions.push(marketReality.substring(0, 150));
  }

  return { suggestions: suggestions.slice(0, 5) };
}

/** Extract tonality default from pillar A archetype */
function enrichTonality(ctx: EnrichmentContext): FieldEnrichment {
  const pillarA = safePillar(ctx.strategy.pillars, "A");
  const archetype = safeGet(pillarA, "archetype");

  if (!archetype) return {};

  const archetypeStr = typeof archetype === "string"
    ? archetype.toLowerCase()
    : JSON.stringify(archetype).toLowerCase();

  // Map archetypes to tonalities
  const mapping: Record<string, string> = {
    sage: "Corporate",
    hero: "Premium",
    rebel: "Jeune",
    jester: "Humoristique",
    lover: "Émotionnel",
    creator: "Premium",
    ruler: "Corporate",
    magician: "Premium",
    innocent: "Populaire",
    explorer: "Jeune",
    caregiver: "Émotionnel",
    everyman: "Populaire",
  };

  for (const [key, tone] of Object.entries(mapping)) {
    if (archetypeStr.includes(key)) {
      return { defaultValue: tone.toLowerCase(), contextHint: `Tonalité suggérée depuis l'archétype de marque` };
    }
  }

  return {};
}

/** Extract concept suggestions from recent concept-generator outputs */
function enrichConcept(ctx: EnrichmentContext): FieldEnrichment {
  const suggestions: string[] = [];
  const outputs = ctx.recentOutputs.filter((o) => o.toolSlug === "concept-generator");
  for (const o of outputs.slice(0, 5)) {
    if (o.outputText) {
      const preview = o.outputText.length > 150 ? o.outputText.substring(0, 150) + "…" : o.outputText;
      suggestions.push(`${o.title}: ${preview}`);
    } else {
      suggestions.push(o.title);
    }
  }
  return { suggestions };
}

/** Extract deliverables from active missions */
function enrichDeliverables(ctx: EnrichmentContext): FieldEnrichment {
  const suggestions: string[] = [];
  for (const m of ctx.missions.slice(0, 5)) {
    if (m.description) {
      suggestions.push(`[${m.title}] ${m.description.substring(0, 120)}`);
    } else {
      suggestions.push(m.title);
    }
  }
  return { suggestions };
}

/** Extract platform suggestions from pillar E */
function enrichPlatforms(ctx: EnrichmentContext): FieldEnrichment {
  const pillarE = safePillar(ctx.strategy.pillars, "E");
  const touchpoints = safeGet(pillarE, "touchpoints");
  if (!touchpoints) return {};

  const platforms = new Set<string>();
  const tpList = safeArray(touchpoints);

  const platformMap: Record<string, string> = {
    facebook: "facebook",
    instagram: "instagram",
    tiktok: "tiktok",
    linkedin: "linkedin",
    twitter: "twitter",
    whatsapp: "whatsapp",
    youtube: "youtube",
    threads: "threads",
  };

  for (const tp of tpList) {
    const lower = tp.toLowerCase();
    for (const [key, value] of Object.entries(platformMap)) {
      if (lower.includes(key)) platforms.add(value);
    }
  }

  if (platforms.size === 0) return {};
  return {
    dynamicOptions: Array.from(platforms).map((p) => ({
      value: p,
      label: p.charAt(0).toUpperCase() + p.slice(1),
    })),
  };
}

/** Extract events from OpportunityCalendar */
function enrichEvents(ctx: EnrichmentContext): FieldEnrichment {
  if (ctx.opportunities.length === 0) return {};
  const suggestions = ctx.opportunities.slice(0, 6).map((o) => {
    const date = o.startDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    return `${o.title} (${date}, ${o.type})`;
  });
  return { suggestions };
}

/** Extract campaign context from active missions */
function enrichCampaignContext(ctx: EnrichmentContext): FieldEnrichment {
  const suggestions = ctx.missions.slice(0, 5).map((m) => {
    const charge = m.estimatedCharge ? ` — ${formatCurrency(m.estimatedCharge, m.currency)}` : "";
    return `${m.title} [${m.status}]${charge}`;
  });
  return { suggestions };
}

/** Extract sector/market info */
function enrichSector(ctx: EnrichmentContext): FieldEnrichment {
  const sector = ctx.strategy.sector;
  if (sector) return { defaultValue: sector };
  return {};
}

/** Extract market from strategy vertical */
function enrichMarket(ctx: EnrichmentContext): FieldEnrichment {
  const vertical = ctx.strategy.vertical;
  if (!vertical) return {};

  // Try to map vertical to a known market code
  const marketMap: Record<string, string> = {
    cameroun: "CM",
    cameroon: "CM",
    cm: "CM",
    "cote d'ivoire": "CI",
    "côte d'ivoire": "CI",
    ci: "CI",
    senegal: "SN",
    sénégal: "SN",
    sn: "SN",
    ghana: "GH",
    gh: "GH",
    nigeria: "NG",
    ng: "NG",
    gabon: "GA",
    ga: "GA",
    congo: "CD",
    cd: "CD",
  };

  const lower = vertical.toLowerCase();
  for (const [key, value] of Object.entries(marketMap)) {
    if (lower.includes(key)) {
      return { defaultValue: value, contextHint: `Marché détecté depuis le vertical : ${vertical}` };
    }
  }

  return {};
}

// ---------------------------------------------------------------------------
// Enrichment registry — maps (enrichKey) to extractor functions
// ---------------------------------------------------------------------------

const ENRICHMENT_MAP: Record<string, (ctx: EnrichmentContext) => FieldEnrichment> = {
  campaignObjective: enrichCampaignObjective,
  bigIdea: enrichBigIdea,
  budget: enrichBudget,
  totalBudget: enrichBudget,
  duration: enrichDuration,
  channels: enrichChannels,
  insight: enrichInsight,
  tonality: enrichTonality,
  concept: enrichConcept,
  deliverables: enrichDeliverables,
  platforms: enrichPlatforms,
  events: enrichEvents,
  campaignContext: enrichCampaignContext,
  sector: enrichSector,
  market: enrichMarket,
};

// ---------------------------------------------------------------------------
// Main export — enrichFields
// ---------------------------------------------------------------------------

export async function enrichFields(
  toolSlug: string,
  strategyId: string,
  prisma: PrismaClient,
): Promise<Record<string, FieldEnrichment>> {
  const tool = getToolBySlug(toolSlug);
  if (!tool) return {};

  const ctx = await loadEnrichmentContext(strategyId, prisma);
  if (!ctx) return {};

  const result: Record<string, FieldEnrichment> = {};

  for (const input of tool.inputs) {
    // Use enrichKey if specified, otherwise try the field key itself
    const key = input.enrichKey ?? input.key;

    if (input.enrichable !== false) {
      // Try to find an enricher for this field
      const enricher = ENRICHMENT_MAP[key];
      if (enricher) {
        const enrichment = enricher(ctx);
        // Only include non-empty enrichments
        if (
          enrichment.suggestions?.length ||
          enrichment.dynamicOptions?.length ||
          enrichment.defaultValue !== undefined ||
          enrichment.contextHint
        ) {
          result[input.key] = enrichment;
        }
      }
    }
  }

  return result;
}
