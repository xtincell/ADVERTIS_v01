// =============================================================================
// SERVICE S.GLORY.2 — Glory Context Builder
// =============================================================================
// Extracts and formats ADVERTIS strategy data for use in GLORY tool prompts.
// Loads strategy + required pillars + operational data (budgets, competitors,
// opportunities, market study, missions, signals) and builds structured context.
// Called by: glory/generation.ts
// Dependencies: ~/server/db, ~/lib/types/glory-tools
// =============================================================================

import { db } from "~/server/db";
import type { GloryContextCategory } from "~/lib/types/glory-tools";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StrategyMeta {
  brandName: string;
  sector: string | null;
  tagline: string | null;
  vertical: string | null;
  maturityProfile: string | null;
  currency: string;
}

interface ContextResult {
  context: string;
  strategy: StrategyMeta;
}

// ---------------------------------------------------------------------------
// Pillar label map
// ---------------------------------------------------------------------------

const PILLAR_LABELS: Record<string, string> = {
  A: "AUTHENTICITÉ",
  D: "DIFFÉRENCIATION",
  V: "VALEUR",
  E: "EXPÉRIENCE",
  R: "RISQUES",
  T: "TRACTION",
  I: "IMPLÉMENTATION",
  S: "SYNTHÈSE",
};

// ---------------------------------------------------------------------------
// Safe JSON content accessor
// ---------------------------------------------------------------------------

function safeGet(content: unknown, key: string): unknown {
  if (content && typeof content === "object" && key in (content as Record<string, unknown>)) {
    return (content as Record<string, unknown>)[key];
  }
  return undefined;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
}

function formatSection(label: string, value: unknown): string {
  if (value === null || value === undefined) return "";
  return `${label} : ${formatValue(value)}\n`;
}

// ---------------------------------------------------------------------------
// Pillar-specific extractors
// ---------------------------------------------------------------------------

function extractPillarA(content: unknown): string {
  const lines: string[] = [];
  const identite = safeGet(content, "identite");
  const archetype = safeGet(content, "archetype");
  const noyau = safeGet(content, "noyauIdentitaire");
  const heros = safeGet(content, "herosJourney");
  const ikigai = safeGet(content, "ikigai");

  if (archetype) lines.push(formatSection("Archétype", archetype));
  if (identite) lines.push(formatSection("Identité", identite));
  if (noyau) lines.push(formatSection("Noyau identitaire", noyau));
  if (heros) lines.push(formatSection("Parcours du héros", heros));
  if (ikigai) lines.push(formatSection("Ikigai", ikigai));

  return lines.join("");
}

function extractPillarD(content: unknown): string {
  const lines: string[] = [];
  const positionnement = safeGet(content, "positionnement");
  const personas = safeGet(content, "personas");
  const concurrents = safeGet(content, "concurrents");

  if (positionnement) lines.push(formatSection("Positionnement", positionnement));
  if (personas) lines.push(formatSection("Personas", personas));
  if (concurrents) lines.push(formatSection("Concurrents", concurrents));

  return lines.join("");
}

function extractPillarV(content: unknown): string {
  const lines: string[] = [];
  const proposition = safeGet(content, "propositionValeur");
  const unitEconomics = safeGet(content, "unitEconomics");
  const pricing = safeGet(content, "pricing");

  if (proposition) lines.push(formatSection("Proposition de valeur", proposition));
  if (unitEconomics) lines.push(formatSection("Unit Economics", unitEconomics));
  if (pricing) lines.push(formatSection("Pricing", pricing));

  return lines.join("");
}

function extractPillarE(content: unknown): string {
  const lines: string[] = [];
  const touchpoints = safeGet(content, "touchpoints");
  const rituels = safeGet(content, "rituels");
  const aarrr = safeGet(content, "aarrr");
  const community = safeGet(content, "communityModel");

  if (touchpoints) lines.push(formatSection("Touchpoints", touchpoints));
  if (rituels) lines.push(formatSection("Rituels", rituels));
  if (aarrr) lines.push(formatSection("AARRR", aarrr));
  if (community) lines.push(formatSection("Modèle communautaire", community));

  return lines.join("");
}

