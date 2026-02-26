// =============================================================================
// HOOK H.GLORY.2 — useFieldEnrichment
// =============================================================================
// Fetches field enrichment data for a GLORY tool form.
// Returns suggestions, default values, and dynamic options per field.
// =============================================================================

"use client";

import { api } from "~/trpc/react";
import type { FieldEnrichment } from "~/lib/types/glory-tools";

export function useFieldEnrichment(
  toolSlug: string,
  strategyId?: string,
): {
  enrichments: Record<string, FieldEnrichment>;
  isLoading: boolean;
} {
  const { data, isLoading } = api.glory.getFieldEnrichment.useQuery(
    { toolSlug, strategyId: strategyId! },
    { enabled: !!strategyId && !!toolSlug },
  );

  return {
    enrichments: data ?? {},
    isLoading,
  };
}
