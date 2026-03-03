// ==========================================================================
// SECTION C.K25 — AARRR Roadmap
// 5 levers × 4 quarters grid with actions per quarter per AARRR stage.
// Data sources: Engagement pillar (aarrr), Implementation pillar (strategic
// roadmap, sprint90Days), and enriched actions if available.
// ==========================================================================

"use client";

import { useMemo } from "react";
import {
  Target,
  Zap,
  RefreshCcw,
  DollarSign,
  Megaphone,
  Calendar,
  ChevronRight,
} from "lucide-react";
import type { EngagementPillarData } from "~/lib/types/pillar-data";
import type { ImplementationData } from "~/lib/types/implementation-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AARRRStage {
  key: "acquisition" | "activation" | "retention" | "revenue" | "referral";
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface QuarterAction {
  text: string;
  source: "pillar" | "sprint" | "roadmap" | "derived";
}

interface RoadmapCell {
  stage: string;
  quarter: string;
  actions: QuarterAction[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AARRR_STAGES: AARRRStage[] = [
  { key: "acquisition", label: "Acquisition", icon: <Target className="h-3.5 w-3.5" />, color: "#3B82F6", bgColor: "bg-blue-50 border-blue-200" },
  { key: "activation", label: "Activation", icon: <Zap className="h-3.5 w-3.5" />, color: "#8B5CF6", bgColor: "bg-violet-50 border-violet-200" },
  { key: "retention", label: "Rétention", icon: <RefreshCcw className="h-3.5 w-3.5" />, color: "#10B981", bgColor: "bg-emerald-50 border-emerald-200" },
  { key: "revenue", label: "Revenue", icon: <DollarSign className="h-3.5 w-3.5" />, color: "#F59E0B", bgColor: "bg-amber-50 border-amber-200" },
  { key: "referral", label: "Referral", icon: <Megaphone className="h-3.5 w-3.5" />, color: "#EF4444", bgColor: "bg-red-50 border-red-200" },
];

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;

// ---------------------------------------------------------------------------
// Build roadmap grid
// ---------------------------------------------------------------------------

function buildRoadmapGrid(
  eContent: EngagementPillarData | null,
  implContent: ImplementationData | null,
): RoadmapCell[][] {
  const grid: RoadmapCell[][] = [];

  // Extract AARRR text from E pillar or I pillar
  const aarrr = eContent?.aarrr ?? implContent?.engagementStrategy?.aarrr;

  // Extract sprint90Days actions for Q1 mapping
  const sprintActions = implContent?.strategicRoadmap?.sprint90Days ?? [];
  // Extract year1Priorities for Q2-Q4 distribution
  const year1 = implContent?.strategicRoadmap?.year1Priorities ?? [];

  for (const stage of AARRR_STAGES) {
    const row: RoadmapCell[] = [];
    const stageText = aarrr?.[stage.key] ?? "";

    // Parse the AARRR text into sentences/bullet points for distribution
    const sentences = stageText
      ? stageText.split(/[.;\n]/).map((s) => s.trim()).filter((s) => s.length > 5)
      : [];

    for (let qi = 0; qi < QUARTERS.length; qi++) {
      const quarter = QUARTERS[qi]!;
      const actions: QuarterAction[] = [];

      if (qi === 0) {
        // Q1: Map sprint90Days that relate to this AARRR stage
        const relatedSprints = sprintActions.filter((a) => {
          const lower = `${a.action} ${a.kpi}`.toLowerCase();
          return isRelatedToStage(lower, stage.key);
        });
        for (const sp of relatedSprints.slice(0, 2)) {
          actions.push({ text: sp.action, source: "sprint" });
        }
        // Also add first sentence from AARRR text
        if (sentences.length > 0 && actions.length === 0) {
          actions.push({ text: sentences[0]!, source: "pillar" });
        }
      } else if (qi === 1 || qi === 2) {
        // Q2-Q3: Distribute year1Priorities and remaining sentences
        const priorityIdx = (qi - 1) * 2;
        const related = year1.filter((p) =>
          isRelatedToStage(p.toLowerCase(), stage.key),
        );
        if (related.length > 0) {
          actions.push({ text: related[0]!, source: "roadmap" });
        }
        // Distribute sentences
        const sentenceIdx = qi;
        if (sentences[sentenceIdx]) {
          actions.push({ text: sentences[sentenceIdx]!, source: "pillar" });
        }
      } else {
        // Q4: Scale & optimize
        if (sentences.length > 3) {
          actions.push({ text: sentences[3]!, source: "pillar" });
        } else if (stageText) {
          actions.push({
            text: `Optimiser ${stage.label.toLowerCase()}`,
            source: "derived",
          });
        }
      }

      row.push({ stage: stage.key, quarter, actions });
    }
    grid.push(row);
  }

  return grid;
}

/** Heuristic: does text relate to an AARRR stage? */
function isRelatedToStage(text: string, stage: string): boolean {
  const keywords: Record<string, string[]> = {
    acquisition: ["acquisition", "trafic", "audience", "reach", "awarenes", "visibilit", "notoriét"],
    activation: ["activation", "onboard", "premier", "signup", "inscript", "essai", "demo"],
    retention: ["retention", "rétention", "fidélis", "engagement", "récurrence", "retour", "churn"],
    revenue: ["revenue", "revenu", "monéti", "conver", "vente", "panier", "upsell", "ca "],
    referral: ["referral", "parrain", "bouche", "ambassad", "recommand", "viral", "partage"],
  };
  const kws = keywords[stage] ?? [];
  return kws.some((kw) => text.includes(kw));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SectionAARRRRoadmapProps {
  eContent: EngagementPillarData | null;
  implContent: ImplementationData | null;
}

export function SectionAARRRRoadmap({
  eContent,
  implContent,
}: SectionAARRRRoadmapProps) {
  const grid = useMemo(
    () => buildRoadmapGrid(eContent, implContent),
    [eContent, implContent],
  );

  // Check if there's any data
  const hasAnyData = grid.some((row) =>
    row.some((cell) => cell.actions.length > 0),
  );

  if (!hasAnyData) return null;

  // Count filled cells
  const filledCells = grid.flat().filter((c) => c.actions.length > 0).length;
  const totalCells = 20;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Roadmap AARRR
          </h2>
          <p className="text-xs text-muted-foreground">
            5 leviers de croissance sur 4 trimestres
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-primary tabular-nums">
            {filledCells}/{totalCells}
          </span>
          <span className="text-xs text-muted-foreground ml-1">cellules</span>
        </div>
      </div>

      {/* Desktop: Full grid table */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header row */}
          <div className="grid grid-cols-[160px_1fr_1fr_1fr_1fr] gap-1.5 mb-1.5">
            <div className="px-3 py-2 rounded-lg bg-muted/50">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Levier
              </span>
            </div>
            {QUARTERS.map((q) => (
              <div key={q} className="px-3 py-2 rounded-lg bg-muted/50 text-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {q}
                </span>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {AARRR_STAGES.map((stage, si) => (
            <div
              key={stage.key}
              className="grid grid-cols-[160px_1fr_1fr_1fr_1fr] gap-1.5 mb-1.5"
            >
              {/* Stage label */}
              <div
                className="flex items-center gap-2 px-3 py-3 rounded-lg border"
                style={{
                  backgroundColor: `${stage.color}08`,
                  borderColor: `${stage.color}30`,
                }}
              >
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${stage.color}15`, color: stage.color }}
                >
                  {stage.icon}
                </div>
                <span className="text-xs font-semibold" style={{ color: stage.color }}>
                  {stage.label}
                </span>
              </div>

              {/* Quarter cells */}
              {grid[si]!.map((cell, qi) => (
                <div
                  key={qi}
                  className={`rounded-lg border px-3 py-2 min-h-[60px] transition-colors ${
                    cell.actions.length > 0
                      ? "bg-card/60 border-border/60 hover:bg-card"
                      : "bg-muted/20 border-border/20"
                  }`}
                >
                  {cell.actions.length > 0 ? (
                    <div className="space-y-1">
                      {cell.actions.map((action, ai) => (
                        <div
                          key={ai}
                          className="flex items-start gap-1.5"
                        >
                          <ChevronRight
                            className="h-3 w-3 mt-0.5 shrink-0"
                            style={{ color: stage.color }}
                          />
                          <span className="text-[11px] leading-tight text-foreground/80">
                            {action.text.length > 80
                              ? action.text.slice(0, 80) + "..."
                              : action.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-[10px] text-muted-foreground/30">—</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Stacked cards per stage */}
      <div className="md:hidden space-y-3">
        {AARRR_STAGES.map((stage, si) => {
          const hasData = grid[si]!.some((c) => c.actions.length > 0);
          if (!hasData) return null;

          return (
            <div
              key={stage.key}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: `${stage.color}30` }}
            >
              {/* Stage header */}
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{
                  backgroundColor: `${stage.color}10`,
                }}
              >
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                >
                  {stage.icon}
                </div>
                <span className="text-sm font-semibold" style={{ color: stage.color }}>
                  {stage.label}
                </span>
              </div>

              {/* Quarter list */}
              <div className="divide-y divide-border/30">
                {grid[si]!.map((cell, qi) => {
                  if (cell.actions.length === 0) return null;
                  return (
                    <div key={qi} className="px-4 py-2.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {cell.quarter}
                      </span>
                      <div className="mt-1 space-y-1">
                        {cell.actions.map((action, ai) => (
                          <p key={ai} className="text-xs text-foreground/80 flex items-start gap-1.5">
                            <ChevronRight
                              className="h-3 w-3 mt-0.5 shrink-0"
                              style={{ color: stage.color }}
                            />
                            {action.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
