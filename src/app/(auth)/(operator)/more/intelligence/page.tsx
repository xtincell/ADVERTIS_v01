// ==========================================================================
// PAGE P.8B — Market Intelligence (Operator)
// Strategic intelligence hub — reuses the cross-brand intelligence view.
// ==========================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Loader2,
  AlertTriangle,
  BarChart3,
  Users,
  TrendingUp,
  Search,
  Calendar,
  Eye,
  Building2,
  ExternalLink,
  Zap,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { TrackAuditResult } from "~/lib/types/pillar-schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "overview" | "competitors" | "opportunities" | "trends";

function parseTrackContent(content: unknown): TrackAuditResult | null {
  if (!content || typeof content !== "object") return null;
  const obj = content as Record<string, unknown>;
  if (!obj.brandMarketFitScore && !obj.tamSamSom) return null;
  return content as TrackAuditResult;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OperatorIntelligencePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data, isLoading, isError } =
    api.marketContext.crossBrand.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        <p className="text-sm text-muted-foreground">
          Chargement de l&apos;intelligence march&eacute;&hellip;
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="font-medium text-red-700">
          Impossible de charger les donn&eacute;es
        </p>
      </div>
    );
  }

  const { strategies, competitors, opportunities, sectorSignals } = data;

  // Deduplicate competitors
  const competitorMap = new Map<
    string,
    Array<{
      strategyBrand: string;
      strategyId: string;
      positioning: string | null;
      strengths: string[];
      weaknesses: string[];
    }>
  >();
  for (const c of competitors) {
    const key = c.name.toLowerCase().trim();
    const entries = competitorMap.get(key) ?? [];
    entries.push({
      strategyBrand: c.strategy.brandName,
      strategyId: c.strategy.id,
      positioning: c.positioning,
      strengths: (c.strengths ?? []) as string[],
      weaknesses: (c.weaknesses ?? []) as string[],
    });
    competitorMap.set(key, entries);
  }

  // Aggregate trends / signals from T pillar content
  const allTrends: Array<{ trend: string; brand: string }> = [];
  const allSignals: Array<{ signal: string; brand: string }> = [];

  for (const s of strategies) {
    const tPillar = s.pillars[0];
    if (!tPillar || tPillar.status !== "complete") continue;
    const tContent = parseTrackContent(tPillar.content);
    if (!tContent) continue;

    for (const t of tContent.marketReality?.macroTrends ?? []) {
      allTrends.push({ trend: t, brand: s.brandName });
    }
    for (const sig of tContent.marketReality?.weakSignals ?? []) {
      allSignals.push({ signal: sig, brand: s.brandName });
    }
  }

  const tabs = [
    { id: "overview" as const, label: "Vue d\'ensemble", icon: BarChart3, count: `${strategies.length}` },
    { id: "competitors" as const, label: "Concurrents", icon: Users, count: `${competitorMap.size}` },
    { id: "opportunities" as const, label: "Opportunités", icon: Calendar, count: `${opportunities.length}` },
    { id: "trends" as const, label: "Tendances", icon: TrendingUp, count: `${allTrends.length + allSignals.length}` },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Globe className="h-6 w-6 text-terracotta" />
          Intelligence March&eacute;
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue consolid&eacute;e des donn&eacute;es march&eacute; de toutes vos
          strat&eacute;gies
        </p>
      </div>

      {strategies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Globe className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Aucune strat&eacute;gie trouv&eacute;e. Cr&eacute;ez une fiche de
            marque pour commencer.
          </p>
          <Button asChild>
            <Link href="/new">Nouvelle Fiche</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Tab navigation */}
          <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count && (
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="min-h-[300px]">
            {activeTab === "overview" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {strategies.map((s) => {
                  const tPillar = s.pillars[0];
                  const tContent =
                    tPillar?.status === "complete"
                      ? parseTrackContent(tPillar.content)
                      : null;
                  const bmfScore = tContent?.brandMarketFitScore ?? null;

                  return (
                    <Card key={s.id} className="relative overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{s.brandName}</h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {s.sector ?? "Secteur non spécifié"}
                            </p>
                          </div>
                          {bmfScore !== null && (
                            <div
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                                bmfScore >= 70
                                  ? "bg-emerald-500"
                                  : bmfScore >= 40
                                    ? "bg-amber-500"
                                    : "bg-red-500",
                              )}
                            >
                              {bmfScore}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/brand/${s.id}`}
                              className="text-xs"
                            >
                              Cockpit
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {activeTab === "competitors" && (
              <div className="space-y-4">
                {competitorMap.size === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <Building2 className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Aucun concurrent identifi&eacute;.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from(competitorMap.entries()).map(([name, entries]) => (
                      <Card key={name}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold capitalize">{name}</h3>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {entries.map((e) => (
                              <Link
                                key={e.strategyId}
                                href={`/brand/${e.strategyId}`}
                                className="text-[10px] text-terracotta hover:underline"
                              >
                                {e.strategyBrand}
                              </Link>
                            ))}
                          </div>
                          {entries[0]?.strengths && entries[0].strengths.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">
                                Forces
                              </p>
                              <ul className="space-y-0.5">
                                {entries[0].strengths.slice(0, 3).map((s, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-700">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "opportunities" && (
              <div className="space-y-4">
                {opportunities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Aucune opportunit&eacute; identifi&eacute;e.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {opportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold",
                            opp.impact === "HIGH"
                              ? "bg-red-500"
                              : opp.impact === "MEDIUM"
                                ? "bg-amber-500"
                                : "bg-blue-500",
                          )}
                        >
                          {opp.impact === "HIGH" ? "H" : opp.impact === "MEDIUM" ? "M" : "L"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{opp.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{opp.strategy.brandName}</span>
                            <span>&middot;</span>
                            <span>{opp.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "trends" && (
              <div className="space-y-6">
                {/* Sector signals (cross-strategy patterns) */}
                {sectorSignals && sectorSignals.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Signaux sectoriels ({sectorSignals.length})
                    </p>
                    <div className="space-y-2">
                      {sectorSignals.map((ss, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3"
                        >
                          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">
                              {ss.count} marques avec signal {ss.layer} sur pilier {ss.pillar}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Secteur : {ss.sector} — Marques : {ss.brands.join(", ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {allTrends.length === 0 && allSignals.length === 0 && (!sectorSignals || sectorSignals.length === 0) ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <TrendingUp className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Aucune tendance d&eacute;tect&eacute;e.
                    </p>
                  </div>
                ) : (
                  <>
                    {allTrends.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Tendances macro ({allTrends.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {allTrends.map((t, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm font-medium"
                            >
                              <TrendingUp className="h-3 w-3 text-purple-600" />
                              {t.trend}
                              <span className="ml-1 text-[10px] text-muted-foreground">
                                ({t.brand})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {allSignals.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Signaux faibles ({allSignals.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {allSignals.map((s, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium"
                            >
                              <Search className="h-3 w-3 text-amber-600" />
                              {s.signal}
                              <span className="ml-1 text-[10px] text-muted-foreground">
                                ({s.brand})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
