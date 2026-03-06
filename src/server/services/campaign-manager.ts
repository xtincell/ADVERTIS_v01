// =============================================================================
// MODULE 40 — Campaign Manager
// =============================================================================
// Core 360° campaign lifecycle management. Handles campaign CRUD, state machine,
// ATL/BTL/TTL actions, executions (production tracking), amplifications (media
// buying), team management, milestones, budget, approvals, assets, briefs,
// reports, junction links, and inter-campaign dependencies.
//
// State machine (12 states):
//   BRIEF_DRAFT -> BRIEF_VALIDATED -> PLANNING -> CREATIVE_DEV -> PRODUCTION
//   -> PRE_PRODUCTION -> APPROVAL -> READY_TO_LAUNCH -> LIVE -> POST_CAMPAIGN
//   -> ARCHIVED | CANCELLED (from any pre-LIVE state)
//
// Public API:
//   Section 1: Campaign CRUD (create, update, transition, get, search, delete)
//   Section 2: Templates & Duplication
//   Section 3: Actions (ATL/BTL/TTL)
//   Section 4: Executions (production pipeline)
//   Section 5: Amplifications (media buying)
//   Section 6: Team Management
//   Section 7: Milestones & Timeline
//   Section 8: Budget & Financial
//   Section 9: Approvals
//   Section 10: Assets
//   Section 11: Briefs
//   Section 12: Reports
//   Section 13: Junction Links (Mission, Publication, Signal)
//   Section 14: Dependencies
//
// Dependencies:
//   - ~/server/db (Prisma — Campaign, CampaignAction, etc.)
//   - ~/lib/constants (CAMPAIGN_VALID_TRANSITIONS, EXECUTION_VALID_TRANSITIONS)
//   - ~/lib/types/campaign-schemas (input types)
// =============================================================================

import { db } from "~/server/db";
import {
  CAMPAIGN_VALID_TRANSITIONS,
  EXECUTION_VALID_TRANSITIONS,
  type CampaignStatus,
  type ExecutionStatus,
} from "~/lib/constants";
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  CreateActionInput,
  UpdateActionInput,
  CreateExecutionInput,
  UpdateExecutionInput,
  CreateAmplificationInput,
  UpdateAmplificationInput,
  UpdateAmplificationPerformanceInput,
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  CreateBudgetLineInput,
  UpdateBudgetLineInput,
  CreateApprovalInput,
  ResolveApprovalInput,
  CreateAssetInput,
  UpdateAssetInput,
  CreateBriefInput,
  UpdateBriefInput,
  CreateReportInput,
  LinkMissionInput,
  LinkPublicationInput,
  LinkSignalInput,
  CreateDependencyInput,
  CampaignSearchInput,
} from "~/lib/types/campaign-schemas";

// ============================================
// SECTION 1: CAMPAIGN CRUD
// ============================================

