// =============================================================================
// ROUTER T.20 — Campaign Router (360° Campaign Ops)
// =============================================================================
// Full lifecycle campaign management with 14 sub-routers covering: campaigns,
// actions (ATL/BTL/TTL), executions (production pipeline), amplifications
// (media buying), team, milestones, budget, approvals, assets, briefs,
// reports, junction links, dependencies, and templates.
//
// Helpers:
//   verifyStrategyOwnership — Shared ownership check
//   verifyCampaignAccess   — Campaign access check via strategy
//
// Dependencies:
//   ~/server/api/trpc              — createTRPCRouter, protectedProcedure, roleProtectedProcedure
//   ~/lib/types/campaign-schemas   — All Zod validation schemas
//   ~/lib/constants                — CAMPAIGN_STATUSES, etc.
//   ~/server/services/campaign-manager        — Core campaign service
//   ~/server/services/campaign-budget-engine   — Financial logic
//   ~/server/services/campaign-brief-generator — AI brief generation
//   ~/server/services/campaign-migration       — Pillar I migration
//   ~/server/db                    — Prisma client
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  roleProtectedProcedure,
} from "~/server/api/trpc";
import {
  CreateCampaignSchema,
  UpdateCampaignSchema,
  TransitionCampaignSchema,
  DuplicateCampaignSchema,
  CampaignSearchSchema,
  CampaignCalendarSchema,
  CreateActionSchema,
  UpdateActionSchema,
  CreateExecutionSchema,
  UpdateExecutionSchema,
  TransitionExecutionSchema,
  CreateAmplificationSchema,
  UpdateAmplificationSchema,
  UpdateAmplificationPerformanceSchema,
  CreateTeamMemberSchema,
  UpdateTeamMemberSchema,
  CreateMilestoneSchema,
  UpdateMilestoneSchema,
  CreateBudgetLineSchema,
  UpdateBudgetLineSchema,
  CreateApprovalSchema,
  ResolveApprovalSchema,
  CreateAssetSchema,
  UpdateAssetSchema,
  CreateBriefSchema,
  UpdateBriefSchema,
  CreateReportSchema,
  LinkMissionSchema,
  LinkPublicationSchema,
  LinkSignalSchema,
  CreateDependencySchema,
} from "~/lib/types/campaign-schemas";
import { CAMPAIGN_STATUSES } from "~/lib/constants";
import {
  createCampaign,
  updateCampaign,
  transitionCampaign,
  getCampaignById,
  getCampaignsByStrategy,
  getCampaignKanban,
  getCampaignCalendar,
  searchCampaigns,
  getCampaignDashboard,
  deleteCampaign,
  duplicateCampaign,
  listTemplates,
  createAction,
  updateAction,
  deleteAction,
  getActionsByCampaign,
  createExecution,
  updateExecution,
  transitionExecution,
  getExecutionsByCampaign,
  createAmplification,
  updateAmplification,
  updateAmplificationPerformance,
  getAmplificationsByCampaign,
  getMediaPlanSummary,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  getTeamByCampaign,
  getTeamWorkload,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  getMilestonesByCampaign,
  checkGateReviews,
  addBudgetLine,
  updateBudgetLine,
  deleteBudgetLine,
  getBudgetByCampaign,
  getBudgetSummary,
  createApproval,
  resolveApproval,
  getApprovalsByCampaign,
  getPendingApprovals,
  addAsset,
  updateAsset,
  getAssetsByCampaign,
  publishAssetToVault,
  createBrief,
  updateBrief,
  sendBrief,
  getBriefsByCampaign,
  createReport,
  publishReport,
  getReportsByCampaign,
  linkMission,
  unlinkMission,
  linkPublication,
  unlinkPublication,
  linkSignal,
  unlinkSignal,
  addDependency,
  removeDependency,
  getDependenciesByCampaign,
} from "~/server/services/campaign-manager";
import {
  allocateBudgetFromTier,
  calculateBudgetVariance,
  forecastBudgetBurn,
  getSpendByActionLine,
  getCostPerKPI,
} from "~/server/services/campaign-budget-engine";
import {
  generateCreativeBriefContent,
  generateMediaBriefContent,
  generateVendorBriefContent,
  generateProductionBriefContent,
} from "~/server/services/campaign-brief-generator";
import { migratePillarICampaigns } from "~/server/services/campaign-migration";
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
// Helper — verify campaign access via strategy
// ---------------------------------------------------------------------------

