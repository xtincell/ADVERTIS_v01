// =============================================================================
// COMPONENT C.K8c — Campaign Plan Simulator
// =============================================================================
// Interactive 5-panel campaign plan generator powered by budget tiers,
// media-mix calculator, and AI-generated campaign proposals.
// Replaces the basic BudgetSimulator with tier-driven dynamic planning.
// =============================================================================

"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Sliders,
  DollarSign,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  Zap,
  Target,
  Layers,
  Award,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import type { SupportedCurrency } from "~/lib/constants";
import { BUDGET_TIER_CONFIG, type BudgetTierType } from "~/lib/constants";
import { formatCurrency, parseCurrencyString } from "~/lib/currency";
import {
  CampaignProposalSheet,
  type EnrichedCampaignItem,
  type CampaignTemplate,
  type ActivationPlan,
  type CopyStrategy,
  type BigIdea,
  type ActivationDispositif,
} from "./campaign-proposal-sheet";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface CampaignPlanSimulatorProps {
  campaigns: EnrichedCampaignItem[];
  budgetAllocation: BudgetAllocationData;
  currency: SupportedCurrency;
  strategyId?: string;
  campaignTemplates?: CampaignTemplate[];
  activationPlan?: ActivationPlan;
  copyStrategy?: CopyStrategy;
  bigIdea?: BigIdea;
  activationDispositif?: ActivationDispositif;
}

// ---------------------------------------------------------------------------
// Tier Card Component
// ---------------------------------------------------------------------------

const TIER_GRADIENTS: Record<string, string> = {
  MICRO: "from-slate-50 to-slate-100 border-slate-200",
  STARTER: "from-blue-50 to-blue-100 border-blue-200",
  IMPACT: "from-emerald-50 to-emerald-100 border-emerald-200",
  CAMPAIGN: "from-purple-50 to-purple-100 border-purple-200",
  DOMINATION: "from-amber-50 to-amber-100 border-amber-200",
};

const TIER_ACCENT: Record<string, string> = {
  MICRO: "text-slate-600",
  STARTER: "text-blue-600",
  IMPACT: "text-emerald-600",
  CAMPAIGN: "text-purple-600",
  DOMINATION: "text-amber-600",
};

