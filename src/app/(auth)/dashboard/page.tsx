"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Plus,
  AlertTriangle,
  Activity,
  PieChart,
  GitBranch,
  Heart,
  ArrowRight,
  LayoutGrid,
  List,
} from "lucide-react";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { AdvertisMonogram } from "~/components/brand/advertis-logo";

// Dashboard components
import { AgencyKpiBar } from "~/components/dashboard/agency-kpi-bar";
import { BrandTable } from "~/components/dashboard/brand-table";
import { BrandCardGrid } from "~/components/dashboard/brand-card-grid";
import { AlertPanel } from "~/components/dashboard/alert-panel";
import { BrandDetailPanel } from "~/components/dashboard/brand-detail-panel";

// Visualisations
import { SectorDonut } from "~/components/analytics/sector-donut";
import { PhasePipeline } from "~/components/analytics/phase-pipeline";
import { HealthHeatmap } from "~/components/analytics/health-heatmap";
import { ActivityTimeline } from "~/components/analytics/activity-timeline";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-1.5 h-7 w-56" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col items-center gap-3 pt-5 pb-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-14 w-14 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>

      {/* Table */}
      <Skeleton className="h-48 rounded-lg" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Card className="border-dashed bg-gradient-to-br from-muted/50 to-transparent">
      <CardHeader className="items-center text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted/80">
          <AdvertisMonogram size={48} variant="color" />
        </div>
        <CardTitle className="mt-4 text-xl">
          Aucune fiche de marque pour le moment
        </CardTitle>
        <CardDescription className="max-w-md">
          Commencez par créer votre première fiche de marque en 8 piliers
          ADVERTIS pour structurer votre positionnement.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/strategy/new">
            <Plus className="mr-2 size-4" />
            Créer ma première fiche de marque
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { data: session } = useSession();
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const {
    data: overview,
    isLoading,
    isError,
  } = api.analytics.getAgencyOverview.useQuery();

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------
  if (isError) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="size-10 text-destructive mb-3" />
            <p className="text-destructive font-medium">
              Impossible de charger le tableau de bord.
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Veuillez réessayer ultérieurement.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (isLoading || !overview) {
    return <DashboardSkeleton />;
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------
  if (overview.totalBrands === 0) {
    return (
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-1"
        >
          <p className="text-sm font-medium text-muted-foreground">
            {getGreeting()}
            {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </p>
          <h2 className="text-2xl font-bold tracking-tight">
            Tableau de bord
          </h2>
        </motion.div>
        <motion.div variants={itemVariants}>
          <EmptyState />
        </motion.div>
      </motion.div>
    );
  }

  // ---------------------------------------------------------------------------
  // Brand detail view
  // ---------------------------------------------------------------------------
  const selectedBrand = selectedBrandId
    ? overview.brands.find((b) => b.id === selectedBrandId)
    : null;

  if (selectedBrand) {
    return (
      <BrandDetailPanel
        brand={selectedBrand}
        onBack={() => setSelectedBrandId(null)}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Agency overview (main view)
  // ---------------------------------------------------------------------------
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header / Greeting */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {getGreeting()}
            {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </p>
          <h2 className="text-2xl font-bold tracking-tight">
            Tableau de bord
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {overview.totalBrands} marque
            {overview.totalBrands > 1 ? "s" : ""} active
            {overview.totalBrands > 1 ? "s" : ""}
            {overview.avgCoherence > 0 && (
              <>
                {" "}&middot; Score moyen&nbsp;: {overview.avgCoherence}/100
              </>
            )}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/strategy/new">
            <Plus className="mr-1.5 size-4" />
            Nouvelle fiche
          </Link>
        </Button>
      </motion.div>

      {/* KPI Bar */}
      <motion.div variants={itemVariants}>
        <AgencyKpiBar
          totalBrands={overview.totalBrands}
          avgCoherence={overview.avgCoherence}
          avgRisk={overview.avgRisk}
          avgBrandMarketFit={overview.avgBrandMarketFit}
          completionRate={overview.completionRate}
        />
      </motion.div>

      {/* Charts row: distributions + health/alerts */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Sector donut + Phase pipeline */}
        <div className="space-y-6">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-terracotta" />
                <CardTitle className="text-sm font-semibold">Répartition par secteur</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SectorDonut data={overview.bySector} size={200} />
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-terracotta" />
                <CardTitle className="text-sm font-semibold">Pipeline par phase</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <PhasePipeline
                data={overview.byPhase}
                totalBrands={overview.totalBrands}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column: Health heatmap + Alerts */}
        <div className="space-y-6">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-terracotta" />
                <CardTitle className="text-sm font-semibold">Santé des marques</CardTitle>
              </div>
              <CardDescription>
                Cliquez sur une marque pour voir le détail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HealthHeatmap
                brands={overview.brands}
                onBrandClick={setSelectedBrandId}
                selectedBrandId={selectedBrandId ?? undefined}
              />
            </CardContent>
          </Card>

          <AlertPanel
            alerts={overview.alerts}
            onBrandClick={setSelectedBrandId}
          />
        </div>
      </motion.div>

      {/* Activity timeline */}
      {overview.recentActivity.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-terracotta" />
                <CardTitle className="text-sm font-semibold">Activité récente</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ActivityTimeline
                events={overview.recentActivity}
                onBrandClick={setSelectedBrandId}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Brand list (cards / table toggle) */}
      <motion.div variants={itemVariants}>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Toutes les marques</CardTitle>
                <CardDescription>
                  Cliquez sur {viewMode === "cards" ? "une carte" : "une ligne"} pour voir le détail complet
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-md border">
                  <Button
                    variant={viewMode === "cards" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setViewMode("cards")}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/strategy/new" className="text-xs text-muted-foreground">
                    Ajouter
                    <ArrowRight className="ml-1 size-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "cards" ? (
              <BrandCardGrid
                brands={overview.brands}
                onBrandClick={setSelectedBrandId}
              />
            ) : (
              <BrandTable
                brands={overview.brands}
                onBrandClick={setSelectedBrandId}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
