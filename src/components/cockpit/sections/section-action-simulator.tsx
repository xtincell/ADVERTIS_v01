// =============================================================================
// COMPONENT C.KSA — Section Action Simulator
// =============================================================================
// CockpitSection wrapper for the Action Marketing Simulator.
// Uses tRPC to fetch simulator data (all campaign actions + budget + products).
// =============================================================================

"use client";

import { Sliders, Loader2 } from "lucide-react";
import { PILLAR_CONFIG } from "~/lib/constants";
import { CockpitSection } from "../cockpit-shared";
import { api } from "~/trpc/react";
import dynamic from "next/dynamic";

const ActionSimulator = dynamic(
  () =>
    import("../action-simulator").then((mod) => ({
      default: mod.ActionSimulator,
    })),
  { ssr: false },
);

interface SectionActionSimulatorProps {
  strategyId?: string;
}

export function SectionActionSimulator({ strategyId }: SectionActionSimulatorProps) {
  const { data, isLoading, error } = api.campaign.simulator.getData.useQuery(
    { strategyId: strategyId ?? "" },
    { enabled: !!strategyId },
  );

  return (
    <CockpitSection
      icon={<Sliders className="h-5 w-5" />}
      pillarLetter="I"
      title="Simulateur d'Actions Marketing"
      subtitle="Optimisez la combinaison d'actions par SKU, budget et canal"
      color={PILLAR_CONFIG.I.color}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Erreur lors du chargement des donnees du simulateur.
        </div>
      ) : data ? (
        <ActionSimulator data={data} />
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Aucune donnee disponible. Creez des campagnes et des actions.
        </div>
      )}
    </CockpitSection>
  );
}
