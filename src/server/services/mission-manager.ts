// =============================================================================
// MODULE 18 — Mission Manager
// =============================================================================
// Core mission lifecycle management. Handles creation, state transitions
// (state machine enforced), assignments, deliverables, debrief, charge
// estimation, and Kanban views. Debrief completion triggers a feedback loop
// that creates signals in the SIS and updates market pricing.
//
// State machine:
//   INTAKE -> INTELLIGENCE -> STAFFING -> IN_PROGRESS -> REVIEW -> CLOSED -> MAINTENANCE
//                                              |                     ^
//                                         IN_PROGRESS <--------------+ (renvoi)
//
// Public API:
//   1. createMission()             — Create a new mission
//   2. updateMission()             — Update mission fields (non-status)
//   3. transitionMission()         — Transition status (state machine enforced)
//   4. getMissionById()            — Get mission with all relations
//   5. getMissionsByStrategy()     — List missions for a strategy
//   6. getMissionKanban()          — Get missions grouped by status (Kanban)
//   7. getMissionsByFreelance()    — Get missions assigned to a freelance
//   8. assignFreelance()           — Assign a freelance to a mission
//   9. updateAssignment()          — Update an assignment
//  10. deleteAssignment()          — Delete an assignment
//  11. getAssignmentsByMission()   — List assignments for a mission
//  12. addDeliverable()            — Add a deliverable to a mission
//  13. reviewDeliverable()         — Approve or reject a deliverable
//  14. getDeliverablesByMission()  — List deliverables for a mission
//  15. completeMissionDebrief()    — Complete debrief + feedback loop
//  16. getDebriefByMission()       — Get debrief for a mission
//  17. calculateEstimatedCharge()  — Calculate mission cost from assignments
//  18. deleteMission()             — Delete (archive) a mission
//
// Dependencies:
//   - ~/server/db (Prisma — Mission, MissionAssignment, MissionDeliverable,
//                   MissionDebrief, MarketPricing)
//   - ~/lib/constants (MISSION_VALID_TRANSITIONS)
//   - ./signal-engine (createSignal)
//   - ./stale-detector (markPillarStale, propagateToTranslationDocs)
//
// Called by:
//   - tRPC mission router (mission.create, mission.transition, etc.)
// =============================================================================

import { db } from "~/server/db";
import {
  MISSION_VALID_TRANSITIONS,
  type MissionStatus,
} from "~/lib/constants";
import type {
  CreateMissionInput,
  UpdateMissionInput,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  CreateDeliverableInput,
  ReviewDeliverableInput,
  CreateDebriefInput,
} from "~/lib/types/phase3-schemas";
import { createSignal } from "./signal-engine";
import { markPillarStale, propagateToTranslationDocs } from "./stale-detector";

// ============================================
// GLORY tool → feedback pillar mapping
// Maps each GLORY tool slug to the pillar that benefits from validated outputs.
// ============================================

const GLORY_TOOL_FEEDBACK_PILLAR: Record<string, string> = {
  // CR tools → mostly feed Engagement (E) and Distinction (D)
  "concept-generator": "E",
  "script-writer": "E",
  "long-copy-craftsman": "A",
  "dialogue-writer": "E",
  "claim-baseline-factory": "D",
  "print-ad-architect": "D",
  "social-copy-engine": "E",
  "storytelling-sequencer": "E",
  "wordplay-cultural-bank": "A",
  "brief-creatif-interne": "E",
  // DC tools → feed Distinction (D) and Authenticity (A)
  "campaign-architecture-planner": "E",
  "creative-evaluation-matrix": "D",
  "idea-killer-saver": "D",
  "multi-team-coherence-checker": "A",
  "client-presentation-strategist": "D",
  "creative-direction-memo": "D",
  "pitch-architect": "D",
  "award-case-builder": "A",
  // HYBRID tools → various pillars
  "campaign-360-simulator": "E",
  "production-budget-optimizer": "V",
  "vendor-brief-generator": "E",
  "content-calendar-strategist": "E",
  "approval-workflow-manager": "I",
  "brand-guardian-system": "A",
  "client-education-module": "A",
  "benchmark-reference-finder": "T",
  "post-campaign-reader": "T",
};

// ============================================
// MISSION CRUD
// ============================================

/**
 * Create a new mission linked to a strategy.
 */
