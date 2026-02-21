// =============================================================================
// ROUTER T.12 — Intervention Router
// =============================================================================
// Freelance intervention management. Ad-hoc intervention request workflow.
// CLIENT_RETAINER users can create interventions.
// ADMIN/OPERATOR users can triage, start, resolve, and reject them.
//
// Procedures:
//   create        — Create an intervention (any authenticated user)
//   getByStrategy — Get interventions by strategy
//   getByMission  — Get interventions by mission
//   getMine       — Get current user's interventions (client view)
//   getPending    — Get all pending interventions (ADMIN/OPERATOR dashboard)
//   triage        — Triage an intervention (OPEN -> TRIAGED)
//   start         — Start working on an intervention (TRIAGED -> IN_PROGRESS)
//   resolve       — Resolve an intervention
//   reject        — Reject an intervention
//
// Dependencies:
//   ~/server/api/trpc                    — createTRPCRouter, protectedProcedure, roleProtectedProcedure
//   ~/lib/types/phase3-schemas           — CreateInterventionSchema, ResolveInterventionSchema
//   ~/server/services/intervention-handler — createIntervention, triageIntervention, etc.
// =============================================================================

import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  roleProtectedProcedure,
} from "~/server/api/trpc";
import {
  CreateInterventionSchema,
  ResolveInterventionSchema,
} from "~/lib/types/phase3-schemas";
import {
  createIntervention,
  triageIntervention,
  startIntervention,
  resolveIntervention,
  rejectIntervention,
  getPendingInterventions,
  getInterventionsByStrategy,
  getInterventionsByMission,
  getInterventionsByUser,
} from "~/server/services/intervention-handler";

const opsProcedure = roleProtectedProcedure(["ADMIN", "OPERATOR"]);

export const interventionRouter = createTRPCRouter({
  // CLIENT_RETAINER (or any authenticated user) can create an intervention
  create: protectedProcedure
    .input(CreateInterventionSchema)
    .mutation(async ({ ctx, input }) => {
      return createIntervention(input, ctx.session.user.id);
    }),

  // Get interventions by strategy
  getByStrategy: protectedProcedure
    .input(z.object({ strategyId: z.string().min(1) }))
    .query(async ({ input }) => {
      return getInterventionsByStrategy(input.strategyId);
    }),

  // Get interventions by mission
  getByMission: protectedProcedure
    .input(z.object({ missionId: z.string().min(1) }))
    .query(async ({ input }) => {
      return getInterventionsByMission(input.missionId);
    }),

  // Get my interventions (client view)
  getMine: protectedProcedure.query(async ({ ctx }) => {
    return getInterventionsByUser(ctx.session.user.id);
  }),

  // Get all pending interventions (ADMIN/OPERATOR dashboard)
  getPending: opsProcedure.query(async () => {
    return getPendingInterventions();
  }),

  // Triage an intervention (OPEN → TRIAGED)
  triage: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return triageIntervention(input.id, ctx.session.user.id);
    }),

  // Start working on an intervention (TRIAGED → IN_PROGRESS)
  start: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return startIntervention(input.id);
    }),

  // Resolve an intervention
  resolve: opsProcedure
    .input(ResolveInterventionSchema)
    .mutation(async ({ ctx, input }) => {
      return resolveIntervention(input, ctx.session.user.id);
    }),

  // Reject an intervention
  reject: opsProcedure
    .input(
      z.object({
        id: z.string().min(1),
        reason: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return rejectIntervention(input.id, input.reason, ctx.session.user.id);
    }),
});