function TierCard({
  tierName,
  isSelected,
  isGenerating,
  onClick,
  dbTier,
}: {
  tierName: BudgetTierType;
  isSelected: boolean;
  isGenerating: boolean;
  onClick: () => void;
  dbTier?: { minBudget: number; maxBudget: number; description: string | null };
}) {
  const config = BUDGET_TIER_CONFIG[tierName];
  const gradient = TIER_GRADIENTS[tierName] ?? "";
  const accent = TIER_ACCENT[tierName] ?? "text-foreground";
  const isOptimal = tierName === "IMPACT";

  return (
    <button
      onClick={onClick}
      disabled={isGenerating}
      className={`relative flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all duration-200
        ${isSelected ? `bg-gradient-to-b ${gradient} ring-2 ring-offset-1 ring-primary/40 scale-[1.03]` : "border-muted bg-card hover:border-primary/20 hover:shadow-sm"}
        ${isGenerating ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
    >
      {isOptimal && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
          Optimal
        </span>
      )}
      <span className={`text-xs font-bold uppercase tracking-wider ${accent}`}>
        {config.label}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {dbTier ? `${(dbTier.minBudget / 1_000_000).toFixed(1)}-${(dbTier.maxBudget / 1_000_000).toFixed(1)}M` : config.range}
      </span>
      {isGenerating && isSelected && (
        <Loader2 className="h-4 w-4 animate-spin text-primary mt-1" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Score Badge Component
// ---------------------------------------------------------------------------

function ScoreBadge({ label, value, max, icon: Icon }: { label: string; value: number; max: number; icon: React.ElementType }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const color = pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-600";
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-white p-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground truncate">{label}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
          </div>
          <span className={`text-xs font-bold ${color}`}>{value}/{max}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CampaignPlanSimulator({
  campaigns: existingCampaigns,
  budgetAllocation,
  currency,
  strategyId,
  campaignTemplates,
  activationPlan,
  copyStrategy,
  bigIdea,
  activationDispositif,
}: CampaignPlanSimulatorProps) {
  const [selectedTier, setSelectedTier] = useState<BudgetTierType | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<"campaigns" | "mix" | "adjust" | null>("campaigns");
  const [selectedCampaignIndex, setSelectedCampaignIndex] = useState<number | null>(null);
  const [showExisting, setShowExisting] = useState(true);

  // Initial budget from pillar I
  const initialTotal = useMemo(
    () => parseCurrencyString(budgetAllocation.enveloppeGlobale) ?? 0,
    [budgetAllocation.enveloppeGlobale],
  );

  // Load budget tiers from DB
  const { data: dbTiers } = api.cockpit.getBudgetTiers.useQuery(
    strategyId ? { strategyId } : { strategyId: "" },
    { enabled: !!strategyId },
  );

  // Campaign plan generation mutation
  const generatePlanMut = api.cockpit.generateCampaignPlan.useMutation({
    onError: (err) => toast.error(`Erreur : ${err.message}`),
  });

  // Media mix query (for selected tier)
  const tierBudget = useMemo(() => {
    if (!selectedTier) return 0;
    const dbTier = dbTiers?.find((t) => t.tier === selectedTier);
    if (dbTier) return Math.round((dbTier.minBudget + dbTier.maxBudget) / 2);
    const config = BUDGET_TIER_CONFIG[selectedTier];
    return Math.round((config.minBudget + config.maxBudget) / 2);
  }, [selectedTier, dbTiers]);

  const { data: mediaMix } = api.cockpit.getMediaMix.useQuery(
    strategyId ? { strategyId, budget: tierBudget } : { strategyId: "", budget: 0 },
    { enabled: !!strategyId && tierBudget > 0 },
  );

  // Handle tier selection
  const handleTierSelect = useCallback((tier: BudgetTierType) => {
    setSelectedTier(tier);
    setExpandedPanel("campaigns");
    // Auto-generate campaign plan
    if (strategyId) generatePlanMut.mutate({ strategyId, tierName: tier });
  }, [strategyId, generatePlanMut]);

  const planData = generatePlanMut.data;
  const isGenerating = generatePlanMut.isPending;

  // Build enriched campaign items from generated plan (for CampaignProposalSheet compatibility)
  const generatedCampaigns: EnrichedCampaignItem[] = useMemo(() => {
    if (!planData?.campaigns) return [];
    return planData.campaigns.map((c) => ({
      mois: c.mois,
      campagne: c.campagne,
      objectif: c.objectif,
      budget: c.budgetFormatted,
      canaux: c.channels.map((ch) => ch.channel),
      kpiCible: c.kpis.map((k) => `${k.metric}: ${k.target}`).join(", "),
    }));
  }, [planData]);

  const tiers: BudgetTierType[] = ["MICRO", "STARTER", "IMPACT", "CAMPAIGN", "DOMINATION"];

  return (
    <div className="space-y-4 rounded-xl border-2 border-dashed border-cyan-500/30 bg-cyan-500/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-cyan-500" />
          <h3 className="text-sm font-bold text-foreground">
            Simulateur de Campagnes
          </h3>
        </div>
        {initialTotal > 0 && (
          <span className="text-[10px] text-muted-foreground">
            Budget initial : {formatCurrency(initialTotal, currency)}
          </span>
        )}
      </div>

      {/* Panel 1: Tier Selector */}
      <div className="grid grid-cols-5 gap-2">
        {tiers.map((tier) => {
          const dbTier = dbTiers?.find((t) => t.tier === tier);
          return (
            <TierCard
              key={tier}
              tierName={tier}
              isSelected={selectedTier === tier}
              isGenerating={isGenerating && selectedTier === tier}
              onClick={() => handleTierSelect(tier)}
              dbTier={dbTier ? { minBudget: dbTier.minBudget, maxBudget: dbTier.maxBudget, description: dbTier.description } : undefined}
            />
          );
        })}
      </div>

      {/* Panel 2: Generated Campaign Plan */}
      {selectedTier && (
        <div className="rounded-lg border bg-white">
          <button
            onClick={() => setExpandedPanel(expandedPanel === "campaigns" ? null : "campaigns")}
            className="flex w-full items-center justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Plan de Campagnes {selectedTier}
              </span>
              {planData && (
                <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700">
                  {planData.campaigns.length} campagnes
                </span>
              )}
            </div>
            {expandedPanel === "campaigns" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {expandedPanel === "campaigns" && (
            <div className="border-t px-3 pb-3">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                  <p className="text-xs text-muted-foreground">Génération du plan de campagnes...</p>
                </div>
              ) : planData?.campaigns && planData.campaigns.length > 0 ? (
                <div className="space-y-2 pt-3">
                  {planData.campaigns.map((campaign, i) => (
                    <div
                      key={i}
                      className="group flex items-center gap-3 rounded-lg border p-2 hover:border-cyan-300 hover:bg-cyan-50/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedCampaignIndex(i)}
                    >
                      <span className="w-14 shrink-0 text-[10px] font-bold uppercase text-cyan-500">
                        {campaign.mois.substring(0, 4)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium truncate">{campaign.campagne}</span>
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                            campaign.type === "ATL" ? "bg-blue-100 text-blue-700" :
                            campaign.type === "BTL" ? "bg-orange-100 text-orange-700" :
                            "bg-purple-100 text-purple-700"
                          }`}>
                            {campaign.type}
                          </span>
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-600">
                            {campaign.aarrStage}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {campaign.objectif}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-foreground">
                        {campaign.budgetFormatted}
                      </span>
                      <Eye className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez un palier pour générer un plan de campagnes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Panel 3: Media Mix */}
      {selectedTier && mediaMix && (
        <div className="rounded-lg border bg-white">
          <button
            onClick={() => setExpandedPanel(expandedPanel === "mix" ? null : "mix")}
            className="flex w-full items-center justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mix Média
              </span>
            </div>
            {expandedPanel === "mix" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {expandedPanel === "mix" && (
            <div className="border-t px-3 pb-3 pt-3 space-y-2">
              {mediaMix.allocations.map((alloc, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs font-medium text-foreground truncate">
                    {alloc.channel}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                      style={{ width: `${Math.min(alloc.budgetPercent, 100)}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-bold text-cyan-500">
                    {alloc.budgetPercent}%
                  </span>
                  <span className="w-24 shrink-0 text-right text-[10px] text-muted-foreground">
                    {formatCurrency(alloc.budgetAmount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel 4: Existing Campaigns (from pillar I) */}
      {existingCampaigns.length > 0 && (
        <div className="rounded-lg border bg-white">
          <button
            onClick={() => setShowExisting(!showExisting)}
            className="flex w-full items-center justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Campagnes existantes (Pilier I)
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {existingCampaigns.length}
              </span>
            </div>
            {showExisting ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {showExisting && (
            <div className="border-t px-3 pb-3 pt-2 space-y-1.5">
              {existingCampaigns.map((campaign, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="w-14 shrink-0 text-[10px] font-bold uppercase text-muted-foreground">
                    {campaign.mois?.substring(0, 4) ?? "—"}
                  </span>
                  <span className="flex-1 truncate text-foreground">{campaign.campagne}</span>
                  <span className="shrink-0 text-muted-foreground">{campaign.budget}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel 5: Impact & Scoring */}
      {planData && (
        <div className="space-y-3">
          {/* Combination score */}
          <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-cyan-200 bg-white">
              <span className={`text-lg font-bold ${
                planData.combinationScore >= 80 ? "text-emerald-600" :
                planData.combinationScore >= 60 ? "text-amber-600" :
                "text-red-600"
              }`}>
                {planData.combinationScore}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">Score de Combinaison</p>
              <p className="text-[10px] text-muted-foreground">
                {planData.combinationScore >= 80 ? "Excellent — Plan bien équilibré" :
                 planData.combinationScore >= 60 ? "Bon — Quelques ajustements possibles" :
                 "À améliorer — Plan déséquilibré"}
              </p>
            </div>
          </div>

          {/* Score breakdown grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <ScoreBadge label="AARRR" value={planData.scoring.aarrCoverage} max={20} icon={Target} />
            <ScoreBadge label="Budget" value={planData.scoring.budgetBalance} max={20} icon={DollarSign} />
            <ScoreBadge label="Canaux" value={planData.scoring.channelDiversity} max={20} icon={Layers} />
            <ScoreBadge label="Temporel" value={planData.scoring.temporalSpread} max={20} icon={Calendar} />
            <ScoreBadge label="Types" value={planData.scoring.typeBalance} max={20} icon={Award} />
          </div>

          {/* Summary cards */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[140px] rounded-lg border bg-white p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Budget palier</p>
              <p className="mt-1 text-lg font-bold text-cyan-500">
                {formatCurrency(planData.tierBudget, currency)}
              </p>
            </div>
            <div className="flex-1 min-w-[140px] rounded-lg border bg-white p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Campagnes</p>
              <p className="mt-1 text-lg font-bold text-foreground">{planData.campaigns.length}</p>
            </div>
            <div className="flex-1 min-w-[140px] rounded-lg border bg-white p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Moy. / campagne</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {planData.campaigns.length > 0
                  ? formatCurrency(Math.round(planData.tierBudget / planData.campaigns.length), currency)
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Proposal Detail Sheet */}
      {selectedCampaignIndex !== null && generatedCampaigns[selectedCampaignIndex] && (
        <CampaignProposalSheet
          campaign={generatedCampaigns[selectedCampaignIndex]}
          campaignIndex={selectedCampaignIndex}
          simulatedBudget={planData?.campaigns[selectedCampaignIndex]?.budget ?? 0}
          originalBudget={planData?.campaigns[selectedCampaignIndex]?.budget ?? 0}
          currency={currency}
          templates={campaignTemplates}
          activationPlan={activationPlan}
          copyStrategy={copyStrategy}
          bigIdea={bigIdea}
          activationDispositif={activationDispositif}
          strategyId={strategyId}
          open={true}
          onOpenChange={(open) => {
            if (!open) setSelectedCampaignIndex(null);
          }}
        />
      )}
    </div>
  );
}

// Backward-compatible export
export { CampaignPlanSimulator as BudgetSimulator };
