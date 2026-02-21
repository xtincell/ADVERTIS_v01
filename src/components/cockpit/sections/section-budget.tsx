// =============================================================================
// COMPONENT C.K14 — Section Budget
// =============================================================================
// Budget tier management display for the cockpit.
// Props: strategyId.
// Key features: 5-tier budget grid (MICRO, STARTER, IMPACT, CAMPAIGN,
// DOMINATION) with gradient-colored cards, budget range display, channel
// allocation percentages, KPI targets per tier, seed/reset defaults via tRPC
// mutation, loading and empty states.
// =============================================================================

"use client";

// Section Budget — Budget Tiers display
// 5 columns (one per tier): label, budget range, channels + allocation %, KPIs
// "Initialize defaults" button

import { useState } from "react";
import {
  DollarSign,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { BUDGET_TIER_CONFIG } from "~/lib/constants";
import { CockpitSection } from "../cockpit-shared";

// ---------------------------------------------------------------------------
// Tier gradient colors
// ---------------------------------------------------------------------------

const TIER_GRADIENTS: Record<string, string> = {
  MICRO: "from-gray-50 to-gray-100 border-gray-200",
  STARTER: "from-blue-50 to-blue-100 border-blue-200",
  IMPACT: "from-emerald-50 to-emerald-100 border-emerald-200",
  CAMPAIGN: "from-purple-50 to-purple-100 border-purple-200",
  DOMINATION: "from-amber-50 to-amber-100 border-amber-200",
};

const TIER_ACCENT: Record<string, string> = {
  MICRO: "text-gray-600",
  STARTER: "text-blue-600",
  IMPACT: "text-emerald-600",
  CAMPAIGN: "text-purple-600",
  DOMINATION: "text-amber-600",
};

// ---------------------------------------------------------------------------
// SectionBudget
// ---------------------------------------------------------------------------

export function SectionBudget({ strategyId }: { strategyId: string }) {
  const { data: tiers, isLoading, refetch } = api.marketContext.budgetTiers.getByStrategy.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const seedMutation = api.marketContext.budgetTiers.seedDefaults.useMutation({
    onSuccess: () => void refetch(),
  });

  const totalTiers = tiers?.length ?? 0;

  if (isLoading) {
    return (
      <CockpitSection
        icon={<DollarSign className="h-5 w-5" />}
        pillarLetter="I"
        title="Paliers Budgétaires"
        subtitle="Chargement…"
        color="#2e86ab"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  return (
    <CockpitSection
      icon={<DollarSign className="h-5 w-5" />}
      pillarLetter="I"
      title="Paliers Budgétaires"
      subtitle={totalTiers > 0 ? `${totalTiers} palier${totalTiers > 1 ? "s" : ""} configuré${totalTiers > 1 ? "s" : ""}` : "Non configuré"}
      color="#2e86ab"
    >
      <div className="space-y-4">
        {totalTiers > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {tiers?.map((tier) => (
              <BudgetTierCard key={tier.id} tier={tier} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <DollarSign className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Aucun palier budgétaire configuré.
            </p>
            <button
              onClick={() => seedMutation.mutate({ strategyId })}
              disabled={seedMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta/90 transition-colors"
            >
              {seedMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Initialiser les 5 paliers par défaut
            </button>
          </div>
        )}

        {/* Reset button */}
        {totalTiers > 0 && (
          <button
            onClick={() => seedMutation.mutate({ strategyId })}
            disabled={seedMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {seedMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCcw className="h-3 w-3" />
            )}
            Réinitialiser les paliers
          </button>
        )}
      </div>
    </CockpitSection>
  );
}

// ---------------------------------------------------------------------------
// Budget Tier Card
// ---------------------------------------------------------------------------

function BudgetTierCard({
  tier,
}: {
  tier: {
    id: string;
    tier: string;
    minBudget: number;
    maxBudget: number;
    channels: unknown;
    kpis: unknown;
    description: string | null;
  };
}) {
  const config = BUDGET_TIER_CONFIG[tier.tier as keyof typeof BUDGET_TIER_CONFIG];
  const gradient = TIER_GRADIENTS[tier.tier] ?? TIER_GRADIENTS.MICRO!;
  const accent = TIER_ACCENT[tier.tier] ?? TIER_ACCENT.MICRO!;

  const channels = Array.isArray(tier.channels) ? tier.channels : [];
  const kpis = Array.isArray(tier.kpis) ? tier.kpis : [];

  const formatBudget = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
    return `${n}`;
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-b p-3 shadow-sm",
        gradient,
      )}
    >
      {/* Header */}
      <div className="mb-2">
        <p className={cn("text-[10px] font-bold uppercase tracking-wider", accent)}>
          {config?.label ?? tier.tier}
        </p>
        <p className="text-lg font-bold mt-0.5">
          {formatBudget(tier.minBudget)}€ – {formatBudget(tier.maxBudget)}€
        </p>
        {tier.description && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {tier.description}
          </p>
        )}
      </div>

      {/* Channels */}
      {channels.length > 0 && (
        <div className="mb-2">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase mb-1">
            Canaux
          </p>
          <div className="space-y-0.5">
            {(channels as Array<{ channel: string; allocation: number }>).map(
              (ch, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className="truncate">{ch.channel}</span>
                  <span className={cn("font-semibold", accent)}>
                    {ch.allocation}%
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* KPIs */}
      {kpis.length > 0 && (
        <div className="border-t pt-1.5 mt-1.5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase mb-1">
            KPIs
          </p>
          <div className="space-y-0.5">
            {(kpis as Array<{ kpi: string; target: string }>).map((kpi, i) => (
              <div key={i} className="text-[10px]">
                <span className="font-medium">{kpi.kpi}</span>
                <span className="text-muted-foreground ml-1">→ {kpi.target}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
