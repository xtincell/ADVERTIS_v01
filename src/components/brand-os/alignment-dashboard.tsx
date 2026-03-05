// =============================================================================
// C.BRANDOS.P10.3 — Alignment Dashboard
// =============================================================================
// Score dashboard for FW-18 Internal Alignment data. Displays brand-culture
// fit scores across 5 dimensions, gap analysis, value internalization table,
// and clergy mapping with ambassador levels.
//
// Consumes FW-18 (Internal Alignment) data.
// Used by: ARTEMIS cockpit, Brand OS alignment pages
// =============================================================================

"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DimensionScores {
  valueAlignment: number;
  behavioralConsistency: number;
  narrativeAdoption: number;
  ritualParticipation: number;
  symbolRecognition: number;
}

interface GapData {
  dimension: string;
  current: number;
  target: number;
  actionPlan: string;
}

interface BrandCultureFit {
  score: number;
  dimensions: DimensionScores;
  gaps: GapData[];
  overallAssessment: string;
}

interface InternalizationItem {
  value: string;
  actionableForm: string;
  department: string;
  kpi: string;
  adoptionRate: number;
}

interface ClergyMember {
  id: string;
  role: string;
  department: string;
  brandAmbassadorLevel: string;
  responsibilities: string[];
}

interface AlignmentDashboardProps {
  brandCultureFit: BrandCultureFit;
  internalization: InternalizationItem[];
  clergyMapping: ClergyMember[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Dimension labels
// ---------------------------------------------------------------------------

const DIMENSION_LABELS: Record<keyof DimensionScores, string> = {
  valueAlignment: "Alignement des valeurs",
  behavioralConsistency: "Cohérence comportementale",
  narrativeAdoption: "Adoption narrative",
  ritualParticipation: "Participation rituelle",
  symbolRecognition: "Reconnaissance symbolique",
};

// ---------------------------------------------------------------------------
// Ambassador level colors
// ---------------------------------------------------------------------------

const AMBASSADOR_LEVEL_COLORS: Record<string, string> = {
  CHAMPION: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  ADVOCATE: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  PRACTITIONER: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  NOVICE: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 55) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function scoreBadgeVariant(score: number): "default" | "secondary" | "destructive" {
  if (score >= 75) return "default";
  if (score >= 55) return "secondary";
  return "destructive";
}

function scoreBarColor(score: number): string {
  if (score >= 75) return "bg-emerald-500 dark:bg-emerald-400";
  if (score >= 55) return "bg-amber-500 dark:bg-amber-400";
  return "bg-red-500 dark:bg-red-400";
}

function adoptionColor(rate: number): string {
  if (rate >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (rate >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AlignmentDashboard({
  brandCultureFit,
  internalization,
  clergyMapping,
  className,
}: AlignmentDashboardProps) {
  const [selectedClergyId, setSelectedClergyId] = useState<string | null>(null);

  const dimensions = brandCultureFit.dimensions;
  const dimensionEntries = Object.entries(dimensions) as [keyof DimensionScores, number][];

  return (
    <Card className={cn("w-full", className)} data-slot="alignment-dashboard">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Alignement Interne
          </CardTitle>
          <Badge
            variant={scoreBadgeVariant(brandCultureFit.score)}
            className="font-mono text-xs"
          >
            {brandCultureFit.score}/100
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall assessment */}
        <p className="text-sm text-muted-foreground">
          {brandCultureFit.overallAssessment}
        </p>

        {/* 5 Dimension bars */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Dimensions ({dimensionEntries.length})
          </p>
          <div className="space-y-3">
            {dimensionEntries.map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">{DIMENSION_LABELS[key]}</span>
                  <span className={cn("font-mono text-xs font-semibold", scoreColor(value))}>
                    {value}/100
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", scoreBarColor(value))}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gaps */}
        {brandCultureFit.gaps.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Écarts identifiés ({brandCultureFit.gaps.length})
            </p>
            <div className="space-y-2">
              {brandCultureFit.gaps.map((gap, i) => (
                <div
                  key={i}
                  className="rounded-lg border p-3 text-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs">{gap.dimension}</span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className={cn("font-mono font-semibold", scoreColor(gap.current))}>
                        {gap.current}
                      </span>
                      <span className="text-muted-foreground">-&gt;</span>
                      <span className={cn("font-mono font-semibold", scoreColor(gap.target))}>
                        {gap.target}
                      </span>
                    </div>
                  </div>
                  {/* Gap visual indicator */}
                  <div className="relative h-2 w-full rounded-full bg-muted">
                    <div
                      className="absolute h-full rounded-full bg-red-300 dark:bg-red-700"
                      style={{ width: `${gap.target}%` }}
                    />
                    <div
                      className={cn("absolute h-full rounded-full", scoreBarColor(gap.current))}
                      style={{ width: `${gap.current}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Plan :</span> {gap.actionPlan}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Internalization table */}
        {internalization.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Internalisation des valeurs ({internalization.length})
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                      Valeur
                    </th>
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                      Action
                    </th>
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                      Département
                    </th>
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                      KPI
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Adoption
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {internalization.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{item.value}</td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {item.actionableForm}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant="outline" className="text-[10px]">
                          {item.department}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {item.kpi}
                      </td>
                      <td className="py-2 text-right">
                        <span className={cn("font-mono font-semibold", adoptionColor(item.adoptionRate))}>
                          {item.adoptionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clergy mapping */}
        {clergyMapping.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Cartographie du Clergé ({clergyMapping.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {clergyMapping.map((member) => {
                const isSelected = member.id === selectedClergyId;
                const levelColor =
                  AMBASSADOR_LEVEL_COLORS[member.brandAmbassadorLevel] ?? "";

                return (
                  <Tooltip key={member.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          setSelectedClergyId(
                            isSelected ? null : member.id,
                          )
                        }
                        className={cn(
                          "flex flex-col items-start rounded-lg border p-3 text-left transition-all hover:shadow-sm",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border hover:bg-accent/50",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {member.role}
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn("text-[10px] px-1.5 py-0", levelColor)}
                          >
                            {member.brandAmbassadorLevel}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {member.department}
                        </span>

                        {/* Expanded responsibilities */}
                        {isSelected && member.responsibilities.length > 0 && (
                          <div className="mt-2 pt-2 border-t w-full">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                              Responsabilités
                            </p>
                            <div className="space-y-0.5">
                              {member.responsibilities.map((resp, ri) => (
                                <p key={ri} className="text-xs text-muted-foreground">
                                  {ri + 1}. {resp}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold">{member.role}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.department} — {member.brandAmbassadorLevel}
                        </p>
                        <p className="text-xs">
                          {member.responsibilities.length} responsabilité{member.responsibilities.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
