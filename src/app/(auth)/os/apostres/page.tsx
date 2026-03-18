// ==========================================================================
// PAGE P.OS6 — Programme Apôtres (Ambassadors)
// Brand ambassador management in Brand OS portal.
// ==========================================================================

"use client";

import dynamic from "next/dynamic";
import { Loader2, Users, UserCheck, Star } from "lucide-react";
import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-selector";

const AmbassadorBoard = dynamic(
  () => import("~/components/brand-os/ambassador-board").then((m) => ({ default: m.AmbassadorBoard })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

function StatsHeader() {
  const brandId = useBrandId();

  const { data: stats } = api.ambassador.getStats.useQuery(
    { strategyId: brandId! },
    { enabled: !!brandId },
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Ambassadeurs</h1>
        <p className="text-sm text-muted-foreground">
          Programme Apôtres — gestion et suivi de vos ambassadeurs de marque
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {stats?.total ?? "—"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <UserCheck className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Actifs</span>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {stats?.active ?? "—"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Star className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Engagement moy.</span>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {stats?.avgEngagement != null ? `${stats.avgEngagement}%` : "—"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Parrainages</span>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {stats?.totalReferrals ?? "—"}
          </p>
        </div>
      </div>

      <div className="section-divider" />
    </div>
  );
}

export default function ApostresPage() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <StatsHeader />
      <AmbassadorBoard />
    </div>
  );
}
