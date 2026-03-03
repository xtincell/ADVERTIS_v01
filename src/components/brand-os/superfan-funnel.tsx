// ==========================================================================
// C.OS2 — Superfan Funnel
// Visual conversion funnel: Audience → Follower → Engaged → Fan → Superfan → Evangelist
// ==========================================================================

"use client";

import { SUPERFAN_SEGMENTS, FUNNEL_ORDER, type SuperfanSegment } from "~/lib/types/brand-os";

interface FunnelData {
  segment: string;
  count: number;
}

interface SuperfanFunnelProps {
  data: FunnelData[];
  totalCommunity?: number;
}

export function SuperfanFunnel({ data, totalCommunity }: SuperfanFunnelProps) {
  // Map data to ordered funnel
  const funnelData = FUNNEL_ORDER.map((segment) => {
    const match = data.find((d) => d.segment === segment);
    return {
      segment,
      count: match?.count ?? 0,
      config: SUPERFAN_SEGMENTS[segment],
    };
  });

  // Max value for width calculation (first segment is widest)
  const maxCount = Math.max(
    totalCommunity ?? 0,
    ...funnelData.map((d) => d.count),
    1,
  );

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Funnel d&apos;engagement
      </h3>
      <div className="space-y-1.5">
        {funnelData.map((item, index) => {
          // Each level gets progressively narrower
          const widthPercent = Math.max(
            15,
            ((maxCount - index * (maxCount / (FUNNEL_ORDER.length + 1))) / maxCount) * 100,
          );
          const hasData = item.count > 0;

          return (
            <div key={item.segment} className="flex items-center gap-3">
              {/* Bar */}
              <div className="flex-1 relative">
                <div
                  className="h-9 rounded-lg flex items-center px-3 transition-all duration-500"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: hasData
                      ? `${item.config.color}20`
                      : "rgba(255,255,255,0.03)",
                    borderLeft: `3px solid ${item.config.color}`,
                    marginLeft: `${((100 - widthPercent) / 2)}%`,
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: item.config.color }}>
                    {item.config.labelFr}
                  </span>
                </div>
              </div>

              {/* Count */}
              <div className="w-16 text-right">
                <span className={`text-sm font-bold tabular-nums ${hasData ? "text-foreground" : "text-muted-foreground/40"}`}>
                  {item.count.toLocaleString("fr-FR")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
