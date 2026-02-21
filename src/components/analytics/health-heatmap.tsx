// ==========================================================================
// C.A6 — Health Heatmap
// Strategy health visualization.
// ==========================================================================

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

interface HeatmapBrand {
  id: string;
  brandName: string;
  coherenceScore: number | null;
  riskScore: number | null;
  status: string;
}

interface HealthHeatmapProps {
  brands: HeatmapBrand[];
  onBrandClick: (id: string) => void;
  selectedBrandId?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute a health value from 0 (worst) to 100 (best).
 * health = coherence - risk * 0.5, clamped 0-100.
 */
function computeHealth(brand: HeatmapBrand): number {
  const coherence = brand.coherenceScore ?? 50;
  const risk = brand.riskScore ?? 50;
  return Math.max(0, Math.min(100, coherence - risk * 0.5 + 25));
}

/**
 * Map health 0-100 to a colour.
 */
function healthColor(health: number): string {
  if (health >= 70) return "#22c55e"; // green
  if (health >= 45) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function healthLabel(health: number): string {
  if (health >= 70) return "Bonne santé";
  if (health >= 45) return "Modéré";
  return "Attention requise";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HealthHeatmap({
  brands,
  onBrandClick,
  selectedBrandId,
}: HealthHeatmapProps) {
  const cells = useMemo(
    () =>
      brands.map((b) => {
        const health = computeHealth(b);
        return {
          ...b,
          health,
          color: healthColor(health),
          label: healthLabel(health),
        };
      }),
    [brands],
  );

  if (brands.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
        Aucune marque
      </div>
    );
  }

  // Adaptive grid: auto-size based on brand count
  const cols =
    brands.length <= 6
      ? brands.length
      : brands.length <= 12
        ? Math.ceil(brands.length / 2)
        : Math.ceil(Math.sqrt(brands.length));

  return (
    <TooltipProvider delayDuration={100}>
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell) => (
          <Tooltip key={cell.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onBrandClick(cell.id)}
                className="group relative flex aspect-square items-center justify-center rounded-md border text-xs font-medium transition-all hover:scale-105 hover:shadow-md"
                style={{
                  backgroundColor: `${cell.color}20`,
                  borderColor:
                    selectedBrandId === cell.id
                      ? cell.color
                      : `${cell.color}40`,
                  borderWidth: selectedBrandId === cell.id ? 2 : 1,
                }}
              >
                {/* Initials */}
                <span
                  className="truncate px-1 font-semibold"
                  style={{ color: cell.color }}
                >
                  {cell.brandName
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 3)}
                </span>

                {/* Health dot */}
                <span
                  className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full"
                  style={{ backgroundColor: cell.color }}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{cell.brandName}</p>
              <p className="text-xs" style={{ color: cell.color }}>
                {cell.label} — {Math.round(cell.health)}/100
              </p>
              <p className="text-xs text-muted-foreground">
                Cohérence : {cell.coherenceScore ?? "–"} · Risque : {cell.riskScore ?? "–"}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
