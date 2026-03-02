// =============================================================================
// COMPONENT C.K30 — Section Quality Checklist
// =============================================================================
// Pre-delivery quality checklist grouped by category with progress bar.
// =============================================================================

"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { CockpitSection } from "../cockpit-shared";
import type { QualityChecklistItem } from "~/lib/types/deliverable-schemas";

export function SectionQualityChecklist({ strategyId }: { strategyId: string }) {
  const { data: checklist, isLoading, refetch } =
    api.deliverables.qualityChecklist.getByStrategy.useQuery(
      { strategyId },
      { enabled: !!strategyId },
    );

  const seedMutation = api.deliverables.qualityChecklist.seedDefaults.useMutation({
    onSuccess: () => void refetch(),
  });

  const upsertMutation = api.deliverables.qualityChecklist.upsert.useMutation({
    onSuccess: () => void refetch(),
  });

  const items = (checklist?.items ?? []) as QualityChecklistItem[];
  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;
  const score = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  // Group by category
  const grouped = items.reduce<Record<string, QualityChecklistItem[]>>((acc, item) => {
    const cat = item.category || "Autre";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const handleToggle = (itemId: string) => {
    const updated = items.map((i) =>
      i.id === itemId ? { ...i, checked: !i.checked } : i,
    );
    const newChecked = updated.filter((i) => i.checked).length;
    const newScore = totalItems > 0 ? Math.round((newChecked / totalItems) * 100) : 0;
    upsertMutation.mutate({
      strategyId,
      items: updated,
      overallScore: newScore,
    });
  };

  if (isLoading) {
    return (
      <CockpitSection
        icon={<CheckCircle2 className="h-5 w-5" />}
        pillarLetter="S"
        title="Checklist Qualité"
        subtitle="Chargement…"
        color="#8B5CF6"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  return (
    <CockpitSection
      icon={<CheckCircle2 className="h-5 w-5" />}
      pillarLetter="S"
      title="Checklist Qualité"
      subtitle={totalItems > 0 ? `${checkedItems}/${totalItems} validés — ${score}%` : "Validation pré-livraison"}
      color="#8B5CF6"
    >
      {totalItems === 0 ? (
        <div className="py-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Aucune checklist configurée. Initialisez les critères par défaut.
          </p>
          <button
            onClick={() => seedMutation.mutate({ strategyId })}
            disabled={seedMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            {seedMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Initialiser la checklist
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-2.5 w-full rounded-full bg-muted">
              <div
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-400",
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{checkedItems} sur {totalItems} critères validés</span>
              <span className={cn(
                "font-semibold",
                score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600",
              )}>
                {score}%
              </span>
            </div>
          </div>

          {/* Categories */}
          {Object.entries(grouped).map(([category, catItems]) => {
            const catChecked = catItems.filter((i) => i.checked).length;
            return (
              <div key={category} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{category}</h4>
                  <span className="text-xs text-muted-foreground">
                    {catChecked}/{catItems.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {catItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleToggle(item.id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/50 transition-colors"
                    >
                      {item.checked ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span className={cn(
                        "text-sm",
                        item.checked && "text-muted-foreground line-through",
                      )}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CockpitSection>
  );
}
