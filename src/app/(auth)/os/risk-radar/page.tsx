// ==========================================================================
// PAGE P.OS8 — Brand OS / Risk Radar
// Brand protection — crisis early warning, reputation monitoring.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { useBrandId } from "~/components/brand-os/brand-selector";

function RiskRadarContent() {
  const brandId = useBrandId();

  if (!brandId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Risk Radar</h1>
        <p className="text-sm text-muted-foreground">Veille & protection de la marque</p>
      </div>

      {/* Placeholder — connects to existing Signal Intelligence System */}
      <div className="rounded-xl border border-dashed border-border/50 bg-card/20 p-12 text-center">
        <div className="text-4xl mb-4">🛡️</div>
        <h3 className="text-lg font-semibold mb-2">Bouclier de marque</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Ce module enrichit le système de signaux (SIS) existant avec des données social media
          en temps réel. Détection de crise, brand safety, veille concurrentielle et SWOT dynamique.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 max-w-lg mx-auto">
          {[
            { label: "Alerte précoce", value: "Crisis", color: "#ef4444" },
            { label: "Brand Safety", value: "Monitor", color: "#f59e0b" },
            { label: "Concurrents", value: "Veille", color: "#3b82f6" },
            { label: "SWOT dynamique", value: "Live", color: "#22c55e" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-muted-foreground/5 p-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RiskRadarPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Chargement...</div>}>
      <RiskRadarContent />
    </Suspense>
  );
}
