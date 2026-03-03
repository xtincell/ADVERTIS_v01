// ==========================================================================
// C.OS6 — Opportunity Radar
// Detected opportunities for brand activation, scored and timed.
// ==========================================================================

"use client";

import { OPPORTUNITY_TYPES, type OpportunityType } from "~/lib/types/brand-os";

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  type: string;
  relevance: number;
  timing: string;
  estimatedROI: string | null;
  budgetNeeded: number | null;
  channels: unknown;
  status: string;
  expiresAt: Date | string | null;
}

interface OpportunityRadarProps {
  opportunities: Opportunity[];
}

const TIMING_CONFIG: Record<string, { label: string; color: string }> = {
  NOW:          { label: "Maintenant", color: "#ef4444" },
  THIS_WEEK:    { label: "Cette semaine", color: "#f59e0b" },
  THIS_MONTH:   { label: "Ce mois", color: "#3b82f6" },
  THIS_QUARTER: { label: "Ce trimestre", color: "#6b7280" },
};

const ROI_CONFIG: Record<string, { label: string; dots: number }> = {
  LOW:       { label: "Faible", dots: 1 },
  MEDIUM:    { label: "Moyen", dots: 2 },
  HIGH:      { label: "Élevé", dots: 3 },
  VERY_HIGH: { label: "Très élevé", dots: 4 },
};

export function OpportunityRadar({ opportunities }: OpportunityRadarProps) {
  const active = opportunities.filter((o) => o.status === "NEW" || o.status === "EVALUATED");

  // Sort by relevance (desc) then timing urgency
  const timingOrder = ["NOW", "THIS_WEEK", "THIS_MONTH", "THIS_QUARTER"];
  const sorted = [...active].sort((a, b) => {
    const timingDiff = timingOrder.indexOf(a.timing) - timingOrder.indexOf(b.timing);
    if (timingDiff !== 0) return timingDiff;
    return b.relevance - a.relevance;
  });

  return (
    <div className="space-y-3">
      {sorted.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Aucune opportunité détectée pour le moment.</p>
          <p className="text-xs mt-1">Le radar scanne en continu les tendances et brèches concurrentielles.</p>
        </div>
      )}

      {sorted.map((opp) => {
        const typeConfig = OPPORTUNITY_TYPES[opp.type as OpportunityType];
        const timingCfg = TIMING_CONFIG[opp.timing] ?? { label: "Ce mois", color: "#3b82f6" };
        const roiCfg = opp.estimatedROI ? ROI_CONFIG[opp.estimatedROI] : null;
        const channels = Array.isArray(opp.channels) ? (opp.channels as string[]) : [];

        return (
          <div
            key={opp.id}
            className="rounded-xl border border-border/40 bg-card/30 p-4 space-y-2"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {typeConfig && (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${typeConfig.color}15`, color: typeConfig.color }}
                    >
                      {typeConfig.labelFr}
                    </span>
                  )}
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: timingCfg.color }}
                  >
                    {timingCfg.label}
                  </span>
                </div>
                <h4 className="text-sm font-semibold">{opp.title}</h4>
                {opp.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {opp.description}
                  </p>
                )}
              </div>

              {/* Relevance score */}
              <div className="shrink-0 flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2"
                  style={{
                    borderColor: opp.relevance > 70 ? "#22c55e" : opp.relevance > 40 ? "#f59e0b" : "#6b7280",
                    color: opp.relevance > 70 ? "#22c55e" : opp.relevance > 40 ? "#f59e0b" : "#6b7280",
                  }}
                >
                  {Math.round(opp.relevance)}
                </div>
                <span className="text-[9px] text-muted-foreground mt-0.5">pertinence</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Channels */}
              {channels.length > 0 && (
                <div className="flex gap-1">
                  {channels.map((ch) => (
                    <span key={ch} className="text-[10px] px-1.5 py-0.5 rounded bg-muted-foreground/5 text-muted-foreground">
                      {ch}
                    </span>
                  ))}
                </div>
              )}

              {/* ROI estimate */}
              {roiCfg && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">ROI:</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < roiCfg.dots ? "bg-green-500" : "bg-muted-foreground/15"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Budget */}
              {opp.budgetNeeded != null && (
                <span className="text-[10px] text-muted-foreground">
                  Budget: {opp.budgetNeeded.toLocaleString("fr-FR")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
