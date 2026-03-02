// =============================================================================
// COMPONENT C.K32 — Section Big Idea Kit
// =============================================================================
// T04 — Big Idea Kits by occasion with P0/P1/P2 priority and funnel mapping.
// =============================================================================

"use client";

import { useState } from "react";
import {
  Lightbulb,
  Loader2,
  Sparkles,
  Tag,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { CockpitSection } from "../cockpit-shared";
import { SectionAccordion } from "../section-accordion";
import { GenerateButton } from "../generate-button";
import type { BigIdeaItem } from "~/lib/types/deliverable-schemas";
import { FUNNEL_STAGE_LABELS, type FunnelStage } from "~/lib/types/deliverable-schemas";

const PRIORITY_COLORS: Record<string, string> = {
  P0: "bg-red-100 text-red-700 border-red-200",
  P1: "bg-amber-100 text-amber-700 border-amber-200",
  P2: "bg-muted text-muted-foreground border-border",
};

const FUNNEL_COLORS: Record<string, string> = {
  awareness: "bg-blue-100 text-blue-700",
  consideration: "bg-purple-100 text-purple-700",
  conversion: "bg-emerald-100 text-emerald-700",
  loyalty: "bg-amber-100 text-amber-700",
};

export function SectionBigIdeaKit({ strategyId }: { strategyId: string }) {
  const [occasion, setOccasion] = useState("");
  const [genError, setGenError] = useState<string | null>(null);

  const utils = api.useUtils();
  const { data: kits, isLoading } =
    api.deliverables.bigIdeaKits.getByStrategy.useQuery(
      { strategyId },
      { enabled: !!strategyId },
    );

  const generateMutation = api.deliverables.bigIdeaKits.generate.useMutation({
    onSuccess: () => {
      void utils.deliverables.bigIdeaKits.getByStrategy.invalidate({ strategyId });
      setOccasion("");
      setGenError(null);
    },
    onError: (err) => setGenError(err.message),
  });

  if (isLoading) {
    return (
      <CockpitSection
        icon={<Lightbulb className="h-5 w-5" />}
        pillarLetter="D"
        title="Big Idea Kits"
        subtitle="Chargement…"
        color="#F59E0B"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  return (
    <CockpitSection
      icon={<Lightbulb className="h-5 w-5" />}
      pillarLetter="D"
      title="Big Idea Kits"
      subtitle={`${kits?.length ?? 0} kit${(kits?.length ?? 0) > 1 ? "s" : ""} par occasion`}
      color="#F59E0B"
    >
      {/* Generate form */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          placeholder="Ex: Fête de la jeunesse, Rentrée scolaire…"
          className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground/60"
        />
        <GenerateButton
          onClick={() => generateMutation.mutate({ strategyId, occasion })}
          isLoading={generateMutation.isPending}
          label="Générer un kit"
          loadingLabel="Génération…"
          variant="secondary"
          className="shrink-0"
        />
      </div>
      {genError && <p className="mb-2 text-xs text-red-600">{genError}</p>}

      {(!kits || kits.length === 0) ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Aucun kit Big Idea configuré. Saisissez une occasion ci-dessus pour en générer un.
        </p>
      ) : (
        <div className="space-y-3">
          {kits.map((kit) => {
            const ideas = (kit.ideas ?? []) as BigIdeaItem[];
            return (
              <SectionAccordion
                key={kit.id}
                title={kit.occasion}
                subtitle={`${ideas.length} idées`}
                accentColor="#F59E0B"
                icon={<Sparkles className="h-4 w-4" />}
                badge={
                  <span className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    kit.status === "approved"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : kit.status === "review"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-muted text-muted-foreground border-border",
                  )}>
                    {kit.status === "approved" ? "Approuvé" : kit.status === "review" ? "En revue" : "Brouillon"}
                  </span>
                }
              >
                {/* Insight */}
                {kit.insight && (
                  <div className="mb-3 rounded-md bg-amber-50 px-3 py-2">
                    <p className="text-xs font-medium text-amber-800">
                      Insight: <span className="font-normal">{kit.insight}</span>
                    </p>
                  </div>
                )}

                {/* Ideas grid */}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ideas.map((idea, i) => (
                    <div
                      key={idea.id || i}
                      className="rounded-lg border p-3 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{idea.title}</p>
                        <span className={cn("shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-bold", PRIORITY_COLORS[idea.priority])}>
                          {idea.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {idea.concept}
                      </p>
                      {idea.copy && (
                        <p className="mt-1.5 text-xs italic text-foreground/70 line-clamp-1">
                          &ldquo;{idea.copy}&rdquo;
                        </p>
                      )}
                      {idea.funnelStage && (
                        <span className={cn("mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", FUNNEL_COLORS[idea.funnelStage])}>
                          <Tag className="h-2.5 w-2.5" />
                          {FUNNEL_STAGE_LABELS[idea.funnelStage as FunnelStage]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </SectionAccordion>
            );
          })}
        </div>
      )}
    </CockpitSection>
  );
}
