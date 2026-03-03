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
  // Schema: identite (contains archetype, noyauIdentitaire), herosJourney, ikigai,
  //         valeurs, hierarchieCommunautaire, timelineNarrative
  const identite = safeGet(content, "identite");
  const heros = safeGet(content, "herosJourney");
  const ikigai = safeGet(content, "ikigai");
  const valeurs = safeGet(content, "valeurs");
  const hierarchie = safeGet(content, "hierarchieCommunautaire");
  const timeline = safeGet(content, "timelineNarrative");

  if (identite) lines.push(formatSection("Identité (archétype, noyau)", identite));
  if (heros) lines.push(formatSection("Parcours du héros", heros));
  if (ikigai) lines.push(formatSection("Ikigai", ikigai));
  if (valeurs) lines.push(formatSection("Valeurs", valeurs));
  if (hierarchie) lines.push(formatSection("Hiérarchie communautaire", hierarchie));
  if (timeline) lines.push(formatSection("Timeline narrative", timeline));

  return lines.join("");
}

function extractPillarD(content: unknown): string {
  const lines: string[] = [];
  // Schema: personas, paysageConcurrentiel, promessesDeMarque, positionnement,
  //         tonDeVoix, identiteVisuelle, assetsLinguistiques
  const personas = safeGet(content, "personas");
  const paysage = safeGet(content, "paysageConcurrentiel");
  const promesses = safeGet(content, "promessesDeMarque");
  const positionnement = safeGet(content, "positionnement");
  const ton = safeGet(content, "tonDeVoix");
  const identiteVisuelle = safeGet(content, "identiteVisuelle");
  const assets = safeGet(content, "assetsLinguistiques");

  if (personas) lines.push(formatSection("Personas", personas));
  if (paysage) lines.push(formatSection("Paysage concurrentiel", paysage));
  if (promesses) lines.push(formatSection("Promesses de marque", promesses));
  if (positionnement) lines.push(formatSection("Positionnement", positionnement));
  if (ton) lines.push(formatSection("Ton de voix", ton));
  if (identiteVisuelle) lines.push(formatSection("Identité visuelle", identiteVisuelle));
  if (assets) lines.push(formatSection("Assets linguistiques", assets));

  return lines.join("");
}

function extractPillarV(content: unknown): string {
  const lines: string[] = [];
  // Schema V2: produitsCatalogue, productLadder, 8 atomic value/cost, 6 unit economics
  const catalogue = safeGet(content, "produitsCatalogue");
  const productLadder = safeGet(content, "productLadder");
  const valeurMarqueTangible = safeGet(content, "valeurMarqueTangible");
  const valeurMarqueIntangible = safeGet(content, "valeurMarqueIntangible");
  const valeurClientTangible = safeGet(content, "valeurClientTangible");
  const valeurClientIntangible = safeGet(content, "valeurClientIntangible");
  const coutMarqueTangible = safeGet(content, "coutMarqueTangible");
  const coutMarqueIntangible = safeGet(content, "coutMarqueIntangible");
  const coutClientTangible = safeGet(content, "coutClientTangible");
  const coutClientIntangible = safeGet(content, "coutClientIntangible");
  const cac = safeGet(content, "cac");
  const ltv = safeGet(content, "ltv");
  const ltvCacRatio = safeGet(content, "ltvCacRatio");
  const pointMort = safeGet(content, "pointMort");
  const marges = safeGet(content, "marges");

  if (catalogue) lines.push(formatSection("Catalogue Produits & Services", catalogue));
  if (productLadder) lines.push(formatSection("Product Ladder / Pricing", productLadder));
  if (valeurMarqueTangible) lines.push(formatSection("Valeur Marque Tangible", valeurMarqueTangible));
  if (valeurMarqueIntangible) lines.push(formatSection("Valeur Marque Intangible", valeurMarqueIntangible));
  if (valeurClientTangible) lines.push(formatSection("Valeur Client Tangible", valeurClientTangible));
  if (valeurClientIntangible) lines.push(formatSection("Valeur Client Intangible", valeurClientIntangible));
  if (coutMarqueTangible) lines.push(formatSection("Coût Marque Tangible", coutMarqueTangible));
  if (coutMarqueIntangible) lines.push(formatSection("Coût Marque Intangible", coutMarqueIntangible));
  if (coutClientTangible) lines.push(formatSection("Coût Client Tangible", coutClientTangible));
  if (coutClientIntangible) lines.push(formatSection("Coût Client Intangible", coutClientIntangible));
  if (cac) lines.push(formatSection("CAC", cac));
  if (ltv) lines.push(formatSection("LTV", ltv));
  if (ltvCacRatio) lines.push(formatSection("Ratio LTV/CAC", ltvCacRatio));
  if (pointMort) lines.push(formatSection("Point Mort", pointMort));
  if (marges) lines.push(formatSection("Marges", marges));

  return lines.join("");
}