/** Generate a unique campaign code: CAMP-YYYY-NNN */
async function generateCampaignCode(strategyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.campaign.count({
    where: { strategyId, createdAt: { gte: new Date(`${year}-01-01`) } },
  });
  return `CAMP-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function createCampaign(
  data: CreateCampaignInput,
  createdBy: string,
) {
  const code = await generateCampaignCode(data.strategyId);
  return db.campaign.create({
    data: {
      ...data,
      code,
      createdBy,
      status: "BRIEF_DRAFT",
      budgetAllocated: 0,
      budgetSpent: 0,
    },
  });
}

export async function updateCampaign(data: UpdateCampaignInput) {
  const { id, ...rest } = data;
  return db.campaign.update({ where: { id }, data: rest });
}

export async function transitionCampaign(
  id: string,
  newStatus: CampaignStatus,
  userId: string,
) {
  const campaign = await db.campaign.findUniqueOrThrow({ where: { id } });
  const currentStatus = campaign.status as CampaignStatus;
  const allowed = CAMPAIGN_VALID_TRANSITIONS[currentStatus];

  if (!allowed?.includes(newStatus)) {
    throw new Error(
      `Transition invalide: ${currentStatus} → ${newStatus}. Transitions autorisées: ${allowed?.join(", ")}`,
    );
  }

  // Gate review check: if advancing, check that all gate milestones are completed
  if (newStatus !== "CANCELLED" && newStatus !== currentStatus) {
    const pendingGates = await db.campaignMilestone.count({
      where: {
        campaignId: id,
        isGateReview: true,
        phase: currentStatus,
        status: { notIn: ["COMPLETED", "SKIPPED"] },
      },
    });
    if (pendingGates > 0) {
      throw new Error(
        `${pendingGates} gate review(s) doivent être validées avant de passer à ${newStatus}`,
      );
    }
  }

  const updateData: Record<string, unknown> = { status: newStatus };

  // Auto-set approval timestamps
  if (newStatus === "BRIEF_VALIDATED") {
    updateData.briefApprovedBy = userId;
    updateData.briefApprovedAt = new Date();
  }
  if (newStatus === "READY_TO_LAUNCH") {
    updateData.clientApprovedBy = userId;
    updateData.clientApprovedAt = new Date();
  }

  return db.campaign.update({ where: { id }, data: updateData });
}

export async function getCampaignById(id: string) {
  return db.campaign.findUniqueOrThrow({
    where: { id },
    include: {
      strategy: { select: { id: true, name: true, brandName: true, currency: true } },
      actions: { orderBy: { createdAt: "asc" } },
      teamMembers: { orderBy: { isLead: "desc" } },
      executions: { orderBy: { createdAt: "asc" } },
      amplifications: { orderBy: { flightStart: "asc" } },
      milestones: { orderBy: { dueDate: "asc" } },
      budgetLines: { orderBy: { category: "asc" } },
      approvals: { orderBy: { createdAt: "desc" } },
      assets: { orderBy: { createdAt: "desc" } },
      briefs: { orderBy: { createdAt: "desc" } },
      reports: { orderBy: { createdAt: "desc" } },
      missions: true,
      publications: true,
      signals: true,
      dependencies: true,
      dependedOnBy: true,
      variants: { select: { id: true, name: true, markets: true, status: true } },
      _count: {
        select: {
          actions: true,
          executions: true,
          amplifications: true,
          teamMembers: true,
          milestones: true,
          budgetLines: true,
          approvals: true,
          assets: true,
        },
      },
    },
  });
}

export async function getCampaignsByStrategy(
  strategyId: string,
  status?: CampaignStatus,
  isTemplate?: boolean,
) {
  return db.campaign.findMany({
    where: {
      strategyId,
      ...(status && { status }),
      ...(isTemplate !== undefined && { isTemplate }),
    },
    include: {
      _count: {
        select: {
          actions: true,
          teamMembers: true,
          milestones: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignKanban(userId: string) {
  const campaigns = await db.campaign.findMany({
    where: {
      strategy: { userId },
      isTemplate: false,
      status: { notIn: ["ARCHIVED", "CANCELLED"] },
    },
    include: {
      strategy: { select: { id: true, brandName: true } },
      _count: { select: { actions: true, milestones: true, teamMembers: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Group by status
  const kanban: Record<string, typeof campaigns> = {};
  for (const c of campaigns) {
    const status = c.status;
    if (!kanban[status]) kanban[status] = [];
    kanban[status]!.push(c);
  }
  return kanban;
}

export async function getCampaignCalendar(userId: string, year: number) {
  return db.campaign.findMany({
    where: {
      strategy: { userId },
      isTemplate: false,
      OR: [
        { startDate: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
        { endDate: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
      ],
    },
    include: {
      strategy: { select: { id: true, brandName: true } },
    },
    orderBy: { startDate: "asc" },
  });
}

export async function searchCampaigns(userId: string, search: CampaignSearchInput) {
  return db.campaign.findMany({
    where: {
      strategy: { userId },
      ...(search.strategyId && { strategyId: search.strategyId }),
      ...(search.status && { status: search.status }),
      ...(search.campaignType && { campaignType: search.campaignType }),
      ...(search.funnelStage && { funnelStage: search.funnelStage }),
      ...(search.isTemplate !== undefined && { isTemplate: search.isTemplate }),
      ...(search.query && {
        OR: [
          { name: { contains: search.query, mode: "insensitive" as const } },
          { description: { contains: search.query, mode: "insensitive" as const } },
          { bigIdea: { contains: search.query, mode: "insensitive" as const } },
          { code: { contains: search.query, mode: "insensitive" as const } },
        ],
      }),
      ...(search.startDateFrom && { startDate: { gte: search.startDateFrom } }),
      ...(search.startDateTo && { startDate: { lte: search.startDateTo } }),
    },
    include: {
      strategy: { select: { id: true, brandName: true } },
      _count: { select: { actions: true, teamMembers: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCampaignDashboard(userId: string) {
  const [active, total, budgetAgg, upcoming] = await Promise.all([
    db.campaign.count({
      where: {
        strategy: { userId },
        isTemplate: false,
        status: { in: ["PLANNING", "CREATIVE_DEV", "PRODUCTION", "PRE_PRODUCTION", "APPROVAL", "READY_TO_LAUNCH", "LIVE"] },
      },
    }),
    db.campaign.count({
      where: { strategy: { userId }, isTemplate: false },
    }),
    db.campaign.aggregate({
      where: {
        strategy: { userId },
        isTemplate: false,
        status: { notIn: ["ARCHIVED", "CANCELLED"] },
      },
      _sum: { totalBudget: true, budgetAllocated: true, budgetSpent: true },
    }),
    db.campaignMilestone.findMany({
      where: {
        campaign: { strategy: { userId } },
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // next 7 days
      },
      include: { campaign: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
  ]);

  return {
    activeCampaigns: active,
    totalCampaigns: total,
    totalBudget: budgetAgg._sum.totalBudget ?? 0,
    totalAllocated: budgetAgg._sum.budgetAllocated ?? 0,
    totalSpent: budgetAgg._sum.budgetSpent ?? 0,
    upcomingMilestones: upcoming,
  };
}

export async function deleteCampaign(id: string) {
  return db.campaign.delete({ where: { id } });
}

// ============================================
// SECTION 2: TEMPLATES & DUPLICATION
// ============================================

export async function duplicateCampaign(
  campaignId: string,
  name: string,
  createdBy: string,
  asTemplate = false,
  markets?: string[],
) {
  const source = await getCampaignById(campaignId);
  const code = await generateCampaignCode(source.strategyId);

  const campaign = await db.campaign.create({
    data: {
      strategyId: source.strategyId,
      name,
      code,
      description: source.description,
      campaignType: source.campaignType,
      status: "BRIEF_DRAFT",
      priority: source.priority,
      bigIdea: source.bigIdea,
      axeCreatif: source.axeCreatif,
      pisteCreative: source.pisteCreative,
      insight: source.insight,
      promesse: source.promesse,
      targetAudience: source.targetAudience ?? undefined,
      positioning: source.positioning,
      totalBudget: source.totalBudget,
      currency: source.currency,
      funnelStage: source.funnelStage,
      markets: (markets ?? source.markets) ?? undefined,
      channels: source.channels ?? undefined,
      tags: source.tags ?? undefined,
      kpiTargets: source.kpiTargets ?? undefined,
      roiTarget: source.roiTarget,
      isTemplate: asTemplate,
      templateId: campaignId,
      parentCampaignId: markets ? campaignId : null, // multi-market variant
      bigIdeaKitId: source.bigIdeaKitId,
      createdBy,
    },
  });

  // Deep clone actions
  for (const action of source.actions) {
    await db.campaignAction.create({
      data: {
        campaignId: campaign.id,
        name: action.name,
        description: action.description,
        actionLine: action.actionLine,
        actionType: action.actionType,
        channel: action.channel,
        budgetAllocated: action.budgetAllocated,
        currency: action.currency,
        vendorBrief: action.vendorBrief,
        kpiTargets: action.kpiTargets ?? undefined,
        specs: action.specs ?? undefined,
        notes: action.notes,
      },
    });
  }

  // Deep clone budget lines
  for (const line of source.budgetLines) {
    await db.campaignBudgetLine.create({
      data: {
        campaignId: campaign.id,
        category: line.category,
        subcategory: line.subcategory,
        label: line.label,
        budgetAllocated: line.budgetAllocated,
        currency: line.currency,
        notes: line.notes,
      },
    });
  }

  // Deep clone milestones (reset status)
  for (const milestone of source.milestones) {
    await db.campaignMilestone.create({
      data: {
        campaignId: campaign.id,
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.dueDate,
        isGateReview: milestone.isGateReview,
        phase: milestone.phase,
        dependencies: milestone.dependencies ?? undefined,
      },
    });
  }

  return campaign;
}

export async function listTemplates(strategyId?: string) {
  return db.campaign.findMany({
    where: {
      isTemplate: true,
      ...(strategyId && { strategyId }),
    },
    orderBy: { updatedAt: "desc" },
  });
}

// ============================================
// SECTION 3: ACTIONS (ATL / BTL / TTL)
// ============================================

export async function createAction(data: CreateActionInput) {
  return db.campaignAction.create({ data });
}

export async function updateAction(data: UpdateActionInput) {
  const { id, ...rest } = data;
  return db.campaignAction.update({ where: { id }, data: rest });
}

export async function deleteAction(id: string) {
  return db.campaignAction.delete({ where: { id } });
}

export async function getActionsByCampaign(campaignId: string, actionLine?: string) {
  return db.campaignAction.findMany({
    where: { campaignId, ...(actionLine && { actionLine }) },
    include: {
      executions: { select: { id: true, name: true, status: true } },
      amplifications: { select: { id: true, name: true, status: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

// ============================================
// SECTION 4: EXECUTIONS (Production Pipeline)
// ============================================

export async function createExecution(data: CreateExecutionInput) {
  return db.campaignExecution.create({ data });
}

export async function updateExecution(data: UpdateExecutionInput) {
  const { id, ...rest } = data;
  return db.campaignExecution.update({ where: { id }, data: rest });
}

export async function transitionExecution(id: string, newStatus: ExecutionStatus) {
  const execution = await db.campaignExecution.findUniqueOrThrow({ where: { id } });
  const currentStatus = execution.status as ExecutionStatus;
  const allowed = EXECUTION_VALID_TRANSITIONS[currentStatus];

  if (!allowed?.includes(newStatus)) {
    throw new Error(
      `Transition invalide: ${currentStatus} → ${newStatus}. Transitions autorisées: ${allowed?.join(", ")}`,
    );
  }

  return db.campaignExecution.update({ where: { id }, data: { status: newStatus } });
}

export async function getExecutionsByCampaign(campaignId: string) {
  return db.campaignExecution.findMany({
    where: { campaignId },
    include: { action: { select: { id: true, name: true, actionLine: true } } },
    orderBy: { createdAt: "asc" },
  });
}

// ============================================
// SECTION 5: AMPLIFICATIONS (Media Buying)
// ============================================

export async function createAmplification(data: CreateAmplificationInput) {
  const totalCost = (data.mediaCost ?? 0) + (data.productionCost ?? 0) + (data.agencyFee ?? 0);
  return db.campaignAmplification.create({ data: { ...data, totalCost } });
}

export async function updateAmplification(data: UpdateAmplificationInput) {
  const { id, ...rest } = data;
  if (rest.mediaCost !== undefined || rest.productionCost !== undefined || rest.agencyFee !== undefined) {
    const current = await db.campaignAmplification.findUniqueOrThrow({ where: { id } });
    const mediaCost = rest.mediaCost ?? current.mediaCost;
    const productionCost = rest.productionCost ?? current.productionCost;
    const agencyFee = rest.agencyFee ?? current.agencyFee;
    (rest as Record<string, unknown>).totalCost = mediaCost + productionCost + agencyFee;
  }
  return db.campaignAmplification.update({ where: { id }, data: rest });
}

export async function updateAmplificationPerformance(data: UpdateAmplificationPerformanceInput) {
  const { id, ...metrics } = data;
  return db.campaignAmplification.update({ where: { id }, data: metrics });
}

export async function getAmplificationsByCampaign(campaignId: string) {
  return db.campaignAmplification.findMany({
    where: { campaignId },
    include: { action: { select: { id: true, name: true, actionLine: true } } },
    orderBy: { flightStart: "asc" },
  });
}

export async function getMediaPlanSummary(campaignId: string) {
  const amps = await db.campaignAmplification.findMany({ where: { campaignId } });
  const totalMediaCost = amps.reduce((sum, a) => sum + a.mediaCost, 0);
  const totalProductionCost = amps.reduce((sum, a) => sum + a.productionCost, 0);
  const totalAgencyFee = amps.reduce((sum, a) => sum + a.agencyFee, 0);
  const totalImpressions = amps.reduce((sum, a) => sum + (a.impressions ?? 0), 0);
  const totalReach = amps.reduce((sum, a) => sum + (a.reach ?? 0), 0);
  const totalClicks = amps.reduce((sum, a) => sum + (a.clicks ?? 0), 0);

  // Group by media type
  const byMediaType: Record<string, { count: number; cost: number; impressions: number }> = {};
  for (const a of amps) {
    if (!byMediaType[a.mediaType]) {
      byMediaType[a.mediaType] = { count: 0, cost: 0, impressions: 0 };
    }
    byMediaType[a.mediaType]!.count++;
    byMediaType[a.mediaType]!.cost += a.totalCost;
    byMediaType[a.mediaType]!.impressions += a.impressions ?? 0;
  }

  return {
    totalAmplifications: amps.length,
    totalMediaCost,
    totalProductionCost,
    totalAgencyFee,
    totalCost: totalMediaCost + totalProductionCost + totalAgencyFee,
    totalImpressions,
    totalReach,
    totalClicks,
    avgCpm: totalImpressions > 0 ? (totalMediaCost / totalImpressions) * 1000 : 0,
    avgCpc: totalClicks > 0 ? totalMediaCost / totalClicks : 0,
    byMediaType,
  };
}

// ============================================
// SECTION 6: TEAM MANAGEMENT
// ============================================

export async function addTeamMember(data: CreateTeamMemberInput) {
  return db.campaignTeamMember.create({ data });
}

export async function updateTeamMember(data: UpdateTeamMemberInput) {
  const { id, ...rest } = data;
  return db.campaignTeamMember.update({ where: { id }, data: rest });
}

export async function removeTeamMember(id: string) {
  return db.campaignTeamMember.delete({ where: { id } });
}

export async function getTeamByCampaign(campaignId: string) {
  return db.campaignTeamMember.findMany({
    where: { campaignId },
    orderBy: [{ isLead: "desc" }, { role: "asc" }],
  });
}

export async function getTeamWorkload(campaignId: string) {
  const members = await db.campaignTeamMember.findMany({ where: { campaignId } });
  return members.map((m) => ({
    ...m,
    estimatedCost: (m.dayRate ?? 0) * (m.estimatedDays ?? 0),
    actualCost: (m.dayRate ?? 0) * (m.actualDays ?? 0),
    budgetVariance: (m.dayRate ?? 0) * ((m.estimatedDays ?? 0) - (m.actualDays ?? 0)),
  }));
}

// ============================================
// SECTION 7: MILESTONES & TIMELINE
// ============================================

export async function createMilestone(data: CreateMilestoneInput) {
  return db.campaignMilestone.create({ data });
}

export async function updateMilestone(data: UpdateMilestoneInput) {
  const { id, ...rest } = data;
  return db.campaignMilestone.update({ where: { id }, data: rest });
}

export async function deleteMilestone(id: string) {
  return db.campaignMilestone.delete({ where: { id } });
}

export async function getMilestonesByCampaign(campaignId: string) {
  return db.campaignMilestone.findMany({
    where: { campaignId },
    orderBy: { dueDate: "asc" },
  });
}

export async function checkGateReviews(campaignId: string, phase: string) {
  return db.campaignMilestone.findMany({
    where: {
      campaignId,
      isGateReview: true,
      phase,
      status: { notIn: ["COMPLETED", "SKIPPED"] },
    },
  });
}

// ============================================
// SECTION 8: BUDGET & FINANCIAL
// ============================================

export async function addBudgetLine(data: CreateBudgetLineInput) {
  const line = await db.campaignBudgetLine.create({ data });
  await recalculateBudgetAllocated(data.campaignId);
  return line;
}

export async function updateBudgetLine(data: UpdateBudgetLineInput) {
  const { id, ...rest } = data;
  const line = await db.campaignBudgetLine.update({ where: { id }, data: rest });
  await recalculateBudgetAllocated(line.campaignId);
  return line;
}

export async function deleteBudgetLine(id: string) {
  const line = await db.campaignBudgetLine.delete({ where: { id } });
  await recalculateBudgetAllocated(line.campaignId);
  return line;
}

export async function getBudgetByCampaign(campaignId: string) {
  return db.campaignBudgetLine.findMany({
    where: { campaignId },
    orderBy: { category: "asc" },
  });
}

export async function getBudgetSummary(campaignId: string) {
  const lines = await db.campaignBudgetLine.findMany({ where: { campaignId } });
  const campaign = await db.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    select: { totalBudget: true, currency: true },
  });

  const byCategory: Record<string, { allocated: number; committed: number; spent: number }> = {};
  let totalAllocated = 0;
  let totalCommitted = 0;
  let totalSpent = 0;

  for (const line of lines) {
    totalAllocated += line.budgetAllocated;
    totalCommitted += line.budgetCommitted;
    totalSpent += line.budgetSpent;

    if (!byCategory[line.category]) {
      byCategory[line.category] = { allocated: 0, committed: 0, spent: 0 };
    }
    byCategory[line.category]!.allocated += line.budgetAllocated;
    byCategory[line.category]!.committed += line.budgetCommitted;
    byCategory[line.category]!.spent += line.budgetSpent;
  }

  return {
    totalBudget: campaign.totalBudget ?? 0,
    totalAllocated,
    totalCommitted,
    totalSpent,
    remaining: (campaign.totalBudget ?? 0) - totalSpent,
    variance: (campaign.totalBudget ?? 0) - totalAllocated,
    currency: campaign.currency,
    byCategory,
    lineCount: lines.length,
  };
}

/** Recalculate Campaign.budgetAllocated + budgetSpent from budget lines */
async function recalculateBudgetAllocated(campaignId: string) {
  const agg = await db.campaignBudgetLine.aggregate({
    where: { campaignId },
    _sum: { budgetAllocated: true, budgetSpent: true },
  });
  await db.campaign.update({
    where: { id: campaignId },
    data: {
      budgetAllocated: agg._sum.budgetAllocated ?? 0,
      budgetSpent: agg._sum.budgetSpent ?? 0,
    },
  });
}

// ============================================
// SECTION 9: APPROVALS
// ============================================

export async function createApproval(data: CreateApprovalInput, requestedBy: string) {
  return db.campaignApproval.create({
    data: { ...data, requestedBy },
  });
}

export async function resolveApproval(data: ResolveApprovalInput, approvedBy: string) {
  const { id, status, rejectionReason, revisionNotes } = data;
  const approval = await db.campaignApproval.findUniqueOrThrow({ where: { id } });

  const updateData: Record<string, unknown> = {
    status,
    approvedBy,
    approvedAt: new Date(),
  };

  if (status === "REJECTED" || status === "REVISION_REQUESTED") {
    updateData.rejectionReason = rejectionReason;
    updateData.revisionNotes = revisionNotes;
    // Increment round if rejected
    updateData.round = approval.round + 1;
    updateData.approvedAt = null; // Not actually approved
  }

  return db.campaignApproval.update({ where: { id }, data: updateData });
}

export async function getApprovalsByCampaign(campaignId: string) {
  return db.campaignApproval.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingApprovals(userId: string) {
  return db.campaignApproval.findMany({
    where: {
      campaign: { strategy: { userId } },
      status: "PENDING",
    },
    include: {
      campaign: { select: { id: true, name: true, code: true } },
    },
    orderBy: { deadline: "asc" },
  });
}

// ============================================
// SECTION 10: ASSETS
// ============================================

export async function addAsset(data: CreateAssetInput) {
  return db.campaignAsset.create({ data });
}

export async function updateAsset(data: UpdateAssetInput) {
  const { id, ...rest } = data;
  return db.campaignAsset.update({ where: { id }, data: rest });
}

export async function getAssetsByCampaign(campaignId: string, assetType?: string) {
  return db.campaignAsset.findMany({
    where: { campaignId, ...(assetType && { assetType }) },
    orderBy: { createdAt: "desc" },
  });
}

export async function publishAssetToVault(assetId: string, userId: string) {
  const asset = await db.campaignAsset.findUniqueOrThrow({
    where: { id: assetId },
    include: { campaign: { select: { strategyId: true } } },
  });

  // Create BrandAsset from campaign asset
  const brandAsset = await db.brandAsset.create({
    data: {
      strategyId: asset.campaign.strategyId,
      userId,
      name: asset.name,
      category: asset.assetType === "KEY_VISUAL" ? "PHOTO" : asset.assetType === "VIDEO" ? "VIDEO" : "DOCUMENT",
      fileUrl: asset.fileUrl,
      fileType: asset.fileType,
      fileSize: asset.fileSize,
      thumbnailUrl: asset.thumbnailUrl,
      status: "ACTIVE",
    },
  });

  // Update campaign asset with brand vault reference
  await db.campaignAsset.update({
    where: { id: assetId },
    data: { brandAssetId: brandAsset.id, status: "FINAL" },
  });

  return brandAsset;
}

// ============================================
// SECTION 11: BRIEFS
// ============================================

export async function createBrief(data: CreateBriefInput) {
  return db.campaignBrief.create({
    data: {
      ...data,
      content: data.content ?? {},
    },
  });
}

export async function updateBrief(data: UpdateBriefInput) {
  const { id, ...rest } = data;
  return db.campaignBrief.update({ where: { id }, data: rest });
}

export async function sendBrief(briefId: string) {
  return db.campaignBrief.update({
    where: { id: briefId },
    data: { status: "SENT", sentAt: new Date() },
  });
}

export async function getBriefsByCampaign(campaignId: string) {
  return db.campaignBrief.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================
// SECTION 12: REPORTS
// ============================================

export async function createReport(data: CreateReportInput) {
  return db.campaignReport.create({
    data: {
      ...data,
      content: data.content ?? {},
      metrics: data.metrics ?? undefined,
      aiInsights: data.aiInsights ?? undefined,
      period: data.period ?? undefined,
    },
  });
}

export async function publishReport(id: string, publishedBy: string) {
  return db.campaignReport.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date(), publishedBy },
  });
}

export async function getReportsByCampaign(campaignId: string) {
  return db.campaignReport.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================
// SECTION 13: JUNCTION LINKS
// ============================================

export async function linkMission(data: LinkMissionInput) {
  return db.campaignMission.create({ data });
}

export async function unlinkMission(campaignId: string, missionId: string) {
  return db.campaignMission.delete({
    where: { campaignId_missionId: { campaignId, missionId } },
  });
}

export async function linkPublication(data: LinkPublicationInput) {
  return db.campaignPublication.create({ data });
}

export async function unlinkPublication(campaignId: string, publicationId: string) {
  return db.campaignPublication.delete({
    where: { campaignId_publicationId: { campaignId, publicationId } },
  });
}

export async function linkSignal(data: LinkSignalInput) {
  return db.campaignSignal.create({ data });
}

export async function unlinkSignal(campaignId: string, signalId: string) {
  return db.campaignSignal.delete({
    where: { campaignId_signalId: { campaignId, signalId } },
  });
}

// ============================================
// SECTION 14: DEPENDENCIES
// ============================================

export async function addDependency(data: CreateDependencyInput) {
  return db.campaignDependency.create({ data });
}

export async function removeDependency(id: string) {
  return db.campaignDependency.delete({ where: { id } });
}

export async function getDependenciesByCampaign(campaignId: string) {
  const [outgoing, incoming] = await Promise.all([
    db.campaignDependency.findMany({
      where: { sourceCampaignId: campaignId },
      include: { targetCampaign: { select: { id: true, name: true, status: true } } },
    }),
    db.campaignDependency.findMany({
      where: { targetCampaignId: campaignId },
      include: { sourceCampaign: { select: { id: true, name: true, status: true } } },
    }),
  ]);
  return { outgoing, incoming };
}