async function verifyCampaignAccess(
  db: typeof prismaDb,
  campaignId: string,
  userId: string,
) {
  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: { strategy: { select: { userId: true } } },
  });
  if (!campaign || campaign.strategy.userId !== userId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Campagne non trouvée",
    });
  }
  return campaign;
}

// ---------------------------------------------------------------------------
// Role-protected procedure (ADMIN/OPERATOR only for mutations)
// ---------------------------------------------------------------------------

const opsProcedure = roleProtectedProcedure(["ADMIN", "OPERATOR"]);

// ---------------------------------------------------------------------------
// 1. Campaigns Sub-Router
// ---------------------------------------------------------------------------

const campaignsRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(
      z.object({
        strategyId: z.string().min(1),
        status: z.enum(CAMPAIGN_STATUSES).optional(),
        isTemplate: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return getCampaignsByStrategy(input.strategyId, input.status, input.isTemplate);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.id, ctx.session.user.id);
      return getCampaignById(input.id);
    }),

  getKanban: protectedProcedure.query(async ({ ctx }) => {
    return getCampaignKanban(ctx.session.user.id);
  }),

  getCalendar: protectedProcedure
    .input(CampaignCalendarSchema)
    .query(async ({ ctx, input }) => {
      if (input.strategyId) {
        await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      }
      return getCampaignCalendar(ctx.session.user.id, input.year);
    }),

  search: protectedProcedure
    .input(CampaignSearchSchema)
    .query(async ({ ctx, input }) => {
      if (input.strategyId) {
        await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      }
      return searchCampaigns(ctx.session.user.id, input);
    }),

  dashboard: protectedProcedure.query(async ({ ctx }) => {
    return getCampaignDashboard(ctx.session.user.id);
  }),

  create: opsProcedure
    .input(CreateCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return createCampaign(input, ctx.session.user.id);
    }),

  update: opsProcedure
    .input(UpdateCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.id, ctx.session.user.id);
      return updateCampaign(input);
    }),

  transition: opsProcedure
    .input(TransitionCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.id, ctx.session.user.id);
      return transitionCampaign(input.id, input.newStatus, ctx.session.user.id);
    }),

  delete: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.id, ctx.session.user.id);
      return deleteCampaign(input.id);
    }),

  migrate: opsProcedure
    .input(z.object({ strategyId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return migratePillarICampaigns(input.strategyId, ctx.session.user.id);
    }),
});

// ---------------------------------------------------------------------------
// 2. Actions Sub-Router (ATL / BTL / TTL)
// ---------------------------------------------------------------------------

const actionsRouter = createTRPCRouter({
  getByCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().min(1),
        actionLine: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getActionsByCampaign(input.campaignId, input.actionLine);
    }),

  create: opsProcedure
    .input(CreateActionSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return createAction(input);
    }),

  update: opsProcedure
    .input(UpdateActionSchema)
    .mutation(async ({ ctx, input }) => {
      const action = await ctx.db.campaignAction.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, action.campaignId, ctx.session.user.id);
      return updateAction(input);
    }),

  delete: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const action = await ctx.db.campaignAction.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, action.campaignId, ctx.session.user.id);
      return deleteAction(input.id);
    }),
});

// ---------------------------------------------------------------------------
// 3. Executions Sub-Router (Production Pipeline)
// ---------------------------------------------------------------------------

const executionsRouter = createTRPCRouter({
  getByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getExecutionsByCampaign(input.campaignId);
    }),

  create: opsProcedure
    .input(CreateExecutionSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return createExecution(input);
    }),

  update: opsProcedure
    .input(UpdateExecutionSchema)
    .mutation(async ({ ctx, input }) => {
      const exec = await ctx.db.campaignExecution.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, exec.campaignId, ctx.session.user.id);
      return updateExecution(input);
    }),

  transition: opsProcedure
    .input(TransitionExecutionSchema)
    .mutation(async ({ ctx, input }) => {
      const exec = await ctx.db.campaignExecution.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, exec.campaignId, ctx.session.user.id);
      return transitionExecution(input.id, input.newStatus);
    }),
});

