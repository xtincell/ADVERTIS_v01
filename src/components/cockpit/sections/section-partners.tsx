// =============================================================================
// COMPONENT C.K31 — Section Partners
// =============================================================================
// Filterable partner directory: Influencers/Terrain/Institutional/Media.
// =============================================================================

"use client";

import { useState } from "react";
import {
  Loader2,
  Users,
  Filter,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { CockpitSection } from "../cockpit-shared";
import { EmptyStateWithGenerate } from "../generate-button";
import {
  PARTNER_TYPES,
  PARTNER_TYPE_LABELS,
  type PartnerType,
} from "~/lib/types/deliverable-schemas";

interface PartnerMetrics {
  followers?: number;
  engagementRate?: number;
  reach?: number;
  pastCollabs?: number;
  audienceDemo?: string;
}

const TYPE_COLORS: Record<PartnerType, string> = {
  INFLUENCER: "bg-purple-100 text-purple-700 border-purple-200",
  TERRAIN: "bg-amber-100 text-amber-700 border-amber-200",
  INSTITUTIONAL: "bg-blue-100 text-blue-700 border-blue-200",
  MEDIA: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  prospect: { label: "Prospect", color: "bg-muted text-muted-foreground" },
  contacted: { label: "Contacté", color: "bg-blue-100 text-blue-600" },
  confirmed: { label: "Confirmé", color: "bg-emerald-100 text-emerald-600" },
  active: { label: "Actif", color: "bg-green-100 text-green-700" },
};

export function SectionPartners({ strategyId }: { strategyId: string }) {
  const [activeFilter, setActiveFilter] = useState<PartnerType | "ALL">("ALL");
  const [genError, setGenError] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: partners, isLoading } =
    api.deliverables.partners.getByStrategy.useQuery(
      { strategyId },
      { enabled: !!strategyId },
    );

  const generateMutation = api.deliverables.partners.generate.useMutation({
    onSuccess: () => {
      void utils.deliverables.partners.getByStrategy.invalidate({ strategyId });
      setGenError(null);
    },
    onError: (err) => setGenError(err.message),
  });

  const filteredPartners = (partners ?? []).filter(
    (p) => activeFilter === "ALL" || p.type === activeFilter,
  );

  const counts = PARTNER_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = (partners ?? []).filter((p) => p.type === t).length;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <CockpitSection
        icon={<Users className="h-5 w-5" />}
        pillarLetter="E"
        title="Dossier Partenaires"
        subtitle="Chargement…"
        color="#8B5CF6"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  return (
    <CockpitSection
      icon={<Users className="h-5 w-5" />}
      pillarLetter="E"
      title="Dossier Partenaires"
      subtitle={`${partners?.length ?? 0} partenaires identifiés`}
      color="#8B5CF6"
    >
      {(!partners || partners.length === 0) ? (
        <EmptyStateWithGenerate
          message="Aucun partenaire identifié. Les partenaires (influenceurs, terrain, institutionnels, médias) seront générés à partir de votre stratégie."
          onGenerate={() => generateMutation.mutate({ strategyId })}
          isGenerating={generateMutation.isPending}
          error={genError}
          generateLabel="Générer les partenaires"
        />
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeFilter === "ALL"
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
            >
              Tous ({partners.length})
            </button>
            {PARTNER_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  activeFilter === type
                    ? TYPE_COLORS[type]
                    : "bg-muted/50 text-muted-foreground hover:bg-muted",
                )}
              >
                {PARTNER_TYPE_LABELS[type]} ({counts[type] ?? 0})
              </button>
            ))}
          </div>

          {/* Partner cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPartners.map((partner) => {
              const metrics = partner.metrics as PartnerMetrics | null;
              const statusInfo = STATUS_LABELS[partner.status] ?? STATUS_LABELS.prospect;
              return (
                <div
                  key={partner.id}
                  className="rounded-lg border p-3 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{partner.name}</p>
                      {partner.category && (
                        <p className="text-xs text-muted-foreground">{partner.category}</p>
                      )}
                    </div>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium", TYPE_COLORS[partner.type as PartnerType])}>
                      {PARTNER_TYPE_LABELS[partner.type as PartnerType]}
                    </span>
                  </div>

                  {/* Metrics */}
                  {metrics && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {metrics.followers != null && (
                        <span>{(metrics.followers / 1000).toFixed(1)}K abonnés</span>
                      )}
                      {metrics.engagementRate != null && (
                        <span>{metrics.engagementRate}% engage.</span>
                      )}
                      {metrics.reach != null && (
                        <span>{(metrics.reach / 1000).toFixed(0)}K reach</span>
                      )}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    {partner.costEstimate != null && (
                      <span className="text-xs font-medium">
                        {partner.costEstimate.toLocaleString()} {partner.currency}
                      </span>
                    )}
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusInfo!.color)}>
                      {statusInfo!.label}
                    </span>
                  </div>

                  {partner.market && (
                    <span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                      {partner.market}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </CockpitSection>
  );
}
