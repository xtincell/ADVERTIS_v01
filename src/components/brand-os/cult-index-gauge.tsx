// ==========================================================================
// C.OS1 — Cult Index Gauge
// The signature visualization of the Brand OS. Animated orbital gauge
// showing the Cult Index score with tier label and trend indicator.
// ==========================================================================

"use client";

import { useMemo } from "react";
import { getCultTier, CULT_TIERS } from "~/lib/types/brand-os";

interface CultIndexGaugeProps {
  score: number;
  trend?: number | null; // positive = improving, negative = declining
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CONFIG = {
  sm: { px: 80, strokeWidth: 6, fontSize: 18, labelSize: 8, trendSize: 10 },
  md: { px: 140, strokeWidth: 8, fontSize: 32, labelSize: 11, trendSize: 12 },
  lg: { px: 200, strokeWidth: 10, fontSize: 48, labelSize: 14, trendSize: 14 },
  xl: { px: 280, strokeWidth: 12, fontSize: 64, labelSize: 16, trendSize: 16 },
} as const;

export function CultIndexGauge({ score, trend, size = "lg" }: CultIndexGaugeProps) {
  const cfg = SIZE_CONFIG[size];
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const tier = getCultTier(clampedScore);
  const tierConfig = CULT_TIERS[tier];

  const { radius, circumference, offset } = useMemo(() => {
    const r = (cfg.px - cfg.strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    const o = c - (clampedScore / 100) * c;
    return { radius: r, circumference: c, offset: o };
  }, [cfg.px, cfg.strokeWidth, clampedScore]);

  // Orbital rings (decorative)
  const orbitalRadius1 = radius + cfg.strokeWidth + 4;
  const orbitalRadius2 = radius + cfg.strokeWidth + 10;

  return (
    <div className="relative inline-flex flex-col items-center gap-2">
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: cfg.px + 24, height: cfg.px + 24 }}
      >
        <svg
          width={cfg.px + 24}
          height={cfg.px + 24}
          viewBox={`0 0 ${cfg.px + 24} ${cfg.px + 24}`}
          className="-rotate-90"
        >
          {/* Outer orbital ring (decorative, subtle) */}
          {size !== "sm" && (
            <circle
              cx={(cfg.px + 24) / 2}
              cy={(cfg.px + 24) / 2}
              r={orbitalRadius2}
              fill="none"
              stroke={tierConfig.color}
              strokeWidth={1}
              opacity={0.15}
              strokeDasharray="4 8"
            />
          )}

          {/* Inner orbital ring */}
          {size !== "sm" && (
            <circle
              cx={(cfg.px + 24) / 2}
              cy={(cfg.px + 24) / 2}
              r={orbitalRadius1}
              fill="none"
              stroke={tierConfig.color}
              strokeWidth={1}
              opacity={0.25}
              strokeDasharray="2 6"
            />
          )}

          {/* Background circle */}
          <circle
            cx={(cfg.px + 24) / 2}
            cy={(cfg.px + 24) / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted-foreground/15"
            strokeWidth={cfg.strokeWidth}
          />

          {/* Score arc */}
          <circle
            cx={(cfg.px + 24) / 2}
            cy={(cfg.px + 24) / 2}
            r={radius}
            fill="none"
            stroke={tierConfig.color}
            strokeWidth={cfg.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease-in-out, stroke 0.4s ease",
              filter: `drop-shadow(0 0 8px ${tierConfig.color}40)`,
            }}
          />

          {/* Glow effect at the end of the arc */}
          {clampedScore > 0 && size !== "sm" && (
            <circle
              cx={(cfg.px + 24) / 2}
              cy={(cfg.px + 24) / 2}
              r={radius}
              fill="none"
              stroke={tierConfig.color}
              strokeWidth={cfg.strokeWidth + 4}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              opacity={0.2}
              style={{
                transition: "stroke-dashoffset 1s ease-in-out",
                filter: `blur(4px)`,
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center">
          <span
            className="font-black tracking-tight"
            style={{ fontSize: cfg.fontSize, color: tierConfig.color }}
          >
            {clampedScore}
          </span>
          {size !== "sm" && (
            <span
              className="text-muted-foreground font-medium -mt-1"
              style={{ fontSize: cfg.labelSize }}
            >
              CULT INDEX
            </span>
          )}
        </div>
      </div>

      {/* Tier label */}
      <div className="flex flex-col items-center gap-0.5">
        <span
          className="font-bold tracking-wide uppercase"
          style={{ fontSize: cfg.trendSize, color: tierConfig.color }}
        >
          {tierConfig.labelFr}
        </span>

        {/* Trend indicator */}
        {trend != null && trend !== 0 && (
          <span
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: trend > 0 ? "#22c55e" : "#ef4444" }}
          >
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}
            <span className="text-[10px]">{trend > 0 ? "↑" : "↓"}</span>
          </span>
        )}
      </div>
    </div>
  );
}
