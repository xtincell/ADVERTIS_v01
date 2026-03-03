// ==========================================================================
// PAGE P.OS6 — Brand OS / Strategy Lab
// Budget simulator — adjust budget, see strategies reconfigure.
// ==========================================================================

"use client";

import { Suspense, useState } from "react";
import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-selector";

function formatBudget(amount: number, currency: string): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Mrd ${currency}`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} M ${currency}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)} K ${currency}`;
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
}

const SCENARIO_PRESETS = [
  { key: "survival", label: "Survie", multiplier: 0.5, color: "#ef4444", description: "Budget minimal — maintien de présence" },
  { key: "growth", label: "Croissance", multiplier: 1.0, color: "#f59e0b", description: "Budget actuel — progression organique" },
  { key: "domination", label: "Domination", multiplier: 2.0, color: "#22c55e", description: "Budget doublé — prise de parts de marché" },
] as const;

function StrategyLabContent() {
  const brandId = useBrandId();
  const [selectedScenario, setSelectedScenario] = useState<string>("growth");
  const [budgetMultiplier, setBudgetMultiplier] = useState(1.0);

  const { data: scenarios, isLoading } = api.brandOS.getScenarios.useQuery(
    { strategyId: brandId! },
    { enabled: !!brandId },
  );

  if (!brandId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      </div>
    );
  }

  const baseBudget = scenarios?.currentBudget ?? 0;
  const currency = scenarios?.currency ?? "XAF";
  const adjustedBudget = Math.round(baseBudget * budgetMultiplier);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Strategy Lab</h1>
        <p className="text-sm text-muted-foreground">Simulez des scénarios en ajustant le budget</p>
      </div>

      {isLoading ? (
        <div className="h-64 bg-muted-foreground/5 rounded-xl animate-pulse" />
      ) : (
        <>
          {/* Budget slider */}
          <div className="rounded-xl border border-border/40 bg-card/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Budget annuel ajusté</span>
              <span className="text-2xl font-black" style={{
                color: budgetMultiplier < 0.7 ? "#ef4444" : budgetMultiplier > 1.5 ? "#22c55e" : "#f59e0b",
              }}>
                {formatBudget(adjustedBudget, currency)}
              </span>
            </div>

            <input
              type="range"
              min={0.1}
              max={3.0}
              step={0.1}
              value={budgetMultiplier}
              onChange={(e) => setBudgetMultiplier(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted-foreground/10 rounded-full appearance-none cursor-pointer accent-amber-500"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatBudget(Math.round(baseBudget * 0.1), currency)}</span>
              <span>{formatBudget(baseBudget, currency)} (actuel)</span>
              <span>{formatBudget(Math.round(baseBudget * 3), currency)}</span>
            </div>
          </div>

          {/* Scenario cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SCENARIO_PRESETS.map((scenario) => (
              <button
                key={scenario.key}
                onClick={() => {
                  setSelectedScenario(scenario.key);
                  setBudgetMultiplier(scenario.multiplier);
                }}
                className={`rounded-xl border p-4 text-left transition-all ${
                  selectedScenario === scenario.key
                    ? "border-amber-500/50 bg-amber-500/5"
                    : "border-border/40 bg-card/30 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                  />
                  <span className="font-bold text-sm">{scenario.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{scenario.description}</p>
                <p className="text-lg font-bold mt-2" style={{ color: scenario.color }}>
                  {formatBudget(Math.round(baseBudget * scenario.multiplier), currency)}
                </p>
              </button>
            ))}
          </div>

          {/* Budget tiers */}
          {scenarios?.tiers && scenarios.tiers.length > 0 && (
            <div className="rounded-xl border border-border/40 bg-card/30 p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Paliers budgétaires
              </h3>
              <div className="space-y-2">
                {scenarios.tiers.map((tier) => {
                  const isActive = adjustedBudget >= tier.minBudget && adjustedBudget <= tier.maxBudget;
                  return (
                    <div
                      key={tier.id}
                      className={`rounded-lg p-3 border transition-all ${
                        isActive ? "border-amber-500/50 bg-amber-500/5" : "border-border/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{tier.tier}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatBudget(tier.minBudget, currency)} — {formatBudget(tier.maxBudget, currency)}
                        </span>
                      </div>
                      {tier.description && (
                        <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Channel allocation (from current channels) */}
          {scenarios?.channels && scenarios.channels.length > 0 && (
            <div className="rounded-xl border border-border/40 bg-card/30 p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Canaux actifs
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {scenarios.channels.map((ch) => (
                  <div key={ch.platform} className="flex items-center gap-2 rounded-lg bg-muted-foreground/5 p-2">
                    <span className="text-sm font-medium">{ch.platform}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {ch.followers.toLocaleString("fr-FR")} abonnés
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function StrategyLabPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Chargement...</div>}>
      <StrategyLabContent />
    </Suspense>
  );
}