function extractPillarE(content: unknown): string {
  const lines: string[] = [];
  // Schema: touchpoints, rituels, principesCommunautaires, gamification, aarrr, kpis
  const touchpoints = safeGet(content, "touchpoints");
  const rituels = safeGet(content, "rituels");
  const principes = safeGet(content, "principesCommunautaires");
  const gamification = safeGet(content, "gamification");
  const aarrr = safeGet(content, "aarrr");
  const kpis = safeGet(content, "kpis");

  if (touchpoints) lines.push(formatSection("Touchpoints", touchpoints));
  if (rituels) lines.push(formatSection("Rituels", rituels));
  if (principes) lines.push(formatSection("Principes communautaires", principes));
  if (gamification) lines.push(formatSection("Gamification", gamification));
  if (aarrr) lines.push(formatSection("AARRR", aarrr));
  if (kpis) lines.push(formatSection("KPIs", kpis));

  return lines.join("");
}

function extractPillarR(content: unknown): string {
  const lines: string[] = [];
  // Schema: microSwots, globalSwot, riskScore, riskScoreJustification,
  //         probabilityImpactMatrix, mitigationPriorities, summary
  const microSwots = safeGet(content, "microSwots");
  const globalSwot = safeGet(content, "globalSwot");
  const riskScore = safeGet(content, "riskScore");
  const justification = safeGet(content, "riskScoreJustification");
  const matrix = safeGet(content, "probabilityImpactMatrix");
  const mitigation = safeGet(content, "mitigationPriorities");
  const summary = safeGet(content, "summary");

  if (riskScore) lines.push(formatSection("Score de risque", riskScore));
  if (justification) lines.push(formatSection("Justification score", justification));
  if (globalSwot) lines.push(formatSection("SWOT global", globalSwot));
  if (microSwots) lines.push(formatSection("Micro-SWOTs", microSwots));
  if (matrix) lines.push(formatSection("Matrice probabilité × impact", matrix));
  if (mitigation) lines.push(formatSection("Priorités de mitigation", mitigation));
  if (summary) lines.push(formatSection("Synthèse risques", summary));

  return lines.join("");
}

function extractPillarT(content: unknown): string {
  const lines: string[] = [];
  // Schema: triangulation, hypothesisValidation, marketReality, tamSamSom,
  //         competitiveBenchmark, brandMarketFitScore, brandMarketFitJustification,
  //         strategicRecommendations, summary
  const triangulation = safeGet(content, "triangulation");
  const hypotheses = safeGet(content, "hypothesisValidation");
  const market = safeGet(content, "marketReality");
  const tam = safeGet(content, "tamSamSom");
  const benchmark = safeGet(content, "competitiveBenchmark");
  const bmf = safeGet(content, "brandMarketFitScore");
  const bmfJustification = safeGet(content, "brandMarketFitJustification");
  const recs = safeGet(content, "strategicRecommendations");
  const summary = safeGet(content, "summary");

  if (triangulation) lines.push(formatSection("Triangulation", triangulation));
  if (hypotheses) lines.push(formatSection("Validation des hypothèses", hypotheses));
  if (market) lines.push(formatSection("Réalité marché", market));
  if (tam) lines.push(formatSection("TAM / SAM / SOM", tam));
  if (benchmark) lines.push(formatSection("Benchmark concurrentiel", benchmark));
  if (bmf) lines.push(formatSection("Brand-Market Fit Score", bmf));
  if (bmfJustification) lines.push(formatSection("Justification BMF", bmfJustification));
  if (recs) lines.push(formatSection("Recommandations stratégiques", recs));
  if (summary) lines.push(formatSection("Synthèse Track", summary));

  return lines.join("");
}

