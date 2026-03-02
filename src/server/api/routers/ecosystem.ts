// =============================================================================
// ROUTER T.20 — Ecosystem Dashboard
// =============================================================================
// Read-only tRPC router for the UPGRADERS flywheel dashboard.
// Aggregates cross-system metrics for operators/admins.
//
// All procedures are ops-only (ADMIN, OPERATOR).
// =============================================================================

import { z } from "zod";
import {
  createTRPCRouter,
  roleProtectedProcedure,
} from "~/server/api/trpc";
import * as ecosystemEngine from "~/server/services/ecosystem-engine";

const opsProcedure = roleProtectedProcedure(["ADMIN", "OPERATOR"]);

export const ecosystemRouter = createTRPCRouter({
  /** Flywheel health — 5 pillar metrics. */
  flywheel: opsProcedure.query(async () => {
    return ecosystemEngine.getFlywheelMetrics();
  }),

  /** Missions pipeline — by status. */
  missionsPipeline: opsProcedure.query(async () => {
    return ecosystemEngine.getMissionsPipeline();
  }),

  /** Talent pool health — by level, availability, category. */
  talentHealth: opsProcedure.query(async () => {
    return ecosystemEngine.getTalentPoolHealth();
  }),

  /** Revenue pipeline — collected vs pending. */
  revenue: opsProcedure.query(async () => {
    return ecosystemEngine.getRevenuePipeline();
  }),

  /** Client journey — by strategy phase. */
  clientJourney: opsProcedure.query(async () => {
    return ecosystemEngine.getClientJourney();
  }),

  /** Recent cross-system activity. */
  activity: opsProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }).optional())
    .query(async ({ input }) => {
      return ecosystemEngine.getRecentActivity(input?.limit ?? 10);
    }),

  /** Ecosystem KPIs (synthetic). */
  kpis: opsProcedure.query(async () => {
    return ecosystemEngine.getEcosystemKPIs();
  }),
});
