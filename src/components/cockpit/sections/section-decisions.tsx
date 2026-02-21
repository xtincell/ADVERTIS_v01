// =============================================================================
// COMPONENT C.K17 — Section Decisions
// =============================================================================
// Decision log display for the cockpit decision queue.
// Props: strategyId.
// Key features: priority-styled cards (P0 red, P1 amber, P2 gray), status
// icons (PENDING, IN_PROGRESS, RESOLVED, DEFERRED), deadline and deadline type
// display, linked signal attribution, inline resolve form with textarea,
// defer action, resolution display for resolved decisions, auto-hide when empty.
// =============================================================================

"use client";

// Section Decisions — Decision Queue display
// Cards sorted by priority: P0 (red), P1 (orange), P2 (gray)
// Actions: Resolve (dialog), Defer

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  MessageSquare,
  Pause,
  Plus,
  Zap,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import {
  DECISION_PRIORITY_CONFIG,
  DECISION_STATUS_LABELS,
  DEADLINE_TYPES,
} from "~/lib/constants";
import { CockpitSection } from "../cockpit-shared";

// ---------------------------------------------------------------------------
// Priority styling
// ---------------------------------------------------------------------------

const PRIORITY_STYLES: Record<string, { bg: string; border: string; badge: string }> = {
  P0: {
    bg: "bg-red-50/50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-800",
  },
  P1: {
    bg: "bg-amber-50/50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
  },
  P2: {
    bg: "bg-gray-50/50",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-700",
  },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  IN_PROGRESS: <Zap className="h-3.5 w-3.5 text-blue-500" />,
  RESOLVED: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />,
  DEFERRED: <Pause className="h-3.5 w-3.5 text-gray-400" />,
};

// ---------------------------------------------------------------------------
// SectionDecisions
// ---------------------------------------------------------------------------

export function SectionDecisions({ strategyId }: { strategyId: string }) {
  const { data: decisions, isLoading, refetch } = api.decision.getByStrategy.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const resolveMutation = api.decision.resolve.useMutation({
    onSuccess: () => void refetch(),
  });
  const deferMutation = api.decision.defer.useMutation({
    onSuccess: () => void refetch(),
  });

  const totalDecisions = decisions?.length ?? 0;
  const pendingCount = decisions?.filter((d) => d.status === "PENDING" || d.status === "IN_PROGRESS").length ?? 0;

  if (isLoading) {
    return (
      <CockpitSection
        icon={<MessageSquare className="h-5 w-5" />}
        pillarLetter="R"
        title="File de Décisions"
        subtitle="Chargement…"
        color="#c45a3c"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  if (totalDecisions === 0) return null;

  return (
    <CockpitSection
      icon={<MessageSquare className="h-5 w-5" />}
      pillarLetter="R"
      title="File de Décisions"
      subtitle={`${totalDecisions} décision${totalDecisions > 1 ? "s" : ""}${pendingCount > 0 ? ` · ${pendingCount} en attente` : ""}`}
      color="#c45a3c"
    >
      <div className="space-y-3">
        {decisions?.map((decision) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            onResolve={(resolution) => {
              resolveMutation.mutate({ id: decision.id, resolution });
            }}
            onDefer={() => {
              deferMutation.mutate({ id: decision.id });
            }}
            isMutating={resolveMutation.isPending || deferMutation.isPending}
          />
        ))}
      </div>
    </CockpitSection>
  );
}

// ---------------------------------------------------------------------------
// Decision Card
// ---------------------------------------------------------------------------

interface DecisionCardProps {
  decision: {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    deadline: Date | string | null;
    deadlineType: string | null;
    resolution: string | null;
    signal: {
      id: string;
      title: string;
      layer: string;
      status: string;
      pillar: string;
    } | null;
  };
  onResolve: (resolution: string) => void;
  onDefer: () => void;
  isMutating: boolean;
}

function DecisionCard({ decision, onResolve, onDefer, isMutating }: DecisionCardProps) {
  const [showResolve, setShowResolve] = useState(false);
  const [resolution, setResolution] = useState("");

  const style = PRIORITY_STYLES[decision.priority] ?? PRIORITY_STYLES.P2!;
  const priorityConfig = DECISION_PRIORITY_CONFIG[decision.priority as keyof typeof DECISION_PRIORITY_CONFIG];
  const isResolved = decision.status === "RESOLVED";
  const isDeferred = decision.status === "DEFERRED";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        style.bg,
        style.border,
        (isResolved || isDeferred) && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Priority badge */}
        <span
          className={cn(
            "mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
            style.badge,
          )}
        >
          {priorityConfig?.label ?? decision.priority}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {STATUS_ICONS[decision.status]}
            <p className="text-sm font-semibold truncate">{decision.title}</p>
          </div>

          {decision.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {decision.description}
            </p>
          )}

          {/* Metadata row */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5 rounded bg-white/80 px-1.5 py-0.5 font-medium">
              {DECISION_STATUS_LABELS[decision.status as keyof typeof DECISION_STATUS_LABELS] ?? decision.status}
            </span>

            {decision.deadline && (
              <span className="inline-flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {new Date(decision.deadline).toLocaleDateString("fr-FR")}
              </span>
            )}

            {decision.deadlineType && (
              <span className="rounded bg-white/80 px-1.5 py-0.5">
                {decision.deadlineType}
              </span>
            )}

            {decision.signal && (
              <span className="inline-flex items-center gap-0.5 rounded bg-white/80 px-1.5 py-0.5">
                <Zap className="h-2.5 w-2.5" />
                {decision.signal.pillar}/{decision.signal.layer}
              </span>
            )}
          </div>

          {/* Resolution display */}
          {decision.resolution && (
            <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-2">
              <p className="text-xs font-medium text-emerald-700">Résolution :</p>
              <p className="text-xs text-emerald-600">{decision.resolution}</p>
            </div>
          )}

          {/* Resolve form */}
          {showResolve && !isResolved && (
            <div className="mt-2 space-y-2">
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Décrivez la résolution…"
                className="w-full rounded-lg border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta/50"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (resolution.trim()) {
                      onResolve(resolution.trim());
                      setShowResolve(false);
                      setResolution("");
                    }
                  }}
                  disabled={isMutating || !resolution.trim()}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1 text-[10px] font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle className="h-3 w-3" />
                  Confirmer
                </button>
                <button
                  onClick={() => {
                    setShowResolve(false);
                    setResolution("");
                  }}
                  className="rounded-md px-3 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!isResolved && !isDeferred && !showResolve && (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => setShowResolve(true)}
              className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Résoudre"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button
              onClick={onDefer}
              disabled={isMutating}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              title="Différer"
            >
              <Pause className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
