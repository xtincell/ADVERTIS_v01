// ==========================================================================
// C.OS7 — Executive Summary
// The CEO/CMO view: 4 key metrics + top actions + AI synthesis.
// ==========================================================================

"use client";

import { getCultTier, CULT_TIERS } from "~/lib/types/brand-os";
import { CultIndexGauge } from "./cult-index-gauge";

interface ExecutiveData {
  brandName: string;
  cultIndex: number;
  cultIndexPrev: number | null;
  cultIndexTrend: number | null;
  superfanCount: number;
  communityHealth: number | null;
  communityGrowth: number | null;
  sentiment: number | null;
  coherenceScore: number | null;
  topActions: Array<{ id: string; title: string; priority: string; category: string }>;
  opportunityCount: number;
  channelCount: number;
  budget: number | null;
  currency: string;
}

interface ExecutiveSummaryProps {
  data: ExecutiveData;
}

function formatCurrency(amount: number, currency: string): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}Mrd ${currency}`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ${currency}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K ${currency}`;
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
}

function TrendArrow({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground/50 text-xs">—</span>;
  const color = value > 0 ? "#22c55e" : value < 0 ? "#ef4444" : "#6b7280";
  const arrow = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  return (
    <span className="text-xs font-medium" style={{ color }}>
      {value > 0 ? "+" : ""}{value.toFixed(1)} {arrow}
    </span>
  );
}

export function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  const tier = getCultTier(data.cultIndex);
  const tierConfig = CULT_TIERS[tier];

  return (
    <div className="space-y-6">
      {/* Brand name + Cult Index hero */}
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Cult Index Gauge — center stage */}
        <CultIndexGauge
          score={data.cultIndex}
          trend={data.cultIndexTrend}
          size="xl"
        />

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-4 flex-1 w-full max-w-md">
          {/* Superfan Count */}
          <div className="rounded-xl border border-border/40 bg-card/30 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Superfans</p>
            <p className="text-2xl font-black tabular-nums">{data.superfanCount.toLocaleString("fr-FR")}</p>
          </div>

          {/* Community Health */}
          <div className="rounded-xl border border-border/40 bg-card/30 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Santé communauté</p>
            <p className="text-2xl font-black tabular-nums">
              {data.communityHealth != null ? `${Math.round(data.communityHealth)}` : "—"}
              <span className="text-sm text-muted-foreground font-normal">/100</span>
            </p>
            <TrendArrow value={data.communityGrowth} />
          </div>

          {/* Coherence */}
          <div className="rounded-xl border border-border/40 bg-card/30 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Cohérence</p>
            <p className="text-2xl font-black tabular-nums">
              {data.coherenceScore ?? "—"}
              <span className="text-sm text-muted-foreground font-normal">/100</span>
            </p>
          </div>

          {/* Active channels */}
          <div className="rounded-xl border border-border/40 bg-card/30 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Canaux actifs</p>
            <p className="text-2xl font-black tabular-nums">{data.channelCount}</p>
            <p className="text-xs text-muted-foreground">{data.opportunityCount} opportunités</p>
          </div>
        </div>
      </div>

      {/* Top 3 Actions */}
      {data.topActions.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Actions prioritaires cette semaine
          </h3>
          <div className="space-y-2">
            {data.topActions.map((action, i) => (
              <div key={action.id} className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: `${tierConfig.color}20`,
                    color: tierConfig.color,
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-sm">{action.title}</span>
                <span className={`text-[10px] ml-auto shrink-0 ${
                  action.priority === "P0" ? "text-red-500" : "text-muted-foreground"
                }`}>
                  {action.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget indicator */}
      {data.budget != null && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Budget annuel:</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(data.budget, data.currency)}
          </span>
        </div>
      )}
    </div>
  );
}
