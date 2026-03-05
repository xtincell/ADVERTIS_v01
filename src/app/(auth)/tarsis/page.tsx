// ==========================================================================
// PAGE P.TRS1 — TARSIS Hub
// Portfolio market intelligence dashboard: BMF heatmap, alerts, quick links.
// ==========================================================================

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  FlaskConical,
  Calendar,
  ChevronRight,
  Radar,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type { TrackAuditResult } from "~/lib/types/pillar-schemas";
import { ScoreCircle } from "~/components/cockpit/cockpit-shared";
import { EmptyState } from "~/components/ui/empty-state";
import { PageSpinner } from "~/components/ui/loading-skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BrandMarket = {
  id: string;
  brandName: string;
  sectorLabel: string;
  bmfScore: number;
  hasT: true;
};

type BrandNoT = {
  id: string;
  brandName: string;
  sectorLabel: string;
  hasT: false;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bmfColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function bmfLabel(score: number): string {
  if (score >= 80) return "Excellent Fit";
  if (score >= 60) return "Bon Fit";
  if (score >= 40) return "Fit Modéré";
  return "Fit Faible";
}

// ---------------------------------------------------------------------------
// Quick link definitions
// ---------------------------------------------------------------------------

const QUICK_LINKS = [
  { href: "/tarsis/radar", label: "Radar Concurrentiel", icon: Users, desc: "Paysage concurrentiel cross-marques" },
  { href: "/tarsis/sizing", label: "Dimensionnement", icon: BarChart3, desc: "TAM / SAM / SOM par marque" },
  { href: "/tarsis/signals", label: "Signaux & Tendances", icon: Zap, desc: "Tendances macro et signaux faibles" },
  { href: "/tarsis/hypotheses", label: "Hypothèses", icon: FlaskConical, desc: "Validation des hypothèses marché" },
  { href: "/tarsis/opportunities", label: "Opportunités", icon: Calendar, desc: "Calendrier des opportunités" },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TarsisHubPage() {
  const { data: overview, isLoading, isError, refetch } =
    api.analytics.getAgencyOverview.useQuery();

  const { brandsWithT, brandsWithoutT, aggregates } = useMemo(() => {
    if (!overview?.brands) return { brandsWithT: [] as BrandMarket[], brandsWithoutT: [] as BrandNoT[], aggregates: { avg: 0, excellent: 0, good: 0, weak: 0, total: 0, withT: 0 } };

    const withT: BrandMarket[] = [];
    const withoutT: BrandNoT[] = [];

    for (const brand of overview.brands) {
      const tPillar = brand.pillars.find((p) => p.type === "T");
      if (tPillar?.content && tPillar.status === "complete") {
        const { data: tContent } = parsePillarContent<TrackAuditResult>("T", tPillar.content);
        if (tContent) {
          withT.push({
            id: brand.id,
            brandName: brand.brandName,
            sectorLabel: brand.sectorLabel,
            bmfScore: tContent.brandMarketFitScore,
            hasT: true,
          });
          continue;
        }
      }
      withoutT.push({
        id: brand.id,
        brandName: brand.brandName,
        sectorLabel: brand.sectorLabel,
        hasT: false,
      });
    }

    withT.sort((a, b) => b.bmfScore - a.bmfScore);

    const scores = withT.map((b) => b.bmfScore);
    const avg = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return {
      brandsWithT: withT,
      brandsWithoutT: withoutT,
      aggregates: {
        avg,
        excellent: withT.filter((b) => b.bmfScore >= 80).length,
        good: withT.filter((b) => b.bmfScore >= 60 && b.bmfScore < 80).length,
        weak: withT.filter((b) => b.bmfScore < 60).length,
        total: overview.brands.length,
        withT: withT.length,
      },
    };
  }, [overview?.brands]);

  // ── States ──

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !overview) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">
          Impossible de charger l&apos;intelligence marché
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header */}
      <div>
        <h1 className="text-display-lg flex items-center gap-2">
          <Radar className="h-6 w-6 text-cyan-600" />
          TARSIS
        </h1>
        <p className="text-sm text-muted-foreground">
          Intelligence marché — Vue consolidée du portfolio
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 stagger-children">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{aggregates.avg}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            BMF moyen
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-600">
            {aggregates.withT}/{aggregates.total}
          </p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Marques analysées
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-500">{aggregates.excellent}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Excellent Fit
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{aggregates.weak}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Fit faible
          </p>
        </div>
      </div>

      {/* BMF Heatmap */}
      {brandsWithT.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Brand-Market Fit par marque
          </h2>
          <div className="space-y-2">
            {brandsWithT.map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.id}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted/30"
              >
                <ScoreCircle score={brand.bmfScore} label="BMF" size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{brand.brandName}</p>
                  <p className="text-[11px] text-muted-foreground">{brand.sectorLabel}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[200px]">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", bmfColor(brand.bmfScore))}
                      style={{ width: `${brand.bmfScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-16 text-right">
                    {bmfLabel(brand.bmfScore)}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Alerts: brands without T */}
      {brandsWithoutT.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Marques sans audit T
          </h2>
          <div className="space-y-1.5">
            {brandsWithoutT.map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.id}`}
                className="flex items-center gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 transition-colors hover:bg-amber-100/50 dark:hover:bg-amber-950/30"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{brand.brandName}</p>
                  <p className="text-[10px] text-muted-foreground">{brand.sectorLabel}</p>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 shrink-0">
                  Audit T manquant
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {aggregates.total === 0 && (
        <EmptyState
          icon={Radar}
          title="Aucune marque trouvée"
          description="Créez une fiche de marque pour commencer."
          action={{ label: "Nouvelle Fiche", href: "/new" }}
        />
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Modules
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-cyan-600/30 hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-600/10">
                  <Icon className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
