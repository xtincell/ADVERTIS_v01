// ==========================================================================
// PAGE P.TRS2 — Radar Concurrentiel
// Cross-brand competitive landscape: deduplicated competitors, SOV, overlap.
// ==========================================================================

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RotateCcw,
  Building2,
  ExternalLink,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { EmptyState } from "~/components/ui/empty-state";
import { PageSpinner } from "~/components/ui/loading-skeleton";
import { PageHeader } from "~/components/ui/page-header";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CompetitorEntry = {
  strategyBrand: string;
  strategyId: string;
  positioning: string | null;
  strengths: string[];
  weaknesses: string[];
  sov: number | null;
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TarsisRadarPage() {
  const { data, isLoading, isError, refetch } =
    api.marketContext.crossBrand.getAll.useQuery();

  const [brandFilter, setBrandFilter] = useState<string>("all");

  // Deduplicate competitors by name
  const { competitorMap, brandList } = useMemo(() => {
    if (!data) return { competitorMap: new Map<string, CompetitorEntry[]>(), brandList: [] as string[] };

    const map = new Map<string, CompetitorEntry[]>();
    const brands = new Set<string>();

    for (const c of data.competitors) {
      const key = c.name.toLowerCase().trim();
      const entries = map.get(key) ?? [];
      entries.push({
        strategyBrand: c.strategy.brandName,
        strategyId: c.strategy.id,
        positioning: c.positioning,
        strengths: (c.strengths ?? []) as string[],
        weaknesses: (c.weaknesses ?? []) as string[],
        sov: c.sov,
      });
      map.set(key, entries);
      brands.add(c.strategy.brandName);
    }

    return {
      competitorMap: map,
      brandList: Array.from(brands).sort(),
    };
  }, [data]);

  // Filtered competitors
  const filteredCompetitors = useMemo(() => {
    if (brandFilter === "all") return Array.from(competitorMap.entries());
    return Array.from(competitorMap.entries()).filter(([, entries]) =>
      entries.some((e) => e.strategyBrand === brandFilter),
    );
  }, [competitorMap, brandFilter]);

  // Metrics
  const overlaps = useMemo(
    () => Array.from(competitorMap.values()).filter((e) => e.length >= 2).length,
    [competitorMap],
  );

  // ── States ──

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">Impossible de charger les données concurrentielles</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title="Radar Concurrentiel"
        description="Paysage concurrentiel consolidé de toutes vos marques"
        backHref="/tarsis"
        backLabel="Retour au tableau Tarsis"
      />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{competitorMap.size}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Concurrents uniques
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-600">{overlaps}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Overlaps cross-marques
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{brandList.length}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Marques trackées
          </p>
        </div>
      </div>

      {/* Filter */}
      {brandList.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Filtre :</span>
          <button
            onClick={() => setBrandFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              brandFilter === "all"
                ? "bg-cyan-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            Toutes ({competitorMap.size})
          </button>
          {brandList.map((brand) => (
            <button
              key={brand}
              onClick={() => setBrandFilter(brand)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                brandFilter === brand
                  ? "bg-cyan-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {brand}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {competitorMap.size === 0 && (
        <EmptyState
          icon={Building2}
          title="Aucun concurrent identifié"
          description="Lancez des audits T pour détecter le paysage concurrentiel."
        />
      )}

      {/* Competitor cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredCompetitors.map(([name, entries]) => (
          <div key={name} className="rounded-xl border bg-card p-4 space-y-3">
            {/* Name + overlap badge */}
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h3 className="font-semibold text-sm capitalize flex-1 truncate">{name}</h3>
              {entries.length >= 2 && (
                <span className="shrink-0 rounded-full bg-cyan-600/10 px-2 py-0.5 text-[10px] font-medium text-cyan-600">
                  {entries.length} marques
                </span>
              )}
              {entries[0]?.sov != null && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  SOV {entries[0].sov}%
                </span>
              )}
            </div>

            {/* Linked brands */}
            <div className="flex flex-wrap gap-1">
              {entries.map((e) => (
                <Link
                  key={e.strategyId}
                  href={`/brand/${e.strategyId}`}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium hover:bg-muted/80 transition-colors"
                >
                  {e.strategyBrand}
                  <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              ))}
            </div>

            {/* Positioning */}
            {entries[0]?.positioning && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {entries[0].positioning}
              </p>
            )}

            {/* Strengths & Weaknesses */}
            <div className="flex flex-wrap gap-1">
              {entries[0]?.strengths.slice(0, 3).map((s, i) => (
                <span
                  key={`s-${i}`}
                  className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-[9px] text-emerald-700 dark:text-emerald-300"
                >
                  {s}
                </span>
              ))}
              {entries[0]?.weaknesses.slice(0, 3).map((w, i) => (
                <span
                  key={`w-${i}`}
                  className="rounded-full bg-red-100 dark:bg-red-950/40 px-2 py-0.5 text-[9px] text-red-700 dark:text-red-300"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
