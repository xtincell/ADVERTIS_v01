// ==========================================================================
// PAGE P.IMP.COH — Cohort Analysis
// Retention grid and LTV evolution in Impulsion portal.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CohortGrid } from "~/components/analytics/cohort-grid";

function CohortsContent() {
  const searchParams = useSearchParams();
  const strategyId = searchParams.get("strategyId");

  if (!strategyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-muted-foreground text-sm">
          Sélectionnez une stratégie pour voir l&apos;analyse de cohortes.
        </p>
        <p className="text-muted-foreground text-xs max-w-sm text-center">
          Accédez à cette page depuis une fiche stratégie dans Impulsion.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <CohortGrid strategyId={strategyId} />
    </div>
  );
}

export default function CohortsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground animate-pulse">
            Chargement des cohortes...
          </div>
        </div>
      }
    >
      <CohortsContent />
    </Suspense>
  );
}
