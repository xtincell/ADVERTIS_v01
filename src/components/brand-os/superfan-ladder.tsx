// =============================================================================
// C.BRANDOS.1 — Superfan Ladder
// =============================================================================
// Interactive visualization of the 6-stage superfan journey from AUDIENCE
// to EVANGELIST. Consumes "superfan_ladder" widget data and renders a
// vertical progression ladder with metrics, transitions, and status.
//
// Used by: Cockpit dashboard, ARTEMIS overview page
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StageData {
  stage: string;
  label: string;
  population: number;
  conversionRate: number;
  emotionalShift: string;
  keyExperience: string;
  triggerCondition: string;
  proofOfTransition: string;
  status: "active" | "designed" | "missing";
}

interface SuperfanLadderProps {
  stages: StageData[];
  brandCoherenceScore: number | null;
  bottleneckStage: string | null;
  insights: string[];
  hasFrameworkData: boolean;
  className?: string;
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Stage colors
// ---------------------------------------------------------------------------

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  AUDIENCE: { bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-300 dark:border-slate-600", text: "text-slate-700 dark:text-slate-300" },
  FOLLOWER: { bg: "bg-blue-50 dark:bg-blue-950", border: "border-blue-300 dark:border-blue-700", text: "text-blue-700 dark:text-blue-300" },
  ENGAGED: { bg: "bg-indigo-50 dark:bg-indigo-950", border: "border-indigo-300 dark:border-indigo-700", text: "text-indigo-700 dark:text-indigo-300" },
  FAN: { bg: "bg-purple-50 dark:bg-purple-950", border: "border-purple-300 dark:border-purple-700", text: "text-purple-700 dark:text-purple-300" },
  SUPERFAN: { bg: "bg-fuchsia-50 dark:bg-fuchsia-950", border: "border-fuchsia-300 dark:border-fuchsia-700", text: "text-fuchsia-700 dark:text-fuchsia-300" },
  EVANGELIST: { bg: "bg-amber-50 dark:bg-amber-950", border: "border-amber-400 dark:border-amber-600", text: "text-amber-700 dark:text-amber-300" },
};

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Actif", variant: "default" },
  designed: { label: "Conçu", variant: "secondary" },
  missing: { label: "Manquant", variant: "destructive" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SuperfanLadder({
  stages,
  brandCoherenceScore,
  bottleneckStage,
  insights,
  hasFrameworkData,
  className,
  compact = false,
}: SuperfanLadderProps) {
  return (
    <Card className={cn("w-full", className)} data-slot="superfan-ladder">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {compact ? "Superfan" : "Échelle Superfan"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {brandCoherenceScore != null && (
              <Badge variant="outline" className="font-mono text-xs">
                Cohérence: {brandCoherenceScore}/100
              </Badge>
            )}
            {!hasFrameworkData && (
              <Badge variant="secondary" className="text-xs">
                Sans FW-11
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {/* Ladder visualization — bottom to top */}
        <div className="flex flex-col-reverse gap-1">
          {stages.map((stage, idx) => {
            const colors = STAGE_COLORS[stage.stage] ?? STAGE_COLORS.AUDIENCE!;
            const statusBadge = STATUS_BADGES[stage.status] ?? STATUS_BADGES.designed!;
            const isBottleneck = stage.stage === bottleneckStage;

            return (
              <Tooltip key={stage.stage}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg border px-3 py-2 transition-all hover:shadow-sm",
                      colors.bg,
                      colors.border,
                      isBottleneck && "ring-2 ring-red-400/50",
                    )}
                  >
                    {/* Stage number */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        colors.text,
                        colors.bg,
                        "border",
                        colors.border,
                      )}
                    >
                      {idx + 1}
                    </div>

                    {/* Stage info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium text-sm", colors.text)}>
                          {stage.label}
                        </span>
                        <Badge variant={statusBadge.variant} className="text-[10px] px-1.5 py-0">
                          {statusBadge.label}
                        </Badge>
                        {isBottleneck && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Goulot
                          </Badge>
                        )}
                      </div>
                      {!compact && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {stage.keyExperience}
                        </p>
                      )}
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-center">
                        <div className="font-mono font-semibold">{stage.population}%</div>
                        <div className="text-muted-foreground text-[10px]">pop.</div>
                      </div>
                      {idx > 0 && (
                        <div className="text-center">
                          <div
                            className={cn(
                              "font-mono font-semibold",
                              stage.conversionRate < 20
                                ? "text-red-500"
                                : stage.conversionRate < 40
                                  ? "text-amber-500"
                                  : "text-emerald-500",
                            )}
                          >
                            {stage.conversionRate}%
                          </div>
                          <div className="text-muted-foreground text-[10px]">conv.</div>
                        </div>
                      )}
                    </div>

                    {/* Connection line to next stage */}
                    {idx < stages.length - 1 && (
                      <div className="absolute -bottom-1.5 left-6 h-2 w-px bg-border" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm">
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{stage.label}</p>
                    <p>
                      <span className="text-muted-foreground">Déclencheur :</span>{" "}
                      {stage.triggerCondition}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Cible émotionnelle :</span>{" "}
                      {stage.emotionalShift}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Preuve :</span>{" "}
                      {stage.proofOfTransition}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Insights */}
        {!compact && insights.length > 0 && (
          <div className="mt-4 rounded-lg border border-dashed p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Insights
            </p>
            {insights.map((insight, i) => (
              <p key={i} className="text-xs text-muted-foreground">
                {insight}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
