// =============================================================================
// C.BRANDOS.P11.4 — Evolution Timeline
// =============================================================================
// Brand lifecycle and drift detection dashboard for FW-14 Brand Evolution
// data. Displays a horizontal 5-stage lifecycle bar, core stability scores
// with immutable/mutable elements, drift indicators with alert badges,
// and actionable recommendations.
//
// Consumes FW-14 (Brand Evolution) data.
// Used by: ARTEMIS cockpit, Brand OS evolution pages
// =============================================================================

"use client";

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

interface CoreElement {
  id: string;
  element: string;
  description: string;
}

interface IdentityCore {
  immutable: CoreElement[];
  mutable: CoreElement[];
  coreStabilityScore: number;
}

interface DriftIndicator {
  id: string;
  indicator: string;
  currentValue: number;
  baselineValue: number;
  driftMagnitude: number;
  direction: string;
  alert: boolean;
}

interface DriftDetection {
  indicators: DriftIndicator[];
  overallDriftScore: number;
  status: string;
  recommendation: string;
}

interface LifecycleStage {
  currentStage: string;
  confidence: number;
  transitionSignals: string[];
  nextLikelyStage: string | null;
  recommendations: string[];
}

interface EvolutionTimelineProps {
  identityCore: IdentityCore;
  driftDetection: DriftDetection;
  lifecycleStage: LifecycleStage;
  className?: string;
}

// ---------------------------------------------------------------------------
// Lifecycle stages in order
// ---------------------------------------------------------------------------

const LIFECYCLE_STAGES = [
  { key: "LAUNCH", label: "Lancement" },
  { key: "GROWTH", label: "Croissance" },
  { key: "MATURITY", label: "Maturité" },
  { key: "DECLINE", label: "Déclin" },
  { key: "REVITALIZATION", label: "Revitalisation" },
] as const;

// ---------------------------------------------------------------------------
// Drift status colors
// ---------------------------------------------------------------------------

