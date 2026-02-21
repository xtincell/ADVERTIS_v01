// ==========================================================================
// C.U2 — Source Ref Tooltip
// Data source reference tooltip.
// ==========================================================================

"use client";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { FreshnessBadge } from "~/components/ui/freshness-badge";
import { PILLAR_CONFIG, type PillarType } from "~/lib/constants";
import { cn } from "~/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SourceRefData {
  pillar: string;
  variableKey: string;
  variableValue: string;
  why: string;
  updatedAt: string;
  source: string;
}

interface SourceRefTooltipProps {
  sourceRef: SourceRefData;
  vertical?: string | null;
  children: React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SOURCE_LABELS: Record<string, string> = {
  generation: "Généré par AI",
  manual: "Saisie manuelle",
  market_study: "Étude de marché",
};

export function SourceRefTooltip({
  sourceRef,
  vertical,
  children,
  className,
}: SourceRefTooltipProps) {
  const pillarConfig = PILLAR_CONFIG[sourceRef.pillar as PillarType];
  const pillarTitle = pillarConfig?.title ?? sourceRef.pillar;
  const pillarColor = pillarConfig?.color ?? "#6b7280";

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "cursor-help border-b border-dashed border-muted-foreground/30 transition-colors hover:border-terracotta",
              className,
            )}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-sm rounded-lg border bg-popover p-3 shadow-lg"
        >
          <div className="space-y-2">
            {/* Pillar badge */}
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                style={{ backgroundColor: pillarColor }}
              >
                {sourceRef.pillar}
              </span>
              <span className="text-xs font-semibold">{pillarTitle}</span>
              <FreshnessBadge date={sourceRef.updatedAt} vertical={vertical} />
            </div>

            {/* Variable info */}
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <span className="shrink-0 text-[10px] font-semibold uppercase text-muted-foreground">
                  Variable :
                </span>
                <span className="font-mono text-[10px]">{sourceRef.variableKey}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="shrink-0 text-[10px] font-semibold uppercase text-muted-foreground">
                  Valeur :
                </span>
                <span className="text-[10px] font-medium">{sourceRef.variableValue}</span>
              </div>
            </div>

            {/* Why — the justification */}
            <div className="rounded-md bg-muted/50 px-2.5 py-1.5">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                Pourquoi
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">
                {sourceRef.why}
              </p>
            </div>

            {/* Source */}
            <div className="text-[10px] text-muted-foreground">
              Source : {SOURCE_LABELS[sourceRef.source] ?? sourceRef.source}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
