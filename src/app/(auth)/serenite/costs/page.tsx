// ==========================================================================
// PAGE P.8E — Costs (Operator)
// AI cost tracking dashboard — wraps the CostDashboard component (C.O6).
// ==========================================================================

"use client";

import { CostDashboard } from "~/components/ops/cost-dashboard";
import { PageHeader } from "~/components/ui/page-header";

export default function OperatorCostsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Coûts IA"
        description="Suivi de la consommation IA — appels, tokens et coûts par type de génération"
        backHref="/serenite"
        backLabel="Retour au menu"
      />

      {/* Cost dashboard component */}
      <CostDashboard />
    </div>
  );
}