function extractPillarR(content: unknown): string {
  const lines: string[] = [];
  const riskScore = safeGet(content, "riskScore");
  const globalSwot = safeGet(content, "globalSwot");
  const microSwots = safeGet(content, "microSwots");

  if (riskScore) lines.push(formatSection("Score de risque", riskScore));
  if (globalSwot) lines.push(formatSection("SWOT global", globalSwot));
  if (microSwots) lines.push(formatSection("Micro-SWOTs", microSwots));

  return lines.join("");
}

function extractPillarT(content: unknown): string {
  const lines: string[] = [];
  const bmf = safeGet(content, "brandMarketFitScore");
  const tam = safeGet(content, "tamSamSom");
  const market = safeGet(content, "marketReality");

  if (bmf) lines.push(formatSection("Brand-Market Fit Score", bmf));
  if (tam) lines.push(formatSection("TAM / SAM / SOM", tam));
  if (market) lines.push(formatSection("Réalité marché", market));

  return lines.join("");
}

function extractPillarI(content: unknown): string {
  const lines: string[] = [];
  const roadmap = safeGet(content, "roadmap");
  const budget = safeGet(content, "budget");
  const equipe = safeGet(content, "equipe");

  if (roadmap) lines.push(formatSection("Roadmap", roadmap));
  if (budget) lines.push(formatSection("Budget", budget));
  if (equipe) lines.push(formatSection("Équipe", equipe));

  return lines.join("");
}

function extractPillarS(content: unknown): string {
  const lines: string[] = [];
  const synthese = safeGet(content, "syntheseExecutive");
  const axes = safeGet(content, "axesStrategiques");

  if (synthese) lines.push(formatSection("Synthèse exécutive", synthese));
  if (axes) lines.push(formatSection("Axes stratégiques", axes));

  return lines.join("");
}

const PILLAR_EXTRACTORS: Record<string, (content: unknown) => string> = {
  A: extractPillarA,
  D: extractPillarD,
  V: extractPillarV,
  E: extractPillarE,
  R: extractPillarR,
  T: extractPillarT,
  I: extractPillarI,
  S: extractPillarS,
};

// ---------------------------------------------------------------------------
// Operational context formatters
// ---------------------------------------------------------------------------

interface BudgetTierRow {
  tier: string;
  minBudget: number;
  maxBudget: number;
  channels: unknown;
  kpis: unknown;
  description: string | null;
}

function formatBudgetTiers(tiers: BudgetTierRow[], currency: string): string {
  if (tiers.length === 0) return "";
  const lines: string[] = ["## BUDGET & TIERS DISPONIBLES"];
  for (const t of tiers) {
    const min = new Intl.NumberFormat("fr-FR").format(t.minBudget);
    const max = new Intl.NumberFormat("fr-FR").format(t.maxBudget);
    lines.push(`### Tier ${t.tier} — ${min} à ${max} ${currency}`);
    if (t.description) lines.push(t.description);
    if (t.channels) lines.push(`Canaux : ${formatValue(t.channels)}`);
    if (t.kpis) lines.push(`KPIs : ${formatValue(t.kpis)}`);
    lines.push("");
  }
  return lines.join("\n");
}

interface CompetitorRow {
  name: string;
  sov: number | null;
  positioning: string | null;
  strengths: unknown;
  weaknesses: unknown;
  recentMoves: unknown;
}

function formatCompetitors(competitors: CompetitorRow[]): string {
  if (competitors.length === 0) return "";
  const lines: string[] = ["## PAYSAGE CONCURRENTIEL"];
  for (const c of competitors) {
    lines.push(`### ${c.name}${c.sov ? ` (SOV: ${c.sov}%)` : ""}`);
    if (c.positioning) lines.push(`Positionnement : ${c.positioning}`);
    if (c.strengths) lines.push(`Forces : ${formatValue(c.strengths)}`);
    if (c.weaknesses) lines.push(`Faiblesses : ${formatValue(c.weaknesses)}`);
    if (c.recentMoves) lines.push(`Mouvements récents : ${formatValue(c.recentMoves)}`);
    lines.push("");
  }
  return lines.join("\n");
}

