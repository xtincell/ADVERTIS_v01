// ==========================================================================
// COMPONENT C.K21 — ScoreTriad
// Compact 3-score display: Coherence, Risk, BMF. Tap to expand breakdown.
// ==========================================================================

"use client";

import { useState } from "react";
import { getScoreColor, getScoreLabel } from "./cockpit-shared";
import type {
  CoherenceBreakdownData,
  RiskBreakdownData,
  BmfBreakdownData,
} from "./cockpit-shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface ScoreTriadProps {
  coherence: number | null;
  risk: number | null;
  bmf: number | null;
  coherenceBreakdown?: CoherenceBreakdownData | null;
  riskBreakdown?: RiskBreakdownData | null;
  bmfBreakdown?: BmfBreakdownData | null;
}

interface ScoreItemProps {
  value: number | null;
  label: string;
  invertColor?: boolean;
  onClick: () => void;
}

function ScoreItem({ value, label, invertColor, onClick }: ScoreItemProps) {
  const displayValue = value != null ? Math.round(value) : "—";
  const colorClass =
    value != null
      ? invertColor
        ? getScoreColor(100 - value) // Invert for risk (high = bad)
        : getScoreColor(value)
      : "text-muted-foreground";

  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-1 rounded-xl border bg-card p-3 transition-colors hover:border-terracotta/30 active:bg-accent"
    >
      <span className={`text-2xl font-bold ${colorClass}`}>{displayValue}</span>
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}

export function ScoreTriad({
  coherence,
  risk,
  bmf,
  coherenceBreakdown,
  riskBreakdown,
  bmfBreakdown,
}: ScoreTriadProps) {
  const [openBreakdown, setOpenBreakdown] = useState<string | null>(null);

  const rawBreakdown =
    openBreakdown === "coherence"
      ? coherenceBreakdown
      : openBreakdown === "risk"
        ? riskBreakdown
        : openBreakdown === "bmf"
          ? bmfBreakdown
          : null;
  const breakdownData = rawBreakdown as Record<string, number> | null | undefined;

  const breakdownTitle =
    openBreakdown === "coherence"
      ? "Score de Cohérence"
      : openBreakdown === "risk"
        ? "Score de Risque"
        : "Brand-Market Fit";

  return (
    <>
      <div className="flex gap-3 px-4">
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
        />
        <ScoreItem
          value={bmf}
          label="BMF"
          onClick={() => setOpenBreakdown("bmf")}
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
