// ==========================================================================
// PAGE P.OS1 — Brand OS / Nucleus
// The heart of the Brand OS: Superfan hub with Cult Index at the center.
// This is the main view — the "homepage" of the brand operating system.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-selector";
import { useBrandOS } from "~/components/brand-os/brand-os-provider";
import { CultIndexGauge } from "~/components/brand-os/cult-index-gauge";
import { SuperfanFunnel } from "~/components/brand-os/superfan-funnel";
import { DevotionLadder } from "~/components/brand-os/devotion-ladder";
import { MarketHeatmap } from "~/components/brand-os/market-heatmap";
import { getCultTier, CULT_TIERS } from "~/lib/types/brand-os";

function NucleusContent() {
  const brandId = useBrandId();
  const { brands, isLoading: brandLoading } = useBrandOS();

  const { data: cultIndex, isLoading: loadingCult } = api.brandOS.getCultIndex.useQuery(
    { strategyId: brandId! },
    { enabled: !!brandId },
  );

  const { data: funnel, isLoading: loadingFunnel } = api.brandOS.getSuperfanFunnel.useQuery(
    { strategyId: brandId! },
    { enabled: !!brandId },
  );

  const { data: markets } = api.brandOS.getSuperfansByMarket.useQuery(
    { strategyId: brandId! },
    { enabled: !!brandId },
  );

  const { data: topSuperfans } = api.brandOS.getTopSuperfans.useQuery(
    { strategyId: brandId!, limit: 10 },
    { enabled: !!brandId },
  );

  const { data: history } = api.brandOS.getCultIndexHistory.useQuery(
    { strategyId: brandId!, limit: 30 },
    { enabled: !!brandId },
  );

  // Still loading brand context
  if (brandLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Chargement de la marque...</div>
      </div>
    );
  }

  // Portfolio loaded but empty — no retainer brands
  if (!brandId && brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-muted-foreground text-sm">
          Aucune marque retainer trouvée.
        </p>
        <p className="text-muted-foreground text-xs max-w-sm text-center">
          Le Brand OS est réservé aux marques en mode Retainer. Créez une stratégie
          avec le mode de livraison « Retainer » dans Impulsion pour commencer.
        </p>
      </div>
    );
  }

  if (!brandId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Chargement de la marque...</div>
      </div>
    );
  }

  const tier = cultIndex ? getCultTier(cultIndex.cultIndex) : null;
  const prevCult = history?.[0]?.cultIndex ?? null;
  const trend = cultIndex && prevCult != null ? cultIndex.cultIndex - prevCult : null;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight">Nucleus</h1>
        <p className="text-sm text-muted-foreground">
          Le noyau de votre marque — superfans & cult index
        </p>
      </div>

      {/* Hero: Cult Index */}
      <div className="flex flex-col items-center py-6">
        {loadingCult ? (
          <div className="w-[200px] h-[200px] rounded-full bg-muted-foreground/5 animate-pulse" />
        ) : cultIndex ? (
          <CultIndexGauge score={cultIndex.cultIndex} trend={trend} size="xl" />
        ) : (
          <CultIndexGauge score={0} size="xl" />
        )}
      </div>

      {/* Breakdown cards */}
      {cultIndex && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {([
            { key: "engagementDepth", label: "Profondeur", color: "#F59E0B" },
            { key: "superfanVelocity", label: "Vélocité", color: "#3B82F6" },
            { key: "communityCohesion", label: "Cohésion", color: "#8B5CF6" },
            { key: "brandDefenseRate", label: "Défense", color: "#EF4444" },
            { key: "ugcGenerationRate", label: "UGC", color: "#22C55E" },
            { key: "ritualAdoption", label: "Rituels", color: "#EC4899" },
            { key: "evangelismScore", label: "Évangélisme", color: "#F97316" },
          ] as const).map((dim) => (
            <div
              key={dim.key}
              className="rounded-xl border border-border/40 bg-card/30 p-3 flex flex-col items-center"
            >
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {dim.label}
              </span>
              <span className="text-lg font-bold" style={{ color: dim.color }}>
                {Math.round(cultIndex[dim.key])}
              </span>
              {/* Mini bar */}
              <div className="w-full h-1 mt-1 rounded-full bg-muted-foreground/10">
                <div
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${cultIndex[dim.key]}%`,
                    backgroundColor: dim.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Devotion Ladder — Full-width visual with conversion rates ── */}
      <div className="rounded-xl border border-border/40 bg-card/30 p-4">
        {loadingFunnel ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 bg-muted-foreground/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <DevotionLadder
            data={funnel ?? []}
            totalCommunity={cultIndex?.totalCommunity}
          />
        )}
      </div>

      {/* Two-column layout: Funnel (compact) + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Superfan Funnel — compact bars view */}
        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
          {loadingFunnel ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 bg-muted-foreground/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <SuperfanFunnel
              data={funnel ?? []}
              totalCommunity={cultIndex?.totalCommunity}
            />
          )}
        </div>

        {/* Market Heatmap */}
        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
          <MarketHeatmap data={markets ?? []} />
        </div>
      </div>

      {/* Top Superfans */}
      {topSuperfans && topSuperfans.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Top Superfans
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {topSuperfans.map((fan) => (
              <div
                key={fan.id}
                className="flex items-center gap-3 rounded-lg bg-muted-foreground/5 p-2.5"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-amber-500">
                    {fan.displayName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{fan.displayName}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{fan.segment}</span>
                    <span className="text-[10px] text-amber-500 font-bold">
                      {Math.round(fan.engagementDepth)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NucleusPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Chargement du Nucleus...</div>
      </div>
    }>
      <NucleusContent />
    </Suspense>
  );
}
