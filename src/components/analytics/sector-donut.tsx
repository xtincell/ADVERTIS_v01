// ==========================================================================
// C.A4 — Sector Donut
// Sector distribution chart.
// ==========================================================================

"use client";

import { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectorDonutProps {
  data: Array<{ sector: string; label: string; count: number }>;
  size?: number;
}

// ---------------------------------------------------------------------------
// Colour palette
// ---------------------------------------------------------------------------

const SECTOR_COLORS = [
  "#c45a3c", // terracotta
  "#2d5a3d", // forest
  "#c49a3c", // gold
  "#3c7ac4", // blue
  "#8c3cc4", // purple
  "#c43c6e", // pink
  "#3cc4c4", // teal
  "#6b7280", // gray
] as const;

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCart(cx, cy, r, endAngle);
  const end = polarToCart(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArc, 0, end.x, end.y,
  ].join(" ");
}

function polarToCart(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SectorDonut({ data, size = 200 }: SectorDonutProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data],
  );

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = outerR * 0.6;
  const strokeR = (outerR + innerR) / 2;
  const strokeWidth = outerR - innerR;

  // Build arc segments
  const arcs = useMemo(() => {
    if (total === 0) return [];
    let currentAngle = -Math.PI / 2; // start at top
    return data.map((d, i) => {
      const sweep = (d.count / total) * 2 * Math.PI;
      // Tiny gap between segments
      const gapAngle = data.length > 1 ? 0.02 : 0;
      const startAngle = currentAngle + gapAngle / 2;
      const endAngle = currentAngle + sweep - gapAngle / 2;
      currentAngle += sweep;
      return {
        ...d,
        index: i,
        startAngle,
        endAngle,
        color: SECTOR_COLORS[i % SECTOR_COLORS.length],
        path: describeArc(cx, cy, strokeR, startAngle, endAngle),
      };
    });
  }, [data, total, cx, cy, strokeR]);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ width: size, height: size }}
      >
        Aucune donnée
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="inline-flex flex-col items-center gap-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible"
          >
            {arcs.map((arc) => (
              <Tooltip key={arc.index}>
                <TooltipTrigger asChild>
                  <path
                    d={arc.path}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={
                      hoveredIndex === arc.index
                        ? strokeWidth + 6
                        : strokeWidth
                    }
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredIndex(arc.index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                    style={{
                      transition: "stroke-width 0.2s ease",
                      opacity: hoveredIndex !== null && hoveredIndex !== arc.index ? 0.5 : 1,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{arc.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {arc.count} marque{arc.count > 1 ? "s" : ""} ({Math.round((arc.count / total) * 100)}%)
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </svg>

          {/* Center label */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ pointerEvents: "none" }}
          >
            <span className="text-2xl font-bold">{total}</span>
            <span className="text-xs text-muted-foreground">
              marque{total > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {arcs.map((arc) => (
            <div
              key={arc.index}
              className="flex items-center gap-1.5 text-xs"
              onMouseEnter={() => setHoveredIndex(arc.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: arc.color }}
              />
              <span className="text-muted-foreground">
                {arc.label} ({arc.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
