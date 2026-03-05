// =============================================================================
// C.BRANDOS.P11.3 — Brand Tree Viewer
// =============================================================================
// Brand architecture tree for FW-16 Brand Architecture data. Displays
// architecture model with implications, brand tree with cult index scores,
// inheritance rules table, and synergies/conflicts badge lists.
//
// Consumes FW-16 (Brand Architecture) data.
// Used by: ARTEMIS cockpit, Brand OS architecture pages
// =============================================================================

"use client";

import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ArchitectureModel {
  type: string;
  description: string;
  implications: string[];
  advantages: string[];
  risks: string[];
}

interface InheritanceRule {
  id: string;
  parentVariable: string;
  childVariable: string;
  inheritanceType: string;
  description: string;
  conditions: string;
}

interface BrandEntry {
  brandId: string;
  brandName: string;
  cultIndexScore: number;
  coherenceWithParent: number;
  stage: string;
}

interface CrossBrandCultIndex {
  overallScore: number;
  brands: BrandEntry[];
  synergiesIdentified: string[];
  conflictsDetected: string[];
}

interface BrandTreeViewerProps {
  architectureModel: ArchitectureModel;
  inheritanceRules: InheritanceRule[];
  crossBrandCultIndex: CrossBrandCultIndex;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreBarColor(score: number): string {
  if (score >= 70) return "bg-emerald-500 dark:bg-emerald-400";
  if (score >= 45) return "bg-amber-500 dark:bg-amber-400";
  return "bg-red-500 dark:bg-red-400";
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 45) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function coherenceIndicator(score: number): string {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

const INHERITANCE_TYPE_COLORS: Record<string, string> = {
  STRICT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  FLEXIBLE: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  OVERRIDE: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  NONE: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BrandTreeViewer({
  architectureModel,
  inheritanceRules,
  crossBrandCultIndex,
  className,
}: BrandTreeViewerProps) {
  return (
    <Card className={cn("w-full", className)} data-slot="brand-tree-viewer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Architecture de Marque
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {architectureModel.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Architecture Model Description ── */}
        <div>
          <p className="text-sm text-muted-foreground">
            {architectureModel.description}
          </p>

          {architectureModel.implications.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Implications
              </p>
              <div className="space-y-0.5">
                {architectureModel.implications.map((impl, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    {i + 1}. {impl}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Overall Cult Index Score ── */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center rounded-lg border p-4 min-w-[100px]">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Cult Index
            </p>
            <p className={cn("text-3xl font-bold font-mono mt-1", scoreColor(crossBrandCultIndex.overallScore))}>
              {crossBrandCultIndex.overallScore}
            </p>
            <p className="text-[10px] text-muted-foreground">/ 100</p>
          </div>

          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              Score global de culte de marque calculé sur{" "}
              {crossBrandCultIndex.brands.length} marque
              {crossBrandCultIndex.brands.length > 1 ? "s" : ""}.
            </p>
          </div>
        </div>

        {/* ── Brand Tree: Vertical List ── */}
        {crossBrandCultIndex.brands.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Arbre des marques ({crossBrandCultIndex.brands.length})
            </p>

            <div className="space-y-2">
              {crossBrandCultIndex.brands.map((brand) => (
                <div
                  key={brand.brandId}
                  className="rounded-lg border p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{brand.brandName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {brand.stage}
                      </Badge>
                    </div>
                    <span className={cn("font-mono text-xs font-semibold", coherenceIndicator(brand.coherenceWithParent))}>
                      Coherence: {brand.coherenceWithParent}%
                    </span>
                  </div>

                  {/* Cult index score bar */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        Cult Index
                      </span>
                      <span className={cn("font-mono text-xs font-semibold", scoreColor(brand.cultIndexScore))}>
                        {brand.cultIndexScore}/100
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", scoreBarColor(brand.cultIndexScore))}
                        style={{ width: `${brand.cultIndexScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Coherence with parent indicator */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        Cohérence avec parent
                      </span>
                      <span className={cn("font-mono text-xs font-semibold", coherenceIndicator(brand.coherenceWithParent))}>
                        {brand.coherenceWithParent}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", scoreBarColor(brand.coherenceWithParent))}
                        style={{ width: `${brand.coherenceWithParent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Inheritance Rules Table ── */}
        {inheritanceRules.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Règles d&apos;héritage ({inheritanceRules.length})
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                      Variable parent
                    </th>
                    <th className="text-center py-2 pr-3 font-medium text-muted-foreground">
                    </th>
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                      Variable enfant
                    </th>
                    <th className="text-left py-2 font-medium text-muted-foreground">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inheritanceRules.map((rule) => {
                    const typeColor = INHERITANCE_TYPE_COLORS[rule.inheritanceType] ?? "";

                    return (
                      <tr key={rule.id} className="border-b last:border-0">
                        <td className="py-2 pr-3 font-medium font-mono">
                          {rule.parentVariable}
                        </td>
                        <td className="py-2 pr-3 text-center text-muted-foreground">
                          →
                        </td>
                        <td className="py-2 pr-3 font-mono">
                          {rule.childVariable}
                        </td>
                        <td className="py-2">
                          <Badge
                            variant="secondary"
                            className={cn("text-[10px] px-1.5 py-0", typeColor)}
                          >
                            {rule.inheritanceType}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Synergies & Conflicts ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Synergies */}
          {crossBrandCultIndex.synergiesIdentified.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Synergies ({crossBrandCultIndex.synergiesIdentified.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {crossBrandCultIndex.synergiesIdentified.map((syn, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  >
                    {syn}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts */}
          {crossBrandCultIndex.conflictsDetected.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Conflits ({crossBrandCultIndex.conflictsDetected.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {crossBrandCultIndex.conflictsDetected.map((conf, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  >
                    {conf}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Advantages & Risks ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Advantages */}
          {architectureModel.advantages.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Avantages ({architectureModel.advantages.length})
              </p>
              <div className="space-y-1">
                {architectureModel.advantages.map((adv, i) => (
                  <p key={i} className="text-xs text-emerald-600 dark:text-emerald-400">
                    {i + 1}. {adv}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {architectureModel.risks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Risques ({architectureModel.risks.length})
              </p>
              <div className="space-y-1">
                {architectureModel.risks.map((risk, i) => (
                  <p key={i} className="text-xs text-red-600 dark:text-red-400">
                    {i + 1}. {risk}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
