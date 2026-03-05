// =============================================================================
// C.BRANDOS.P10.1 — Execution Pipeline
// =============================================================================
// Interactive timeline visualization for FW-23 Execution Sequencing data.
// Displays phase pipeline with progress bars, Go/No-Go gates, resource
// allocation, and selectable phase detail panels.
//
// Consumes FW-23 (Execution Sequencing) data.
// Used by: ARTEMIS cockpit, Brand OS execution pages
// =============================================================================

"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PhaseData {
  id: string;
  name: string;
  order: number;
  durationDays: number;
  description: string;
  deliverables: string[];
  budgetPercent: number;
}

interface TimelineItem {
  id: string;
  phaseId: string;
  name: string;
  startDay: number;
  endDay: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "BLOCKED";
}

interface GoNoGoGate {
  id: string;
  name: string;
  afterPhaseId: string;
  criteria: { criterion: string; threshold: string; weight: number }[];
  minimumScore: number;
}

interface ResourceAllocationItem {
  phaseId: string;
  phaseName: string;
  budgetPercent: number;
  teamSize: number;
  keyRoles: string[];
}

interface ExecutionPipelineProps {
  activeSequence: {
    id: string;
    name: string;
    type: string;
    totalDurationDays: number;
    phases: PhaseData[];
  };
  timeline: TimelineItem[];
  goNoGoGates: GoNoGoGate[];
  resourceAllocation: ResourceAllocationItem[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Status colors
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  TimelineItem["status"],
  { bg: string; border: string; text: string; label: string; barColor: string }
> = {
  PENDING: {
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "border-slate-300 dark:border-slate-600",
    text: "text-slate-700 dark:text-slate-300",
    label: "En attente",
    barColor: "bg-slate-400 dark:bg-slate-500",
  },
  ACTIVE: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-300 dark:border-blue-700",
    text: "text-blue-700 dark:text-blue-300",
    label: "Actif",
    barColor: "bg-blue-500 dark:bg-blue-400",
  },
  COMPLETED: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-300 dark:border-emerald-700",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "Terminé",
    barColor: "bg-emerald-500 dark:bg-emerald-400",
  },
  BLOCKED: {
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-300 dark:border-red-700",
    text: "text-red-700 dark:text-red-300",
    label: "Bloqué",
    barColor: "bg-red-500 dark:bg-red-400",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExecutionPipeline({
  activeSequence,
  timeline,
  goNoGoGates,
  resourceAllocation,
  className,
}: ExecutionPipelineProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(
    activeSequence.phases[0]?.id ?? null,
  );

  const sortedPhases = [...activeSequence.phases].sort(
    (a, b) => a.order - b.order,
  );

  // Resolve the status for a phase from the timeline
  function getPhaseStatus(phaseId: string): TimelineItem["status"] {
    const item = timeline.find((t) => t.phaseId === phaseId);
    return item?.status ?? "PENDING";
  }

  // Compute progress percent for a phase based on timeline
  function getPhaseProgress(phaseId: string): number {
    const item = timeline.find((t) => t.phaseId === phaseId);
    if (!item) return 0;
    if (item.status === "COMPLETED") return 100;
    if (item.status === "PENDING" || item.status === "BLOCKED") return 0;
    const total = item.endDay - item.startDay;
    if (total <= 0) return 0;
    // For ACTIVE, estimate halfway
    return 50;
  }

  // Check if a Go/No-Go gate sits after a given phase
  function getGateAfterPhase(phaseId: string): GoNoGoGate | undefined {
    return goNoGoGates.find((g) => g.afterPhaseId === phaseId);
  }

  // Get resource allocation for a phase
  function getResources(phaseId: string): ResourceAllocationItem | undefined {
    return resourceAllocation.find((r) => r.phaseId === phaseId);
  }

  const selectedPhase = sortedPhases.find((p) => p.id === selectedPhaseId);
  const selectedResources = selectedPhaseId
    ? getResources(selectedPhaseId)
    : undefined;
  const selectedTimeline = selectedPhaseId
    ? timeline.find((t) => t.phaseId === selectedPhaseId)
    : undefined;
  const selectedGate = selectedPhaseId
    ? getGateAfterPhase(selectedPhaseId)
    : undefined;

  if (sortedPhases.length === 0) {
    return (
      <Card className={cn("w-full", className)} data-slot="execution-pipeline">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            Aucune phase définie. Exécutez FW-23 (Execution Sequencing)
            pour générer le pipeline.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)} data-slot="execution-pipeline">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {activeSequence.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {activeSequence.totalDurationDays}j total
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {activeSequence.type}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Horizontal phase pipeline */}
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {sortedPhases.map((phase, idx) => {
            const status = getPhaseStatus(phase.id);
            const config = STATUS_CONFIG[status];
            const progress = getPhaseProgress(phase.id);
            const isSelected = phase.id === selectedPhaseId;
            const gate = getGateAfterPhase(phase.id);

            return (
              <div key={phase.id} className="flex items-center shrink-0">
                {/* Phase block */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSelectedPhaseId(phase.id)}
                      className={cn(
                        "relative flex flex-col items-center rounded-lg border px-4 py-3 text-xs transition-all hover:shadow-sm min-w-[120px]",
                        config.bg,
                        config.border,
                        isSelected && "ring-2 ring-primary/40",
                      )}
                    >
                      <span className={cn("font-medium text-sm", config.text)}>
                        {phase.name}
                      </span>
                      <span className="text-muted-foreground text-[10px] mt-0.5">
                        {phase.durationDays}j
                      </span>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-muted mt-2">
                        <div
                          className={cn("h-full rounded-full transition-all", config.barColor)}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Status badge */}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "mt-1.5 text-[10px] px-1.5 py-0",
                          status === "COMPLETED" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                          status === "ACTIVE" && "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                          status === "BLOCKED" && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
                        )}
                      >
                        {config.label}
                      </Badge>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{phase.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {phase.description}
                      </p>
                      <p className="text-xs">
                        <span className="text-muted-foreground">Budget :</span>{" "}
                        {phase.budgetPercent}%
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Go/No-Go gate diamond + connector */}
                {idx < sortedPhases.length - 1 && (
                  <div className="flex items-center shrink-0">
                    {/* Connector line */}
                    <div className="h-px w-3 bg-border" />

                    {gate ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center w-6 h-6 shrink-0">
                            <div className="w-4 h-4 rotate-45 border-2 border-amber-400 bg-amber-50 dark:bg-amber-950 dark:border-amber-600" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold">{gate.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Score minimum : {gate.minimumScore}%
                            </p>
                            {gate.criteria.map((c, ci) => (
                              <p key={ci} className="text-xs">
                                {c.criterion} ({c.threshold}) — poids {c.weight}
                              </p>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div className="w-2 h-px bg-border" />
                    )}

                    {/* Connector line */}
                    <div className="h-px w-3 bg-border" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected phase detail panel */}
        {selectedPhase && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                Phase {selectedPhase.order} : {selectedPhase.name}
              </h3>
              {selectedTimeline && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  Jour {selectedTimeline.startDay} → {selectedTimeline.endDay}
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {selectedPhase.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deliverables */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                  Livrables
                </p>
                <div className="space-y-1">
                  {selectedPhase.deliverables.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs"
                    >
                      <span className="text-muted-foreground shrink-0">
                        {i + 1}.
                      </span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource allocation */}
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Budget
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all"
                        style={{ width: `${selectedPhase.budgetPercent}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-semibold">
                      {selectedPhase.budgetPercent}%
                    </span>
                  </div>
                </div>

                {selectedResources && (
                  <>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Équipe
                      </p>
                      <span className="font-mono text-sm font-semibold">
                        {selectedResources.teamSize} personnes
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                        Rôles clés
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedResources.keyRoles.map((role, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Go/No-Go gate for this phase */}
            {selectedGate && (
              <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 p-3">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">
                  Go/No-Go : {selectedGate.name}
                </p>
                <div className="space-y-1">
                  {selectedGate.criteria.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span>{c.criterion}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{c.threshold}</span>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          poids {c.weight}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Score minimum requis : {selectedGate.minimumScore}%
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
