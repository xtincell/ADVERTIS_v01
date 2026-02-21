// =============================================================================
// MODULE 17 — Signal Engine
// =============================================================================
// Manages strategic signals (weak signals, trends, metrics) for the cockpit.
// Implements a 3-layer model: METRIC (quantitative), STRONG (confirmed), WEAK
// (emerging). Handles signal CRUD, status mutations with audit trail, and
// auto-propagation to the Decision Queue when thresholds are reached (CRITICAL,
// BET). Bulk-creates signals from Track/Risk audit results.
//
// Public API:
//   1. createSignal()          — Create a new signal with layer validation
//   2. mutateSignal()          — Mutate status with audit trail + auto-propagate
//   3. getSignalsByStrategy()  — Get filtered signals for a strategy
//   4. getSignalsByPillar()    — Get signals for a specific pillar
//   5. getMutationHistory()    — Get audit trail for a signal
//   6. deleteSignal()          — Delete a signal and its mutations
//   7. bulkCreateFromAudit()   — Extract and bulk-create signals from T/R audits
//
// Dependencies:
//   - ~/server/db (Prisma — Signal, SignalMutation, Decision)
//   - ~/lib/constants (SIGNAL_STATUSES)
//   - ./stale-detector (markPillarStale, propagateToTranslationDocs)
//
// Called by:
//   - tRPC signal router (signal.create, signal.mutate, signal.list)
//   - Metric Monitor (Module 21) — createSignal for alert signals
//   - Mission Manager (Module 18) — debrief feedback loop
//   - Audit Generation Service — bulkCreateFromAudit after T/R audits
// =============================================================================

import { db } from "~/server/db";
import { SIGNAL_STATUSES } from "~/lib/constants";
import type { SignalLayer } from "~/lib/constants";
import type { TrackAuditResult, RiskAuditResult } from "~/lib/types/pillar-schemas";
import { markPillarStale, propagateToTranslationDocs } from "./stale-detector";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SignalFilters {
  layer?: string;
  pillar?: string;
  status?: string;
}