interface OpportunityRow {
  title: string;
  startDate: Date;
  endDate: Date | null;
  type: string;
  impact: string;
  channels: unknown;
  notes: string | null;
}

function formatOpportunities(opps: OpportunityRow[]): string {
  if (opps.length === 0) return "";
  const lines: string[] = ["## CALENDRIER D'OPPORTUNITÉS"];
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  for (const o of opps) {
    const period = o.endDate ? `${fmt(o.startDate)} → ${fmt(o.endDate)}` : fmt(o.startDate);
    lines.push(`- **${o.title}** [${o.type}] — ${period} (impact: ${o.impact})`);
    if (o.channels) lines.push(`  Canaux : ${formatValue(o.channels)}`);
    if (o.notes) lines.push(`  Note : ${o.notes}`);
  }
  lines.push("");
  return lines.join("\n");
}

function formatMarketStudy(synthesis: unknown): string {
  if (!synthesis) return "";
  const text = typeof synthesis === "string" ? synthesis : JSON.stringify(synthesis, null, 2);
  const truncated = text.length > 2000 ? text.substring(0, 2000) + "…" : text;
  return `## INTELLIGENCE MARCHÉ (synthèse étude)\n${truncated}\n`;
}

interface MissionRow {
  title: string;
  status: string;
  priority: string;
  currency: string;
  estimatedCharge: number | null;
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
}

