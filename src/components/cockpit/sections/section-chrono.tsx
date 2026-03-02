// =============================================================================
// COMPONENT C.K35 — Section Chrono
// =============================================================================
// M2 — Gantt-style chronogram with CSS Grid week columns + list view.
// =============================================================================

"use client";

import { useState } from "react";
import {
  CalendarDays,
  Loader2,
  LayoutGrid,
  List,
  Flag,
  Circle,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { CockpitSection } from "../cockpit-shared";
import { EmptyStateWithGenerate } from "../generate-button";
import { CHRONO_PHASES, type ChronoPhase } from "~/lib/types/deliverable-schemas";

const PHASE_COLORS: Record<ChronoPhase, { bg: string; text: string; bar: string }> = {
  "Préparation": { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-400" },
  "Lancement": { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-400" },
  "Activation": { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-400" },
  "Bilan": { bg: "bg-purple-50", text: "text-purple-700", bar: "bg-purple-400" },
};

const STATUS_ICONS: Record<string, { color: string; label: string }> = {
  pending: { color: "text-muted-foreground/60", label: "En attente" },
  in_progress: { color: "text-blue-500", label: "En cours" },
  done: { color: "text-emerald-500", label: "Terminé" },
  blocked: { color: "text-red-500", label: "Bloqué" },
};

type ViewMode = "gantt" | "list";

export function SectionChrono({ strategyId }: { strategyId: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>("gantt");
  const [genError, setGenError] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: tasks, isLoading } =
    api.deliverables.chrono.getByStrategy.useQuery(
      { strategyId },
      { enabled: !!strategyId },
    );

  const generateMutation = api.deliverables.chrono.generate.useMutation({
    onSuccess: () => {
      void utils.deliverables.chrono.getByStrategy.invalidate({ strategyId });
      setGenError(null);
    },
    onError: (err) => setGenError(err.message),
  });

  if (isLoading) {
    return (
      <CockpitSection
        icon={<CalendarDays className="h-5 w-5" />}
        pillarLetter="I"
        title="Chrono-Architecture"
        subtitle="Chargement…"
        color="#7C3AED"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <CockpitSection
        icon={<CalendarDays className="h-5 w-5" />}
        pillarLetter="I"
        title="Chrono-Architecture"
        subtitle="Non configuré"
        color="#7C3AED"
      >
        <EmptyStateWithGenerate
          message="Aucune tâche chronologique configurée. Le chronogramme sera généré à partir du plan de campagne."
          onGenerate={() => generateMutation.mutate({ strategyId })}
          isGenerating={generateMutation.isPending}
          error={genError}
          generateLabel="Générer le chronogramme"
        />
      </CockpitSection>
    );
  }

  // Calculate week range
  const weeks = tasks.map((t) => t.week);
  const minWeek = Math.min(...weeks);
  const maxWeek = Math.max(...weeks);
  const weekRange = Array.from({ length: maxWeek - minWeek + 1 }, (_, i) => minWeek + i);

  // Group tasks by phase
  const grouped = CHRONO_PHASES.reduce<Record<string, typeof tasks>>((acc, phase) => {
    acc[phase] = tasks.filter((t) => t.phase === phase);
    return acc;
  }, {});

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const milestones = tasks.filter((t) => t.isValidationMilestone);

  return (
    <CockpitSection
      icon={<CalendarDays className="h-5 w-5" />}
      pillarLetter="I"
      title="Chrono-Architecture"
      subtitle={`${tasks.length} tâches — ${doneCount} terminées — S${minWeek} à S${maxWeek}`}
      color="#7C3AED"
    >
      <div className="space-y-4">
        {/* View toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("gantt")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              viewMode === "gantt" ? "bg-purple-100 text-purple-700" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Gantt
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              viewMode === "list" ? "bg-purple-100 text-purple-700" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <List className="h-3.5 w-3.5" /> Liste
          </button>
          {milestones.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              <Flag className="mr-0.5 inline h-3 w-3 text-red-500" />
              {milestones.length} jalon{milestones.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Gantt View */}
        {viewMode === "gantt" && (
          <div className="overflow-x-auto">
            <div
              className="min-w-[600px]"
              style={{
                display: "grid",
                gridTemplateColumns: `180px repeat(${weekRange.length}, 1fr)`,
                gap: "1px",
              }}
            >
              {/* Header row */}
              <div className="bg-muted/50 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Tâche
              </div>
              {weekRange.map((w) => (
                <div key={w} className="bg-muted/50 px-1 py-1.5 text-center text-[10px] font-medium text-muted-foreground">
                  S{w}
                </div>
              ))}

              {/* Tasks */}
              {CHRONO_PHASES.map((phase) =>
                (grouped[phase] ?? []).map((task) => {
                  const phaseColor = PHASE_COLORS[phase as ChronoPhase];
                  const statusInfo = (STATUS_ICONS[task.status] ?? STATUS_ICONS["pending"])!;
                  const startCol = task.week - minWeek + 2; // +2 because of label column (1-indexed) and 0-based offset
                  const endDate = new Date(task.endDate);
                  const startDate = new Date(task.startDate);
                  const durationWeeks = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));

                  return (
                    <div key={task.id} style={{ display: "contents" }}>
                      <div className="flex items-center gap-1.5 border-b border-muted/30 px-2 py-1">
                        <Circle className={cn("h-2.5 w-2.5 shrink-0 fill-current", statusInfo.color)} />
                        <span className="truncate text-xs font-medium">{task.title}</span>
                        {task.isValidationMilestone && (
                          <Flag className="h-2.5 w-2.5 shrink-0 text-red-500" />
                        )}
                      </div>
                      {weekRange.map((w) => {
                        const isActive = w >= task.week && w < task.week + durationWeeks;
                        return (
                          <div key={w} className="border-b border-muted/30 px-0.5 py-1">
                            {isActive && (
                              <div className={cn("h-4 rounded-sm", phaseColor.bar, "opacity-80")} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                }),
              )}
            </div>

            {/* Phase legend */}
            <div className="mt-2 flex flex-wrap gap-3">
              {CHRONO_PHASES.map((phase) => {
                const c = PHASE_COLORS[phase as ChronoPhase];
                return (
                  <div key={phase} className="flex items-center gap-1">
                    <div className={cn("h-2.5 w-5 rounded-sm", c.bar)} />
                    <span className="text-[10px] text-muted-foreground">{phase}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-3">
            {CHRONO_PHASES.map((phase) => {
              const phaseTasks = grouped[phase] ?? [];
              if (phaseTasks.length === 0) return null;
              const c = PHASE_COLORS[phase as ChronoPhase];
              return (
                <div key={phase}>
                  <h4 className={cn("mb-1.5 text-xs font-semibold", c.text)}>{phase}</h4>
                  <div className="space-y-1">
                    {phaseTasks.map((task) => {
                      const statusInfo = (STATUS_ICONS[task.status] ?? STATUS_ICONS["pending"])!;
                      return (
                        <div key={task.id} className={cn("flex items-center gap-3 rounded-md border px-3 py-2", c.bg)}>
                          <Circle className={cn("h-3 w-3 shrink-0 fill-current", statusInfo.color)} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">{task.title}</span>
                              {task.isValidationMilestone && (
                                <Flag className="h-3 w-3 shrink-0 text-red-500" />
                              )}
                            </div>
                            {task.owner && (
                              <span className="text-[10px] text-muted-foreground">{task.owner}</span>
                            )}
                          </div>
                          <span className="shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-bold">
                            {task.priority}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            S{task.week}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CockpitSection>
  );
}
