"use client";

// =============================================================================
// COMP C.GLORY — GloryHistory
// =============================================================================
// History view of saved GLORY outputs.
// Shows list with tool name, brand, date, favorite toggle.
// Click to expand and see full output. Delete with confirmation.
// =============================================================================

import { useState, useCallback } from "react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { GloryOutputDisplay } from "./glory-output-display";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Star,
  Trash2,
  ChevronDown,
  ChevronUp,
  History,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GloryHistoryProps {
  strategyId?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GloryHistory({ strategyId }: GloryHistoryProps) {
  const {
    data: outputs,
    isLoading,
    isError,
    refetch,
  } = api.glory.getOutputs.useQuery(
    { strategyId: strategyId ?? "" },
    { enabled: true },
  );

  const toggleFavoriteMutation = api.glory.toggleFavorite.useMutation({
    onSuccess: () => {
      void refetch();
      toast.success("Favori mis à jour");
    },
    onError: () => {
      toast.error("Impossible de mettre à jour le favori");
    },
  });

  const deleteMutation = api.glory.deleteOutput.useMutation({
    onSuccess: () => {
      void refetch();
      toast.success("Résultat supprimé");
    },
    onError: () => {
      toast.error("Impossible de supprimer");
    },
  });

  // Track expanded items
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  // Track delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      toggleFavoriteMutation.mutate({ id });
    },
    [toggleFavoriteMutation],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate({ id });
      setDeleteConfirmId(null);
    },
    [deleteMutation],
  );

  // -----------------------------------------------------------------------
  // Loading
  // -----------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <History className="h-6 w-6 text-[#6C5CE7]" />
          <h1 className="text-xl font-bold text-gray-900">Historique</h1>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Error
  // -----------------------------------------------------------------------
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <History className="h-6 w-6 text-[#6C5CE7]" />
          <h1 className="text-xl font-bold text-gray-900">Historique</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-800">
              Impossible de charger l&apos;historique. Veuillez réessayer.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = outputs?.outputs ?? [];

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="h-6 w-6 text-[#6C5CE7]" />
          <h1 className="text-xl font-bold text-gray-900">Historique</h1>
          <Badge variant="secondary" className="text-xs">
            {items.length} résultat{items.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <History className="h-12 w-12 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-600">
            Aucun résultat sauvegardé
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Les résultats générés et sauvegardés apparaîtront ici.
          </p>
        </div>
      )}

      {/* History list */}
      <div className="space-y-3">
        {items.map((item) => {
          const isExpanded = expandedIds.has(item.id);

          return (
            <Card
              key={item.id}
              className={cn(
                "border-gray-200 transition-all",
                isExpanded && "border-[#6C5CE7]/20 shadow-sm",
              )}
            >
              {/* Summary row */}
              <CardHeader
                className="cursor-pointer py-3 px-4"
                onClick={() => toggleExpanded(item.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Expand/collapse icon */}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}

                    {/* Tool & brand info */}
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-medium truncate">
                        {item.title ?? item.toolSlug}
                      </CardTitle>
                      <CardDescription className="text-xs truncate">
                        {item.strategy.brandName ?? "Marque inconnue"} &middot;{" "}
                        {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Favorite toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(item.id);
                      }}
                      disabled={toggleFavoriteMutation.isPending}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          item.isFavorite
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-400",
                        )}
                      />
                    </Button>

                    {/* Delete with confirmation */}
                    <Dialog
                      open={deleteConfirmId === item.id}
                      onOpenChange={(open) =>
                        setDeleteConfirmId(open ? item.id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Supprimer ce résultat ?</DialogTitle>
                          <DialogDescription>
                            Cette action est irréversible. Le résultat sera
                            définitivement supprimé.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            Annuler
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                            className="gap-1.5"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Supprimer
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>

              {/* Expanded content */}
              {isExpanded && (
                <CardContent className="pt-0 px-4 pb-4">
                  <Separator className="mb-4" />
                  <GloryOutputDisplay
                    outputData={item.outputData}
                    outputText={item.outputText ?? ""}
                    outputFormat="mixed"
                    persistable={false}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
