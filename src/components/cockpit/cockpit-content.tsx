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

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  FileText,
  Monitor,
  Presentation,
  Sparkles,
} from "lucide-react";

import {
  PILLAR_CONFIG,
  REPORT_TYPES,
  TEMPLATE_TYPES,
  VIEW_MODES,
  VIEW_MODE_LABELS,
  VIEW_MODE_SECTIONS,
} from "~/lib/constants";
import type { ViewMode } from "~/lib/constants";
import type { ImplementationData } from "~/lib/types/implementation-data";
import type {
  AuthenticitePillarData,
  DistinctionPillarData,
  ValeurPillarData,
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
import { SectionBriefs } from "./sections/section-briefs";
import { AuditSuggestionsPanel } from "~/components/strategy/audit-review/audit-suggestions-panel";

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
  description: string | null;
  phase: string;
  coherenceScore: number | null;
  pillars: PillarData[];
  documents: DocumentData[];
  previousScores?: ScoreSnapshot | null;
  coherenceBreakdown?: CoherenceBreakdownData | null;
  riskBreakdown?: RiskBreakdownData | null;
  bmfBreakdown?: BmfBreakdownData | null;
}

// ---------------------------------------------------------------------------
// Main Cockpit Content — Orchestrator
// ---------------------------------------------------------------------------

export function CockpitContent({
  data,
  isPublic = false,
  initialViewMode,
  onRefresh,
  tabSections,
}: {
  data: CockpitData;
  isPublic?: boolean;
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
  const { data: vContent } = parsePillarContent<ValeurPillarData>("V", getPillar("V")?.content);
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
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════════════
          NIVEAU 1 — Executive Overview (10 secondes)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-terracotta/5 px-4 py-1.5">
            <Crown className="h-3.5 w-3.5 text-terracotta" />
            <span className="text-xs font-medium text-terracotta">
              Cockpit Stratégique
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {data.brandName}
          </h1>
          {(data.tagline || implContent?.brandPlatform?.tagline) && (
            <p className="mt-1 text-lg font-medium italic text-terracotta/70">
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

          {/* ViewMode selector */}
          {!isPublic && (
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
          color="#c43c6e"
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

      {/* ── Pillar I — Implementation (Roadmap, Campaigns, Budget, Team, Launch, Playbook) ── */}
      {show("implementation") && (
        <SectionImplementation implContent={implContent} />
      )}

      {/* ── Widgets Analytiques ── */}
      {show("widgets") && data.strategyId && !isPublic && (
        <SectionWidgets strategyId={data.strategyId} />
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

            {/* Livrables UPGRADERS — show section even if no templates yet */}
            <CockpitSection
              icon={<Presentation className="h-5 w-5" />}
              pillarLetter="S"
              title="Livrables UPGRADERS"
              subtitle={
                templateDocs.length > 0
                  ? `${templateDocs.length} template${templateDocs.length > 1 ? "s" : ""} vendable${templateDocs.length > 1 ? "s" : ""}`
                  : "3 templates vendables — Protocole, Reco Campagne, Mandat 360"
              }
              color="#c45a3c"
            >
              {templateDocs.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {templateDocs.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/strategy/${data.strategyId}/document/${doc.id}`}
                      >
                        <Card className="border-terracotta/20 transition-all hover:shadow-md hover:border-terracotta/40 cursor-pointer">
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                              <Presentation className="h-4 w-4 text-terracotta" />
                              <p className="text-sm font-medium">{doc.title}</p>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              {doc.pageCount && (
                                <p className="text-xs text-muted-foreground">
                                  ~{doc.pageCount} slides
                                </p>
                              )}
                              <span className="text-xs font-medium text-terracotta">
                                Voir →
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  {!isPublic && (
                    <Link
                      href={`/strategy/${data.strategyId}/generate`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-terracotta hover:text-terracotta/80"
                    >
                      <Sparkles className="h-3 w-3" />
                      Générer / régénérer des templates
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Les 3 templates vendables (Protocole Stratégique, Reco Campagne, Mandat 360)
                    se génèrent depuis le Pipeline une fois le pilier I complété.
                  </p>
                  {!isPublic && (
                    <Link
                      href={`/strategy/${data.strategyId}/generate`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-terracotta/10 px-3 py-1.5 text-xs font-medium text-terracotta hover:bg-terracotta/20 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Aller au Pipeline
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              )}
            </CockpitSection>
          </>
        );
      })()}

      {/* ── Footer ── */}
      <footer className="border-t pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Généré avec la méthodologie{" "}
          <span className="font-semibold text-terracotta">ADVERTIS</span>
          {" "}&mdash; Fiche de marque en 8 piliers
        </p>
      </footer>
    </div>
  );
}
