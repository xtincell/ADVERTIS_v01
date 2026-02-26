// =============================================================================
// COMPONENT C.K11 — Section Glory
// =============================================================================
// Cockpit section displaying GLORY operational tool results overview.
// Shows stats (total, favorites, tools used), recent outputs grid,
// and quick layer filter (CR / DC / HYBRID).
// Props: strategyId.
// =============================================================================

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Loader2,
  Sparkles,
  Star,
  Wrench,
  FileText,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { GLORY_LAYER_META, type GloryLayer } from "~/lib/types/glory-tools";

// ---------------------------------------------------------------------------
// Layer color helpers
// ---------------------------------------------------------------------------

function layerBgClass(layer: string): string {
  switch (layer) {
    case "CR":
      return "bg-[#6C5CE7]/10 text-[#6C5CE7]";
    case "DC":
      return "bg-[#00B894]/10 text-[#00B894]";
    case "HYBRID":
      return "bg-[#FDCB6E]/10 text-[#b08d2b]";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function layerDotColor(layer: string): string {
  switch (layer) {
    case "CR":
      return "bg-[#6C5CE7]";
    case "DC":
      return "bg-[#00B894]";
    case "HYBRID":
      return "bg-[#FDCB6E]";
    default:
      return "bg-muted-foreground";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SectionGlory({ strategyId }: { strategyId: string }) {
  const [layerFilter, setLayerFilter] = useState<GloryLayer | null>(null);

  // Fetch stats
  const { data: stats, isLoading: statsLoading } =
    api.glory.getOutputStats.useQuery({ strategyId });

  // Fetch recent outputs (max 6)
  const { data: outputsData, isLoading: outputsLoading } =
    api.glory.getOutputs.useQuery({
      strategyId,
      limit: 12,
    });

  const outputs = outputsData?.outputs ?? [];

  // Apply layer filter client-side
  const filteredOutputs = useMemo(() => {
    if (!layerFilter) return outputs.slice(0, 6);
    return outputs
      .filter((o) => o.layer === layerFilter)
      .slice(0, 6);
  }, [outputs, layerFilter]);

  // Nothing to show
  if (!statsLoading && !outputsLoading && stats?.total === 0) {
    return null;
  }

  const isLoading = statsLoading || outputsLoading;

  return (
    <section>
      {/* ── Header ── */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C5CE7]/10">
            <Sparkles className="h-4.5 w-4.5 text-[#6C5CE7]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Résultats GLORY</h2>
            <p className="text-sm text-muted-foreground">
              Outputs générés par les outils opérationnels
            </p>
          </div>
        </div>
        <Link
          href={`/glory/history?strategyId=${strategyId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6C5CE7] hover:text-[#5b4bd5] transition-colors"
        >
          Voir tout
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* ── Loading state ── */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-[#6C5CE7]" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-5">
          {/* ── Stats row ── */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-[#6C5CE7]/20">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold text-[#6C5CE7]">
                  {stats?.total ?? 0}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Résultats
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {stats?.favorites ?? 0}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Favoris
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {stats?.toolsUsed ?? 0}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Outils utilisés
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Layer filter ── */}
          {outputs.length > 0 && (
            <div className="flex items-center gap-1.5">
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
                  onClick={() =>
                    setLayerFilter(layerFilter === layer ? null : layer)
                  }
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full mr-1",
                      layerDotColor(layer),
                    )}
                  />
                  {GLORY_LAYER_META[layer].label}
                </Button>
              ))}
            </div>
          )}

          {/* ── Outputs grid ── */}
          {filteredOutputs.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOutputs.map((output) => (
                <OutputCard key={output.id} output={output} />
              ))}
            </div>
          ) : outputs.length > 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aucun résultat pour ce filtre
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Output Card — compact card for grid display
// ---------------------------------------------------------------------------

interface OutputRecord {
  id: string;
  toolSlug: string;
  layer: string;
  title: string | null;
  isFavorite: boolean;
  createdAt: Date | string;
  strategy?: {
    brandName: string | null;
    sector: string | null;
  } | null;
}

function OutputCard({ output }: { output: OutputRecord }) {
  const date =
    typeof output.createdAt === "string"
      ? new Date(output.createdAt)
      : output.createdAt;
  const formattedDate = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  // Convert toolSlug to display name (slug → Title Case)
  const toolName = output.toolSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <Card className="group relative transition-shadow hover:shadow-md border-gray-200">
      {/* Favorite indicator */}
      {output.isFavorite && (
        <div className="absolute top-2 right-2">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        </div>
      )}

      <CardContent className="pt-3 pb-3 px-3">
        <div className="flex items-start gap-2.5">
          {/* Layer icon */}
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              layerBgClass(output.layer),
            )}
          >
            <FileText className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Title */}
            <p className="text-sm font-medium leading-tight truncate">
              {output.title ?? toolName}
            </p>

            {/* Tool slug + layer badge */}
            <div className="mt-1 flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] px-1.5 py-0 h-4 font-medium",
                  layerBgClass(output.layer),
                )}
              >
                {output.layer}
              </Badge>
              <span className="text-[10px] text-muted-foreground truncate">
                {toolName}
              </span>
            </div>

            {/* Date */}
            <p className="mt-1 text-[10px] text-muted-foreground">
              {formattedDate}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
