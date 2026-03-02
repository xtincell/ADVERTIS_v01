// =============================================================================
// COMPONENT C.K37 — Section Funnel Mapping
// =============================================================================
// M7 — Visual funnel + Big Idea × Stage matrix + decision matrix.
// =============================================================================

"use client";

import { useState } from "react";
import {
  Filter,
  Loader2,
  Target,
  ArrowDown,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { CockpitSection } from "../cockpit-shared";
import { SectionAccordion } from "../section-accordion";
import { EmptyStateWithGenerate } from "../generate-button";
import {
  FunnelMappingContentSchema,
  FUNNEL_STAGES,
  FUNNEL_STAGE_LABELS,
  type FunnelStage,
} from "~/lib/types/deliverable-schemas";

const STAGE_COLORS: Record<FunnelStage, { bg: string; text: string; border: string; width: string }> = {
  awareness: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", width: "w-full" },
  consideration: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", width: "w-[85%]" },
  conversion: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", width: "w-[65%]" },
  loyalty: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", width: "w-[50%]" },
};

const PRIORITY_COLORS: Record<string, string> = {
  P0: "bg-red-100 text-red-700",
  P1: "bg-amber-100 text-amber-700",
  P2: "bg-muted text-muted-foreground",
};

export function SectionFunnelMapping({ strategyId }: { strategyId: string }) {
  const [genError, setGenError] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: raw, isLoading } =
    api.deliverables.funnelMapping.getByStrategy.useQuery(
      { strategyId },
      { enabled: !!strategyId },
    );

  const generateMutation = api.deliverables.funnelMapping.generate.useMutation({
    onSuccess: () => {
      void utils.deliverables.funnelMapping.getByStrategy.invalidate({ strategyId });
      setGenError(null);
    },
    onError: (err) => setGenError(err.message),
  });

  const parsed = raw?.content ? FunnelMappingContentSchema.safeParse(raw.content) : null;
  const data = parsed?.success ? parsed.data : null;

  if (isLoading) {
    return (
      <CockpitSection
        icon={<Filter className="h-5 w-5" />}
        pillarLetter="E"
        title="Funnel & KPIs"
        subtitle="Chargement…"
        color="#DC2626"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  if (!data) {
    return (
      <CockpitSection
        icon={<Filter className="h-5 w-5" />}
        pillarLetter="E"
        title="Funnel & KPIs"
        subtitle="Non configuré"
        color="#DC2626"
      >
        <EmptyStateWithGenerate
          message="Le mapping funnel sera généré à partir des Big Idea Kits et de la stratégie d'engagement."
          onGenerate={() => generateMutation.mutate({ strategyId })}
          isGenerating={generateMutation.isPending}
          error={genError}
          generateLabel="Générer le funnel"
        />
      </CockpitSection>
    );
  }

  return (
    <CockpitSection
      icon={<Filter className="h-5 w-5" />}
      pillarLetter="E"
      title="Funnel & KPIs"
      subtitle="Mapping des étapes de conversion"
      color="#DC2626"
    >
      <div className="space-y-4">
        {/* Visual Funnel */}
        <SectionAccordion
          title="Funnel Visuel"
          icon={<ArrowDown className="h-4 w-4" />}
          accentColor="#DC2626"
          defaultOpen
        >
          <div className="flex flex-col items-center gap-1 py-2">
            {FUNNEL_STAGES.map((stage) => {
              const stageData = data.stages[stage];
              const c = STAGE_COLORS[stage];
              return (
                <div key={stage} className={cn("rounded-lg border p-3 transition-shadow hover:shadow-sm", c.bg, c.border, c.width)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("text-sm font-semibold", c.text)}>
                      {FUNNEL_STAGE_LABELS[stage]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {stageData.channels.length} canaux • {stageData.kpis.length} KPIs
                    </span>
                  </div>
                  {stageData.objectives.length > 0 && (
                    <p className="text-xs text-foreground/80">
                      {stageData.objectives.join(" • ")}
                    </p>
                  )}
                  {stageData.channels.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {stageData.channels.map((ch, i) => (
                        <span key={i} className={cn("rounded-full px-1.5 py-0.5 text-[10px]", c.bg, c.text)}>
                          {ch}
                        </span>
                      ))}
                    </div>
                  )}
                  {stageData.kpis.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      {stageData.kpis.map((kpi, i) => (
                        <span key={i} className="text-[10px] text-muted-foreground">
                          {kpi.metric}: <strong>{kpi.target}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionAccordion>

        {/* Big Idea × Stage Matrix */}
        {data.bigIdeaMatrix.length > 0 && (
          <SectionAccordion
            title="Matrice Big Idea × Funnel"
            icon={<Target className="h-4 w-4" />}
            accentColor="#DC2626"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-2 text-left font-medium pr-3">Big Idea</th>
                    {FUNNEL_STAGES.map((stage) => (
                      <th key={stage} className="pb-2 text-center font-medium px-2">
                        {FUNNEL_STAGE_LABELS[stage]}
                      </th>
                    ))}
                    <th className="pb-2 text-center font-medium px-2">Priorité</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bigIdeaMatrix.map((row, i) => (
                    <tr key={i} className="border-b border-muted/30">
                      <td className="py-1.5 pr-3 font-medium">{row.ideaTitle}</td>
                      {FUNNEL_STAGES.map((stage) => (
                        <td key={stage} className="py-1.5 text-center">
                          {row.stages.includes(stage) ? (
                            <span className={cn("inline-block h-4 w-4 rounded-full", STAGE_COLORS[stage].bg, STAGE_COLORS[stage].border, "border")} />
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                      ))}
                      <td className="py-1.5 text-center">
                        {row.priority && (
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", PRIORITY_COLORS[row.priority])}>
                            {row.priority}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionAccordion>
        )}

        {/* Decision Matrix */}
        {data.decisionMatrix.length > 0 && (
          <SectionAccordion
            title="Matrice de Décision"
            accentColor="#DC2626"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-2 text-left font-medium pr-3">Activation</th>
                    <th className="pb-2 text-left font-medium pr-3">Étape</th>
                    <th className="pb-2 text-right font-medium pr-3">Coût</th>
                    <th className="pb-2 text-left font-medium pr-3">Impact</th>
                    <th className="pb-2 text-center font-medium">Priorité</th>
                  </tr>
                </thead>
                <tbody>
                  {data.decisionMatrix.map((row, i) => (
                    <tr key={i} className="border-b border-muted/30">
                      <td className="py-1.5 pr-3 font-medium">{row.activation}</td>
                      <td className="py-1.5 pr-3">
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", STAGE_COLORS[row.stage].bg, STAGE_COLORS[row.stage].text)}>
                          {FUNNEL_STAGE_LABELS[row.stage]}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3 text-right">
                        {row.cost != null ? row.cost.toLocaleString("fr-FR") : "—"}
                      </td>
                      <td className="py-1.5 pr-3 text-muted-foreground">{row.impact ?? "—"}</td>
                      <td className="py-1.5 text-center">
                        {row.priority && (
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", PRIORITY_COLORS[row.priority])}>
                            {row.priority}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionAccordion>
        )}
      </div>
    </CockpitSection>
  );
}
