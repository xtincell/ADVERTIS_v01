// ==========================================================================
// PAGE P.R1 — Risk Portrait
// Cross-brand risk visualization: scores, SWOT, probability×impact matrix,
// mitigation priorities. Parses pillar R content per brand client-side.
// ==========================================================================

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type { RiskAuditResult } from "~/lib/types/pillar-schemas";
import {
  ScoreCircle,
  getRiskLevel,
  RiskLevelBadge,
} from "~/components/cockpit/cockpit-shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BrandRisk = {
  id: string;
  brandName: string;
  sectorLabel: string;
  riskScore: number;
  riskLevel: { label: string; color: string };
  globalSwot: RiskAuditResult["globalSwot"];
  topRisks: RiskAuditResult["probabilityImpactMatrix"];
  topMitigations: RiskAuditResult["mitigationPriorities"];
  summary: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function urgencyLabel(u: string): string {
  switch (u) {
    case "immediate": return "Immédiat";
    case "short_term": return "Court terme";
    case "medium_term": return "Moyen terme";
    default: return u;
  }
}

function urgencyColor(u: string): string {
  switch (u) {
    case "immediate": return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300";
    case "short_term": return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    default: return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
  }
}

function priorityColor(p: number): string {
  if (p <= 1) return "bg-red-500";
  if (p <= 2) return "bg-orange-500";
  if (p <= 3) return "bg-amber-500";
  if (p <= 4) return "bg-blue-500";
  return "bg-emerald-500";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RiskPortraitPage() {
  const { data: overview, isLoading, isError, refetch } =
    api.analytics.getAgencyOverview.useQuery();

  // Parse R pillar content for each brand
  const brandRisks = useMemo<BrandRisk[]>(() => {
    if (!overview?.brands) return [];

    return overview.brands
      .map((brand) => {
        const rPillar = brand.pillars.find((p) => p.type === "R");
        if (!rPillar?.content || rPillar.status !== "complete") return null;

        const { data: rContent } = parsePillarContent<RiskAuditResult>(
          "R",
          rPillar.content,
        );
        if (!rContent) return null;

        return {
          id: brand.id,
          brandName: brand.brandName,
          sectorLabel: brand.sectorLabel,
          riskScore: rContent.riskScore,
          riskLevel: getRiskLevel(rContent.riskScore),
          globalSwot: rContent.globalSwot,
          topRisks: rContent.probabilityImpactMatrix
            .slice()
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 5),
          topMitigations: rContent.mitigationPriorities.slice(0, 3),
          summary: rContent.summary,
        } satisfies BrandRisk;
      })
      .filter((b): b is BrandRisk => b !== null)
      .sort((a, b) => b.riskScore - a.riskScore); // Highest risk first
  }, [overview?.brands]);

  // Aggregates
  const aggregates = useMemo(() => {
    if (brandRisks.length === 0)
      return { avg: 0, high: 0, medium: 0, low: 0, total: 0 };
    const scores = brandRisks.map((b) => b.riskScore);
    return {
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      high: brandRisks.filter((b) => b.riskScore >= 70).length,
      medium: brandRisks.filter((b) => b.riskScore >= 40 && b.riskScore < 70).length,
      low: brandRisks.filter((b) => b.riskScore < 40).length,
      total: brandRisks.length,
    };
  }, [brandRisks]);

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
          Impossible de charger le portrait risques
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
          <h1 className="text-xl font-semibold">Portrait Risques</h1>
          <p className="text-sm text-muted-foreground">
            Visualisation des risques par marque
          </p>
        </div>
      </div>

      {/* Aggregate KPIs */}
      {brandRisks.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{aggregates.avg}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Risque moyen
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{aggregates.high}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Risque élevé
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{aggregates.medium}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Risque modéré
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{aggregates.low}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Risque faible
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {brandRisks.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Shield className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Aucune marque n&apos;a de données de risque. Lancez un audit R pour
            vos marques.
          </p>
        </div>
      )}

      {/* Brand risk cards */}
      <div className="space-y-4">
        {brandRisks.map((brand) => (
          <div
            key={brand.id}
            className="rounded-xl border bg-card overflow-hidden"
          >
            {/* Card header */}
            <Link
              href={`/brand/${brand.id}`}
              className="flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <ScoreCircle score={brand.riskScore} label="Risque" size="sm" invertForRisk />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-sm">
                  {brand.brandName}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {brand.sectorLabel} · {brand.riskLevel.label}
                </p>
              </div>
              {brand.riskScore >= 70 ? (
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
              ) : brand.riskScore >= 40 ? (
                <Shield className="h-5 w-5 shrink-0 text-amber-500" />
              ) : (
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
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

              {/* SWOT mini */}
              {(brand.globalSwot.strengths.length > 0 ||
                brand.globalSwot.weaknesses.length > 0 ||
                brand.globalSwot.opportunities.length > 0 ||
                brand.globalSwot.threats.length > 0) && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Forces", items: brand.globalSwot.strengths, color: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30" },
                    { label: "Faiblesses", items: brand.globalSwot.weaknesses, color: "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30" },
                    { label: "Opportunités", items: brand.globalSwot.opportunities, color: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30" },
                    { label: "Menaces", items: brand.globalSwot.threats, color: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30" },
                  ].map((q) =>
                    q.items.length > 0 ? (
                      <div key={q.label} className={cn("rounded-lg border p-2.5", q.color)}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                          {q.label}
                        </p>
                        <ul className="space-y-0.5">
                          {q.items.slice(0, 3).map((item, i) => (
                            <li key={i} className="text-xs leading-tight truncate">
                              {item}
                            </li>
                          ))}
                          {q.items.length > 3 && (
                            <li className="text-[10px] text-muted-foreground">
                              +{q.items.length - 3} autres
                            </li>
                          )}
                        </ul>
                      </div>
                    ) : null,
                  )}
                </div>
              )}

              {/* Top risks (P×I matrix) */}
              {brand.topRisks.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Risques prioritaires
                  </p>
                  <div className="space-y-1.5">
                    {brand.topRisks.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2"
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                            priorityColor(r.priority),
                          )}
                        >
                          {r.priority}
                        </span>
                        <span className="min-w-0 flex-1 text-xs truncate">
                          {r.risk}
                        </span>
                        <RiskLevelBadge level={r.probability} />
                        <RiskLevelBadge level={r.impact} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top mitigations */}
              {brand.topMitigations.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Actions de mitigation
                  </p>
                  <div className="space-y-1.5">
                    {brand.topMitigations.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-lg border bg-muted/20 px-3 py-2"
                      >
                        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium">{m.risk}</p>
                          <p className="text-[11px] text-muted-foreground">{m.action}</p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            urgencyColor(m.urgency),
                          )}
                        >
                          {urgencyLabel(m.urgency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
