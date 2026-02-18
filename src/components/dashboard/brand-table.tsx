// Brand Table — Sortable table of all brands for the agency dashboard.

"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { PILLAR_CONFIG, PILLAR_TYPES } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { Badge } from "~/components/ui/badge";
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

// ---------------------------------------------------------------------------
// Types
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

interface BrandTableProps {
  brands: BrandRow[];
  onBrandClick: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

type SortKey =
  | "brandName"
  | "sectorLabel"
  | "phaseOrder"
  | "status"
  | "coherenceScore"
  | "riskScore"
  | "brandMarketFitScore"
  | "updatedAt";

type SortDir = "asc" | "desc";

function compare(a: BrandRow, b: BrandRow, key: SortKey, dir: SortDir): number {
  let va: string | number | null;
  let vb: string | number | null;

  switch (key) {
    case "brandName":
    case "sectorLabel":
    case "status":
      va = a[key].toLowerCase();
      vb = b[key].toLowerCase();
      break;
    case "phaseOrder":
      va = a.phaseOrder;
      vb = b.phaseOrder;
      break;
    case "coherenceScore":
    case "riskScore":
    case "brandMarketFitScore":
      va = a[key];
      vb = b[key];
      break;
    case "updatedAt":
      va = a.updatedAt.getTime();
      vb = b.updatedAt.getTime();
      break;
    default:
      return 0;
  }

  // Nulls go last
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;

  const cmp = va < vb ? -1 : va > vb ? 1 : 0;
  return dir === "asc" ? cmp : -cmp;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active)
    return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />;
  return dir === "asc" ? (
    <ArrowUp className="ml-1 inline h-3 w-3" />
  ) : (
    <ArrowDown className="ml-1 inline h-3 w-3" />
  );
}

export function BrandTable({ brands, onBrandClick }: BrandTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(
    () => [...brands].sort((a, b) => compare(a, b, sortKey, sortDir)),
    [brands, sortKey, sortDir],
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (brands.length === 0) return null;

  const columns: { key: SortKey; label: string; hideOnMobile?: boolean }[] = [
    { key: "brandName", label: "Marque" },
    { key: "sectorLabel", label: "Secteur", hideOnMobile: true },
    { key: "phaseOrder", label: "Phase" },
    { key: "status", label: "Statut" },
    { key: "coherenceScore", label: "Coh.", hideOnMobile: true },
    { key: "riskScore", label: "Risque", hideOnMobile: true },
    { key: "brandMarketFitScore", label: "BMF", hideOnMobile: true },
    { key: "updatedAt", label: "Mis à jour" },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {/* Pillar dots column */}
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                Piliers
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`cursor-pointer select-none px-3 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground ${
                    col.hideOnMobile ? "hidden lg:table-cell" : ""
                  }`}
                  onClick={() => toggleSort(col.key)}
                >
                  {col.label}
                  <SortIcon active={sortKey === col.key} dir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((brand) => (
              <tr
                key={brand.id}
                className="cursor-pointer border-b transition-colors hover:bg-muted/30 last:border-b-0"
                onClick={() => onBrandClick(brand.id)}
              >
                {/* Pillar dots */}
                <td className="px-3 py-2.5 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    {PILLAR_TYPES.map((type) => {
                      const p = brand.pillars.find((pp) => pp.type === type);
                      const cfg = PILLAR_CONFIG[type as PillarType];
                      const color =
                        p?.status === "complete"
                          ? cfg?.color ?? "#22c55e"
                          : p?.status === "error"
                            ? "#ef4444"
                            : p?.status === "generating"
                              ? "#eab308"
                              : "#d1d5db";
                      return (
                        <Tooltip key={type}>
                          <TooltipTrigger asChild>
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            {type} — {cfg?.title}:{" "}
                            {p?.status === "complete"
                              ? "Terminé"
                              : p?.status === "generating"
                                ? "En cours"
                                : p?.status === "error"
                                  ? "Erreur"
                                  : "En attente"}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      {brand.pillarCompletionCount}/8
                    </span>
                  </div>
                </td>

                <td className="px-3 py-2.5 font-medium">{brand.brandName}</td>
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  <Badge variant="outline" className="text-xs font-normal">
                    {brand.sectorLabel}
                  </Badge>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-xs text-muted-foreground">
                    {brand.phaseLabel}
                  </span>
                </td>
                <td className="px-3 py-2.5">{getStatusBadge(brand.status)}</td>

                {/* Scores */}
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  {brand.coherenceScore != null ? (
                    <span
                      className="font-semibold"
                      style={{ color: getScoreColor(brand.coherenceScore) }}
                    >
                      {brand.coherenceScore}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  )}
                </td>
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  {brand.riskScore != null ? (
                    <span
                      className="font-semibold"
                      style={{ color: getRiskColor(brand.riskScore) }}
                    >
                      {brand.riskScore}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  )}
                </td>
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  {brand.brandMarketFitScore != null ? (
                    <span
                      className="font-semibold"
                      style={{ color: getScoreColor(brand.brandMarketFitScore) }}
                    >
                      {brand.brandMarketFitScore}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  )}
                </td>

                <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                  {getRelativeDate(brand.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