// ---------------------------------------------------------------------------
// 4. Amplifications Sub-Router (Media Buying)
// ---------------------------------------------------------------------------

const amplificationsRouter = createTRPCRouter({
  getByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getAmplificationsByCampaign(input.campaignId);
    }),

  mediaPlanSummary: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getMediaPlanSummary(input.campaignId);
    }),

  create: opsProcedure
    .input(CreateAmplificationSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return createAmplification(input);
    }),

  update: opsProcedure
    .input(UpdateAmplificationSchema)
    .mutation(async ({ ctx, input }) => {
      const amp = await ctx.db.campaignAmplification.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, amp.campaignId, ctx.session.user.id);
      return updateAmplification(input);
    }),

  updatePerformance: opsProcedure
    .input(UpdateAmplificationPerformanceSchema)
    .mutation(async ({ ctx, input }) => {
      const amp = await ctx.db.campaignAmplification.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, amp.campaignId, ctx.session.user.id);
      return updateAmplificationPerformance(input);
    }),
});

// ---------------------------------------------------------------------------
// 5. Team Sub-Router
// ---------------------------------------------------------------------------

const teamRouter = createTRPCRouter({
  getByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getTeamByCampaign(input.campaignId);
    }),

  workload: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getTeamWorkload(input.campaignId);
    }),

  add: opsProcedure
    .input(CreateTeamMemberSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return addTeamMember(input);
    }),

  update: opsProcedure
    .input(UpdateTeamMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.campaignTeamMember.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, member.campaignId, ctx.session.user.id);
      return updateTeamMember(input);
    }),

  remove: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.campaignTeamMember.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, member.campaignId, ctx.session.user.id);
      return removeTeamMember(input.id);
    }),
});

// ---------------------------------------------------------------------------
// 6. Milestones Sub-Router
// ---------------------------------------------------------------------------

const milestonesRouter = createTRPCRouter({
  getByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getMilestonesByCampaign(input.campaignId);
    }),

  gateReviews: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1), phase: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return checkGateReviews(input.campaignId, input.phase);
    }),

  create: opsProcedure
    .input(CreateMilestoneSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return createMilestone(input);
    }),

  update: opsProcedure
    .input(UpdateMilestoneSchema)
    .mutation(async ({ ctx, input }) => {
      const milestone = await ctx.db.campaignMilestone.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, milestone.campaignId, ctx.session.user.id);
      return updateMilestone(input);
    }),

  delete: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const milestone = await ctx.db.campaignMilestone.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, milestone.campaignId, ctx.session.user.id);
      return deleteMilestone(input.id);
    }),
});

// ---------------------------------------------------------------------------
// 7. Budget Sub-Router
// ---------------------------------------------------------------------------

const budgetRouter = createTRPCRouter({
  getByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getBudgetByCampaign(input.campaignId);
    }),

  summary: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getBudgetSummary(input.campaignId);
    }),

  variance: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return calculateBudgetVariance(input.campaignId);
    }),

  burnForecast: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return forecastBudgetBurn(input.campaignId);
    }),

  spendByActionLine: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getSpendByActionLine(input.campaignId);
    }),

  costPerKPI: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getCostPerKPI(input.campaignId);
    }),

  addLine: opsProcedure
    .input(CreateBudgetLineSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return addBudgetLine(input);
    }),

  updateLine: opsProcedure
    .input(UpdateBudgetLineSchema)
    .mutation(async ({ ctx, input }) => {
      const line = await ctx.db.campaignBudgetLine.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, line.campaignId, ctx.session.user.id);
      return updateBudgetLine(input);
    }),

  deleteLine: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const line = await ctx.db.campaignBudgetLine.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, line.campaignId, ctx.session.user.id);
      return deleteBudgetLine(input.id);
    }),

  allocateFromTier: opsProcedure
    .input(z.object({ campaignId: z.string().min(1), tierId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return allocateBudgetFromTier(input.campaignId, input.tierId);
    }),
});

// ---------------------------------------------------------------------------
// 8. Approvals Sub-Router
// ---------------------------------------------------------------------------

