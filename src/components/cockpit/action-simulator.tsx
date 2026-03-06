// =============================================================================
// COMPONENT C.KAS — Action Simulator
// =============================================================================
// 100% client-side marketing action simulator, pattern identique a budget-
// simulator.tsx. 4 panneaux :
//   P1 — Contexte Produit (SKU, lifecycle, elasticite, saisonnalite, reglementaire)
//   P2 — Mix d'Actions (ATL/BTL/TTL, AARRR, budget sliders, reach, SOV)
//   P3 — Regles du Simulateur (accordion)
//   P4 — Output (AARRR reach, budget, balance, flags, score combinaison)
// =============================================================================

"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Sliders,
  Package,
  Target,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  AARRR_STAGES,
  REGULATORY_FLAGS,
  SEASONALITY_PROFILES,
  MONTH_NAMES_FR,
  SIMULATOR_SCORE_WEIGHTS,
  ACTION_LINE_TYPES,
  type ActionLine,
} from "~/lib/constants/marketing-levers";
import { ProduitServiceSchema, type ProduitService } from "~/lib/types/pillar-schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SimulatorAction {
  id: string;
  name: string;
  actionLine: string;
  actionType: string;
  channel?: string | null;
  aarrStage?: string | null;
  coutUnitaire?: number | null;
  uniteCosting?: string | null;
  rendementDecroissant?: number | null;
  sovTarget?: number | null;
  contraintesReglementaires?: string[] | null;
  delaiMinimumJours?: number | null;
  budgetAllocated: number;
}

export interface SimulatorData {
  actions: SimulatorAction[];
  annualBudget: number;
  currency: string;
  // Products come from Pillar V JSON — parsed through Zod on entry
  products: ProduitService[] | Record<string, unknown>[];
}

