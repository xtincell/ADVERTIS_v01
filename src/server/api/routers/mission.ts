// =============================================================================
// ROUTER T.11 — Mission Router
// =============================================================================
// Operational mission management. Full workflow: create, assign, deliver, debrief.
// Uses roleProtectedProcedure for ADMIN/OPERATOR-only mutations.
//
// Sub-routers:
//   missions     — getByStrategy, getById, getKanban, getByFreelance,
//                  create, update, transition, delete, calculateCharge
//   assignments  — getByMission, create, update, delete
//   deliverables — getByMission, create, review
//   debrief      — getByMission, create
//
// Helpers:
//   verifyStrategyOwnership — Shared ownership check
//   verifyMissionAccess     — Mission access check via strategy
//
// Dependencies:
//   ~/server/api/trpc              — createTRPCRouter, protectedProcedure, roleProtectedProcedure
//   ~/lib/types/phase3-schemas     — CreateMissionSchema, UpdateMissionSchema,
//                                    TransitionMissionSchema, CreateAssignmentSchema,
//                                    UpdateAssignmentSchema, CreateDeliverableSchema,
//                                    ReviewDeliverableSchema, CreateDebriefSchema
//   ~/lib/constants                — MISSION_STATUSES
//   ~/server/services/mission-manager — createMission, updateMission, transitionMission, etc.
//   ~/server/db                    — Prisma client (for helper typing)
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  roleProtectedProcedure,
} from "~/server/api/trpc";
import {
  CreateMissionSchema,
  UpdateMissionSchema,
  TransitionMissionSchema,
  CreateAssignmentSchema,
  UpdateAssignmentSchema,
  CreateDeliverableSchema,
  ReviewDeliverableSchema,
  CreateDebriefSchema,
} from "~/lib/types/phase3-schemas";
import { MISSION_STATUSES } from "~/lib/constants";
import {
  createMission,
  updateMission,
  transitionMission,
  getMissionById,
  getMissionsByStrategy,
  getMissionKanban,
  getMissionsByFreelance,
  assignFreelance,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByMission,
  addDeliverable,
  reviewDeliverable,
  getDeliverablesByMission,
  completeMissionDebrief,
  getDebriefByMission,
  searchDebriefs,
  getDebriefStats,
  calculateEstimatedCharge,
  deleteMission,
} from "~/server/services/mission-manager";
import { db as prismaDb } from "~/server/db";

// ---------------------------------------------------------------------------
// Helper — verify strategy ownership
// ---------------------------------------------------------------------------

async function verifyStrategyOwnership(
  db: typeof prismaDb,
  strategyId: string,
  userId: string,
) {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: { id: true, userId: true },
  });
  if (!strategy || strategy.userId !== userId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Stratégie non trouvée",
    });
  }
  return strategy;
}

// ---------------------------------------------------------------------------
// Helper — verify mission access
// ---------------------------------------------------------------------------

async function verifyMissionAccess(
  db: typeof prismaDb,
  missionId: string,
  userId: string,
) {
  const mission = await db.mission.findUnique({
    where: { id: missionId },
    include: { strategy: { select: { userId: true } } },
  });
  if (!mission || mission.strategy.userId !== userId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Mission non trouvée",
    });
  }
  return mission;
}

// ---------------------------------------------------------------------------
// Missions Sub-Router
// ---------------------------------------------------------------------------

const opsProcedure = roleProtectedProcedure(["ADMIN", "OPERATOR"]);

const missionsRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(
      z.object({
        strategyId: z.string().min(1),
        status: z.enum(MISSION_STATUSES).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return getMissionsByStrategy(input.strategyId, input.status);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyMissionAccess(ctx.db, input.id, ctx.session.user.id);
      return getMissionById(input.id);
    }),

  getKanban: protectedProcedure.query(async ({ ctx }) => {
    return getMissionKanban(ctx.session.user.id);
  }),

  getByFreelance: protectedProcedure.query(async ({ ctx }) => {
    return getMissionsByFreelance(ctx.session.user.id);
  }),

  create: opsProcedure
    .input(CreateMissionSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return createMission(input, ctx.session.user.id);
    }),

  update: opsProcedure
    .input(UpdateMissionSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyMissionAccess(ctx.db, input.id, ctx.session.user.id);
      return updateMission(input);
    }),

  transition: opsProcedure
    .input(TransitionMissionSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyMissionAccess(ctx.db, input.id, ctx.session.user.id);
      return transitionMission(input.id, input.newStatus, ctx.session.user.id);
    }),

  delete: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyMissionAccess(ctx.db, input.id, ctx.session.user.id);
      return deleteMission(input.id);
    }),

  calculateCharge: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyMissionAccess(ctx.db, input.id, ctx.session.user.id);
      return calculateEstimatedCharge(input.id);
    }),
});

// ---------------------------------------------------------------------------
// Assignments Sub-Router
// ---------------------------------------------------------------------------

const assignmentsRouter = createTRPCRouter({
  getByMission: protectedProcedure
    .input(z.object({ missionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyMissionAccess(ctx.db, input.missionId, ctx.session.user.id);
      return getAssignmentsByMission(input.missionId);
    }),

  create: opsProcedure
    .input(CreateAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyMissionAccess(ctx.db, input.missionId, ctx.session.user.id);
      return assignFreelance(input);
    }),

  update: opsProcedure
    .input(UpdateAssignmentSchema)
    .mutation(async ({ input }) => {
      return updateAssignment(input);
    }),

  delete: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return deleteAssignment(input.id);
    }),
});

// ---------------------------------------------------------------------------
// Deliverables Sub-Router
// ---------------------------------------------------------------------------

const deliverablesRouter = createTRPCRouter({
  getByMission: protectedProcedure
    .input(z.object({ missionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyMissionAccess(ctx.db, input.missionId, ctx.session.user.id);
      return getDeliverablesByMission(input.missionId);
    }),

  create: protectedProcedure
    .input(CreateDeliverableSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyMissionAccess(ctx.db, input.missionId, ctx.session.user.id);
      return addDeliverable(input);
    }),

  review: opsProcedure
    .input(ReviewDeliverableSchema)
    .mutation(async ({ ctx, input }) => {
      return reviewDeliverable(input, ctx.session.user.id);
    }),
});

// ---------------------------------------------------------------------------
// Debrief Sub-Router
// ---------------------------------------------------------------------------

const debriefRouter = createTRPCRouter({
  getByMission: protectedProcedure
    .input(z.object({ missionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyMissionAccess(ctx.db, input.missionId, ctx.session.user.id);
      return getDebriefByMission(input.missionId);
    }),

  create: opsProcedure
    .input(CreateDebriefSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyMissionAccess(ctx.db, input.missionId, ctx.session.user.id);
      return completeMissionDebrief(input, ctx.session.user.id);
    }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        sector: z.string().optional(),
        qualityMin: z.number().optional(),
        onTime: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return searchDebriefs(ctx.session.user.id, input.query, {
        sector: input.sector,
        qualityMin: input.qualityMin,
        onTime: input.onTime,
      });
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    return getDebriefStats(ctx.session.user.id);
  }),
});

// ---------------------------------------------------------------------------
// Combined Mission Router
// ---------------------------------------------------------------------------

export const missionRouter = createTRPCRouter({
  missions: missionsRouter,
  assignments: assignmentsRouter,
  deliverables: deliverablesRouter,
  debrief: debriefRouter,
});
