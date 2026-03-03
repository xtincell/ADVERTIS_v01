// ==========================================================================
// PAGE P.OS5 — Brand OS / Opportunities
// Opportunity radar — detected windows for brand activation.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-selector";
import { OpportunityRadar } from "~/components/brand-os/opportunity-radar";

function OpportunitiesContent() {
  const brandId = useBrandId();

  const { data: opportunities, isLoading } = api.brandOS.getOpportunities.useQuery(
    { strategyId: brandId! },
    { enabled: !!brandId },
  );

  if (!brandId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      </div>
    );
  }

  const newCount = opportunities?.filter((o) => o.status === "NEW").length ?? 0;
  const nowCount = opportunities?.filter((o) => o.timing === "NOW").length ?? 0;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Opportunités</h1>
        <p className="text-sm text-muted-foreground">Fenêtres de tir pour prendre la parole</p>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{newCount}</span> nouvelles opportunités
        </span>
        {nowCount > 0 && (
          <span className="text-sm text-red-500 font-medium">
            {nowCount} à saisir maintenant
          </span>
        )}
      </div>

      {/* Radar */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted-foreground/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <OpportunityRadar opportunities={opportunities ?? []} />
      )}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Chargement...</div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}
