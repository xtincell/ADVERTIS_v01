// ==========================================================================
// C.A1 — Coherence Gauge
// Animated score gauge visualization.
// ==========================================================================

"use client";

import { useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CoherenceGaugeProps {
  /** Score value between 0 and 100 */
  score: number;
  /** Display size variant */
  size?: "sm" | "md" | "lg";
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIZE_CONFIG = {
  sm: { px: 60, strokeWidth: 5, fontSize: 14, labelSize: 8 },
  md: { px: 100, strokeWidth: 7, fontSize: 22, labelSize: 10 },
  lg: { px: 150, strokeWidth: 9, fontSize: 32, labelSize: 12 },
} as const;

/**
 * Return a colour based on the score range:
 *   0-30  red
 *  31-60  orange / gold
 *  61-80  green
 *  81-100 bright green
 */
function scoreColor(score: number): string {
  if (score <= 30) return "#ef4444"; // red-500
  if (score <= 60) return "#f59e0b"; // amber-500
  if (score <= 80) return "#22c55e"; // green-500
  return "#10b981"; // emerald-500
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CoherenceGauge({ score, size = "md" }: CoherenceGaugeProps) {
  const cfg = SIZE_CONFIG[size];
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  const { radius, circumference, offset } = useMemo(() => {
    const r = (cfg.px - cfg.strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    const o = c - (clampedScore / 100) * c;
    return { radius: r, circumference: c, offset: o };
  }, [cfg.px, cfg.strokeWidth, clampedScore]);

  const color = scoreColor(clampedScore);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: cfg.px, height: cfg.px }}
    >
      <svg
        width={cfg.px}
        height={cfg.px}
        viewBox={`0 0 ${cfg.px} ${cfg.px}`}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={cfg.px / 2}
          cy={cfg.px / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground/20"
          strokeWidth={cfg.strokeWidth}
        />
        {/* Foreground arc */}
        <circle
          cx={cfg.px / 2}
          cy={cfg.px / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={cfg.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.6s ease-in-out, stroke 0.4s ease",
          }}
        />
      </svg>

      {/* Score number in the center */}
      <span
        className="absolute font-bold"
        style={{ fontSize: cfg.fontSize, color }}
      >
        {clampedScore}
      </span>

      {/* Label below — only on md and lg */}
      {size !== "sm" && (
        <span
          className="text-muted-foreground absolute"
          style={{
            fontSize: cfg.labelSize,
            bottom: size === "lg" ? 18 : 12,
          }}
        >
          / 100
        </span>
      )}
    </div>
  );
}
