// ==========================================================================
// PAGE P.8C — Interventions (Operator)
// Mounts the InterventionPanel for managing pending intervention requests.
// ==========================================================================

import { InterventionPanel } from "~/components/ops/intervention-panel";
import { PageHeader } from "~/components/ui/page-header";

export default function InterventionsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Interventions"
        description="Gérez les demandes d'intervention en attente"
        backHref="/pilotis"
        backLabel="Retour au menu"
      />
      <InterventionPanel />
    </div>
  );
}
