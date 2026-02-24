"use client";

// =============================================================================
// PAGE P.GLORY — Individual Tool Page
// =============================================================================
// Dynamic route page for a single GLORY tool.
// Extracts toolSlug from params and strategyId from search params.
// =============================================================================

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { GloryToolPage } from "~/components/glory/glory-tool-page";

export default function ToolPage(props: {
  params: Promise<{ toolSlug: string }>;
}) {
  const params = use(props.params);
  const searchParams = useSearchParams();
  const strategyId = searchParams.get("strategyId") ?? undefined;

  return <GloryToolPage toolSlug={params.toolSlug} strategyId={strategyId} />;
}