const approvalsRouter = createTRPCRouter({
  getByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getApprovalsByCampaign(input.campaignId);
    }),

  pending: protectedProcedure.query(async ({ ctx }) => {
    return getPendingApprovals(ctx.session.user.id);
  }),

  create: opsProcedure
    .input(CreateApprovalSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return createApproval(input, ctx.session.user.id);
    }),

  resolve: opsProcedure
    .input(ResolveApprovalSchema)
    .mutation(async ({ ctx, input }) => {
      const approval = await ctx.db.campaignApproval.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, approval.campaignId, ctx.session.user.id);
      return resolveApproval(input, ctx.session.user.id);
    }),
});

// ---------------------------------------------------------------------------
// 9. Assets Sub-Router
// ---------------------------------------------------------------------------

const assetsRouter = createTRPCRouter({
  getByCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().min(1),
        assetType: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getAssetsByCampaign(input.campaignId, input.assetType);
    }),

  add: opsProcedure
    .input(CreateAssetSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return addAsset(input);
    }),

  update: opsProcedure
    .input(UpdateAssetSchema)
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.campaignAsset.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, asset.campaignId, ctx.session.user.id);
      return updateAsset(input);
    }),

  publishToVault: opsProcedure
    .input(z.object({ assetId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.campaignAsset.findUniqueOrThrow({
        where: { id: input.assetId },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, asset.campaignId, ctx.session.user.id);
      return publishAssetToVault(input.assetId, ctx.session.user.id);
    }),
});

// ---------------------------------------------------------------------------
// 10. Briefs Sub-Router
// ---------------------------------------------------------------------------

const briefsRouter = createTRPCRouter({
  getByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getBriefsByCampaign(input.campaignId);
    }),

  create: opsProcedure
    .input(CreateBriefSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return createBrief(input);
    }),

  update: opsProcedure
    .input(UpdateBriefSchema)
    .mutation(async ({ ctx, input }) => {
      const brief = await ctx.db.campaignBrief.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, brief.campaignId, ctx.session.user.id);
      return updateBrief(input);
    }),

  send: opsProcedure
    .input(z.object({ briefId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const brief = await ctx.db.campaignBrief.findUniqueOrThrow({
        where: { id: input.briefId },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, brief.campaignId, ctx.session.user.id);
      return sendBrief(input.briefId);
    }),

  generateCreative: opsProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return generateCreativeBriefContent(input.campaignId);
    }),

  generateMedia: opsProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return generateMediaBriefContent(input.campaignId);
    }),

  generateVendor: opsProcedure
    .input(z.object({ campaignId: z.string().min(1), vendorType: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return generateVendorBriefContent(input.campaignId, input.vendorType);
    }),

  generateProduction: opsProcedure
    .input(z.object({
      campaignId: z.string().min(1),
      executionIds: z.array(z.string().min(1)),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return generateProductionBriefContent(input.campaignId, input.executionIds);
    }),
});

// ---------------------------------------------------------------------------
// 11. Reports Sub-Router
// ---------------------------------------------------------------------------

const reportsRouter = createTRPCRouter({
  getByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getReportsByCampaign(input.campaignId);
    }),

  create: opsProcedure
    .input(CreateReportSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return createReport(input);
    }),

  publish: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.campaignReport.findUniqueOrThrow({
        where: { id: input.id },
        select: { campaignId: true },
      });
      await verifyCampaignAccess(ctx.db, report.campaignId, ctx.session.user.id);
      return publishReport(input.id, ctx.session.user.id);
    }),
});

// ---------------------------------------------------------------------------
// 12. Links Sub-Router (Mission, Publication, Signal)
// ---------------------------------------------------------------------------

const linksRouter = createTRPCRouter({
  linkMission: opsProcedure
    .input(LinkMissionSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return linkMission(input);
    }),

  unlinkMission: opsProcedure
    .input(z.object({ campaignId: z.string().min(1), missionId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return unlinkMission(input.campaignId, input.missionId);
    }),

  linkPublication: opsProcedure
    .input(LinkPublicationSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return linkPublication(input);
    }),

  unlinkPublication: opsProcedure
    .input(z.object({ campaignId: z.string().min(1), publicationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return unlinkPublication(input.campaignId, input.publicationId);
    }),

  linkSignal: opsProcedure
    .input(LinkSignalSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return linkSignal(input);
    }),

  unlinkSignal: opsProcedure
    .input(z.object({ campaignId: z.string().min(1), signalId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return unlinkSignal(input.campaignId, input.signalId);
    }),
});

