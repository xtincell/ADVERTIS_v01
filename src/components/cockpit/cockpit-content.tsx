"use client";

import {
  Crown,
  FileText,
  Presentation,
} from "lucide-react";

import { PILLAR_CONFIG, REPORT_TYPES, TEMPLATE_TYPES } from "~/lib/constants";
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
import { SectionWidgets } from "./sections/section-widgets";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PillarData {
  type: string;
  title: string;
  status: string;
  summary: string | null;
  content: unknown;
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
  name: string;
  sector: string | null;
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
}: {
  data: CockpitData;
  isPublic?: boolean;
}) {
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
      <SectionAuthenticite
        aContent={aContent}
        implContent={implContent}
        pillar={getPillar("A")}
      />

      {/* ── Pillar D — Distinction ── */}
      <SectionDistinction
        dContent={dContent}
        implContent={implContent}
        pillar={getPillar("D")}
      />

      {/* ── Pillar V — Valeur ── */}
      <SectionValeur
        vContent={vContent}
        implContent={implContent}
        pillar={getPillar("V")}
      />

      {/* ── Pillar E — Engagement ── */}
      <SectionEngagement
        eContent={eContent}
        implContent={implContent}
        pillar={getPillar("E")}
      />

      {/* ── Pillar R — Risk Audit ── */}
      <SectionRisk
        rContent={rContent}
        implContent={implContent}
        pillar={getPillar("R")}
      />

      {/* ── Veille & Opportunites (surfaces T insights prominently) ── */}
      <SectionVeille tContent={tContent} implContent={implContent} />

      {/* ── Pillar T — Track / Market Validation ── */}
      <SectionTrack
        tContent={tContent}
        implContent={implContent}
        pillar={getPillar("T")}
      />

      {/* ── Pillar I — Implementation (Roadmap, Campaigns, Budget, Team, Launch, Playbook) ── */}
      <SectionImplementation implContent={implContent} />

      {/* ── Widgets Analytiques ── */}
      {data.strategyId && !isPublic && (
        <SectionWidgets strategyId={data.strategyId} />
      )}

      {/* ── Pillar S — Synthèse Stratégique ── */}
      <SectionSynthese
        sContent={sContent}
        pillar={getPillar("S")}
      />

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

            {templateDocs.length > 0 && (
              <CockpitSection
                icon={<Presentation className="h-5 w-5" />}
                pillarLetter="S"
                title="Livrables UPGRADERS"
                subtitle={`${templateDocs.length} template${templateDocs.length > 1 ? "s" : ""} vendable${templateDocs.length > 1 ? "s" : ""}`}
                color="#c45a3c"
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {templateDocs.map((doc) => (
                    <Card
                      key={doc.id}
                      className="border-terracotta/20 transition-shadow hover:shadow-sm"
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Presentation className="h-4 w-4 text-terracotta" />
                          <p className="text-sm font-medium">{doc.title}</p>
                        </div>
                        {doc.pageCount && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {doc.pageCount} slides
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
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
          <span className="font-semibold text-terracotta">ADVERTIS</span>
          {" "}&mdash; Fiche de marque en 8 piliers
        </p>
      </footer>
    </div>
  );
}
