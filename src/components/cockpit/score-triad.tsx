// ==========================================================================
// COMPONENT C.K21 — ScoreQuad
// Compact 4-score display: Coherence, Risk, BMF, Invest. Tap to expand breakdown.
// ==========================================================================

"use client";

import { useState } from "react";
import { getScoreColor, getScoreLabel } from "./cockpit-shared";
import type {
  CoherenceBreakdownData,
  RiskBreakdownData,
  BmfBreakdownData,
  InvestBreakdownData,
} from "./cockpit-shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface ScoreQuadProps {
  coherence: number | null;
  risk: number | null;
  bmf: number | null;
  invest: number | null;
  coherenceBreakdown?: CoherenceBreakdownData | null;
  riskBreakdown?: RiskBreakdownData | null;
  bmfBreakdown?: BmfBreakdownData | null;
  investBreakdown?: InvestBreakdownData | null;
}

// Keep backward-compatible export name
export type ScoreTriadProps = ScoreQuadProps;

interface ScoreItemProps {
  value: number | null;
  label: string;
  invertColor?: boolean;
  onClick: () => void;
  hint?: string;
}

function ScoreItem({ value, label, invertColor, onClick, hint }: ScoreItemProps) {
  const displayValue = value != null ? Math.round(value) : "—";
  const colorClass =
    value != null
      ? invertColor
        ? getScoreColor(100 - value) // Invert for risk (high = bad)
        : getScoreColor(value)
      : "text-muted-foreground";

  const button = (
    <button
      onClick={onClick}
      className="group flex flex-1 flex-col items-center gap-1 rounded-xl border bg-card p-3 transition-colors hover:border-primary/30 active:bg-accent"
    >
      <span className={`text-2xl font-bold animate-count-up group-hover:scale-110 transition-transform ${colorClass}`}>{displayValue}</span>
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </button>
  );

  if (value == null && hint) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px] text-xs">
            {hint}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

export function ScoreTriad({
  coherence,
  risk,
  bmf,
  invest,
  coherenceBreakdown,
  riskBreakdown,
  bmfBreakdown,
  investBreakdown,
}: ScoreQuadProps) {
  const [openBreakdown, setOpenBreakdown] = useState<string | null>(null);

  const rawBreakdown =
    openBreakdown === "coherence"
      ? coherenceBreakdown
      : openBreakdown === "risk"
        ? riskBreakdown
        : openBreakdown === "bmf"
          ? bmfBreakdown
          : openBreakdown === "invest"
            ? investBreakdown
            : null;
  const breakdownData = rawBreakdown as Record<string, number> | null | undefined;

  const breakdownTitle =
    openBreakdown === "coherence"
      ? "Score de Cohérence"
      : openBreakdown === "risk"
        ? "Score de Risque"
        : openBreakdown === "invest"
          ? "Score d'Investissement"
          : "Brand-Market Fit";

  return (
    <>
      <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-4 stagger-children">
        <ScoreItem
          value={coherence}
          label="Cohérence"
          onClick={() => setOpenBreakdown("coherence")}
        />
        <ScoreItem
          value={risk}
          label="Risque"
          invertColor
          onClick={() => setOpenBreakdown("risk")}
          hint="Complétez le pilier R pour débloquer"
        />
        <ScoreItem
          value={bmf}
          label="BMF"
          onClick={() => setOpenBreakdown("bmf")}
          hint="Complétez le pilier T pour débloquer"
        />
        <ScoreItem
          value={invest}
          label="Invest"
          onClick={() => setOpenBreakdown("invest")}
          hint="Complétez le pilier I pour débloquer"
        />
      </div>

      {/* Breakdown dialog */}
      <Dialog open={!!openBreakdown} onOpenChange={() => setOpenBreakdown(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{breakdownTitle}</DialogTitle>
          </DialogHeader>
          {breakdownData ? (
            <div className="space-y-2">
              {Object.entries(breakdownData).map(([key, value]) => {
                if (key === "total") return null;
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="font-medium">{typeof value === "number" ? Math.round(value) : value}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Pas de données détaillées disponibles.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Backward compatibility alias
export const ScoreQuad = ScoreTriad;