function extractPillarI(content: unknown): string {
  const lines: string[] = [];
  // Schema (22+ fields): brandIdentity, positioning, valueArchitecture,
  //   engagementStrategy, riskSynthesis, marketValidation, strategicRoadmap,
  //   campaigns, budgetAllocation, teamStructure, launchPlan, operationalPlaybook,
  //   brandPlatform, copyStrategy, bigIdea, activationDispositif, governance,
  //   workstreams, brandArchitecture, guidingPrinciples, coherenceScore, executiveSummary
  const brandIdentity = safeGet(content, "brandIdentity");
  const positioning = safeGet(content, "positioning");
  const valueArch = safeGet(content, "valueArchitecture");
  const engagement = safeGet(content, "engagementStrategy");
  const riskSynth = safeGet(content, "riskSynthesis");
  const marketVal = safeGet(content, "marketValidation");
  const roadmap = safeGet(content, "strategicRoadmap");
  const campaigns = safeGet(content, "campaigns");
  const budgetAlloc = safeGet(content, "budgetAllocation");
  const team = safeGet(content, "teamStructure");
  const launch = safeGet(content, "launchPlan");
  const playbook = safeGet(content, "operationalPlaybook");
  const brandPlatform = safeGet(content, "brandPlatform");
  const copyStrategy = safeGet(content, "copyStrategy");
  const bigIdea = safeGet(content, "bigIdea");
  const activation = safeGet(content, "activationDispositif");
  const governance = safeGet(content, "governance");
  const workstreams = safeGet(content, "workstreams");
  const brandArch = safeGet(content, "brandArchitecture");
  const principles = safeGet(content, "guidingPrinciples");
  const coherence = safeGet(content, "coherenceScore");
  const execSummary = safeGet(content, "executiveSummary");

  if (execSummary) lines.push(formatSection("Résumé exécutif", execSummary));
  if (brandIdentity) lines.push(formatSection("Identité de marque", brandIdentity));
  if (brandPlatform) lines.push(formatSection("Plateforme de marque", brandPlatform));
  if (positioning) lines.push(formatSection("Positionnement", positioning));
  if (valueArch) lines.push(formatSection("Architecture de valeur", valueArch));
  if (copyStrategy) lines.push(formatSection("Copy Strategy", copyStrategy));
  if (bigIdea) lines.push(formatSection("Big Idea", bigIdea));
  if (engagement) lines.push(formatSection("Stratégie d'engagement", engagement));
  if (riskSynth) lines.push(formatSection("Synthèse risques", riskSynth));
  if (marketVal) lines.push(formatSection("Validation marché", marketVal));
  if (roadmap) lines.push(formatSection("Roadmap stratégique", roadmap));
  if (campaigns) lines.push(formatSection("Campagnes", campaigns));
  if (activation) lines.push(formatSection("Dispositif d'activation", activation));
  if (budgetAlloc) lines.push(formatSection("Allocation budget", budgetAlloc));
  if (team) lines.push(formatSection("Structure équipe", team));
  if (launch) lines.push(formatSection("Plan de lancement", launch));
  if (playbook) lines.push(formatSection("Playbook opérationnel", playbook));
  if (governance) lines.push(formatSection("Gouvernance", governance));
  if (workstreams) lines.push(formatSection("Workstreams", workstreams));
  if (brandArch) lines.push(formatSection("Architecture de marque", brandArch));
  if (principles) lines.push(formatSection("Principes directeurs", principles));
  if (coherence) lines.push(formatSection("Score de cohérence", coherence));

  return lines.join("");
}

function extractPillarS(content: unknown): string {
  const lines: string[] = [];
  // Schema: syntheseExecutive, visionStrategique, coherencePiliers,
  //         facteursClesSucces, recommandationsPrioritaires, scoreCoherence,
  //         axesStrategiques, sprint90Recap, campaignsSummary, activationSummary,
  //         kpiDashboard
  const synthese = safeGet(content, "syntheseExecutive");
  const vision = safeGet(content, "visionStrategique");
  const coherence = safeGet(content, "coherencePiliers");
  const fcs = safeGet(content, "facteursClesSucces");
  const recs = safeGet(content, "recommandationsPrioritaires");
  const score = safeGet(content, "scoreCoherence");
  const axes = safeGet(content, "axesStrategiques");
  const sprint = safeGet(content, "sprint90Recap");
  const campSummary = safeGet(content, "campaignsSummary");
  const actSummary = safeGet(content, "activationSummary");
  const kpiDash = safeGet(content, "kpiDashboard");

  if (synthese) lines.push(formatSection("Synthèse exécutive", synthese));
  if (vision) lines.push(formatSection("Vision stratégique", vision));
  if (score) lines.push(formatSection("Score de cohérence", score));
  if (coherence) lines.push(formatSection("Cohérence des piliers", coherence));
  if (fcs) lines.push(formatSection("Facteurs clés de succès", fcs));
  if (recs) lines.push(formatSection("Recommandations prioritaires", recs));
  if (axes) lines.push(formatSection("Axes stratégiques", axes));
  if (sprint) lines.push(formatSection("Sprint 90 jours", sprint));
  if (campSummary) lines.push(formatSection("Résumé campagnes", campSummary));
  if (actSummary) lines.push(formatSection("Résumé activation", actSummary));
  if (kpiDash) lines.push(formatSection("Dashboard KPIs", kpiDash));

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
