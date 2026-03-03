// ==========================================================================
// C.OS7 — Devotion Ladder
// Horizontal 6-stage loyalty ladder with large counts and conversion rates.
// Visual style inspired by V1 mockup — progressive stages with % flow.
// ==========================================================================

"use client";

import { SUPERFAN_SEGMENTS, FUNNEL_ORDER, type SuperfanSegment } from "~/lib/types/brand-os";

interface FunnelData {
  segment: string;
  count: number;
}

interface DevotionLadderProps {
  data: FunnelData[];
  totalCommunity?: number;
}

/** Compute conversion rate between two stages */
function conversionRate(from: number, to: number): string {
  if (from === 0) return "—";
  return `${((to / from) * 100).toFixed(1)}%`;
}

export function DevotionLadder({ data, totalCommunity }: DevotionLadderProps) {
  // Map data to ordered stages
  const stages = FUNNEL_ORDER.map((segment) => {
    const match = data.find((d) => d.segment === segment);
    return {
      segment,
      count: match?.count ?? 0,
      config: SUPERFAN_SEGMENTS[segment],
    };
  });

  // Use totalCommunity as the first stage count if provided and larger
  if (totalCommunity && totalCommunity > stages[0]!.count) {
    stages[0]!.count = totalCommunity;
  }

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Devotion Ladder
      </h3>
      <p className="text-xs text-muted-foreground">
        Progression de l&apos;audience vers l&apos;évangélisation — taux de conversion inter-étages
      </p>

      {/* ── Desktop: Horizontal ladder ── */}
      <div className="hidden md:block">
        <div className="flex items-end gap-1">
          {stages.map((stage, index) => {
            const heightPercent = Math.max(20, (stage.count / maxCount) * 100);
            const prevCount = index > 0 ? stages[index - 1]!.count : 0;
            const rate = index > 0 ? conversionRate(prevCount, stage.count) : null;

            return (
              <div key={stage.segment} className="flex-1 flex flex-col items-center gap-1">
                {/* Conversion arrow from previous stage */}
                {rate && (
                  <div className="flex items-center gap-0.5 mb-1">
                    <div className="w-3 h-px bg-muted-foreground/30" />
                    <span
                      className="text-[10px] font-bold tabular-nums px-1 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${stage.config.color}15`,
                        color: stage.config.color,
                      }}
                    >
                      {rate}
                    </span>
                    <div className="w-3 h-px bg-muted-foreground/30" />
                  </div>
                )}
                {!rate && <div className="h-6" />}

                {/* Count */}
                <span
                  className="text-lg font-black tabular-nums"
                  style={{ color: stage.config.color }}
                >
                  {stage.count.toLocaleString("fr-FR")}
                </span>

                {/* Bar */}
                <div
                  className="w-full rounded-t-lg transition-all duration-700 ease-out"
                  style={{
                    height: `${heightPercent}px`,
                    minHeight: "24px",
                    maxHeight: "120px",
                    backgroundColor: `${stage.config.color}25`,
                    borderTop: `3px solid ${stage.config.color}`,
                  }}
                />

                {/* Label */}
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider mt-1"
                  style={{ color: stage.config.color }}
                >
                  {stage.config.labelFr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: Vertical ladder with arrows ── */}
      <div className="md:hidden space-y-1">
        {stages.map((stage, index) => {
          const prevCount = index > 0 ? stages[index - 1]!.count : 0;
          const rate = index > 0 ? conversionRate(prevCount, stage.count) : null;
          const widthPercent = Math.max(25, (stage.count / maxCount) * 100);

          return (
            <div key={stage.segment}>
              {/* Conversion rate between stages */}
              {rate && (
                <div className="flex items-center justify-center py-0.5">
                  <div className="flex items-center gap-1">
                    <svg width="8" height="10" viewBox="0 0 8 10" className="text-muted-foreground/40">
                      <path d="M4 0L4 7M1 5L4 8L7 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span
                      className="text-[10px] font-bold tabular-nums"
                      style={{ color: stage.config.color }}
                    >
                      {rate}
                    </span>
                  </div>
                </div>
              )}

              {/* Stage row */}
              <div className="flex items-center gap-3">
                <div className="w-16 text-right shrink-0">
                  <span
                    className="text-base font-black tabular-nums"
                    style={{ color: stage.config.color }}
                  >
                    {stage.count >= 1000
                      ? `${(stage.count / 1000).toFixed(1)}K`
                      : stage.count.toLocaleString("fr-FR")}
                  </span>
                </div>
                <div className="flex-1">
                  <div
                    className="h-8 rounded-lg flex items-center px-2.5 transition-all duration-500"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: `${stage.config.color}20`,
                      borderLeft: `3px solid ${stage.config.color}`,
                    }}
                  >
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: stage.config.color }}
                    >
                      {stage.config.labelFr}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Summary stats ── */}
      <div className="flex items-center gap-4 pt-2 border-t border-border/30">
        <div className="text-xs text-muted-foreground">
          Taux global :{" "}
          <span className="font-bold text-amber-500">
            {stages[0]!.count > 0
              ? `${((stages[stages.length - 1]!.count / stages[0]!.count) * 100).toFixed(2)}%`
              : "—"}
          </span>
          <span className="ml-1 text-muted-foreground/60">
            (Audience → Évangéliste)
          </span>
        </div>
      </div>
    </div>
  );
}