export async function createMission(
  data: CreateMissionInput,
  createdBy: string,
) {
  return db.mission.create({
    data: {
      strategyId: data.strategyId,
      title: data.title,
      description: data.description,
      priority: data.priority ?? "P1",
      briefTypes: data.briefTypes ? JSON.parse(JSON.stringify(data.briefTypes)) : undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      createdBy,
      status: "INTAKE",
    },
    include: {
      strategy: { select: { id: true, name: true, brandName: true } },
    },
  });
}

/**
 * Update mission fields (non-status).
 */
export async function updateMission(data: UpdateMissionInput) {
  const { id, ...updates } = data;
  return db.mission.update({
    where: { id },
    data: updates,
  });
}

/**
 * Transition mission to a new status (state machine enforced).
 */
export async function transitionMission(
  missionId: string,
  newStatus: MissionStatus,
  _userId: string,
) {
  const mission = await db.mission.findUniqueOrThrow({
    where: { id: missionId },
  });

  const currentStatus = mission.status as MissionStatus;
  const allowedNext = MISSION_VALID_TRANSITIONS[currentStatus];

  if (!allowedNext?.includes(newStatus)) {
    throw new Error(
      `Transition invalide : ${currentStatus} → ${newStatus}. ` +
        `Transitions autorisées : ${allowedNext?.join(", ") ?? "aucune"}`,
    );
  }

  // If closing, check debrief exists
  if (newStatus === "CLOSED") {
    const debrief = await db.missionDebrief.findUnique({
      where: { missionId },
    });
    if (!debrief) {
      throw new Error(
        "Impossible de clôturer une mission sans debrief. Complétez le debrief d'abord.",
      );
    }
  }

  return db.mission.update({
    where: { id: missionId },
    data: { status: newStatus },
  });
}

/**
 * Get a single mission by ID with all relations.
 */
export async function getMissionById(missionId: string) {
  return db.mission.findUniqueOrThrow({
    where: { id: missionId },
    include: {
      strategy: { select: { id: true, name: true, brandName: true, sector: true } },
      assignments: { orderBy: { createdAt: "desc" } },
      deliverables: { orderBy: { createdAt: "desc" } },
      debrief: true,
      _count: { select: { aiUsageLogs: true } },
    },
  });
}

/**
 * Get missions for a strategy with optional status filter.
 */
