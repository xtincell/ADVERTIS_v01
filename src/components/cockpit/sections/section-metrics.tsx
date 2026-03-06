// =============================================================================
// COMPONENT C.K — Section Metrics (MetricThreshold Manager)
// =============================================================================
// KPI tracking dashboard for the cockpit "market" tab.
// Displays metric thresholds with current vs target values, alert levels,
// inline add/edit forms, and delete functionality.
// =============================================================================

"use client";

import { useState } from "react";
import {
  Gauge,
  Loader2,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { CockpitSection } from "../cockpit-shared";
import { EmptyState } from "~/components/ui/empty-state";

// ---------------------------------------------------------------------------
// Pillar labels for the filter/display
// ---------------------------------------------------------------------------

const PILLAR_OPTIONS = [
  { value: "A", label: "Authenticité" },
  { value: "D", label: "Distinction" },
  { value: "V", label: "Valeur" },
  { value: "E", label: "Engagement" },
  { value: "R", label: "Risk" },
  { value: "T", label: "Track" },
  { value: "I", label: "Implémentation" },
  { value: "S", label: "Synthèse" },
  { value: "OS", label: "Brand OS" },
];

const CADENCE_OPTIONS = [
  { value: "DAILY", label: "Quotidien" },
  { value: "WEEKLY", label: "Hebdomadaire" },
  { value: "MONTHLY", label: "Mensuel" },
  { value: "QUARTERLY", label: "Trimestriel" },
];

const UNIT_OPTIONS = [
  { value: "%", label: "%" },
  { value: "count", label: "Nombre" },
  { value: "XOF", label: "XOF" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "ratio", label: "Ratio" },
  { value: "score", label: "Score /100" },
];

// ---------------------------------------------------------------------------
// SectionMetrics
// ---------------------------------------------------------------------------

export function SectionMetrics({ strategyId }: { strategyId: string }) {
  const [showAdd, setShowAdd] = useState(false);

  const {
    data: metrics,
    isLoading,
    refetch,
  } = api.marketContext.metricThresholds.getByStrategy.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const upsertMutation = api.marketContext.metricThresholds.upsert.useMutation({
    onSuccess: () => {
      toast.success("Métrique mise à jour");
      void refetch();
      setShowAdd(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = api.marketContext.metricThresholds.delete.useMutation({
    onSuccess: () => {
      toast.success("Métrique supprimée");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const totalMetrics = metrics?.length ?? 0;

  if (isLoading) {
    return (
      <CockpitSection
        icon={<Gauge className="h-5 w-5" />}
        pillarLetter="T"
        title="Seuils & KPIs"
        subtitle="Chargement…"
        color="#0EA5E9"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  return (
    <CockpitSection
      icon={<Gauge className="h-5 w-5" />}
      pillarLetter="T"
      title="Seuils & KPIs"
      subtitle={`${totalMetrics} métrique${totalMetrics > 1 ? "s" : ""} suivie${totalMetrics > 1 ? "s" : ""}`}
      color="#0EA5E9"
    >
      <div className="space-y-4">
        {totalMetrics > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metrics?.map((m) => (
              <MetricCard
                key={m.id}
                metric={m}
                onDelete={() => deleteMutation.mutate({ id: m.id })}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Gauge}
            title="Aucun seuil de métrique configuré"
            description="Ajoutez des KPIs pour suivre la performance de votre marque."
            compact
          />
        )}

        {/* Add form */}
        {showAdd ? (
          <MetricForm
            strategyId={strategyId}
            onSubmit={(data) => upsertMutation.mutate(data)}
            onCancel={() => setShowAdd(false)}
            isSubmitting={upsertMutation.isPending}
          />
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-sky-300 px-3 py-2 text-xs font-medium text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter une métrique
          </button>
        )}
      </div>
    </CockpitSection>
  );
}

// ---------------------------------------------------------------------------
// MetricCard — displays a single metric threshold
// ---------------------------------------------------------------------------

function MetricCard({
  metric,
  onDelete,
  isDeleting,
}: {
  metric: {
    id: string;
    pillar: string;
    metricKey: string;
    metricLabel: string;
    currentValue: number;
    targetValue: number;
    alertMin: number | null;
    alertMax: number | null;
    unit: string;
    cadence: string;
  };
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const progress =
    metric.targetValue > 0
      ? Math.min((metric.currentValue / metric.targetValue) * 100, 100)
      : 0;

  // Alert status
  const isAlert =
    (metric.alertMin != null && metric.currentValue < metric.alertMin) ||
    (metric.alertMax != null && metric.currentValue > metric.alertMax);
  const isOnTrack = progress >= 80;

  const pillarLabel =
    PILLAR_OPTIONS.find((p) => p.value === metric.pillar)?.label ?? metric.pillar;

  const cadenceLabel =
    CADENCE_OPTIONS.find((c) => c.value === metric.cadence)?.label ?? metric.cadence;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm transition-colors",
        isAlert ? "border-red-200 bg-red-50/30" : "bg-white",
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-sky-100 text-[10px] font-bold text-sky-700">
              {metric.pillar}
            </span>
            <h4 className="text-sm font-semibold truncate">{metric.metricLabel}</h4>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {pillarLabel} · {cadenceLabel}
          </p>
        </div>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="shrink-0 rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold tabular-nums">
            {metric.currentValue}
            <span className="text-xs font-normal text-muted-foreground ml-0.5">
              {metric.unit}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            / {metric.targetValue}
            {metric.unit}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isAlert
                ? "bg-red-500"
                : isOnTrack
                  ? "bg-green-500"
                  : "bg-sky-500",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          {isAlert ? (
            <>
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-[10px] font-medium text-red-600">
                Hors seuil
                {metric.alertMin != null && metric.currentValue < metric.alertMin
                  ? ` (min: ${metric.alertMin}${metric.unit})`
                  : ` (max: ${metric.alertMax}${metric.unit})`}
              </span>
            </>
          ) : isOnTrack ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="text-[10px] font-medium text-green-600">
                En bonne voie ({Math.round(progress)}%)
              </span>
            </>
          ) : (
            <>
              <TrendingUp className="h-3 w-3 text-sky-500" />
              <span className="text-[10px] font-medium text-sky-600">
                Progression ({Math.round(progress)}%)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MetricForm — inline add form
// ---------------------------------------------------------------------------

function MetricForm({
  strategyId,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  strategyId: string;
  onSubmit: (data: {
    strategyId: string;
    pillar: string;
    metricKey: string;
    metricLabel: string;
    currentValue: number;
    targetValue: number;
    alertMin?: number | null;
    alertMax?: number | null;
    unit: string;
    cadence: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [pillar, setPillar] = useState("T");
  const [metricLabel, setMetricLabel] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [alertMin, setAlertMin] = useState("");
  const [alertMax, setAlertMax] = useState("");
  const [unit, setUnit] = useState("%");
  const [cadence, setCadence] = useState("MONTHLY");

  const metricKey = metricLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-sky-700">
          Nouvelle métrique
        </h4>
        <button onClick={onCancel} className="rounded p-1 hover:bg-muted">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pillar */}
        <select
          value={pillar}
          onChange={(e) => setPillar(e.target.value)}
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          {PILLAR_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.value} — {p.label}
            </option>
          ))}
        </select>

        {/* Label */}
        <input
          value={metricLabel}
          onChange={(e) => setMetricLabel(e.target.value)}
          placeholder="Nom de la métrique *"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
        />

        {/* Current value */}
        <input
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          placeholder="Valeur actuelle *"
          type="number"
          step="any"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
        />

        {/* Target value */}
        <input
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder="Valeur cible *"
          type="number"
          step="any"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        {/* Alert min */}
        <input
          value={alertMin}
          onChange={(e) => setAlertMin(e.target.value)}
          placeholder="Seuil min (opt.)"
          type="number"
          step="any"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
        />

        {/* Alert max */}
        <input
          value={alertMax}
          onChange={(e) => setAlertMax(e.target.value)}
          placeholder="Seuil max (opt.)"
          type="number"
          step="any"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
        />

        {/* Unit */}
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          {UNIT_OPTIONS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>

        {/* Cadence */}
        <select
          value={cadence}
          onChange={(e) => setCadence(e.target.value)}
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          {CADENCE_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => {
          if (!metricLabel.trim() || !currentValue || !targetValue) return;
          onSubmit({
            strategyId,
            pillar,
            metricKey,
            metricLabel: metricLabel.trim(),
            currentValue: Number(currentValue),
            targetValue: Number(targetValue),
            alertMin: alertMin ? Number(alertMin) : null,
            alertMax: alertMax ? Number(alertMax) : null,
            unit,
            cadence,
          });
        }}
        disabled={isSubmitting || !metricLabel.trim() || !currentValue || !targetValue}
        className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Plus className="h-3 w-3" />
        )}
        Ajouter
      </button>
    </div>
  );
}
