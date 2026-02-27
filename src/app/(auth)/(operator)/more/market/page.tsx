// ==========================================================================
// PAGE P.M1 — Market Portrait
// Cross-brand market visualization: BMF scores, TAM/SAM/SOM, competitive
// benchmark, macro trends, hypothesis validation. Parses pillar T per brand.
// ==========================================================================

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Target,
  Users,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type { TrackAuditResult } from "~/lib/types/pillar-schemas";
import { ScoreCircle } from "~/components/cockpit/cockpit-shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BrandMarket = {
  id: string;
  brandName: string;
  sectorLabel: string;
  bmfScore: number;
  triangulation: TrackAuditResult["triangulation"];
  hypotheses: TrackAuditResult["hypothesisValidation"];
  marketReality: TrackAuditResult["marketReality"];
  tamSamSom: TrackAuditResult["tamSamSom"];
  competitors: TrackAuditResult["competitiveBenchmark"];
  recommendations: string[];
  summary: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bmfLevel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent Fit", color: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 60) return { label: "Bon Fit", color: "text-blue-600 dark:text-blue-400" };
  if (score >= 40) return { label: "Fit Modéré", color: "text-amber-600 dark:text-amber-400" };
  return { label: "Fit Faible", color: "text-red-600 dark:text-red-400" };
}

function hypothesisStatusIcon(status: string) {
  switch (status) {
    case "validated":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    case "invalidated":
      return <XCircle className="h-3.5 w-3.5 text-red-500" />;
    default:
      return <HelpCircle className="h-3.5 w-3.5 text-amber-500" />;
  }
}

function hypothesisStatusLabel(status: string): string {
  switch (status) {
    case "validated": return "Validée";
    case "invalidated": return "Invalidée";
    default: return "À tester";
  }
}

