// Agency KPI Bar — 5 top-level KPI cards for the agency dashboard.

"use client";

import {
  BarChart3,
  Target,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { CoherenceGauge } from "~/components/analytics/coherence-gauge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgencyKpiBarProps {
  totalBrands: number;
  avgCoherence: number;
  avgRisk: number;
  avgBrandMarketFit: number;
  completionRate: number;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Sub-component: single KPI card
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-gradient-to-b from-card to-muted/30 transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col items-center gap-2 pt-5 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">
            {label}
          </span>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AgencyKpiBar({
  totalBrands,
  avgCoherence,
  avgRisk,
  avgBrandMarketFit,
  completionRate,
}: AgencyKpiBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {/* Total brands */}
      <KpiCard label="Marques" icon={BarChart3}>
        <span className="text-3xl font-bold tracking-tight">{totalBrands}</span>
      </KpiCard>

      {/* Avg coherence */}
      <KpiCard label="Cohérence moy." icon={Target}>
        <CoherenceGauge score={avgCoherence} size="sm" />
      </KpiCard>

      {/* Avg risk */}
      <KpiCard label="Risque moy." icon={ShieldAlert}>
        <CoherenceGauge score={avgRisk} size="sm" />
      </KpiCard>

      {/* Avg BMF */}
      <KpiCard label="BMF moy." icon={Sparkles}>
        <CoherenceGauge score={avgBrandMarketFit} size="sm" />
      </KpiCard>

      {/* Completion rate */}
      <KpiCard label="Complétion" icon={TrendingUp}>
        <span className="text-3xl font-bold tracking-tight">
          {completionRate}
          <span className="text-lg text-muted-foreground">%</span>
        </span>
      </KpiCard>
    </div>
  );
}
