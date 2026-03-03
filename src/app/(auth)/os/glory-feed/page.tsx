// ==========================================================================
// PAGE P.OS7 — Brand OS / Glory Feed
// Creative production pipeline — content performance tracking.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { useBrandId } from "~/components/brand-os/brand-selector";

function GloryFeedContent() {
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
        <h1 className="text-2xl font-black tracking-tight">Glory Feed</h1>
        <p className="text-sm text-muted-foreground">Pipeline de production créative & performance des contenus</p>
      </div>

      {/* Placeholder — connects to existing GLORY system */}
      <div className="rounded-xl border border-dashed border-border/50 bg-card/20 p-12 text-center">
        <div className="text-4xl mb-4">🎨</div>
        <h3 className="text-lg font-semibold mb-2">Production créative</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Ce module connecte le système GLORY existant avec le tracking de performance en temps réel.
          Pipeline créatif, bibliothèque d&apos;assets, top performers, et audit de contenu.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 max-w-lg mx-auto">
          {[
            { label: "Brief → Production", value: "Pipeline" },
            { label: "Assets produits", value: "Bibliothèque" },
            { label: "Top contenus", value: "Analyse" },
            { label: "Cohérence visuelle", value: "Audit" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-muted-foreground/5 p-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GloryFeedPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Chargement...</div>}>
      <GloryFeedContent />
    </Suspense>
  );
}
