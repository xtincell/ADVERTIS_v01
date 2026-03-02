// ==========================================================================
// PAGE P.8C — Pricing (Operator)
// Market pricing admin — wraps the MarketPricingAdmin component (C.O7).
// ==========================================================================

"use client";

import { MarketPricingAdmin } from "~/components/ops/market-pricing-admin";
import { PageHeader } from "~/components/ui/page-header";

export default function OperatorPricingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Pricing"
        description="Référentiel tarifaire par marché et catégorie"
        backHref="/pilotis"
        backLabel="Retour au menu"
      />

      {/* Pricing admin component */}
      <MarketPricingAdmin />
    </div>
  );
}
