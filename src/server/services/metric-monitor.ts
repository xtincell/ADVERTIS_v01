// =============================================================================
// MODULE 21 — Metric Monitor
// =============================================================================
// Tracks and monitors KPI metrics over time. Evaluates MetricThresholds by
// comparing currentValue against alertMin/alertMax bounds, then auto-creates
// METRIC-layer signals in the Signal Engine when breaches are detected. Full
// evaluation cycle: check thresholds -> create alerts -> create signals.
//
// Public API:
//   1. upsertThreshold()       — Upsert a metric threshold
//   2. getThresholds()         — Get all thresholds for a strategy
//   3. deleteThreshold()       — Delete a threshold
//   4. evaluateThresholds()    — Evaluate all thresholds, return alerts
//   5. createAlertSignals()    — Create METRIC-layer signals from alerts
//   6. runMetricEvaluation()   — Full cycle: evaluate + create signals
//
// Dependencies:
//   - ~/server/db (Prisma — MetricThreshold)
//   - ./signal-engine (createSignal)
//
// Called by:
//   - tRPC metric router (metric.upsert, metric.evaluate)
//   - Scheduled cron jobs (periodic metric evaluation)
// =============================================================================

import { db } from "~/server/db";
import { createSignal } from "./signal-engine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MetricAlert {
  thresholdId: string;
  metricKey: string;
  metricLabel: string;
  pillar: string;
  currentValue: number;
  alertMin: number | null;
  alertMax: number | null;
  targetValue: number;
  type: "below_min" | "above_max";
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Upsert a metric threshold (insert or update on @@unique([strategyId, metricKey])).
 */
export async function upsertThreshold(
  strategyId: string,
  data: {
    pillar: string;
    metricKey: string;
    metricLabel: string;
    currentValue?: number;
    targetValue?: number;
    alertMin?: number | null;
    alertMax?: number | null;
    unit?: string;
    cadence?: string;
  },
) {
  return db.metricThreshold.upsert({
    where: {
      strategyId_metricKey: {
        strategyId,
        metricKey: data.metricKey,
      },
    },
    create: {
      strategyId,
      pillar: data.pillar,
      metricKey: data.metricKey,
      metricLabel: data.metricLabel,
      currentValue: data.currentValue ?? 0,
      targetValue: data.targetValue ?? 0,
      alertMin: data.alertMin ?? null,
      alertMax: data.alertMax ?? null,
      unit: data.unit ?? "%",
      cadence: data.cadence ?? "MONTHLY",
    },
    update: {
      pillar: data.pillar,
      metricLabel: data.metricLabel,
      currentValue: data.currentValue,
      targetValue: data.targetValue,
      alertMin: data.alertMin,
      alertMax: data.alertMax,
      unit: data.unit,
      cadence: data.cadence,
      lastUpdated: new Date(),
    },
  });
}

/**
 * Get all thresholds for a strategy.
 */
export async function getThresholds(strategyId: string) {
  return db.metricThreshold.findMany({
    where: { strategyId },
    orderBy: [{ pillar: "asc" }, { metricKey: "asc" }],
  });
}

/**
 * Delete a threshold.
 */
export async function deleteThreshold(id: string) {
  return db.metricThreshold.delete({ where: { id } });
}

/**
 * Evaluate all thresholds for a strategy.
 * Returns alerts for any metrics that breach their bounds.
 */
export async function evaluateThresholds(
  strategyId: string,
): Promise<{ alerts: MetricAlert[] }> {
  const thresholds = await db.metricThreshold.findMany({
    where: { strategyId },
  });

  const alerts: MetricAlert[] = [];

  for (const t of thresholds) {
    const val = t.currentValue;

    // Check below minimum
    if (t.alertMin != null && val < t.alertMin) {
      alerts.push({
        thresholdId: t.id,
        metricKey: t.metricKey,
        metricLabel: t.metricLabel,
        pillar: t.pillar,
        currentValue: val,
        alertMin: t.alertMin,
        alertMax: t.alertMax,
        targetValue: t.targetValue,
        type: "below_min",
      });
    }

    // Check above maximum
    if (t.alertMax != null && val > t.alertMax) {
      alerts.push({
        thresholdId: t.id,
        metricKey: t.metricKey,
        metricLabel: t.metricLabel,
        pillar: t.pillar,
        currentValue: val,
        alertMin: t.alertMin,
        alertMax: t.alertMax,
        targetValue: t.targetValue,
        type: "above_max",
      });
    }
  }

  return { alerts };
}

/**
 * Create METRIC-layer signals from threshold alerts.
 * CRITICAL for breaches, WARNING for near-threshold (optional).
 */
export async function createAlertSignals(
  strategyId: string,
  alerts: MetricAlert[],
) {
  const created = [];

  for (const alert of alerts) {
    const status = "CRITICAL"; // All breaches are critical by default
    const title =
      alert.type === "below_min"
        ? `${alert.metricLabel} sous le seuil (${alert.currentValue} < ${alert.alertMin})`
        : `${alert.metricLabel} au-dessus du seuil (${alert.currentValue} > ${alert.alertMax})`;

    const signal = await createSignal(strategyId, {
      pillar: alert.pillar,
      layer: "METRIC",
      title,
      description: `Métrique ${alert.metricKey} en alerte. Valeur actuelle: ${alert.currentValue}, Cible: ${alert.targetValue}.`,
      status,
      source: "metric-monitor",
      confidence: "HIGH",
    });

    created.push(signal);
  }

  return created;
}

/**
 * Full evaluation cycle: check thresholds → create alerts → create signals.
 */
export async function runMetricEvaluation(strategyId: string) {
  const { alerts } = await evaluateThresholds(strategyId);
  if (alerts.length === 0) return { alerts: [], signals: [] };

  const signals = await createAlertSignals(strategyId, alerts);
  return { alerts, signals };
}
