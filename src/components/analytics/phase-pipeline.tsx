// Phase Pipeline — Horizontal stacked bar showing brand count per phase.
// Pure CSS/HTML, no external chart lib.

"use client";

import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PhasePipelineProps {
  data: Array<{ phase: string; label: string; count: number; order?: number }>;
  totalBrands: number;
}

// ---------------------------------------------------------------------------
// Colour palette (mapped to phase order)
// ---------------------------------------------------------------------------

const PHASE_COLORS: Record<string, string> = {
  fiche: "#c49a3c",
  "fiche-review": "#d4aa4c",
  "audit-r": "#c43c6e",
  "market-study": "#3c7ac4",
  "audit-t": "#8c3cc4",
  "audit-review": "#a05cd4",
  implementation: "#3cc4c4",
  cockpit: "#2d5a3d",
  complete: "#22c55e",
};

const DEFAULT_COLOR = "#6b7280";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PhasePipeline({ data, totalBrands }: PhasePipelineProps) {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [data],
  );

  if (totalBrands === 0) {
    return (
      <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
        Aucune marque
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-3">
        {/* Stacked bar */}
        <div className="flex h-10 overflow-hidden rounded-lg">
          {sortedData.map((d) => {
            const pct = (d.count / totalBrands) * 100;
            if (pct === 0) return null;
            const color = PHASE_COLORS[d.phase] ?? DEFAULT_COLOR;
            return (
              <Tooltip key={d.phase}>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center justify-center text-xs font-medium text-white transition-all hover:brightness-110"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                      minWidth: pct > 0 ? "24px" : 0,
                    }}
                  >
                    {pct >= 10 ? d.count : ""}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{d.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.count} marque{d.count > 1 ? "s" : ""} ({Math.round(pct)}%)
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Phase labels below the bar */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {sortedData.map((d) => {
            const color = PHASE_COLORS[d.phase] ?? DEFAULT_COLOR;
            return (
              <div key={d.phase} className="flex items-center gap-1.5 text-xs">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">
                  {d.label} ({d.count})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