const DRIFT_STATUS_COLORS: Record<string, string> = {
  STABLE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  DRIFTING: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
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

function driftBarColor(magnitude: number): string {
  if (magnitude <= 10) return "bg-emerald-500 dark:bg-emerald-400";
  if (magnitude <= 25) return "bg-amber-500 dark:bg-amber-400";
  return "bg-red-500 dark:bg-red-400";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EvolutionTimeline({
  identityCore,
  driftDetection,
  lifecycleStage,
  className,
}: EvolutionTimelineProps) {
  const currentStageIdx = LIFECYCLE_STAGES.findIndex(
    (s) => s.key === lifecycleStage.currentStage,
  );

  const driftStatusColor = DRIFT_STATUS_COLORS[driftDetection.status] ?? "";

  return (
    <Card className={cn("w-full", className)} data-slot="evolution-timeline">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Évolution de Marque
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {LIFECYCLE_STAGES[currentStageIdx]?.label ?? lifecycleStage.currentStage}
            </Badge>
            <Badge
              variant="secondary"
              className={cn("text-[10px] px-1.5 py-0", driftStatusColor)}
            >
              {driftDetection.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Lifecycle Timeline: Horizontal 5-Stage Bar ── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Cycle de vie
          </p>

          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isCurrent = idx === currentStageIdx;
              const isPast = idx < currentStageIdx;

              return (
                <div key={stage.key} className="flex items-center shrink-0">
                  {/* Stage block */}
                  <div
                    className={cn(
                      "flex flex-col items-center rounded-lg border px-4 py-3 min-w-[110px] transition-all",
                      isCurrent
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : isPast
                          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950"
                          : "border-border bg-muted/20",
                    )}
                  >
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isCurrent
                          ? "text-primary"
                          : isPast
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-muted-foreground",
                      )}
                    >
                      {stage.label}
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] font-mono mt-1 text-primary">
                        {lifecycleStage.confidence}%
                      </span>
                    )}
                  </div>

                  {/* Arrow connector */}
                  {idx < LIFECYCLE_STAGES.length - 1 && (
                    <div className="flex items-center shrink-0 px-1">
                      <span
                        className={cn(
                          "text-lg",
                          idx < currentStageIdx
                            ? "text-emerald-500"
                            : "text-muted-foreground/40",
                        )}
                      >
                        →
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next likely stage */}
          {lifecycleStage.nextLikelyStage && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Prochaine étape probable :
              </span>
              <Badge variant="outline" className="text-[10px]">
                {lifecycleStage.nextLikelyStage}
              </Badge>
            </div>
          )}

          {/* Transition signals */}
          {lifecycleStage.transitionSignals.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Signaux de transition
              </p>
              <div className="flex flex-wrap gap-1">
                {lifecycleStage.transitionSignals.map((signal, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">
                    {signal}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Core Stability ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Stabilité du noyau
            </p>
            <span className={cn("font-mono text-sm font-bold", scoreColor(identityCore.coreStabilityScore))}>
              {identityCore.coreStabilityScore}/100
            </span>
          </div>

          {/* Score bar */}
          <div className="h-2 w-full rounded-full bg-muted mb-4">
            <div
              className={cn("h-full rounded-full transition-all", scoreBarColor(identityCore.coreStabilityScore))}
              style={{ width: `${identityCore.coreStabilityScore}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Immutable elements */}
            {identityCore.immutable.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Immuables ({identityCore.immutable.length})
                </p>
                <div className="space-y-1.5">
                  {identityCore.immutable.map((el) => (
                    <div key={el.id} className="flex items-start gap-2 text-xs">
                      <span className="shrink-0 text-emerald-600 dark:text-emerald-400 font-bold">
                        ■
                      </span>
                      <div>
                        <span className="font-medium">{el.element}</span>
                        <p className="text-muted-foreground">{el.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mutable elements */}
            {identityCore.mutable.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Mutables ({identityCore.mutable.length})
                </p>
                <div className="space-y-1.5">
                  {identityCore.mutable.map((el) => (
                    <div key={el.id} className="flex items-start gap-2 text-xs">
                      <span className="shrink-0 text-amber-600 dark:text-amber-400 font-bold">
                        ○
                      </span>
                      <div>
                        <span className="font-medium">{el.element}</span>
                        <p className="text-muted-foreground">{el.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Drift Indicators ── */}
        {driftDetection.indicators.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Indicateurs de dérive ({driftDetection.indicators.length})
              </p>
              <span className={cn("font-mono text-xs font-semibold", scoreColor(100 - driftDetection.overallDriftScore))}>
                Dérive : {driftDetection.overallDriftScore}/100
              </span>
            </div>

            <div className="space-y-3">
              {driftDetection.indicators.map((ind) => (
                <div key={ind.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{ind.indicator}</span>
                      {ind.alert && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] px-1.5 py-0"
                        >
                          ALERTE
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-muted-foreground font-mono">
                        {ind.direction === "UP" ? "↑" : ind.direction === "DOWN" ? "↓" : "↔"}
                      </span>
                      <span className="font-mono font-semibold">
                        {ind.driftMagnitude.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Current vs baseline bars */}
                  <div className="space-y-1">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          Actuel
                        </span>
                        <span className="font-mono text-[10px]">
                          {ind.currentValue}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full transition-all", driftBarColor(ind.driftMagnitude))}
                          style={{ width: `${Math.min(100, ind.currentValue)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          Référence
                        </span>
                        <span className="font-mono text-[10px]">
                          {ind.baselineValue}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all bg-slate-400 dark:bg-slate-500"
                          style={{ width: `${Math.min(100, ind.baselineValue)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recommendations ── */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          {/* Drift recommendation */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Recommandation dérive
            </p>
            <p className="text-sm">{driftDetection.recommendation}</p>
          </div>

          {/* Lifecycle recommendations */}
          {lifecycleStage.recommendations.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Recommandations stratégiques
              </p>
              <div className="space-y-0.5">
                {lifecycleStage.recommendations.map((rec, i) => (
                  <p key={i} className="text-xs">
                    {i + 1}. {rec}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
