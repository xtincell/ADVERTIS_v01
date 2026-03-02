// =============================================================================
// COMPONENT C.K33 — Section Creative Strategy
// =============================================================================
// T06 — Moodboard, key visual, graphic system, manifesto, copies by channel.
// =============================================================================

"use client";

import { useState } from "react";
import {
  Loader2,
  Palette,
  Megaphone,
  FileText,
  Eye,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { CockpitSection, DataCard } from "../cockpit-shared";
import { SectionAccordion } from "../section-accordion";
import { EmptyStateWithGenerate } from "../generate-button";
import { CreativeStrategyDataSchema, type CreativeStrategyData } from "~/lib/types/deliverable-schemas";

export function SectionCreativeStrategy({ strategyId }: { strategyId: string }) {
  const [genError, setGenError] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: raw, isLoading } =
    api.deliverables.creativeStrategy.getByStrategy.useQuery(
      { strategyId },
      { enabled: !!strategyId },
    );

  const generateMutation = api.deliverables.creativeStrategy.generate.useMutation({
    onSuccess: () => {
      void utils.deliverables.creativeStrategy.getByStrategy.invalidate({ strategyId });
      setGenError(null);
    },
    onError: (err) => setGenError(err.message),
  });

  const content = raw?.content
    ? CreativeStrategyDataSchema.safeParse(raw.content)
    : null;
  const data = content?.success ? content.data : null;

  if (isLoading) {
    return (
      <CockpitSection
        icon={<Palette className="h-5 w-5" />}
        pillarLetter="D"
        title="Stratégie Créative"
        subtitle="Chargement…"
        color="#EC4899"
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
        icon={<Palette className="h-5 w-5" />}
        pillarLetter="D"
        title="Stratégie Créative"
        subtitle="Non configurée"
        color="#EC4899"
      >
        <EmptyStateWithGenerate
          message="La stratégie créative sera générée à partir de l'analyse des piliers."
          onGenerate={() => generateMutation.mutate({ strategyId })}
          isGenerating={generateMutation.isPending}
          error={genError}
        />
      </CockpitSection>
    );
  }

  return (
    <CockpitSection
      icon={<Palette className="h-5 w-5" />}
      pillarLetter="D"
      title="Stratégie Créative"
      subtitle={`Version ${raw?.version ?? 1}`}
      color="#EC4899"
    >
      <div className="space-y-3">
        {/* Key Visual */}
        {data.keyVisual.description && (
          <SectionAccordion
            title="Key Visual"
            icon={<Eye className="h-4 w-4" />}
            accentColor="#EC4899"
            defaultOpen
          >
            <div className="space-y-2">
              <p className="text-sm">{data.keyVisual.description}</p>
              {data.keyVisual.elements.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.keyVisual.elements.map((el, i) => (
                    <span key={i} className="rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-700">
                      {el}
                    </span>
                  ))}
                </div>
              )}
              {data.keyVisual.colorPalette.length > 0 && (
                <div className="flex gap-2">
                  {data.keyVisual.colorPalette.map((c, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-md border shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              )}
            </div>
          </SectionAccordion>
        )}

        {/* Graphic System */}
        {(data.graphicSystem.typography || data.graphicSystem.colorCodes.length > 0) && (
          <SectionAccordion
            title="Système Graphique"
            icon={<Palette className="h-4 w-4" />}
            accentColor="#EC4899"
          >
            <div className="space-y-3">
              {data.graphicSystem.typography && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Typographie</p>
                  <p className="text-sm">{data.graphicSystem.typography}</p>
                </div>
              )}
              {data.graphicSystem.colorCodes.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-3">
                  {data.graphicSystem.colorCodes.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md border p-2">
                      <div
                        className="h-6 w-6 shrink-0 rounded border"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {data.graphicSystem.guidelines.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Guidelines</p>
                  <ul className="space-y-1">
                    {data.graphicSystem.guidelines.map((g, i) => (
                      <li key={i} className="text-xs text-foreground/80">• {g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SectionAccordion>
        )}

        {/* Manifesto */}
        {data.manifesto && (
          <SectionAccordion
            title="Manifeste de Marque"
            icon={<FileText className="h-4 w-4" />}
            accentColor="#EC4899"
          >
            <div className="rounded-lg bg-gradient-to-br from-pink-50 to-purple-50 p-4">
              <p className="whitespace-pre-line text-sm italic leading-relaxed">
                {data.manifesto}
              </p>
            </div>
          </SectionAccordion>
        )}

        {/* Copies by Channel */}
        {data.copiesByChannel.length > 0 && (
          <SectionAccordion
            title="Copies par Canal"
            icon={<Megaphone className="h-4 w-4" />}
            accentColor="#EC4899"
            badge={<span className="text-xs text-muted-foreground">{data.copiesByChannel.length} canaux</span>}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {data.copiesByChannel.map((copy, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-medium text-pink-700">
                      {copy.channel}
                    </span>
                    {copy.format && (
                      <span className="text-[10px] text-muted-foreground">{copy.format}</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold">{copy.headline}</p>
                  {copy.body && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{copy.body}</p>}
                  {copy.cta && (
                    <p className="mt-1 text-xs font-medium text-pink-600">
                      CTA: {copy.cta}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SectionAccordion>
        )}

        {/* Tonal Guidelines */}
        {data.tonalGuidelines.tone && (
          <SectionAccordion
            title="Guidelines Tonales"
            accentColor="#EC4899"
          >
            <div className="space-y-2">
              <p className="text-sm">{data.tonalGuidelines.tone}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.tonalGuidelines.doList.length > 0 && (
                  <div className="rounded-md bg-emerald-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-emerald-700">DO</p>
                    <ul className="space-y-0.5">
                      {data.tonalGuidelines.doList.map((d, i) => (
                        <li key={i} className="text-xs text-emerald-800">+ {d}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.tonalGuidelines.dontList.length > 0 && (
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-red-700">DON'T</p>
                    <ul className="space-y-0.5">
                      {data.tonalGuidelines.dontList.map((d, i) => (
                        <li key={i} className="text-xs text-red-800">- {d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </SectionAccordion>
        )}
      </div>
    </CockpitSection>
  );
}
