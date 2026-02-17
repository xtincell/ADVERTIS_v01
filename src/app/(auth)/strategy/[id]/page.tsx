"use client";

import { useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit3,
  Download,
  Archive,
  ArchiveRestore,
  Trash2,
  RefreshCw,
  Loader2,
  Check,
  CircleDashed,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import { api } from "~/trpc/react";
import {
  PILLAR_CONFIG,
  PILLAR_TYPES,
  SECTORS,
  FICHE_PILLARS,
  AUDIT_PILLARS,
  PHASE_CONFIG,
} from "~/lib/constants";
import type { PillarType, Phase } from "~/lib/constants";
import { PhaseBadge } from "~/components/strategy/phase-timeline";
import { ExportDialog } from "~/components/strategy/export-dialog";

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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
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
      return <Badge variant="secondary">Brouillon</Badge>;
    case "generating":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          En cours de génération
        </Badge>
      );
    case "complete":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Terminée
        </Badge>
      );
    case "archived":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Archivée
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getPillarStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="text-xs">
          <CircleDashed className="mr-1 size-3" />
          En attente
        </Badge>
      );
    case "generating":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs">
          <Loader2 className="mr-1 size-3 animate-spin" />
          Génération...
        </Badge>
      );
    case "complete":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
          <Check className="mr-1 size-3" />
          Terminé
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="mr-1 size-3" />
          Erreur
        </Badge>
      );
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>;
  }
}

function getPillarStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return <CircleDashed className="size-4 text-muted-foreground" />;
    case "generating":
      return <Loader2 className="size-4 text-amber-600 animate-spin" />;
    case "complete":
      return <Check className="size-4 text-green-600" />;
    case "error":
      return <X className="size-4 text-red-600" />;
    default:
      return <CircleDashed className="size-4 text-muted-foreground" />;
  }
}

function getSectorLabel(sectorValue: string | null | undefined): string {
  if (!sectorValue) return "";
  const found = SECTORS.find((s) => s.value === sectorValue);
  return found ? found.label : sectorValue;
}

function formatContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (content === null || content === undefined) return "";
  return JSON.stringify(content, null, 2);
}

// ---------------------------------------------------------------------------
// Pillar Nav Sidebar
// ---------------------------------------------------------------------------

