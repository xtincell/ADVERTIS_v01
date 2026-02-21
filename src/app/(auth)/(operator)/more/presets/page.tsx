// ==========================================================================
// PAGE P.8D — Presets (Operator)
// Strategy preset management — wraps the PresetManager component (C.O9).
// ==========================================================================

"use client";

import { PresetManager } from "~/components/ops/preset-manager";

export default function OperatorPresetsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Gestion des Presets
        </h1>
        <p className="text-sm text-muted-foreground">
          Configurez les templates de briefs pour acc&eacute;l&eacute;rer la
          cr&eacute;ation de strat&eacute;gies
        </p>
      </div>

      {/* Preset manager component */}
      <PresetManager />
    </div>
  );
}
