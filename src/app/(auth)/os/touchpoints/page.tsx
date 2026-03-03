// ==========================================================================
// PAGE P.OS3 — Brand OS / Touchpoints
// Channel matrix — all brand touchpoints with health and metrics.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-selector";
import { ChannelMatrix } from "~/components/brand-os/channel-matrix";

function TouchpointsContent() {
  const brandId = useBrandId();

  const { data: channels, isLoading } = api.brandOS.getChannels.useQuery(
    { strategyId: brandId! },
    { enabled: !!brandId },
  );

  if (!brandId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      </div>
    );
  }

  // Aggregate stats
  const totalFollowers = channels?.reduce((s, c) => s + c.followers, 0) ?? 0;
  const avgEngagement = channels && channels.length > 0
    ? channels.reduce((s, c) => s + c.engagementRate, 0) / channels.length
    : 0;
  const healthy = channels?.filter((c) => c.healthStatus === "HEALTHY").length ?? 0;
  const warning = channels?.filter((c) => c.healthStatus === "WARNING" || c.healthStatus === "CRITICAL").length ?? 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Touchpoints</h1>
        <p className="text-sm text-muted-foreground">Carte de tous les points de contact de la marque</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/40 bg-card/30 p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Audience totale</p>
          <p className="text-2xl font-bold tabular-nums">
            {totalFollowers >= 1_000_000 ? `${(totalFollowers / 1_000_000).toFixed(1)}M` :
             totalFollowers >= 1_000 ? `${(totalFollowers / 1_000).toFixed(1)}K` :
             totalFollowers.toLocaleString("fr-FR")}
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/30 p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Engagement moyen</p>
          <p className="text-2xl font-bold tabular-nums">{avgEngagement.toFixed(2)}%</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/30 p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">En forme</p>
          <p className="text-2xl font-bold tabular-nums text-green-500">{healthy}</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/30 p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Attention</p>
          <p className="text-2xl font-bold tabular-nums text-amber-500">{warning}</p>
        </div>
      </div>

      {/* Channel Matrix */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted-foreground/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <ChannelMatrix channels={channels ?? []} />
      )}
    </div>
  );
}

export default function TouchpointsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Chargement...</div>}>
      <TouchpointsContent />
    </Suspense>
  );
}