interface ActionBudget {
  actionId: string;
  budget: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reach function with diminishing returns: R(b) = b * (1 - e^(-k * b/cpu)) */
function computeReach(budget: number, coutUnitaire: number, rendement: number): number {
  if (coutUnitaire <= 0) return 0;
  const k = rendement > 0 ? rendement : 0.5;
  const impressions = budget / coutUnitaire;
  const efficiency = 1 - Math.exp(-k * impressions / 1000);
  return Math.round(impressions * efficiency);
}

function getHealthColor(pct: number): string {
  if (pct >= 70) return "#10B981";
  if (pct >= 40) return "#F59E0B";
  return "#EF4444";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActionSimulator({ data }: { data: SimulatorData }) {
  const { actions, annualBudget, currency } = data;

  // Parse products through Zod to ensure proper types
  const products = useMemo(
    () =>
      (data.products ?? []).map((p) => {
        const result = ProduitServiceSchema.safeParse(p);
        return result.success ? result.data : ProduitServiceSchema.parse({});
      }),
    [data.products],
  );

  // State
  const [selectedSkuIdx, setSelectedSkuIdx] = useState(0);
  const [actionBudgets, setActionBudgets] = useState<ActionBudget[]>(
    actions.map((a) => ({ actionId: a.id, budget: a.budgetAllocated })),
  );
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [rulesExpanded, setRulesExpanded] = useState(false);

  const selectedProduct = products[selectedSkuIdx] ?? null;

  // Budget update handler
  const updateBudget = useCallback(
    (actionId: string, newBudget: number) => {
      setActionBudgets((prev) =>
        prev.map((ab) =>
          ab.actionId === actionId ? { ...ab, budget: newBudget } : ab,
        ),
      );
    },
    [],
  );

  // Computed values
  const totalAllocated = useMemo(
    () => actionBudgets.reduce((s, ab) => s + ab.budget, 0),
    [actionBudgets],
  );

  const budgetUsedPct = annualBudget > 0 ? Math.round((totalAllocated / annualBudget) * 100) : 0;

  // Seasonality coefficient for current month
  const seasonCoeff = useMemo(() => {
    if (!selectedProduct?.saisonalite?.length) return 1.0;
    const month = selectedProduct.saisonalite.find((s) => s.mois === currentMonth);
    return month?.coefficient ?? 1.0;
  }, [selectedProduct, currentMonth]);

  // AARRR reach per stage
  const aarrReach = useMemo(() => {
    const reachMap: Record<string, number> = {};
    for (const stage of AARRR_STAGES) {
      reachMap[stage.id] = 0;
    }
    for (const ab of actionBudgets) {
      const action = actions.find((a) => a.id === ab.actionId);
      if (!action?.aarrStage) continue;
      const reach = computeReach(
        ab.budget * seasonCoeff,
        action.coutUnitaire ?? 100,
        action.rendementDecroissant ?? 0.5,
      );
      reachMap[action.aarrStage] = (reachMap[action.aarrStage] ?? 0) + reach;
    }
    return reachMap;
  }, [actionBudgets, actions, seasonCoeff]);

  const maxReach = Math.max(...Object.values(aarrReach), 1);

  // Channel mix check (no single line > 60%)
  const lineBudgets = useMemo(() => {
    const map: Record<string, number> = { ATL: 0, BTL: 0, TTL: 0 };
    for (const ab of actionBudgets) {
      const action = actions.find((a) => a.id === ab.actionId);
      if (action) map[action.actionLine] = (map[action.actionLine] ?? 0) + ab.budget;
    }
    return map;
  }, [actionBudgets, actions]);

  const maxLinePct = totalAllocated > 0
    ? Math.max(...Object.values(lineBudgets).map((b) => (b / totalAllocated) * 100))
    : 0;

  // Regulatory flags
  const blockingFlags = useMemo(() => {
    const flags: string[] = [];
    for (const ab of actionBudgets) {
      if (ab.budget <= 0) continue;
      const action = actions.find((a) => a.id === ab.actionId);
      if (!action?.contraintesReglementaires) continue;
      for (const fid of action.contraintesReglementaires) {
        const flag = REGULATORY_FLAGS.find((f) => f.id === fid);
        if (flag?.severity === "blocking" && !flags.includes(fid)) flags.push(fid);
      }
    }
    return flags;
  }, [actionBudgets, actions]);

  // Combination score (0-100, 5x20pts)
  const combinationScore = useMemo(() => {
    let score = 0;

    // 1. AARRR Coverage (at least 3/5 stages)
    const coveredStages = AARRR_STAGES.filter((s) => (aarrReach[s.id] ?? 0) > 0).length;
    score += Math.min(coveredStages / 3, 1) * SIMULATOR_SCORE_WEIGHTS.aarrCoverage;

    // 2. Budget Balance (no channel > 60%)
    score += (maxLinePct <= 60 ? 1 : Math.max(0, 1 - (maxLinePct - 60) / 40)) * SIMULATOR_SCORE_WEIGHTS.budgetBalance;

    // 3. Compliance (zero blocking flags)
    score += (blockingFlags.length === 0 ? 1 : 0) * SIMULATOR_SCORE_WEIGHTS.compliance;

    // 4. Channel Diversity (ATL + BTL + TTL represented)
    const linesUsed = Object.entries(lineBudgets).filter(([, b]) => b > 0).length;
    score += (linesUsed / 3) * SIMULATOR_SCORE_WEIGHTS.channelDiversity;

    // 5. Emotional Alignment (product ADVE score)
    const adveScore = selectedProduct?.scoreEmotionnelADVE ?? 0;
    score += (adveScore / 100) * SIMULATOR_SCORE_WEIGHTS.emotionalAlignment;

    return Math.round(score);
  }, [aarrReach, maxLinePct, blockingFlags, lineBudgets, selectedProduct]);

  // Grouped actions
  const groupedActions = useMemo(() => {
    const groups: Record<ActionLine, typeof actions> = { ATL: [], BTL: [], TTL: [] };
    for (const action of actions) {
      const line = action.actionLine as ActionLine;
      if (groups[line]) groups[line].push(action);
    }
    return groups;
  }, [actions]);

  if (actions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <Sliders className="mx-auto h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">Aucune action marketing disponible.</p>
        <p className="text-xs mt-1">Creez des actions dans vos campagnes pour utiliser le simulateur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════
          P1 — CONTEXTE PRODUIT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold">Contexte Produit</span>
        </div>

        {products.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {products.map((p, i) => (
                <button
                  key={p.id || i}
                  type="button"
                  onClick={() => setSelectedSkuIdx(i)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedSkuIdx === i
                      ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      : "text-muted-foreground hover:border-foreground/20"
                  }`}
                >
                  {p.skuRef || p.nom || `Produit ${i + 1}`}
                </button>
              ))}
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <MiniCard label="Lifecycle" value={selectedProduct.phaseLifecycle} />
                <MiniCard label="Elasticite" value={`${selectedProduct.elasticitePercue}/10`} />
                <MiniCard label="Score ADVE" value={`${selectedProduct.scoreEmotionnelADVE}/100`} />
                <MiniCard label="Saison (mois {currentMonth})" value={`coeff ${seasonCoeff.toFixed(1)}`} />
              </div>
            )}

            {/* Regulatory badges */}
            {selectedProduct?.contraintesReglementaires && selectedProduct.contraintesReglementaires.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedProduct.contraintesReglementaires.map((fid) => {
                  const flag = REGULATORY_FLAGS.find((f) => f.id === fid);
                  return (
                    <Badge
                      key={fid}
                      variant="outline"
                      className="text-[10px]"
                      style={{
                        borderColor: flag?.severity === "blocking" ? "#EF4444" : "#F59E0B",
                        color: flag?.severity === "blocking" ? "#EF4444" : "#F59E0B",
                      }}
                    >
                      <ShieldAlert className="mr-1 h-2.5 w-2.5" />
                      {flag?.label ?? fid}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Cannibalization warnings */}
            {selectedProduct?.cannibalisationRisque && selectedProduct.cannibalisationRisque.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>
                  Risque de cannibalization avec {selectedProduct.cannibalisationRisque.length} SKU(s)
                </span>
              </div>
            )}

            {/* Month selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Mois de simulation :</span>
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="rounded-md border bg-background px-2 py-1 text-xs"
              >
                {MONTH_NAMES_FR.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Aucun produit dans le catalogue. Renseignez le pilier Valeur.
          </p>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          P2 — MIX D'ACTIONS
      ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold">Mix d&apos;Actions Marketing</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Budget utilise : {totalAllocated.toLocaleString()} / {annualBudget.toLocaleString()} {currency}
          </span>
        </div>

        {/* Budget progress bar */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(budgetUsedPct, 100)}%`,
              backgroundColor: getHealthColor(100 - budgetUsedPct),
            }}
          />
        </div>

        {(["ATL", "BTL", "TTL"] as ActionLine[]).map((line) => {
          const lineActions = groupedActions[line];
          if (!lineActions || lineActions.length === 0) return null;
          const lineLabel = line === "ATL" ? "Above The Line" : line === "BTL" ? "Below The Line" : "Through The Line";

          return (
            <div key={line} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {line}
                </span>
                <span className="text-[10px] text-muted-foreground">— {lineLabel}</span>
              </div>

              {lineActions.map((action) => {
                const ab = actionBudgets.find((ab) => ab.actionId === action.id);
                const budget = ab?.budget ?? 0;
                const reach = computeReach(
                  budget * seasonCoeff,
                  action.coutUnitaire ?? 100,
                  action.rendementDecroissant ?? 0.5,
                );
                const stage = AARRR_STAGES.find((s) => s.id === action.aarrStage);
                const hasBlockingFlag = action.contraintesReglementaires?.some((fid) => {
                  const flag = REGULATORY_FLAGS.find((f) => f.id === fid);
                  return flag?.severity === "blocking";
                });

                return (
                  <div key={action.id} className="rounded-md border p-2.5 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium flex-1">{action.name}</span>
                      {stage && (
                        <Badge
                          variant="outline"
                          className="text-[9px]"
                          style={{ borderColor: stage.color, color: stage.color }}
                        >
                          {stage.label}
                        </Badge>
                      )}
                      {action.uniteCosting && (
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {action.uniteCosting}
                        </span>
                      )}
                      {hasBlockingFlag && (
                        <Badge variant="destructive" className="text-[9px]">
                          Bloquant
                        </Badge>
                      )}
                      {action.delaiMinimumJours && (
                        <span className="text-[9px] text-muted-foreground">
                          {action.delaiMinimumJours}j min
                        </span>
                      )}
                    </div>

                    {/* Budget slider */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={annualBudget > 0 ? annualBudget / 2 : 10000000}
                        step={annualBudget > 0 ? annualBudget / 200 : 50000}
                        value={budget}
                        onChange={(e) => updateBudget(action.id, Number(e.target.value))}
                        className="flex-1 h-1.5 accent-blue-500"
                      />
                      <span className="text-xs font-mono w-24 text-right">
                        {budget.toLocaleString()} {currency}
                      </span>
                    </div>

                    {/* Reach indicator */}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Reach estime : {reach.toLocaleString()}</span>
                      {action.sovTarget && action.sovTarget > 0 && (
                        <span className="ml-auto">SOV cible : {action.sovTarget}%</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          P3 — REGLES DU SIMULATEUR (accordion)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-lg border">
        <button
          type="button"
          className="flex items-center gap-2 w-full p-3 text-left"
          onClick={() => setRulesExpanded(!rulesExpanded)}
        >
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold flex-1">Regles du Simulateur</span>
          {rulesExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {rulesExpanded && (
          <div className="px-3 pb-3 space-y-2 text-xs text-muted-foreground border-t pt-3">
            <RuleItem
              ok={totalAllocated <= annualBudget}
              label="Budget ne depasse pas l'enveloppe disponible"
            />
            <RuleItem
              ok={seasonCoeff >= 0.7}
              label={`Saisonnalite favorable (coeff ${seasonCoeff.toFixed(1)} — mois ${currentMonth})`}
            />
            <RuleItem
              ok={maxLinePct <= 60}
              label="Aucun canal ne depasse 60% du budget total"
            />
            <RuleItem
              ok={blockingFlags.length === 0}
              label="Zero flag reglementaire bloquant"
            />
            <RuleItem
              ok={AARRR_STAGES.filter((s) => (aarrReach[s.id] ?? 0) > 0).length >= 3}
              label="Au moins 3/5 stages AARRR couverts"
            />
            <RuleItem
              ok={Object.entries(lineBudgets).filter(([, b]) => b > 0).length >= 2}
              label="Diversite canaux : au moins 2/3 lignes (ATL/BTL/TTL) actives"
            />
            <p className="text-[10px] italic mt-2">
              Formule de reach : R(b) = b &times; (1 &minus; e<sup>&minus;k&middot;b/cpu</sup>), ou k = rendement decroissant
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          P4 — OUTPUT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-semibold">Resultats de la Simulation</span>
        </div>

        {/* AARRR Reach bars */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Reach par AARRR
          </p>
          {AARRR_STAGES.map((stage) => {
            const reach = aarrReach[stage.id] ?? 0;
            const pct = maxReach > 0 ? (reach / maxReach) * 100 : 0;
            return (
              <div key={stage.id} className="flex items-center gap-2">
                <span className="text-[10px] w-24 text-right font-medium" style={{ color: stage.color }}>
                  {stage.label}
                </span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono w-16 text-right">
                  {reach.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Budget summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <MiniCard
            label="Budget utilise"
            value={`${budgetUsedPct}%`}
            color={getHealthColor(100 - budgetUsedPct)}
          />
          <MiniCard
            label="Ligne dominante"
            value={`${Math.round(maxLinePct)}%`}
            color={maxLinePct <= 60 ? "#10B981" : "#EF4444"}
          />
          <MiniCard
            label="Flags bloquants"
            value={String(blockingFlags.length)}
            color={blockingFlags.length === 0 ? "#10B981" : "#EF4444"}
          />
          <MiniCard
            label="Saison coeff"
            value={seasonCoeff.toFixed(1)}
            color={seasonCoeff >= 1.0 ? "#10B981" : seasonCoeff >= 0.7 ? "#F59E0B" : "#EF4444"}
          />
        </div>

        {/* Channel mix breakdown */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Repartition ATL / BTL / TTL
          </p>
          <div className="flex h-4 rounded-full overflow-hidden bg-muted">
            {totalAllocated > 0 &&
              (["ATL", "BTL", "TTL"] as const).map((line) => {
                const pct = (lineBudgets[line] ?? 0) / totalAllocated * 100;
                if (pct <= 0) return null;
                const colors = { ATL: "#3B82F6", BTL: "#F59E0B", TTL: "#10B981" };
                return (
                  <div
                    key={line}
                    className="h-full transition-all flex items-center justify-center text-[8px] font-bold text-white"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: colors[line],
                    }}
                  >
                    {pct > 10 ? `${line} ${Math.round(pct)}%` : ""}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Combination Score */}
        <div className="flex items-center gap-4 rounded-lg border-2 p-4"
          style={{ borderColor: getHealthColor(combinationScore) }}
        >
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={getHealthColor(combinationScore)}
                strokeWidth="3"
                strokeDasharray={`${combinationScore}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: getHealthColor(combinationScore) }}>
                {combinationScore}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Score de Combinaison</p>
            <p className="text-xs text-muted-foreground">
              Couverture AARRR + Equilibre budgetaire + Compliance + Diversite canaux + Alignement emotionnel
            </p>
          </div>
        </div>

        {/* Risk flags */}
        {blockingFlags.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-500/5 p-3">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-xs font-semibold">Flags Reglementaires Bloquants</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {blockingFlags.map((fid) => {
                const flag = REGULATORY_FLAGS.find((f) => f.id === fid);
                return (
                  <Badge key={fid} variant="destructive" className="text-[10px]">
                    {flag?.label ?? fid}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MiniCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border p-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-bold" style={color ? { color } : undefined}>
        {value}
      </p>
    </div>
  );
}

function RuleItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
      )}
      <span className={ok ? "text-foreground/70" : "text-red-500 font-medium"}>
        {label}
      </span>
    </div>
  );
}
