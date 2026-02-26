"use client";

// =============================================================================
// COMP C.GLORY — GloryDashboard
// =============================================================================
// Full dashboard view for GLORY outputs within the Glory portal.
// Shows stats, filters (layer, favorites), outputs grouped by tool,
// each output with refNumber, date, favorite toggle, expand/delete.
// =============================================================================

import { useState, useCallback, useMemo } from "react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
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
  ChevronRight,
  LayoutDashboard,
  Loader2,
  AlertTriangle,
  FileText,
  Heart,
  Wrench,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";
import {
  GLORY_LAYER_META,
  type GloryLayer,
} from "~/lib/types/glory-tools";

// ---------------------------------------------------------------------------
// Dynamic icon resolver (same pattern as glory-sidebar)
// ---------------------------------------------------------------------------
function getIconComponent(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[iconName] ?? icons[`${iconName}Icon`] ?? LucideIcons.Puzzle;
}

// ---------------------------------------------------------------------------
// Layer color helpers
// ---------------------------------------------------------------------------
function layerDotColor(layer: string): string {
  switch (layer) {
    case "CR": return "bg-[#6C5CE7]";
    case "DC": return "bg-[#00B894]";
    case "HYBRID": return "bg-[#FDCB6E]";
    default: return "bg-muted-foreground";
  }
}

