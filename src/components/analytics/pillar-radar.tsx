// ==========================================================================
// C.A2 — Pillar Radar
// Radar chart for pillar scores.
// ==========================================================================

"use client";

import { useMemo } from "react";
import { PILLAR_TYPES, PILLAR_CONFIG, type PillarType } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PillarInput {
  type: string;
  status: string;
  content: unknown;
}

interface PillarRadarProps {
  pillars: PillarInput[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SIZE = 300;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 120; // px from center to tip
const RINGS = [0.25, 0.5, 0.75, 1]; // concentric guide rings

/**
 * Convert a pillar index (0-7) into an angle in radians.
 * We start at the top (-PI/2) and go clockwise.
 */
function angleForIndex(index: number, total: number): number {
  return (2 * Math.PI * index) / total - Math.PI / 2;
}

/**
 * Get the (x, y) coordinates on the SVG canvas for a given angle and radius
 * fraction (0-1).
 */
function polarToCartesian(angle: number, fraction: number): [number, number] {
  const r = OUTER_RADIUS * fraction;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

/**
 * Derive a score (0-1) for a single pillar:
 *   complete  -> 1.0
 *   has some content -> 0.5
 *   empty / pending  -> 0.0
 */
function pillarScore(pillar: PillarInput | undefined): number {
  if (!pillar) return 0;
  if (pillar.status === "complete") return 1;
  if (
    pillar.content !== null &&
    pillar.content !== undefined &&
    pillar.content !== ""
  ) {
    return 0.5;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PillarRadar({ pillars }: PillarRadarProps) {
  const pillarMap = useMemo(() => {
    const map = new Map<string, PillarInput>();
    for (const p of pillars) {
      map.set(p.type, p);
    }
    return map;
  }, [pillars]);

  const total = PILLAR_TYPES.length; // 8

  // Build polygon points for the data shape
  const dataPoints = useMemo(() => {
    return PILLAR_TYPES.map((type, i) => {
      const angle = angleForIndex(i, total);
      const score = pillarScore(pillarMap.get(type));
      // ensure a minimum visible radius so 0 values are still slightly visible
      const fraction = Math.max(score, 0.04);
      return polarToCartesian(angle, fraction);
    });
  }, [pillarMap, total]);

  const polygonString = dataPoints.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div className="inline-flex items-center justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="overflow-visible"
      >
        {/* Concentric guide rings */}
        {RINGS.map((frac) => (
          <polygon
            key={frac}
            points={Array.from({ length: total })
              .map((_, i) => {
                const [x, y] = polarToCartesian(angleForIndex(i, total), frac);
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-muted-foreground/15"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines from center to each tip */}
        {PILLAR_TYPES.map((_, i) => {
          const angle = angleForIndex(i, total);
          const [x, y] = polarToCartesian(angle, 1);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-muted-foreground/20"
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonString}
          fill="hsl(var(--primary) / 0.15)"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeLinejoin="round"
          style={{ transition: "all 0.5s ease" }}
        />

        {/* Data points (dots) */}
        {dataPoints.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill="hsl(var(--primary))"
            style={{ transition: "all 0.5s ease" }}
          />
        ))}

        {/* Pillar labels at the tip of each axis */}
        {PILLAR_TYPES.map((type, i) => {
          const angle = angleForIndex(i, total);
          const [x, y] = polarToCartesian(angle, 1.18);
          const cfg = PILLAR_CONFIG[type as PillarType];
          return (
            <g key={type}>
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground text-xs font-bold"
                style={{ fontSize: 13 }}
              >
                {type}
              </text>
              <text
                x={x}
                y={y + 14}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground"
                style={{ fontSize: 9 }}
              >
                {cfg.title}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
