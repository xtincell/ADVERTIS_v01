// =============================================================================
// COMPONENT C.K34 — Section Budget Opérationnel
// =============================================================================
// M1 — 3-layer budget: Vision Phase / Detail Activation / P0-P1-P2 Scenarios.
// =============================================================================

"use client";

import { useState } from "react";
import {
  Banknote,
  Loader2,
  Layers,
  Eye,
  List,
  BarChart3,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { CockpitSection } from "../cockpit-shared";
import { SectionAccordion } from "../section-accordion";
import { EmptyStateWithGenerate } from "../generate-button";
import {
  BudgetLayer1Schema,
  BudgetLayer2Schema,
  BudgetLayer3Schema,
} from "~/lib/types/deliverable-schemas";

type Layer1 = ReturnType<typeof BudgetLayer1Schema.parse>;
type Layer2 = ReturnType<typeof BudgetLayer2Schema.parse>;
type Layer3 = ReturnType<typeof BudgetLayer3Schema.parse>;

type ActiveLayer = "vision" | "detail" | "scenarios";

export function SectionBudgetOperationnel({ strategyId }: { strategyId: string }) {
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>("vision");
  const [genError, setGenError] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: budget, isLoading } =
    api.deliverables.operationalBudget.getByStrategy.useQuery(
      { strategyId },
      { enabled: !!strategyId },
    );

  const generateMutation = api.deliverables.operationalBudget.generate.useMutation({
    onSuccess: () => {
      void utils.deliverables.operationalBudget.getByStrategy.invalidate({ strategyId });
      setGenError(null);
    },
    onError: (err) => setGenError(err.message),
  });

  const layer1 = budget?.layer1Vision ? BudgetLayer1Schema.safeParse(budget.layer1Vision) : null;
  const layer2 = budget?.layer2Detail ? BudgetLayer2Schema.safeParse(budget.layer2Detail) : null;
  const layer3 = budget?.layer3Scenarios ? BudgetLayer3Schema.safeParse(budget.layer3Scenarios) : null;

  const l1 = layer1?.success ? layer1.data : null;
  const l2 = layer2?.success ? layer2.data : null;
  const l3 = layer3?.success ? layer3.data : null;
  const currency = budget?.currency ?? "XAF";

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  if (isLoading) {
    return (
      <CockpitSection
        icon={<Banknote className="h-5 w-5" />}
        pillarLetter="I"
        title="Budget Opérationnel"
        subtitle="Chargement…"
        color="#059669"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  if (!budget) {
    return (
      <CockpitSection
        icon={<Banknote className="h-5 w-5" />}
        pillarLetter="I"
        title="Budget Opérationnel"
        subtitle="Non configuré"
        color="#059669"
      >
        <EmptyStateWithGenerate
          message="Le budget opérationnel 3 couches sera généré à partir des données de la stratégie."
          onGenerate={() => generateMutation.mutate({ strategyId })}
          isGenerating={generateMutation.isPending}
          error={genError}
        />
      </CockpitSection>
    );
  }

  return (
    <CockpitSection
      icon={<Banknote className="h-5 w-5" />}
      pillarLetter="I"
      title="Budget Opérationnel"
      subtitle={l1?.totalBudget ? `${fmt(l1.totalBudget)} ${currency}` : "3 couches"}
      color="#059669"
    >
      <div className="space-y-4">
        {/* Layer switcher */}
        <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
          {([
            { key: "vision" as const, label: "Couche 1 — Vision", icon: Eye },
            { key: "detail" as const, label: "Couche 2 — Détail", icon: List },
            { key: "scenarios" as const, label: "Couche 3 — Scénarios", icon: BarChart3 },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveLayer(key)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                activeLayer === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">C{key === "vision" ? "1" : key === "detail" ? "2" : "3"}</span>
            </button>
          ))}
        </div>

        {/* Layer 1 — Vision Phase */}
        {activeLayer === "vision" && l1 && (
          <div className="space-y-3">
            {l1.decisionView && (
              <p className="text-sm text-muted-foreground">{l1.decisionView}</p>
            )}
            <div className="space-y-2">
              {l1.phases.map((phase, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{phase.name}</span>
                      <span className="text-sm font-semibold">{fmt(phase.allocation)} {currency}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${phase.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-xs text-muted-foreground">
                    {phase.percentage}%
                  </span>
                </div>
              ))}
            </div>
            {l1.totalBudget > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-2">
                <span className="text-sm font-semibold text-emerald-800">Total</span>
                <span className="text-lg font-bold text-emerald-700">{fmt(l1.totalBudget)} {currency}</span>
              </div>
            )}
          </div>
        )}

        {/* Layer 2 — Detail */}
        {activeLayer === "detail" && l2 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Activation</th>
                  <th className="pb-2 pr-3 font-medium">Catégorie</th>
                  <th className="pb-2 pr-3 font-medium text-right">Coût unit.</th>
                  <th className="pb-2 pr-3 font-medium text-right">Qté</th>
                  <th className="pb-2 pr-3 font-medium text-right">Sous-total</th>
                  <th className="pb-2 font-medium">Fournisseur</th>
                </tr>
              </thead>
              <tbody>
                {l2.activations.map((act, i) => (
                  <tr key={i} className="border-b border-muted/50">
                    <td className="py-1.5 pr-3 font-medium">{act.name}</td>
                    <td className="py-1.5 pr-3 text-muted-foreground">{act.category}</td>
                    <td className="py-1.5 pr-3 text-right">{fmt(act.unitCost)}</td>
                    <td className="py-1.5 pr-3 text-right">{act.quantity}</td>
                    <td className="py-1.5 pr-3 text-right font-semibold">{fmt(act.subtotal)}</td>
                    <td className="py-1.5 text-muted-foreground">{act.supplier ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td colSpan={4} className="pt-2 text-right">Total</td>
                  <td className="pt-2 text-right">
                    {fmt(l2.activations.reduce((s, a) => s + a.subtotal, 0))} {currency}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Layer 3 — Scenarios P0/P1/P2 */}
        {activeLayer === "scenarios" && l3 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {(["P0", "P1", "P2"] as const).map((p) => {
              const scenario = l3[p];
              const colors = {
                P0: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "Nécessaire" },
                P1: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "Recommandé" },
                P2: { bg: "bg-muted/50", border: "border-border", text: "text-muted-foreground", label: "Facultatif" },
              };
              const c = colors[p];
              return (
                <div key={p} className={cn("rounded-lg border p-3", c.border, c.bg)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-sm font-bold", c.text)}>{p}</span>
                    <span className="text-[10px] text-muted-foreground">{c.label}</span>
                  </div>
                  <div className="space-y-1">
                    {scenario.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="shrink-0 font-medium">{fmt(item.cost)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={cn("mt-2 border-t pt-1.5 flex justify-between", c.border)}>
                    <span className="text-xs font-semibold">Total</span>
                    <span className={cn("text-sm font-bold", c.text)}>
                      {fmt(scenario.total)} {currency}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Grand total */}
            {l3.grandTotal > 0 && (
              <div className="sm:col-span-3 flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2">
                <span className="text-sm font-semibold text-emerald-800">Budget Global (P0+P1+P2)</span>
                <span className="text-lg font-bold text-emerald-700">{fmt(l3.grandTotal)} {currency}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </CockpitSection>
  );
}
