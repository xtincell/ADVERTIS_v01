// =============================================================================
// COMPONENT C.K16 — Section Signals
// =============================================================================
// Signal management display for the Signal Intelligence System (SIS).
// Props: strategyId.
// Key features: 3-layer accordion (METRIC, STRONG, WEAK) with color-coded
// backgrounds, signal cards with status/confidence badges, reputation flags,
// pillar attribution, status mutation actions (transition between layer-specific
// statuses), critical count in subtitle, auto-hide when no signals.
// =============================================================================

"use client";

// Section Signals — Signal Intelligence System (SIS)
// 3-layer display: METRIC (gauges), STRONG (evidence cards), WEAK (status chips)
// Groups signals by layer with accordion UI + mutation actions.

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Eye,
  Loader2,
  Plus,
  Radio,
  Shield,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import {
  SIGNAL_LAYERS,
  SIGNAL_LAYER_LABELS,
  SIGNAL_STATUSES,
  SIGNAL_STATUS_LABELS,
  SIGNAL_STATUS_COLORS,
  SIGNAL_CONFIDENCE,
} from "~/lib/constants";
import type { SignalLayer } from "~/lib/constants";
import { CockpitSection } from "../cockpit-shared";

// ---------------------------------------------------------------------------
// Layer icons
// ---------------------------------------------------------------------------

const LAYER_ICONS: Record<string, React.ReactNode> = {
  METRIC: <BarChart3 className="h-4 w-4" />,
  STRONG: <Shield className="h-4 w-4" />,
  WEAK: <Radio className="h-4 w-4" />,
};

const LAYER_COLORS: Record<string, string> = {
  METRIC: "border-blue-200 bg-blue-50/50",
  STRONG: "border-emerald-200 bg-emerald-50/50",
  WEAK: "border-amber-200 bg-amber-50/50",
};

// ---------------------------------------------------------------------------
// SectionSignals
// ---------------------------------------------------------------------------

export function SectionSignals({ strategyId }: { strategyId: string }) {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(
    new Set(["METRIC", "STRONG", "WEAK"]),
  );

  const { data: signals, isLoading, refetch } = api.signal.getByStrategy.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const mutateMutation = api.signal.mutate.useMutation({
    onSuccess: () => void refetch(),
  });

  const toggleLayer = (layer: string) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  // Group signals by layer
  const grouped: Record<string, typeof signals> = { METRIC: [], STRONG: [], WEAK: [] };
  for (const s of signals ?? []) {
    if (!grouped[s.layer]) grouped[s.layer] = [];
    grouped[s.layer]!.push(s);
  }

  const totalSignals = signals?.length ?? 0;
  const criticalCount = signals?.filter((s) => s.status === "CRITICAL" || s.status === "DECLINING").length ?? 0;

  if (isLoading) {
    return (
      <CockpitSection
        icon={<Activity className="h-5 w-5" />}
        pillarLetter="R"
        title="Intelligence Signals (SIS)"
        subtitle="Chargement…"
        color="#c45a3c"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  if (totalSignals === 0) return null;

  return (
    <CockpitSection
      icon={<Activity className="h-5 w-5" />}
      pillarLetter="R"
      title="Intelligence Signals (SIS)"
      subtitle={`${totalSignals} signal${totalSignals > 1 ? "x" : ""}${criticalCount > 0 ? ` · ${criticalCount} critique${criticalCount > 1 ? "s" : ""}` : ""}`}
      color="#c45a3c"
    >
      <div className="space-y-4">
        {SIGNAL_LAYERS.map((layer) => {
          const layerSignals = grouped[layer] ?? [];
          if (layerSignals.length === 0) return null;
          const isExpanded = expandedLayers.has(layer);

          return (
            <div
              key={layer}
              className={cn("rounded-xl border p-3", LAYER_COLORS[layer])}
            >
              {/* Layer header */}
              <button
                onClick={() => toggleLayer(layer)}
                className="flex w-full items-center gap-2 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                {LAYER_ICONS[layer]}
                <span className="text-sm font-semibold">
                  {SIGNAL_LAYER_LABELS[layer as SignalLayer]}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {layerSignals.length} signal{layerSignals.length > 1 ? "x" : ""}
                </span>
              </button>

              {/* Signal cards */}
              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {layerSignals.map((signal) => (
                    <SignalCard
                      key={signal.id}
                      signal={signal}
                      layer={layer}
                      onMutate={(newStatus) => {
                        mutateMutation.mutate({
                          signalId: signal.id,
                          newStatus,
                        });
                      }}
                      isMutating={mutateMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CockpitSection>
  );
}

// ---------------------------------------------------------------------------
// Signal Card
// ---------------------------------------------------------------------------

interface SignalCardProps {
  signal: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    layer: string;
    pillar: string;
    confidence: string;
    reputationFlag: boolean;
    source: string | null;
  };
  layer: string;
  onMutate: (newStatus: string) => void;
  isMutating: boolean;
}

function SignalCard({ signal, layer, onMutate, isMutating }: SignalCardProps) {
  const [showActions, setShowActions] = useState(false);

  const statusColor = SIGNAL_STATUS_COLORS[signal.status] ?? "bg-gray-100 text-gray-700";
  const statusLabel = SIGNAL_STATUS_LABELS[signal.status] ?? signal.status;

  // Allowed transitions for current layer
  const allowedStatuses = SIGNAL_STATUSES[layer as SignalLayer] ?? [];
  const otherStatuses = allowedStatuses.filter((s: string) => s !== signal.status);

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2">
        {/* Status badge */}
        <span
          className={cn(
            "mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
            statusColor,
          )}
        >
          {statusLabel}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-mono">
              {signal.pillar}
            </span>
            <p className="text-sm font-medium truncate">{signal.title}</p>
            {signal.reputationFlag && (
              <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
            )}
          </div>

          {signal.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {signal.description}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5">
              {signal.confidence === "HIGH" ? (
                <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
              ) : signal.confidence === "LOW" ? (
                <TrendingDown className="h-2.5 w-2.5 text-red-400" />
              ) : (
                <ArrowRight className="h-2.5 w-2.5" />
              )}
              {signal.confidence}
            </span>
            {signal.source && (
              <span className="rounded bg-muted px-1 py-0.5">{signal.source}</span>
            )}
          </div>
        </div>

        {/* Actions toggle */}
        <button
          onClick={() => setShowActions(!showActions)}
          className="shrink-0 rounded p-1 hover:bg-muted transition-colors"
          title="Changer le statut"
        >
          <Zap className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Status mutation actions */}
      {showActions && otherStatuses.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 border-t pt-2">
          {otherStatuses.map((status: string) => (
            <button
              key={status}
              onClick={() => onMutate(status)}
              disabled={isMutating}
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium transition-all",
                "border hover:shadow-sm",
                SIGNAL_STATUS_COLORS[status] ?? "bg-gray-50 text-gray-700",
              )}
            >
              {SIGNAL_STATUS_LABELS[status] ?? status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
