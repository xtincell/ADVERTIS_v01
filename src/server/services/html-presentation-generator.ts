// =============================================================================
// MODULE 15C — HTML Presentation Generator
// =============================================================================
// Transforms structured pillar data into a standalone interactive HTML "Fiche
// de Marque" presentation. Pure templating — no AI needed. Produces a single
// self-contained HTML file with embedded CSS, navigation, slide transitions,
// and white-label support. Handles all pillar types (A, D, V, E, R, T, I, S)
// with dedicated renderers for scores, SWOT grids, tables, and charts.
//
// Public API:
//   1. generateHTMLPresentation() — Generate a full HTML presentation from
//                                   strategy and pillar data
//
// Dependencies:
//   - ~/lib/types/pillar-parsers (parsePillarContent)
//   - ~/lib/constants (PILLAR_CONFIG, FRESHNESS_THRESHOLDS, WHITE_LABEL_MAP)
//   - Pillar type schemas (AuthenticitePillarData, DistinctionPillarData, etc.)
//
// Called by:
//   - tRPC export router (export.html)
// =============================================================================

import { parsePillarContent } from "~/lib/types/pillar-parsers";
import { PILLAR_CONFIG, FRESHNESS_THRESHOLDS, WHITE_LABEL_MAP, TEMPLATE_CONFIG } from "~/lib/constants";
import type { TemplateType } from "~/lib/constants";
import type {
  AuthenticitePillarData,
  DistinctionPillarData,
  ValeurPillarData,
  EngagementPillarData,
  RiskAuditResult,
  TrackAuditResult,
  ImplementationData,
  SynthesePillarData,
} from "~/lib/types/pillar-schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StrategyMeta {
  name: string;
  brandName: string;
  tagline?: string;
  sector?: string;
  coherenceScore?: number;
  createdAt: Date;
}

interface PillarInput {
  type: string;
  title: string;
  content: unknown;
  summary?: string;
  status: string;
}

// Phase 4 data types for new sections
interface DecisionData {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  deadline?: Date | null;
  deadlineType?: string | null;
  resolution?: string | null;
  createdAt: Date;
}

interface CompetitorData {
  id: string;
  name: string;
  sov?: number | null;
  positioning?: string | null;
  strengths: unknown;
  weaknesses: unknown;
  recentMoves: unknown;
  lastUpdated: Date;
}

interface OpportunityData {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date | null;
  type: string;
  impact: string;
  channels?: unknown;
  linkedAxes?: unknown;
  notes?: string | null;
}

interface BudgetTierData {
  id: string;
  tier: string;
  minBudget: number;
  maxBudget: number;
  channels?: unknown;
  kpis?: unknown;
  description?: string | null;
}

interface BriefData {
  id: string;
  type: string;
  version: number;
  status: string;
  staleReason?: string | null;
  staleSince?: Date | null;
  sourcePillars: unknown;
  createdAt: Date;
}

interface InlineSourceRef {
  pillar: string;
  variableKey: string;
  variableValue: string;
  why: string;
  updatedAt: string;
  source: string;
}

export interface HTMLPresentationOptions {
  selectedPillars?: string[];
  brandAccent?: string;
  brandAccent2?: string;
  currency?: string;
  locale?: string;
  /** Custom image overrides per section (section id → URL) */
  sectionImages?: Partial<Record<string, string>>;
  /** Phase 4: extra data */
  decisions?: DecisionData[];
  competitors?: CompetitorData[];
  opportunities?: OpportunityData[];
  budgetTiers?: BudgetTierData[];
  briefs?: BriefData[];
  parentBrand?: { id: string; brandName: string } | null;
  childBrands?: { id: string; brandName: string }[];
  userRole?: string;
  vertical?: string;
  /** SIS Signals */
  signals?: SignalData[];
  /** Template documents (Protocole, Reco, Mandat) */
  documents?: TemplateDocumentData[];
}

interface SignalData {
  id: string;
  title: string;
  layer: string;
  status: string;
  pillar: string | null;
  source: string | null;
  detectedAt: Date;
}

interface TemplateDocumentData {
  id: string;
  type: string;
  title: string;
  status: string;
  sections?: unknown;
  pageCount?: number | null;
  generatedAt?: Date | null;
}

// ---------------------------------------------------------------------------
// Default section hero images — diverse, non-Caucasian, African business
// ---------------------------------------------------------------------------

const DEFAULT_SECTION_IMAGES: Record<string, string> = {
  dashboard:
    "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=400&fit=crop&crop=center",
  strategie:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop&crop=center",
  authenticite:
    "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1200&h=400&fit=crop&crop=center",
  distinction:
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=400&fit=crop&crop=center",
  valeur:
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=400&fit=crop&crop=center",
  engagement:
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=400&fit=crop&crop=center",
  risk:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop&crop=center",
  track:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=400&fit=crop&crop=center",
  implementation:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop&crop=center",
  decisions:
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop&crop=center",
  competitors:
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=400&fit=crop&crop=center",
  briefs:
    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&h=400&fit=crop&crop=center",
  opportunities:
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=400&fit=crop&crop=center",
  "budget-sim":
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=400&fit=crop&crop=center",
  templates:
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=400&fit=crop&crop=center",
};

function getSectionImage(sectionId: string, options: HTMLPresentationOptions): string {
  return options.sectionImages?.[sectionId] ?? DEFAULT_SECTION_IMAGES[sectionId] ?? "";
}

function heroImgTag(imageUrl: string | undefined): string {
  if (!imageUrl) return "";
  return `<img class="section-hero-img" src="${esc(imageUrl)}" alt="" loading="lazy" />`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function esc(str: string | undefined | null): string {
  return (str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Validate hex color to prevent CSS injection */
function sanitizeColor(color: string | undefined, fallback: string): string {
  if (!color) return fallback;
  return /^#[0-9a-fA-F]{3,8}$/.test(color.trim()) ? color.trim() : fallback;
}

/**
 * Lightweight markdown → HTML formatter for template document content.
 * Handles: **bold**, *italic*, ## headings, - bullet lists, numbered lists,
 * blank-line paragraph breaks, and inline `code`.
 * Input is raw text (already safe for HTML — esc() is called on each line).
 */
function formatDocContent(raw: string): string {
  const lines = raw.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };

  const inlineFmt = (text: string): string => {
    let s = esc(text);
    // `code`
    s = s.replace(/`([^`]+)`/g, '<code style="font-family:\'JetBrains Mono\';font-size:0.85em;background:var(--bg-surface);padding:1px 5px;border-radius:4px;">$1</code>');
    // **bold**
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // *italic*
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
    return s;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Blank line → close list, add spacer
    if (trimmed === "") {
      closeList();
      out.push('<div style="height:8px;"></div>');
      continue;
    }

    // Headings: ### h3, ## h2
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1]!.length;
      const tag = level === 1 ? "h3" : level === 2 ? "h4" : "h5";
      const fontSize = level === 1 ? "var(--fs-h3)" : level === 2 ? "1rem" : "var(--fs-small)";
      out.push(`<${tag} style="font-family:'Outfit';font-weight:700;font-size:${fontSize};color:var(--text-primary);margin:12px 0 6px;">${inlineFmt(headingMatch[2]!)}</${tag}>`);
      continue;
    }

    // Bullet list: - item or * item
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      if (inOl) { out.push("</ol>"); inOl = false; }
      if (!inUl) { out.push('<ul style="padding-left:20px;margin:4px 0;">'); inUl = true; }
      out.push(`<li style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.7;margin-bottom:3px;">${inlineFmt(bulletMatch[1]!)}</li>`);
      continue;
    }

    // Numbered list: 1. item
    const numMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
    if (numMatch) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      if (!inOl) { out.push('<ol style="padding-left:20px;margin:4px 0;">'); inOl = true; }
      out.push(`<li style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.7;margin-bottom:3px;">${inlineFmt(numMatch[2]!)}</li>`);
      continue;
    }

    // Regular paragraph line
    closeList();
    out.push(`<p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.7;margin:2px 0;">${inlineFmt(trimmed)}</p>`);
  }
  closeList();
  return out.join("\n");
}

function scoreColor(score: number): string {
  if (score >= 80) return "var(--score-excellent)";
  if (score >= 60) return "var(--score-good)";
  if (score >= 40) return "var(--score-medium)";
  if (score >= 20) return "var(--score-poor)";
  return "var(--score-critical)";
}

function riskColor(level: string): string {
  if (level === "high") return "var(--risk-high)";
  if (level === "medium") return "var(--risk-medium)";
  return "var(--risk-low)";
}

function badgeClass(level: string): string {
  if (level === "high") return "badge-risk-high";
  if (level === "medium") return "badge-risk-medium";
  return "badge-risk-low";
}

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function brandInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Phase 4 Helpers — Freshness, SourceRef, White-Label
// ---------------------------------------------------------------------------

function getFreshnessThresholds(vertical?: string): { fresh: number; aging: number } {
  if (vertical && FRESHNESS_THRESHOLDS[vertical]) {
    return FRESHNESS_THRESHOLDS[vertical]!;
  }
  return FRESHNESS_THRESHOLDS.DEFAULT!;
}

function inlineFreshnessBadge(date: Date | string | null | undefined, vertical?: string): string {
  if (!date) return "";
  const ts = new Date(date).getTime();
  if (isNaN(ts)) return "";
  const days = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
  const thresholds = getFreshnessThresholds(vertical);
  let levelClass = "fb-stale";
  if (days <= thresholds.fresh) levelClass = "fb-fresh";
  else if (days <= thresholds.aging) levelClass = "fb-aging";
  const label = days < 0 ? "N/A" : `${days}j`;
  return `<span class="freshness-badge ${levelClass}"><span class="fb-dot"></span>${label}</span>`;
}

function inlineSourceRef(ref: InlineSourceRef, children: string): string {
  const pillarConfig = PILLAR_CONFIG[ref.pillar as keyof typeof PILLAR_CONFIG];
  const pillarColor = pillarConfig?.color ?? "#6b7280";
  const pillarTitle = pillarConfig?.title ?? ref.pillar;
  const sourceLabels: Record<string, string> = {
    generation: "AI",
    manual: "Manuel",
    market_study: "Etude",
  };
  return `<span class="source-ref">${children}<span class="source-ref-tooltip">
    <div class="sr-header">
      <span class="sr-pillar" style="background:${pillarColor}">${esc(ref.pillar)}</span>
      <span style="font-size:var(--fs-small);font-weight:600;">${esc(pillarTitle)}</span>
      ${inlineFreshnessBadge(ref.updatedAt)}
    </div>
    <div class="sr-var">Variable : ${esc(ref.variableKey)}</div>
    <div class="sr-val">${esc(ref.variableValue)}</div>
    <div class="sr-why">${esc(ref.why)}</div>
    <div class="sr-source">Source : ${esc(sourceLabels[ref.source] ?? ref.source)}</div>
  </span></span>`;
}

/** Fallback card for sections that have a hero but no content below */
function emptyPillarFallback(pillarLetter: string, items: Array<{icon: string; label: string; desc: string}>): string {
  return `<div class="sub-section">
    <div class="grid-${Math.min(items.length, 3)}" style="opacity:0.65;">
      ${items.map((item) => `<div class="card" style="border-top:3px solid var(--accent-1);text-align:center;padding:28px 20px;">
        <div style="font-size:1.4rem;margin-bottom:8px;">${item.icon}</div>
        <div class="micro-text" style="margin-bottom:6px;">${esc(item.label)}</div>
        <div style="font-size:var(--fs-small);color:var(--text-tertiary);">${esc(item.desc)}</div>
      </div>`).join("\n")}
    </div>
  </div>`;
}

function wl(label: string, role?: string): string {
  if (!role || role === "ADMIN" || role === "OPERATOR") return esc(label);
  return esc(WHITE_LABEL_MAP[label] ?? label);
}

