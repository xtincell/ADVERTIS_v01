// ==========================================================================
// PAGE P.TRS5 — Hypothesis Validation
// Cross-brand hypothesis tracking: validated, invalidated, to_test.
// ==========================================================================

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RotateCcw,
  FlaskConical,
  CheckCircle2,
  XCircle,
  HelpCircle,
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

type Hypothesis = {
  hypothesis: string;
  status: "validated" | "invalidated" | "to_test";
  evidence: string;
  brandName: string;
  brandId: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusIcon(status: string) {
  switch (status) {
    case "validated":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "invalidated":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <HelpCircle className="h-4 w-4 text-amber-500" />;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "validated": return "Validée";
    case "invalidated": return "Invalidée";
    default: return "À tester";
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "validated": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "invalidated": return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300";
    default: return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TarsisHypothesesPage() {
  const { data: overview, isLoading, isError, refetch } =
    api.analytics.getAgencyOverview.useQuery();

  const [brandFilter, setBrandFilter] = useState<string>("all");

  // Parse all hypotheses from T pillars
  const { allHypotheses, brandList } = useMemo(() => {
    if (!overview?.brands) return { allHypotheses: [] as Hypothesis[], brandList: [] as string[] };

    const hyps: Hypothesis[] = [];
    const brands = new Set<string>();

    for (const brand of overview.brands) {
      const tPillar = brand.pillars.find((p) => p.type === "T");
      if (!tPillar?.content || tPillar.status !== "complete") continue;

      const { data: t } = parsePillarContent<TrackAuditResult>("T", tPillar.content);
      if (!t || t.hypothesisValidation.length === 0) continue;

      brands.add(brand.brandName);

      for (const h of t.hypothesisValidation) {
        hyps.push({
          hypothesis: h.hypothesis,
          status: h.status,
          evidence: h.evidence,
          brandName: brand.brandName,
          brandId: brand.id,
        });
      }
    }

    return { allHypotheses: hyps, brandList: Array.from(brands).sort() };
  }, [overview?.brands]);

  // Filtered & grouped
  const filtered = brandFilter === "all"
    ? allHypotheses
    : allHypotheses.filter((h) => h.brandName === brandFilter);

  const validated = filtered.filter((h) => h.status === "validated");
  const invalidated = filtered.filter((h) => h.status === "invalidated");
  const toTest = filtered.filter((h) => h.status === "to_test");

  const pctValidated = filtered.length > 0
    ? Math.round((validated.length / filtered.length) * 100)
    : 0;
  const pctInvalidated = filtered.length > 0
    ? Math.round((invalidated.length / filtered.length) * 100)
    : 0;

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
        title="Validation des Hypothèses"
        description="Suivi cross-marques de la validation des hypothèses marché"
        backHref="/tarsis"
        backLabel="Retour au tableau Tarsis"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{filtered.length}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-500">{pctValidated}%</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Validées ({validated.length})</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{pctInvalidated}%</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Invalidées ({invalidated.length})</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{toTest.length}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">À tester</p>
        </div>
      </div>

      {/* Progress bar */}
      {filtered.length > 0 && (
        <div className="h-3 rounded-full bg-muted overflow-hidden flex">
          {validated.length > 0 && (
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${pctValidated}%` }}
            />
          )}
          {invalidated.length > 0 && (
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${pctInvalidated}%` }}
            />
          )}
          {toTest.length > 0 && (
            <div
              className="h-full bg-amber-400 transition-all"
              style={{ width: `${100 - pctValidated - pctInvalidated}%` }}
            />
          )}
        </div>
      )}

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
            Toutes ({allHypotheses.length})
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
      {filtered.length === 0 && (
        <EmptyState
          icon={FlaskConical}
          title="Aucune hypothèse détectée"
          description="Les audits T génèrent automatiquement des hypothèses marché."
        />
      )}

      {/* Hypothesis sections */}
      {[
        { title: "Validées", items: validated, emptyMsg: "Aucune hypothèse validée" },
        { title: "À tester", items: toTest, emptyMsg: "Aucune hypothèse en attente" },
        { title: "Invalidées", items: invalidated, emptyMsg: "Aucune hypothèse invalidée" },
      ].map((section) =>
        section.items.length > 0 ? (
          <div key={section.title}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {section.title} ({section.items.length})
            </h2>
            <div className="space-y-2">
              {section.items.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border bg-card p-3"
                >
                  <div className="mt-0.5 shrink-0">{statusIcon(h.status)}</div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium">{h.hypothesis}</p>
                    {h.evidence && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {h.evidence}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/brand/${h.brandId}`}
                        className="text-[10px] text-cyan-600 hover:underline"
                      >
                        {h.brandName}
                      </Link>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusColor(h.status))}>
                        {statusLabel(h.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}
