// =============================================================================
// COMPONENT C.K8b — Budget Simulator
// =============================================================================
// Interactive budget allocation simulator for Pillar I (Implementation).
// 100% client-side — no API calls. Allows users to adjust total budget,
// per-campaign allocation, and production/media/talent breakdown in real time.
// Props: campaigns (annualCalendar), budgetAllocation, currency.
// =============================================================================

"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Sliders,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { SupportedCurrency } from "~/lib/constants";
import { formatCurrency, parseCurrencyString } from "~/lib/currency";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CampaignItem {
  mois: string;
  campagne: string;
  objectif: string;
  budget: string;
  canaux: string[];
  kpiCible: string;
}

interface BudgetPoste {
  poste: string;
  montant: string;
  pourcentage: number;
  justification: string;
}

interface BudgetAllocationData {
  enveloppeGlobale: string;
  parPoste: BudgetPoste[];
  parPhase: { phase: string; montant: string; focus: string }[];
  roiProjections: {
    mois6: string;
    mois12: string;
    mois24: string;
    hypotheses: string;
  };
}

interface BudgetSimulatorProps {
  campaigns: CampaignItem[];
  budgetAllocation: BudgetAllocationData;
  currency: SupportedCurrency;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse all campaign budgets and return array of numeric values */
function parseCampaignBudgets(campaigns: CampaignItem[]): number[] {
  return campaigns.map((c) => parseCurrencyString(c.budget) ?? 0);
}

/** Get budget tier warning color */
function getBudgetHealthColor(ratio: number): string {
  if (ratio >= 0.8) return "#22c55e"; // green — well funded
  if (ratio >= 0.5) return "#eab308"; // yellow — moderate
  if (ratio >= 0.3) return "#f97316"; // orange — under-funded
  return "#ef4444"; // red — critically under-funded
}

function getBudgetHealthLabel(ratio: number): string {
  if (ratio >= 0.8) return "Bien financé";
  if (ratio >= 0.5) return "Modéré";
  if (ratio >= 0.3) return "Sous-financé";
  return "Critique";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BudgetSimulator({
  campaigns,
  budgetAllocation,
  currency,
}: BudgetSimulatorProps) {
  // Parse initial values from AI-generated content
  const initialTotal = useMemo(
    () => parseCurrencyString(budgetAllocation.enveloppeGlobale) ?? 0,
    [budgetAllocation.enveloppeGlobale],
  );

  const initialCampaignBudgets = useMemo(
    () => parseCampaignBudgets(campaigns),
    [campaigns],
  );

  const totalOriginalCampaignBudget = useMemo(
    () => initialCampaignBudgets.reduce((sum, b) => sum + b, 0),
    [initialCampaignBudgets],
  );

  // Parse poste (category) allocations
  const initialPostes = useMemo(
    () =>
      budgetAllocation.parPoste.map((p) => ({
        name: p.poste,
        percentage: p.pourcentage || 0,
        justification: p.justification,
      })),
    [budgetAllocation.parPoste],
  );

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [totalBudget, setTotalBudget] = useState(initialTotal);
  const [campaignWeights, setCampaignWeights] = useState<number[]>(
    () => initialCampaignBudgets.map((b) =>
      totalOriginalCampaignBudget > 0 ? b / totalOriginalCampaignBudget : 1 / Math.max(campaigns.length, 1),
    ),
  );
  const [postePercentages, setPostePercentages] = useState<number[]>(
    () => initialPostes.map((p) => p.percentage),
  );
  const [showDetails, setShowDetails] = useState(false);

  // Slider range: 50% to 200% of initial total (min 100k)
  const sliderMin = Math.max(Math.round(initialTotal * 0.2), 100_000);
  const sliderMax = Math.max(Math.round(initialTotal * 3), 1_000_000);

  // Computed campaign budgets based on weights and total budget
  const computedCampaignBudgets = useMemo(() => {
    const totalWeight = campaignWeights.reduce((s, w) => s + w, 0);
    if (totalWeight === 0) return campaigns.map(() => 0);
    return campaignWeights.map((w) =>
      Math.round((w / totalWeight) * totalBudget),
    );
  }, [campaignWeights, totalBudget, campaigns]);

  // Computed poste budgets
  const computedPosteBudgets = useMemo(() => {
    const totalPct = postePercentages.reduce((s, p) => s + p, 0);
    if (totalPct === 0) return postePercentages.map(() => 0);
    return postePercentages.map((p) =>
      Math.round((p / totalPct) * totalBudget),
    );
  }, [postePercentages, totalBudget]);

  // Budget change ratio for impact indicators
  const budgetRatio = initialTotal > 0 ? totalBudget / initialTotal : 1;

  // Handlers
  const handleTotalChange = useCallback((value: number) => {
    setTotalBudget(Math.max(0, Math.round(value)));
  }, []);

  const handleCampaignWeightChange = useCallback(
    (index: number, newWeight: number) => {
      setCampaignWeights((prev) => {
        const updated = [...prev];
        updated[index] = Math.max(0, newWeight);
        return updated;
      });
    },
    [],
  );

  const handlePostePercentageChange = useCallback(
    (index: number, newPct: number) => {
      setPostePercentages((prev) => {
        const updated = [...prev];
        updated[index] = Math.max(0, Math.min(100, newPct));
        return updated;
      });
    },
    [],
  );

  const resetToOriginal = useCallback(() => {
    setTotalBudget(initialTotal);
    setCampaignWeights(
      initialCampaignBudgets.map((b) =>
        totalOriginalCampaignBudget > 0 ? b / totalOriginalCampaignBudget : 1 / Math.max(campaigns.length, 1),
      ),
    );
    setPostePercentages(initialPostes.map((p) => p.percentage));
  }, [initialTotal, initialCampaignBudgets, totalOriginalCampaignBudget, initialPostes, campaigns.length]);

  if (initialTotal === 0 && campaigns.length === 0) {
    return null;
  }

  const totalPostePercentage = postePercentages.reduce((s, p) => s + p, 0);

  return (
    <div className="space-y-5 rounded-xl border-2 border-dashed border-[#3cc4c4]/30 bg-[#3cc4c4]/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-[#3cc4c4]" />
          <h3 className="text-sm font-bold text-foreground">
            Simulateur Budget Interactif
          </h3>
        </div>
        <button
          onClick={resetToOriginal}
          className="rounded-md border border-[#3cc4c4]/30 bg-white px-3 py-1 text-xs font-medium text-[#3cc4c4] transition-colors hover:bg-[#3cc4c4]/10"
        >
          Réinitialiser
        </button>
      </div>

      {/* ── Total Budget Slider ── */}
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#3cc4c4]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Budget total
            </span>
          </div>
          <div className="flex items-center gap-2">
            {budgetRatio !== 1 && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                style={{
                  backgroundColor: getBudgetHealthColor(budgetRatio),
                }}
              >
                <TrendingUp className="h-3 w-3" />
                {budgetRatio > 1 ? "+" : ""}
                {Math.round((budgetRatio - 1) * 100)}%
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={Math.max(Math.round(initialTotal * 0.01), 10000)}
            value={totalBudget}
            onChange={(e) => handleTotalChange(Number(e.target.value))}
            className="flex-1 h-2 appearance-none rounded-full bg-gray-200 accent-[#3cc4c4] cursor-pointer"
          />
          <div className="w-40 shrink-0">
            <input
              type="text"
              value={formatCurrency(totalBudget, currency)}
              onChange={(e) => {
                const parsed = parseCurrencyString(e.target.value);
                if (parsed !== null) handleTotalChange(parsed);
              }}
              className="w-full rounded-md border bg-white px-2 py-1.5 text-right text-sm font-bold text-[#3cc4c4] focus:outline-none focus:ring-2 focus:ring-[#3cc4c4]/40"
            />
          </div>
        </div>

        {initialTotal > 0 && (
          <p className="mt-1 text-[10px] text-muted-foreground text-right">
            Budget initial recommandé : {formatCurrency(initialTotal, currency)}
          </p>
        )}
      </div>

      {/* ── Per-Campaign Allocation ── */}
      {campaigns.length > 0 && (
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#3cc4c4]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Allocation par campagne
              </span>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDetails ? "Masquer" : "Détails"}
              {showDetails ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>

          <div className="space-y-2">
            {campaigns.map((campaign, i) => {
              const allocated = computedCampaignBudgets[i] ?? 0;
              const originalBudget = initialCampaignBudgets[i] ?? 0;
              const campaignRatio =
                originalBudget > 0 ? allocated / originalBudget : 1;
              const maxWeight = Math.max(...campaignWeights, 0.01);

              return (
                <div key={i} className="group">
                  <div className="flex items-center gap-3">
                    {/* Month label */}
                    <span className="w-12 shrink-0 text-[10px] font-bold uppercase text-[#3cc4c4]">
                      {campaign.mois.substring(0, 4)}
                    </span>

                    {/* Campaign name */}
                    <span className="w-32 shrink-0 truncate text-xs font-medium text-foreground">
                      {campaign.campagne}
                    </span>

                    {/* Weight slider */}
                    <input
                      type="range"
                      min={0}
                      max={maxWeight * 2}
                      step={maxWeight * 0.01}
                      value={campaignWeights[i] ?? 0}
                      onChange={(e) =>
                        handleCampaignWeightChange(i, Number(e.target.value))
                      }
                      className="flex-1 h-1.5 appearance-none rounded-full bg-gray-200 accent-[#3cc4c4] cursor-pointer"
                    />

                    {/* Allocated amount */}
                    <span className="w-28 shrink-0 text-right text-xs font-bold text-foreground">
                      {formatCurrency(allocated, currency)}
                    </span>

                    {/* Health indicator */}
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: getBudgetHealthColor(campaignRatio),
                      }}
                      title={getBudgetHealthLabel(campaignRatio)}
                    />
                  </div>

                  {/* Expanded details */}
                  {showDetails && (
                    <div className="ml-12 mt-1 mb-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>
                        Original : {formatCurrency(originalBudget, currency)}
                      </span>
                      <span>
                        Variation :{" "}
                        <span
                          style={{
                            color: getBudgetHealthColor(campaignRatio),
                          }}
                          className="font-semibold"
                        >
                          {campaignRatio > 1 ? "+" : ""}
                          {Math.round((campaignRatio - 1) * 100)}%
                        </span>
                      </span>
                      {campaign.objectif && (
                        <span className="truncate max-w-xs">
                          Objectif : {campaign.objectif}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Category Breakdown (postes) ── */}
      {initialPostes.length > 0 && (
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="h-4 w-4 text-[#3cc4c4]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ventilation par poste
            </span>
            {Math.abs(totalPostePercentage - 100) > 1 && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                Total : {Math.round(totalPostePercentage)}%
              </span>
            )}
          </div>

          <div className="space-y-3">
            {initialPostes.map((poste, i) => (
              <div key={i}>
                <div className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-xs font-medium text-foreground">
                    {poste.name}
                  </span>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={postePercentages[i] ?? 0}
                    onChange={(e) =>
                      handlePostePercentageChange(i, Number(e.target.value))
                    }
                    className="flex-1 h-1.5 appearance-none rounded-full bg-gray-200 accent-[#3cc4c4] cursor-pointer"
                  />

                  <span className="w-10 shrink-0 text-right text-xs font-bold text-[#3cc4c4]">
                    {Math.round(postePercentages[i] ?? 0)}%
                  </span>

                  <span className="w-28 shrink-0 text-right text-xs font-semibold text-foreground">
                    {formatCurrency(computedPosteBudgets[i] ?? 0, currency)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-1 ml-40 mr-40 h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(postePercentages[i] ?? 0, 100)}%`,
                      backgroundColor: "#3cc4c4",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Impact Summary ── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[140px] rounded-lg border bg-white p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Budget simulé
          </p>
          <p className="mt-1 text-lg font-bold text-[#3cc4c4]">
            {formatCurrency(totalBudget, currency)}
          </p>
        </div>

        <div className="flex-1 min-w-[140px] rounded-lg border bg-white p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Variation
          </p>
          <p
            className="mt-1 text-lg font-bold"
            style={{ color: getBudgetHealthColor(budgetRatio) }}
          >
            {budgetRatio >= 1 ? "+" : ""}
            {Math.round((budgetRatio - 1) * 100)}%
          </p>
        </div>

        <div className="flex-1 min-w-[140px] rounded-lg border bg-white p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Moy. / campagne
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {campaigns.length > 0
              ? formatCurrency(
                  Math.round(totalBudget / campaigns.length),
                  currency,
                )
              : "—"}
          </p>
        </div>

        <div className="flex-1 min-w-[140px] rounded-lg border bg-white p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Niveau
          </p>
          <p
            className="mt-1 text-lg font-bold"
            style={{ color: getBudgetHealthColor(budgetRatio) }}
          >
            {getBudgetHealthLabel(budgetRatio)}
          </p>
        </div>
      </div>
    </div>
  );
}
