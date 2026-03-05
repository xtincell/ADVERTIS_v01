// =============================================================================
// C.TARSIS.P11.1 — Growth Dashboard
// =============================================================================
// Growth engine dashboard for FW-19 Growth Mechanics data. Displays primary
// engine metrics, flywheel visualization, scaling breakpoints with progress,
// and Ansoff expansion matrix in a 2x2 grid.
//
// Consumes FW-19 (Growth Mechanics) data.
// Used by: ARTEMIS cockpit, TARSIS growth pages
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GrowthEngine {
  primaryEngine: string;
  viralCoefficient: number;
  stickyRetention: number;
  paidCac: number;
  blendedScore: number;
  recommendation: string;
}

interface FlywheelStep {
  id: string;
  order: number;
  name: string;
  action: string;
  output: string;
  feedsInto: string;
  accelerator: string;
}

interface ScalingBreakpoint {
  id: string;
  name: string;
  triggerMetric: string;
  triggerValue: number;
  currentValue: number;
  actions: string[];
  risks: string[];
  estimatedTimeline: string;
}

interface ExpansionEntry {
  quadrant: string;
  strategy: string;
  risk: string;
  priority: number;
  estimatedRevenue: string;
  timeToMarket: string;
}

interface GrowthDashboardProps {
  growthEngine: GrowthEngine;
  flywheel: FlywheelStep[];
  scalingBreakpoints: ScalingBreakpoint[];
  expansionMatrix: ExpansionEntry[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Risk color mapping for Ansoff matrix
// ---------------------------------------------------------------------------

const RISK_COLORS: Record<string, string> = {
  LOW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  VERY_HIGH: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const RISK_BORDER: Record<string, string> = {
  LOW: "border-emerald-300 dark:border-emerald-700",
  MEDIUM: "border-amber-300 dark:border-amber-700",
  HIGH: "border-orange-300 dark:border-orange-700",
  VERY_HIGH: "border-red-300 dark:border-red-700",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreBarColor(score: number): string {
  if (score >= 70) return "bg-emerald-500 dark:bg-emerald-400";
  if (score >= 45) return "bg-amber-500 dark:bg-amber-400";
  return "bg-red-500 dark:bg-red-400";
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 45) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function progressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GrowthDashboard({
  growthEngine,
  flywheel,
  scalingBreakpoints,
  expansionMatrix,
  className,
}: GrowthDashboardProps) {
  const [selectedBreakpointId, setSelectedBreakpointId] = useState<string | null>(null);

  const sortedFlywheel = [...flywheel].sort((a, b) => a.order - b.order);

  return (
    <Card className={cn("w-full", className)} data-slot="growth-dashboard">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Moteur de Croissance
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {growthEngine.primaryEngine}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Growth Engine Metrics ── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Métriques du moteur
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Viral Coefficient */}
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Coefficient viral
              </p>
              <p className={cn("text-2xl font-bold font-mono mt-1", scoreColor(growthEngine.viralCoefficient * 100))}>
                {growthEngine.viralCoefficient.toFixed(2)}
              </p>
            </div>

            {/* Sticky Retention */}
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Rétention
              </p>
              <p className={cn("text-2xl font-bold font-mono mt-1", scoreColor(growthEngine.stickyRetention))}>
                {growthEngine.stickyRetention}%
              </p>
            </div>

            {/* Paid CAC */}
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                CAC payé
              </p>
              <p className="text-2xl font-bold font-mono mt-1 text-foreground">
                {growthEngine.paidCac.toFixed(0)}
              </p>
            </div>
          </div>

          {/* Blended score bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Score combiné</span>
              <span className={cn("font-mono text-xs font-semibold", scoreColor(growthEngine.blendedScore))}>
                {growthEngine.blendedScore}/100
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", scoreBarColor(growthEngine.blendedScore))}
                style={{ width: `${growthEngine.blendedScore}%` }}
              />
            </div>
          </div>

          {/* Recommendation */}
          <p className="text-sm text-muted-foreground mt-2">
            {growthEngine.recommendation}
          </p>
        </div>

        {/* ── Flywheel Visualization ── */}
        {sortedFlywheel.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Flywheel ({sortedFlywheel.length} etapes)
            </p>

            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {sortedFlywheel.map((step, idx) => (
                <div key={step.id} className="flex items-center shrink-0">
                  {/* Step badge */}
                  <div className="flex flex-col items-center rounded-lg border bg-muted/30 px-4 py-3 min-w-[130px]">
                    <Badge
                      variant="default"
                      className="text-[10px] font-mono w-6 h-6 flex items-center justify-center p-0 rounded-full mb-1.5"
                    >
                      {step.order}
                    </Badge>
                    <span className="font-medium text-sm text-center">{step.name}</span>
                    <span className="text-[10px] text-muted-foreground text-center mt-0.5">
                      {step.action}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70 mt-1">
                      {step.output}
                    </span>
                  </div>

                  {/* Arrow connector */}
                  {idx < sortedFlywheel.length - 1 && (
                    <div className="flex items-center shrink-0 px-1">
                      <span className="text-muted-foreground text-lg">→</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Loop back arrow */}
              {sortedFlywheel.length > 1 && (
                <div className="flex items-center shrink-0 px-1">
                  <span className="text-muted-foreground text-lg">↩</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Scaling Breakpoints ── */}
        {scalingBreakpoints.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Seuils de passage ({scalingBreakpoints.length})
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {scalingBreakpoints.map((bp) => {
                const progress = progressPercent(bp.currentValue, bp.triggerValue);
                const isSelected = bp.id === selectedBreakpointId;

                return (
                  <button
                    key={bp.id}
                    onClick={() => setSelectedBreakpointId(isSelected ? null : bp.id)}
                    className={cn(
                      "flex flex-col items-start rounded-lg border p-3 text-left transition-all hover:shadow-sm",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:bg-accent/50",
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="font-medium text-sm">{bp.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {bp.estimatedTimeline}
                      </Badge>
                    </div>

                    {/* Trigger metric */}
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      {bp.triggerMetric}
                    </p>

                    {/* Progress bar */}
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono text-xs">{bp.currentValue}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          / {bp.triggerValue}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full transition-all", scoreBarColor(progress))}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t w-full space-y-2">
                        {bp.actions.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                              Actions
                            </p>
                            <div className="space-y-0.5">
                              {bp.actions.map((a, i) => (
                                <p key={i} className="text-xs">
                                  {i + 1}. {a}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                        {bp.risks.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                              Risques
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {bp.risks.map((r, i) => (
                                <Badge key={i} variant="destructive" className="text-[10px]">
                                  {r}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Ansoff Expansion Matrix (2x2) ── */}
        {expansionMatrix.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Matrice d&apos;expansion Ansoff
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {expansionMatrix.map((entry, idx) => {
                const riskKey = entry.risk.replace(/\s+/g, "_").toUpperCase();
                const riskColor = RISK_COLORS[riskKey] ?? "";
                const borderColor = RISK_BORDER[riskKey] ?? "border-border";

                return (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-lg border p-3 space-y-2",
                      borderColor,
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{entry.quadrant}</span>
                      <Badge
                        variant="secondary"
                        className={cn("text-[10px]", riskColor)}
                      >
                        {entry.risk}
                      </Badge>
                    </div>

                    <p className="text-xs">{entry.strategy}</p>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Priorité : {entry.priority}</span>
                      <span>{entry.estimatedRevenue}</span>
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                      Délai : {entry.timeToMarket}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
