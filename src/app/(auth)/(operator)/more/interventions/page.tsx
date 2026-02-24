// ==========================================================================
// PAGE P.8C — Interventions (Operator)
// Mounts the InterventionPanel for managing pending intervention requests.
// ==========================================================================

import { InterventionPanel } from "~/components/ops/intervention-panel";

export default function InterventionsPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <InterventionPanel />
    </div>
  );
}
