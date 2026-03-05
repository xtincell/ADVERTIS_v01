// ==========================================================================
// HOOK — useStrategy
// Convenience hook for loading strategy data with pillar lookup.
// ==========================================================================

"use client";

import { useMemo } from "react";
import { api } from "~/trpc/react";
import type { PillarType } from "~/lib/constants";

/**
 * Loads strategy data via cockpit.getData and provides convenient accessors.
 *
 * @example
 * const { strategy, pillars, getPillar, isLoading } = useStrategy(strategyId);
 * const pillarA = getPillar("A");
 */
export function useStrategy(strategyId: string | undefined) {
  const query = api.cockpit.getData.useQuery(
    { strategyId: strategyId! },
    { enabled: !!strategyId },
  );

  const pillars = query.data?.pillars ?? [];

  const pillarMap = useMemo(() => {
    const map = new Map<string, (typeof pillars)[number]>();
    for (const p of pillars) {
      map.set(p.type, p);
    }
    return map;
  }, [pillars]);

  const getPillar = (type: PillarType) => pillarMap.get(type);

  return {
    strategy: query.data,
    pillars,
    pillarMap,
    getPillar,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
