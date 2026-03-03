// =============================================================================
// COMP C.ATTRIBUTION — Attribution Dashboard
// =============================================================================
// Channel attribution analysis with summary table, funnel visualization,
// and time series breakdown.
// =============================================================================

"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  ATTRIBUTION_MODELS,
  ATTRIBUTION_CHANNEL_LABELS,
  ATTRIBUTION_CHANNEL_COLORS,
} from "~/lib/constants";
import {
  ArrowRight,
  BarChart3,
  DollarSign,
  MousePointerClick,
  Eye,
  Target,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Granularity = "DAY" | "WEEK" | "MONTH";

// ---------------------------------------------------------------------------
// Funnel step component
// ---------------------------------------------------------------------------
function FunnelStep({
  label,
  value,
  maxValue,
  color,
  icon: Icon,
  isLast,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  isLast?: boolean;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="flex flex-col items-center gap-1 flex-1">
        <div className="flex items-center gap-1.5">
          <span style={{ color }}><Icon className="h-4 w-4" /></span>
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className="w-full h-10 bg-muted/30 rounded-lg overflow-hidden relative">
          <div
            className="h-full rounded-lg transition-all duration-700 flex items-center justify-center"
            style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: `${color}40` }}
          >
            <span className="text-xs font-bold whitespace-nowrap" style={{ color }}>
              {typeof value === "number" && label === "Revenu"
                ? `${value.toLocaleString()} €`
                : value.toLocaleString()}
            </span>
          </div>
        </div>
        {maxValue > 0 && (
          <span className="text-[10px] text-muted-foreground">{pct.toFixed(1)}%</span>
        )}
      </div>
      {!isLast && (
        <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function AttributionDashboard({ strategyId }: { strategyId: string }) {
  const [model, setModel] = useState("LINEAR");
  const [granularity, setGranularity] = useState<Granularity>("DAY");

  const summaryQuery = api.attribution.getChannelSummary.useQuery({
    strategyId,
    model,
  });

  const funnelQuery = api.attribution.getFunnel.useQuery({
    strategyId,
  });

  const timeSeriesQuery = api.attribution.getTimeSeries.useQuery({
    strategyId,
    granularity,
  });

  const summary = summaryQuery.data;
  const funnel = funnelQuery.data;
  const timeSeries = timeSeriesQuery.data ?? [];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Attribution multi-canal</h2>
          <p className="text-sm text-muted-foreground">
            Analyse de la contribution de chaque canal à vos conversions et revenus
          </p>
        </div>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ATTRIBUTION_MODELS).map(([key]) => (
              <SelectItem key={key} value={key}>
                {key.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenu total</p>
              <p className="text-lg font-bold">
                {(summary?.totalRevenue ?? 0).toLocaleString()} €
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conversions</p>
              <p className="text-lg font-bold">
                {(summary?.totalConversions ?? 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Événements</p>
              <p className="text-lg font-bold">
                {(summary?.totalEvents ?? 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Funnel visualization ── */}
      {funnel && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              Funnel de conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-1 overflow-x-auto pb-2">
              <FunnelStep
                label="Impressions"
                value={funnel.impressions}
                maxValue={funnel.impressions}
                color="#6366F1"
                icon={Eye}
              />
              <FunnelStep
                label="Clics"
                value={funnel.clicks}
                maxValue={funnel.impressions}
                color="#3B82F6"
                icon={MousePointerClick}
              />
              <FunnelStep
                label="Engagements"
                value={funnel.engagements}
                maxValue={funnel.impressions}
                color="#8B5CF6"
                icon={Activity}
              />
              <FunnelStep
                label="Conversions"
                value={funnel.conversions}
                maxValue={funnel.impressions}
                color="#10B981"
                icon={Target}
              />
              <FunnelStep
                label="Revenu"
                value={funnel.revenue}
                maxValue={funnel.revenue}
                color="#F59E0B"
                icon={DollarSign}
                isLast
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Channel breakdown table ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            Performance par canal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!summary || summary.channels.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground text-sm">
              <Activity className="h-8 w-8 opacity-40" />
              <p>Aucun événement d&apos;attribution enregistré</p>
              <p className="text-xs">
                Les données apparaîtront ici une fois les événements d&apos;attribution collectés.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Canal</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Impressions</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Clics</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Engagements</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Conversions</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Revenu</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Part</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.channels.map((ch) => {
                    const label =
                      ATTRIBUTION_CHANNEL_LABELS[ch.channel as keyof typeof ATTRIBUTION_CHANNEL_LABELS] ??
                      ch.channel;
                    const color =
                      ATTRIBUTION_CHANNEL_COLORS[ch.channel as keyof typeof ATTRIBUTION_CHANNEL_COLORS] ??
                      "#6B7280";
                    const revShare =
                      summary.totalRevenue > 0
                        ? ((ch.revenue / summary.totalRevenue) * 100).toFixed(1)
                        : "0.0";
                    return (
                      <tr key={ch.channel} className="border-b border-muted/30 hover:bg-muted/20">
                        <td className="py-2 px-2 flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{label}</span>
                        </td>
                        <td className="text-right py-2 px-2 text-muted-foreground">
                          {ch.impressions.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-2 text-muted-foreground">
                          {ch.clicks.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-2 text-muted-foreground">
                          {ch.engagements.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-2 font-medium">
                          {ch.conversions.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-2 font-bold" style={{ color }}>
                          {ch.revenue.toLocaleString()} €
                        </td>
                        <td className="text-right py-2 px-2">
                          <div className="flex items-center gap-1.5 justify-end">
                            <div className="w-12 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${revShare}%`,
                                  backgroundColor: color,
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {revShare}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Time series ── */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Évolution temporelle
          </CardTitle>
          <Select value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAY">Jour</SelectItem>
              <SelectItem value="WEEK">Semaine</SelectItem>
              <SelectItem value="MONTH">Mois</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {timeSeries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune donnée temporelle disponible
            </p>
          ) : (
            <div className="space-y-1.5">
              {timeSeries.slice(-20).map((bucket) => {
                const maxConv = timeSeries.length > 0 ? Math.max(...timeSeries.map((b) => b.conversions), 1) : 1;
                const barWidth = (bucket.conversions / maxConv) * 100;
                return (
                  <div key={bucket.period} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 shrink-0 font-mono">
                      {bucket.period}
                    </span>
                    <div className="flex-1 h-5 bg-muted/20 rounded overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500/60 to-violet-500/40 rounded transition-all duration-500"
                        style={{ width: `${Math.max(barWidth, 2)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono w-8 text-right shrink-0">
                      {bucket.conversions}
                    </span>
                    <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
                      {bucket.revenue.toLocaleString()} €
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
