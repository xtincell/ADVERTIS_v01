"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Clock,
  RotateCcw,
  Loader2,
  RefreshCw,
  Edit3,
  Sparkles,
  ArrowDownToLine,
} from "lucide-react";

import { api } from "~/trpc/react";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
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

function getSourceLabel(source: string) {
  switch (source) {
    case "generation":
      return { label: "Génération IA", icon: Sparkles, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" };
    case "regeneration":
      return { label: "Régénération", icon: RefreshCw, color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" };
    case "manual_edit":
      return { label: "Modification manuelle", icon: Edit3, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" };
    case "ai_update":
      return { label: "Mise à jour IA", icon: Sparkles, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" };
    case "restore":
      return { label: "Avant restauration", icon: ArrowDownToLine, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
    case "import":
      return { label: "Import", icon: ArrowDownToLine, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" };
    default:
      return { label: source, icon: Clock, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
  }
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

interface VersionHistoryPanelProps {
  pillarId: string;
  pillarType: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestored?: () => void;
}

export function VersionHistoryPanel({
  pillarId,
  pillarType,
  open,
  onOpenChange,
  onRestored,
}: VersionHistoryPanelProps) {
  const config = PILLAR_CONFIG[pillarType as PillarType];
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const { data, isLoading } = api.pillar.getVersions.useQuery(
    { pillarId },
    { enabled: open && !!pillarId },
  );

  const restoreMutation = api.pillar.restoreVersion.useMutation({
    onSuccess: () => {
      toast.success("Version restaurée avec succès.");
      setRestoringId(null);
      onRestored?.();
    },
    onError: (err) => {
      toast.error(err.message ?? "Erreur lors de la restauration.");
      setRestoringId(null);
    },
  });

  const handleRestore = (versionId: string) => {
    setRestoringId(versionId);
    restoreMutation.mutate({ pillarId, versionId });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Historique — Pilier {pillarType}
            {config && (
              <span className="text-muted-foreground font-normal">
                ({config.title})
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            {data
              ? `Version actuelle : v${data.currentVersion} — ${data.versions.length} version${data.versions.length > 1 ? "s" : ""} archivée${data.versions.length > 1 ? "s" : ""}`
              : "Chargement de l'historique..."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && data?.versions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Clock className="size-10 mb-3 opacity-40" />
              <p className="text-sm">Aucun historique disponible.</p>
              <p className="text-xs mt-1">
                Les versions seront sauvegardées automatiquement lors des modifications et régénérations.
              </p>
            </div>
          )}

          {data?.versions.map((version) => {
            const sourceInfo = getSourceLabel(version.source);
            const SourceIcon = sourceInfo.icon;
            const isRestoring = restoringId === version.id;

            return (
              <div
                key={version.id}
                className="rounded-lg border p-3 space-y-2 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge
                      variant="secondary"
                      className="shrink-0 font-mono text-xs"
                    >
                      v{version.version}
                    </Badge>
                    <Badge className={`shrink-0 text-xs ${sourceInfo.color}`}>
                      <SourceIcon className="mr-1 size-3" />
                      {sourceInfo.label}
                    </Badge>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        disabled={isRestoring}
                      >
                        {isRestoring ? (
                          <Loader2 className="mr-1 size-3 animate-spin" />
                        ) : (
                          <RotateCcw className="mr-1 size-3" />
                        )}
                        Restaurer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Restaurer la version {version.version} ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Le contenu actuel sera sauvegardé dans l&apos;historique avant la restauration. Vous pourrez toujours revenir en arrière.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRestore(version.id)}
                        >
                          <RotateCcw className="mr-1.5 size-3.5" />
                          Restaurer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Summary preview */}
                {version.summary && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {version.summary}
                  </p>
                )}

                {/* Change note */}
                {version.changeNote && (
                  <p className="text-xs italic text-muted-foreground/80">
                    {version.changeNote}
                  </p>
                )}

                {/* Date */}
                <p className="text-xs text-muted-foreground/60">
                  {formatDate(version.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
