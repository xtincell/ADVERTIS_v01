// =============================================================================
// PAGE — ARTEMIS Cockpit
// =============================================================================
// Central ARTEMIS dashboard: 9-layer overview, quality gates, orchestration.
// =============================================================================

"use client";

import { useState } from "react";
import { ArtemisOverview } from "~/components/cockpit/artemis-overview";
import { QualityGatePanel } from "~/components/cockpit/quality-gate-panel";

// ---------------------------------------------------------------------------
// Layer definitions
// ---------------------------------------------------------------------------

const LAYER_DEFS = [
  { name: "PHILOSOPHY", label: "0 — Philosophie" },
  { name: "IDENTITY", label: "1 — Identit\u00e9" },
  { name: "VALUE", label: "2 — Valeur" },
  { name: "EXPERIENCE", label: "3 — Exp\u00e9rience" },
  { name: "VALIDATION", label: "4 — Validation" },
  { name: "EXECUTION", label: "5 — Ex\u00e9cution" },
  { name: "MEASURE", label: "6 — Mesure" },
  { name: "GROWTH", label: "7 — Croissance" },
  { name: "SURVIVAL", label: "8 — Survie" },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ArtemisPage() {
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  // Build placeholder layer data
  // In a real scenario, this would come from tRPC queries like:
  //   api.framework.getArtemisScore.useQuery({ strategyId })
  //   api.framework.getQualityGates.useQuery({ strategyId })
  const layers = LAYER_DEFS.map((def) => ({
    name: def.name,
    label: def.label,
    frameworks: [] as Array<{
      id: string;
      name: string;
      layer: string;
      status: "complete" | "stale" | "error" | "pending" | "running";
      hasImplementation: boolean;
    }>,
    score: null as number | null,
  }));

  const handleOrchestrate = () => {
    setIsOrchestrating(true);
    // In production: api.framework.orchestrate.mutate(...)
    setTimeout(() => setIsOrchestrating(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          ARTEMIS — Cockpit
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vue d&apos;ensemble du syst&egrave;me ARTEMIS : 24 frameworks, 9 couches, score global.
        </p>
      </div>

      <ArtemisOverview
        layers={layers}
        globalScore={null}
        isOrchestrating={isOrchestrating}
        onOrchestrate={handleOrchestrate}
      />

      <QualityGatePanel
        gates={[]}
        className="mt-4"
      />
    </div>
  );
}
