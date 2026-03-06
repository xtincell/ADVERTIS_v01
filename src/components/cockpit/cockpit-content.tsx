// =============================================================================
// COMPONENT C.K0 — Cockpit Content
// =============================================================================
// Main cockpit layout orchestrating all pillar sections and view modes.
// Props: CockpitData (pillars, scores, documents), isPublic, initialViewMode.
// Key features: executive overview with 3 key scores (coherence, risk, BMF),
// view-mode filtering (Complet, Strategie, Operationnel, etc.), Zod-validated
// pillar parsing, section-level conditional rendering, reports & templates.
// =============================================================================

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  FileText,
  Loader2,
  MessageSquareText,
  Monitor,
  Presentation,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  PILLAR_CONFIG,
  REPORT_TYPES,
  TEMPLATE_TYPES,
  TEMPLATE_CONFIG,
  VIEW_MODES,
  VIEW_MODE_LABELS,
  VIEW_MODE_SECTIONS,
} from "~/lib/constants";
import type { SupportedCurrency } from "~/lib/constants";
import { VerticalProvider } from "~/components/hooks/use-label";
import type { ViewMode } from "~/lib/constants";
import type { ImplementationData } from "~/lib/types/implementation-data";
import type {
  AuthenticitePillarData,
  DistinctionPillarData,
  ValeurPillarDataV2,
  EngagementPillarData,
  SynthesePillarData,
} from "~/lib/types/pillar-data";
import type { RiskAuditResult, TrackAuditResult } from "~/lib/types/pillar-schemas";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import {
  Card,
  CardContent,
} from "~/components/ui/card";

import {
  CockpitSection,
  ScoreCircle,
  ScoreCircleWithEvolution,
  getScoreColor,
  getScoreLabel,
  getRiskLevel,
  type CoherenceBreakdownData,
  type RiskBreakdownData,
  type BmfBreakdownData,
} from "./cockpit-shared";

// Section components
import { SectionAuthenticite } from "./sections/section-authenticite";
import { SectionDistinction } from "./sections/section-distinction";
import { SectionValeur } from "./sections/section-valeur";
import { SectionEngagement } from "./sections/section-engagement";
import { SectionRisk } from "./sections/section-risk";
import { SectionTrack } from "./sections/section-track";
import { SectionImplementation } from "./sections/section-implementation";
import { SectionSynthese } from "./sections/section-synthese";
import { SectionVeille } from "./sections/section-veille";
import { SectionSignals } from "./sections/section-signals";
import { SectionDecisions } from "./sections/section-decisions";
import { SectionCompetitors } from "./sections/section-competitors";
import { SectionOpportunities } from "./sections/section-opportunities";
import { SectionBudget } from "./sections/section-budget";
import { SectionWidgets } from "./sections/section-widgets";
import { SectionGlory } from "./sections/section-glory";
import { SectionBriefs } from "./sections/section-briefs";
import { SectionQualityChecklist } from "./sections/section-quality-checklist";
import { SectionPartners } from "./sections/section-partners";
import { SectionBigIdeaKit } from "./sections/section-big-idea-kit";
import { SectionCreativeStrategy } from "./sections/section-creative-strategy";
import { SectionBudgetOperationnel } from "./sections/section-budget-operationnel";
import { SectionChrono } from "./sections/section-chrono";
import { SectionMultiMarkets } from "./sections/section-multi-markets";
import { SectionFunnelMapping } from "./sections/section-funnel-mapping";
import { SectionBrandOSSetup } from "./sections/section-brand-os-setup";
import { SectionMetrics } from "./sections/section-metrics";
import { SectionOracleScores } from "./sections/section-oracle-scores";
import { SectionFicheClient } from "./sections/section-fiche-client";
import { SectionAARRRRoadmap } from "./sections/section-aarrr-roadmap";
import { SectionActionSimulator } from "./sections/section-action-simulator";
import { AuditSuggestionsPanel } from "~/components/strategy/audit-review/audit-suggestions-panel";
import { StrategyFeedbackModule } from "~/components/feedback/strategy-feedback-module";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PillarData {
  id?: string;
  type: string;
  title: string;
  status: string;
  summary: string | null;
  content: unknown;
  version?: number;
  updatedAt?: Date | string | null;
}

interface DocumentData {
  id: string;
  type: string;
  title: string;
  status: string;
  pageCount: number | null;
  sections?: unknown;
}

export interface ScoreSnapshot {
  coherenceScore: number;
  riskScore: number | null;
  bmfScore: number | null;
}

