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
  Package,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { DELIVERY_MODES, type DeliveryMode } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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

const DELIVERY_LABELS: Record<string, string> = {
  ONE_SHOT: "One-Shot",
  PLACEMENT: "Placement",
  RETAINER: "Retainer",
};

const DELIVERY_BADGE_STYLES: Record<string, string> = {
  ONE_SHOT: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  PLACEMENT: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  RETAINER: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

interface CockpitHeaderProps {
  brandName: string;
  sector?: string | null;
  maturityProfile?: string | null;
  coherenceScore?: number | null;
  strategyId: string;
  status?: string;
  deliveryMode?: string | null;
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
  deliveryMode,
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

  // ── Delivery mode mutation ──
  const updateDeliveryMut = api.strategy.update.useMutation({
    onSuccess: () => {
      toast.success("Mode de livraison mis à jour");
      void utils.strategy.getById.invalidate({ strategyId });
      void utils.cockpit.getData.invalidate({ strategyId });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  // ── Mutations ──

  const duplicateMut = api.strategy.duplicate.useMutation({
    onSuccess: (data) => {
      toast.success(`"${brandName}" dupliquée`);
      void utils.analytics.getAgencyOverview.invalidate();
      router.push(`/impulsion/brand/${data.id}`);
    },
    onError: () => toast.error("Erreur lors de la duplication"),
  });

  const archiveMut = api.strategy.archive.useMutation({
    onSuccess: () => {
      toast.success(`"${brandName}" archivée`);
      void utils.analytics.getAgencyOverview.invalidate();
      router.push("/impulsion");
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
      router.push("/impulsion");
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
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Back button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => router.push("/impulsion")}
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

          {/* Delivery mode badge */}
          {deliveryMode && DELIVERY_LABELS[deliveryMode] && (
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-[10px] px-1.5 py-0",
                DELIVERY_BADGE_STYLES[deliveryMode] ?? "",
              )}
            >
              {DELIVERY_LABELS[deliveryMode]}
            </Badge>
          )}

          {/* Score badge */}
          {coherenceScore != null && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
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
                onClick={() => router.push(`/impulsion/brand/${strategyId}/generate`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Éditer la fiche
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/impulsion/brand/${strategyId}/generate`)}
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
              {/* Delivery mode sub-menu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Package className="mr-2 h-4 w-4" />
                  Mode : {deliveryMode ? DELIVERY_LABELS[deliveryMode] ?? "—" : "Non défini"}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {DELIVERY_MODES.map((m) => (
                    <DropdownMenuItem
                      key={m}
                      onClick={() =>
                        updateDeliveryMut.mutate({
                          strategyId,
                          deliveryMode: m,
                        })
                      }
                    >
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0 mr-2", DELIVERY_BADGE_STYLES[m])}
                      >
                        {DELIVERY_LABELS[m]}
                      </Badge>
                      {m === deliveryMode && "✓"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                onClick={() => router.push(`/impulsion/new?parentId=${strategyId}`)}
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Créer sous-marque
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => duplicateMut.mutate({ strategyId })}
                disabled={duplicateMut.isPending}
              >
                <Copy className="mr-2 h-4 w-4" />
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (isArchived) {
                    unarchiveMut.mutate({ strategyId });
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
                archiveMut.mutate({ strategyId });
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
                deleteMut.mutate({ strategyId });
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
