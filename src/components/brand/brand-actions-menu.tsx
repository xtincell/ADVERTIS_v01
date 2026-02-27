// ==========================================================================
// C.B3 — Brand Actions Menu
// Reusable dropdown with Edit, Duplicate, Archive/Unarchive, Delete.
// Includes AlertDialog confirmation for destructive actions.
// Used in: CompactBrandCard, BrandCardGrid, BrandTable, CockpitHeader.
// ==========================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit,
  Copy,
  Archive,
  ArchiveRestore,
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BrandActionsMenuProps {
  strategyId: string;
  brandName: string;
  status: string;
  /** Compact mode: smaller trigger button for cards/table rows */
  compact?: boolean;
  /** Called after any mutation succeeds (e.g. to invalidate queries) */
  onMutationSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BrandActionsMenu({
  strategyId,
  brandName,
  status,
  compact = false,
  onMutationSuccess,
}: BrandActionsMenuProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const isArchived = status === "archived";

  // ── Mutations ──

  const duplicateMut = api.strategy.duplicate.useMutation({
    onSuccess: (data) => {
      toast.success(`"${brandName}" dupliquée`);
      void utils.analytics.getAgencyOverview.invalidate();
      void utils.strategy.getAll.invalidate();
      onMutationSuccess?.();
      router.push(`/brand/${data.id}`);
    },
    onError: () => toast.error("Erreur lors de la duplication"),
  });

  const archiveMut = api.strategy.archive.useMutation({
    onSuccess: () => {
      toast.success(`"${brandName}" archivée`);
      void utils.analytics.getAgencyOverview.invalidate();
      void utils.strategy.getAll.invalidate();
      onMutationSuccess?.();
    },
    onError: () => toast.error("Erreur lors de l'archivage"),
  });

  const unarchiveMut = api.strategy.unarchive.useMutation({
    onSuccess: () => {
      toast.success(`"${brandName}" restaurée`);
      void utils.analytics.getAgencyOverview.invalidate();
      void utils.strategy.getAll.invalidate();
      onMutationSuccess?.();
    },
    onError: () => toast.error("Erreur lors de la restauration"),
  });

  const deleteMut = api.strategy.delete.useMutation({
    onSuccess: () => {
      toast.success(`"${brandName}" supprimée définitivement`);
      void utils.analytics.getAgencyOverview.invalidate();
      void utils.strategy.getAll.invalidate();
      onMutationSuccess?.();
      // Navigate to dashboard if we're on the brand page
      router.push("/dashboard");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const isMutating =
    duplicateMut.isPending ||
    archiveMut.isPending ||
    unarchiveMut.isPending ||
    deleteMut.isPending;

  // ── Handlers ──

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/brand/${strategyId}`);
  }

  function handleDuplicate(e: React.MouseEvent) {
    e.stopPropagation();
    duplicateMut.mutate({ id: strategyId });
  }

  function handleArchiveToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (isArchived) {
      unarchiveMut.mutate({ id: strategyId });
    } else {
      setShowArchiveDialog(true);
    }
  }

  function confirmArchive() {
    archiveMut.mutate({ id: strategyId });
    setShowArchiveDialog(false);
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setShowDeleteDialog(true);
  }

  function confirmDelete() {
    deleteMut.mutate({ id: strategyId });
    setShowDeleteDialog(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={compact ? "h-7 w-7" : "h-8 w-8"}
            onClick={(e) => e.stopPropagation()}
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
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Ouvrir le cockpit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate} disabled={duplicateMut.isPending}>
            <Copy className="mr-2 h-4 w-4" />
            Dupliquer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleArchiveToggle}>
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
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive confirmation */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver &laquo;&nbsp;{brandName}&nbsp;&raquo; ?</AlertDialogTitle>
            <AlertDialogDescription>
              La marque sera masquée du tableau de bord. Vous pourrez la restaurer
              à tout moment depuis les filtres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>
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
              onClick={confirmDelete}
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
