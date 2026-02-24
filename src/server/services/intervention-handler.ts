// =============================================================================
// MODULE 18B — Intervention Handler
// =============================================================================
// Handles freelance/team ad-hoc intervention requests on missions.
// Intervention requests come from CLIENT_RETAINER users (Tier 3) for urgent
// changes, scope extensions, bug fixes, and content updates.
//
// Flow: OPEN -> TRIAGED -> IN_PROGRESS -> RESOLVED (or REJECTED)
//
// Public API:
//   1. createIntervention()          — Create a new intervention request
//   2. triageIntervention()          — Triage (OPEN -> TRIAGED)
//   3. startIntervention()           — Start work (TRIAGED -> IN_PROGRESS)
//   4. resolveIntervention()         — Resolve an intervention
//   5. rejectIntervention()          — Reject an intervention
//   6. getPendingInterventions()     — Get pending interventions for dashboard
//   7. getInterventionsByStrategy()  — Get interventions for a strategy
//   8. getInterventionsByMission()   — Get interventions for a mission
//   9. getInterventionsByUser()      — Get interventions created by a user
//
// Dependencies:
//   - ~/server/db (Prisma — InterventionRequest)
//   - ~/lib/types/phase3-schemas (CreateInterventionInput, ResolveInterventionInput)
//
// Called by:
//   - tRPC intervention router (intervention.create, intervention.triage, etc.)
// =============================================================================

import { db } from "~/server/db";
import type {
  CreateInterventionInput,
  ResolveInterventionInput,
} from "~/lib/types/phase3-schemas";
import { createSignal } from "./signal-engine";
import { markPillarStale, propagateToTranslationDocs } from "./stale-detector";

/**
 * Create a new intervention request.
 */
export async function createIntervention(
  data: CreateInterventionInput,
  requestedBy: string,
) {
  return db.interventionRequest.create({
    data: {
      missionId: data.missionId,
      strategyId: data.strategyId,
      type: data.type,
      title: data.title,
      description: data.description,
      priority: data.priority ?? "P1",
      requestedBy,
      status: "OPEN",
    },
  });
}

/**
 * Triage an intervention (OPEN → TRIAGED).
 */
export async function triageIntervention(id: string, _triagedBy: string) {
  const intervention = await db.interventionRequest.findUniqueOrThrow({
    where: { id },
  });

  if (intervention.status !== "OPEN") {
    throw new Error(
      `Seules les interventions OPEN peuvent être triées. Statut actuel : ${intervention.status}`,
    );
  }

  return db.interventionRequest.update({
    where: { id },
    data: { status: "TRIAGED" },
  });
}

/**
 * Start working on an intervention (TRIAGED → IN_PROGRESS).
 */
export async function startIntervention(id: string) {
  return db.interventionRequest.update({
    where: { id },
    data: { status: "IN_PROGRESS" },
  });
}

/**
 * Resolve an intervention.
 * Optionally creates a signal in the SIS when the resolution impacts a pillar.
 */
export async function resolveIntervention(
  data: ResolveInterventionInput,
  resolvedBy: string,
) {
  const intervention = await db.interventionRequest.update({
    where: { id: data.id },
    data: {
      status: "RESOLVED",
      resolution: data.resolution,
      resolvedBy,
      resolvedAt: new Date(),
    },
  });

  // Bridge to SIS: create a signal when operator flags the resolution as impacting a pillar
  if (data.createSignal && data.signalPillar && intervention.strategyId) {
    const signalTitle =
      data.signalTitle ?? `Intervention client : ${intervention.title}`;

    const signal = await createSignal(intervention.strategyId, {
      pillar: data.signalPillar,
      layer: "STRONG",
      title: signalTitle,
      description: `Résolution : ${data.resolution}`,
      status: "ACTIVE",
      source: "CLIENT_INTERVENTION",
      confidence: "HIGH",
    });

    // Mark the affected pillar as stale so it gets regenerated with this new context
    const pillar = await db.pillar.findFirst({
      where: { strategyId: intervention.strategyId, type: data.signalPillar },
    });
    if (pillar) {
      await markPillarStale(
        pillar.id,
        `Intervention client résolue : ${intervention.title}`,
      );
      await propagateToTranslationDocs(intervention.strategyId, [
        data.signalPillar,
      ]);
    }

    return { intervention, signal };
  }

  return { intervention, signal: null };
}

/**
 * Reject an intervention.
 */
export async function rejectIntervention(
  id: string,
  resolution: string,
  resolvedBy: string,
) {
  return db.interventionRequest.update({
    where: { id },
    data: {
      status: "REJECTED",
      resolution,
      resolvedBy,
      resolvedAt: new Date(),
    },
  });
}

/**
 * Get pending interventions (OPEN + TRIAGED) for ADMIN/OPERATOR dashboard.
 */
export async function getPendingInterventions() {
  return db.interventionRequest.findMany({
    where: { status: { in: ["OPEN", "TRIAGED", "IN_PROGRESS"] } },
    orderBy: [
      { priority: "asc" }, // P0 first
      { createdAt: "asc" }, // oldest first
    ],
  });
}

/**
 * Get interventions for a specific strategy.
 */
export async function getInterventionsByStrategy(strategyId: string) {
  return db.interventionRequest.findMany({
    where: { strategyId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get interventions for a specific mission.
 */
export async function getInterventionsByMission(missionId: string) {
  return db.interventionRequest.findMany({
    where: { missionId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get interventions created by a specific user (client view).
 */
export async function getInterventionsByUser(requestedBy: string) {
  return db.interventionRequest.findMany({
    where: { requestedBy },
    orderBy: { createdAt: "desc" },
  });
}
