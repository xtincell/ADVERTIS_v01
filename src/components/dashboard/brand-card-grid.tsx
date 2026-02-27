// ==========================================================================
// C.D2 — Brand Card Grid
// Strategy grid card view.
// ==========================================================================

"use client";

import { PILLAR_CONFIG, PILLAR_TYPES } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  getStatusBadge,
  getRelativeDate,
  getScoreColor,
  getRiskColor,
} from "./shared";
import { BrandActionsMenu } from "~/components/brand/brand-actions-menu";

// ---------------------------------------------------------------------------
// Types (same as BrandTable for interchangeability)
// ---------------------------------------------------------------------------

interface BrandRow {
  id: string;
  brandName: string;
  sectorLabel: string;
  phaseLabel: string;
  phaseOrder: number;
  status: string;
  coherenceScore: number | null;
  riskScore: number | null;
  brandMarketFitScore: number | null;
  pillarCompletionCount: number;
  pillars: Array<{ type: string; status: string }>;
  updatedAt: Date;
}

interface BrandCardGridProps {
  brands: BrandRow[];
  onBrandClick: (id: string) => void;
  onMutationSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function brandInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function ScoreMini({
  label,
  value,
  colorFn,
}: {
  label: string;
  value: number | null;
  colorFn: (score: number) => string;
}) {
  if (value == null)
    return (
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold text-muted-foreground/40">–</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
    );
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold" style={{ color: colorFn(value) }}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function pillarDotColor(status: string | undefined, pillarColor: string): string {
  if (!status) return "#d1d5db";
  if (status === "complete") return pillarColor;
  if (status === "error") return "#ef4444";
  if (status === "generating") return "#eab308";
  return "#d1d5db";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BrandCardGrid({ brands, onBrandClick, onMutationSuccess }: BrandCardGridProps) {
  if (brands.length === 0) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <Card
            key={brand.id}
            className="cursor-pointer transition-all hover:shadow-md hover:border-terracotta/30"
            onClick={() => onBrandClick(brand.id)}
          >
            <CardContent className="pt-5 pb-4">
              {/* Header: initials + name + badges + actions */}
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-terracotta/10 text-sm font-bold text-terracotta">
                  {brandInitials(brand.brandName)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{brand.brandName}</h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 text-[10px]"
                    >
                      {brand.sectorLabel}
                    </Badge>
                    {getStatusBadge(brand.status)}
                  </div>
                </div>
                <BrandActionsMenu
                  strategyId={brand.id}
                  brandName={brand.brandName}
                  status={brand.status}
                  compact
                  onMutationSuccess={onMutationSuccess}
                />
              </div>

              {/* Scores row */}
              <div className="mb-3 flex items-center justify-around border-y py-3">
                <ScoreMini
                  label="Coh."
                  value={brand.coherenceScore}
                  colorFn={getScoreColor}
                />
                <ScoreMini
                  label="Risque"
                  value={brand.riskScore}
                  colorFn={getRiskColor}
                />
                <ScoreMini
                  label="BMF"
                  value={brand.brandMarketFitScore}
                  colorFn={getScoreColor}
                />
              </div>

              {/* Pillar dots */}
              <div className="mb-2 flex items-center gap-1.5">
                {PILLAR_TYPES.map((type) => {
                  const p = brand.pillars.find((pp) => pp.type === type);
                  const cfg = PILLAR_CONFIG[type as PillarType];
                  return (
                    <Tooltip key={type}>
                      <TooltipTrigger asChild>
                        <span
                          className="inline-block h-3 w-3 rounded-full transition-transform hover:scale-125"
                          style={{
                            backgroundColor: pillarDotColor(
                              p?.status,
                              cfg?.color ?? "#d1d5db",
                            ),
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {type} — {cfg?.title ?? type}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {brand.pillarCompletionCount}/8
                </span>
              </div>

              {/* Footer: phase + date */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">{brand.phaseLabel}</span>
                <span>{getRelativeDate(brand.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