function hypothesisStatusColor(status: string): string {
  switch (status) {
    case "validated": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "invalidated": return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300";
    default: return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MarketPortraitPage() {
  const { data: overview, isLoading, isError, refetch } =
    api.analytics.getAgencyOverview.useQuery();

  // Parse T pillar content for each brand
  const brandMarkets = useMemo<BrandMarket[]>(() => {
    if (!overview?.brands) return [];

    return overview.brands
      .map((brand) => {
        const tPillar = brand.pillars.find((p) => p.type === "T");
        if (!tPillar?.content || tPillar.status !== "complete") return null;

        const { data: tContent } = parsePillarContent<TrackAuditResult>(
          "T",
          tPillar.content,
        );
        if (!tContent) return null;

        return {
          id: brand.id,
          brandName: brand.brandName,
          sectorLabel: brand.sectorLabel,
          bmfScore: tContent.brandMarketFitScore,
          triangulation: tContent.triangulation,
          hypotheses: tContent.hypothesisValidation,
          marketReality: tContent.marketReality,
          tamSamSom: tContent.tamSamSom,
          competitors: tContent.competitiveBenchmark.slice(0, 4),
          recommendations: tContent.strategicRecommendations.slice(0, 3),
          summary: tContent.summary,
        } satisfies BrandMarket;
      })
      .filter((b): b is BrandMarket => b !== null)
      .sort((a, b) => b.bmfScore - a.bmfScore); // Highest BMF first
  }, [overview?.brands]);

  // Aggregates
  const aggregates = useMemo(() => {
    if (brandMarkets.length === 0)
      return { avg: 0, excellent: 0, good: 0, weak: 0, total: 0 };
    const scores = brandMarkets.map((b) => b.bmfScore);
    return {
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      excellent: brandMarkets.filter((b) => b.bmfScore >= 80).length,
      good: brandMarkets.filter((b) => b.bmfScore >= 60 && b.bmfScore < 80).length,
      weak: brandMarkets.filter((b) => b.bmfScore < 60).length,
      total: brandMarkets.length,
    };
  }, [brandMarkets]);

  // ── States ──

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">
          Impossible de charger le portrait marché
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/more">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Portrait Marché</h1>
          <p className="text-sm text-muted-foreground">
            Étude de marché par marque — Brand-Market Fit
          </p>
        </div>
      </div>

      {/* Aggregate KPIs */}
      {brandMarkets.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{aggregates.avg}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              BMF moyen
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{aggregates.excellent}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Excellent Fit
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{aggregates.good}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Bon Fit
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{aggregates.weak}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Fit faible
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {brandMarkets.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <BarChart3 className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Aucune marque n&apos;a de données marché. Lancez un audit T pour
            vos marques.
          </p>
        </div>
      )}

      {/* Brand market cards */}
      <div className="space-y-4">
        {brandMarkets.map((brand) => {
          const level = bmfLevel(brand.bmfScore);
          return (
            <div
              key={brand.id}
              className="rounded-xl border bg-card overflow-hidden"
            >
              {/* Card header */}
              <Link
                href={`/brand/${brand.id}`}
                className="flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <ScoreCircle score={brand.bmfScore} label="BMF" size="sm" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-sm">
                    {brand.brandName}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {brand.sectorLabel} · <span className={level.color}>{level.label}</span>
                  </p>
                </div>
                {brand.bmfScore >= 80 ? (
                  <TrendingUp className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : brand.bmfScore >= 60 ? (
                  <Target className="h-5 w-5 shrink-0 text-blue-500" />
                ) : (
                  <Users className="h-5 w-5 shrink-0 text-amber-500" />
                )}
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>

              <div className="p-4 space-y-4">
                {/* Summary */}
                {brand.summary && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {brand.summary}
                  </p>
                )}

                {/* TAM / SAM / SOM */}
                {(brand.tamSamSom.tam.value ||
                  brand.tamSamSom.sam.value ||
                  brand.tamSamSom.som.value) && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      TAM / SAM / SOM
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "TAM", data: brand.tamSamSom.tam, color: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30" },
                        { label: "SAM", data: brand.tamSamSom.sam, color: "border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30" },
                        { label: "SOM", data: brand.tamSamSom.som, color: "border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/30" },
                      ].map((seg) =>
                        seg.data.value ? (
                          <div
                            key={seg.label}
                            className={cn("rounded-lg border p-2.5 text-center", seg.color)}
                          >
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {seg.label}
                            </p>
                            <p className="text-sm font-bold text-foreground mt-0.5">
                              {seg.data.value}
                            </p>
                            {seg.data.description && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                                {seg.data.description}
                              </p>
                            )}
                          </div>
                        ) : null,
                      )}
                    </div>
                  </div>
                )}

                {/* Market Reality: trends, signals, patterns */}
                {(brand.marketReality.macroTrends.length > 0 ||
                  brand.marketReality.weakSignals.length > 0 ||
                  brand.marketReality.emergingPatterns.length > 0) && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Réalité du marché
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {[
                        { label: "Tendances macro", items: brand.marketReality.macroTrends, color: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30" },
                        { label: "Signaux faibles", items: brand.marketReality.weakSignals, color: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30" },
                        { label: "Patterns émergents", items: brand.marketReality.emergingPatterns, color: "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30" },
                      ].map((section) =>
                        section.items.length > 0 ? (
                          <div
                            key={section.label}
                            className={cn("rounded-lg border p-2.5", section.color)}
                          >
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                              {section.label}
                            </p>
                            <ul className="space-y-0.5">
                              {section.items.slice(0, 3).map((item, i) => (
                                <li key={i} className="text-xs leading-tight truncate">
                                  {item}
                                </li>
                              ))}
                              {section.items.length > 3 && (
                                <li className="text-[10px] text-muted-foreground">
                                  +{section.items.length - 3} autres
                                </li>
                              )}
                            </ul>
                          </div>
                        ) : null,
                      )}
                    </div>
                  </div>
                )}

                {/* Competitive Benchmark */}
                {brand.competitors.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Benchmark concurrentiel
                    </p>
                    <div className="space-y-1.5">
                      {brand.competitors.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 rounded-lg border bg-muted/20 px-3 py-2"
                        >
                          <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium truncate">
                                {c.competitor}
                              </p>
                              {c.marketShare && (
                                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  {c.marketShare}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {c.strengths.slice(0, 2).map((s, j) => (
                                <span
                                  key={`s-${j}`}
                                  className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 text-[9px] text-emerald-700 dark:text-emerald-300"
                                >
                                  {s}
                                </span>
                              ))}
                              {c.weaknesses.slice(0, 2).map((w, j) => (
                                <span
                                  key={`w-${j}`}
                                  className="rounded-full bg-red-100 dark:bg-red-950/40 px-1.5 py-0.5 text-[9px] text-red-700 dark:text-red-300"
                                >
                                  {w}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hypothesis validation */}
                {brand.hypotheses.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Validation des hypothèses
                    </p>
                    <div className="space-y-1.5">
                      {brand.hypotheses.slice(0, 4).map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2"
                        >
                          {hypothesisStatusIcon(h.status)}
                          <span className="min-w-0 flex-1 text-xs truncate">
                            {h.hypothesis}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                              hypothesisStatusColor(h.status),
                            )}
                          >
                            {hypothesisStatusLabel(h.status)}
                          </span>
                        </div>
                      ))}
                      {brand.hypotheses.length > 4 && (
                        <p className="text-[10px] text-muted-foreground text-center">
                          +{brand.hypotheses.length - 4} autres hypothèses
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Strategic recommendations */}
                {brand.recommendations.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Recommandations stratégiques
                    </p>
                    <ul className="space-y-1">
                      {brand.recommendations.map((rec, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <span className={cn(
                            "mt-0.5 h-4 w-4 shrink-0 flex items-center justify-center rounded-full text-[9px] font-bold text-white",
                            i === 0 ? "bg-terracotta" : i === 1 ? "bg-blue-500" : "bg-emerald-500",
                          )}>
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
