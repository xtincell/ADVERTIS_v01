// =============================================================================
// LIB L.30 — Campaign Manager Schemas
// =============================================================================
// Zod validation schemas for the Campaign Manager module (360° Campaign Ops).
// Covers: campaign CRUD, state machine transitions, actions (ATL/BTL/TTL),
// executions, amplifications, team, milestones, budget, approvals, assets,
// briefs, reports, junction links (mission/publication/signal), dependencies.
//
// Used by: campaign tRPC router, campaign UI components, campaign services.
// =============================================================================

import { z } from "zod";
import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_TYPES,
  ACTION_LINES,
  ATL_TYPES,
  BTL_TYPES,
  TTL_TYPES,
  EXECUTION_TYPES,
  EXECUTION_STATUSES,
  AMPLIFICATION_MEDIA_TYPES,
  AMPLIFICATION_STATUSES,
  CAMPAIGN_BUDGET_CATEGORIES,
  CAMPAIGN_APPROVAL_TYPES,
  CAMPAIGN_APPROVAL_STATUSES,
  CAMPAIGN_TEAM_ROLES,
  CAMPAIGN_BRIEF_TYPES,
  CAMPAIGN_REPORT_TYPES,
  CAMPAIGN_ASSET_TYPES,
  FUNNEL_STAGES,
  CAMPAIGN_DEPENDENCY_TYPES,
  CAMPAIGN_ACTION_STATUSES,
} from "~/lib/constants";

// ============================================
// CAMPAIGN SCHEMAS
// ============================================

export const CreateCampaignSchema = z.object({
  strategyId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  campaignType: z.enum(CAMPAIGN_TYPES),
  priority: z.enum(["P0", "P1", "P2"]).default("P1"),

  // Strategic context
  bigIdea: z.string().optional(),
  axeCreatif: z.string().optional(),
  pisteCreative: z.string().optional(),
  insight: z.string().optional(),
  promesse: z.string().optional(),
  targetAudience: z.any().optional(),
  positioning: z.string().optional(),

  // Timeline
  briefDate: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  launchDate: z.coerce.date().optional(),

  // Budget
  totalBudget: z.number().min(0).optional(),
  currency: z.string().default("XAF"),

  // Categorization
  funnelStage: z.enum(FUNNEL_STAGES).optional(),
  markets: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  // KPIs
  kpiTargets: z.array(z.object({
    name: z.string(),
    target: z.number(),
    unit: z.string(),
  })).optional(),
  roiTarget: z.number().optional(),

  // Links
  bigIdeaKitId: z.string().optional(),
});
export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;

export const UpdateCampaignSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  campaignType: z.enum(CAMPAIGN_TYPES).optional(),
  priority: z.enum(["P0", "P1", "P2"]).optional(),

  bigIdea: z.string().optional(),
  axeCreatif: z.string().optional(),
  pisteCreative: z.string().optional(),
  insight: z.string().optional(),
  promesse: z.string().optional(),
  targetAudience: z.any().optional(),
  positioning: z.string().optional(),

  briefDate: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  launchDate: z.coerce.date().optional(),

  totalBudget: z.number().min(0).optional(),
  currency: z.string().optional(),
  funnelStage: z.enum(FUNNEL_STAGES).optional(),
  markets: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  kpiTargets: z.array(z.object({
    name: z.string(),
    target: z.number(),
    unit: z.string(),
  })).optional(),
  kpiResults: z.array(z.object({
    name: z.string(),
    actual: z.number(),
    unit: z.string(),
    variance: z.number().optional(),
  })).optional(),
  roiTarget: z.number().optional(),
  roiActual: z.number().optional(),
  postCampaignSummary: z.string().optional(),
  bigIdeaKitId: z.string().optional(),
});
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;

export const TransitionCampaignSchema = z.object({
  id: z.string().min(1),
  newStatus: z.enum(CAMPAIGN_STATUSES),
});
export type TransitionCampaignInput = z.infer<typeof TransitionCampaignSchema>;

export const DuplicateCampaignSchema = z.object({
  campaignId: z.string().min(1),
  name: z.string().min(1).max(200),
  asTemplate: z.boolean().default(false),
  markets: z.array(z.string()).optional(), // For multi-market variant
});
export type DuplicateCampaignInput = z.infer<typeof DuplicateCampaignSchema>;

