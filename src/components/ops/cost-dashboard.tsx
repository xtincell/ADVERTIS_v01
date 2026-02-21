// ==========================================================================
// C.O6 — Cost Dashboard
// Operational cost overview.
// ==========================================================================

"use client";

/**
 * CostDashboard — AI cost tracking dashboard.
 * Shows: total spend, by mission, by type, monthly trends.
 */

import { DollarSign, TrendingUp, Cpu, Calendar } from "lucide-react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export function CostDashboard() {
  const { data: overview, isLoading } =
    api.marketPricing.getCostSummary.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
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
