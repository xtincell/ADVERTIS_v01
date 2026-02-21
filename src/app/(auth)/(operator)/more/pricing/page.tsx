// ==========================================================================
// PAGE P.8C — Pricing (Operator)
// Market pricing admin — wraps the MarketPricingAdmin component (C.O7).
// ==========================================================================

"use client";

import { MarketPricingAdmin } from "~/components/ops/market-pricing-admin";

export default function OperatorPricingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pricing</h1>
        <p className="text-sm text-muted-foreground">
          R&eacute;f&eacute;rentiel tarifaire par march&eacute; et
          cat&eacute;gorie
        </p>
      </div>

      {/* Pricing admin component */}
      <MarketPricingAdmin />
    </div>
  );
}
