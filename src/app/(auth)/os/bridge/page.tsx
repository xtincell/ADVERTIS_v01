// ==========================================================================
// PAGE P.OS9 — Brand OS / Bridge (Executive View)
// The CEO/CMO view: 4 key numbers, trend arrows, AI synthesis.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-selector";
import { ExecutiveSummary } from "~/components/brand-os/executive-summary";

function BridgeContent() {
  const brandId = useBrandId();

  const { data: summary, isLoading } = api.brandOS.getExecutiveSummary.useQuery(
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

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Bridge</h1>
        <p className="text-sm text-muted-foreground">Vue Executive — pour le CEO/CMO qui a 2 minutes</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-[280px] h-[280px] rounded-full bg-muted-foreground/5 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted-foreground/5 animate-pulse" />
            ))}
          </div>
        </div>
      ) : summary ? (
        <ExecutiveSummary data={summary} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Aucune donnée disponible.</p>
        </div>
      )}
    </div>
  );
}

export default function BridgePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Chargement...</div>}>
      <BridgeContent />
    </Suspense>
  );
}