interface CreateSignalData {
  pillar: string;
  layer: SignalLayer;
  title: string;
  description?: string;
  status: string;
  source?: string;
  evidence?: unknown;
  confidence?: string;
  reputationFlag?: boolean;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateSignalStatus(layer: string, status: string): boolean {
  const allowed = SIGNAL_STATUSES[layer as SignalLayer];
  if (!allowed) return false;
  return (allowed as readonly string[]).includes(status);
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/**
 * Create a new signal. Validates that status is appropriate for the layer.
 */
export async function createSignal(
  strategyId: string,
  data: CreateSignalData,
) {
  if (!validateSignalStatus(data.layer, data.status)) {
    throw new Error(
      `Invalid status "${data.status}" for layer "${data.layer}". Allowed: ${SIGNAL_STATUSES[data.layer]?.join(", ")}`,
    );
  }

  return db.signal.create({
    data: {
      strategyId,
      pillar: data.pillar,
      layer: data.layer,
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      source: data.source ?? null,
      evidence: data.evidence ?? undefined,
      confidence: data.confidence ?? "MEDIUM",
      reputationFlag: data.reputationFlag ?? false,
    },
  });
}

/**
 * Mutate a signal's status. Creates an audit trail via SignalMutation.
 * If the new status is CRITICAL or BET, auto-propagates to the Decision Queue.
 */
export async function mutateSignal(
  signalId: string,
  newStatus: string,
  reason: string | undefined,
  mutatedBy: string,
) {
  const signal = await db.signal.findUnique({ where: { id: signalId } });
  if (!signal) throw new Error(`Signal not found: ${signalId}`);

  if (!validateSignalStatus(signal.layer, newStatus)) {
    throw new Error(
      `Invalid status "${newStatus}" for layer "${signal.layer}".`,
    );
  }

  // Transaction: update signal + create mutation record
  const [updatedSignal] = await db.$transaction([
    db.signal.update({
      where: { id: signalId },
      data: {
        status: newStatus,
        lastCheckedAt: new Date(),
      },
    }),
    db.signalMutation.create({
      data: {
        signalId,
        fromStatus: signal.status,
        toStatus: newStatus,
        reason: reason ?? null,
        mutatedBy,
      },
    }),
  ]);

  // Auto-propagate to Decision Queue if critical threshold reached
  if (newStatus === "CRITICAL" || newStatus === "BET") {
    await propagateToDecision(updatedSignal);
  }

  // Mark related pillar stale when signal mutates
  if (signal.pillar && signal.strategyId) {
    const pillar = await db.pillar.findFirst({
      where: { strategyId: signal.strategyId, type: signal.pillar },
    });
    if (pillar) {
      void markPillarStale(pillar.id, `Signal "${signal.title}" muté: ${signal.status} → ${newStatus}`);
      void propagateToTranslationDocs(signal.strategyId, [signal.pillar]);
    }
  }

  return updatedSignal;
}

/**
 * Get all signals for a strategy, optionally filtered.
 */
export async function getSignalsByStrategy(
  strategyId: string,
  filters?: SignalFilters,
) {
  const where: Record<string, unknown> = { strategyId };
  if (filters?.layer) where.layer = filters.layer;
  if (filters?.pillar) where.pillar = filters.pillar;
  if (filters?.status) where.status = filters.status;

  return db.signal.findMany({
    where,
    include: { mutations: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: [{ layer: "asc" }, { detectedAt: "desc" }],
  });
}

/**
 * Get signals for a specific pillar.
 */
export async function getSignalsByPillar(
  strategyId: string,
  pillar: string,
) {
  return getSignalsByStrategy(strategyId, { pillar });
}

/**
 * Get mutation history for a signal.
 */
export async function getMutationHistory(signalId: string) {
  return db.signalMutation.findMany({
    where: { signalId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Delete a signal and its mutations (cascade).
 */
export async function deleteSignal(signalId: string) {
  return db.signal.delete({ where: { id: signalId } });
}

// ---------------------------------------------------------------------------
// Auto-propagation to Decision Queue
// ---------------------------------------------------------------------------

/**
 * When a signal reaches CRITICAL (metric) or BET (weak), create a Decision.
 */
async function propagateToDecision(signal: {
  id: string;
  strategyId: string;
  title: string;
  description: string | null;
  status: string;
  layer: string;
}) {
  // Check if a decision already exists for this signal
  const existing = await db.decision.findUnique({
    where: { signalId: signal.id },
  });
  if (existing) return existing;

  const priority = signal.status === "CRITICAL" ? "P0" : "P2";
  const deadlineType =
    signal.status === "CRITICAL" ? "STARTUP" : "MARKETING";

  return db.decision.create({
    data: {
      strategyId: signal.strategyId,
      title: `[Auto] ${signal.title}`,
      description: signal.description
        ? `Signal ${signal.layer}/${signal.status} : ${signal.description}`
        : `Signal ${signal.layer} en statut ${signal.status} nécessite une décision.`,
      priority,
      status: "PENDING",
      deadlineType,
      signalId: signal.id,
    },
  });
}

// ---------------------------------------------------------------------------
// Bulk creation from audit data
// ---------------------------------------------------------------------------

/**
 * Extract signals from Track/Risk audit results and bulk-create them.
 * Called after audit generation to populate the SIS.
 */
export async function bulkCreateFromAudit(
  strategyId: string,
  tData?: TrackAuditResult | null,
  rData?: RiskAuditResult | null,
) {
  const signalsToCreate: Array<{
    strategyId: string;
    pillar: string;
    layer: string;
    title: string;
    description: string;
    status: string;
    source: string;
    confidence: string;
  }> = [];

  // --- From Track Audit (T) ---
  if (tData) {
    // Macro trends → STRONG / ACTIVE
    for (const trend of tData.marketReality?.macroTrends ?? []) {
      signalsToCreate.push({
        strategyId,
        pillar: "T",
        layer: "STRONG",
        title: typeof trend === "string" ? trend : String(trend),
        description: "Tendance macro détectée par l'audit Track",
        status: "ACTIVE",
        source: "audit_t",
        confidence: "MEDIUM",
      });
    }

    // Weak signals → WEAK / WATCH
    for (const signal of tData.marketReality?.weakSignals ?? []) {
      signalsToCreate.push({
        strategyId,
        pillar: "T",
        layer: "WEAK",
        title: typeof signal === "string" ? signal : String(signal),
        description: "Signal faible détecté par l'audit Track",
        status: "WATCH",
        source: "audit_t",
        confidence: "LOW",
      });
    }

    // Emerging patterns → WEAK / PROBE
    for (const pattern of tData.marketReality?.emergingPatterns ?? []) {
      signalsToCreate.push({
        strategyId,
        pillar: "T",
        layer: "WEAK",
        title: typeof pattern === "string" ? pattern : String(pattern),
        description: "Pattern émergent détecté par l'audit Track",
        status: "PROBE",
        source: "audit_t",
        confidence: "LOW",
      });
    }

    // Strategic recommendations → STRONG / EMERGING
    for (const rec of tData.strategicRecommendations ?? []) {
      signalsToCreate.push({
        strategyId,
        pillar: "T",
        layer: "STRONG",
        title: typeof rec === "string" ? rec : String(rec),
        description: "Recommandation stratégique de l'audit Track",
        status: "EMERGING",
        source: "audit_t",
        confidence: "HIGH",
      });
    }
  }

  // --- From Risk Audit (R) ---
  if (rData) {
    // High-risk micro-SWOTs → STRONG / DECLINING
    for (const swot of rData.microSwots ?? []) {
      if (swot.riskLevel === "high") {
        signalsToCreate.push({
          strategyId,
          pillar: "R",
          layer: "STRONG",
          title: `Risque élevé : ${swot.variableLabel}`,
          description: swot.commentary ?? "Risque élevé détecté par l'audit Risk",
          status: "DECLINING",
          source: "audit_r",
          confidence: "HIGH",
        });
      }
    }

    // Opportunities from global SWOT → WEAK / PROBE
    for (const opp of rData.globalSwot?.opportunities ?? []) {
      signalsToCreate.push({
        strategyId,
        pillar: "R",
        layer: "WEAK",
        title: typeof opp === "string" ? opp : String(opp),
        description: "Opportunité identifiée par l'audit Risk",
        status: "PROBE",
        source: "audit_r",
        confidence: "MEDIUM",
      });
    }
  }

  if (signalsToCreate.length === 0) return [];

  // Bulk insert (skip duplicates by title isn't enforced at DB level, just create all)
  await db.signal.createMany({
    data: signalsToCreate,
    skipDuplicates: false,
  });

  return db.signal.findMany({
    where: { strategyId, source: { in: ["audit_t", "audit_r"] } },
    orderBy: { createdAt: "desc" },
  });
}
