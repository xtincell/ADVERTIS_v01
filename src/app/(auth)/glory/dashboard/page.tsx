"use client";

// =============================================================================
// PAGE P.GLORY — Dashboard Page
// =============================================================================
// Full dashboard view of GLORY outputs, grouped by tool, with stats and filters.
// =============================================================================

import { useSearchParams } from "next/navigation";
import { GloryDashboard } from "~/components/glory/glory-dashboard";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const strategyId = searchParams.get("strategyId") ?? undefined;

  return <GloryDashboard strategyId={strategyId} />;
}