export const CampaignSearchSchema = z.object({
  strategyId: z.string().optional(),
  query: z.string().optional(),
  status: z.enum(CAMPAIGN_STATUSES).optional(),
  campaignType: z.enum(CAMPAIGN_TYPES).optional(),
  funnelStage: z.enum(FUNNEL_STAGES).optional(),
  isTemplate: z.boolean().optional(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
});
export type CampaignSearchInput = z.infer<typeof CampaignSearchSchema>;

export const CampaignCalendarSchema = z.object({
  strategyId: z.string().optional(),
  year: z.number().int().min(2020).max(2040),
});
export type CampaignCalendarInput = z.infer<typeof CampaignCalendarSchema>;

// ============================================
// ACTION SCHEMAS (ATL / BTL / TTL)
// ============================================

const allActionTypes = [...ATL_TYPES, ...BTL_TYPES, ...TTL_TYPES] as const;

export const CreateActionSchema = z.object({
  campaignId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  actionLine: z.enum(ACTION_LINES),
  actionType: z.enum(allActionTypes),
  channel: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budgetAllocated: z.number().min(0).default(0),
  currency: z.string().default("XAF"),
  vendorId: z.string().optional(),
  vendorName: z.string().optional(),
  vendorBrief: z.string().optional(),
  kpiTargets: z.array(z.object({
    name: z.string(),
    target: z.number(),
    unit: z.string(),
  })).optional(),
  specs: z.any().optional(),
  notes: z.string().optional(),
});
export type CreateActionInput = z.infer<typeof CreateActionSchema>;

export const UpdateActionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  actionLine: z.enum(ACTION_LINES).optional(),
  actionType: z.enum(allActionTypes).optional(),
  channel: z.string().optional(),
  status: z.enum(CAMPAIGN_ACTION_STATUSES).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budgetAllocated: z.number().min(0).optional(),
  budgetSpent: z.number().min(0).optional(),
  vendorId: z.string().optional(),
  vendorName: z.string().optional(),
  vendorBrief: z.string().optional(),
  kpiTargets: z.any().optional(),
  kpiResults: z.any().optional(),
  specs: z.any().optional(),
  notes: z.string().optional(),
});
export type UpdateActionInput = z.infer<typeof UpdateActionSchema>;

// ============================================
// EXECUTION SCHEMAS
// ============================================

export const CreateExecutionSchema = z.object({
  campaignId: z.string().min(1),
  actionId: z.string().optional(),
  name: z.string().min(1).max(200),
  executionType: z.enum(EXECUTION_TYPES),
  format: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  vendorId: z.string().optional(),
  vendorName: z.string().optional(),
  location: z.string().optional(),
  geoCoordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  city: z.string().optional(),
  market: z.string().optional(),
  unitCost: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  currency: z.string().default("XAF"),
  specs: z.any().optional(),
  notes: z.string().optional(),
});
export type CreateExecutionInput = z.infer<typeof CreateExecutionSchema>;

export const UpdateExecutionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  executionType: z.enum(EXECUTION_TYPES).optional(),
  format: z.string().optional(),
  quantity: z.number().int().min(1).optional(),
  devisAmount: z.number().min(0).optional(),
  devisApprovedAt: z.coerce.date().optional(),
  batFileUrl: z.string().optional(),
  batApprovedAt: z.coerce.date().optional(),
  deliveryDate: z.coerce.date().optional(),
  installDate: z.coerce.date().optional(),
  vendorId: z.string().optional(),
  vendorName: z.string().optional(),
  location: z.string().optional(),
  geoCoordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  city: z.string().optional(),
  market: z.string().optional(),
  unitCost: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  specs: z.any().optional(),
  notes: z.string().optional(),
  fileUrls: z.array(z.string()).optional(),
});
export type UpdateExecutionInput = z.infer<typeof UpdateExecutionSchema>;

export const TransitionExecutionSchema = z.object({
  id: z.string().min(1),
  newStatus: z.enum(EXECUTION_STATUSES),
});
export type TransitionExecutionInput = z.infer<typeof TransitionExecutionSchema>;

// ============================================
// AMPLIFICATION SCHEMAS (Media Buying)
// ============================================

export const CreateAmplificationSchema = z.object({
  campaignId: z.string().min(1),
  actionId: z.string().optional(),
  name: z.string().min(1).max(200),
  mediaType: z.enum(AMPLIFICATION_MEDIA_TYPES),
  platform: z.string().optional(),
  format: z.string().optional(),
  placement: z.string().optional(),
  flightStart: z.coerce.date().optional(),
  flightEnd: z.coerce.date().optional(),
  frequency: z.number().int().min(0).optional(),
  grp: z.number().min(0).optional(),
  mediaCost: z.number().min(0).default(0),
  productionCost: z.number().min(0).default(0),
  agencyFee: z.number().min(0).default(0),
  currency: z.string().default("XAF"),
  cpm: z.number().min(0).optional(),
  cpc: z.number().min(0).optional(),
  cpv: z.number().min(0).optional(),
  regieId: z.string().optional(),
  regieName: z.string().optional(),
  orderNumber: z.string().optional(),
  notes: z.string().optional(),
  creativeUrls: z.array(z.string()).optional(),
});
export type CreateAmplificationInput = z.infer<typeof CreateAmplificationSchema>;

