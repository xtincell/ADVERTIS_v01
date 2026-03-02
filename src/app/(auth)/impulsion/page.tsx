// ==========================================================================
// PAGE P.1 — Operator Dashboard
// Agency overview: greeting, alerts, KPIs, search + filtered brand list.
// Mobile-first scrollable stack layout. Single data call via getAgencyOverview.
// ==========================================================================

"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { AlertPanel } from "~/components/dashboard/alert-panel";
import { BrandSearchBar } from "~/components/brand/brand-search-bar";
import { AgencyKpiBar } from "~/components/dashboard/agency-kpi-bar";
import { CompactBrandCard } from "~/components/brand/compact-brand-card";
import { SectorBenchmark } from "~/components/analytics/sector-benchmark";
import { OnboardingHero } from "~/components/dashboard/onboarding-hero";

export default function OperatorDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  // ── Single data call ──
  const {
    data: overview,
    isLoading,
    isError,
    refetch,
  } = api.analytics.getAgencyOverview.useQuery();

  // ── Local filter state ──
  const [searchText, setSearchText] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");

  // ── Filtered brands ──
  const filteredBrands = useMemo(() => {
    if (!overview?.brands) return [];
    return overview.brands.filter((b) => {
      // Search by brand name
      if (
        searchText &&
        !b.brandName.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return false;
      }
      // Sector filter
      if (sectorFilter && b.sector !== sectorFilter) return false;
      // Phase filter
      if (phaseFilter && b.phase !== phaseFilter) return false;
      return true;
    });
  }, [overview?.brands, searchText, sectorFilter, phaseFilter]);

  // ── Loading state — skeleton ──
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 pb-24 md:p-6 stagger-children">
        <div className="space-y-2">
          <div className="h-7 w-48 shimmer rounded-md bg-muted" />
          <div className="h-4 w-32 shimmer rounded-md bg-muted" />
        </div>
        <div className="h-10 w-full shimmer rounded-lg bg-muted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 shimmer rounded-xl bg-muted" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 shimmer rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (isError || !overview) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">
          Impossible de charger le tableau de bord
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  // ── Onboarding: No brands yet ──
  if (overview.totalBrands === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 pb-24 bg-mesh">
        <OnboardingHero
          firstName={firstName}
          onCreateBrand={() => router.push("/impulsion/new")}
        />
      </div>
    );
  }

  // ── Subtitle ──
  const healthLabel =
    overview.avgCoherence > 0 ? `Santé ${overview.avgCoherence}%` : "";
  const subtitle = [
    `${overview.totalBrands} marque${overview.totalBrands !== 1 ? "s" : ""}`,
    healthLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 md:p-6 animate-page-enter">
      {/* 1. Greeting */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">
          Bonjour{firstName ? ` ${firstName}` : ""} {"👋"}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* 2. Alert banner */}
      {overview.alerts.length > 0 && (
        <AlertPanel
          alerts={overview.alerts}
          onBrandClick={(id) => router.push(`/impulsion/brand/${id}`)}
        />
      )}

      {/* 3. Search bar */}
      <BrandSearchBar
        value={searchText}
        onChange={setSearchText}
        sectorFilter={sectorFilter}
        onSectorChange={setSectorFilter}
        phaseFilter={phaseFilter}
        onPhaseChange={setPhaseFilter}
      />

      {/* 4. KPI bar */}
      <AgencyKpiBar
        totalBrands={overview.totalBrands}
        avgCoherence={overview.avgCoherence}
        avgRisk={overview.avgRisk}
        avgBrandMarketFit={overview.avgBrandMarketFit}
        completionRate={overview.completionRate}
      />

      {/* 5. Sector benchmarks */}
      {overview.totalBrands >= 2 && <SectorBenchmark />}

      {/* 6. Brand list */}
      <div className="space-y-3 stagger-children">
        {filteredBrands.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <AlertTriangle className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Aucune marque ne correspond à vos filtres
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchText("");
                setSectorFilter("");
                setPhaseFilter("");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          filteredBrands.map((brand) => (
            <CompactBrandCard
              key={brand.id}
              id={brand.id}
              brandName={brand.brandName}
              status={brand.status}
              sector={brand.sector}
              sectorLabel={brand.sectorLabel}
              phase={brand.phase}
              phaseLabel={brand.phaseLabel}
              coherenceScore={brand.coherenceScore}
              riskScore={brand.riskScore}
              bmfScore={brand.brandMarketFitScore}
              updatedAt={brand.updatedAt}
              onMutationSuccess={() => void refetch()}
            />
          ))
        )}
      </div>
    </div>
  );
}
