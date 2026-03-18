// ==========================================================================
// PAGE P.IMP.ATT — Attribution Dashboard
// Multi-channel attribution analysis in Impulsion portal.
// ==========================================================================

"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AttributionDashboard } from "~/components/analytics/attribution-dashboard";
import { StrategySelector } from "~/components/shared/strategy-selector";

function AttributionContent() {
  const searchParams = useSearchParams();
  const urlStrategyId = searchParams.get("strategyId");
  const [selectedId, setSelectedId] = useState<string | null>(urlStrategyId);

  const strategyId = selectedId ?? urlStrategyId;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Attribution multi-canal</h1>
          <p className="text-sm text-muted-foreground">Analyse d&apos;attribution par canal et point de contact</p>
        </div>
        <StrategySelector
          value={strategyId}
          onChange={setSelectedId}
          className="w-64"
          placeholder="Choisir une stratégie"
        />
      </div>

      {!strategyId ? (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
          <p className="text-muted-foreground text-sm">
            Sélectionnez une stratégie ci-dessus pour voir l&apos;attribution multi-canal.
          </p>
        </div>
      ) : (
        <AttributionDashboard strategyId={strategyId} />
      )}
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
