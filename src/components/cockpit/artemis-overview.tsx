// =============================================================================
// C.COCKPIT.01 — ARTEMIS Overview
// =============================================================================
// Main cockpit view displaying the 9 concentric ARTEMIS layers, their
// frameworks, global score, and orchestration controls.
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
import { Button } from "~/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FrameworkStatus {
  id: string;
  name: string;
  layer: string;
  status: "complete" | "stale" | "error" | "pending" | "running";
  hasImplementation: boolean;
}

interface ArtemisOverviewProps {
  layers: {
    name: string;
    label: string;
    frameworks: FrameworkStatus[];
    score: number | null;
  }[];
  globalScore: number | null;
  isOrchestrating: boolean;
  onOrchestrate?: () => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<
  FrameworkStatus["status"],
  { bg: string; ring: string; text: string; label: string }
> = {
  complete: {
    bg: "bg-emerald-500",
    ring: "ring-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Complet",
  },
  stale: {
    bg: "bg-amber-500",
    ring: "ring-amber-500/30",
    text: "text-amber-700 dark:text-amber-400",
    label: "Obsolete",
  },
  error: {
    bg: "bg-red-500",
    ring: "ring-red-500/30",
    text: "text-red-700 dark:text-red-400",
    label: "Erreur",
  },
  pending: {
    bg: "bg-slate-400",
    ring: "ring-slate-400/30",
    text: "text-slate-600 dark:text-slate-400",
    label: "En attente",
  },
  running: {
    bg: "bg-blue-500",
    ring: "ring-blue-500/30",
    text: "text-blue-700 dark:text-blue-400",
    label: "En cours",
  },
};

const NO_IMPL_COLOR = {
  bg: "bg-slate-300 dark:bg-slate-600",
  ring: "ring-slate-300/30",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreVariant(score: number | null): "success" | "warning" | "destructive" | "secondary" {
  if (score === null) return "secondary";
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "destructive";
}

function scoreLabel(score: number | null): string {
  if (score === null) return "--";
  return `${score}/100`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FrameworkDot({ framework }: { framework: FrameworkStatus }) {
  if (!framework.hasImplementation) {
    return (
      <span
        title={`${framework.name} (non implémenté)`}
        className={cn(
          "inline-block h-3 w-3 rounded-full",
          NO_IMPL_COLOR.bg,
          "ring-1",
          NO_IMPL_COLOR.ring,
        )}
      />
    );
  }

  const colors = STATUS_COLORS[framework.status];
  return (
    <span
      title={`${framework.name} — ${colors.label}`}
      className={cn(
        "inline-block h-3 w-3 rounded-full ring-1",
        colors.bg,
        colors.ring,
        framework.status === "running" && "animate-pulse",
      )}
    />
  );
}

function LayerRow({
  layer,
}: {
  layer: ArtemisOverviewProps["layers"][number];
}) {
  const variant = scoreVariant(layer.score);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50">
      {/* Layer name + score */}
      <div className="flex min-w-[180px] items-center gap-2">
        <span className="text-sm font-medium leading-none">{layer.label}</span>
        <Badge variant={variant} className="ml-auto text-[10px] px-1.5 py-0">
          {scoreLabel(layer.score)}
        </Badge>
      </div>

      {/* Framework dots */}
      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        {layer.frameworks.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">
            Aucun framework
          </span>
        ) : (
          layer.frameworks.map((fw) => (
            <FrameworkDot key={fw.id} framework={fw} />
          ))
        )}
      </div>

      {/* Framework count */}
      <span className="text-xs text-muted-foreground tabular-nums">
        {layer.frameworks.filter((f) => f.hasImplementation).length}/
        {layer.frameworks.length}
      </span>
    </div>
  );
}

function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {Object.entries(STATUS_COLORS).map(([key, colors]) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block h-2.5 w-2.5 rounded-full",
              colors.bg,
              key === "running" && "animate-pulse",
            )}
          />
          {colors.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span
          className={cn(
            "inline-block h-2.5 w-2.5 rounded-full",
            NO_IMPL_COLOR.bg,
          )}
        />
        Non implémenté
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ArtemisOverview({
  layers,
  globalScore,
  isOrchestrating,
  onOrchestrate,
  className,
}: ArtemisOverviewProps) {
  const globalVariant = scoreVariant(globalScore);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg">
            ARTEMIS — Vue d&apos;Ensemble
          </CardTitle>
          <Badge variant={globalVariant} className="text-xs">
            Score global : {scoreLabel(globalScore)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Layer rows */}
        <div className="space-y-1.5">
          {layers.map((layer) => (
            <LayerRow key={layer.name} layer={layer} />
          ))}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-border/50">
          <StatusLegend />
        </div>

        {/* Orchestration button */}
        {onOrchestrate && (
          <div className="flex justify-end pt-2">
            <Button
              onClick={onOrchestrate}
              disabled={isOrchestrating}
              loading={isOrchestrating}
              variant="gradient"
              size="lg"
            >
              {isOrchestrating
                ? "Orchestration en cours..."
                : "Lancer l'orchestration"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