export async function getMissionsByStrategy(
  strategyId: string,
  statusFilter?: MissionStatus,
) {
  return db.mission.findMany({
    where: {
      strategyId,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    include: {
      strategy: { select: { id: true, name: true, brandName: true } },
      _count: { select: { assignments: true, deliverables: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Get missions grouped by status for Kanban view.
 */
export async function getMissionKanban(userId: string) {
  const missions = await db.mission.findMany({
    where: { strategy: { userId } },
    include: {
      strategy: { select: { id: true, name: true, brandName: true } },
      _count: { select: { assignments: true, deliverables: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Group by status
  const kanban: Record<string, typeof missions> = {};
  for (const mission of missions) {
    const status = mission.status;
    if (!kanban[status]) kanban[status] = [];
    kanban[status]!.push(mission);
  }

  return kanban;
}

/**
 * Get missions assigned to a specific freelance user.
 */
export async function getMissionsByFreelance(userId: string) {
  const assignments = await db.missionAssignment.findMany({
    where: { userId },
    include: {
      mission: {
        include: {
          strategy: { select: { id: true, name: true, brandName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return assignments;
}

// ============================================
// ASSIGNMENTS
// ============================================

/**
 * Assign a freelance to a mission.
 */
export async function assignFreelance(data: CreateAssignmentInput) {
  return db.missionAssignment.create({
    data: {
      missionId: data.missionId,
      userId: data.userId,
      role: data.role,
      briefType: data.briefType,
      dayRate: data.dayRate,
      estimatedDays: data.estimatedDays,
      notes: data.notes,
      status: "ASSIGNED",
    },
  });
}

/**
 * Update an assignment.
 */
export async function updateAssignment(data: UpdateAssignmentInput) {
  const { id, ...updates } = data;
  return db.missionAssignment.update({
    where: { id },
    data: updates,
  });
}

/**
 * Delete an assignment.
 */
export async function deleteAssignment(assignmentId: string) {
  return db.missionAssignment.delete({
    where: { id: assignmentId },
  });
}

/**
 * Get assignments for a mission.
 */
export async function getAssignmentsByMission(missionId: string) {
  return db.missionAssignment.findMany({
    where: { missionId },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================
// DELIVERABLES
// ============================================

/**
 * Add a deliverable to a mission.
 * If gloryOutputId is provided, links the deliverable to a GLORY output as creative reference.
 */
export async function addDeliverable(data: CreateDeliverableInput) {
  return db.missionDeliverable.create({
    data: {
      missionId: data.missionId,
      assignmentId: data.assignmentId,
      gloryOutputId: data.gloryOutputId,
      title: data.title,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
      status: data.fileUrl ? "UPLOADED" : "PENDING",
    },
  });
}

/**
 * Review a deliverable (approve or reject).
 */
export async function reviewDeliverable(
  data: ReviewDeliverableInput,
  reviewedBy: string,
) {
  return db.missionDeliverable.update({
    where: { id: data.id },
    data: {
      status: data.status,
      reviewNotes: data.reviewNotes,
      reviewedBy,
      reviewedAt: new Date(),
    },
  });
}

/**
 * Get deliverables for a mission.
 */
export async function getDeliverablesByMission(missionId: string) {
  return db.missionDeliverable.findMany({
    where: { missionId },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================
// DEBRIEF
// ============================================

/**
 * Complete a mission debrief. This is required before closing a mission.
 * Optionally propagates learnings to SIS as signals.
 */
export async function completeMissionDebrief(
  data: CreateDebriefInput,
  completedBy: string,
) {
  // Check mission exists and is in REVIEW
  const mission = await db.mission.findUniqueOrThrow({
    where: { id: data.missionId },
  });

  if (mission.status !== "REVIEW") {
    throw new Error(
      `Le debrief ne peut être complété que pour une mission en REVIEW. Statut actuel : ${mission.status}`,
    );
  }

  // Check no existing debrief
  const existing = await db.missionDebrief.findUnique({
    where: { missionId: data.missionId },
  });
  if (existing) {
    throw new Error("Un debrief existe déjà pour cette mission.");
  }

  // Collect freelance field notes from all assignments
  const assignments = await db.missionAssignment.findMany({
    where: { missionId: data.missionId },
    select: { userId: true, role: true, notes: true },
  });
  const freelanceNotes = assignments
    .filter((a) => a.notes && a.notes.trim().length > 0)
    .map((a) => ({ role: a.role, userId: a.userId, notes: a.notes }));

  const debrief = await db.missionDebrief.create({
    data: {
      missionId: data.missionId,
      summary: data.summary,
      lessonsLearned: data.lessonsLearned
        ? JSON.parse(JSON.stringify(data.lessonsLearned))
        : undefined,
      clientFeedback: data.clientFeedback,
      qualityScore: data.qualityScore,
      onTime: data.onTime,
      onBudget: data.onBudget,
      signalsSuggested: data.signalsSuggested
        ? JSON.parse(JSON.stringify(data.signalsSuggested))
        : undefined,
      pricingInsights: data.pricingInsights
        ? JSON.parse(JSON.stringify(data.pricingInsights))
        : undefined,
      freelanceNotes: freelanceNotes.length > 0
        ? JSON.parse(JSON.stringify(freelanceNotes))
        : undefined,
      completedBy,
    },
  });

  // ── Feedback loop: debrief → signals → stale → pricing ──
  let feedbackSignalsCreated = 0;
  const feedbackPillarsStale: string[] = [];

  try {
    // 1. Create signals from debrief suggestions
    if (data.signalsSuggested && Array.isArray(data.signalsSuggested)) {
      const stalePillarTypes: string[] = [];

      for (const sig of data.signalsSuggested as Array<{
        title?: string;
        layer?: string;
        pillar?: string;
      }>) {
        // Determine a valid default status per layer:
        // STRONG → EMERGING, WEAK → WATCH, METRIC → WARNING
        const layer = (sig.layer as "METRIC" | "STRONG" | "WEAK") ?? "STRONG";
        const defaultStatuses: Record<string, string> = {
          STRONG: "EMERGING",
          WEAK: "WATCH",
          METRIC: "WARNING",
        };
        await createSignal(mission.strategyId, {
          title: sig.title ?? "Signal debrief",
          layer,
          status: defaultStatuses[layer] ?? "EMERGING",
          source: "DEBRIEF",
          pillar: sig.pillar ?? "S",
        });
        feedbackSignalsCreated++;

        // Track which pillars need stale marking
        if (sig.pillar) {
          stalePillarTypes.push(sig.pillar);
          const pillar = await db.pillar.findFirst({
            where: { strategyId: mission.strategyId, type: sig.pillar },
          });
          if (pillar) {
            await markPillarStale(
              pillar.id,
              `Debrief mission : ${mission.title}`,
            );
          }
        }
      }

      // Propagate staleness to translation docs
      const uniquePillars = [...new Set(stalePillarTypes)];
      if (uniquePillars.length > 0) {
        await propagateToTranslationDocs(
          mission.strategyId,
          uniquePillars,
        );
        feedbackPillarsStale.push(...uniquePillars);
      }
    }

    // 2. Update market pricing from debrief insights
    if (data.pricingInsights && Array.isArray(data.pricingInsights)) {
      for (const insight of data.pricingInsights as Array<{
        market?: string;
        category?: string;
        subcategory?: string;
        label?: string;
        minPrice?: number;
        maxPrice?: number;
        avgPrice?: number;
        unit?: string;
      }>) {
        const market = insight.market ?? "CM";
        const category = insight.category ?? "TALENT";
        const subcategory = insight.subcategory ?? "general";
        if (insight.minPrice != null && insight.maxPrice != null) {
          await db.marketPricing.upsert({
            where: {
              market_category_subcategory: {
                market,
                category,
                subcategory,
              },
            },
            create: {
              market,
              category,
              subcategory,
              label: insight.label ?? `${category} — ${subcategory}`,
              minPrice: insight.minPrice,
              maxPrice: insight.maxPrice,
              avgPrice: insight.avgPrice,
              unit: insight.unit ?? "per_day",
              source: "mission_debrief",
              confidence: "MEDIUM",
            },
            update: {
              minPrice: insight.minPrice,
              maxPrice: insight.maxPrice,
              avgPrice: insight.avgPrice,
              source: "mission_debrief",
              confidence: "MEDIUM",
              lastUpdated: new Date(),
            },
          });
        }
      }
    }

    // 3. GLORY → Signal: validated GLORY outputs become intelligence signals
    if (data.qualityScore != null && data.qualityScore >= 70) {
      const deliverables = await db.missionDeliverable.findMany({
        where: { missionId: data.missionId, gloryOutputId: { not: null } },
        include: { gloryOutput: { select: { id: true, title: true, toolSlug: true } } },
      });

      for (const del of deliverables) {
        if (!del.gloryOutput) continue;

        // Map GLORY tool to feedback pillar (creative tools → E, strategic tools → D)
        const feedbackPillar = GLORY_TOOL_FEEDBACK_PILLAR[del.gloryOutput.toolSlug] ?? "E";

        await createSignal(mission.strategyId, {
          title: `Concept validé : ${del.gloryOutput.title}`,
          layer: "STRONG",
          status: "ACTIVE",
          source: "GLORY_VALIDATED",
          pillar: feedbackPillar,
          confidence: "HIGH",
          description: `Output GLORY "${del.gloryOutput.toolSlug}" validé en mission (qualité: ${data.qualityScore}/100)`,
        });
        feedbackSignalsCreated++;

        if (!feedbackPillarsStale.includes(feedbackPillar)) {
          feedbackPillarsStale.push(feedbackPillar);
        }
      }
    }
  } catch (err) {
    // Non-blocking: feedback loop errors shouldn't prevent debrief save
    console.error("[MissionManager] Debrief feedback loop error:", err);
  }

  // ── 4. La Guilde → Auto-Review: create talent reviews from debrief ──
  let talentReviewsCreated = 0;
  try {
    const talentEngine = await import("~/server/services/talent-engine");

    // Get all assignments for this mission with user info
    const missionAssignments = await db.missionAssignment.findMany({
      where: { missionId: data.missionId },
      select: { id: true, userId: true, role: true },
    });

    for (const assignment of missionAssignments) {
      // Check if this user has a TalentProfile
      const talentProfile = await db.talentProfile.findUnique({
        where: { userId: assignment.userId },
      });

      if (!talentProfile) continue;

      // Check if a review already exists for this talent + mission
      const existingReview = await db.talentReview.findUnique({
        where: {
          talentProfileId_missionId: {
            talentProfileId: talentProfile.id,
            missionId: data.missionId,
          },
        },
      });

      if (existingReview) continue;

      // Map debrief qualityScore (0-100) → review score (1-5)
      const qualityRaw = data.qualityScore ?? 70;
      const qualityScore = Math.max(1, Math.min(5, Math.round(qualityRaw / 20)));

      // Infer deadline score from onTime
      const deadlinesScore = data.onTime === true ? 5 : data.onTime === false ? 2 : 3;

      // Create auto-review
      await talentEngine.createReview(completedBy, {
        talentProfileId: talentProfile.id,
        missionId: data.missionId,
        assignmentId: assignment.id,
        qualityScore,
        deadlinesScore,
        comment: `Auto-review depuis debrief mission "${mission.title}" (score: ${qualityRaw}/100)`,
        isPublic: false,
      });

      talentReviewsCreated++;
    }
  } catch (err) {
    // Non-blocking: auto-review errors shouldn't prevent debrief completion
    console.error("[MissionManager] Auto-review creation error:", err);
  }

  return {
    ...debrief,
    feedbackSignalsCreated,
    feedbackPillarsStale,
    talentReviewsCreated,
  };
}

/**
 * Get debrief for a mission.
 */
export async function getDebriefByMission(missionId: string) {
  return db.missionDebrief.findUnique({
    where: { missionId },
  });
}

// ============================================
// CHARGE ESTIMATION
// ============================================

/**
 * Calculate the estimated charge for a mission based on assignments and MarketPricing.
 */
export async function calculateEstimatedCharge(missionId: string) {
  const assignments = await db.missionAssignment.findMany({
    where: { missionId },
  });

  let totalCharge = 0;
  for (const assignment of assignments) {
    const rate = assignment.dayRate ?? 0;
    const days = assignment.estimatedDays ?? 0;
    totalCharge += rate * days;
  }

  // Update mission with the calculated charge
  await db.mission.update({
    where: { id: missionId },
    data: { estimatedCharge: totalCharge },
  });

  return totalCharge;
}

// ============================================
// DEBRIEF SEARCH & STATS
// ============================================

/**
 * Search across all debriefs for the given user.
 * Uses Prisma findMany with proper parameterised filters (no raw SQL).
 */
export async function searchDebriefs(
  userId: string,
  query: string,
  filters?: {
    sector?: string;
    qualityMin?: number;
    onTime?: boolean;
  },
) {
  const searchPattern = `%${query}%`;

  // Build Prisma-safe where clause
  const debriefWhere: Record<string, unknown> = {
    mission: {
      strategy: {
        userId,
        ...(filters?.sector ? { sector: filters.sector } : {}),
      },
    },
    OR: [
      { summary: { contains: query, mode: "insensitive" } },
      { clientFeedback: { contains: query, mode: "insensitive" } },
    ],
  };

  if (filters?.qualityMin != null) {
    debriefWhere.qualityScore = { gte: filters.qualityMin };
  }
  if (filters?.onTime != null) {
    debriefWhere.onTime = filters.onTime;
  }

  const results = await db.missionDebrief.findMany({
    where: debriefWhere,
    select: {
      id: true,
      missionId: true,
      summary: true,
      clientFeedback: true,
      qualityScore: true,
      onTime: true,
      onBudget: true,
      createdAt: true,
      mission: {
        select: {
          title: true,
          strategy: {
            select: {
              brandName: true,
              sector: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Flatten to match the expected return shape
  return results.map((d) => ({
    id: d.id,
    missionId: d.missionId,
    missionTitle: d.mission.title,
    brandName: d.mission.strategy.brandName,
    sector: d.mission.strategy.sector,
    summary: d.summary,
    clientFeedback: d.clientFeedback,
    qualityScore: d.qualityScore,
    onTime: d.onTime,
    onBudget: d.onBudget,
    createdAt: d.createdAt,
  }));
}

/**
 * Aggregate debrief statistics for a user.
 * Uses Prisma aggregate instead of raw SQL for safety.
 */
export async function getDebriefStats(userId: string) {
  const debriefs = await db.missionDebrief.findMany({
    where: {
      mission: {
        strategy: { userId },
      },
    },
    select: {
      qualityScore: true,
      onTime: true,
      onBudget: true,
    },
  });

  const total = debriefs.length;
  if (total === 0) {
    return {
      totalDebriefs: 0,
      avgQuality: null,
      onTimePercent: null,
      onBudgetPercent: null,
    };
  }

  const qualityScores = debriefs
    .map((d) => d.qualityScore)
    .filter((s): s is number => s != null);
  const avgQuality =
    qualityScores.length > 0
      ? Math.round(
          (qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length) *
            10,
        ) / 10
      : null;

  const onTimeCount = debriefs.filter((d) => d.onTime === true).length;
  const onBudgetCount = debriefs.filter((d) => d.onBudget === true).length;

  return {
    totalDebriefs: total,
    avgQuality,
    onTimePercent: Math.round((onTimeCount / total) * 100),
    onBudgetPercent: Math.round((onBudgetCount / total) * 100),
  };
}

/**
 * Delete (archive) a mission.
 */
export async function deleteMission(missionId: string) {
  return db.mission.delete({
    where: { id: missionId },
  });
}