export interface CockpitData {
  strategyId?: string;
  brandName: string;
  tagline?: string | null;
  name: string;
  sector: string | null;
  vertical?: string | null;
  currency?: string | null;
  description: string | null;
  phase: string;
  coherenceScore: number | null;
  pillars: PillarData[];
  documents: DocumentData[];
  previousScores?: ScoreSnapshot | null;
  coherenceBreakdown?: CoherenceBreakdownData | null;
  riskBreakdown?: RiskBreakdownData | null;
  bmfBreakdown?: BmfBreakdownData | null;
  /** Extra fields for Fiche Client card */
  maturityProfile?: string | null;
  deliveryMode?: string | null;
  annualBudget?: number | null;
  targetRevenue?: number | null;
  createdAt?: Date | string | null;
}

// ---------------------------------------------------------------------------
// Main Cockpit Content — Orchestrator
// ---------------------------------------------------------------------------

export function CockpitContent({
  data,
  isPublic = false,
  isClientView = false,
  initialViewMode,
  onRefresh,
  tabSections,
}: {
  data: CockpitData;
  isPublic?: boolean;
  /** Set to true when rendering inside the client shell (determines Oracle link path) */
  isClientView?: boolean;
  initialViewMode?: ViewMode | null;
  onRefresh?: () => void;
  /** Optional: sections allowed by the active cockpit tab (from TAB_SECTION_MAP) */
  tabSections?: string[] | null;
}) {
  const [activeViewMode, setActiveViewMode] = useState<ViewMode | null>(
    initialViewMode ?? null,
  );

  // Section visibility helper — combines viewMode filtering + tab filtering
  const viewModeSections = activeViewMode
    ? new Set(VIEW_MODE_SECTIONS[activeViewMode])
    : null;
  const tabSectionSet = tabSections ? new Set(tabSections) : null;
  const show = (key: string) => {
    if (viewModeSections && !viewModeSections.has(key)) return false;
    if (tabSectionSet && !tabSectionSet.has(key)) return false;
    return true;
  };

  const getPillar = (type: string) =>
    data.pillars.find((p) => p.type === type);

  // ---------------------------------------------------------------------------
  // Parse all pillar data with Zod validation (safe — returns defaults on failure)
  // ---------------------------------------------------------------------------
  const { data: aContent } = parsePillarContent<AuthenticitePillarData>("A", getPillar("A")?.content);
  const { data: dContent } = parsePillarContent<DistinctionPillarData>("D", getPillar("D")?.content);
  const { data: vContent } = parsePillarContent<ValeurPillarDataV2>("V", getPillar("V")?.content);
  const { data: eContent } = parsePillarContent<EngagementPillarData>("E", getPillar("E")?.content);
  const { data: rContent } = parsePillarContent<RiskAuditResult>("R", getPillar("R")?.content);
  const { data: tContent } = parsePillarContent<TrackAuditResult>("T", getPillar("T")?.content);
  const { data: implContent } = parsePillarContent<ImplementationData>("I", getPillar("I")?.content);
  const { data: sContent } = parsePillarContent<SynthesePillarData>("S", getPillar("S")?.content);

  // Coherence score from I or S or strategy-level
  const coherenceScore = implContent?.coherenceScore ?? sContent?.scoreCoherence ?? data.coherenceScore;
  const riskScore = rContent?.riskScore ?? 0;
  const bmfScore = tContent?.brandMarketFitScore ?? 0;

  return (
    <VerticalProvider vertical={data.vertical ?? null}>
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════════════
          NIVEAU 1 — Executive Overview (10 secondes)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <Crown className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Cockpit Stratégique
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {data.brandName}
          </h1>
          {(data.tagline || implContent?.brandPlatform?.tagline) && (
            <p className="mt-1 text-lg font-medium italic text-primary/70">
              &ldquo;{data.tagline || implContent?.brandPlatform?.tagline}&rdquo;
            </p>
          )}
          {data.name !== data.brandName && (
            <p className="text-lg text-muted-foreground">{data.name}</p>
          )}
          {data.sector && (
            <p className="mt-1 text-sm text-muted-foreground">
              Secteur : {data.sector}
            </p>
          )}
          {data.description && (
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {data.description}
            </p>
          )}

          {/* ViewMode selector — hidden when tab-based filtering is active (operator cockpit) */}
          {!isPublic && !tabSections && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5">
                <button
                  onClick={() => setActiveViewMode(null)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    !activeViewMode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Complet
                </button>
                {VIEW_MODES.map((vm) => (
                  <button
                    key={vm}
                    onClick={() => setActiveViewMode(vm)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      activeViewMode === vm
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {VIEW_MODE_LABELS[vm]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 3 Key Scores with Evolution ── */}
        {(coherenceScore != null || riskScore > 0 || bmfScore > 0) && (
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-start justify-center gap-8">
              {coherenceScore != null && coherenceScore > 0 && (
                <ScoreCircleWithEvolution
                  score={coherenceScore}
                  previousScore={data.previousScores?.coherenceScore}
                  label="Cohérence"
                  sublabel={getScoreLabel(coherenceScore)}
                  size="lg"
                  breakdownType="coherence"
                  breakdown={data.coherenceBreakdown}
                />
              )}
              {riskScore > 0 && (
                <ScoreCircleWithEvolution
                  score={riskScore}
                  previousScore={data.previousScores?.riskScore}
                  label="Risque"
                  sublabel={getRiskLevel(riskScore).label}
                  size="lg"
                  invertForRisk
                  breakdownType="risk"
                  breakdown={data.riskBreakdown}
                />
              )}
              {bmfScore > 0 && (
                <ScoreCircleWithEvolution
                  score={bmfScore}
                  previousScore={data.previousScores?.bmfScore}
                  label="Brand-Market Fit"
                  sublabel={getScoreLabel(bmfScore)}
                  size="lg"
                  breakdownType="bmf"
                  breakdown={data.bmfBreakdown}
                />
              )}
            </div>
          </div>
        )}

        {/* ── Executive Summary ── */}
        {(implContent?.executiveSummary || sContent?.syntheseExecutive) && (
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border bg-muted/30 px-6 py-4">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Résumé exécutif
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80">
              {implContent?.executiveSummary || sContent?.syntheseExecutive}
            </p>
          </div>
        )}
      </section>

      {/* ── Fiche Client — Company profile card ── */}
      {show("fiche-client") && (
        <SectionFicheClient
          brandName={data.brandName}
          projectName={data.name}
          sector={data.sector}
          description={data.description}
          phase={data.phase}
          vertical={data.vertical}
          maturityProfile={data.maturityProfile}
          deliveryMode={data.deliveryMode}
          currency={data.currency}
          annualBudget={data.annualBudget}
          targetRevenue={data.targetRevenue}
          coherenceScore={coherenceScore}
          createdAt={data.createdAt}
        />
      )}

      {/* ── Oracle Sub-Scores — Granular per-pillar breakdown ── */}
      {show("oracle-scores") && (
        <SectionOracleScores
          aContent={aContent}
          dContent={dContent}
          vContent={vContent}
          eContent={eContent}
          coherenceScore={coherenceScore ?? null}
          riskScore={riskScore}
          bmfScore={bmfScore}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          NIVEAU 2+3 — Sections détaillées
          ═══════════════════════════════════════════════════════════════════ */}

      {/* ── Pillar A — Authenticité ── */}
      {show("authenticite") && (
        <SectionAuthenticite
          aContent={aContent}
          implContent={implContent}
          pillar={getPillar("A")}
          vertical={data.vertical}
        />
      )}

      {/* ── Pillar D — Distinction ── */}
      {show("distinction") && (
        <SectionDistinction
          dContent={dContent}
          implContent={implContent}
          pillar={getPillar("D")}
          vertical={data.vertical}
        />
      )}

      {/* ── Pillar V — Valeur ── */}
      {show("valeur") && (
        <SectionValeur
          vContent={vContent}
          implContent={implContent}
          pillar={getPillar("V")}
          vertical={data.vertical}
          currency={(data.currency ?? "XOF") as SupportedCurrency}
        />
      )}

      {/* ── Pillar E — Engagement ── */}
      {show("engagement") && (
        <SectionEngagement
          eContent={eContent}
          implContent={implContent}
          pillar={getPillar("E")}
          vertical={data.vertical}
        />
      )}

      {/* ── AARRR Roadmap — 5 levers × 4 quarters grid ── */}
      {show("aarrr-roadmap") && (
        <SectionAARRRRoadmap
          eContent={eContent}
          implContent={implContent}
        />
      )}

      {/* ── Pillar R — Risk Audit ── */}
      {show("risk") && (
        <SectionRisk
          rContent={rContent}
          implContent={implContent}
          pillar={getPillar("R")}
          vertical={data.vertical}
        />
      )}

      {/* ── Veille & Opportunites (surfaces T insights prominently) ── */}
      {show("veille") && (
        <SectionVeille tContent={tContent} implContent={implContent} />
      )}

      {/* ── Signal Intelligence System (SIS) — Only for authenticated strategy views ── */}
      {show("signals") && data.strategyId && !isPublic && (
        <SectionSignals strategyId={data.strategyId} />
      )}

      {/* ── Decision Queue ── */}
      {show("decisions") && data.strategyId && !isPublic && (
        <SectionDecisions strategyId={data.strategyId} />
      )}

      {/* ── Pillar T — Track / Market Validation ── */}
      {show("track") && (
        <SectionTrack
          tContent={tContent}
          implContent={implContent}
          pillar={getPillar("T")}
          vertical={data.vertical}
        />
      )}

      {/* ── Competitive Landscape ── */}
      {show("competitors") && data.strategyId && !isPublic && (
        <SectionCompetitors strategyId={data.strategyId} />
      )}

      {/* ── Metric Thresholds & KPIs ── */}
      {show("metrics") && data.strategyId && !isPublic && (
        <SectionMetrics strategyId={data.strategyId} />
      )}

      {/* ── Opportunity Calendar ── */}
      {show("opportunities") && data.strategyId && !isPublic && (
        <SectionOpportunities strategyId={data.strategyId} />
      )}

      {/* ── Budget Tiers ── */}
      {show("budget-sim") && data.strategyId && !isPublic && (
        <SectionBudget strategyId={data.strategyId} />
      )}

      {/* ── Brief Toolbox ── */}
      {show("briefs") && data.strategyId && !isPublic && (
        <SectionBriefs strategyId={data.strategyId} />
      )}

      {/* ── Audit R+T Suggestions — Refresh fields from evolving R+T insights ── */}
      {!isPublic && show("audit-suggestions") && data.strategyId &&
        getPillar("R")?.status === "complete" &&
        getPillar("T")?.status === "complete" && (
        <CockpitSection
          icon={<Sparkles className="h-5 w-5" />}
          pillarLetter="R"
          title="Améliorations R+T"
          subtitle="Actualiser les piliers à partir de l'audit Risk & Track"
          color="#EC4899"
        >
          <AuditSuggestionsPanel
            strategyId={data.strategyId}
            pillars={data.pillars
              .filter((p) => p.id != null)
              .map((p) => ({
                id: p.id!,
                type: p.type,
                content: p.content,
              }))}
            onSuggestionsApplied={onRefresh}
          />
        </CockpitSection>
      )}

      {/* ── Feedback Stratégique — Mise à jour en langage naturel ── */}
      {!isPublic && show("feedback") && data.strategyId && (
        <CockpitSection
          icon={<MessageSquareText className="h-5 w-5" />}
          pillarLetter="S"
          title="Feedback Stratégique"
          subtitle="Mettez à jour votre stratégie en décrivant ce qui a changé"
          color="#F59E0B"
        >
          <StrategyFeedbackModule
            strategyId={data.strategyId}
            onComplete={onRefresh}
          />
        </CockpitSection>
      )}

      {/* ── Simulateur d'Actions Marketing ── */}
      {show("action-simulator") && data.strategyId && !isPublic && (
        <SectionActionSimulator strategyId={data.strategyId} />
      )}

      {/* ── Pillar I — Implementation (Roadmap, Campaigns, Budget, Team, Launch, Playbook) ── */}
      {show("implementation") && (
        <SectionImplementation implContent={implContent} currency={(data.currency ?? "XOF") as SupportedCurrency} strategyId={data.strategyId} />
      )}

      {/* ── Widgets Analytiques ── */}
      {show("widgets") && data.strategyId && !isPublic && (
        <SectionWidgets strategyId={data.strategyId} />
      )}

      {/* ── Résultats GLORY ── */}
      {show("glory") && data.strategyId && !isPublic && (
        <SectionGlory strategyId={data.strategyId} />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          LIVRABLES UPGRADERS — Phase 5 Sections
          ═══════════════════════════════════════════════════════════════════ */}

      {/* ── T04 — Big Idea Kits ── */}
      {show("big-idea-kit") && data.strategyId && (
        <SectionBigIdeaKit strategyId={data.strategyId} />
      )}

      {/* ── T06 — Creative Strategy ── */}
      {show("creative-strategy") && data.strategyId && (
        <SectionCreativeStrategy strategyId={data.strategyId} />
      )}

      {/* ── M1 — Budget Opérationnel 3 Couches ── */}
      {show("budget-operationnel") && data.strategyId && (
        <SectionBudgetOperationnel strategyId={data.strategyId} />
      )}

      {/* ── M2 — Chrono-Architecture ── */}
      {show("chrono") && data.strategyId && (
        <SectionChrono strategyId={data.strategyId} />
      )}

      {/* ── M3 — Dossier Partenaires ── */}
      {show("partners") && data.strategyId && (
        <SectionPartners strategyId={data.strategyId} />
      )}

      {/* ── M5 — Multi-Marchés ── */}
      {show("multi-markets") && data.strategyId && (
        <SectionMultiMarkets strategyId={data.strategyId} />
      )}

      {/* ── M7 — Funnel & KPIs ── */}
      {show("funnel-mapping") && data.strategyId && (
        <SectionFunnelMapping strategyId={data.strategyId} />
      )}

      {/* ── Checklist Qualité ── */}
      {show("quality-checklist") && data.strategyId && (
        <SectionQualityChecklist strategyId={data.strategyId} />
      )}

      {/* ── Brand OS Setup ── */}
      {show("brand-os-setup") && data.strategyId && !isPublic && (
        <SectionBrandOSSetup strategyId={data.strategyId} />
      )}

      {/* ── Pillar S — Synthèse Stratégique ── */}
      {show("synthese") && (
        <SectionSynthese
          sContent={sContent}
          pillar={getPillar("S")}
          vertical={data.vertical}
        />
      )}

      {/* ── Reports Access ── */}
      {(() => {
        const reportDocs = data.documents.filter((d) =>
          (REPORT_TYPES as readonly string[]).includes(d.type),
        );
        const templateDocs = data.documents.filter((d) =>
          (TEMPLATE_TYPES as readonly string[]).includes(d.type),
        );

        return (
          <>
            {reportDocs.length > 0 && (
              <CockpitSection
                icon={<FileText className="h-5 w-5" />}
                pillarLetter="S"
                title="Rapports Stratégiques"
                subtitle={`${reportDocs.length} rapport${reportDocs.length > 1 ? "s" : ""} généré${reportDocs.length > 1 ? "s" : ""}`}
                color={PILLAR_CONFIG.S.color}
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {reportDocs.map((doc) => (
                    <Card key={doc.id} className="transition-shadow hover:shadow-sm">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">{doc.title}</p>
                        </div>
                        {doc.pageCount && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {doc.pageCount} pages
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CockpitSection>
            )}

            {/* L'ORACLE + Livrables — visible in all modes including EXECUTIVE (client) */}
            {show("livrables") && (
              <CockpitSection
                icon={<Presentation className="h-5 w-5" />}
                pillarLetter="S"
                title="L'ORACLE & Livrables"
                subtitle="Présentation interactive complète + templates stratégiques"
                color="#10B981"
              >
                <div className="space-y-5">
                  {/* ── L'ORACLE — Hero card (hidden on public share links) ── */}
                  {!isPublic && data.strategyId && (
                  <Link
                    href={
                      isClientView
                        ? "/oracle"
                        : `/brand/${data.strategyId}/oracle`
                    }
                  >
                    <Card className="group relative overflow-hidden border-primary/30 bg-gradient-to-br from-zinc-950 to-zinc-900 transition-all hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 cursor-pointer">
                      {/* Gradient accent bar */}
                      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-violet-500" />
                      <CardContent className="pt-6 pb-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-violet-500 shadow-lg shadow-primary/20">
                            <Monitor className="h-7 w-7 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold tracking-tight text-white">
                                L&apos;ORACLE
                              </h3>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                                <Sparkles className="h-2.5 w-2.5" />
                                Interactif
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-white/50">
                              Présentation immersive — 8 piliers, signaux, décisions, budget, concurrents
                            </p>
                            <div className="mt-2 flex items-center gap-4">
                              <span className="text-xs text-white/30">
                                Navigation interactive
                              </span>
                              <span className="text-xs text-white/30">
                                Graphiques &amp; Scores
                              </span>
                              <span className="text-xs text-white/30">
                                Export HTML
                              </span>
                            </div>
                          </div>
                          <div className="hidden md:flex items-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary group-hover:bg-primary/10 transition-colors">
                              Ouvrir L&apos;ORACLE
                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </div>
                        {/* Mobile CTA */}
                        <div className="mt-3 flex items-center justify-end md:hidden">
                          <span className="text-xs font-semibold text-primary group-hover:underline">
                            Ouvrir L&apos;ORACLE →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  )}

                  {/* ── Templates — 3 columns ── */}
                  {templateDocs.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                        Templates stratégiques
                      </p>
                      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
                        {templateDocs.map((doc) => {
                          const templateConfig = Object.values(TEMPLATE_CONFIG).find(
                            (c) => c.title === doc.title,
                          );
                          const unitLabel = templateConfig?.unit === "pages" ? "pages" : "slides";
                          return (
                            <Link
                              key={doc.id}
                              href={`/brand/${data.strategyId}/document/${doc.id}`}
                            >
                              <Card className="group relative overflow-hidden border-primary/20 transition-all hover:shadow-lg hover:border-primary/40 cursor-pointer">
                                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-primary/60" />
                                <CardContent className="pt-4 pb-3">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                      <Presentation className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold leading-tight">{doc.title}</p>
                                      {templateConfig && (
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                          {templateConfig.subtitle}
                                        </p>
                                      )}
                                      <div className="mt-2 flex items-center gap-3">
                                        {doc.pageCount != null && doc.pageCount > 0 && (
                                          <span className="text-xs text-muted-foreground">
                                            ~{doc.pageCount} {unitLabel}
                                          </span>
                                        )}
                                        {doc.status === "complete" && (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                                            <Crown className="h-2.5 w-2.5" />
                                            Prêt
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex items-center justify-end">
                                    <span className="text-xs font-medium text-primary group-hover:underline">
                                      Consulter →
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          );
                        })}
                      </div>
                      {!isPublic && data.strategyId && (
                        <Link
                          href={`/brand/${data.strategyId}/generate`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
                        >
                          <Sparkles className="h-3 w-3" />
                          Générer / régénérer des livrables
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  ) : (
                    <TemplatePlaceholder
                      strategyId={data.strategyId}
                      pillarIComplete={getPillar("I")?.status === "complete"}
                      isPublic={isPublic}
                      onGenerated={onRefresh}
                    />
                  )}
                </div>
              </CockpitSection>
            )}
          </>
        );
      })()}

      {/* ── Footer ── */}
      <footer className="border-t pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Généré avec la méthodologie{" "}
          <span className="font-semibold text-primary">ADVERTIS</span>
          {" "}&mdash; Intelligence stratégique en 8 piliers
        </p>
      </footer>
    </div>
    </VerticalProvider>
  );
}

// ---------------------------------------------------------------------------
// Template Placeholder — with direct generation button
// ---------------------------------------------------------------------------

function TemplatePlaceholder({
  strategyId,
  pillarIComplete,
  isPublic,
  onGenerated,
}: {
  strategyId?: string;
  pillarIComplete: boolean;
  isPublic: boolean;
  onGenerated?: () => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!strategyId) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId }),
      });
      const data = (await response.json()) as {
        success: boolean;
        error?: string;
        warning?: string;
      };
      if (data.success) {
        toast.success("Templates UPGRADERS générés !");
        onGenerated?.();
      } else {
        toast.error(data.error ?? "Erreur lors de la génération.");
      }
    } catch {
      toast.error("Erreur réseau lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  }, [strategyId, onGenerated]);

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
        Templates stratégiques disponibles
      </p>
      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
        {TEMPLATE_TYPES.map((tt) => {
          const config = TEMPLATE_CONFIG[tt];
          const unitLabel = config.unit === "pages" ? "pages" : "slides";
          return (
            <Card
              key={tt}
              className={
                isGenerating
                  ? "border-primary/30 bg-primary/5 animate-pulse"
                  : "border-dashed border-muted-foreground/20 opacity-70"
              }
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Presentation className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{config.title}</p>
                    <p className="text-xs text-muted-foreground">{config.subtitle}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/60">
                      {config.estimatedSlides[0]}-{config.estimatedSlides[1]} {unitLabel}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isGenerating ? (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Génération des templates en cours\u2026 (quelques minutes)
        </div>
      ) : pillarIComplete && !isPublic && strategyId ? (
        <button
          onClick={() => void handleGenerate()}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Générer les templates maintenant
        </button>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Les templates stratégiques sont générés une fois l&apos;analyse complète réalisée.
          </p>
          {!isPublic && strategyId && (
            <Link
              href={`/brand/${strategyId}/generate`}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Aller au Pipeline
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </>
      )}
    </div>
  );
}
