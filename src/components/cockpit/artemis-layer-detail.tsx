// =============================================================================
// C.COCKPIT.02 — ARTEMIS Layer Detail
// =============================================================================
// Detail view for a single ARTEMIS layer, showing individual framework cards
// with status, metadata, I/O variables, and execution controls.
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

interface FrameworkDetail {
  id: string;
  name: string;
  category: string;
  status: "complete" | "stale" | "error" | "pending" | "running";
  hasImplementation: boolean;
  lastRunAt: string | null;
  durationMs: number | null;
  errorMessage: string | null;
  inputVariables: string[];
  outputVariables: string[];
}

interface ArtemisLayerDetailProps {
  layerName: string;
  layerLabel: string;
  layerScore: number | null;
  frameworks: FrameworkDetail[];
  onExecuteFramework?: (frameworkId: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  FrameworkDetail["status"],
  { variant: "success" | "warning" | "destructive" | "secondary" | "info"; label: string }
> = {
  complete: { variant: "success", label: "Complet" },
  stale: { variant: "warning", label: "Obsolete" },
  error: { variant: "destructive", label: "Erreur" },
  pending: { variant: "secondary", label: "En attente" },
  running: { variant: "info", label: "En cours" },
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

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FrameworkCard({
  framework,
  onExecute,
}: {
  framework: FrameworkDetail;
  onExecute?: (id: string) => void;
}) {
  const statusCfg = STATUS_CONFIG[framework.status];
  const isRunning = framework.status === "running";

  return (
    <Card variant="outlined" className="gap-3 py-3 md:gap-4 md:py-4">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5">
            <CardTitle className="text-sm">{framework.name}</CardTitle>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {framework.category}
              </Badge>
              <Badge
                variant={statusCfg.variant}
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  isRunning && "animate-pulse",
                )}
              >
                {statusCfg.label}
              </Badge>
            </div>
          </div>

          {/* Execute button */}
          {framework.hasImplementation && onExecute && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onExecute(framework.id)}
              disabled={isRunning}
              loading={isRunning}
            >
              {isRunning ? "Exec..." : "Exécuter"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Last run + duration */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {framework.lastRunAt ? (
            <span>
              Dernière exécution : {formatTimestamp(framework.lastRunAt)}
            </span>
          ) : (
            <span className="italic">Jamais exécuté</span>
          )}
          {framework.durationMs !== null && (
            <span>Durée : {formatDuration(framework.durationMs)}</span>
          )}
        </div>

        {/* I/O variable counts */}
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="font-medium text-foreground">
              {framework.inputVariables.length}
            </span>
            variable{framework.inputVariables.length !== 1 ? "s" : ""} en
            entrée
          </span>
          <span className="text-muted-foreground/40">|</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="font-medium text-foreground">
              {framework.outputVariables.length}
            </span>
            variable{framework.outputVariables.length !== 1 ? "s" : ""} en
            sortie
          </span>
        </div>

        {/* Not implemented indicator */}
        {!framework.hasImplementation && (
          <p className="text-xs italic text-muted-foreground">
            Implémentation non disponible
          </p>
        )}

        {/* Error message */}
        {framework.errorMessage && (
          <div className="rounded-md bg-red-500/10 px-2.5 py-1.5 text-xs text-red-700 dark:text-red-400">
            {framework.errorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ArtemisLayerDetail({
  layerName,
  layerLabel,
  layerScore,
  frameworks,
  onExecuteFramework,
  className,
}: ArtemisLayerDetailProps) {
  const variant = scoreVariant(layerScore);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold font-[var(--font-display)]">
          {layerLabel}
        </h2>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase tracking-wider">
          {layerName}
        </Badge>
        <Badge variant={variant} className="text-xs">
          {layerScore !== null ? `${layerScore}/100` : "--"}
        </Badge>
      </div>

      {/* Framework grid */}
      {frameworks.length === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          Aucun framework dans cette couche
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {frameworks.map((fw) => (
            <FrameworkCard
              key={fw.id}
              framework={fw}
              onExecute={onExecuteFramework}
            />
          ))}
        </div>
      )}
    </div>
  );
}
