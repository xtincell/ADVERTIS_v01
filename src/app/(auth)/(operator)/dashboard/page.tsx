// ==========================================================================
// PAGE P.1 — Operator Dashboard
// Agency overview: greeting, alerts, KPIs, search + filtered brand list.
// Mobile-first scrollable stack layout. Single data call via getAgencyOverview.
// ==========================================================================

"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { AlertPanel } from "~/components/dashboard/alert-panel";
import { BrandSearchBar } from "~/components/brand/brand-search-bar";
import { AgencyKpiBar } from "~/components/dashboard/agency-kpi-bar";
import { CompactBrandCard } from "~/components/brand/compact-brand-card";
import { SectorBenchmark } from "~/components/analytics/sector-benchmark";

export default function OperatorDashboardPage() {
  const { data: session } = useSession();
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

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
    <div className="flex flex-col gap-4 p-4 pb-24 md:p-6">
      {/* 1. Greeting */}
      <div>
        <h1 className="text-xl font-semibold">
          Bonjour{firstName ? ` ${firstName}` : ""} {"👋"}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* 2. Alert banner */}
      {overview.alerts.length > 0 && (
        <AlertPanel
          alerts={overview.alerts}
          onBrandClick={(id) => window.location.href = `/brand/${id}`}
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
      <div className="space-y-3">
        {filteredBrands.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucune marque trouvée
          </p>
        ) : (
          filteredBrands.map((brand) => (
            <CompactBrandCard
              key={brand.id}
              id={brand.id}
              brandName={brand.brandName}
              sector={brand.sector}
              sectorLabel={brand.sectorLabel}
              phase={brand.phase}
              phaseLabel={brand.phaseLabel}
              coherenceScore={brand.coherenceScore}
              riskScore={brand.riskScore}
              bmfScore={brand.brandMarketFitScore}
              updatedAt={brand.updatedAt}
            />
          ))
        )}
      </div>
    </div>
  );
}
