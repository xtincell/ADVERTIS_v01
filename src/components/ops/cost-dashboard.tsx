// ==========================================================================
// C.O6 — Cost Dashboard
// Operational cost overview with per-brand breakdown.
// ==========================================================================

"use client";

/**
 * CostDashboard — AI cost tracking dashboard.
 * Shows: total spend, by mission, by type, monthly trends, per-brand breakdown.
 */

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Cpu,
  Calendar,
  Building2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type CostTab = "global" | "brands";

export function CostDashboard() {
  const [activeTab, setActiveTab] = useState<CostTab>("global");

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setActiveTab("global")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "global"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Vue globale
        </button>
        <button
          onClick={() => setActiveTab("brands")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "brands"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="mr-1.5 inline h-3.5 w-3.5" />
          Par marque
        </button>
      </div>

      {activeTab === "global" ? <GlobalCostView /> : <BrandCostView />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Global Cost View (existing)
// ---------------------------------------------------------------------------

function GlobalCostView() {
  const { data: overview, isLoading } =
    api.marketPricing.getCostSummary.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-float text-muted-foreground">
          Chargement des données de coûts...
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total USD</span>
            </div>
            <div className="mt-1 text-2xl font-bold">
              ${fmt(overview.totalCostUsd)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total XAF</span>
            </div>
            <div className="mt-1 text-2xl font-bold">
              {fmt(overview.totalCostXaf)} F
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="h-4 w-4" />
              <span className="text-xs">Appels IA</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{overview.callCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Coût moyen/appel</span>
            </div>
            <div className="mt-1 text-2xl font-bold">
              ${overview.avgCostPerCall.toFixed(4)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Par type de génération</CardTitle>
        </CardHeader>
        <CardContent>
          {overview.byType.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Aucune donnée.
            </p>
          ) : (
            <div className="space-y-2">
              {overview.byType.map((entry) => {
                const pct =
                  overview.totalCostUsd > 0
                    ? (entry.costUsd / overview.totalCostUsd) * 100
                    : 0;
                return (
                  <div key={entry.type} className="flex items-center gap-3">
                    <div className="w-32 truncate text-sm">{entry.type}</div>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right text-xs text-muted-foreground">
                      ${fmt(entry.costUsd)}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {entry.count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* By Month */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Tendance mensuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overview.byMonth.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Aucune donnée mensuelle.
            </p>
          ) : (
            <div className="space-y-2">
              {overview.byMonth.map((entry) => {
                const maxCost = Math.max(
                  ...overview.byMonth.map((m) => m.costUsd),
                );
                const pct = maxCost > 0 ? (entry.costUsd / maxCost) * 100 : 0;
                return (
                  <div key={entry.month} className="flex items-center gap-3">
                    <div className="w-20 text-sm">{entry.month}</div>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right text-xs text-muted-foreground">
                      ${fmt(entry.costUsd)} ({entry.count})
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Summary */}
      <Card>
        <CardContent className="flex gap-8 py-4 text-sm">
          <div>
            <span className="text-muted-foreground">Tokens entrants : </span>
            <span className="font-medium">
              {fmt(overview.totalTokensIn)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Tokens sortants : </span>
            <span className="font-medium">
              {fmt(overview.totalTokensOut)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brand Cost View (new)
// ---------------------------------------------------------------------------

function BrandCostView() {
  const { data: brands, isLoading } =
    api.marketPricing.getCostBreakdownByBrand.useQuery();
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-float text-muted-foreground">
          Chargement des coûts par marque...
        </div>
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Aucun coût IA enregistré. Les coûts apparaîtront après la première génération de pilier.
        </CardContent>
      </Card>
    );
  }

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));
  const totalUsd = brands.reduce((sum, b) => sum + b.costUsd, 0);

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-xs">Marques actives</span>
            </div>
            <div className="mt-1 text-2xl font-bold">
              {brands.filter((b) => b.strategyId !== null).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total USD</span>
            </div>
            <div className="mt-1 text-2xl font-bold">${fmt(totalUsd)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="h-4 w-4" />
              <span className="text-xs">Total appels</span>
            </div>
            <div className="mt-1 text-2xl font-bold">
              {brands.reduce((sum, b) => sum + b.callCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Coûts par marque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Header */}
            <div className="flex items-center gap-3 border-b pb-2 text-xs font-medium text-muted-foreground">
              <div className="w-6" />
              <div className="flex-1">Marque</div>
              <div className="w-20 text-right">USD</div>
              <div className="w-24 text-right">XAF</div>
              <div className="w-16 text-right">Appels</div>
              <div className="w-16 text-right">%</div>
            </div>

            {brands.map((brand) => {
              const pct = totalUsd > 0 ? (brand.costUsd / totalUsd) * 100 : 0;
              const key = brand.strategyId ?? "__unattributed__";
              const isExpanded = expandedBrand === key;

              return (
                <div key={key}>
                  {/* Brand Row */}
                  <button
                    onClick={() => setExpandedBrand(isExpanded ? null : key)}
                    className="flex w-full items-center gap-3 rounded-md px-1 py-2 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="w-6 text-muted-foreground">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{brand.brandName}</span>
                      {brand.sector && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {brand.sector}
                        </span>
                      )}
                    </div>
                    <div className="w-20 text-right text-sm font-medium">
                      ${fmt(brand.costUsd)}
                    </div>
                    <div className="w-24 text-right text-xs text-muted-foreground">
                      {fmt(brand.costXaf)} F
                    </div>
                    <div className="w-16 text-right">
                      <Badge variant="secondary" className="text-xs">
                        {brand.callCount}
                      </Badge>
                    </div>
                    <div className="w-16 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail: by generation type */}
                  {isExpanded && brand.byType.length > 0 && (
                    <div className="ml-9 mb-2 space-y-1 rounded-md bg-muted/30 p-3">
                      <div className="mb-2 text-xs font-medium text-muted-foreground">
                        Détail par type de génération
                      </div>
                      {brand.byType.map((t) => {
                        const typePct =
                          brand.costUsd > 0
                            ? (t.costUsd / brand.costUsd) * 100
                            : 0;
                        return (
                          <div
                            key={t.type}
                            className="flex items-center gap-3 text-xs"
                          >
                            <div className="w-40 truncate text-muted-foreground">
                              {t.type}
                            </div>
                            <div className="flex-1">
                              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary/60"
                                  style={{ width: `${typePct}%` }}
                                />
                              </div>
                            </div>
                            <div className="w-16 text-right text-muted-foreground">
                              ${t.costUsd.toFixed(4)}
                            </div>
                            <Badge variant="outline" className="text-[10px]">
                              {t.count}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
