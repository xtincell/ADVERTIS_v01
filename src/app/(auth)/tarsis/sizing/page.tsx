// ==========================================================================
// PAGE P.TRS3 — Market Sizing (TAM/SAM/SOM)
// Cross-brand TAM/SAM/SOM comparison table and methodology breakdown.
// ==========================================================================

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RotateCcw,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type { TrackAuditResult } from "~/lib/types/pillar-schemas";
import { EmptyState } from "~/components/ui/empty-state";
import { PageSpinner } from "~/components/ui/loading-skeleton";
import { PageHeader } from "~/components/ui/page-header";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BrandSizing = {
  id: string;
  brandName: string;
  sectorLabel: string;
  tam: { value: string; description: string };
  sam: { value: string; description: string };
  som: { value: string; description: string };
  methodology: string;
  bmfScore: number;
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TarsisSizingPage() {
  const { data: overview, isLoading, isError, refetch } =
    api.analytics.getAgencyOverview.useQuery();

  const brands = useMemo<BrandSizing[]>(() => {
    if (!overview?.brands) return [];

    return overview.brands
      .map((brand) => {
        const tPillar = brand.pillars.find((p) => p.type === "T");
        if (!tPillar?.content || tPillar.status !== "complete") return null;

        const { data: t } = parsePillarContent<TrackAuditResult>("T", tPillar.content);
        if (!t) return null;

        // Skip brands with no TAM/SAM/SOM data
        if (!t.tamSamSom.tam.value && !t.tamSamSom.sam.value && !t.tamSamSom.som.value) return null;

        return {
          id: brand.id,
          brandName: brand.brandName,
          sectorLabel: brand.sectorLabel,
          tam: t.tamSamSom.tam,
          sam: t.tamSamSom.sam,
          som: t.tamSamSom.som,
          methodology: t.tamSamSom.methodology,
          bmfScore: t.brandMarketFitScore,
        } satisfies BrandSizing;
      })
      .filter((b): b is BrandSizing => b !== null)
      .sort((a, b) => b.bmfScore - a.bmfScore);
  }, [overview?.brands]);

  // ── States ──

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !overview) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">Impossible de charger les données</p>
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
        title="Dimensionnement Marché"
        description="TAM / SAM / SOM par marque — Comparaison portfolio"
        backHref="/tarsis"
        backLabel="Retour au tableau Tarsis"
      />

      {/* Empty state */}
      {brands.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title="Aucune donnée TAM/SAM/SOM disponible"
          description="Lancez des audits T pour dimensionner vos marchés."
        />
      )}

      {/* Brand sizing cards */}
      <div className="space-y-4">
        {brands.map((brand) => (
          <div key={brand.id} className="rounded-xl border bg-card overflow-hidden">
            {/* Card header */}
            <Link
              href={`/brand/${brand.id}`}
              className="flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                  brand.bmfScore >= 80 ? "bg-emerald-500"
                    : brand.bmfScore >= 60 ? "bg-blue-500"
                      : brand.bmfScore >= 40 ? "bg-amber-500"
                        : "bg-red-500",
                )}
              >
                {brand.bmfScore}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-sm">{brand.brandName}</h3>
                <p className="text-[11px] text-muted-foreground">{brand.sectorLabel}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>

            {/* TAM / SAM / SOM */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "TAM", data: brand.tam, color: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30" },
                  { label: "SAM", data: brand.sam, color: "border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30" },
                  { label: "SOM", data: brand.som, color: "border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/30" },
                ].map((seg) => (
                  <div
                    key={seg.label}
                    className={cn("rounded-lg border p-3 text-center", seg.color)}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {seg.label}
                    </p>
                    <p className="text-sm font-bold text-foreground mt-1">
                      {seg.data.value || "—"}
                    </p>
                    {seg.data.description && (
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                        {seg.data.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Methodology */}
              {brand.methodology && (
                <div className="rounded-lg border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Méthodologie
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {brand.methodology}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