export const UpdateAmplificationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  mediaType: z.enum(AMPLIFICATION_MEDIA_TYPES).optional(),
  platform: z.string().optional(),
  format: z.string().optional(),
  placement: z.string().optional(),
  flightStart: z.coerce.date().optional(),
  flightEnd: z.coerce.date().optional(),
  frequency: z.number().int().min(0).optional(),
  grp: z.number().min(0).optional(),
  mediaCost: z.number().min(0).optional(),
  productionCost: z.number().min(0).optional(),
  agencyFee: z.number().min(0).optional(),
  cpm: z.number().min(0).optional(),
  cpc: z.number().min(0).optional(),
  cpv: z.number().min(0).optional(),
  status: z.enum(AMPLIFICATION_STATUSES).optional(),
  regieId: z.string().optional(),
  regieName: z.string().optional(),
  orderNumber: z.string().optional(),
  notes: z.string().optional(),
  creativeUrls: z.array(z.string()).optional(),
});
export type UpdateAmplificationInput = z.infer<typeof UpdateAmplificationSchema>;

export const UpdateAmplificationPerformanceSchema = z.object({
  id: z.string().min(1),
  impressions: z.number().int().min(0).optional(),
  reach: z.number().int().min(0).optional(),
  clicks: z.number().int().min(0).optional(),
  views: z.number().int().min(0).optional(),
  conversions: z.number().int().min(0).optional(),
  engagements: z.number().int().min(0).optional(),
  ctr: z.number().min(0).optional(),
  vtr: z.number().min(0).optional(),
  conversionRate: z.number().min(0).optional(),
});
export type UpdateAmplificationPerformanceInput = z.infer<typeof UpdateAmplificationPerformanceSchema>;

// ============================================
// TEAM MEMBER SCHEMAS
// ============================================

export const CreateTeamMemberSchema = z.object({
  campaignId: z.string().min(1),
  userId: z.string().optional(),
  talentProfileId: z.string().optional(),
  externalName: z.string().optional(),
  externalEmail: z.string().email().optional(),
  externalCompany: z.string().optional(),
  role: z.enum(CAMPAIGN_TEAM_ROLES),
  responsibility: z.string().optional(),
  isLead: z.boolean().default(false),
  allocation: z.number().min(0).max(100).optional(),
  dayRate: z.number().min(0).optional(),
  estimatedDays: z.number().min(0).optional(),
});
export type CreateTeamMemberInput = z.infer<typeof CreateTeamMemberSchema>;

export const UpdateTeamMemberSchema = z.object({
  id: z.string().min(1),
  role: z.enum(CAMPAIGN_TEAM_ROLES).optional(),
  responsibility: z.string().optional(),
  isLead: z.boolean().optional(),
  allocation: z.number().min(0).max(100).optional(),
  dayRate: z.number().min(0).optional(),
  estimatedDays: z.number().min(0).optional(),
  actualDays: z.number().min(0).optional(),
  status: z.enum(["ASSIGNED", "ACTIVE", "COMPLETED", "RELEASED"]).optional(),
});
export type UpdateTeamMemberInput = z.infer<typeof UpdateTeamMemberSchema>;

// ============================================
// MILESTONE SCHEMAS
// ============================================

export const CreateMilestoneSchema = z.object({
  campaignId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  isGateReview: z.boolean().default(false),
  assignedTo: z.string().optional(),
  phase: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});
export type CreateMilestoneInput = z.infer<typeof CreateMilestoneSchema>;

export const UpdateMilestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE", "SKIPPED"]).optional(),
  isGateReview: z.boolean().optional(),
  assignedTo: z.string().optional(),
  phase: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneSchema>;

// ============================================
// BUDGET LINE SCHEMAS
// ============================================

export const CreateBudgetLineSchema = z.object({
  campaignId: z.string().min(1),
  category: z.enum(CAMPAIGN_BUDGET_CATEGORIES),
  subcategory: z.string().optional(),
  label: z.string().min(1),
  budgetAllocated: z.number().min(0).default(0),
  currency: z.string().default("XAF"),
  notes: z.string().optional(),
});
export type CreateBudgetLineInput = z.infer<typeof CreateBudgetLineSchema>;