function formatMissions(missions: MissionRow[]): string {
  if (missions.length === 0) return "";
  const lines: string[] = ["## CAMPAGNES / MISSIONS EN COURS"];
  for (const m of missions) {
    const charge = m.estimatedCharge
      ? ` — ${new Intl.NumberFormat("fr-FR").format(m.estimatedCharge)} ${m.currency}`
      : "";
    lines.push(`- **${m.title}** [${m.status}, ${m.priority}]${charge}`);
    if (m.description) {
      const desc = m.description.length > 200 ? m.description.substring(0, 200) + "…" : m.description;
      lines.push(`  ${desc}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

interface SignalRow {
  pillar: string;
  layer: string;
  title: string;
  description: string | null;
  confidence: string;
}

function formatSignals(signals: SignalRow[]): string {
  if (signals.length === 0) return "";
  const lines: string[] = ["## SIGNAUX STRATÉGIQUES"];
  for (const s of signals) {
    const conf = s.confidence ? ` (confiance: ${s.confidence}%)` : "";
    lines.push(`- [${s.pillar}/${s.layer}] **${s.title}**${conf}`);
    if (s.description) lines.push(`  ${s.description}`);
  }
  lines.push("");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main export — buildStrategyContext
// ---------------------------------------------------------------------------

export async function buildStrategyContext(
  strategyId: string,
  requiredPillars: string[],
  requiredContext: GloryContextCategory[] = [],
): Promise<ContextResult> {
  // Load strategy + only the pillars we need (complete status)
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: {
      pillars: {
        where: {
          type: { in: requiredPillars },
          status: "complete",
        },
        select: {
          type: true,
          content: true,
        },
      },
    },
  });

  if (!strategy) {
    throw new Error(
      `Stratégie introuvable (id: ${strategyId}). Impossible de construire le contexte GLORY.`,
    );
  }

  // --- Load operational data in parallel based on requiredContext ---
  const needsBudgets = requiredContext.includes("budgets");
  const needsCompetitors = requiredContext.includes("competitors");
  const needsOpportunities = requiredContext.includes("opportunities");
  const needsMarket = requiredContext.includes("market");
  const needsMissions = requiredContext.includes("missions");
  const needsSignals = requiredContext.includes("signals");

  const [budgetTiers, competitors, opportunities, marketStudy, missions, signals] =
    await Promise.all([
      needsBudgets
        ? db.budgetTier.findMany({
            where: { strategyId },
            orderBy: { minBudget: "asc" },
          })
        : Promise.resolve([]),
      needsCompetitors
        ? db.competitorSnapshot.findMany({
            where: { strategyId },
            orderBy: { sov: "desc" },
          })
        : Promise.resolve([]),
      needsOpportunities
        ? db.opportunityCalendar.findMany({
            where: { strategyId },
            orderBy: { startDate: "asc" },
          })
        : Promise.resolve([]),
      needsMarket
        ? db.marketStudy.findFirst({
            where: { strategyId, status: "complete" },
            select: { synthesis: true },
          })
        : Promise.resolve(null),
      needsMissions
        ? db.mission.findMany({
            where: { strategyId, status: { not: "CLOSED" } },
            orderBy: { createdAt: "desc" },
            take: 10,
          })
        : Promise.resolve([]),
      needsSignals
        ? db.signal.findMany({
            where: { strategyId, status: "active" },
            orderBy: { createdAt: "desc" },
            take: 15,
          })
        : Promise.resolve([]),
    ]);

  // --- Build the structured text context ---

  const sections: string[] = [];

  // Header
  sections.push(`# CONTEXTE STRATÉGIQUE — ${strategy.brandName}`);
  sections.push(`Secteur : ${strategy.sector ?? "Non défini"}`);
  sections.push(`Signature : ${strategy.tagline ?? "—"}`);
  if (strategy.vertical) sections.push(`Vertical : ${strategy.vertical}`);
  if (strategy.maturityProfile) sections.push(`Profil de maturité : ${strategy.maturityProfile}`);
  sections.push(`Devise : ${strategy.currency}`);
  sections.push(""); // blank line separator

  // Pillar sections
  for (const pillar of strategy.pillars) {
    const label = PILLAR_LABELS[pillar.type] ?? pillar.type;
    const extractor = PILLAR_EXTRACTORS[pillar.type];

    sections.push(`## PILIER ${pillar.type} — ${label}`);

    if (extractor) {
      const extracted = extractor(pillar.content);
      if (extracted.trim()) {
        sections.push(extracted.trimEnd());
      } else {
        // Fallback: dump the whole content as JSON if extractor found nothing
        sections.push(formatValue(pillar.content));
      }
    } else {
      // Unknown pillar type — dump raw JSON
      sections.push(formatValue(pillar.content));
    }

    sections.push(""); // blank line separator between pillars
  }

  // --- Operational context sections ---

  const budgetSection = formatBudgetTiers(budgetTiers, strategy.currency);
  if (budgetSection) sections.push(budgetSection);

  const competitorSection = formatCompetitors(competitors);
  if (competitorSection) sections.push(competitorSection);

  const opportunitySection = formatOpportunities(opportunities);
  if (opportunitySection) sections.push(opportunitySection);

  const marketSection = formatMarketStudy(marketStudy?.synthesis);
  if (marketSection) sections.push(marketSection);

  const missionSection = formatMissions(missions);
  if (missionSection) sections.push(missionSection);

  const signalSection = formatSignals(signals);
  if (signalSection) sections.push(signalSection);

  // --- Validated creative references (favorite GLORY outputs) ---
  const favoriteOutputs = await db.gloryOutput.findMany({
    where: {
      strategyId,
      isFavorite: true,
      status: "complete",
    },
    select: {
      title: true,
      toolSlug: true,
      outputText: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (favoriteOutputs.length > 0) {
    sections.push("## RÉFÉRENCES CRÉATIVES VALIDÉES");
    sections.push(
      "Les concepts suivants ont été marqués comme favoris. Ils représentent la direction créative validée pour cette marque.",
    );
    for (const fav of favoriteOutputs) {
      sections.push(`### ${fav.title} (${fav.toolSlug})`);
      if (fav.outputText) {
        // Limit to first 500 chars to avoid bloating the context
        const preview =
          fav.outputText.length > 500
            ? fav.outputText.substring(0, 500) + "…"
            : fav.outputText;
        sections.push(preview);
      }
      sections.push("");
    }
  }

  const context = sections.join("\n").trimEnd();

  const strategyMeta: StrategyMeta = {
    brandName: strategy.brandName,
    sector: strategy.sector,
    tagline: strategy.tagline,
    vertical: strategy.vertical,
    maturityProfile: strategy.maturityProfile,
    currency: strategy.currency,
  };

  return { context, strategy: strategyMeta };
}
