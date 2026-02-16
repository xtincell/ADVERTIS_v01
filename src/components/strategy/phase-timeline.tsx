"use client";

import {
  ClipboardList,
  ClipboardEdit,
  Shield,
  Globe,
  BarChart3,
  FileText,
  LayoutDashboard,
  CheckCircle,
  Lock,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { PHASE_CONFIG, LEGACY_PHASE_MAP, PHASES } from "~/lib/constants";
import type { Phase } from "~/lib/constants";

interface PhaseTimelineProps {
  currentPhase: Phase;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const PHASE_ICONS: Record<string, React.ComponentType<{ className?: string }>> =
  {
    ClipboardList,
    ClipboardEdit,
    Shield,
    Globe,
    BarChart3,
    FileText,
    LayoutDashboard,
    CheckCircle,
  };

// Use the canonical PHASES order from constants (9 phases)
const PHASE_ORDER: Phase[] = [...PHASES];

function getPhaseStatus(
  phase: Phase,
  currentPhase: Phase,
): "complete" | "active" | "locked" {
  // Resolve legacy phase names (e.g. "audit" → "audit-r")
  const resolvedCurrent =
    (LEGACY_PHASE_MAP[currentPhase] as Phase) ?? currentPhase;

  const currentIndex = PHASE_ORDER.indexOf(resolvedCurrent);
  const phaseIndex = PHASE_ORDER.indexOf(phase);

  if (phaseIndex < currentIndex) return "complete";
  if (phaseIndex === currentIndex) return "active";
  return "locked";
}

export function PhaseTimeline({
  currentPhase,
  className,
  orientation = "horizontal",
}: PhaseTimelineProps) {
  const displayPhases = PHASE_ORDER.filter((p) => p !== "complete");

  return (
    <div
      className={cn(
        "flex gap-2",
        orientation === "vertical" ? "flex-col" : "flex-row items-center overflow-x-auto pb-2",
        className,
      )}
      role="list"
      aria-label="Pipeline de génération — phases"
    >
      {displayPhases.map((phase, index) => {
        const config = PHASE_CONFIG[phase];
        const status = getPhaseStatus(phase, currentPhase);
        const Icon = PHASE_ICONS[config.icon] ?? CheckCircle;

        return (
          <div key={phase} className="flex shrink-0 items-center gap-2" role="listitem">
            {/* Phase item */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all",
                status === "complete" &&
                  "border-green-200 bg-green-50 text-green-700",
                status === "active" &&
                  "border-terracotta/30 bg-terracotta/5 text-terracotta ring-2 ring-terracotta/20",
                status === "locked" &&
                  "border-muted bg-muted/30 text-muted-foreground opacity-60",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  status === "complete" && "bg-green-100",
                  status === "active" && "bg-terracotta/10",
                  status === "locked" && "bg-muted",
                )}
              >
                {status === "complete" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : status === "active" ? (
                  <Icon className="h-4 w-4 text-terracotta" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium leading-tight",
                    status === "active" && "text-terracotta",
                  )}
                >
                  {config.title}
                </p>
                {orientation === "vertical" && (
                  <p className="text-xs text-muted-foreground">
                    {config.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {index < displayPhases.length - 1 && (
              <div
                className={cn(
                  orientation === "vertical" ? "ml-7 h-4 w-0.5" : "h-0.5 w-4",
                  status === "complete" ? "bg-green-300" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase Badge — compact version for headers
// ---------------------------------------------------------------------------

interface PhaseBadgeProps {
  phase: Phase;
  className?: string;
}

export function PhaseBadge({ phase, className }: PhaseBadgeProps) {
  // Resolve legacy phase names
  const resolvedPhase =
    (LEGACY_PHASE_MAP[phase] as Phase) ?? phase;
  const config = PHASE_CONFIG[resolvedPhase];
  const Icon = PHASE_ICONS[config.icon] ?? CheckCircle;

  const phaseIndex = PHASE_ORDER.indexOf(resolvedPhase);
  const displayIndex = resolvedPhase === "complete" ? 8 : phaseIndex + 1;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
        phase === "complete"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-terracotta/30 bg-terracotta/5 text-terracotta",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>
        Phase {displayIndex} : {config.title}
      </span>
    </div>
  );
}