export const UpdateBudgetLineSchema = z.object({
  id: z.string().min(1),
  category: z.enum(CAMPAIGN_BUDGET_CATEGORIES).optional(),
  subcategory: z.string().optional(),
  label: z.string().min(1).optional(),
  budgetAllocated: z.number().min(0).optional(),
  budgetCommitted: z.number().min(0).optional(),
  budgetSpent: z.number().min(0).optional(),
  notes: z.string().optional(),
  invoiceId: z.string().optional(),
  invoiceItemId: z.string().optional(),
});
export type UpdateBudgetLineInput = z.infer<typeof UpdateBudgetLineSchema>;

// ============================================
// APPROVAL SCHEMAS
// ============================================

export const CreateApprovalSchema = z.object({
  campaignId: z.string().min(1),
  approvalType: z.enum(CAMPAIGN_APPROVAL_TYPES),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  deadline: z.coerce.date().optional(),
  attachmentUrls: z.array(z.string()).optional(),
});
export type CreateApprovalInput = z.infer<typeof CreateApprovalSchema>;

export const ResolveApprovalSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED", "REVISION_REQUESTED"]),
  rejectionReason: z.string().optional(),
  revisionNotes: z.string().optional(),
});
export type ResolveApprovalInput = z.infer<typeof ResolveApprovalSchema>;

// ============================================
// ASSET SCHEMAS
// ============================================

export const CreateAssetSchema = z.object({
  campaignId: z.string().min(1),
  name: z.string().min(1).max(200),
  assetType: z.enum(CAMPAIGN_ASSET_TYPES),
  fileUrl: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().min(0).default(0),
  thumbnailUrl: z.string().optional(),
  dimensions: z.object({ width: z.number(), height: z.number() }).optional(),
  duration: z.number().int().min(0).optional(),
  specs: z.any().optional(),
  tags: z.array(z.string()).optional(),
  gloryOutputId: z.string().optional(),
});
export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;

export const UpdateAssetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  status: z.enum(["DRAFT", "REVIEW", "APPROVED", "FINAL", "ARCHIVED"]).optional(),
  tags: z.array(z.string()).optional(),
  specs: z.any().optional(),
});
export type UpdateAssetInput = z.infer<typeof UpdateAssetSchema>;

// ============================================
// BRIEF SCHEMAS
// ============================================

export const CreateBriefSchema = z.object({
  campaignId: z.string().min(1),
  briefType: z.enum(CAMPAIGN_BRIEF_TYPES),
  title: z.string().min(1).max(200),
  content: z.any(), // Structured JSON
  recipientType: z.enum(["INTERNAL", "FREELANCE", "VENDOR", "MEDIA_REP"]).optional(),
  recipientId: z.string().optional(),
  recipientName: z.string().optional(),
});
export type CreateBriefInput = z.infer<typeof CreateBriefSchema>;

export const UpdateBriefSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  content: z.any().optional(),
  status: z.enum(["DRAFT", "SENT", "ACKNOWLEDGED", "IN_PROGRESS", "COMPLETED"]).optional(),
});
export type UpdateBriefInput = z.infer<typeof UpdateBriefSchema>;

// ============================================
// REPORT SCHEMAS
// ============================================

export const CreateReportSchema = z.object({
  campaignId: z.string().min(1),
  reportType: z.enum(CAMPAIGN_REPORT_TYPES),
  title: z.string().min(1).max(200),
  content: z.any(),
  summary: z.string().optional(),
  period: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }).optional(),
  metrics: z.any().optional(),
  aiInsights: z.any().optional(),
  generatedBy: z.enum(["manual", "ai", "system"]).default("manual"),
});
export type CreateReportInput = z.infer<typeof CreateReportSchema>;

// ============================================
// JUNCTION / LINK SCHEMAS
// ============================================

export const LinkMissionSchema = z.object({
  campaignId: z.string().min(1),
  missionId: z.string().min(1),
  role: z.string().optional(),
  notes: z.string().optional(),
});
export type LinkMissionInput = z.infer<typeof LinkMissionSchema>;

export const LinkPublicationSchema = z.object({
  campaignId: z.string().min(1),
  publicationId: z.string().min(1),
  notes: z.string().optional(),
});
export type LinkPublicationInput = z.infer<typeof LinkPublicationSchema>;

export const LinkSignalSchema = z.object({
  campaignId: z.string().min(1),
  signalId: z.string().min(1),
  impact: z.string().optional(),
});
export type LinkSignalInput = z.infer<typeof LinkSignalSchema>;

export const CreateDependencySchema = z.object({
  sourceCampaignId: z.string().min(1),
  targetCampaignId: z.string().min(1),
  dependencyType: z.enum(CAMPAIGN_DEPENDENCY_TYPES),
  notes: z.string().optional(),
});
export type CreateDependencyInput = z.infer<typeof CreateDependencySchema>;