function layerBgClass(layer: string): string {
  switch (layer) {
    case "CR": return "bg-[#6C5CE7]/10 text-[#6C5CE7]";
    case "DC": return "bg-[#00B894]/10 text-[#00B894]";
    case "HYBRID": return "bg-[#FDCB6E]/10 text-[#b08d2b]";
    default: return "bg-muted text-muted-foreground";
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GloryDashboardProps {
  strategyId?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GloryDashboard({ strategyId }: GloryDashboardProps) {
  const [layerFilter, setLayerFilter] = useState<GloryLayer | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // ── Queries ──
  const {
    data: stats,
    isLoading: statsLoading,
  } = api.glory.getOutputStats.useQuery(
    { strategyId: strategyId! },
    { enabled: !!strategyId },
  );

  const {
    data: outputsData,
    isLoading: outputsLoading,
    refetch: refetchOutputs,
  } = api.glory.getOutputs.useQuery(
    {
      strategyId,
      layer: layerFilter ?? undefined,
      favoritesOnly: favoritesOnly || undefined,
      limit: 50,
    },
    { enabled: !!strategyId },
  );

  const { data: toolsList } = api.glory.listTools.useQuery();

  // Tool lookup map: slug → { name, icon, layer }
  const toolMap = useMemo(() => {
    const map = new Map<string, { name: string; shortName: string; icon: string; layer: string }>();
    if (toolsList) {
      for (const t of toolsList) {
        map.set(t.slug, { name: t.name, shortName: t.shortName, icon: t.icon, layer: t.layer });
      }
    }
    return map;
  }, [toolsList]);

  // ── Mutations ──
  const toggleFavoriteMutation = api.glory.toggleFavorite.useMutation({
    onSuccess: () => {
      void refetchOutputs();
      toast.success("Favori mis à jour");
    },
    onError: () => toast.error("Impossible de mettre à jour le favori"),
  });

  const deleteMutation = api.glory.deleteOutput.useMutation({
    onSuccess: () => {
      void refetchOutputs();
      toast.success("Résultat supprimé");
    },
    onError: () => toast.error("Impossible de supprimer"),
  });

  // ── State ──
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [collapsedTools, setCollapsedTools] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleToolCollapse = useCallback((slug: string) => {
    setCollapsedTools((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const handleToggleFavorite = useCallback(
    (id: string) => toggleFavoriteMutation.mutate({ id }),
    [toggleFavoriteMutation],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate({ id });
      setDeleteConfirmId(null);
    },
    [deleteMutation],
  );

  // ── Group outputs by toolSlug ──
  const outputs = outputsData?.outputs ?? [];

  const groupedByTool = useMemo(() => {
    const groups = new Map<string, typeof outputs>();
    for (const output of outputs) {
      const existing = groups.get(output.toolSlug) ?? [];
      existing.push(output);
      groups.set(output.toolSlug, existing);
    }
    return groups;
  }, [outputs]);

  const isLoading = statsLoading || outputsLoading;

  // ── No strategy selected ──
  if (!strategyId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <LayoutDashboard className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-600">
          Sélectionnez une marque
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choisissez une stratégie pour consulter le dashboard des résultats.
        </p>
      </div>
    );
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader />

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Résultats"
          value={stats?.total ?? 0}
          icon={<FileText className="h-4 w-4" />}
          color="text-[#6C5CE7]"
          bgColor="bg-[#6C5CE7]/10"
        />
        <StatCard
          label="Favoris"
          value={stats?.favorites ?? 0}
          icon={<Star className="h-4 w-4" />}
          color="text-amber-600"
          bgColor="bg-amber-100"
        />
        <StatCard
          label="Outils"
          value={stats?.toolsUsed ?? 0}
          icon={<Wrench className="h-4 w-4" />}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
        />
        {/* Layer breakdown */}
        <Card className="border-gray-200">
          <CardContent className="pt-3 pb-3 px-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Par layer
            </p>
            <div className="space-y-1.5">
              {(["CR", "DC", "HYBRID"] as GloryLayer[]).map((layer) => {
                const count = stats?.byLayer?.[layer] ?? 0;
                const total = stats?.total ?? 1;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={layer} className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", layerDotColor(layer))} />
                    <span className="text-[10px] font-medium w-14 truncate">
                      {GLORY_LAYER_META[layer].label.split(" ")[0]}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", layerDotColor(layer))}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-6 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Layer filter */}
        <Button
          variant={layerFilter === null ? "default" : "ghost"}
          size="sm"
          className={cn(
            "text-xs h-7 px-2.5 rounded-full",
            layerFilter === null
              ? "bg-[#6C5CE7] hover:bg-[#5b4bd5] text-white"
              : "border border-gray-300 text-gray-600 hover:bg-gray-100",
          )}
          onClick={() => setLayerFilter(null)}
        >
          Tous
        </Button>
        {(["CR", "DC", "HYBRID"] as GloryLayer[]).map((layer) => (
          <Button
            key={layer}
            variant={layerFilter === layer ? "default" : "ghost"}
            size="sm"
            className={cn(
              "text-xs h-7 px-2.5 rounded-full",
              layerFilter === layer
                ? "bg-[#6C5CE7] hover:bg-[#5b4bd5] text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-100",
            )}
            onClick={() => setLayerFilter(layerFilter === layer ? null : layer)}
          >
            <span className={cn("h-2 w-2 rounded-full mr-1", layerDotColor(layer))} />
            {GLORY_LAYER_META[layer].label}
          </Button>
        ))}

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Favorites toggle */}
        <Button
          variant={favoritesOnly ? "default" : "ghost"}
          size="sm"
          className={cn(
            "text-xs h-7 px-2.5 rounded-full gap-1",
            favoritesOnly
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "border border-gray-300 text-gray-600 hover:bg-gray-100",
          )}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          <Star className={cn("h-3 w-3", favoritesOnly && "fill-white")} />
          Favoris
        </Button>
      </div>

      <Separator />

      {/* ── Grouped outputs ── */}
      {outputs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {Array.from(groupedByTool.entries()).map(([toolSlug, toolOutputs]) => {
            const toolInfo = toolMap.get(toolSlug);
            const IconComp = toolInfo ? getIconComponent(toolInfo.icon) : FileText;
            const toolName = toolInfo?.name ?? humanizeSlug(toolSlug);
            const toolLayer = toolInfo?.layer ?? toolOutputs[0]?.layer ?? "CR";
            const isCollapsed = collapsedTools.has(toolSlug);

            return (
              <Collapsible
                key={toolSlug}
                open={!isCollapsed}
                onOpenChange={() => toggleToolCollapse(toolSlug)}
              >
                <Card className="border-gray-200">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer py-3 px-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", layerBgClass(toolLayer))}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold">
                              {toolName}
                            </CardTitle>
                            <CardDescription className="text-[11px]">
                              {GLORY_LAYER_META[toolLayer as GloryLayer]?.label ?? toolLayer}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {toolOutputs.length}
                        </Badge>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-3 space-y-1">
                      {toolOutputs.map((item) => (
                        <OutputRow
                          key={item.id}
                          item={item}
                          isExpanded={expandedIds.has(item.id)}
                          onToggleExpand={() => toggleExpanded(item.id)}
                          onToggleFavorite={() => handleToggleFavorite(item.id)}
                          isFavoritePending={toggleFavoriteMutation.isPending}
                          deleteConfirmId={deleteConfirmId}
                          onDeleteConfirm={setDeleteConfirmId}
                          onDelete={handleDelete}
                          isDeletePending={deleteMutation.isPending}
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* ── Load more ── */}
      {outputsData?.nextCursor && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            D&apos;autres résultats existent. Augmentez la limite ou affinez les filtres.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Header
// ---------------------------------------------------------------------------
function DashboardHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C5CE7]/10">
        <LayoutDashboard className="h-5 w-5 text-[#6C5CE7]" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard GLORY</h1>
        <p className="text-sm text-muted-foreground">
          Tous les résultats générés, classés par outil
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="border-gray-200">
      <CardContent className="pt-3 pb-3 px-4">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", bgColor, color)}>
            {icon}
          </div>
          <div>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Output Row
// ---------------------------------------------------------------------------
interface OutputRowItem {
  id: string;
  toolSlug: string;
  layer: string;
  title: string;
  refNumber: string | null;
  isFavorite: boolean;
  createdAt: Date | string;
  outputData: unknown;
  outputText: string | null;
  strategy?: { brandName: string | null; sector: string | null } | null;
}

function OutputRow({
  item,
  isExpanded,
  onToggleExpand,
  onToggleFavorite,
  isFavoritePending,
  deleteConfirmId,
  onDeleteConfirm,
  onDelete,
  isDeletePending,
}: {
  item: OutputRowItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  isFavoritePending: boolean;
  deleteConfirmId: string | null;
  onDeleteConfirm: (id: string | null) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
}) {
  const date =
    typeof item.createdAt === "string"
      ? new Date(item.createdAt)
      : item.createdAt;

  const formattedDate = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        isExpanded
          ? "border-[#6C5CE7]/20 bg-[#6C5CE7]/[0.02] shadow-sm"
          : "border-gray-100 hover:border-gray-200",
      )}
    >
      {/* Row header */}
      <div
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Expand icon */}
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}

        {/* Ref number */}
        {item.refNumber ? (
          <Badge
            variant="outline"
            className="text-[9px] font-mono px-1.5 py-0 h-5 shrink-0 border-[#6C5CE7]/30 text-[#6C5CE7]"
          >
            {item.refNumber}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[9px] font-mono px-1.5 py-0 h-5 shrink-0 text-muted-foreground"
          >
            —
          </Badge>
        )}

        {/* Title */}
        <span className="text-sm font-medium truncate flex-1 min-w-0">
          {item.title ?? humanizeSlug(item.toolSlug)}
        </span>

        {/* Date */}
        <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline">
          {formattedDate}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            disabled={isFavoritePending}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                item.isFavorite
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-400",
              )}
            />
          </Button>

          <Dialog
            open={deleteConfirmId === item.id}
            onOpenChange={(open) => onDeleteConfirm(open ? item.id : null)}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-red-600"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Supprimer ce résultat ?</DialogTitle>
                <DialogDescription>
                  {item.refNumber && (
                    <span className="font-mono text-[#6C5CE7]">{item.refNumber}</span>
                  )}{" "}
                  — Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => onDeleteConfirm(null)}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onDelete(item.id)}
                  disabled={isDeletePending}
                  className="gap-1.5"
                >
                  {isDeletePending ? (
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

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0">
          <Separator className="mb-3" />
          <GloryOutputDisplay
            outputData={item.outputData}
            outputText={item.outputText ?? ""}
            outputFormat="mixed"
            persistable={false}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Sparkles className="h-12 w-12 text-gray-300 mb-4" />
      <h2 className="text-lg font-semibold text-gray-600">
        Aucun résultat sauvegardé
      </h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Utilisez les outils GLORY pour générer du contenu, puis sauvegardez vos résultats.
        Ils apparaîtront ici, classés par outil.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
