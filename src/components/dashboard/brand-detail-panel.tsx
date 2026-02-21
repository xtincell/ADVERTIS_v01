// ==========================================================================
// C.D3 — Brand Detail Panel
// Strategy summary side panel.
// ==========================================================================

"use client";

import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  FileText,
  DollarSign,
  Presentation,
  Edit3,
  ExternalLink,
} from "lucide-react";

import { PHASE_CONFIG, PILLAR_TYPES } from "~/lib/constants";
import type { Phase } from "~/lib/constants";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { CoherenceGauge } from "~/components/analytics/coherence-gauge";
import { PillarRadar } from "~/components/analytics/pillar-radar";
import { getStatusBadge, getSectorLabel } from "./shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BrandDetailData {
  id: string;
  name: string;
  brandName: string;
  sector: string | null;
  phase: string;
  phaseLabel: string;
  phaseOrder: number;
  status: string;
  coherenceScore: number | null;
  riskScore: number | null;
  brandMarketFitScore: number | null;
  unitEconomics: {
    cac: string;
    ltv: string;
    ratio: string;
    pointMort: string;
    marges: string;
  } | null;
  pillars: Array<{ type: string; status: string; content: unknown }>;
  pillarCompletionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BrandDetailPanelProps {
  brand: BrandDetailData;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BrandDetailPanel({ brand, onBack }: BrandDetailPanelProps) {
  const totalPhases = Object.keys(PHASE_CONFIG).length;
  const progressPct = Math.round((brand.phaseOrder / totalPhases) * 100);

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{brand.brandName}</h2>
          <p className="text-sm text-muted-foreground">{brand.name}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge(brand.status)}
          {brand.sector && (
            <Badge variant="outline">{getSectorLabel(brand.sector)}</Badge>
          )}
          <Badge variant="outline">{brand.phaseLabel}</Badge>
        </div>
      </div>

      {/* Scorecard: 3 gauges side by side */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cohérence
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <CoherenceGauge
              score={brand.coherenceScore ?? 0}
              size="md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Risque
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <CoherenceGauge score={brand.riskScore ?? 0} size="md" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Brand-Market Fit
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <CoherenceGauge
              score={brand.brandMarketFitScore ?? 0}
              size="md"
            />
          </CardContent>
        </Card>
      </div>

      {/* Radar + Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pillar Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Radar Piliers</CardTitle>
            <CardDescription>
              Complétion des 8 piliers ADVERTIS ({brand.pillarCompletionCount}/{PILLAR_TYPES.length})
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PillarRadar pillars={brand.pillars} />
          </CardContent>
        </Card>

        {/* Phase progression + Unit Economics */}
        <div className="space-y-4">
          {/* Phase */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Progression</CardTitle>
              <CardDescription>
                Phase actuelle : {brand.phaseLabel} ({brand.phaseOrder}/{totalPhases})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progressPct} className="h-3" />
              <p className="mt-2 text-xs text-muted-foreground">
                {progressPct}% du parcours complété
              </p>
            </CardContent>
          </Card>

          {/* Unit Economics */}
          {brand.unitEconomics && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-terracotta" />
                  <CardTitle className="text-base">Unit Economics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { label: "CAC", value: brand.unitEconomics.cac },
                    { label: "LTV", value: brand.unitEconomics.ltv },
                    { label: "Ratio LTV/CAC", value: brand.unitEconomics.ratio },
                    { label: "Point mort", value: brand.unitEconomics.pointMort },
                    { label: "Marges", value: brand.unitEconomics.marges },
                  ]
                    .filter((m) => m.value)
                    .map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-lg border p-3 text-center"
                      >
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {metric.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold truncate">
                          {metric.value}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Vault de Marque — Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Vault de Marque</CardTitle>
          <CardDescription>Actions rapides</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Fiche S */}
            {brand.pillars.some((p) => p.status === "complete") && (
              <Link
                href={`/strategy/${brand.id}/presentation`}
                className="group flex flex-col items-center gap-2.5 rounded-lg border-2 border-transparent bg-gradient-to-b from-[#8b5cf6]/5 to-[#8b5cf6]/10 p-4 transition-all hover:border-[#8b5cf6]/30 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] transition-transform group-hover:scale-110">
                  <Presentation className="size-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Fiche S</p>
                  <p className="text-[11px] text-muted-foreground">Présentation interactive</p>
                </div>
                <ExternalLink className="size-3 text-muted-foreground/40 group-hover:text-[#8b5cf6]" />
              </Link>
            )}

            {/* Cockpit */}
            <Link
              href={`/strategy/${brand.id}/cockpit`}
              className="group flex flex-col items-center gap-2.5 rounded-lg border-2 border-transparent bg-gradient-to-b from-terracotta/5 to-terracotta/10 p-4 transition-all hover:border-terracotta/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/10 text-terracotta transition-transform group-hover:scale-110">
                <LayoutDashboard className="size-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Cockpit</p>
                <p className="text-[11px] text-muted-foreground">Tableau de bord stratégique</p>
              </div>
              <ExternalLink className="size-3 text-muted-foreground/40 group-hover:text-terracotta" />
            </Link>

            {/* Modifier la fiche */}
            <Link
              href={`/strategy/${brand.id}`}
              className="group flex flex-col items-center gap-2.5 rounded-lg border-2 border-transparent bg-gradient-to-b from-forest/5 to-forest/10 p-4 transition-all hover:border-forest/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest transition-transform group-hover:scale-110">
                <Edit3 className="size-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Modifier</p>
                <p className="text-[11px] text-muted-foreground">Fiche de marque complète</p>
              </div>
              <ExternalLink className="size-3 text-muted-foreground/40 group-hover:text-forest" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
