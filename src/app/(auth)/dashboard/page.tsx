"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Plus,
  BarChart3,
  Clock,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";

import { api } from "~/trpc/react";
import { PILLAR_CONFIG, SECTORS } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusBadge(status: string) {
  switch (status) {
    case "draft":
      return (
        <Badge variant="secondary" className="text-xs">
          Brouillon
        </Badge>
      );
    case "generating":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs">
          En cours
        </Badge>
      );
    case "complete":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
          Terminée
        </Badge>
      );
    case "archived":
      return (
        <Badge variant="outline" className="text-muted-foreground text-xs">
          Archivée
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getSectorLabel(sectorValue: string | null | undefined): string {
  if (!sectorValue) return "";
  const found = SECTORS.find((s) => s.value === sectorValue);
  return found ? found.label : sectorValue;
}

function getRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return "a l'instant";
  if (diffMinutes < 60)
    return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
  if (diffHours < 24)
    return `il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7)
    return `il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  if (diffWeeks < 5)
    return `il y a ${diffWeeks} semaine${diffWeeks > 1 ? "s" : ""}`;
  return `il y a ${diffMonths} mois`;
}

// ---------------------------------------------------------------------------
// Metric Card
// ---------------------------------------------------------------------------

function MetricCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-6 text-primary" />
        </div>
        <div>
          {isLoading ? (
            <Skeleton className="h-8 w-12 mb-1" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          )}
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Strategy Card
// ---------------------------------------------------------------------------

function StrategyCard({
  strategy,
}: {
  strategy: {
    id: string;
    name: string;
    brandName: string;
    sector: string | null;
    status: string;
    coherenceScore: number | null;
    updatedAt: Date;
    pillars: { id: string; type: string; status: string }[];
    _count: { pillars: number };
  };
}) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
      onClick={() => router.push(`/strategy/${strategy.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg truncate">
              {strategy.brandName}
            </CardTitle>
            <CardDescription className="truncate">
              {strategy.name}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {strategy.coherenceScore !== null && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex size-10 items-center justify-center rounded-full border-2 border-primary/30 text-sm font-bold text-primary">
                    {strategy.coherenceScore}
                  </div>
                </TooltipTrigger>
                <TooltipContent>Score de coherence</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Sector + Status */}
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge(strategy.status)}
          {strategy.sector && (
            <Badge variant="outline" className="text-xs">
              {getSectorLabel(strategy.sector)}
            </Badge>
          )}
        </div>

        {/* Pillar dots */}
        <div className="flex items-center gap-1.5">
          {strategy.pillars.map((pillar) => {
            const config = PILLAR_CONFIG[pillar.type as PillarType];
            return (
              <Tooltip key={pillar.id}>
                <TooltipTrigger asChild>
                  <div
                    className="size-3 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        pillar.status === "complete"
                          ? config?.color ?? "#22c55e"
                          : pillar.status === "error"
                            ? "#ef4444"
                            : pillar.status === "generating"
                              ? "#eab308"
                              : "#d1d5db",
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {pillar.type} - {config?.title ?? pillar.type}:{" "}
                  {pillar.status === "complete"
                    ? "Terminé"
                    : pillar.status === "generating"
                      ? "En cours"
                      : pillar.status === "error"
                        ? "Erreur"
                        : "En attente"}
                </TooltipContent>
              </Tooltip>
            );
          })}
          <span className="ml-2 text-xs text-muted-foreground">
            {strategy._count.pillars}/8
          </span>
        </div>

        {/* Date */}
        <p className="text-xs text-muted-foreground">
          {getRelativeDate(strategy.updatedAt)}
        </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Skeleton Card
// ---------------------------------------------------------------------------

function StrategyCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-48 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="size-3 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <FolderOpen className="size-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl mt-2">
          Aucune stratégie pour le moment
        </CardTitle>
        <CardDescription className="max-w-md">
          Commencez par créer votre première stratégie de marque en 8 piliers
          ADVERTIS pour structurer votre positionnement.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild>
          <Link href="/strategy/new">
            <Plus className="mr-2 size-4" />
            Creer ma premiere strategie
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
  const [activeTab, setActiveTab] = useState("all");

  const {
    data: strategies,
    isLoading,
  } = api.strategy.getAll.useQuery();

  // Computed metrics
  const totalCount = strategies?.length ?? 0;
  const inProgressCount = useMemo(
    () =>
      strategies?.filter(
        (s) => s.status === "draft" || s.status === "generating",
      ).length ?? 0,
    [strategies],
  );
  const completedCount = useMemo(
    () => strategies?.filter((s) => s.status === "complete").length ?? 0,
    [strategies],
  );

  // Filtered strategies by tab
  const filteredStrategies = useMemo(() => {
    if (!strategies) return [];
    switch (activeTab) {
      case "in_progress":
        return strategies.filter(
          (s) => s.status === "draft" || s.status === "generating",
        );
      case "completed":
        return strategies.filter((s) => s.status === "complete");
      case "archived":
        return strategies.filter((s) => s.status === "archived");
      default:
        return strategies;
    }
  }, [strategies, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Tableau de bord
          </h2>
          <p className="text-muted-foreground">
            Bienvenue
            {session?.user?.name ? `, ${session.user.name}` : ""} ! Gerez
            vos strategies de marque depuis cet espace.
          </p>
        </div>
        <Button asChild>
          <Link href="/strategy/new">
            <Plus className="mr-2 size-4" />
            Nouvelle strategie
          </Link>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total strategies"
          value={totalCount}
          icon={BarChart3}
          isLoading={isLoading}
        />
        <MetricCard
          title="En cours"
          value={inProgressCount}
          icon={Clock}
          isLoading={isLoading}
        />
        <MetricCard
          title="Terminées"
          value={completedCount}
          icon={CheckCircle2}
          isLoading={isLoading}
        />
      </div>

      {/* Strategy list */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <StrategyCardSkeleton key={i} />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <EmptyState />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              Toutes ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              En cours ({inProgressCount})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Terminées ({completedCount})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archivées (
              {strategies?.filter((s) => s.status === "archived").length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredStrategies.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderOpen className="size-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Aucune stratégie dans cette catégorie.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredStrategies.map((strategy) => (
                  <StrategyCard key={strategy.id} strategy={strategy} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