function formatShortDate(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  const months = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// Oracle Data Resolution — Modular Cross-Pillar Data Layer
// ---------------------------------------------------------------------------
// Central resolution for all fields that can come from multiple pillars.
// Each field is resolved via a prioritized fallback chain:
//   PRIMARY (pillar I) → SECONDARY (pillar S / V / meta) → DEFAULT
// Section builders consume this resolved context — no more hacky cross-pillar
// access or `as Record<string, unknown>` type casts.
// ---------------------------------------------------------------------------

const DEFAULT_SPRINT_ACTIONS: Array<{ action: string; owner: string; kpi: string }> = [
  { action: "Audit complet de la présence digitale", owner: "Équipe Marketing", kpi: "Rapport d'audit livré" },
  { action: "Définir le positionnement de marque", owner: "Direction Stratégique", kpi: "Charte de positionnement validée" },
  { action: "Lancer la première campagne pilote", owner: "Growth Manager", kpi: "Taux d'engagement > 3%" },
];

/**
 * Resolved data context for Oracle HTML. All cross-pillar fields are resolved
 * here with documented fallback chains. Every section builder reads from this
 * instead of reaching into other pillars.
 */
interface OracleResolved {
  // ── Scores ──
  /** I.coherenceScore → S.scoreCoherence → meta.coherenceScore → 0 */
  coherenceScore: number;
  /** R.riskScore → 0 */
  riskScore: number;
  /** T.brandMarketFitScore → 0 */
  bmfScore: number;
  /** I.valueArchitecture.unitEconomics.ratio → V.unitEconomics.ratio → "—" */
  ltvCac: string;
  /** Radar chart scores for all 8 pillars */
  advertisScores: [number, number, number, number, number, number, number, number];

  // ── Narrative ──
  /** I.brandIdentity.narrative → I.positioning.statement → meta.sector → "" */
  narrative: string;
  /** I.executiveSummary → S.syntheseExecutive → "" */
  executiveSummary: string;
  /** I.strategicRoadmap.year3Vision → S.visionStrategique → "" */
  visionStrategique: string;
  /** I.strategicRoadmap.year1Priorities → [] */
  year1Priorities: string[];

  // ── Sprint 90 ──
  /** I.strategicRoadmap.sprint90Days → S.sprint90Recap.actions → DEFAULT_SPRINT_ACTIONS */
  sprint90Actions: Array<{ action: string; owner: string; kpi: string }>;
  sprint90IsDefault: boolean;
  /** S.sprint90Recap.summary → "" */
  sprint90Summary: string;

  // ── Implementation passthrough (from pillar I) ──
  campaigns: ImplementationData["campaigns"];
  budgetAllocation: ImplementationData["budgetAllocation"];
  engagementStrategy: ImplementationData["engagementStrategy"];
  brandIdentity: ImplementationData["brandIdentity"];
  positioning: ImplementationData["positioning"];
  teamStructure: ImplementationData["teamStructure"];
  launchPlan: ImplementationData["launchPlan"];
  operationalPlaybook: ImplementationData["operationalPlaybook"];
  brandPlatform: ImplementationData["brandPlatform"];
  copyStrategy: ImplementationData["copyStrategy"];
  bigIdea: ImplementationData["bigIdea"];
  activationDispositif: ImplementationData["activationDispositif"];
  governance: ImplementationData["governance"];
  workstreams: ImplementationData["workstreams"];
  brandArchitecture: ImplementationData["brandArchitecture"];
  guidingPrinciples: ImplementationData["guidingPrinciples"];

  // ── Budget derived ──
  /** I.budgetAllocation.enveloppeGlobale (only if contains digits) */
  enveloppeGlobale: string;
  hasRealBudget: boolean;
  /** Filtered parPoste with real amounts */
  budgetParPosteFiltered: Array<{ poste: string; montant: string; pourcentage: number; justification: string }>;

  // ── Synthèse passthrough (from pillar S) — properly typed ──
  syntheseExecutive: string;
  syntheseVision: string;
  coherencePiliers: SynthesePillarData["coherencePiliers"];
  facteursClesSucces: SynthesePillarData["facteursClesSucces"];
  recommandationsPrioritaires: SynthesePillarData["recommandationsPrioritaires"];
  axesStrategiques: SynthesePillarData["axesStrategiques"];
  kpiDashboard: SynthesePillarData["kpiDashboard"];
  campaignsSummary: SynthesePillarData["campaignsSummary"];
  activationSummary: string;
  sprint90Recap: SynthesePillarData["sprint90Recap"];
  scoreCoherence: number;

  // ── Source tracking for debugging ──
  _sources: Record<string, string>;
}

/** First non-empty value from a list of candidates */
function firstOf<T>(candidates: Array<[T | undefined | null, string]>, fallback: T, sources: Record<string, string>, key: string): T {
  for (const [val, src] of candidates) {
    if (val === undefined || val === null) continue;
    if (typeof val === "string" && val.trim() === "") continue;
    if (Array.isArray(val) && val.length === 0) continue;
    if (typeof val === "number" && val === 0) continue;
    sources[key] = src;
    return val;
  }
  sources[key] = "default";
  return fallback;
}

function resolveOracleData(
  meta: StrategyMeta,
  a: AuthenticitePillarData,
  d: DistinctionPillarData,
  v: ValeurPillarData,
  e: EngagementPillarData,
  r: RiskAuditResult,
  t: TrackAuditResult,
  impl: ImplementationData,
  s: SynthesePillarData,
): OracleResolved {
  const _sources: Record<string, string> = {};

  // Sprint resolution
  const implSprint = impl.strategicRoadmap?.sprint90Days?.filter(act => act.action?.trim()) ?? [];
  const sSprint = s.sprint90Recap?.actions?.filter(act => act.action?.trim()).map(act => ({
    action: act.action ?? "", owner: act.owner ?? "", kpi: act.kpi ?? "",
  })) ?? [];
  let sprint90Actions: Array<{ action: string; owner: string; kpi: string }>;
  let sprint90IsDefault = false;
  if (implSprint.length > 0) {
    sprint90Actions = implSprint;
    _sources["sprint90Actions"] = "I";
  } else if (sSprint.length > 0) {
    sprint90Actions = sSprint;
    _sources["sprint90Actions"] = "S";
  } else {
    sprint90Actions = DEFAULT_SPRINT_ACTIONS;
    sprint90IsDefault = true;
    _sources["sprint90Actions"] = "default";
  }

  // Budget derived
  const rawEnveloppe = impl.budgetAllocation?.enveloppeGlobale?.trim() ?? "";
  const hasRealBudget = rawEnveloppe.length > 0 && rawEnveloppe !== "\u2014" && /\d/.test(rawEnveloppe);
  const budgetParPosteFiltered = impl.budgetAllocation?.parPoste?.filter(
    (p) => p.poste && /\d/.test(p.montant),
  ) ?? [];

  return {
    // Scores
    coherenceScore: firstOf<number>([
      [impl.coherenceScore, "I"], [s.scoreCoherence, "S"], [meta.coherenceScore, "meta"],
    ], 0, _sources, "coherenceScore"),
    riskScore: r.riskScore || 0,
    bmfScore: t.brandMarketFitScore || 0,
    ltvCac: firstOf<string>([
      [impl.valueArchitecture?.unitEconomics?.ratio, "I"], [v.unitEconomics?.ratio, "V"],
    ], "\u2014", _sources, "ltvCac"),
    advertisScores: computeADVERTISScores(a, d, v, e, r, t, impl, s),

    // Narrative
    narrative: firstOf<string>([
      [impl.brandIdentity?.narrative, "I"], [impl.positioning?.statement, "I"], [meta.sector, "meta"],
    ], "", _sources, "narrative"),
    executiveSummary: firstOf<string>([
      [impl.executiveSummary, "I"], [s.syntheseExecutive, "S"],
    ], "", _sources, "executiveSummary"),
    visionStrategique: firstOf<string>([
      [impl.strategicRoadmap?.year3Vision, "I"], [s.visionStrategique, "S"],
    ], "", _sources, "visionStrategique"),
    year1Priorities: firstOf<string[]>([
      [impl.strategicRoadmap?.year1Priorities, "I"],
    ], [], _sources, "year1Priorities"),

    // Sprint
    sprint90Actions,
    sprint90IsDefault,
    sprint90Summary: s.sprint90Recap?.summary ?? "",

    // Implementation passthrough
    campaigns: impl.campaigns,
    budgetAllocation: impl.budgetAllocation,
    engagementStrategy: impl.engagementStrategy,
    brandIdentity: impl.brandIdentity,
    positioning: impl.positioning,
    teamStructure: impl.teamStructure,
    launchPlan: impl.launchPlan,
    operationalPlaybook: impl.operationalPlaybook,
    brandPlatform: impl.brandPlatform,
    copyStrategy: impl.copyStrategy,
    bigIdea: impl.bigIdea,
    activationDispositif: impl.activationDispositif,
    governance: impl.governance,
    workstreams: impl.workstreams,
    brandArchitecture: impl.brandArchitecture,
    guidingPrinciples: impl.guidingPrinciples,

    // Budget derived
    enveloppeGlobale: hasRealBudget ? rawEnveloppe : "",
    hasRealBudget,
    budgetParPosteFiltered,

    // Synthèse passthrough — properly typed, no more `as Record<string, unknown>`
    syntheseExecutive: s.syntheseExecutive,
    syntheseVision: s.visionStrategique,
    coherencePiliers: s.coherencePiliers,
    facteursClesSucces: s.facteursClesSucces,
    recommandationsPrioritaires: s.recommandationsPrioritaires,
    axesStrategiques: s.axesStrategiques,
    kpiDashboard: s.kpiDashboard,
    campaignsSummary: s.campaignsSummary,
    activationSummary: s.activationSummary ?? "",
    sprint90Recap: s.sprint90Recap,
    scoreCoherence: s.scoreCoherence,

    _sources,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generateStrategyHTML(
  meta: StrategyMeta,
  pillars: PillarInput[],
  options: HTMLPresentationOptions = {},
): string {
  const accent1 = sanitizeColor(options.brandAccent, "#c45a3c");
  const accent2 = sanitizeColor(options.brandAccent2, "#2d5a3d");
  const currency = options.currency ?? "FCFA";
  const locale = options.locale ?? "fr-FR";

  // Filter pillars — include any pillar that has content (not just status=complete)
  const selected = new Set(
    options.selectedPillars ?? pillars.filter((p) => p.content != null).map((p) => p.type),
  );
  const getPillar = (type: string) => pillars.find((p) => p.type === type && selected.has(type));

  // Parse all pillar data
  const aP = getPillar("A");
  const dP = getPillar("D");
  const vP = getPillar("V");
  const eP = getPillar("E");
  const rP = getPillar("R");
  const tP = getPillar("T");
  const iP = getPillar("I");
  const sP = getPillar("S");

  const parseA = parsePillarContent<AuthenticitePillarData>("A", aP?.content);
  const parseD = parsePillarContent<DistinctionPillarData>("D", dP?.content);
  const parseV = parsePillarContent<ValeurPillarData>("V", vP?.content);
  const parseE = parsePillarContent<EngagementPillarData>("E", eP?.content);
  const parseR = parsePillarContent<RiskAuditResult>("R", rP?.content);
  const parseT = parsePillarContent<TrackAuditResult>("T", tP?.content);
  const parseI = parsePillarContent<ImplementationData>("I", iP?.content);
  const parseS = parsePillarContent<SynthesePillarData>("S", sP?.content);

  const { data: a } = parseA;
  const { data: d } = parseD;
  const { data: v } = parseV;
  const { data: e } = parseE;
  const { data: r } = parseR;
  const { data: t } = parseT;
  const { data: impl } = parseI;
  const { data: s } = parseS;

  // ── Resolve all cross-pillar data via the modular resolution layer ──
  const ctx = resolveOracleData(meta, a, d, v, e, r, t, impl, s);

  // Phase 4: extract role and vertical for white-label + freshness
  const role = options.userRole;
  const vertical = options.vertical;

  // Build sections array for navigation
  const sections: { id: string; letter: string; label: string; score?: number }[] = [
    { id: "dashboard", letter: "\u25C9", label: "Dashboard" },
  ];
  const hasCampaignData = (ctx.campaigns?.annualCalendar?.length ?? 0) > 0 || (ctx.campaigns?.templates?.length ?? 0) > 0;
  if (selected.has("S") || hasCampaignData) sections.push({ id: "strategie", letter: "S", label: wl("Strat\u00e9gie", role) });
  if (selected.has("A")) sections.push({ id: "authenticite", letter: "A", label: wl("Authenticit\u00e9", role) });
  if (selected.has("D")) sections.push({ id: "distinction", letter: "D", label: wl("Distinction", role) });
  if (selected.has("V")) sections.push({ id: "valeur", letter: "V", label: wl("Valeur", role) });
  if (selected.has("E")) sections.push({ id: "engagement", letter: "E", label: wl("Engagement", role) });
  if (selected.has("R")) sections.push({ id: "risk", letter: "R", label: wl("Risk", role), score: ctx.riskScore });
  if (selected.has("T")) sections.push({ id: "track", letter: "T", label: wl("Track", role), score: ctx.bmfScore });
  if (selected.has("I")) sections.push({ id: "implementation", letter: "I", label: wl("Impl\u00e9mentation", role), score: ctx.coherenceScore });
  // Phase 4: new sections
  if (options.decisions && options.decisions.length > 0) sections.push({ id: "decisions", letter: "\u26A1", label: wl("D\u00e9cisions", role) });
  if (options.competitors && options.competitors.length > 0) sections.push({ id: "competitors", letter: "\uD83C\uDFAF", label: wl("Concurrents", role) });
  if (options.briefs && options.briefs.length > 0) sections.push({ id: "briefs", letter: "\uD83D\uDCC4", label: wl("Briefs", role) });
  if (options.opportunities && options.opportunities.length > 0) sections.push({ id: "opportunities", letter: "\u2191", label: wl("Opportunit\u00e9s", role) });
  if (options.documents && options.documents.length > 0) sections.push({ id: "templates", letter: "\uD83D\uDCCB", label: wl("Templates", role) });
  sections.push({ id: "budget-sim", letter: "\u00A4", label: wl("Simulateur", role) });

  // Assemble HTML — each section builder reads from the resolved context (ctx)
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>L'ORACLE — ${esc(meta.brandName)} | ADVERTIS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"><\/script>
<style>
${buildCSS(accent1, accent2)}
</style>
</head>
<body>
${buildSidebar(meta, sections, ctx.riskScore, ctx.bmfScore, ctx.coherenceScore, accent1, accent2, currency, options.parentBrand, options.childBrands)}
${buildMobileNav(sections)}
<main class="main">
<div class="main-inner">
${buildDashboard(meta, ctx, currency, getSectionImage("dashboard", options), options)}
${selected.has("S") || hasCampaignData ? buildSectionSynthese(ctx, currency, getSectionImage("strategie", options)) : ""}
${selected.has("A") ? buildSectionA(a, getSectionImage("authenticite", options)) : ""}
${selected.has("D") ? buildSectionD(d, getSectionImage("distinction", options)) : ""}
${selected.has("V") ? buildSectionV(v, currency, getSectionImage("valeur", options)) : ""}
${selected.has("E") ? buildSectionE(e, getSectionImage("engagement", options)) : ""}
${selected.has("R") ? buildSectionR(r, getSectionImage("risk", options)) : ""}
${selected.has("T") ? buildSectionT(t, getSectionImage("track", options)) : ""}
${selected.has("I") ? buildSectionImpl(ctx, currency, getSectionImage("implementation", options)) : ""}
${options.decisions && options.decisions.length > 0 ? buildSectionDecisions(options.decisions, role, vertical, getSectionImage("decisions", options)) : ""}
${options.competitors && options.competitors.length > 0 ? buildSectionCompetitors(options.competitors, meta.brandName, role, vertical, getSectionImage("competitors", options)) : ""}
${options.briefs && options.briefs.length > 0 ? buildSectionBriefs(options.briefs, role, vertical, getSectionImage("briefs", options)) : ""}
${options.opportunities && options.opportunities.length > 0 ? buildSectionOpportunities(options.opportunities, currency, role, getSectionImage("opportunities", options)) : ""}
${options.documents && options.documents.length > 0 ? buildSectionTemplates(options.documents, meta.brandName, getSectionImage("templates", options)) : ""}
${buildSectionBudgetSim(options.budgetTiers, currency, getSectionImage("budget-sim", options), ctx)}
${options.signals && options.signals.length > 0 ? buildSectionSignals(options.signals) : ""}
${buildFooter(meta, locale)}
</div>
</main>
<script>
${buildScripts(sections)}
<\/script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// CSS Design System
// ---------------------------------------------------------------------------

function buildCSS(accent1: string, accent2: string): string {
  return `
:root {
  --bg-void: #06060B;
  --bg-base: #0A0A12;
  --bg-surface: #111119;
  --bg-card: #17171F;
  --bg-card-hover: #1D1D28;
  --bg-elevated: #222230;
  --border-subtle: #2A2A3A;
  --border-default: #363648;
  --text-primary: #EAEAF0;
  --text-secondary: #9494AC;
  --text-tertiary: #6A6A80;
  --text-inverse: #06060B;
  --accent-1: ${accent1};
  --accent-1-dim: ${accent1}26;
  --accent-1-glow: ${accent1}4D;
  --accent-2: ${accent2};
  --accent-2-dim: ${accent2}26;
  --accent-3: #FFD700;
  --accent-3-dim: rgba(255,215,0,0.12);
  --risk-high: #FF4757;
  --risk-medium: #FFA502;
  --risk-low: #2ED573;
  --p0-color: #FF4757;
  --p1-color: #FFA502;
  --p2-color: #3742FA;
  --score-excellent: #2ED573;
  --score-good: #7BED9F;
  --score-medium: #FFA502;
  --score-poor: #FF6348;
  --score-critical: #FF4757;
  --sidebar-width: 260px;
  --content-max: 1200px;
  --section-gap: 60px;
  --card-radius: 14px;
  --card-radius-sm: 10px;
  --fs-hero: clamp(2.4rem, 4vw, 3.6rem);
  --fs-h1: clamp(1.8rem, 3vw, 2.4rem);
  --fs-h2: clamp(1.3rem, 2vw, 1.6rem);
  --fs-h3: 1.1rem;
  --fs-body: 0.95rem;
  --fs-small: 0.82rem;
  --fs-micro: 0.72rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 200ms;
  --duration-normal: 400ms;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; scrollbar-width: thin; scrollbar-color: var(--border-default) var(--bg-base); }
body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg-void); color: var(--text-primary); font-size: var(--fs-body); line-height: 1.65; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--accent-1); }
::selection { background: var(--accent-1); color: var(--text-inverse); }

h1, h2, h3, h4, h5, h6 { font-family: 'Outfit', sans-serif; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; }
.mono { font-family: 'JetBrains Mono', monospace; }
.accent-text { color: var(--accent-1); }
.dim-text { color: var(--text-secondary); }
.micro-text { font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-tertiary); }

/* Sidebar */
.sidebar { position: fixed; left: 0; top: 0; width: var(--sidebar-width); height: 100vh; background: var(--bg-surface); border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; z-index: 100; transition: transform var(--duration-normal) var(--ease-out); }
.sidebar-brand { padding: 28px 24px 20px; border-bottom: 1px solid var(--border-subtle); }
.sidebar-brand-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.sidebar-brand-logo .brand-icon { width: 38px; height: 38px; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Outfit'; font-weight: 900; font-size: 1.1rem; color: white; }
.sidebar-brand h2 { font-size: 1.15rem; font-weight: 800; letter-spacing: -0.01em; }
.sidebar-brand .brand-meta { font-size: var(--fs-micro); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }
.sidebar-nav { flex: 1; overflow-y: auto; padding: 16px 0; }
.sidebar-nav-group { padding: 0 12px; margin-bottom: 8px; }
.sidebar-nav-label { font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.14em; color: var(--text-tertiary); padding: 8px 12px 6px; font-weight: 600; }
.sidebar-nav a { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; text-decoration: none; color: var(--text-secondary); font-size: var(--fs-small); font-weight: 500; transition: all var(--duration-fast) ease; }
.sidebar-nav a:hover { background: var(--bg-card); color: var(--text-primary); }
.sidebar-nav a.active { background: var(--accent-1-dim); color: var(--accent-1); font-weight: 600; }
.sidebar-nav a .nav-letter { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-family: 'Outfit'; font-weight: 800; font-size: 0.8rem; background: var(--bg-elevated); color: var(--text-tertiary); flex-shrink: 0; transition: all var(--duration-fast) ease; }
.sidebar-nav a.active .nav-letter { background: var(--accent-1); color: white; }
.sidebar-nav a .nav-score { margin-left: auto; font-family: 'JetBrains Mono'; font-size: var(--fs-micro); font-weight: 600; opacity: 0.6; }
.sidebar-footer { padding: 16px 24px; border-top: 1px solid var(--border-subtle); text-align: center; }
.sidebar-footer .advertis-badge { font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-tertiary); }
.sidebar-footer .advertis-badge span { color: var(--accent-1); font-weight: 700; }
.sidebar-scores { padding: 12px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.sidebar-score-pill { background: var(--bg-card); border-radius: 8px; padding: 8px 10px; text-align: center; }
.sidebar-score-pill .score-val { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 1rem; }
.sidebar-score-pill .score-label { font-size: var(--fs-micro); color: var(--text-tertiary); margin-top: 2px; }

/* Main */
.main { margin-left: var(--sidebar-width); min-height: 100vh; }
.main-inner { max-width: var(--content-max); margin: 0 auto; padding: 0 40px; }
section { padding-top: var(--section-gap); padding-bottom: 20px; }
section:first-child { padding-top: 50px; }

/* Section Hero */
.section-hero { position: relative; border-radius: var(--card-radius); overflow: hidden; margin-bottom: 36px; min-height: 220px; display: flex; align-items: flex-end; padding: 36px; }
.section-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.18; z-index: 0; pointer-events: none; }
.section-hero-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(6,6,11,0.95) 0%, rgba(6,6,11,0.4) 100%); z-index: 1; }
.section-hero-content { position: relative; z-index: 2; width: 100%; }
.section-hero .section-tag { display: inline-flex; align-items: center; gap: 8px; background: var(--accent-1-dim); color: var(--accent-1); padding: 5px 14px; border-radius: 100px; font-size: var(--fs-micro); font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 14px; }
.section-hero h1 { font-size: var(--fs-hero); font-weight: 900; margin-bottom: 10px; color: var(--text-primary); }
.section-hero .section-summary { color: var(--text-secondary); max-width: 680px; font-size: var(--fs-body); line-height: 1.7; }
.hero-scores { display: flex; gap: 16px; margin-top: 20px; }
.hero-score-badge { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px 18px; text-align: center; backdrop-filter: blur(10px); }
.hero-score-badge .hsb-val { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 1.3rem; }
.hero-score-badge .hsb-label { font-size: var(--fs-micro); color: var(--text-tertiary); margin-top: 2px; }

/* Cards */
.card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--card-radius); padding: 24px; transition: all var(--duration-fast) ease; }
.card:hover { border-color: var(--border-default); background: var(--bg-card-hover); }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-family: 'Outfit'; font-weight: 700; font-size: var(--fs-h3); }
.card-badge { font-family: 'JetBrains Mono'; font-size: var(--fs-micro); font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
.badge-p0 { background: rgba(255,71,87,0.15); color: var(--p0-color); }
.badge-p1 { background: rgba(255,165,2,0.15); color: var(--p1-color); }
.badge-p2 { background: rgba(55,66,250,0.15); color: var(--p2-color); }
.badge-risk-high { background: rgba(255,71,87,0.15); color: var(--risk-high); }
.badge-risk-medium { background: rgba(255,165,2,0.15); color: var(--risk-medium); }
.badge-risk-low { background: rgba(46,213,115,0.15); color: var(--risk-low); }
.badge-validated { background: rgba(46,213,115,0.15); color: var(--score-excellent); }
.badge-to-test { background: rgba(255,165,2,0.15); color: var(--risk-medium); }

/* Grids */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

/* Sub-sections */
.sub-title { font-family: 'Outfit'; font-size: var(--fs-h2); font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
.sub-title::before { content: ''; width: 4px; height: 24px; background: var(--accent-1); border-radius: 2px; }
.sub-section { margin-bottom: 36px; }

/* Score Ring */
.score-ring { position: relative; width: 120px; height: 120px; }
.score-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.score-ring .ring-bg { fill: none; stroke: var(--bg-elevated); stroke-width: 8; }
.score-ring .ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; }
.score-ring .ring-value { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.score-ring .ring-number { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 1.6rem; line-height: 1; }
.score-ring .ring-label { font-size: var(--fs-micro); color: var(--text-tertiary); margin-top: 4px; }

/* Dashboard */
.dash-scores-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
.dash-score-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--card-radius); padding: 24px; display: flex; flex-direction: column; align-items: center; text-align: center; transition: all var(--duration-fast) ease; }
.dash-score-card:hover { border-color: var(--accent-1); transform: translateY(-2px); }
.dash-investment-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
.invest-card { background: var(--bg-card); border: 2px solid var(--border-subtle); border-radius: var(--card-radius); padding: 24px; cursor: pointer; transition: all var(--duration-fast) ease; text-align: center; }
.invest-card:hover { border-color: var(--accent-1); }
.invest-card.active { border-color: var(--accent-1); background: var(--accent-1-dim); }
.invest-card .invest-tag { font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; margin-bottom: 8px; }
.invest-card .invest-amount { font-family: 'JetBrains Mono'; font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
.invest-card .invest-desc { font-size: var(--fs-small); color: var(--text-secondary); }

/* Budget Table */
.budget-toggle { display: inline-flex; background: var(--bg-surface); border-radius: 10px; padding: 4px; border: 1px solid var(--border-subtle); margin-bottom: 24px; }
.budget-toggle button { font-family: 'Outfit'; font-weight: 600; font-size: var(--fs-small); padding: 10px 24px; border: none; border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; transition: all var(--duration-fast) ease; }
.budget-toggle button.active { background: var(--accent-1); color: white; }
.budget-toggle button:hover:not(.active) { color: var(--text-primary); background: var(--bg-card); }
.budget-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: var(--fs-small); }
.budget-table th { font-family: 'Outfit'; font-weight: 600; text-align: left; padding: 12px 16px; border-bottom: 2px solid var(--border-subtle); color: var(--text-secondary); font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.1em; }
.budget-table td { padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); vertical-align: middle; }
.budget-table tr.budget-row { transition: opacity var(--duration-fast) ease; }
.budget-table tr.budget-row.hidden { opacity: 0.15; }
.budget-table tr.budget-row.hidden td { text-decoration: line-through; color: var(--text-tertiary); }
.budget-table .budget-total-row { background: var(--accent-1-dim); font-weight: 700; }
.budget-table .budget-total-row td { font-family: 'JetBrains Mono'; border-bottom: none; color: var(--accent-1); padding: 14px 16px; }
.budget-amount { font-family: 'JetBrains Mono'; font-weight: 600; }

/* Calendar */
.calendar-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 6px; margin-bottom: 16px; }
.cal-month { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 8px; text-align: center; min-height: 100px; display: flex; flex-direction: column; }
.cal-month .cal-label { font-family: 'Outfit'; font-weight: 700; font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; color: var(--text-secondary); }
.cal-layer { border-radius: 4px; padding: 3px 4px; margin-bottom: 4px; font-size: 0.65rem; font-weight: 600; line-height: 1.3; }
.cal-always { background: rgba(46,213,115,0.15); color: #2ED573; }
.cal-peak { background: rgba(255,165,2,0.15); color: #FFA502; }
.cal-burst { background: rgba(255,71,87,0.15); color: #FF4757; }

/* Pillar Cards */
.pillar-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--card-radius); padding: 28px; transition: all var(--duration-fast) ease; }
.pillar-card:hover { border-color: var(--accent-1); transform: translateY(-2px); }
.pillar-card .pillar-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 16px; }
.pillar-card h3 { font-size: var(--fs-h3); margin-bottom: 6px; }
.pillar-card .pillar-objective { color: var(--text-secondary); font-size: var(--fs-small); margin-bottom: 16px; }
.pillar-card .pillar-budget { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 1.1rem; color: var(--accent-1); margin-bottom: 12px; }
.pillar-card .pillar-channels { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.pillar-channel-tag { font-size: var(--fs-micro); padding: 3px 8px; border-radius: 4px; background: var(--bg-elevated); color: var(--text-secondary); }
.pillar-card .pillar-kpis { font-size: var(--fs-small); color: var(--text-tertiary); }

/* Personas */
.persona-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--card-radius); overflow: hidden; transition: all var(--duration-fast) ease; }
.persona-card:hover { border-color: var(--accent-1); transform: translateY(-2px); }
.persona-body { padding: 20px; }
.persona-card .persona-priority { font-size: var(--fs-micro); font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
.persona-card h3 { font-size: 1.05rem; margin-bottom: 4px; }
.persona-card .persona-demo { font-size: var(--fs-small); color: var(--text-secondary); margin-bottom: 14px; }
.persona-detail-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 6px 0; border-top: 1px solid var(--border-subtle); font-size: var(--fs-small); }
.persona-detail-row .pdr-label { color: var(--text-tertiary); flex-shrink: 0; margin-right: 12px; }
.persona-detail-row .pdr-val { font-weight: 600; text-align: right; }

/* Funnel */
.funnel-container { display: flex; flex-direction: column; gap: 6px; max-width: 700px; margin: 0 auto; }
.funnel-step { display: flex; align-items: center; gap: 20px; padding: 16px 24px; border-radius: 10px; }
.funnel-step .funnel-label { font-family: 'Outfit'; font-weight: 700; font-size: 0.9rem; min-width: 120px; }
.funnel-step .funnel-desc { font-size: var(--fs-small); color: var(--text-secondary); flex: 1; }

/* Product Ladder */
.ladder-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.ladder-step { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--card-radius); padding: 24px; text-align: center; transition: all var(--duration-fast) ease; }
.ladder-step:hover { border-color: var(--accent-1); transform: translateY(-4px); }
.ladder-step .ladder-name { font-family: 'Outfit'; font-weight: 800; font-size: 1rem; margin-bottom: 8px; }
.ladder-step .ladder-price { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 1.2rem; color: var(--accent-1); margin-bottom: 4px; }
.ladder-step .ladder-target { font-size: var(--fs-small); color: var(--accent-2); font-weight: 600; margin-bottom: 12px; }
.ladder-desc { font-size: var(--fs-small); color: var(--text-secondary); }

/* SWOT */
.swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.swot-cell { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--card-radius); padding: 24px; }
.swot-cell h4 { font-family: 'Outfit'; font-weight: 700; font-size: 0.9rem; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.swot-cell ul { list-style: none; }
.swot-cell li { font-size: var(--fs-small); color: var(--text-secondary); padding: 6px 0 6px 16px; position: relative; border-bottom: 1px solid var(--border-subtle); }
.swot-cell li:last-child { border-bottom: none; }
.swot-cell li::before { content: ''; width: 6px; height: 6px; border-radius: 50%; position: absolute; left: 0; top: 12px; }
.swot-strengths li::before { background: var(--score-excellent); }
.swot-weaknesses li::before { background: var(--risk-high); }
.swot-opportunities li::before { background: var(--accent-3); }
.swot-threats li::before { background: var(--risk-medium); }

/* TAM/SAM/SOM */
.tam-circles { display: flex; align-items: center; justify-content: center; position: relative; height: 320px; margin-bottom: 20px; }
.tam-circle { position: absolute; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 2px solid; padding: 8px; box-sizing: border-box; overflow: hidden; }
.tam-circle.tam { width: 300px; height: 300px; border-color: rgba(255,107,53,0.3); background: rgba(255,107,53,0.05); }
.tam-circle.sam { width: 200px; height: 200px; border-color: rgba(46,139,87,0.4); background: rgba(46,139,87,0.08); }
.tam-circle.som { width: 115px; height: 115px; border-color: rgba(255,215,0,0.4); background: rgba(255,215,0,0.1); }
.tam-circle .tam-val { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 0.85rem; max-width: 90%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2; }
.tam-circle .tam-label { font-size: var(--fs-micro); color: var(--text-tertiary); margin-top: 2px; }
@media (max-width: 480px) {
  .tam-circles { height: 260px; }
  .tam-circle.tam { width: 240px; height: 240px; }
  .tam-circle.sam { width: 160px; height: 160px; }
  .tam-circle.som { width: 95px; height: 95px; }
  .tam-circle .tam-val { font-size: 0.75rem; }
}

/* KPI cards */
.kpi-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--card-radius-sm); padding: 18px; }
.kpi-card .kpi-label { font-size: var(--fs-small); color: var(--text-secondary); margin-bottom: 6px; }
.kpi-card .kpi-value { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 1.3rem; margin-bottom: 4px; }
.kpi-card .kpi-freq { font-size: var(--fs-micro); color: var(--text-tertiary); }

/* Risk matrix */
.risk-matrix-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: var(--fs-small); }
.risk-matrix-table th { font-family: 'Outfit'; font-weight: 600; text-align: left; padding: 10px 14px; border-bottom: 2px solid var(--border-subtle); color: var(--text-secondary); font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.1em; }
.risk-matrix-table td { padding: 10px 14px; border-bottom: 1px solid var(--border-subtle); }

/* Gamification */
.gamif-levels { display: flex; gap: 16px; flex-wrap: wrap; }
.gamif-level { flex: 1; min-width: 180px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--card-radius); padding: 20px; text-align: center; }
.gamif-level .gamif-num { font-family: 'JetBrains Mono'; font-weight: 800; font-size: 1.6rem; color: var(--accent-1); margin-bottom: 4px; }
.gamif-level .gamif-name { font-family: 'Outfit'; font-weight: 700; margin-bottom: 8px; }
.gamif-level .gamif-cond { font-size: var(--fs-small); color: var(--text-secondary); margin-bottom: 6px; }
.gamif-level .gamif-reward { font-size: var(--fs-micro); color: var(--accent-2); font-weight: 600; }

/* Hierarchy */
.hierarchy-levels { display: flex; flex-direction: column; gap: 12px; }
.hierarchy-level { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--card-radius-sm); padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
.hierarchy-level .hl-rank { font-family: 'JetBrains Mono'; font-weight: 800; font-size: 1.2rem; color: var(--accent-1); min-width: 30px; }
.hierarchy-level .hl-name { font-family: 'Outfit'; font-weight: 700; min-width: 120px; }
.hierarchy-level .hl-desc { font-size: var(--fs-small); color: var(--text-secondary); flex: 1; }
.hierarchy-level .hl-priv { font-size: var(--fs-micro); color: var(--accent-2); }

/* Value cards */
.value-list { display: flex; flex-direction: column; gap: 8px; }
.value-item { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px 16px; font-size: var(--fs-small); }
.value-item .vi-label { color: var(--text-tertiary); font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }

/* Unit economics */
.ue-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.ue-cell { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--card-radius-sm); padding: 16px; text-align: center; overflow: hidden; }
.ue-cell .ue-val { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 0.95rem; color: var(--accent-1); word-break: break-word; overflow-wrap: break-word; line-height: 1.3; }
.ue-cell .ue-label { font-size: var(--fs-micro); color: var(--text-tertiary); margin-top: 6px; word-break: break-word; }

/* Margin utils */
.mb-2 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 32px; }

/* Chart */
.chart-container { position: relative; width: 100%; max-width: 400px; margin: 0 auto; }
.chart-container canvas { max-height: 300px; }

/* Opportunity Cards */
.opp-timeline { display:flex; flex-direction:column; gap:10px; }
.opp-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--card-radius-sm); padding:16px 20px; display:grid; grid-template-columns:80px 1fr auto; gap:16px; align-items:center; transition:all var(--duration-fast) ease; }
.opp-card:hover { border-color:var(--accent-1); background:var(--bg-card-hover); }
.opp-card .opp-date { font-family:'JetBrains Mono'; font-size:var(--fs-small); font-weight:600; color:var(--text-secondary); }
.opp-card .opp-name { font-weight:600; font-size:var(--fs-small); }
.opp-card .opp-type { font-size:var(--fs-micro); color:var(--text-tertiary); margin-top:2px; }
.opp-card .opp-affinity { display:flex; gap:2px; }
.opp-card .opp-star { color:var(--accent-3); font-size:0.7rem; }
.opp-card .opp-star.dim { color:var(--text-tertiary); opacity:0.3; }
.opp-peak { border-left:3px solid var(--risk-high); }
.opp-normal { border-left:3px solid var(--risk-medium); }

/* Budget Simulator */
.budget-palier { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--card-radius); padding:24px; margin-bottom:16px; transition:all var(--duration-fast) ease; }
.budget-palier:hover { border-color:var(--accent-1); }
.budget-palier .bp-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.budget-palier .bp-name { font-family:'Outfit'; font-weight:800; font-size:var(--fs-h3); }
.budget-palier .bp-range { font-family:'JetBrains Mono'; font-weight:700; color:var(--accent-1); font-size:var(--fs-small); }
.budget-palier .bp-desc { font-size:var(--fs-small); color:var(--text-secondary); line-height:1.6; margin-bottom:12px; }
.budget-palier .bp-kpis { display:flex; flex-wrap:wrap; gap:8px; }
.budget-palier .bp-kpi { font-size:var(--fs-micro); padding:4px 10px; border-radius:4px; background:var(--bg-elevated); color:var(--text-secondary); font-weight:500; }

/* MVA table */
.mva-table { width:100%; border-collapse:separate; border-spacing:0; font-size:var(--fs-small); }
.mva-table th { font-family:'Outfit'; font-weight:600; text-align:left; padding:10px 14px; border-bottom:2px solid var(--border-subtle); color:var(--text-secondary); font-size:var(--fs-micro); text-transform:uppercase; letter-spacing:0.1em; }
.mva-table td { padding:10px 14px; border-bottom:1px solid var(--border-subtle); vertical-align:top; }
.mva-table tr:last-child td { border-bottom:none; }

/* Calendar table (campaigns) */
.cal-table { width:100%; border-collapse:separate; border-spacing:0; font-size:var(--fs-small); }
.cal-table th { font-family:'Outfit'; font-weight:600; text-align:left; padding:10px 14px; border-bottom:2px solid var(--border-subtle); color:var(--text-secondary); font-size:var(--fs-micro); text-transform:uppercase; letter-spacing:0.08em; }
.cal-table td { padding:10px 14px; border-bottom:1px solid var(--border-subtle); vertical-align:top; }
.cal-table tr:last-child td { border-bottom:none; }
.cal-table .cal-mois { font-family:'JetBrains Mono'; font-weight:700; color:var(--accent-1); white-space:nowrap; }
.cal-table .cal-canaux { display:flex; flex-wrap:wrap; gap:4px; margin-top:4px; }
.cal-table .cal-canal { font-size:var(--fs-micro); padding:2px 8px; border-radius:4px; background:var(--bg-elevated); color:var(--text-tertiary); }

/* Activation phases */
.activation-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; }
.activation-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--card-radius-sm); padding:20px; position:relative; overflow:hidden; }
.activation-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
.activation-card:nth-child(1)::before { background:var(--accent-1); }
.activation-card:nth-child(2)::before { background:var(--accent-2); }
.activation-card:nth-child(3)::before { background:var(--accent-3); }
.activation-card:nth-child(4)::before { background:#6366f1; }
.activation-card .ac-phase { font-family:'Outfit'; font-weight:700; font-size:var(--fs-small); margin-bottom:8px; color:var(--text-primary); }
.activation-card .ac-desc { font-size:var(--fs-small); color:var(--text-secondary); line-height:1.6; }

/* ROI projections */
.roi-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:12px; }
.roi-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--card-radius-sm); padding:18px; text-align:center; }
.roi-card .roi-period { font-size:var(--fs-micro); color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; }
.roi-card .roi-val { font-family:'JetBrains Mono'; font-weight:700; font-size:1rem; color:var(--score-excellent); word-break:break-word; }

/* Phase timeline (parPhase) */
.phase-timeline { display:flex; flex-direction:column; gap:12px; }
.phase-row { display:grid; grid-template-columns:120px 1fr 140px; gap:16px; align-items:center; background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--card-radius-sm); padding:14px 18px; }
.phase-row .ph-name { font-weight:700; font-size:var(--fs-small); color:var(--text-primary); }
.phase-row .ph-focus { font-size:var(--fs-small); color:var(--text-secondary); }
.phase-row .ph-montant { font-family:'JetBrains Mono'; font-weight:700; color:var(--accent-1); font-size:var(--fs-small); text-align:right; }
@media (max-width: 600px) {
  .phase-row { grid-template-columns:1fr; gap:6px; }
  .phase-row .ph-montant { text-align:left; }
}

/* Budget channels breakdown */
.channels-row { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
.channels-row .ch-tag { font-size:var(--fs-micro); padding:3px 10px; border-radius:4px; background:rgba(196,90,60,0.12); color:var(--accent-1); font-weight:500; }

/* Freshness Badge (inline) */
.freshness-badge { display:inline-flex; align-items:center; gap:3px; font-family:'JetBrains Mono'; font-size:0.65rem; font-weight:600; padding:2px 7px; border-radius:100px; border:1px solid; vertical-align:middle; margin-left:6px; }
.fb-dot { width:5px; height:5px; border-radius:50%; display:inline-block; }
.fb-fresh { background:rgba(46,213,115,0.12); color:#2ED573; border-color:rgba(46,213,115,0.3); }
.fb-fresh .fb-dot { background:#2ED573; }
.fb-aging { background:rgba(255,165,2,0.12); color:#FFA502; border-color:rgba(255,165,2,0.3); }
.fb-aging .fb-dot { background:#FFA502; }
.fb-stale { background:rgba(255,71,87,0.12); color:#FF4757; border-color:rgba(255,71,87,0.3); }
.fb-stale .fb-dot { background:#FF4757; }

/* SourceRef Tooltip (pure CSS) */
.source-ref { position:relative; cursor:help; border-bottom:1px dashed rgba(148,148,172,0.3); }
.source-ref:hover { border-bottom-color:var(--accent-1); }
.source-ref-tooltip { display:none; position:absolute; bottom:calc(100% + 8px); left:0; min-width:280px; max-width:340px; background:var(--bg-card); border:1px solid var(--border-default); border-radius:10px; padding:14px; box-shadow:0 8px 24px rgba(0,0,0,0.5); z-index:50; font-size:var(--fs-small); }
.source-ref:hover .source-ref-tooltip { display:block; }
.sr-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.sr-pillar { width:20px; height:20px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-family:'Outfit'; font-weight:800; font-size:0.6rem; color:white; flex-shrink:0; }
.sr-var { font-size:var(--fs-micro); color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.08em; }
.sr-val { font-weight:600; font-size:var(--fs-small); margin-bottom:6px; }
.sr-why { background:var(--bg-elevated); border-radius:6px; padding:8px 10px; font-size:var(--fs-micro); color:var(--text-secondary); line-height:1.5; margin-bottom:6px; }
.sr-source { font-size:var(--fs-micro); color:var(--text-tertiary); }

/* Decision Cards */
.decision-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--card-radius); padding:20px 24px; margin-bottom:16px; transition:all var(--duration-fast) ease; }
.decision-card:hover { border-color:var(--border-default); }
.decision-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.decision-header-left { display:flex; align-items:center; gap:10px; }
.decision-deadline { font-family:'JetBrains Mono'; font-size:var(--fs-micro); font-weight:600; }
.decision-options { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-top:12px; }
.decision-option { background:var(--bg-elevated); border-radius:8px; padding:10px 14px; }

/* Competitor Table */
.comp-table { width:100%; border-collapse:separate; border-spacing:0; font-size:var(--fs-small); }
.comp-table th { font-family:'Outfit'; font-weight:600; text-align:center; padding:10px 14px; border-bottom:2px solid var(--border-subtle); color:var(--text-secondary); font-size:var(--fs-micro); text-transform:uppercase; letter-spacing:0.1em; }
.comp-table th:first-child { text-align:left; }
.comp-table td { padding:10px 14px; border-bottom:1px solid var(--border-subtle); text-align:center; vertical-align:middle; }
.comp-table td:first-child { text-align:left; font-weight:600; }
.comp-highlight { color:var(--accent-1); font-weight:700; }

/* Brief Cards */
.brief-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--card-radius-sm); padding:16px 20px; display:flex; align-items:center; gap:16px; margin-bottom:10px; transition:all var(--duration-fast) ease; }
.brief-card:hover { border-color:var(--accent-1); }
.brief-type { font-family:'Outfit'; font-weight:700; font-size:var(--fs-small); flex:1; }
.brief-meta { display:flex; align-items:center; gap:8px; }
.brief-status { font-family:'JetBrains Mono'; font-size:var(--fs-micro); font-weight:700; padding:4px 10px; border-radius:6px; text-transform:uppercase; }
.brief-validated { background:rgba(46,213,115,0.15); color:var(--score-excellent); }
.brief-draft { background:rgba(148,148,172,0.15); color:var(--text-secondary); }
.brief-stale { background:rgba(255,71,87,0.15); color:var(--risk-high); }
.brief-pillars { display:flex; gap:4px; }
.brief-pillar-tag { width:20px; height:20px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-family:'Outfit'; font-weight:800; font-size:0.55rem; color:white; }

/* Brand Tree */
.brand-tree { padding:12px 24px; border-bottom:1px solid var(--border-subtle); }
.brand-tree-label { font-size:var(--fs-micro); text-transform:uppercase; letter-spacing:0.1em; color:var(--text-tertiary); margin-bottom:8px; font-weight:600; }
.bt-nodes { display:flex; flex-direction:column; gap:4px; }
.bt-node { font-size:var(--fs-small); padding:6px 10px; border-radius:6px; color:var(--text-secondary); }
.bt-current { background:var(--accent-1-dim); color:var(--accent-1); font-weight:700; }
.bt-parent { color:var(--text-tertiary); font-size:var(--fs-micro); }
.bt-child { padding-left:20px; font-size:var(--fs-micro); color:var(--text-tertiary); }

/* Template Document Cards */
.tpl-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--card-radius); overflow:hidden; transition:all var(--duration-fast) ease; }
.tpl-card:hover { border-color:var(--accent-1); transform:translateY(-2px); }
.tpl-card-header { padding:24px; border-bottom:1px solid var(--border-subtle); }
.tpl-card-header h3 { font-family:'Outfit'; font-weight:800; font-size:var(--fs-h3); margin-bottom:4px; }
.tpl-card-header .tpl-subtitle { font-size:var(--fs-small); color:var(--text-secondary); }
.tpl-card-meta { display:flex; align-items:center; gap:12px; margin-top:10px; }
.tpl-card-meta .tpl-badge { font-family:'JetBrains Mono'; font-size:var(--fs-micro); font-weight:700; padding:3px 10px; border-radius:6px; background:rgba(46,213,115,0.15); color:var(--score-excellent); text-transform:uppercase; }
.tpl-card-meta .tpl-pages { font-family:'JetBrains Mono'; font-size:var(--fs-micro); color:var(--text-tertiary); }
.tpl-sections { padding:20px 24px; }
.tpl-sections-title { font-size:var(--fs-micro); text-transform:uppercase; letter-spacing:0.1em; color:var(--text-tertiary); font-weight:600; margin-bottom:12px; }
.tpl-section-item { display:flex; align-items:flex-start; gap:10px; padding:8px 0; border-bottom:1px solid var(--border-subtle); }
.tpl-section-item:last-child { border-bottom:none; }
.tpl-section-num { font-family:'JetBrains Mono'; font-weight:700; font-size:var(--fs-micro); color:var(--accent-1); min-width:22px; }
.tpl-section-title { font-size:var(--fs-small); font-weight:600; }
.tpl-section-content { font-size:var(--fs-small); color:var(--text-secondary); line-height:1.7; margin-top:4px; }
.tpl-section-content strong { color:var(--text-primary); font-weight:700; }
.tpl-section-content em { color:var(--accent-2); font-style:italic; }
.tpl-section-content h3 { font-size:var(--fs-h3); color:var(--text-primary); border-bottom:1px solid var(--border-subtle); padding-bottom:6px; }
.tpl-section-content h4 { font-size:1rem; color:var(--text-primary); }
.tpl-section-content h5 { font-size:var(--fs-small); color:var(--text-primary); text-transform:uppercase; letter-spacing:0.05em; }
.tpl-section-content ul, .tpl-section-content ol { color:var(--text-secondary); }
.tpl-section-content li::marker { color:var(--accent-1); }
.tpl-section-content p + p { margin-top:6px; }
.tpl-section-word-count { font-family:'JetBrains Mono'; font-size:var(--fs-micro); color:var(--text-tertiary); }
.tpl-section-expandable { cursor:pointer; }
.tpl-section-expandable:hover > div:first-child { background:var(--bg-card-hover); border-radius:6px; margin:0 -6px; padding:4px 6px; }
.tpl-section-body { display:none; padding:16px 0 16px 32px; border-left:2px solid var(--accent-1-dim); margin-left:10px; margin-top:8px; max-height:800px; overflow-y:auto; scrollbar-width:thin; }
.tpl-section-expandable.open .tpl-section-body { display:block; animation:tplFadeIn 0.3s ease; }
@keyframes tplFadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
.tpl-section-toggle { font-size:0.7rem; color:var(--text-tertiary); transition:transform 0.2s; }
.tpl-section-expandable.open .tpl-section-toggle { transform:rotate(90deg); }

/* Mobile Nav */
.mobile-nav { display: none; }

/* Responsive */
@media (max-width: 900px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .main { margin-left: 0; }
  .main-inner { padding: 0 20px; }
  .grid-2, .grid-3, .grid-4, .swot-grid { grid-template-columns: 1fr; }
  .dash-scores-row { grid-template-columns: 1fr 1fr; }
  .dash-investment-row { grid-template-columns: 1fr; }
  .calendar-grid { grid-template-columns: repeat(4, 1fr); }
  .ladder-row { grid-template-columns: 1fr; }
  .gamif-levels { flex-direction: column; }
  .opp-card { grid-template-columns: 60px 1fr; }
  .opp-card .opp-affinity { display: none; }
  .decision-options { grid-template-columns: 1fr; }
  .source-ref-tooltip { min-width: 220px; left: -20px; }
  .mobile-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg-surface); border-top: 1px solid var(--border-subtle); z-index: 200; padding: 8px 12px; justify-content: space-around; backdrop-filter: blur(12px); }
  .mobile-nav a { display: flex; flex-direction: column; align-items: center; text-decoration: none; font-size: 0.6rem; font-weight: 700; color: var(--text-tertiary); padding: 4px; gap: 2px; }
  .mobile-nav a.active { color: var(--accent-1); }
  .mobile-nav a .mn-letter { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-family: 'Outfit'; font-weight: 800; font-size: 0.75rem; background: var(--bg-elevated); }
  .mobile-nav a.active .mn-letter { background: var(--accent-1); color: white; }
  body { padding-bottom: 70px; }
}
@media (max-width: 600px) {
  .calendar-grid { grid-template-columns: repeat(3, 1fr); }
  .section-hero { min-height: 180px; padding: 24px; }
  .section-hero h1 { font-size: 1.6rem; }
  .hero-scores { flex-wrap: wrap; }
  .tam-circles { height: 220px; }
  .tam-circle.tam { width: 200px; height: 200px; }
  .tam-circle.sam { width: 140px; height: 140px; }
  .tam-circle.som { width: 80px; height: 80px; }
  .opp-card { grid-template-columns: 1fr; }
  .comp-table { font-size: var(--fs-micro); }
  .comp-table th, .comp-table td { padding: 6px 8px; }
}
`;
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function buildSidebar(
  meta: StrategyMeta,
  sections: { id: string; letter: string; label: string; score?: number }[],
  riskScore: number,
  bmfScore: number,
  coherence: number,
  _accent1: string,
  _accent2: string,
  currency: string,
  parentBrand?: { id: string; brandName: string } | null,
  childBrands?: { id: string; brandName: string }[],
): string {
  const navLinks = sections
    .map(
      (sec, i) =>
        `<a href="#${sec.id}"${i === 0 ? ' class="active"' : ""}>
          <span class="nav-letter">${esc(sec.letter)}</span> ${esc(sec.label)}
          ${sec.score != null ? `<span class="nav-score" style="color:${scoreColor(sec.score)}">${sec.score}</span>` : ""}
        </a>`,
    )
    .join("\n");

  const totalBudget = "\u2014";
  const brandTreeHtml = buildBrandTree(parentBrand, meta.brandName, childBrands);

  return `<aside class="sidebar" id="sidebar">
  <div class="sidebar-brand">
    <div class="sidebar-brand-logo">
      <div class="brand-icon">${esc(brandInitials(meta.brandName))}</div>
      <div>
        <h2>${esc(meta.brandName)}</h2>
        <div class="brand-meta">${esc(meta.sector ?? "Marque")} \u00B7 ${meta.createdAt.getFullYear()}</div>
      </div>
    </div>
  </div>
  ${brandTreeHtml}
  <nav class="sidebar-nav">
    <div class="sidebar-nav-group">
      <div class="sidebar-nav-label">Navigation</div>
      ${navLinks}
    </div>
  </nav>
  <div class="sidebar-scores">
    <div class="sidebar-score-pill">
      <div class="score-val mono" style="color:${scoreColor(bmfScore)}">${bmfScore}</div>
      <div class="score-label">BMF</div>
    </div>
    <div class="sidebar-score-pill">
      <div class="score-val mono" style="color:${scoreColor(100 - riskScore)}">${riskScore}</div>
      <div class="score-label">Risk</div>
    </div>
    <div class="sidebar-score-pill">
      <div class="score-val mono" style="color:${scoreColor(coherence)}">${coherence}</div>
      <div class="score-label">Cohér.</div>
    </div>
    <div class="sidebar-score-pill">
      <div class="score-val mono" style="color:var(--accent-1)">${totalBudget}</div>
      <div class="score-label">Invest.</div>
    </div>
  </div>
  <div class="sidebar-footer">
    <div class="advertis-badge">Powered by <span>ADVERTIS</span></div>
  </div>
</aside>`;
}

// ---------------------------------------------------------------------------
// Mobile Navigation
// ---------------------------------------------------------------------------

function buildMobileNav(
  sections: { id: string; letter: string; label: string }[],
): string {
  const links = sections
    .map(
      (s, i) =>
        `<a href="#${s.id}"${i === 0 ? ' class="active"' : ""}><span class="mn-letter">${esc(s.letter)}</span>${esc(s.label.substring(0, 4))}</a>`,
    )
    .join("\n");

  return `<nav class="mobile-nav" id="mobileNav">\n${links}\n</nav>`;
}

// ---------------------------------------------------------------------------
// ADVE Score Calculator — estimates pillar completeness from data
// ---------------------------------------------------------------------------

function computeADVERTISScores(
  a: AuthenticitePillarData,
  d: DistinctionPillarData,
  v: ValeurPillarData,
  e: EngagementPillarData,
  r: RiskAuditResult,
  t: TrackAuditResult,
  impl: ImplementationData,
  s: SynthesePillarData,
): [number, number, number, number, number, number, number, number] {
  const nonEmpty = (val: unknown): boolean => {
    if (val == null) return false;
    if (typeof val === "string") return val.trim().length > 0;
    if (typeof val === "number") return val > 0;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "object") return Object.values(val as Record<string, unknown>).some(nonEmpty);
    return false;
  };

  // A — Authenticité
  const aFields = [
    a.identite?.archetype, a.identite?.citationFondatrice, a.identite?.noyauIdentitaire,
    a.ikigai?.aimer, a.ikigai?.competence, a.ikigai?.besoinMonde, a.ikigai?.remuneration,
    a.valeurs, a.hierarchieCommunautaire, a.herosJourney,
  ];
  const aScore = Math.round((aFields.filter(nonEmpty).length / aFields.length) * 100);

  // D — Distinction
  const dFields = [
    d.personas, d.positionnement, d.tonDeVoix?.personnalite,
    d.tonDeVoix?.onDit, d.tonDeVoix?.onNeditPas,
    d.paysageConcurrentiel?.concurrents, d.promessesDeMarque?.promesseMaitre,
    d.identiteVisuelle?.directionArtistique,
  ];
  const dScore = Math.round((dFields.filter(nonEmpty).length / dFields.length) * 100);

  // V — Valeur
  const vFields = [
    v.productLadder, v.unitEconomics?.cac, v.unitEconomics?.ltv,
    v.unitEconomics?.ratio, v.unitEconomics?.marges,
    v.valeurMarque?.tangible, v.valeurClient?.fonctionnels,
  ];
  const vScore = Math.round((vFields.filter(nonEmpty).length / vFields.length) * 100);

  // E — Engagement
  const eFields = [
    e.touchpoints, e.rituels, e.principesCommunautaires?.principes,
    e.gamification, e.kpis,
    e.aarrr?.acquisition, e.aarrr?.activation, e.aarrr?.retention,
  ];
  const eScore = Math.round((eFields.filter(nonEmpty).length / eFields.length) * 100);

  // R — Risk: use riskScore directly (inverted: low risk = high score)
  const rScore = r.riskScore > 0
    ? Math.min(100, Math.max(0, 100 - r.riskScore))
    : (() => {
        const rFields = [r.microSwots, r.globalSwot?.strengths, r.globalSwot?.weaknesses, r.globalSwot?.opportunities, r.globalSwot?.threats, r.probabilityImpactMatrix, r.mitigationPriorities, r.summary];
        return Math.round((rFields.filter(nonEmpty).length / rFields.length) * 100);
      })();

  // T — Track: use brandMarketFitScore directly if available
  const tScore = t.brandMarketFitScore > 0
    ? Math.min(100, Math.max(0, t.brandMarketFitScore))
    : (() => {
        const tFields = [t.triangulation, t.hypothesisValidation, t.marketReality, t.tamSamSom, t.competitiveBenchmark, t.strategicRecommendations, t.summary];
        return Math.round((tFields.filter(nonEmpty).length / tFields.length) * 100);
      })();

  // I — Implémentation
  const iFields = [
    impl.strategicRoadmap?.sprint90Days, impl.strategicRoadmap?.year1Priorities,
    impl.strategicRoadmap?.year3Vision, impl.executiveSummary,
    impl.campaigns, impl.budgetAllocation,
  ];
  const iScore = impl.coherenceScore && impl.coherenceScore > 0
    ? Math.min(100, Math.max(0, impl.coherenceScore))
    : Math.round((iFields.filter(nonEmpty).length / iFields.length) * 100);

  // S — Synthèse
  const sFields = [
    s.syntheseExecutive, s.visionStrategique, s.coherencePiliers,
    s.facteursClesSucces, s.recommandationsPrioritaires,
  ];
  const sScore = s.scoreCoherence && s.scoreCoherence > 0
    ? Math.min(100, Math.max(0, s.scoreCoherence))
    : Math.round((sFields.filter(nonEmpty).length / sFields.length) * 100);

  return [
    Math.min(100, Math.max(0, aScore)),
    Math.min(100, Math.max(0, dScore)),
    Math.min(100, Math.max(0, vScore)),
    Math.min(100, Math.max(0, eScore)),
    rScore,
    tScore,
    iScore,
    sScore,
  ];
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function buildDashboard(
  meta: StrategyMeta,
  ctx: OracleResolved,
  currency: string,
  imageUrl?: string,
  options?: HTMLPresentationOptions,
): string {
  const sprintHtml = ctx.sprint90Actions.slice(0, 6)
    .map(
      (act) =>
        `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:var(--bg-elevated);border-radius:8px;${ctx.sprint90IsDefault ? "opacity:0.65;" : ""}">
          <span class="card-badge badge-p0" style="flex-shrink:0;">P0</span>
          <div>
            <div style="font-weight:600;font-size:var(--fs-small);">${esc(act.action)}</div>
            <div style="font-size:var(--fs-micro);color:var(--text-secondary);margin-top:3px;">Owner: ${esc(act.owner)} · KPI: ${esc(act.kpi)}</div>
          </div>
        </div>`,
    )
    .join("\n");

  return `<section id="dashboard">
  <div class="section-hero" style="min-height:280px;background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay" style="background:linear-gradient(135deg, rgba(6,6,11,0.7), rgba(6,6,11,0.95));"></div>
    <div class="section-hero-content">
      <div class="section-tag">\u26A1 L'ORACLE — Intelligence Strat\u00e9gique ${inlineFreshnessBadge(meta.createdAt)}</div>
      <h1>${esc(meta.brandName)}</h1>
      ${meta.tagline ? `<p style="font-style:italic;color:var(--accent-1);font-size:1.1rem;margin-bottom:8px;">\u201C${esc(meta.tagline)}\u201D</p>` : ""}
      <p class="section-summary">${esc(ctx.narrative)}</p>
      <div class="hero-scores">
        <div class="hero-score-badge">
          <div class="hsb-val" style="color:${scoreColor(ctx.bmfScore)}">${ctx.bmfScore}<span style="font-size:0.7rem;color:var(--text-tertiary)">/100</span></div>
          <div class="hsb-label">Brand-Market Fit</div>
        </div>
        <div class="hero-score-badge">
          <div class="hsb-val" style="color:${scoreColor(100 - ctx.riskScore)}">${ctx.riskScore}<span style="font-size:0.7rem;color:var(--text-tertiary)">/100</span></div>
          <div class="hsb-label">Score de risque</div>
        </div>
        <div class="hero-score-badge">
          <div class="hsb-val" style="color:${scoreColor(ctx.coherenceScore)}">${ctx.coherenceScore}<span style="font-size:0.7rem;color:var(--text-tertiary)">/100</span></div>
          <div class="hsb-label">Coh\u00e9rence</div>
        </div>
        ${ctx.ltvCac !== "\u2014" ? `<div class="hero-score-badge"><div class="hsb-val" style="color:var(--accent-1)">${esc(ctx.ltvCac)}</div><div class="hsb-label">LTV/CAC</div></div>` : ""}
      </div>
    </div>
  </div>

  ${
    ctx.hasRealBudget
      ? `<h3 class="sub-title">Investissement</h3>
  <div class="card mb-4" style="text-align:center;">
    <div class="micro-text" style="margin-bottom:8px;">Enveloppe globale</div>
    <div class="mono" style="font-size:2rem;font-weight:800;color:var(--accent-1);">${esc(ctx.enveloppeGlobale)} <span style="font-size:0.9rem;color:var(--text-secondary)">${esc(currency)}</span></div>
  </div>`
      : ""
  }

  <div class="grid-2 mb-4">
    <div class="card">
      <div class="card-header"><span class="card-title">Radar ADVERTIS</span></div>
      <div class="chart-container" style="max-width:340px;margin:0 auto;">
        <canvas id="radarChart" data-scores="${ctx.advertisScores.join(",")}"></canvas>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">Sprint 90 jours</span>
        ${ctx.sprint90IsDefault ? '<span class="card-badge" style="background:rgba(255,165,2,0.15);color:var(--risk-medium);font-size:0.65rem;">\u00c0 D\u00c9FINIR</span>' : ""}
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${sprintHtml}
      </div>
    </div>
  </div>

  <div class="grid-4 mb-4">
    <div class="card" style="text-align:center;padding:16px;">
      <div class="mono" style="font-size:1.4rem;font-weight:800;color:var(--accent-1);">${options?.decisions?.length ?? 0}</div>
      <div class="micro-text" style="margin-top:4px;">D\u00e9cisions</div>
    </div>
    <div class="card" style="text-align:center;padding:16px;">
      <div class="mono" style="font-size:1.4rem;font-weight:800;color:var(--accent-2);">${options?.competitors?.length ?? 0}</div>
      <div class="micro-text" style="margin-top:4px;">Concurrents</div>
    </div>
    <div class="card" style="text-align:center;padding:16px;">
      <div class="mono" style="font-size:1.4rem;font-weight:800;color:#818cf8;">${options?.opportunities?.length ?? 0}</div>
      <div class="micro-text" style="margin-top:4px;">Opportunit\u00e9s</div>
    </div>
    <div class="card" style="text-align:center;padding:16px;">
      <div class="mono" style="font-size:1.4rem;font-weight:800;color:var(--accent-3);">${options?.signals?.length ?? 0}</div>
      <div class="micro-text" style="margin-top:4px;">Signaux</div>
    </div>
  </div>

  ${
    ctx.executiveSummary
      ? `<div class="card mb-4" style="background:linear-gradient(135deg, var(--accent-1-dim), var(--bg-card));border:1px solid var(--accent-1);padding:32px;">
    <div class="micro-text" style="color:var(--accent-1);margin-bottom:12px;">Synth\u00e8se ex\u00e9cutive</div>
    <p style="font-size:1.05rem;line-height:1.8;color:var(--text-primary);max-width:900px;">${esc(ctx.executiveSummary)}</p>
  </div>`
      : ""
  }
</section>`;
}

// ---------------------------------------------------------------------------
// S — Stratégie
// ---------------------------------------------------------------------------

function buildSectionSynthese(ctx: OracleResolved, currency: string, imageUrl?: string): string {
  // If neither pillar S data nor campaigns, nothing to render
  const hasSData = ctx.syntheseExecutive || ctx.syntheseVision || ctx.coherencePiliers.length > 0 || ctx.facteursClesSucces.length > 0 || ctx.recommandationsPrioritaires.length > 0;
  if (!ctx.campaigns && !hasSData) return "";

  // ── Synthèse Executive ──
  const syntheseHtml = ctx.syntheseExecutive
    ? `<div class="sub-section">
    <h3 class="sub-title">Synth\u00e8se ex\u00e9cutive</h3>
    <div class="card" style="border-left:4px solid var(--accent-1);padding:1.5rem;">
      <p style="line-height:1.8;color:var(--text-secondary);font-size:var(--fs-small);">${esc(ctx.syntheseExecutive)}</p>
    </div>
  </div>`
    : "";

  // ── Vision Stratégique ──
  const visionHtml = ctx.syntheseVision
    ? `<div class="sub-section">
    <h3 class="sub-title">Vision strat\u00e9gique</h3>
    <div class="card" style="border-left:4px solid var(--accent-2);padding:1.5rem;">
      <p style="line-height:1.8;color:var(--text-secondary);font-size:var(--fs-small);">${esc(ctx.syntheseVision)}</p>
    </div>
  </div>`
    : "";

  // ── Cohérence inter-piliers ──
  const coherenceHtml = ctx.coherencePiliers.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">Coh\u00e9rence inter-piliers</h3>
    <div class="grid-3">
      ${ctx.coherencePiliers
        .map(
          (cp) => `<div class="card" style="border-top:3px solid var(--accent-1);">
        <div class="micro-text mb-2">${esc(cp.pilier)}</div>
        <div style="font-weight:600;font-size:var(--fs-small);margin-bottom:0.5rem;">${esc(cp.contribution)}</div>
        <div style="color:var(--text-secondary);font-size:0.8rem;line-height:1.6;">${esc(cp.articulation)}</div>
      </div>`,
        )
        .join("\n")}
    </div>
  </div>`
    : "";

  // ── Facteurs clés de succès ──
  const fcIcons = ["\uD83C\uDFAF", "\u26A1", "\uD83D\uDEE1\uFE0F", "\uD83D\uDE80", "\uD83D\uDC8E", "\uD83D\uDD11", "\u2728", "\uD83C\uDFC6"];
  const facteursHtml = ctx.facteursClesSucces.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">Facteurs cl\u00e9s de succ\u00e8s</h3>
    <div class="grid-2">
      ${ctx.facteursClesSucces
        .map(
          (fc, i) => `<div class="card" style="display:flex;align-items:flex-start;gap:0.75rem;">
        <span style="font-size:1.3rem;">${fcIcons[i % fcIcons.length]}</span>
        <p style="font-size:var(--fs-small);line-height:1.7;color:var(--text-secondary);">${esc(fc)}</p>
      </div>`,
        )
        .join("\n")}
    </div>
  </div>`
    : "";

  // ── Recommandations prioritaires ──
  const recoHtml = ctx.recommandationsPrioritaires.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">Recommandations prioritaires</h3>
    <table class="budget-table">
      <thead><tr><th>Action</th><th>Priorit\u00e9</th><th>Impact</th><th>D\u00e9lai</th></tr></thead>
      <tbody>
        ${[...ctx.recommandationsPrioritaires]
          .sort((a, b) => a.priorite - b.priorite)
          .map(
            (rec) => `<tr class="budget-row">
          <td style="font-weight:600;">${esc(rec.action)}</td>
          <td class="mono" style="text-align:center;">P${rec.priorite}</td>
          <td style="color:var(--text-secondary);">${esc(rec.impact)}</td>
          <td style="color:var(--text-secondary);">${esc(rec.delai)}</td>
        </tr>`,
          )
          .join("\n")}
      </tbody>
    </table>
  </div>`
    : "";

  // ── Campaign templates ──
  const campaigns = ctx.campaigns;
  const templatesHtml =
    campaigns && campaigns.templates.length > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Architecture de campagne</h3>
    <div class="grid-4">
      ${campaigns.templates
        .map(
          (tpl, i) => `<div class="pillar-card">
        <div class="pillar-icon" style="background:var(--accent-1-dim);">${["\uD83D\uDCE2", "\uD83E\uDD1D", "\uD83D\uDCB0", "\uD83D\uDE80"][i % 4]}</div>
        <h3>${esc(tpl.nom)}</h3>
        <div class="pillar-objective">${esc(tpl.description)}</div>
        <div class="pillar-channels">${tpl.canauxPrincipaux.map((c) => `<span class="pillar-channel-tag">${esc(c)}</span>`).join("")}</div>
        <div class="pillar-kpis">${tpl.messagesCles.map((m) => esc(m)).join(" \u00b7 ")}</div>
      </div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // ── Calendar ──
  const calendarHtml =
    campaigns && campaigns.annualCalendar.length > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Calendrier 12 mois</h3>
    <div class="calendar-grid">
      ${campaigns.annualCalendar
        .map(
          (m) => `<div class="cal-month">
        <div class="cal-label">${esc(m.mois)}</div>
        <div class="cal-layer cal-burst">${esc(m.campagne)}</div>
        <div class="cal-layer cal-always">${esc(m.objectif)}</div>
      </div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // ── Budget — only if real line items ──
  const budgetHasData = ctx.budgetParPosteFiltered.length > 0;
  const budgetHtml = budgetHasData
    ? `<div class="sub-section">
    <h3 class="sub-title">Budget op\u00e9rationnel</h3>
    <table class="budget-table">
      <thead><tr><th>Poste</th><th>Montant</th><th>%</th><th>Justification</th></tr></thead>
      <tbody>
        ${ctx.budgetParPosteFiltered
          .map(
            (p) => `<tr class="budget-row">
          <td style="font-weight:600;">${esc(p.poste)}</td>
          <td class="budget-amount">${esc(p.montant)} ${esc(currency)}</td>
          <td class="mono">${p.pourcentage}%</td>
          <td style="color:var(--text-secondary);">${esc(p.justification)}</td>
        </tr>`,
          )
          .join("\n")}
        ${ctx.hasRealBudget ? `<tr class="budget-total-row">
          <td>Total</td>
          <td>${esc(ctx.enveloppeGlobale)} ${esc(currency)}</td>
          <td>100%</td>
          <td></td>
        </tr>` : ""}
      </tbody>
    </table>
  </div>`
    : "";

  // ── Funnel AARRR ──
  const aarrr = ctx.engagementStrategy?.aarrr;
  const funnelColors = ["rgba(255,71,87,0.15)", "rgba(255,165,2,0.15)", "rgba(46,213,115,0.15)", "rgba(55,66,250,0.15)", "rgba(140,60,196,0.15)"];
  const funnelTextColors = ["#FF4757", "#FFA502", "#2ED573", "#3742FA", "#8c3cc4"];
  const funnelSteps = [
    { label: "Acquisition", desc: aarrr?.acquisition },
    { label: "Activation", desc: aarrr?.activation },
    { label: "Retention", desc: aarrr?.retention },
    { label: "Revenue", desc: aarrr?.revenue },
    { label: "Referral", desc: aarrr?.referral },
  ].filter((step) => step.desc);

  const funnelHtml =
    funnelSteps.length > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Funnel AARRR</h3>
    <div class="funnel-container">
      ${funnelSteps
        .map(
          (step, i) =>
            `<div class="funnel-step" style="background:${funnelColors[i]};"><span class="funnel-label" style="color:${funnelTextColors[i]}">${esc(step.label)}</span><span class="funnel-desc">${esc(step.desc ?? "")}</span></div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // ── Axes Stratégiques — properly typed from ctx ──
  const axesHtml = ctx.axesStrategiques.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">Axes strat\u00e9giques</h3>
    <div class="grid-2">
      ${ctx.axesStrategiques.map((ax) => `<div class="card" style="border-left:4px solid var(--accent-1);">
        <div style="font-weight:700;margin-bottom:4px;">${esc(ax.axe)}</div>
        <p style="font-size:var(--fs-small);color:var(--text-secondary);margin-bottom:8px;">${esc(ax.description)}</p>
        ${ax.piliersLies.length > 0 ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px;">${ax.piliersLies.map((p) => `<span style="background:var(--accent-1-dim);color:var(--accent-1);padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;">${esc(p)}</span>`).join("")}</div>` : ""}
        ${ax.kpisCles.length > 0 ? `<div style="font-size:11px;color:var(--text-tertiary);">KPIs : ${ax.kpisCles.map((k) => esc(k)).join(", ")}</div>` : ""}
      </div>`).join("\n")}
    </div>
  </div>`
    : "";

  // ── Sprint 90 Jours Recap — properly typed from ctx ──
  const sprint90 = ctx.sprint90Recap;
  const sprint90Html = sprint90.actions.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">Sprint 90 jours \u2014 R\u00e9cap</h3>
    ${sprint90.summary ? `<p style="margin-bottom:12px;font-size:var(--fs-small);color:var(--text-secondary);">${esc(sprint90.summary)}</p>` : ""}
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="border-bottom:1px solid var(--border-subtle);">
        <th style="text-align:left;padding:8px;font-size:12px;">Action</th>
        <th style="text-align:left;padding:8px;font-size:12px;">Owner</th>
        <th style="text-align:left;padding:8px;font-size:12px;">KPI</th>
        <th style="text-align:left;padding:8px;font-size:12px;">Statut</th>
      </tr></thead>
      <tbody>
        ${sprint90.actions.map((act) => `<tr style="border-bottom:1px solid var(--border-subtle);">
          <td style="padding:8px;font-weight:600;">${esc(act.action)}</td>
          <td style="padding:8px;color:var(--text-secondary);">${esc(act.owner)}</td>
          <td style="padding:8px;color:var(--text-secondary);">${esc(act.kpi)}</td>
          <td style="padding:8px;"><span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:${act.status.toLowerCase().includes("done") || act.status.toLowerCase().includes("termin\u00e9") ? "rgba(34,197,94,0.15);color:#22C55E" : act.status.toLowerCase().includes("progress") || act.status.toLowerCase().includes("cours") ? "rgba(245,158,11,0.15);color:#F59E0B" : "rgba(156,163,175,0.15);color:#9CA3AF"}">${esc(act.status)}</span></td>
        </tr>`).join("\n")}
      </tbody>
    </table>
  </div>`
    : "";

  // ── KPI Dashboard consolidé — properly typed from ctx ──
  const kpiHtml = ctx.kpiDashboard.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">KPI Dashboard consolid\u00e9</h3>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="border-bottom:1px solid var(--border-subtle);">
        <th style="text-align:left;padding:8px;font-size:12px;">Pilier</th>
        <th style="text-align:left;padding:8px;font-size:12px;">KPI</th>
        <th style="text-align:left;padding:8px;font-size:12px;">Cible</th>
        <th style="text-align:left;padding:8px;font-size:12px;">Statut</th>
      </tr></thead>
      <tbody>
        ${ctx.kpiDashboard.map((k) => `<tr style="border-bottom:1px solid var(--border-subtle);">
          <td style="padding:8px;"><span style="background:var(--accent-1-dim);color:var(--accent-1);padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;">${esc(k.pilier)}</span></td>
          <td style="padding:8px;font-weight:600;">${esc(k.kpi)}</td>
          <td style="padding:8px;color:var(--text-secondary);">${esc(k.cible)}</td>
          <td style="padding:8px;color:var(--text-secondary);">${esc(k.statut)}</td>
        </tr>`).join("\n")}
      </tbody>
    </table>
  </div>`
    : "";

  // ── Activation Summary ──
  const activationHtml = ctx.activationSummary
    ? `<div class="sub-section">
    <h3 class="sub-title">R\u00e9sum\u00e9 activation</h3>
    <div class="card" style="border-left:4px solid var(--accent-2);padding:1.5rem;">
      <p style="line-height:1.8;color:var(--text-secondary);font-size:var(--fs-small);">${esc(ctx.activationSummary)}</p>
    </div>
  </div>`
    : "";

  // ── Campaigns Summary ──
  const campSum = ctx.campaignsSummary;
  const campSumHtml = campSum.totalCampaigns > 0 || campSum.highlights.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">R\u00e9sum\u00e9 campagnes</h3>
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;">
      ${campSum.totalCampaigns ? `<div class="card" style="min-width:120px;text-align:center;"><div class="micro-text">Campagnes</div><div style="font-size:1.5rem;font-weight:800;color:var(--accent-1);">${campSum.totalCampaigns}</div></div>` : ""}
      ${campSum.budgetTotal ? `<div class="card" style="min-width:120px;text-align:center;"><div class="micro-text">Budget total</div><div style="font-size:1.1rem;font-weight:700;color:var(--accent-2);">${esc(campSum.budgetTotal)}</div></div>` : ""}
    </div>
    ${campSum.highlights.length > 0 ? `<ul style="list-style:none;padding:0;margin:0;">${campSum.highlights.map((h) => `<li style="padding:4px 0;color:var(--text-secondary);font-size:var(--fs-small);">&#x2022; ${esc(h)}</li>`).join("")}</ul>` : ""}
  </div>`
    : "";

  const allParts = [syntheseHtml, visionHtml, axesHtml, coherenceHtml, facteursHtml, recoHtml, sprint90Html, kpiHtml, campSumHtml, activationHtml, templatesHtml, calendarHtml, budgetHtml, funnelHtml];

  return `<section id="strategie">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay" style="background:linear-gradient(135deg, rgba(6,6,11,0.8), rgba(6,6,11,0.95));"></div>
    <div class="section-hero-content">
      <div class="section-tag">S \u2014 Synth\u00e8se Strat\u00e9gique</div>
      <h1>Synth\u00e8se &amp; Plan d'attaque</h1>
      <p class="section-summary">Vision strat\u00e9gique, coh\u00e9rence inter-piliers, recommandations prioritaires, campagnes et budget.</p>
    </div>
  </div>
  ${syntheseHtml}
  ${visionHtml}
  ${axesHtml}
  ${coherenceHtml}
  ${facteursHtml}
  ${recoHtml}
  ${sprint90Html}
  ${kpiHtml}
  ${campSumHtml}
  ${activationHtml}
  ${templatesHtml}
  ${calendarHtml}
  ${budgetHtml}
  ${funnelHtml}
  ${allParts.every(p => !p)
    ? emptyPillarFallback("S", [
        { icon: "\uD83C\uDFAF", label: "Vision strat\u00e9gique", desc: "Vision \u00e0 long terme \u00e0 formuler" },
        { icon: "\uD83D\uDD17", label: "Coh\u00e9rence", desc: "Liens inter-piliers \u00e0 \u00e9tablir" },
        { icon: "\u26A1", label: "Recommandations", desc: "Actions prioritaires \u00e0 d\u00e9finir" },
      ])
    : ""}
</section>`;
}

// ---------------------------------------------------------------------------
// A — Authenticité
// ---------------------------------------------------------------------------

function buildSectionA(a: AuthenticitePillarData, imageUrl?: string): string {
  // Safe access — deep merge guarantees nested objects, but belt-and-suspenders
  const id = a.identite ?? { archetype: "", citationFondatrice: "", noyauIdentitaire: "" };
  const identityHtml = `<div class="sub-section">
    <h3 class="sub-title">Identité de marque</h3>
    <div class="grid-3">
      <div class="card" style="border-top:3px solid var(--accent-1);">
        <div class="micro-text mb-2">Archétype</div>
        <div style="font-family:'Outfit';font-weight:800;font-size:1.3rem;color:var(--accent-1);">${esc(id.archetype || "À définir")}</div>
      </div>
      <div class="card" style="border-top:3px solid var(--accent-2);">
        <div class="micro-text mb-2">Noyau identitaire</div>
        <div style="font-size:var(--fs-small);line-height:1.7;">${esc(id.noyauIdentitaire || "En cours d'analyse")}</div>
      </div>
      <div class="card" style="border-top:3px solid var(--accent-3);">
        <div class="micro-text mb-2">Citation fondatrice</div>
        <div style="font-style:italic;color:var(--text-secondary);font-size:var(--fs-small);">"${esc(id.citationFondatrice || "Citation à intégrer")}"</div>
      </div>
    </div>
  </div>`;

  // Hero's Journey — safe access
  const journey = a.herosJourney ?? { acte1Origines: "", acte2Appel: "", acte3Epreuves: "", acte4Transformation: "", acte5Revelation: "" };
  const acts = [
    { label: "Origines", text: journey.acte1Origines },
    { label: "L'Appel", text: journey.acte2Appel },
    { label: "Épreuves", text: journey.acte3Epreuves },
    { label: "Transformation", text: journey.acte4Transformation },
    { label: "Révélation", text: journey.acte5Revelation },
  ].filter((act) => act.text);

  const journeyHtml =
    acts.length > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Hero's Journey</h3>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${acts
        .map(
          (act, i) =>
            `<div class="card" style="border-left:3px solid var(--accent-1);"><div class="micro-text mb-2">Acte ${i + 1} — ${esc(act.label)}</div><p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.7;">${esc(act.text)}</p></div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // Values (Schwartz framework)
  const valuesHtml =
    (a.valeurs?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Valeurs fondatrices <span style="font-size:0.7em;font-weight:400;color:var(--text-tertiary);">(Mod\u00e8le de Schwartz)</span></h3>
    <div class="grid-3">
      ${(a.valeurs ?? [])
        .map(
          (v) =>
            `<div class="card"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span class="mono" style="font-size:1.2rem;font-weight:800;color:var(--accent-1);">#${v.rang}</span><span style="font-family:'Outfit';font-weight:700;">${esc(v.valeur)}</span></div><p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.6;">${esc(v.justification)}</p></div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // Community Hierarchy
  const hierarchyHtml =
    (a.hierarchieCommunautaire?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Hiérarchie communautaire</h3>
    <div class="hierarchy-levels">
      ${(a.hierarchieCommunautaire ?? [])
        .map(
          (h) =>
            `<div class="hierarchy-level"><span class="hl-rank">${h.niveau}</span><span class="hl-name">${esc(h.nom)}</span><span class="hl-desc">${esc(h.description)}</span><span class="hl-priv">${esc(h.privileges)}</span></div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  return `<section id="authenticite">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay" style="background:linear-gradient(135deg, ${PILLAR_CONFIG.A.color}22, rgba(6,6,11,0.95));"></div>
    <div class="section-hero-content">
      <div class="section-tag">A — Authenticité</div>
      <h1>ADN de marque</h1>
      <p class="section-summary">Identité fondatrice, archétype, valeurs et narrative historique.</p>
    </div>
  </div>
  ${identityHtml}
  ${journeyHtml}
  ${valuesHtml}
  ${hierarchyHtml}
</section>`;
}

// ---------------------------------------------------------------------------
// D — Distinction
// ---------------------------------------------------------------------------

function buildSectionD(d: DistinctionPillarData, imageUrl?: string): string {
  // Personas — with generated avatar initials
  const personaGradients = [
    "linear-gradient(135deg, var(--accent-1), #e07a5f)",
    "linear-gradient(135deg, var(--accent-2), #5fba7d)",
    "linear-gradient(135deg, #6366f1, #8b5cf6)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
    "linear-gradient(135deg, #06b6d4, #3b82f6)",
  ];
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0]![0] ?? "").toUpperCase() + (parts[1]![0] ?? "").toUpperCase();
    return (name[0] ?? "?").toUpperCase();
  };
  const personasHtml =
    (d.personas?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Personas</h3>
    <div class="grid-3">
      ${(d.personas ?? [])
        .map(
          (p, idx) => `<div class="persona-card">
        <div class="persona-body">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <div style="width:48px;height:48px;border-radius:50%;background:${personaGradients[idx % personaGradients.length]};display:flex;align-items:center;justify-content:center;font-family:'Outfit';font-weight:700;font-size:1.1rem;color:white;flex-shrink:0;">${getInitials(p.nom)}</div>
            <div>
              <div class="persona-priority" style="color:var(--accent-1);margin-bottom:2px;">Priorit\u00e9 ${p.priorite}</div>
              <h3 style="margin:0;">${esc(p.nom)}</h3>
            </div>
          </div>
          <div class="persona-demo">${esc(p.demographie)}</div>
          ${p.psychographie ? `<div class="persona-detail-row"><span class="pdr-label">Psycho</span><span class="pdr-val">${esc(p.psychographie)}</span></div>` : ""}
          ${p.motivations ? `<div class="persona-detail-row"><span class="pdr-label">Motivations</span><span class="pdr-val">${esc(p.motivations)}</span></div>` : ""}
          ${p.freins ? `<div class="persona-detail-row"><span class="pdr-label">Freins</span><span class="pdr-val">${esc(p.freins)}</span></div>` : ""}
        </div>
      </div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // Positioning
  const posHtml = d.positionnement
    ? `<div class="sub-section">
    <h3 class="sub-title">Positionnement</h3>
    <div class="card" style="border-left:3px solid var(--accent-1);font-size:1.05rem;line-height:1.8;">${esc(d.positionnement)}</div>
  </div>`
    : "";

  // Tone of voice — safe access
  const ton = d.tonDeVoix ?? { personnalite: "", onDit: [], onNeditPas: [] };
  const tonHtml =
    ton.personnalite || (ton.onDit?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Ton de voix</h3>
    ${ton.personnalite ? `<div class="card mb-3"><div class="micro-text mb-2">Personnalité</div><p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.7;">${esc(ton.personnalite)}</p></div>` : ""}
    <div class="grid-2">
      ${(ton.onDit?.length ?? 0) > 0 ? `<div class="card" style="border-top:3px solid var(--score-excellent);"><div class="micro-text mb-2" style="color:var(--score-excellent);">✓ On dit</div><ul style="list-style:none;">${(ton.onDit ?? []).map((s) => `<li style="font-size:var(--fs-small);padding:4px 0;color:var(--text-secondary);">• ${esc(s)}</li>`).join("")}</ul></div>` : ""}
      ${(ton.onNeditPas?.length ?? 0) > 0 ? `<div class="card" style="border-top:3px solid var(--risk-high);"><div class="micro-text mb-2" style="color:var(--risk-high);">✗ On ne dit pas</div><ul style="list-style:none;">${(ton.onNeditPas ?? []).map((s) => `<li style="font-size:var(--fs-small);padding:4px 0;color:var(--text-secondary);">• ${esc(s)}</li>`).join("")}</ul></div>` : ""}
    </div>
  </div>`
      : "";

  // Competitors — safe access
  const concurrents = d.paysageConcurrentiel?.concurrents ?? [];
  const compHtml =
    concurrents.length > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Paysage concurrentiel</h3>
    <div class="grid-3">
      ${concurrents
        .map(
          (c) =>
            `<div class="card"><h4 style="font-size:1rem;margin-bottom:10px;">${esc(c.nom)}</h4>${c.forces ? `<div class="persona-detail-row"><span class="pdr-label">Forces</span><span class="pdr-val" style="color:var(--score-excellent);">${esc(c.forces)}</span></div>` : ""}${c.faiblesses ? `<div class="persona-detail-row"><span class="pdr-label">Faiblesses</span><span class="pdr-val" style="color:var(--risk-high);">${esc(c.faiblesses)}</span></div>` : ""}${c.partDeMarche ? `<div class="persona-detail-row"><span class="pdr-label">PDM</span><span class="pdr-val">${esc(c.partDeMarche)}</span></div>` : ""}</div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  const dParts = [personasHtml, posHtml, tonHtml, compHtml];
  const dFallback = dParts.every(p => !p) ? emptyPillarFallback("D", [
    { icon: "👥", label: "Personas", desc: "Profils cibles à définir" },
    { icon: "🎯", label: "Positionnement", desc: "Statement à formuler" },
    { icon: "🗣️", label: "Ton de voix", desc: "Charte éditoriale à créer" },
  ]) : "";

  return `<section id="distinction">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay" style="background:linear-gradient(135deg, ${PILLAR_CONFIG.D.color}22, rgba(6,6,11,0.95));"></div>
    <div class="section-hero-content">
      <div class="section-tag">D — Distinction</div>
      <h1>Positionnement &amp; Identité</h1>
      <p class="section-summary">Personas, paysage concurrentiel, ton de voix et identité visuelle.</p>
    </div>
  </div>
  ${personasHtml}
  ${posHtml}
  ${tonHtml}
  ${compHtml}
  ${dFallback}
</section>`;
}

// ---------------------------------------------------------------------------
// V — Valeur
// ---------------------------------------------------------------------------

function buildSectionV(v: ValeurPillarData, currency: string, imageUrl?: string): string {
  // Strip existing currency symbols/codes from price strings to avoid duplication
  const cleanPrice = (prix: string) => {
    return prix
      .replace(/\s*(FCFA|XOF|XAF|EUR|\u20AC|USD|\$|GBP|\u00A3|MAD|DH|TND|DT)\s*/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  };
  // Product Ladder — safe access
  const ladderHtml =
    (v.productLadder?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Product Ladder</h3>
    <div class="ladder-row">
      ${(v.productLadder ?? [])
        .map(
          (tier) => `<div class="ladder-step">
        <div class="ladder-name">${esc(tier.tier)}</div>
        <div class="ladder-price">${esc(cleanPrice(tier.prix))} ${esc(currency)}</div>
        <div class="ladder-target">${esc(tier.cible)}</div>
        <div class="ladder-desc">${esc(tier.description)}</div>
      </div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // Unit Economics — safe access
  const ue = v.unitEconomics ?? { cac: "", ltv: "", ratio: "", pointMort: "", marges: "", notes: "" };
  const ueHtml =
    ue.cac || ue.ltv
      ? `<div class="sub-section">
    <h3 class="sub-title">Unit Economics</h3>
    <div class="ue-grid">
      ${ue.cac ? `<div class="ue-cell"><div class="ue-val">${esc(ue.cac)}</div><div class="ue-label">CAC</div></div>` : ""}
      ${ue.ltv ? `<div class="ue-cell"><div class="ue-val">${esc(ue.ltv)}</div><div class="ue-label">LTV</div></div>` : ""}
      ${ue.ratio ? `<div class="ue-cell"><div class="ue-val">${esc(ue.ratio)}</div><div class="ue-label">LTV/CAC</div></div>` : ""}
      ${ue.pointMort ? `<div class="ue-cell"><div class="ue-val">${esc(ue.pointMort)}</div><div class="ue-label">Point mort</div></div>` : ""}
      ${ue.marges ? `<div class="ue-cell"><div class="ue-val">${esc(ue.marges)}</div><div class="ue-label">Marges</div></div>` : ""}
    </div>
    ${ue.notes ? `<div class="card" style="margin-top:16px;"><div class="micro-text mb-2">Notes</div><p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.7;">${esc(ue.notes)}</p></div>` : ""}
  </div>`
      : "";

  // Value Brand — safe access
  const brandVal = v.valeurMarque ?? { tangible: [], intangible: [] };
  const brandValHtml =
    (brandVal.tangible?.length ?? 0) > 0 || (brandVal.intangible?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Création de valeur</h3>
    <div class="grid-2">
      ${(brandVal.tangible?.length ?? 0) > 0 ? `<div class="card" style="border-top:3px solid var(--accent-1);"><div class="micro-text mb-2">Tangible</div><ul style="list-style:none;">${(brandVal.tangible ?? []).map((t) => `<li style="font-size:var(--fs-small);padding:4px 0;color:var(--text-secondary);">• ${esc(t)}</li>`).join("")}</ul></div>` : ""}
      ${(brandVal.intangible?.length ?? 0) > 0 ? `<div class="card" style="border-top:3px solid var(--accent-2);"><div class="micro-text mb-2">Intangible</div><ul style="list-style:none;">${(brandVal.intangible ?? []).map((t) => `<li style="font-size:var(--fs-small);padding:4px 0;color:var(--text-secondary);">• ${esc(t)}</li>`).join("")}</ul></div>` : ""}
    </div>
  </div>`
      : "";

  // Cost structure — safe access
  const cm = v.coutMarque ?? { capex: "", opex: "", coutsCaches: [] };
  const costHtml =
    cm.capex || cm.opex
      ? `<div class="sub-section">
    <h3 class="sub-title">Structure de coûts</h3>
    <div class="grid-2">
      ${cm.capex ? `<div class="card"><div class="micro-text mb-2">CAPEX</div><p style="font-size:var(--fs-small);color:var(--text-secondary);">${esc(cm.capex)}</p></div>` : ""}
      ${cm.opex ? `<div class="card"><div class="micro-text mb-2">OPEX</div><p style="font-size:var(--fs-small);color:var(--text-secondary);">${esc(cm.opex)}</p></div>` : ""}
    </div>
  </div>`
      : "";

  const vParts = [ladderHtml, ueHtml, brandValHtml, costHtml];
  const vFallback = vParts.every(p => !p) ? emptyPillarFallback("V", [
    { icon: "📦", label: "Product Ladder", desc: "Gamme de produits à structurer" },
    { icon: "📈", label: "Unit Economics", desc: "LTV, CAC et marges à calculer" },
    { icon: "💎", label: "Valeur de marque", desc: "Actifs tangibles et intangibles à évaluer" },
  ]) : "";

  return `<section id="valeur">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay" style="background:linear-gradient(135deg, ${PILLAR_CONFIG.V.color}22, rgba(6,6,11,0.95));"></div>
    <div class="section-hero-content">
      <div class="section-tag">V — Valeur</div>
      <h1>Proposition de valeur</h1>
      <p class="section-summary">Product ladder, unit economics, création de valeur et structure de coûts.</p>
    </div>
  </div>
  ${ladderHtml}
  ${ueHtml}
  ${brandValHtml}
  ${costHtml}
  ${vFallback}
</section>`;
}

// ---------------------------------------------------------------------------
// E — Engagement
// ---------------------------------------------------------------------------

function buildSectionE(e: EngagementPillarData, imageUrl?: string): string {
  // KPIs — safe access
  const kpisHtml =
    (e.kpis?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">KPIs</h3>
    <div class="grid-4">
      ${(e.kpis ?? [])
        .map(
          (k) =>
            `<div class="kpi-card"><div class="kpi-label">${esc(k.nom || k.variable)}</div><div class="kpi-value" style="color:var(--accent-1);">${esc(k.cible)}</div><div class="kpi-freq">${esc(k.frequence)}</div></div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // Rituals — safe access
  const ritualsHtml =
    (e.rituels?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Rituels</h3>
    <div class="grid-3">
      ${(e.rituels ?? [])
        .map(
          (rit) =>
            `<div class="card"><div class="card-badge" style="margin-bottom:12px;${rit.type === "always-on" ? "background:rgba(46,213,115,0.15);color:#2ED573;" : "background:rgba(255,165,2,0.15);color:#FFA502;"}">${esc(rit.type)}</div><h4 style="margin-bottom:6px;">${esc(rit.nom)}</h4><p style="font-size:var(--fs-small);color:var(--text-secondary);margin-bottom:4px;">${esc(rit.description)}</p><div style="font-size:var(--fs-micro);color:var(--text-tertiary);">${esc(rit.frequence)}</div></div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // Gamification — safe access
  const gamifHtml =
    (e.gamification?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Gamification</h3>
    <div class="gamif-levels">
      ${(e.gamification ?? [])
        .map(
          (g) =>
            `<div class="gamif-level"><div class="gamif-num">${g.niveau}</div><div class="gamif-name">${esc(g.nom)}</div><div class="gamif-cond">${esc(g.condition)}</div><div class="gamif-reward">${esc(g.recompense)}</div></div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // Community principles — safe access
  const pc = e.principesCommunautaires ?? { principes: [], tabous: [] };
  const communityHtml =
    (pc.principes?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Principes communautaires</h3>
    <div class="grid-2">
      <div class="card" style="border-top:3px solid var(--score-excellent);">
        <div class="micro-text mb-2" style="color:var(--score-excellent);">Principes</div>
        <ul style="list-style:none;">${(pc.principes ?? []).map((p) => `<li style="font-size:var(--fs-small);padding:4px 0;color:var(--text-secondary);">• ${esc(p)}</li>`).join("")}</ul>
      </div>
      ${
        (pc.tabous?.length ?? 0) > 0
          ? `<div class="card" style="border-top:3px solid var(--risk-high);">
        <div class="micro-text mb-2" style="color:var(--risk-high);">Tabous</div>
        <ul style="list-style:none;">${(pc.tabous ?? []).map((t) => `<li style="font-size:var(--fs-small);padding:4px 0;color:var(--text-secondary);">• ${esc(t)}</li>`).join("")}</ul>
      </div>`
          : ""
      }
    </div>
  </div>`
      : "";

  const eParts = [kpisHtml, ritualsHtml, gamifHtml, communityHtml];
  const eFallback = eParts.every(p => !p) ? emptyPillarFallback("E", [
    { icon: "📊", label: "KPIs", desc: "Indicateurs de performance à définir" },
    { icon: "🔄", label: "Rituels", desc: "Rituels d'engagement à créer" },
    { icon: "🎮", label: "Gamification", desc: "Mécaniques de jeu à imaginer" },
  ]) : "";

  return `<section id="engagement">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay" style="background:linear-gradient(135deg, ${PILLAR_CONFIG.E.color}22, rgba(6,6,11,0.95));"></div>
    <div class="section-hero-content">
      <div class="section-tag">E — Engagement</div>
      <h1>Stratégie d'engagement</h1>
      <p class="section-summary">KPIs, rituels, gamification et principes communautaires.</p>
    </div>
  </div>
  ${kpisHtml}
  ${ritualsHtml}
  ${gamifHtml}
  ${communityHtml}
  ${eFallback}
</section>`;
}

// ---------------------------------------------------------------------------
// R — Risk
// ---------------------------------------------------------------------------

function buildSectionR(r: RiskAuditResult, imageUrl?: string): string {
  // Global SWOT — only render if at least one quadrant has data
  const gs = r.globalSwot ?? { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const hasSwot = (gs.strengths?.length ?? 0) + (gs.weaknesses?.length ?? 0) + (gs.opportunities?.length ?? 0) + (gs.threats?.length ?? 0) > 0;
  const swotHtml = hasSwot ? `<div class="sub-section">
    <h3 class="sub-title">SWOT Globale</h3>
    <div class="swot-grid">
      <div class="swot-cell swot-strengths"><h4>💪 Forces</h4><ul>${(gs.strengths ?? []).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>
      <div class="swot-cell swot-weaknesses"><h4>⚠️ Faiblesses</h4><ul>${(gs.weaknesses ?? []).map((w) => `<li>${esc(w)}</li>`).join("")}</ul></div>
      <div class="swot-cell swot-opportunities"><h4>🌟 Opportunités</h4><ul>${(gs.opportunities ?? []).map((o) => `<li>${esc(o)}</li>`).join("")}</ul></div>
      <div class="swot-cell swot-threats"><h4>🔥 Menaces</h4><ul>${(gs.threats ?? []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
    </div>
  </div>` : "";

  // Risk matrix — safe access
  const matrixHtml =
    (r.probabilityImpactMatrix?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Matrice probabilité × impact</h3>
    <table class="risk-matrix-table">
      <thead><tr><th>Risque</th><th>Probabilité</th><th>Impact</th><th>Priorité</th></tr></thead>
      <tbody>
        ${(r.probabilityImpactMatrix ?? [])
          .map(
            (row) =>
              `<tr><td style="font-weight:600;">${esc(row.risk)}</td><td><span class="card-badge ${badgeClass(row.probability)}">${esc(row.probability)}</span></td><td><span class="card-badge ${badgeClass(row.impact)}">${esc(row.impact)}</span></td><td class="mono" style="font-weight:700;color:var(--accent-1);">${row.priority}/5</td></tr>`,
          )
          .join("\n")}
      </tbody>
    </table>
  </div>`
      : "";

  // Mitigation — safe access
  const mitigHtml =
    (r.mitigationPriorities?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Plan de mitigation</h3>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${(r.mitigationPriorities ?? [])
        .map(
          (m) =>
            `<div class="card" style="border-left:3px solid ${riskColor(m.effort)};"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-weight:700;">${esc(m.risk)}</span><span class="card-badge ${badgeClass(m.urgency === "immediate" ? "high" : m.urgency === "short_term" ? "medium" : "low")}">${esc(m.urgency)}</span></div><p style="font-size:var(--fs-small);color:var(--text-secondary);">${esc(m.action)}</p></div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  return `<section id="risk">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay" style="background:linear-gradient(135deg, ${PILLAR_CONFIG.R.color}22, rgba(6,6,11,0.95));"></div>
    <div class="section-hero-content">
      <div class="section-tag">R — Risk</div>
      <h1>Analyse des risques</h1>
      <p class="section-summary">Score : <strong style="color:${scoreColor(100 - r.riskScore)}">${r.riskScore}/100</strong> — ${esc(r.summary || "")}</p>
    </div>
  </div>
  ${swotHtml}
  ${matrixHtml}
  ${mitigHtml}
</section>`;
}

// ---------------------------------------------------------------------------
// T — Track
// ---------------------------------------------------------------------------

function buildSectionT(t: TrackAuditResult, imageUrl?: string): string {
  // TAM/SAM/SOM — safe access for nested objects
  const tss = t.tamSamSom ?? { tam: { value: "", description: "" }, sam: { value: "", description: "" }, som: { value: "", description: "" }, methodology: "" };
  const tamHtml =
    tss.tam?.value || tss.sam?.value || tss.som?.value
      ? `<div class="sub-section">
    <h3 class="sub-title">TAM / SAM / SOM</h3>
    <div class="tam-circles">
      ${tss.tam.value ? `<div class="tam-circle tam"><div class="tam-val">${esc(tss.tam.value)}</div><div class="tam-label">TAM</div></div>` : ""}
      ${tss.sam.value ? `<div class="tam-circle sam"><div class="tam-val">${esc(tss.sam.value)}</div><div class="tam-label">SAM</div></div>` : ""}
      ${tss.som.value ? `<div class="tam-circle som"><div class="tam-val">${esc(tss.som.value)}</div><div class="tam-label">SOM</div></div>` : ""}
    </div>
    ${tss.methodology ? `<div class="card"><div class="micro-text mb-2">Méthodologie</div><p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.7;">${esc(tss.methodology)}</p></div>` : ""}
  </div>`
      : "";

  // Trends — safe access
  const mr = t.marketReality ?? { macroTrends: [], weakSignals: [], emergingPatterns: [] };
  const trendsHtml =
    (mr.macroTrends?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Tendances marché</h3>
    <div class="grid-3">
      ${(mr.macroTrends?.length ?? 0) > 0 ? `<div class="card" style="border-top:3px solid var(--accent-1);"><div class="micro-text mb-2">Macro-tendances</div><ul style="list-style:none;">${(mr.macroTrends ?? []).map((tr) => `<li style="font-size:var(--fs-small);padding:4px 0;color:var(--text-secondary);">• ${esc(tr)}</li>`).join("")}</ul></div>` : ""}
      ${(mr.weakSignals?.length ?? 0) > 0 ? `<div class="card" style="border-top:3px solid var(--risk-medium);"><div class="micro-text mb-2">Signaux faibles</div><ul style="list-style:none;">${(mr.weakSignals ?? []).map((ws) => `<li style="font-size:var(--fs-small);padding:4px 0;color:var(--text-secondary);">• ${esc(ws)}</li>`).join("")}</ul></div>` : ""}
      ${(mr.emergingPatterns?.length ?? 0) > 0 ? `<div class="card" style="border-top:3px solid var(--accent-2);"><div class="micro-text mb-2">Patterns émergents</div><ul style="list-style:none;">${(mr.emergingPatterns ?? []).map((ep) => `<li style="font-size:var(--fs-small);padding:4px 0;color:var(--text-secondary);">• ${esc(ep)}</li>`).join("")}</ul></div>` : ""}
    </div>
  </div>`
      : "";

  // Hypothesis validation
  const hypoHtml =
    (t.hypothesisValidation?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Validation des hypothèses</h3>
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${(t.hypothesisValidation ?? [])
        .map(
          (h) =>
            `<div class="card" style="display:flex;align-items:flex-start;gap:14px;"><span class="card-badge badge-${h.status === "validated" ? "validated" : h.status === "invalidated" ? "risk-high" : "to-test"}" style="flex-shrink:0;margin-top:2px;">${esc(h.status)}</span><div><p style="font-weight:600;font-size:var(--fs-small);margin-bottom:4px;">${esc(h.hypothesis)}</p><p style="font-size:var(--fs-micro);color:var(--text-tertiary);">${esc(h.evidence)}</p></div></div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // Recommendations
  const recoHtml =
    (t.strategicRecommendations?.length ?? 0) > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Recommandations stratégiques</h3>
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${(t.strategicRecommendations ?? []).map((rec, i) => `<div class="card" style="border-left:3px solid var(--accent-1);"><span class="mono" style="color:var(--accent-1);font-weight:700;margin-right:8px;">${i + 1}.</span>${esc(rec)}</div>`).join("\n")}
    </div>
  </div>`
      : "";

  const tParts = [tamHtml, trendsHtml, hypoHtml, recoHtml];
  const tFallback = tParts.every(p => !p) ? emptyPillarFallback("T", [
    { icon: "🌍", label: "TAM/SAM/SOM", desc: "Dimensionnement marché à calculer" },
    { icon: "📡", label: "Signaux faibles", desc: "Tendances à surveiller" },
    { icon: "🧪", label: "Hypothèses", desc: "Validation terrain à lancer" },
  ]) : "";

  return `<section id="track">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay" style="background:linear-gradient(135deg, ${PILLAR_CONFIG.T.color}22, rgba(6,6,11,0.95));"></div>
    <div class="section-hero-content">
      <div class="section-tag">T — Track</div>
      <h1>Validation marché</h1>
      <p class="section-summary">Brand-Market Fit : <strong style="color:${scoreColor(t.brandMarketFitScore)}">${t.brandMarketFitScore}/100</strong> — ${esc(t.summary || "Analyse en cours")}</p>
    </div>
  </div>
  ${tamHtml}
  ${trendsHtml}
  ${hypoHtml}
  ${recoHtml}
  ${tFallback}
</section>`;
}

// ---------------------------------------------------------------------------
// I — Implémentation
// ---------------------------------------------------------------------------

function buildSectionImpl(ctx: OracleResolved, currency: string, imageUrl?: string): string {
  // Sprint 90 — uses resolved actions (already fallback-resolved via ctx)
  const sprintHtml =
    !ctx.sprint90IsDefault && ctx.sprint90Actions.length > 0
      ? `<div class="sub-section">
    <h3 class="sub-title">Sprint 90 jours</h3>
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${ctx.sprint90Actions
        .map(
          (act) =>
            `<div class="card" style="display:flex;align-items:flex-start;gap:14px;"><span class="card-badge badge-p0" style="flex-shrink:0;">Action</span><div><p style="font-weight:600;font-size:var(--fs-small);">${esc(act.action)}</p><div style="font-size:var(--fs-micro);color:var(--text-tertiary);margin-top:4px;">Owner: ${esc(act.owner)} \u00b7 KPI: ${esc(act.kpi)}</div></div></div>`,
        )
        .join("\n")}
    </div>
  </div>`
      : "";

  // Year 1 + Year 3 — from resolved context
  const hasYear1 = ctx.year1Priorities.length > 0;
  const hasYear3 = !!ctx.visionStrategique;
  const visionHtml = (hasYear1 || hasYear3) ? `<div class="sub-section">
    <h3 class="sub-title">Vision strat\u00e9gique</h3>
    <div class="grid-2">
      ${
        hasYear1
          ? `<div class="card" style="border-top:3px solid var(--accent-1);">
        <div class="micro-text mb-2">Ann\u00e9e 1 \u2014 Priorit\u00e9s</div>
        <ul style="list-style:none;">${ctx.year1Priorities.map((p) => `<li style="font-size:var(--fs-small);padding:4px 0;color:var(--text-secondary);">\u2022 ${esc(p)}</li>`).join("")}</ul>
      </div>`
          : ""
      }
      ${
        hasYear3
          ? `<div class="card" style="border-top:3px solid var(--accent-3);">
        <div class="micro-text mb-2">Vision 3 ans</div>
        <p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.7;">${esc(ctx.visionStrategique)}</p>
      </div>`
          : ""
      }
    </div>
  </div>` : "";

  // Executive Summary — from resolved context
  const summaryHtml = ctx.executiveSummary
    ? `<div class="sub-section">
    <div class="card" style="background:linear-gradient(135deg, var(--accent-1-dim), var(--bg-card));border:1px solid var(--accent-1);padding:32px;">
      <div class="micro-text" style="color:var(--accent-1);margin-bottom:12px;">Synth\u00e8se ex\u00e9cutive</div>
      <p style="font-size:1.05rem;line-height:1.8;color:var(--text-primary);max-width:900px;">${esc(ctx.executiveSummary)}</p>
    </div>
  </div>`
    : "";

  // Campaigns — Annual Calendar (from ctx.campaigns)
  const calendarItems = ctx.campaigns?.annualCalendar?.filter((c) => c.mois || c.campagne) ?? [];
  const calendarHtml = calendarItems.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">Calendrier annuel des campagnes</h3>
    <div style="overflow-x:auto;">
      <table class="cal-table">
        <thead><tr><th>Mois</th><th>Campagne</th><th>Objectif</th><th>Canaux</th><th>Budget</th><th>KPI cible</th></tr></thead>
        <tbody>
          ${calendarItems.map((c) => `<tr>
            <td class="cal-mois">${esc(c.mois)}</td>
            <td style="font-weight:600;">${esc(c.campagne)}</td>
            <td style="color:var(--text-secondary);">${esc(c.objectif)}</td>
            <td>${c.canaux.length > 0 ? `<div class="cal-canaux">${c.canaux.map((ch) => `<span class="cal-canal">${esc(ch)}</span>`).join("")}</div>` : "\u2014"}</td>
            <td class="mono" style="color:var(--accent-1);">${esc(c.budget) || "\u2014"}</td>
            <td style="color:var(--text-secondary);">${esc(c.kpiCible) || "\u2014"}</td>
          </tr>`).join("\n")}
        </tbody>
      </table>
    </div>
  </div>`
    : "";

  // Campaigns — Templates
  const templates = ctx.campaigns?.templates?.filter((tpl) => tpl.nom) ?? [];
  const templatesHtml = templates.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">Templates de campagne</h3>
    <div class="grid-2">
      ${templates.map((tpl) => `<div class="card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <span class="card-badge" style="background:rgba(99,102,241,0.15);color:#818cf8;">${esc(tpl.type)}</span>
          <span style="font-weight:700;font-size:var(--fs-small);">${esc(tpl.nom)}</span>
        </div>
        <p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.6;margin-bottom:8px;">${esc(tpl.description)}</p>
        ${tpl.duree ? `<div style="font-size:var(--fs-micro);color:var(--text-tertiary);">Dur\u00e9e: ${esc(tpl.duree)}</div>` : ""}
        ${tpl.canauxPrincipaux.length > 0 ? `<div class="cal-canaux" style="margin-top:8px;">${tpl.canauxPrincipaux.map((ch) => `<span class="cal-canal">${esc(ch)}</span>`).join("")}</div>` : ""}
        ${tpl.messagesCles.length > 0 ? `<div style="margin-top:8px;"><div class="micro-text" style="margin-bottom:4px;">Messages cl\u00e9s</div><ul style="list-style:none;">${tpl.messagesCles.map((m) => `<li style="font-size:var(--fs-small);padding:2px 0;color:var(--text-secondary);">\u2022 ${esc(m)}</li>`).join("")}</ul></div>` : ""}
      </div>`).join("\n")}
    </div>
  </div>`
    : "";

  // Campaigns — Activation Plan (4 phases)
  const ap = ctx.campaigns?.activationPlan;
  const activationPhases = [
    { label: "Phase 1 \u2014 Teasing", desc: ap?.phase1Teasing ?? "" },
    { label: "Phase 2 \u2014 Lancement", desc: ap?.phase2Lancement ?? "" },
    { label: "Phase 3 \u2014 Amplification", desc: ap?.phase3Amplification ?? "" },
    { label: "Phase 4 \u2014 Fid\u00e9lisation", desc: ap?.phase4Fidelisation ?? "" },
  ].filter((p) => p.desc.trim().length > 0);
  const activationHtml = activationPhases.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">Plan d\u2019activation</h3>
    <div class="activation-grid">
      ${activationPhases.map((p) => `<div class="activation-card">
        <div class="ac-phase">${esc(p.label)}</div>
        <div class="ac-desc">${esc(p.desc)}</div>
      </div>`).join("\n")}
    </div>
  </div>`
    : "";

  // Budget — Par Phase
  const phases = ctx.budgetAllocation?.parPhase?.filter((p) => p.phase || p.montant) ?? [];
  const phasesHtml = phases.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">Budget par phase</h3>
    <div class="phase-timeline">
      ${phases.map((p) => `<div class="phase-row">
        <div class="ph-name">${esc(p.phase)}</div>
        <div class="ph-focus">${esc(p.focus)}</div>
        <div class="ph-montant">${esc(p.montant)}</div>
      </div>`).join("\n")}
    </div>
  </div>`
    : "";

  // ROI Projections
  const roi = ctx.budgetAllocation?.roiProjections;
  const roiEntries = [
    { period: "6 mois", val: roi?.mois6 ?? "" },
    { period: "12 mois", val: roi?.mois12 ?? "" },
    { period: "24 mois", val: roi?.mois24 ?? "" },
  ].filter((entry) => entry.val.trim().length > 0);
  const roiHtml = roiEntries.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">Projections ROI</h3>
    <div class="roi-grid">
      ${roiEntries.map((entry) => `<div class="roi-card">
        <div class="roi-period">${esc(entry.period)}</div>
        <div class="roi-val">${esc(entry.val)}</div>
      </div>`).join("\n")}
    </div>
    ${roi?.hypotheses ? `<div class="card" style="margin-top:16px;padding:16px 20px;"><div class="micro-text" style="margin-bottom:6px;">Hypoth\u00e8ses</div><p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.6;">${esc(roi.hypotheses)}</p></div>` : ""}
  </div>`
    : "";

  // Count sub-sections
  const allParts = [sprintHtml, visionHtml, calendarHtml, templatesHtml, activationHtml, phasesHtml, roiHtml, summaryHtml];
  const subSectionCount = allParts.filter(Boolean).length;
  const summaryText = subSectionCount > 3
    ? "Roadmap compl\u00e8te : sprint 90 jours, calendrier campagnes, plan d\u2019activation, projections ROI."
    : "Sprint 90 jours, vision strat\u00e9gique et synth\u00e8se ex\u00e9cutive.";

  // Fallback when all sub-sections are empty
  const fallbackHtml = subSectionCount === 0 ? emptyPillarFallback("I", [
    { icon: "\uD83D\uDCC5\uFE0F", label: "Sprint 90 jours", desc: "Actions prioritaires \u00e0 d\u00e9finir" },
    { icon: "\uD83D\uDCCA", label: "Calendrier campagnes", desc: "Campagnes annuelles \u00e0 planifier" },
    { icon: "\uD83D\uDCB0", label: "Budget & ROI", desc: "Projections budg\u00e9taires \u00e0 compl\u00e9ter" },
  ]) : "";

  return `<section id="implementation">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay" style="background:linear-gradient(135deg, ${PILLAR_CONFIG.I.color}22, rgba(6,6,11,0.95));"></div>
    <div class="section-hero-content">
      <div class="section-tag">I \u2014 Impl\u00e9mentation</div>
      <h1>Roadmap &amp; Ex\u00e9cution</h1>
      <p class="section-summary">${summaryText}</p>
    </div>
  </div>
  ${summaryHtml}
  ${sprintHtml}
  ${visionHtml}
  ${calendarHtml}
  ${templatesHtml}
  ${activationHtml}
  ${phasesHtml}
  ${roiHtml}
  ${fallbackHtml}
</section>`;
}

// ---------------------------------------------------------------------------
// Phase 4: Decisions Section
// ---------------------------------------------------------------------------

function buildSectionDecisions(
  decisions: DecisionData[],
  role: string | undefined,
  vertical: string | undefined,
  imageUrl?: string,
): string {
  const pending = decisions.filter((d) => d.status === "PENDING" || d.status === "IN_PROGRESS");
  const resolved = decisions.filter((d) => d.status === "RESOLVED" || d.status === "DEFERRED");

  const priorityBorder: Record<string, string> = {
    P0: "var(--risk-high)",
    P1: "var(--risk-medium)",
    P2: "var(--p2-color)",
  };

  const priorityBadge: Record<string, string> = {
    P0: "badge-p0",
    P1: "badge-p1",
    P2: "badge-p2",
  };

  const renderDecision = (d: DecisionData) => `
    <div class="decision-card" style="border-left:4px solid ${priorityBorder[d.priority] ?? "var(--border-default)"};">
      <div class="decision-header">
        <div class="decision-header-left">
          <span class="card-badge ${priorityBadge[d.priority] ?? "badge-p2"}">${esc(d.priority)}</span>
          <span style="font-family:'Outfit';font-weight:700;font-size:var(--fs-body);">${esc(d.title)}</span>
        </div>
        ${d.deadline ? `<span class="decision-deadline" style="color:${priorityBorder[d.priority] ?? "var(--text-tertiary)"};">Deadline : ${formatShortDate(d.deadline)}</span>` : ""}
      </div>
      ${d.description ? `<div style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.6;">${esc(d.description)}</div>` : ""}
      ${d.deadlineType ? `<div style="font-size:var(--fs-micro);color:var(--text-tertiary);margin-top:8px;">Type : ${esc(d.deadlineType)} ${inlineFreshnessBadge(d.createdAt, vertical)}</div>` : ""}
      ${d.resolution ? `<div style="margin-top:10px;padding:10px 14px;background:var(--bg-elevated);border-radius:8px;font-size:var(--fs-small);"><span class="micro-text" style="color:var(--score-excellent);margin-bottom:4px;display:block;">Resolution</span>${esc(d.resolution)}</div>` : ""}
    </div>`;

  return `<section id="decisions">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay"></div>
    <div class="section-hero-content">
      <div class="section-tag" style="background:rgba(255,71,87,0.15);color:var(--risk-high);">&#x26A1; ${wl("Decisions", role)}</div>
      <h1>File de d&eacute;cisions</h1>
      <p class="section-summary">${pending.length} en attente, ${resolved.length} r&eacute;solue(s). Actions qui attendent un arbitrage.</p>
    </div>
  </div>

  ${pending.length > 0 ? `<div class="sub-section">
    <h3 class="sub-title">En attente</h3>
    ${pending.map(renderDecision).join("\n")}
  </div>` : ""}

  ${resolved.length > 0 ? `<div class="sub-section">
    <h3 class="sub-title">R&eacute;solues / Diff&eacute;r&eacute;es</h3>
    ${resolved.map(renderDecision).join("\n")}
  </div>` : ""}
</section>`;
}

// ---------------------------------------------------------------------------
// Phase 4: Competitors Section
// ---------------------------------------------------------------------------

function buildSectionCompetitors(
  competitors: CompetitorData[],
  brandName: string,
  role: string | undefined,
  vertical: string | undefined,
  imageUrl?: string,
): string {
  if (competitors.length === 0) return "";

  // Safe array cast for Prisma Json fields
  const toArr = (v: unknown): string[] => Array.isArray(v) ? v.map(String) : [];

  // Build comparison table
  const metrics = ["SOV Social", "Positioning", "Force principale", "Menace principale"];
  const getMetric = (c: CompetitorData, m: string): string => {
    switch (m) {
      case "SOV Social": return c.sov != null ? `${c.sov}%` : "Non suivi";
      case "Positioning": return c.positioning?.trim() || "À analyser";
      case "Force principale": return toArr(c.strengths)[0] || "À identifier";
      case "Menace principale": return toArr(c.weaknesses)[0] || "À identifier";
      default: return "N/A";
    }
  };

  const tableRows = metrics.map((m) =>
    `<tr><td style="font-weight:600;">${esc(m)}</td>${competitors.map((c) =>
      `<td style="text-align:center;font-size:var(--fs-small);${m === "SOV Social" ? "font-family:'JetBrains Mono';" : ""}color:var(--text-secondary);">${esc(getMetric(c, m))}</td>`
    ).join("")}</tr>`
  ).join("\n");

  // Recent moves
  const movesHtml = competitors
    .filter((c) => toArr(c.recentMoves).length > 0)
    .map((c) => `
      <div class="card mb-2">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-family:'Outfit';font-weight:700;font-size:var(--fs-small);">${esc(c.name)}</span>
          ${inlineFreshnessBadge(c.lastUpdated, vertical)}
        </div>
        <ul style="list-style:none;">${toArr(c.recentMoves).map((m) => `<li style="font-size:var(--fs-small);color:var(--text-secondary);padding:3px 0;">&#x2022; ${esc(m)}</li>`).join("")}</ul>
      </div>`)
    .join("\n");

  return `<section id="competitors">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay" style="background:linear-gradient(135deg, rgba(45,90,61,0.22), rgba(6,6,11,0.95));"></div>
    <div class="section-hero-content">
      <div class="section-tag" style="background:rgba(45,90,61,0.15);color:var(--accent-2);">&#x1F3AF; ${wl("Concurrents", role)}</div>
      <h1>Snapshot concurrentiel</h1>
      <p class="section-summary">${competitors.length} concurrent(s) suivis. Positionnement, SOV et mouvements r&eacute;cents.</p>
    </div>
  </div>

  <div class="sub-section">
    <h3 class="sub-title">Tableau comparatif</h3>
    <div style="overflow-x:auto;">
    <table class="comp-table">
      <thead><tr><th></th>${competitors.map((c) => `<th style="text-align:center;">${esc(c.name)}</th>`).join("")}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    </div>
  </div>

  ${movesHtml ? `<div class="sub-section">
    <h3 class="sub-title">Mouvements r&eacute;cents</h3>
    ${movesHtml}
  </div>` : ""}
</section>`;
}

// ---------------------------------------------------------------------------
// Phase 4: Briefs Section
// ---------------------------------------------------------------------------

function buildSectionBriefs(
  briefs: BriefData[],
  role: string | undefined,
  vertical: string | undefined,
  imageUrl?: string,
): string {
  if (briefs.length === 0) return "";

  const statusClass: Record<string, string> = {
    VALIDATED: "brief-validated",
    DRAFT: "brief-draft",
    STALE: "brief-stale",
  };

  const statusLabel: Record<string, string> = {
    VALIDATED: "Valide",
    DRAFT: "Brouillon",
    STALE: "Perime",
    ARCHIVED: "Archive",
  };

  const toArr = (v: unknown): string[] => Array.isArray(v) ? v.map(String) : [];

  const briefCards = briefs.map((b) => `
    <div class="brief-card">
      <div class="brief-type">${esc(b.type.replace(/_/g, " "))}</div>
      <div class="brief-pillars">
        ${toArr(b.sourcePillars).map((p: string) => {
          const cfg = PILLAR_CONFIG[p as keyof typeof PILLAR_CONFIG];
          return cfg ? `<span class="brief-pillar-tag" style="background:${cfg.color};">${esc(p)}</span>` : "";
        }).join("")}
      </div>
      <div class="brief-meta">
        <span style="font-family:'JetBrains Mono';font-size:var(--fs-micro);color:var(--text-tertiary);">v${b.version}</span>
        <span class="brief-status ${statusClass[b.status] ?? "brief-draft"}">${esc(statusLabel[b.status] ?? b.status)}</span>
        ${inlineFreshnessBadge(b.staleSince ?? b.createdAt, vertical)}
      </div>
    </div>`).join("\n");

  return `<section id="briefs">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay"></div>
    <div class="section-hero-content">
      <div class="section-tag" style="background:rgba(148,148,172,0.15);color:var(--text-secondary);">&#x1F4C4; ${wl("Briefs", role)}</div>
      <h1>Bo&icirc;te &agrave; outils ex&eacute;cution</h1>
      <p class="section-summary">${briefs.length} brief(s) g&eacute;n&eacute;r&eacute;s avec tra&ccedil;abilit&eacute; et fra&icirc;cheur.</p>
    </div>
  </div>

  <div class="sub-section">
    ${briefCards}
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
// Phase 4: Opportunities Section
// ---------------------------------------------------------------------------

function buildSectionOpportunities(
  opportunities: OpportunityData[],
  currency: string,
  role: string | undefined,
  imageUrl?: string,
): string {
  if (opportunities.length === 0) return "";

  const impactToPeak: Record<string, boolean> = { HIGH: true };
  const impactStars: Record<string, number> = { HIGH: 5, MEDIUM: 4, LOW: 3 };

  const oppCards = opportunities.map((o) => {
    const isPeak = impactToPeak[o.impact] ?? false;
    const stars = impactStars[o.impact] ?? 3;
    const startStr = formatShortDate(o.startDate);
    const endStr = o.endDate ? formatShortDate(o.endDate) : "";
    const dateRange = endStr ? `${startStr}-${endStr}` : startStr;
    const channels = Array.isArray(o.channels) ? (o.channels as string[]).join(", ") : "";

    return `<div class="opp-card ${isPeak ? "opp-peak" : "opp-normal"}">
      <div class="opp-date">${esc(dateRange)}</div>
      <div>
        <div class="opp-name">${esc(o.title)}</div>
        <div class="opp-type">${esc(o.type)}${channels ? ` &middot; ${esc(channels)}` : ""}${o.notes ? ` &middot; ${esc(o.notes)}` : ""}</div>
      </div>
      <div class="opp-affinity">${Array.from({ length: 5 }, (_, i) => `<span class="opp-star${i >= stars ? " dim" : ""}">&#x2605;</span>`).join("")}</div>
    </div>`;
  }).join("\n");

  return `<section id="opportunities">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay"></div>
    <div class="section-hero-content">
      <div class="section-tag" style="background:rgba(255,215,0,0.15);color:var(--accent-3);">&#x2191; ${wl("Opportunites", role)}</div>
      <h1>Fen&ecirc;tres de prise de parole</h1>
      <p class="section-summary">Calendrier pr&eacute;visible + opportunit&eacute;s tactiques. Quand parler, sur quoi, avec quel scoring.</p>
    </div>
  </div>

  <div class="sub-section">
    <h3 class="sub-title">Calendrier pr&eacute;visible</h3>
    <div class="opp-timeline">
      ${oppCards}
    </div>
  </div>

  <div class="sub-section">
    <h3 class="sub-title">Scoring d&#039;opportunit&eacute;</h3>
    <div class="grid-2">
      <div class="card" style="border-left:4px solid var(--score-excellent);"><div class="micro-text" style="color:var(--score-excellent);margin-bottom:8px;">Score &ge; 3.5 &rarr; GO</div><p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.6;">Ex&eacute;cution dans les heures. Le community manager a l&#039;autorit&eacute; de lancer.</p></div>
      <div class="card" style="border-left:4px solid var(--risk-medium);"><div class="micro-text" style="color:var(--risk-medium);margin-bottom:8px;">Score 2.5-3.5 &rarr; PAUSE</div><p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.6;">Analyse rapide 30 min + validation Dir. Marketing.</p></div>
    </div>
    <div class="card" style="margin-top:12px;border-left:4px solid var(--text-tertiary);"><div class="micro-text" style="margin-bottom:8px;">Score &lt; 2.5 &rarr; PASS</div><p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.6;">On note pour le futur, on n&#039;agit pas.</p></div>
    <div class="card" style="margin-top:20px;">
      <table class="mva-table">
        <thead><tr><th>Crit&egrave;re</th><th>Poids</th><th>Question</th></tr></thead>
        <tbody>
          <tr><td style="font-weight:600;">Affinit&eacute;</td><td class="mono">30%</td><td>L&#039;opportunit&eacute; est-elle naturelle pour la marque ?</td></tr>
          <tr><td style="font-weight:600;">Reach</td><td class="mono">20%</td><td>Combien de gens &ccedil;a touche ?</td></tr>
          <tr><td style="font-weight:600;">Fen&ecirc;tre</td><td class="mono">15%</td><td>Combien de temps pour agir ?</td></tr>
          <tr><td style="font-weight:600;">Risque</td><td class="mono">20%</td><td>Peut-on se tromper ?</td></tr>
          <tr><td style="font-weight:600;">Co&ucirc;t</td><td class="mono">15%</td><td>Que faut-il mobiliser ?</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
// Templates Section — Protocole Stratégique, Reco Campagne, Mandat 360
// ---------------------------------------------------------------------------

function buildSectionTemplates(
  documents: TemplateDocumentData[],
  brandName: string,
  imageUrl?: string,
): string {
  if (documents.length === 0) return "";

  const templateIcons: Record<string, string> = {
    protocole_strategique: "\uD83D\uDCCA",
    reco_campagne: "\uD83C\uDFAF",
    mandat_360: "\uD83D\uDCC5",
  };

  const templateColors: Record<string, string> = {
    protocole_strategique: "var(--accent-1)",
    reco_campagne: "var(--accent-2)",
    mandat_360: "var(--accent-3)",
  };

  const templateCards = documents.map((doc, idx) => {
    const config = TEMPLATE_CONFIG[doc.type as TemplateType];
    const icon = templateIcons[doc.type] ?? "\uD83D\uDCC4";
    const color = templateColors[doc.type] ?? "var(--accent-1)";
    const title = config?.title ?? doc.title;
    const subtitle = config?.subtitle ?? "";
    const unit = config?.unit ?? "pages";

    // Parse sections
    const sections = Array.isArray(doc.sections) ? (doc.sections as Array<{
      title?: string;
      content?: string;
      order?: number;
      wordCount?: number;
    }>) : [];

    const totalWords = sections.reduce((acc, s) => acc + (s.wordCount ?? 0), 0);
    const pageEstimate = doc.pageCount ?? Math.max(1, Math.round(totalWords / 250));

    // Build sections with rich formatted content — open by default for full readability
    const sectionsList = sections.map((s, i) => {
      const hasContent = s.content && s.content.trim().length > 0;
      const formattedContent = hasContent ? formatDocContent(s.content!) : "";
      // Sections with content are open by default — click to collapse
      const isOpen = hasContent;

      return `<div class="tpl-section-item${hasContent ? " tpl-section-expandable" : ""}${isOpen ? " open" : ""}" ${hasContent ? `onclick="this.classList.toggle('open')"` : ""}>
        <div style="display:flex;align-items:flex-start;gap:10px;width:100%;">
          <span class="tpl-section-num">${String(i + 1).padStart(2, "0")}</span>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;">
              ${hasContent ? `<span class="tpl-section-toggle">&#x25B6;</span>` : ""}
              <span class="tpl-section-title">${esc(s.title ?? `Section ${i + 1}`)}</span>
              ${s.wordCount ? `<span class="tpl-section-word-count" style="display:inline;margin-left:8px;">${s.wordCount.toLocaleString("fr-FR")} mots</span>` : ""}
            </div>
          </div>
        </div>
        ${hasContent ? `<div class="tpl-section-body"><div class="tpl-section-content">${formattedContent}</div></div>` : ""}
      </div>`;
    }).join("\n");

    return `<div class="tpl-card" style="border-top:3px solid ${color};">
      <div class="tpl-card-header">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <span style="font-size:1.5rem;">${icon}</span>
          <div>
            <h3>${esc(title)}</h3>
            ${subtitle ? `<div class="tpl-subtitle">${esc(subtitle)}</div>` : ""}
          </div>
        </div>
        <div class="tpl-card-meta">
          <span class="tpl-badge">${esc(doc.status === "complete" ? "Pr\u00eat" : doc.status)}</span>
          <span class="tpl-pages">~${pageEstimate} ${esc(unit)}</span>
          ${totalWords > 0 ? `<span class="tpl-pages">\u00B7 ${totalWords.toLocaleString("fr-FR")} mots</span>` : ""}
        </div>
      </div>
      ${sections.length > 0 ? `<div class="tpl-sections">
        <div class="tpl-sections-title">Sections (${sections.length})</div>
        ${sectionsList}
      </div>` : ""}
    </div>`;
  }).join("\n");

  return `<section id="templates">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay" style="background:linear-gradient(135deg, rgba(196,90,60,0.12), rgba(6,6,11,0.95));"></div>
    <div class="section-hero-content">
      <div class="section-tag" style="background:rgba(196,90,60,0.15);color:var(--accent-1);">&#x1F4CB; Templates Strat\u00e9giques</div>
      <h1>Livrables pour ${esc(brandName)}</h1>
      <p class="section-summary">${documents.length} template(s) g\u00e9n\u00e9r\u00e9(s) — Documents op\u00e9rationnels pr\u00eats \u00e0 l\u2019emploi.</p>
    </div>
  </div>

  <div class="sub-section">
    <h3 class="sub-title">Documents strat\u00e9giques</h3>
    <div style="display:flex;flex-direction:column;gap:20px;">
      ${templateCards}
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
// Phase 4: Budget Simulator Section
// ---------------------------------------------------------------------------

const DEFAULT_BUDGET_TIERS = [
  {
    tier: "MICRO", range: "< 2M FCFA",
    desc: "Organique pur : 15 posts/mois + community management WhatsApp + 1\u20132 micro-influenceurs + 1 challenge UGC avec lots produits. On existe.",
    kpis: ["+500 membres", "200 UGC", "50K reach organique", "1 mois"],
  },
  {
    tier: "STARTER", range: "2\u20135M FCFA",
    desc: "+ Paid social (Meta + TikTok Ads) + 3\u20135 vid\u00e9os qualit\u00e9 + 1 influenceur mid-tier. On acc\u00e9l\u00e8re.",
    kpis: ["200K reach", "+2K membres", "500 UGC", "50 conversions", "4\u20136 sem."],
  },
  {
    tier: "IMPACT", range: "5\u201315M FCFA",
    desc: "+ Vid\u00e9o hero (spot 30\u201360s) + paid scaling + 1\u20132 events terrain + radio r\u00e9gionale + PLV 200 supports. On frappe.",
    kpis: ["1M reach", "+5K membres", "+8% ventes", "200 leads B2B", "6\u20138 sem."],
  },
  {
    tier: "CAMPAGNE", range: "15\u201335M FCFA",
    desc: "+ TV nationale 3 semaines + influenceurs top-tier + event flagship + RP + \u00e9tudes d\u2019impact pr\u00e9/post. On domine le moment.",
    kpis: ["5M reach", "+15K membres", "+12% ventes", "+5pts notori\u00e9t\u00e9", "2\u20133 mois"],
  },
  {
    tier: "DOMINATION", range: "35\u201370M FCFA",
    desc: "Always-on 12 mois + 2\u20133 campagnes peak + paid annual + \u00e9tudes continues + \u00e9v\u00e9nementiel (4\u20136/an) + innovation produit. On est le march\u00e9.",
    kpis: ["Objectifs annuels complets", "12 mois"],
  },
];

function buildSectionBudgetSim(
  budgetTiers: BudgetTierData[] | undefined,
  currency: string,
  imageUrl?: string,
  ctx?: OracleResolved,
): string {
  // Helper to extract channels array from unknown
  const extractChannels = (ch: unknown): string[] => {
    if (Array.isArray(ch)) return ch.map((c) => typeof c === "string" ? c : (c as { canal?: string; channel?: string; name?: string })?.canal ?? (c as { channel?: string })?.channel ?? (c as { name?: string })?.name ?? "").filter(Boolean);
    return [];
  };

  // Helper to extract KPIs from unknown
  const extractKpis = (kpis: unknown): string[] => {
    if (Array.isArray(kpis)) return kpis.map((k) => {
      if (typeof k === "string") return k;
      const obj = k as { kpi?: string; target?: string; name?: string; value?: string };
      if (obj.kpi && obj.target) return `${obj.kpi}: ${obj.target}`;
      if (obj.name && obj.value) return `${obj.name}: ${obj.value}`;
      if (obj.kpi) return obj.kpi;
      if (obj.name) return obj.name;
      return "";
    }).filter(Boolean);
    return [];
  };

  // Format budget amount (handle millions)
  const fmtBudget = (min: number, max: number): string => {
    if (min >= 1_000_000 || max >= 1_000_000) {
      const fmtM = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M` : n.toLocaleString("fr-FR");
      return `${fmtM(min)}\u2013${fmtM(max)} ${currency}`;
    }
    return `${min.toLocaleString("fr-FR")}\u2013${max.toLocaleString("fr-FR")} ${currency}`;
  };

  // Match DB tiers to enriched defaults by normalized name
  const defaultByName = new Map(DEFAULT_BUDGET_TIERS.map((d) => [d.tier.toUpperCase().trim(), d]));

  // Use DB budget tiers if available, enriched with default data when DB is sparse
  const hasDbTiers = budgetTiers && budgetTiers.length > 0;
  const tierCards = hasDbTiers
    ? budgetTiers!.map((bt, idx) => {
        const channels = extractChannels(bt.channels);
        const kpis = extractKpis(bt.kpis);
        const tierColors = ["var(--accent-1)", "var(--accent-2)", "var(--accent-3)", "#6366f1", "#f59e0b"];
        const color = tierColors[idx % tierColors.length];

        // Enrich sparse DB data with defaults if available
        const fallback = defaultByName.get(bt.tier.toUpperCase().trim());
        const descText = bt.description && bt.description.trim().length > 20
          ? bt.description
          : fallback?.desc ?? bt.description ?? "";
        const displayKpis = kpis.length > 0 ? kpis : (fallback?.kpis ?? []);

        return `
    <div class="budget-palier" style="border-left:3px solid ${color};">
      <div class="bp-header"><span class="bp-name">${esc(bt.tier)}</span><span class="bp-range">${esc(fmtBudget(bt.minBudget, bt.maxBudget))}</span></div>
      ${descText ? `<div class="bp-desc">${esc(descText)}</div>` : ""}
      ${channels.length > 0 ? `<div class="channels-row">${channels.map((ch) => `<span class="ch-tag">${esc(ch)}</span>`).join("")}</div>` : ""}
      ${displayKpis.length > 0 ? `<div class="bp-kpis" style="margin-top:10px;">${displayKpis.map((k) => `<span class="bp-kpi">${esc(k)}</span>`).join("")}</div>` : ""}
    </div>`;
      }).join("\n")
    : DEFAULT_BUDGET_TIERS.map((t) => `
    <div class="budget-palier">
      <div class="bp-header"><span class="bp-name">${esc(t.tier)}</span><span class="bp-range">${esc(t.range)}</span></div>
      <div class="bp-desc">${esc(t.desc)}</div>
      <div class="bp-kpis">${t.kpis.map((k) => `<span class="bp-kpi">${esc(k)}</span>`).join("")}</div>
    </div>`).join("\n");

  // Budget par poste — from resolved context (already filtered in resolveOracleData)
  const parPoste = ctx?.budgetParPosteFiltered ?? [];
  const budgetAllocHtml = parPoste.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">R\u00e9partition budg\u00e9taire d\u00e9taill\u00e9e</h3>
    <table class="mva-table">
      <thead><tr><th>Poste</th><th>Montant</th><th>%</th><th>Justification</th></tr></thead>
      <tbody>
        ${parPoste.map((p) => `<tr>
          <td style="font-weight:600;">${esc(p.poste)}</td>
          <td class="mono" style="color:var(--accent-1);">${esc(p.montant)}</td>
          <td class="mono">${p.pourcentage > 0 ? `${p.pourcentage}%` : "\u2014"}</td>
          <td style="color:var(--text-secondary);font-size:var(--fs-small);">${esc(p.justification)}</td>
        </tr>`).join("\n")}
      </tbody>
    </table>
  </div>`
    : "";

  // MVA table — always show as a useful reference
  const mvaHtml = `<div class="sub-section">
    <h3 class="sub-title">Minimum Viable Action par objectif</h3>
    <table class="mva-table">
      <thead><tr><th>Objectif</th><th>MVA (action minimale)</th><th>Budget min.</th><th>D\u00e9lai</th></tr></thead>
      <tbody>
        <tr><td style="font-weight:600;">Awareness</td><td>1 vid\u00e9o TikTok boost\u00e9e + 5 posts organiques</td><td class="mono" style="color:var(--accent-1);">500K ${esc(currency)}</td><td class="mono">2 sem.</td></tr>
        <tr><td style="font-weight:600;">Engagement</td><td>1 challenge communautaire WhatsApp + 1 jeu-concours</td><td class="mono" style="color:var(--accent-1);">200K ${esc(currency)}</td><td class="mono">1 sem.</td></tr>
        <tr><td style="font-weight:600;">Conversion</td><td>1 promo flash in-store + relais social + code promo</td><td class="mono" style="color:var(--accent-1);">800K ${esc(currency)}</td><td class="mono">1 sem.</td></tr>
        <tr><td style="font-weight:600;">R\u00e9tention</td><td>1 newsletter recettes + 1 avantage fid\u00e9lit\u00e9</td><td class="mono" style="color:var(--accent-1);">150K ${esc(currency)}</td><td class="mono">1 sem.</td></tr>
        <tr><td style="font-weight:600;">Lancement</td><td>Teaser social + 1 event d\u00e9gustation local</td><td class="mono" style="color:var(--accent-1);">2M ${esc(currency)}</td><td class="mono">3 sem.</td></tr>
        <tr><td style="font-weight:600;">Crise</td><td>Statement officiel + Q&amp;A communaut\u00e9</td><td class="mono" style="color:var(--score-excellent);">0 (temps)</td><td class="mono">4h</td></tr>
      </tbody>
    </table>
  </div>`;

  // ── Enveloppe globale headline ──
  const enveloppe = ctx?.enveloppeGlobale ?? "";
  const enveloppeHtml = enveloppe
    ? `<div class="sub-section">
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
      <div class="card" style="flex:1;min-width:200px;text-align:center;padding:28px 24px;">
        <div class="micro-text" style="margin-bottom:8px;">Enveloppe globale recommand\u00e9e</div>
        <div class="mono" style="font-size:2rem;font-weight:800;color:var(--accent-1);">${esc(enveloppe)} <span style="font-size:0.9rem;color:var(--text-secondary);">${esc(currency)}</span></div>
      </div>
      ${ctx?.ltvCac && ctx.ltvCac !== "\u2014" ? `<div class="card" style="flex:0 0 auto;text-align:center;padding:28px 24px;">
        <div class="micro-text" style="margin-bottom:8px;">Ratio LTV / CAC</div>
        <div class="mono" style="font-size:1.5rem;font-weight:800;color:var(--score-excellent);">${esc(ctx.ltvCac)}</div>
      </div>` : ""}
    </div>
  </div>`
    : "";

  // ── Budget par phase (from ctx.budgetAllocation) ──
  const phases = ctx?.budgetAllocation?.parPhase?.filter((p) => p.phase || p.montant) ?? [];
  const phasesHtml = phases.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">\u00C9chelonnement budg\u00e9taire par phase</h3>
    <div class="phase-timeline">
      ${phases.map((p, i) => {
        const phaseColors = ["var(--accent-1)", "var(--accent-2)", "var(--accent-3)", "#6366f1"];
        return `<div class="phase-row" style="border-left:3px solid ${phaseColors[i % phaseColors.length]};">
        <div class="ph-name">${esc(p.phase)}</div>
        <div class="ph-focus">${esc(p.focus)}</div>
        <div class="ph-montant">${esc(p.montant)}</div>
      </div>`;
      }).join("\n")}
    </div>
  </div>`
    : "";

  // ── ROI Projections (from ctx.budgetAllocation) ──
  const roi = ctx?.budgetAllocation?.roiProjections;
  const roiEntries = [
    { period: "6 mois", val: roi?.mois6 ?? "" },
    { period: "12 mois", val: roi?.mois12 ?? "" },
    { period: "24 mois", val: roi?.mois24 ?? "" },
  ].filter((entry) => entry.val.trim().length > 0);
  const roiHtml = roiEntries.length > 0
    ? `<div class="sub-section">
    <h3 class="sub-title">Projections ROI</h3>
    <div class="roi-grid">
      ${roiEntries.map((entry) => `<div class="roi-card">
        <div class="roi-period">${esc(entry.period)}</div>
        <div class="roi-val">${esc(entry.val)}</div>
      </div>`).join("\n")}
    </div>
    ${roi?.hypotheses ? `<div class="card" style="margin-top:16px;padding:16px 20px;"><div class="micro-text" style="margin-bottom:6px;">Hypoth\u00e8ses</div><p style="font-size:var(--fs-small);color:var(--text-secondary);line-height:1.6;">${esc(roi.hypotheses)}</p></div>` : ""}
  </div>`
    : "";

  // Count how many enriched sub-sections we have
  const hasEnrichedContent = enveloppe || parPoste.length > 0 || phases.length > 0 || roiEntries.length > 0;
  const summaryLine = hasEnrichedContent
    ? `Enveloppe, r\u00e9partition, paliers d\u2019action, projections ROI \u2014 tout en un.`
    : `Budget \u2192 actions possibles \u2192 KPIs attendus. Du Minimum Viable Action \u00e0 la strat\u00e9gie annuelle.`;

  return `<section id="budget-sim">
  <div class="section-hero" style="background:var(--bg-surface);">
    ${heroImgTag(imageUrl)}
    <div class="section-hero-overlay"></div>
    <div class="section-hero-content">
      <div class="section-tag" style="background:rgba(46,213,115,0.15);color:var(--score-excellent);">&#x00A4; Simulateur Budg\u00e9taire</div>
      <h1>Que faire avec X ?</h1>
      <p class="section-summary">${summaryLine}</p>
    </div>
  </div>

  ${enveloppeHtml}

  <div class="sub-section">
    <h3 class="sub-title">Paliers budget \u2192 capacit\u00e9 d\u2019action</h3>
    ${tierCards}
  </div>

  ${budgetAllocHtml}
  ${phasesHtml}
  ${roiHtml}
  ${mvaHtml}
</section>`;
}

// ---------------------------------------------------------------------------
// Phase 4: Brand Tree
// ---------------------------------------------------------------------------

function buildBrandTree(
  parentBrand: { id: string; brandName: string } | null | undefined,
  currentBrand: string,
  childBrands: { id: string; brandName: string }[] | undefined,
): string {
  if (!parentBrand && (!childBrands || childBrands.length === 0)) return "";

  return `<div class="brand-tree">
    <div class="brand-tree-label">Arbre de marques</div>
    <div class="bt-nodes">
      ${parentBrand ? `<div class="bt-node bt-parent">&#x2190; ${esc(parentBrand.brandName)}</div>` : ""}
      <div class="bt-node bt-current">&#x25C9; ${esc(currentBrand)}</div>
      ${(childBrands ?? []).map((c) => `<div class="bt-node bt-child">&#x2514; ${esc(c.brandName)}</div>`).join("\n")}
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// SIS Signals Section
// ---------------------------------------------------------------------------

function buildSectionSignals(signals: SignalData[]): string {
  const layerConfig: Record<string, { label: string; color: string; bg: string }> = {
    METRIC: { label: "Métrique", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
    STRONG: { label: "Fort", color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
    WEAK: { label: "Faible", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  };

  const grouped: Record<string, SignalData[]> = {};
  for (const s of signals) {
    const layer = s.layer ?? "WEAK";
    (grouped[layer] ??= []).push(s);
  }

  const layerBlocks = Object.entries(grouped)
    .sort(([a], [b]) => {
      const order = ["METRIC", "STRONG", "WEAK"];
      return order.indexOf(a) - order.indexOf(b);
    })
    .map(([layer, items]) => {
      const cfg = layerConfig[layer] ?? layerConfig.WEAK!;
      const rows = items.map((s) => `
        <tr>
          <td style="font-weight:600;">${esc(s.title)}</td>
          <td><span style="background:${cfg.bg};color:${cfg.color};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">${esc(s.status)}</span></td>
          <td style="color:var(--text-secondary);">${esc(s.pillar ?? "Global")}</td>
          <td style="color:var(--text-tertiary);font-size:12px;">${esc(s.source ?? "Veille")}</td>
        </tr>`).join("\n");

      return `
      <div class="sub-section">
        <h3 class="sub-title" style="color:${cfg.color};">&#x25CF; ${cfg.label} (${items.length})</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="border-bottom:1px solid var(--border-subtle);">
            <th style="text-align:left;padding:8px;font-size:12px;color:var(--text-tertiary);">Signal</th>
            <th style="text-align:left;padding:8px;font-size:12px;color:var(--text-tertiary);">Statut</th>
            <th style="text-align:left;padding:8px;font-size:12px;color:var(--text-tertiary);">Pilier</th>
            <th style="text-align:left;padding:8px;font-size:12px;color:var(--text-tertiary);">Source</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    })
    .join("\n");

  return `<section id="signals">
  <div class="section-hero" style="background:var(--bg-surface);">
    <div class="section-hero-content">
      <div class="section-tag" style="background:rgba(59,130,246,0.15);color:#3B82F6;">&#x1F4E1; SIS</div>
      <h1>Signal Intelligence System</h1>
      <p class="section-summary">${signals.length} signaux actifs — Veille strat&eacute;gique en 3 couches</p>
    </div>
  </div>
  ${layerBlocks}
</section>`;
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function buildFooter(meta: StrategyMeta, locale: string): string {
  return `<div style="text-align:center;padding:60px 0 40px;border-top:1px solid var(--border-subtle);margin-top:60px;">
  <div style="font-family:'Outfit';font-weight:900;font-size:1.2rem;letter-spacing:0.08em;color:var(--text-tertiary);margin-bottom:8px;">
    A D V E R T I S
  </div>
  <div style="font-size:var(--fs-micro);color:var(--text-tertiary);letter-spacing:0.1em;text-transform:uppercase;">
    ${esc(meta.brandName)} — L'ORACLE · ${esc(formatDate(meta.createdAt, locale))}
  </div>
  <div style="font-size:var(--fs-micro);color:var(--text-tertiary);margin-top:4px;">
    Document confidentiel · Propriété intellectuelle UPGRADERS SARL
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// Scripts
// ---------------------------------------------------------------------------

function buildScripts(
  sections: { id: string; letter: string; label: string }[],
): string {
  const sectionIds = JSON.stringify(sections.map((s) => s.id));

  return `
// Radar Chart — full 8-pillar ADVERTIS radar
(function() {
  var ctx = document.getElementById('radarChart');
  if (!ctx || typeof Chart === 'undefined') return;
  var rawScores = ctx.getAttribute('data-scores');
  var scores = rawScores ? rawScores.split(',').map(Number) : [0, 0, 0, 0, 0, 0, 0, 0];
  var accent1 = getComputedStyle(document.documentElement).getPropertyValue('--accent-1').trim() || '#c45a3c';
  var accent2 = getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#2d5a3d';
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['A — Authenticit\u00e9', 'D — Distinction', 'V — Valeur', 'E — Engagement', 'R — Risk', 'T — Track', 'I — Impl\u00e9mentation', 'S — Synth\u00e8se'],
      datasets: [{
        label: 'Score ADVERTIS',
        data: scores,
        fill: true,
        backgroundColor: accent1 + '1A',
        borderColor: accent1,
        borderWidth: 2,
        pointBackgroundColor: accent1,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 25, color: '#6A6A80', backdropColor: 'transparent', font: { family: 'JetBrains Mono', size: 9 } },
          grid: { color: 'rgba(42,42,58,0.6)' },
          angleLines: { color: 'rgba(42,42,58,0.4)' },
          pointLabels: { color: '#9494AC', font: { family: 'Outfit', size: 11, weight: '600' } }
        }
      }
    }
  });
})();

// Scroll Spy
(function() {
  var sections = document.querySelectorAll('section[id]');
  var sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  var mobileLinks = document.querySelectorAll('.mobile-nav a');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        sidebarLinks.forEach(function(link) { link.classList.toggle('active', link.getAttribute('href') === '#' + id); });
        mobileLinks.forEach(function(link) { link.classList.toggle('active', link.getAttribute('href') === '#' + id); });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
  sections.forEach(function(s) { observer.observe(s); });
})();

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var target = document.querySelector(link.getAttribute('href'));
    if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('sidebar').classList.remove('open'); }
  });
});

// Scroll animations
(function() {
  var els = document.querySelectorAll('.card, .pillar-card, .persona-card, .swot-cell, .invest-card, .kpi-card, .ladder-step, .gamif-level, .hierarchy-level');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, index) {
      if (entry.isIntersecting) {
        var delay = (index % 6) * 60;
        entry.target.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1) ' + delay + 'ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ' + delay + 'ms';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function(el) { el.style.opacity = '0'; el.style.transform = 'translateY(24px)'; observer.observe(el); });
})();

// Mobile hamburger
(function() {
  var hamburger = document.createElement('button');
  hamburger.innerHTML = '\\u2630';
  hamburger.style.cssText = 'position:fixed;top:16px;left:16px;z-index:300;width:44px;height:44px;border-radius:10px;background:var(--bg-surface);border:1px solid var(--border-subtle);color:var(--text-primary);font-size:1.3rem;cursor:pointer;display:none;align-items:center;justify-content:center;';
  document.body.appendChild(hamburger);
  var sidebar = document.getElementById('sidebar');
  var mq = window.matchMedia('(max-width: 900px)');
  function check(e) { hamburger.style.display = e.matches ? 'flex' : 'none'; }
  mq.addEventListener('change', check);
  check(mq);
  hamburger.addEventListener('click', function() { sidebar.classList.toggle('open'); });
  document.addEventListener('click', function(e) {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== hamburger) sidebar.classList.remove('open');
  });
})();

// Keyboard nav
(function() {
  var ids = ${sectionIds};
  document.addEventListener('keydown', function(e) {
    var dir = 0;
    if (e.key === 'ArrowDown' || e.key === 'j') dir = 1;
    if (e.key === 'ArrowUp' || e.key === 'k') dir = -1;
    if (dir !== 0 && !e.target.matches('input, textarea')) {
      e.preventDefault();
      var current = ids.findIndex(function(id) { var el = document.getElementById(id); if (!el) return false; var r = el.getBoundingClientRect(); return r.top <= 100 && r.bottom > 100; });
      var next = Math.max(0, Math.min(ids.length - 1, current + dir));
      var target = document.getElementById(ids[next]);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();
`;
}