// ---------------------------------------------------------------------------
// 13. Dependencies Sub-Router
// ---------------------------------------------------------------------------

const dependenciesRouter = createTRPCRouter({
  getByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return getDependenciesByCampaign(input.campaignId);
    }),

  add: opsProcedure
    .input(CreateDependencySchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.sourceCampaignId, ctx.session.user.id);
      return addDependency(input);
    }),

  remove: opsProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const dep = await ctx.db.campaignDependency.findUniqueOrThrow({
        where: { id: input.id },
        select: { sourceCampaignId: true },
      });
      await verifyCampaignAccess(ctx.db, dep.sourceCampaignId, ctx.session.user.id);
      return removeDependency(input.id);
    }),
});

// ---------------------------------------------------------------------------
// 14. Templates Sub-Router
// ---------------------------------------------------------------------------

const templatesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ strategyId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.strategyId) {
        await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      }
      return listTemplates(input.strategyId);
    }),

  duplicate: opsProcedure
    .input(DuplicateCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyCampaignAccess(ctx.db, input.campaignId, ctx.session.user.id);
      return duplicateCampaign(
        input.campaignId,
        input.name,
        ctx.session.user.id,
        input.asTemplate,
        input.markets,
      );
    }),
});

// ---------------------------------------------------------------------------
// 15. Simulator Sub-Router (Action Marketing Simulator data)
// ---------------------------------------------------------------------------

const simulatorRouter = createTRPCRouter({
  getData: protectedProcedure
    .input(z.object({ strategyId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      // Fetch all campaigns for this strategy
      const campaigns = await ctx.db.campaign.findMany({
        where: { strategyId: input.strategyId },
        select: {
          id: true,
          actions: {
            select: {
              id: true,
              name: true,
              actionLine: true,
              actionType: true,
              channel: true,
              budgetAllocated: true,
              aarrStage: true,
              coutUnitaire: true,
              uniteCosting: true,
              rendementDecroissant: true,
              sovTarget: true,
              contraintesReglementaires: true,
              delaiMinimumJours: true,
            },
          },
        },
      });

      // Flatten all actions across campaigns
      const actions = campaigns.flatMap((c) =>
        c.actions.map((a) => ({
          ...a,
          contraintesReglementaires: Array.isArray(a.contraintesReglementaires)
            ? (a.contraintesReglementaires as string[])
            : null,
        })),
      );

      // Fetch strategy annual budget + currency
      const strategy = await ctx.db.strategy.findUnique({
        where: { id: input.strategyId },
        select: { annualBudget: true, currency: true },
      });

      // Fetch products from Pillar V content
      const pillarV = await ctx.db.pillar.findFirst({
        where: { strategyId: input.strategyId, type: "V" },
        select: { content: true },
      });

      let products: Array<Record<string, unknown>> = [];
      if (pillarV?.content && typeof pillarV.content === "object") {
        const content = pillarV.content as Record<string, unknown>;
        if (Array.isArray(content.produitsCatalogue)) {
          products = content.produitsCatalogue as Array<Record<string, unknown>>;
        }
      }

      return {
        actions,
        annualBudget: strategy?.annualBudget ?? 0,
        currency: strategy?.currency ?? "XAF",
        products,
      };
    }),
});

// ---------------------------------------------------------------------------
// Combined Campaign Router
// ---------------------------------------------------------------------------

export const campaignRouter = createTRPCRouter({
  campaigns: campaignsRouter,
  actions: actionsRouter,
  executions: executionsRouter,
  amplifications: amplificationsRouter,
  team: teamRouter,
  milestones: milestonesRouter,
  budget: budgetRouter,
  approvals: approvalsRouter,
  assets: assetsRouter,
  briefs: briefsRouter,
  reports: reportsRouter,
  links: linksRouter,
  dependencies: dependenciesRouter,
  templates: templatesRouter,
  simulator: simulatorRouter,
});
