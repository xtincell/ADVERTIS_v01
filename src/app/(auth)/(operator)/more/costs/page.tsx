// ==========================================================================
// PAGE P.8E — Costs (Operator)
// AI cost tracking dashboard — wraps the CostDashboard component (C.O6).
// ==========================================================================

"use client";

import { CostDashboard } from "~/components/ops/cost-dashboard";

export default function OperatorCostsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Co&ucirc;ts IA
        </h1>
        <p className="text-sm text-muted-foreground">
          Suivi de la consommation IA &mdash; appels, tokens et co&ucirc;ts par
          type de g&eacute;n&eacute;ration
        </p>
      </div>

      {/* Cost dashboard component */}
      <CostDashboard />
    </div>
  );
}
