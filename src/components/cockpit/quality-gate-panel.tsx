// =============================================================================
// C.COCKPIT.03 — Quality Gate Panel
// =============================================================================
// Visualization of ARTEMIS quality gates showing pass/fail status, scores,
// detail items, and blockers for each gate.
// =============================================================================

"use client";

import { useMemo } from "react";
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

interface QualityGateData {
  gateId: string;
  name: string;
  passed: boolean;
  score: number;
  details: string[];
  blockers: string[];
}

interface QualityGatePanelProps {
  gates: QualityGateData[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreBarColor(score: number): {
  bg: string;
  track: string;
  text: string;
} {
  if (score >= 70)
    return {
      bg: "bg-emerald-500",
      track: "bg-emerald-500/15",
      text: "text-emerald-700 dark:text-emerald-400",
    };
  if (score >= 40)
    return {
      bg: "bg-amber-500",
      track: "bg-amber-500/15",
      text: "text-amber-700 dark:text-amber-400",
    };
  return {
    bg: "bg-red-500",
    track: "bg-red-500/15",
    text: "text-red-700 dark:text-red-400",
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function OverallBanner({
  passedCount,
  totalCount,
}: {
  passedCount: number;
  totalCount: number;
}) {
  const allPassed = passedCount === totalCount;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
        allPassed
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      )}
    >
      <span className="text-base">{allPassed ? "\u2713" : "\u26A0"}</span>
      {allPassed
        ? "Toutes les portes de qualité sont validées"
        : `${totalCount - passedCount} porte${totalCount - passedCount !== 1 ? "s" : ""} de qualité non validée${totalCount - passedCount !== 1 ? "s" : ""}`}
    </div>
  );
}

function GateCard({ gate }: { gate: QualityGateData }) {
  const colors = scoreBarColor(gate.score);
  const clampedScore = Math.max(0, Math.min(100, gate.score));

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2.5">
      {/* Gate header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
              gate.passed
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-red-500/15 text-red-700 dark:text-red-400",
            )}
          >
            {gate.passed ? "\u2713" : "\u2717"}
          </span>
          <span className="text-sm font-medium">{gate.name}</span>
        </div>
        <span className={cn("text-xs font-semibold tabular-nums", colors.text)}>
          {clampedScore}/100
        </span>
      </div>

      {/* Score bar */}
      <div className={cn("relative h-2 w-full overflow-hidden rounded-full", colors.track)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colors.bg)}
          style={{ width: `${clampedScore}%` }}
        />
      </div>

      {/* Details */}
      {gate.details.length > 0 && (
        <ul className="space-y-0.5">
          {gate.details.map((detail, i) => (
            <li key={i} className="text-xs text-muted-foreground leading-relaxed">
              {detail}
            </li>
          ))}
        </ul>
      )}

      {/* Blockers */}
      {gate.blockers.length > 0 && (
        <div className="space-y-0.5">
          {gate.blockers.map((blocker, i) => (
            <p
              key={i}
              className="text-xs font-medium text-red-600 dark:text-red-400 leading-relaxed"
            >
              Bloqueur : {blocker}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QualityGatePanel({ gates, className }: QualityGatePanelProps) {
  const passedCount = useMemo(
    () => gates.filter((g) => g.passed).length,
    [gates],
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Quality Gates</CardTitle>
        <Badge
          variant={passedCount === gates.length ? "success" : "warning"}
          className="text-xs"
        >
          {passedCount}/{gates.length} validées
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Overall status banner */}
        <OverallBanner passedCount={passedCount} totalCount={gates.length} />

        {/* Gate cards */}
        <div className="space-y-2">
          {gates.map((gate) => (
            <GateCard key={gate.gateId} gate={gate} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
