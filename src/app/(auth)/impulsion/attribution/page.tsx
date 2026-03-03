// ==========================================================================
// PAGE P.IMP.ATT — Attribution Dashboard
// Multi-channel attribution analysis in Impulsion portal.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AttributionDashboard } from "~/components/analytics/attribution-dashboard";

function AttributionContent() {
  const searchParams = useSearchParams();
  const strategyId = searchParams.get("strategyId");

  if (!strategyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-muted-foreground text-sm">
          Sélectionnez une stratégie pour voir l&apos;attribution multi-canal.
        </p>
        <p className="text-muted-foreground text-xs max-w-sm text-center">
          Accédez à cette page depuis une fiche stratégie dans Impulsion.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <AttributionDashboard strategyId={strategyId} />
    </div>
  );
}

export default function AttributionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground animate-pulse">
            Chargement de l&apos;attribution...
          </div>
        </div>
      }
    >
      <AttributionContent />
    </Suspense>
  );
}
