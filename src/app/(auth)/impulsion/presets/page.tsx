// ==========================================================================
// PAGE P.8D — Presets (Operator)
// Strategy preset management — wraps the PresetManager component (C.O9).
// ==========================================================================

"use client";

import { PresetManager } from "~/components/ops/preset-manager";
import { PageHeader } from "~/components/ui/page-header";

export default function OperatorPresetsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Presets de stratégie"
        description="Modèles de fiche pré-configurés"
        backHref="/impulsion"
        backLabel="Retour au menu"
      />

      {/* Preset manager component */}
      <PresetManager />
    </div>
  );
}
