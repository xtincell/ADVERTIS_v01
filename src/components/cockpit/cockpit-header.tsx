// ==========================================================================
// COMPONENT C.K20 — CockpitHeader
// Sticky mobile header for brand cockpit: brand name, scores, menu.
// All actions are wired to tRPC mutations with confirmation dialogs.
// ==========================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MoreVertical,
  Share2,
  Download,
  RefreshCw,
  Copy,
  Archive,
  ArchiveRestore,
  GitBranch,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useLabel } from "~/components/hooks/use-label";

interface CockpitHeaderProps {
  brandName: string;
  sector?: string | null;
  maturityProfile?: string | null;
  coherenceScore?: number | null;
  strategyId: string;
  status?: string;
  onShare?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
}

export function CockpitHeader({
  brandName,
  sector,
  maturityProfile,
  coherenceScore,
  strategyId,
  status = "draft",
  onShare,
  onExport,
  onRefresh,
}: CockpitHeaderProps) {
  const router = useRouter();
  const label = useLabel();
  const utils = api.useUtils();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const meta = [sector, maturityProfile].filter(Boolean).join(" · ");
  const isArchived = status === "archived";

  // ── Mutations ──

  const duplicateMut = api.strategy.duplicate.useMutation({
    onSuccess: (data) => {
      toast.success(`"${brandName}" dupliquée`);
      void utils.analytics.getAgencyOverview.invalidate();
      router.push(`/brand/${data.id}`);
    },
    onError: () => toast.error("Erreur lors de la duplication"),
  });

  const archiveMut = api.strategy.archive.useMutation({
    onSuccess: () => {
      toast.success(`"${brandName}" archivée`);
      void utils.analytics.getAgencyOverview.invalidate();
      router.push("/dashboard");
    },
    onError: () => toast.error("Erreur lors de l'archivage"),
  });

  const unarchiveMut = api.strategy.unarchive.useMutation({
    onSuccess: () => {
      toast.success(`"${brandName}" restaurée`);
      void utils.analytics.getAgencyOverview.invalidate();
      void utils.cockpit.getData.invalidate({ strategyId });
    },
    onError: () => toast.error("Erreur lors de la restauration"),
  });

  const deleteMut = api.strategy.delete.useMutation({
    onSuccess: () => {
      toast.success(`"${brandName}" supprimée définitivement`);
      void utils.analytics.getAgencyOverview.invalidate();
      router.push("/dashboard");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const isMutating =
    duplicateMut.isPending ||
    archiveMut.isPending ||
    unarchiveMut.isPending ||
    deleteMut.isPending;

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Back button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Brand info */}
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-base font-semibold">{brandName}</h1>
            {meta && (
              <p className="truncate text-xs text-muted-foreground">{meta}</p>
            )}
          </div>

          {/* Score badge */}
          {coherenceScore != null && (
            <span className="shrink-0 rounded-full bg-terracotta/10 px-2.5 py-0.5 text-sm font-semibold text-terracotta">
              {Math.round(coherenceScore)}
            </span>
          )}

          {/* Context menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={isMutating}
              >
                {isMutating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreVertical className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => router.push(`/brand/${strategyId}/generate`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Éditer la fiche
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/brand/${strategyId}/generate`)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Générer / Régénérer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onShare && (
                <DropdownMenuItem onClick={onShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager le cockpit
                </DropdownMenuItem>
              )}
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </DropdownMenuItem>
              )}
              {onRefresh && (
                <DropdownMenuItem onClick={onRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recalculer les scores
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/new?parentId=${strategyId}`)}
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Créer sous-marque
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => duplicateMut.mutate({ id: strategyId })}
                disabled={duplicateMut.isPending}
              >
                <Copy className="mr-2 h-4 w-4" />
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (isArchived) {
                    unarchiveMut.mutate({ id: strategyId });
                  } else {
                    setShowArchiveDialog(true);
                  }
                }}
              >
                {isArchived ? (
                  <>
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Restaurer
                  </>
                ) : (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Archiver
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Archive confirmation */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Archiver &laquo;&nbsp;{brandName}&nbsp;&raquo; ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              La marque sera masquée du tableau de bord. Vous pourrez la restaurer
              à tout moment depuis les filtres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                archiveMut.mutate({ id: strategyId });
                setShowArchiveDialog(false);
              }}
            >
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer &laquo;&nbsp;{brandName}&nbsp;&raquo; ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les piliers, scores et documents
              associés seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deleteMut.mutate({ id: strategyId });
                setShowDeleteDialog(false);
              }}
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
