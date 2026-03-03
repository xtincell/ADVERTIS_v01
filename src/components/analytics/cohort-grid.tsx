// =============================================================================
// COMP C.COHORT — Cohort Analysis Grid
// =============================================================================
// Retention heatmap grid + LTV evolution chart.
// Displays cohort-based retention curves in a matrix view.
// =============================================================================

"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type PeriodType = "WEEKLY" | "MONTHLY" | "QUARTERLY";

// ---------------------------------------------------------------------------
// Retention cell color
// ---------------------------------------------------------------------------
function retentionColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-500/80 text-white";
  if (pct >= 60) return "bg-emerald-500/50 text-white";
  if (pct >= 40) return "bg-amber-500/50 text-white";
  if (pct >= 20) return "bg-orange-500/50 text-white";
  if (pct > 0) return "bg-red-500/40 text-white";
  return "bg-muted/30 text-muted-foreground";
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function CohortGrid({ strategyId }: { strategyId: string }) {
  const [periodType, setPeriodType] = useState<PeriodType>("MONTHLY");

  const gridQuery = api.cohort.getRetentionGrid.useQuery({
    strategyId,
    periodType,
  });

  const ltvQuery = api.cohort.getLtvEvolution.useQuery({
    strategyId,
    periodType,
  });

  const data = gridQuery.data;
  const ltvData = ltvQuery.data ?? [];

  // ── Compute summary stats ──
  const totalAcquired = data?.cohorts.reduce((s, c) => s + c.acquired, 0) ?? 0;
  const avgLtv =
    ltvData.length > 0
      ? ltvData.reduce((s, c) => s + c.avgLtv, 0) / ltvData.length
      : 0;
  const avgChurn =
    ltvData.length > 0
      ? ltvData.reduce((s, c) => s + c.churnRate, 0) / ltvData.length
      : 0;
  const totalRevenue = ltvData.reduce((s, c) => s + c.totalRevenue, 0);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Analyse de cohortes</h2>
          <p className="text-sm text-muted-foreground">
            Rétention, LTV et churn par période d&apos;acquisition
          </p>
        </div>
        <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
            <SelectItem value="MONTHLY">Mensuel</SelectItem>
            <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Acquis total</p>
              <p className="text-lg font-bold">{totalAcquired.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">LTV moyen</p>
              <p className="text-lg font-bold">{avgLtv.toFixed(0)} €</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Churn moyen</p>
              <p className="text-lg font-bold">{(avgChurn * 100).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenu total</p>
              <p className="text-lg font-bold">{totalRevenue.toLocaleString()} €</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Retention heatmap grid ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-violet-500" />
            Matrice de rétention
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.cohorts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground text-sm">
              <Activity className="h-8 w-8 opacity-40" />
              <p>Aucune donnée de cohorte disponible</p>
              <p className="text-xs">
                Les snapshots de cohorte seront affichés ici une fois créés.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground min-w-[100px]">
                      Cohorte
                    </th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground min-w-[60px]">
                      Acquis
                    </th>
                    {Array.from(
                      { length: data.cohorts.length > 0 ? Math.max(...data.cohorts.map((c) => c.retentionCurve.length), 0) : 0 },
                      (_, i) => (
                        <th
                          key={i}
                          className="text-center py-2 px-1 font-medium text-muted-foreground min-w-[48px]"
                        >
                          P{i}
                        </th>
                      ),
                    )}
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground min-w-[60px]">
                      LTV
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.cohorts.map((cohort) => (
                    <tr key={cohort.cohortPeriod} className="border-t border-muted/30">
                      <td className="py-1.5 px-2 font-medium">{cohort.cohortPeriod}</td>
                      <td className="text-center py-1.5 px-2 text-muted-foreground">
                        {cohort.acquired}
                      </td>
                      {cohort.retentionCurve.map((pct, idx) => (
                        <td key={idx} className="py-1 px-0.5">
                          <div
                            className={cn(
                              "rounded px-1.5 py-1 text-center font-mono text-[10px]",
                              retentionColor(pct),
                            )}
                          >
                            {pct}%
                          </div>
                        </td>
                      ))}
                      {/* Fill empty cells if this cohort has fewer periods */}
                      {Array.from(
                        {
                          length:
                            Math.max(...data.cohorts.map((c) => c.retentionCurve.length), 0) -
                            cohort.retentionCurve.length,
                        },
                        (_, i) => (
                          <td key={`empty-${i}`} className="py-1 px-0.5">
                            <div className="rounded px-1.5 py-1 text-center text-[10px] text-muted-foreground/30">
                              —
                            </div>
                          </td>
                        ),
                      )}
                      <td className="text-center py-1.5 px-2 font-medium">
                        {cohort.avgLtv.toFixed(0)} €
                      </td>
                    </tr>
                  ))}
                  {/* Average row */}
                  <tr className="border-t-2 border-primary/20 bg-muted/20">
                    <td className="py-1.5 px-2 font-bold text-muted-foreground">Moyenne</td>
                    <td className="text-center py-1.5 px-2 text-muted-foreground">—</td>
                    {data.avgRetention.map((pct, idx) => (
                      <td key={idx} className="py-1 px-0.5">
                        <div
                          className={cn(
                            "rounded px-1.5 py-1 text-center font-mono text-[10px] font-bold",
                            retentionColor(pct),
                          )}
                        >
                          {pct}%
                        </div>
                      </td>
                    ))}
                    <td className="text-center py-1.5 px-2 font-bold">
                      {avgLtv.toFixed(0)} €
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── LTV Evolution ── */}
      {ltvData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Évolution LTV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ltvData.map((cohort) => {
                const maxLtv = ltvData.length > 0 ? Math.max(...ltvData.map((c) => c.avgLtv), 1) : 1;
                const barWidth = (cohort.avgLtv / maxLtv) * 100;
                return (
                  <div key={cohort.cohortPeriod} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 shrink-0">
                      {cohort.cohortPeriod}
                    </span>
                    <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500/70 to-emerald-500/40 rounded transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-mono">
                        {cohort.avgLtv.toFixed(0)} €
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
                      {(cohort.churnRate * 100).toFixed(1)}% churn
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
