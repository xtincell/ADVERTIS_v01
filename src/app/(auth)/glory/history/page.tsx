"use client";

// =============================================================================
// PAGE P.GLORY — History Page
// =============================================================================
// Displays the history of saved GLORY outputs, filtered by strategyId.
// =============================================================================

import { useSearchParams } from "next/navigation";
import { GloryHistory } from "~/components/glory/glory-history";

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const strategyId = searchParams.get("strategyId") ?? undefined;

  return <GloryHistory strategyId={strategyId} />;
}