function PillarNavSidebar({
  pillars,
}: {
  pillars: {
    id: string;
    type: string;
    status: string;
    title: string;
  }[];
}) {
  const handleClick = (type: string) => {
    const el = document.getElementById(`pillar-${type}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Piliers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {pillars.map((pillar) => {
          const config = PILLAR_CONFIG[pillar.type as PillarType];
          return (
            <button
              key={pillar.id}
              onClick={() => handleClick(pillar.type)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted text-left"
            >
              <div
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: config?.color }}
              />
              <span className="flex-1 truncate">
                {config?.title ?? pillar.type}
              </span>
              {getPillarStatusIcon(pillar.status)}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Pillar Section
// ---------------------------------------------------------------------------

function PillarSection({
  pillar,
  strategyId,
  defaultOpen,
}: {
  pillar: {
    id: string;
    type: string;
    title: string;
    status: string;
    summary: string | null;
    content: unknown;
    errorMessage: string | null;
  };
  strategyId: string;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = PILLAR_CONFIG[pillar.type as PillarType];
  const contentText = formatContent(pillar.content);

  return (
    <div id={`pillar-${pillar.type}`} className="scroll-mt-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card
          className="overflow-hidden"
          style={{ borderLeftWidth: "4px", borderLeftColor: config?.color }}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                {/* Pillar letter badge */}
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white"
                  style={{ backgroundColor: config?.color }}
                >
                  {pillar.type}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base">
                      {config?.title ?? pillar.title}
                    </CardTitle>
                    {getPillarStatusBadge(pillar.status)}
                  </div>
                  {!isOpen && pillar.summary && (
                    <CardDescription className="mt-1 line-clamp-1">
                      {pillar.summary}
                    </CardDescription>
                  )}
                </div>

                {/* Expand/collapse icon */}
                <div className="shrink-0">
                  {isOpen ? (
                    <ChevronDown className="size-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Error message */}
              {pillar.status === "error" && pillar.errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {pillar.errorMessage}
                  </p>
                </div>
              )}

              {/* Content */}
              {contentText ? (
                <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap rounded-lg bg-muted/30 p-4">
                  {contentText}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p className="text-sm">
                    Aucun contenu généré pour ce pilier.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/strategy/${strategyId}/pillar/${pillar.type}/edit`}
                  >
                    <Edit3 className="mr-1.5 size-3.5" />
                    Modifier
                  </Link>
                </Button>
                {pillar.content != null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info(
                        "La régénération sera bientôt disponible. Utilisez la page de génération pour régénérer un pilier.",
                      );
                    }}
                  >
                    <RefreshCw className="mr-1.5 size-3.5" />
                    Régénérer
                  </Button>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function StrategyDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Action buttons skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Pillar sections skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Strategy Detail Page
// ---------------------------------------------------------------------------

export default function StrategyDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const strategyId = params.id;

  // Fetch strategy data
  const {
    data: strategy,
    isLoading,
    refetch,
  } = api.strategy.getById.useQuery(
    { id: strategyId },
    { enabled: !!strategyId },
  );

  // Mutations
  const duplicateMutation = api.strategy.duplicate.useMutation({
    onSuccess: (data) => {
      toast.success("Fiche de marque dupliquée avec succès.");
      router.push(`/strategy/${data.id}`);
    },
    onError: () => {
      toast.error("Erreur lors de la duplication.");
    },
  });

  const archiveMutation = api.strategy.archive.useMutation({
    onSuccess: () => {
      toast.success("Fiche archivée.");
      void refetch();
    },
    onError: () => {
      toast.error("Erreur lors de l'archivage.");
    },
  });

  const unarchiveMutation = api.strategy.unarchive.useMutation({
    onSuccess: () => {
      toast.success("Fiche désarchivée.");
      void refetch();
    },
    onError: () => {
      toast.error("Erreur lors du désarchivage.");
    },
  });

  const deleteMutation = api.strategy.delete.useMutation({
    onSuccess: () => {
      toast.success("Fiche supprimée.");
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression.");
    },
  });

  const handleDuplicate = useCallback(() => {
    duplicateMutation.mutate({ id: strategyId });
  }, [duplicateMutation, strategyId]);

  const handleArchive = useCallback(() => {
    archiveMutation.mutate({ id: strategyId });
  }, [archiveMutation, strategyId]);

  const handleUnarchive = useCallback(() => {
    unarchiveMutation.mutate({ id: strategyId });
  }, [unarchiveMutation, strategyId]);

  const handleDelete = useCallback(() => {
    deleteMutation.mutate({ id: strategyId });
  }, [deleteMutation, strategyId]);

  // Loading
  if (isLoading || !strategy) {
    return <StrategyDetailSkeleton />;
  }

  const isComplete = strategy.status === "complete";
  const isArchived = strategy.status === "archived";
  const sortedPillars = [...strategy.pillars].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div className="space-y-6">
      {/* Back button + Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-1.5 size-4" />
            Retour au tableau de bord
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                {strategy.name}
              </h1>
              {getStatusBadge(strategy.status)}
            </div>
            <p className="text-lg text-muted-foreground">
              {strategy.brandName}
              {strategy.sector && (
                <span className="ml-2 text-sm">
                  &mdash; {getSectorLabel(strategy.sector)}
                </span>
              )}
            </p>
            {strategy.description && (
              <p className="text-sm text-muted-foreground max-w-2xl">
                {strategy.description}
              </p>
            )}
          </div>

          {/* Coherence score */}
          {strategy.coherenceScore !== null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-primary/20 text-xl font-bold text-primary">
                  {strategy.coherenceScore}
                </div>
              </TooltipTrigger>
              <TooltipContent>Score de cohérence global</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDuplicate}
          disabled={duplicateMutation.isPending}
        >
          {duplicateMutation.isPending ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <Copy className="mr-1.5 size-3.5" />
          )}
          Dupliquer
        </Button>

        <ExportDialog
          strategyId={strategyId}
          brandName={strategy.brandName}
          pillars={strategy.pillars.map((p: { type: string; title: string; status: string }) => ({
            type: p.type,
            title: p.title,
            status: p.status,
          }))}
        >
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 size-3.5" />
            Exporter
          </Button>
        </ExportDialog>

        {isArchived ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnarchive}
            disabled={unarchiveMutation.isPending}
          >
            {unarchiveMutation.isPending ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <ArchiveRestore className="mr-1.5 size-3.5" />
            )}
            Désarchiver
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
          >
            {archiveMutation.isPending ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Archive className="mr-1.5 size-3.5" />
            )}
            Archiver
          </Button>
        )}

        {/* Delete with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="mr-1.5 size-3.5" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette fiche de marque ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. La fiche &laquo;{" "}
                {strategy.name} &raquo; et tous ses piliers seront
                définitivement supprimés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDelete}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="mr-1.5 size-3.5" />
                )}
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Generate / Pipeline button */}
        {!isArchived && (
          <Button size="sm" asChild>
            <Link href={`/strategy/${strategyId}/generate`}>
              <Sparkles className="mr-1.5 size-3.5" />
              {isComplete ? "Pipeline" : "Continuer le pipeline"}
            </Link>
          </Button>
        )}
      </div>

      {/* Phase banner */}
      <div className="flex items-center gap-3">
        <PhaseBadge phase={(strategy.phase as Phase) ?? "fiche"} />
        {strategy.phase !== "complete" && (
          <p className="text-sm text-muted-foreground">
            {PHASE_CONFIG[(strategy.phase as Phase) ?? "fiche"]?.description}
          </p>
        )}
      </div>

      {/* Main content: Pillars + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
        {/* Pillar sections */}
        <div className="space-y-4">
          {sortedPillars.map((pillar) => (
            <PillarSection
              key={pillar.id}
              pillar={pillar}
              strategyId={strategyId}
              defaultOpen={isComplete}
            />
          ))}
        </div>

        {/* Navigation sidebar */}
        <div className="hidden lg:block">
          <PillarNavSidebar pillars={sortedPillars} />
        </div>
      </div>
    </div>
  );
}
