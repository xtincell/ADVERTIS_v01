// =============================================================================
// MCP Server — Operations ("Le Bras")
// =============================================================================
// Campaign lifecycle management: CRUD, state machine, actions, budget, team,
// briefs, approvals, duplication. 12 tools + 5 resources.
// =============================================================================

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAuthContext } from "../auth";
import { resolveStrategyId } from "../create-server";
import { formatResult, formatError, formatResource } from "../utils";

// ---------------------------------------------------------------------------
// Lazy service import
// ---------------------------------------------------------------------------

async function loadCampaignManager() {
  return import("~/server/services/campaign-manager");
}

/** Verify the authenticated user owns the strategy that a campaign belongs to.
 *  P1-14: Uses a single generic error to prevent campaign ID enumeration. */
async function verifyCampaignAccess(campaignId: string, ctx: McpAuthContext): Promise<void> {
  try {
    const { db } = await import("~/server/db");
    const { verifyStrategyAccess } = await import("../auth");
    const campaign = await db.campaign.findUniqueOrThrow({
      where: { id: campaignId },
      select: { strategyId: true },
    });
    await verifyStrategyAccess(ctx.userId, campaign.strategyId);
  } catch {
    throw new Error("Campaign not found or access denied");
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerOperationsServer(
  server: McpServer,
  ctx: McpAuthContext,
): void {
  // =========================================================================
  // TOOLS
  // =========================================================================

  // --- create_campaign ---
  server.registerTool(
    "create_campaign",
    {
      description:
        "Create a new campaign for a strategy. Returns the full campaign object with generated code.",
      inputSchema: {
        strategyId: z.string().optional().describe("Strategy ID (uses API key scope if omitted)"),
        name: z.string().describe("Campaign name"),
        campaignType: z
          .enum(["LAUNCH", "RECURRING", "EVENT", "ACTIVATION", "INSTITUTIONAL", "TACTICAL"])
          .describe("Campaign type"),
        description: z.string().optional().describe("Campaign description"),
        startDate: z.string().optional().describe("Start date (ISO string)"),
        endDate: z.string().optional().describe("End date (ISO string)"),
        totalBudget: z.number().optional().describe("Total budget amount"),
        currency: z.string().optional().describe("Currency code (default: XAF)"),
      },
    },
    async (args) => {
      try {
        const cm = await loadCampaignManager();
        const strategyId = await resolveStrategyId(args.strategyId, ctx);
        const campaign = await cm.createCampaign(
          {
            strategyId,
            name: args.name,
            campaignType: args.campaignType,
            description: args.description,
            startDate: args.startDate ? new Date(args.startDate) : undefined,
            endDate: args.endDate ? new Date(args.endDate) : undefined,
            totalBudget: args.totalBudget,
            currency: args.currency,
          } as Parameters<typeof cm.createCampaign>[0],
          ctx.userId,
        );
        return formatResult(campaign);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- update_campaign ---
  server.registerTool(
    "update_campaign",
    {
      description: "Update fields of an existing campaign.",
      inputSchema: {
        campaignId: z.string().describe("Campaign ID to update"),
        name: z.string().optional(),
        description: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        totalBudget: z.number().optional(),
      },
    },
    async (args) => {
      try {
        await verifyCampaignAccess(args.campaignId, ctx);
        const cm = await loadCampaignManager();
        const { campaignId, ...updates } = args;
        const campaign = await cm.updateCampaign({
          id: campaignId,
          ...updates,
          startDate: updates.startDate ? new Date(updates.startDate) : undefined,
          endDate: updates.endDate ? new Date(updates.endDate) : undefined,
        } as Parameters<typeof cm.updateCampaign>[0]);
        return formatResult(campaign);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- transition_campaign ---
  server.registerTool(
    "transition_campaign",
    {
      description:
        "Transition a campaign to a new status. Validates against the state machine.",
      inputSchema: {
        campaignId: z.string().describe("Campaign ID"),
        newStatus: z
          .enum([
            "BRIEF_DRAFT", "BRIEF_VALIDATED", "PLANNING", "CREATIVE_DEV",
            "PRODUCTION", "PRE_PRODUCTION", "APPROVAL", "READY_TO_LAUNCH",
            "LIVE", "POST_CAMPAIGN", "ARCHIVED", "CANCELLED",
          ])
          .describe("Target status"),
      },
    },
    async (args) => {
      try {
        await verifyCampaignAccess(args.campaignId, ctx);
        const cm = await loadCampaignManager();
        const campaign = await cm.transitionCampaign(
          args.campaignId,
          args.newStatus as Parameters<typeof cm.transitionCampaign>[1],
          ctx.userId,
        );
        return formatResult(campaign);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_campaign ---
  server.registerTool(
    "get_campaign",
    {
      description: "Get a campaign by ID with all relations (actions, team, budget, etc.).",
      inputSchema: {
        campaignId: z.string().describe("Campaign ID"),
      },
    },
    async (args) => {
      try {
        await verifyCampaignAccess(args.campaignId, ctx);
        const cm = await loadCampaignManager();
        const campaign = await cm.getCampaignById(args.campaignId);
        return formatResult(campaign);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- search_campaigns ---
  server.registerTool(
    "search_campaigns",
    {
      description: "Search campaigns with filters. Returns paginated results.",
      inputSchema: {
        strategyId: z.string().optional().describe("Filter by strategy"),
        status: z.string().optional().describe("Filter by status"),
        campaignType: z.string().optional().describe("Filter by type"),
        search: z.string().optional().describe("Free-text search"),
      },
    },
    async (args) => {
      try {
        const cm = await loadCampaignManager();
        const campaigns = await cm.searchCampaigns(ctx.userId, args as Parameters<typeof cm.searchCampaigns>[1]);
        return formatResult(campaigns);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_dashboard ---
  server.registerTool(
    "get_dashboard",
    {
      description:
        "Get the campaign dashboard overview: active campaigns, pending approvals, upcoming milestones.",
      inputSchema: {},
    },
    async () => {
      try {
        const cm = await loadCampaignManager();
        const dashboard = await cm.getCampaignDashboard(ctx.userId);
        return formatResult(dashboard);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- manage_actions ---
  server.registerTool(
    "manage_actions",
    {
      description:
        "Manage campaign actions (ATL/BTL/TTL). Supports create, update, delete, and list operations.",
      inputSchema: {
        campaignId: z.string().describe("Campaign ID"),
        operation: z.enum(["create", "update", "delete", "list"]).describe("Operation to perform"),
        actionId: z.string().optional().describe("Action ID (for update/delete)"),
        data: z
          .record(z.unknown())
          .optional()
          .describe("Action data (for create/update): { name, actionLine, channel, ... }"),
      },
    },
    async (args) => {
      try {
        await verifyCampaignAccess(args.campaignId, ctx);
        const cm = await loadCampaignManager();
        switch (args.operation) {
          case "create":
            return formatResult(
              await cm.createAction({
                campaignId: args.campaignId,
                ...args.data,
              } as Parameters<typeof cm.createAction>[0]),
            );
          case "update":
            if (!args.actionId) throw new Error("actionId is required for update");
            return formatResult(
              await cm.updateAction({
                id: args.actionId,
                ...args.data,
              } as Parameters<typeof cm.updateAction>[0]),
            );
          case "delete":
            if (!args.actionId) throw new Error("actionId is required for delete");
            return formatResult(await cm.deleteAction(args.actionId));
          case "list":
            return formatResult(await cm.getActionsByCampaign(args.campaignId));
        }
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- manage_budget ---
  server.registerTool(
    "manage_budget",
    {
      description:
        "Manage campaign budget lines. Supports add, update, delete, and summary operations.",
      inputSchema: {
        campaignId: z.string().describe("Campaign ID"),
        operation: z.enum(["add", "update", "delete", "summary"]).describe("Operation to perform"),
        budgetLineId: z.string().optional().describe("Budget line ID (for update/delete)"),
        data: z
          .record(z.unknown())
          .optional()
          .describe("Budget line data: { label, category, planned, actual, ... }"),
      },
    },
    async (args) => {
      try {
        await verifyCampaignAccess(args.campaignId, ctx);
        const cm = await loadCampaignManager();
        switch (args.operation) {
          case "add":
            return formatResult(
              await cm.addBudgetLine({
                campaignId: args.campaignId,
                ...args.data,
              } as Parameters<typeof cm.addBudgetLine>[0]),
            );
          case "update":
            if (!args.budgetLineId) throw new Error("budgetLineId is required for update");
            return formatResult(
              await cm.updateBudgetLine({
                id: args.budgetLineId,
                ...args.data,
              } as Parameters<typeof cm.updateBudgetLine>[0]),
            );
          case "delete":
            if (!args.budgetLineId) throw new Error("budgetLineId is required for delete");
            return formatResult(await cm.deleteBudgetLine(args.budgetLineId));
          case "summary":
            return formatResult(await cm.getBudgetSummary(args.campaignId));
        }
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- manage_team ---
  server.registerTool(
    "manage_team",
    {
      description: "Manage campaign team members. Supports add, update, remove, and list operations.",
      inputSchema: {
        campaignId: z.string().describe("Campaign ID"),
        operation: z.enum(["add", "update", "remove", "list"]).describe("Operation to perform"),
        memberId: z.string().optional().describe("Team member record ID (for update/remove)"),
        data: z
          .record(z.unknown())
          .optional()
          .describe("Team member data: { userId, role, department, ... }"),
      },
    },
    async (args) => {
      try {
        await verifyCampaignAccess(args.campaignId, ctx);
        const cm = await loadCampaignManager();
        switch (args.operation) {
          case "add":
            return formatResult(
              await cm.addTeamMember({
                campaignId: args.campaignId,
                ...args.data,
              } as Parameters<typeof cm.addTeamMember>[0]),
            );
          case "update":
            if (!args.memberId) throw new Error("memberId is required for update");
            return formatResult(
              await cm.updateTeamMember({
                id: args.memberId,
                ...args.data,
              } as Parameters<typeof cm.updateTeamMember>[0]),
            );
          case "remove":
            if (!args.memberId) throw new Error("memberId is required for remove");
            return formatResult(await cm.removeTeamMember(args.memberId));
          case "list":
            return formatResult(await cm.getTeamByCampaign(args.campaignId));
        }
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- manage_approvals ---
  server.registerTool(
    "manage_approvals",
    {
      description: "Manage approvals: create, resolve (approve/reject), or list pending.",
      inputSchema: {
        operation: z.enum(["create", "resolve", "list_pending"]).describe("Operation"),
        campaignId: z.string().optional().describe("Campaign ID (for create)"),
        approvalId: z.string().optional().describe("Approval ID (for resolve)"),
        data: z
          .record(z.unknown())
          .optional()
          .describe("Approval data: { type, itemId, decision, comment, ... }"),
      },
    },
    async (args) => {
      try {
        const cm = await loadCampaignManager();
        switch (args.operation) {
          case "create":
            if (!args.campaignId) throw new Error("campaignId is required for create");
            return formatResult(
              await cm.createApproval(
                { campaignId: args.campaignId, ...args.data } as Parameters<typeof cm.createApproval>[0],
                ctx.userId,
              ),
            );
          case "resolve":
            if (!args.approvalId) throw new Error("approvalId is required for resolve");
            return formatResult(
              await cm.resolveApproval(
                { id: args.approvalId, ...args.data } as Parameters<typeof cm.resolveApproval>[0],
                ctx.userId,
              ),
            );
          case "list_pending":
            return formatResult(await cm.getPendingApprovals(ctx.userId));
        }
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- duplicate_campaign ---
  server.registerTool(
    "duplicate_campaign",
    {
      description:
        "Duplicate an existing campaign (optionally as a template).",
      inputSchema: {
        campaignId: z.string().describe("Source campaign ID"),
        name: z.string().describe("Name for the new campaign"),
        asTemplate: z.boolean().optional().describe("Save as reusable template"),
      },
    },
    async (args) => {
      try {
        await verifyCampaignAccess(args.campaignId, ctx);
        const cm = await loadCampaignManager();
        const campaign = await cm.duplicateCampaign(
          args.campaignId,
          args.name,
          ctx.userId,
          args.asTemplate,
        );
        return formatResult(campaign);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // --- get_media_plan ---
  server.registerTool(
    "get_media_plan",
    {
      description: "Get the media plan summary for a campaign (amplifications across channels).",
      inputSchema: {
        campaignId: z.string().describe("Campaign ID"),
      },
    },
    async (args) => {
      try {
        await verifyCampaignAccess(args.campaignId, ctx);
        const cm = await loadCampaignManager();
        const plan = await cm.getMediaPlanSummary(args.campaignId);
        return formatResult(plan);
      } catch (e) {
        return formatError(e);
      }
    },
  );

  // =========================================================================
  // RESOURCES
  // =========================================================================

  // --- campaigns ---
  server.registerResource(
    "campaigns",
    new ResourceTemplate("advertis://strategy/{strategyId}/campaigns", {
      list: undefined,
    }),
    { description: "All campaigns for a strategy" },
    async (uri, variables) => {
      try {
        const cm = await loadCampaignManager();
        const strategyId = await resolveStrategyId(variables.strategyId as string, ctx);
        const campaigns = await cm.getCampaignsByStrategy(strategyId);
        return formatResource(uri.toString(), campaigns);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- budget ---
  server.registerResource(
    "budget",
    new ResourceTemplate("advertis://campaign/{campaignId}/budget", {
      list: undefined,
    }),
    { description: "Budget summary for a campaign" },
    async (uri, variables) => {
      try {
        await verifyCampaignAccess(variables.campaignId as string, ctx);
        const cm = await loadCampaignManager();
        const summary = await cm.getBudgetSummary(variables.campaignId as string);
        return formatResource(uri.toString(), summary);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- team ---
  server.registerResource(
    "team",
    new ResourceTemplate("advertis://campaign/{campaignId}/team", {
      list: undefined,
    }),
    { description: "Team members assigned to a campaign" },
    async (uri, variables) => {
      try {
        await verifyCampaignAccess(variables.campaignId as string, ctx);
        const cm = await loadCampaignManager();
        const team = await cm.getTeamByCampaign(variables.campaignId as string);
        return formatResource(uri.toString(), team);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- briefs ---
  server.registerResource(
    "briefs",
    new ResourceTemplate("advertis://campaign/{campaignId}/briefs", {
      list: undefined,
    }),
    { description: "Briefs for a campaign (creative, media, vendor)" },
    async (uri, variables) => {
      try {
        await verifyCampaignAccess(variables.campaignId as string, ctx);
        const cm = await loadCampaignManager();
        const briefs = await cm.getBriefsByCampaign(variables.campaignId as string);
        return formatResource(uri.toString(), briefs);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );

  // --- pending approvals ---
  server.registerResource(
    "pending-approvals",
    "advertis://user/pending-approvals",
    { description: "All pending approvals for the current user" },
    async (uri) => {
      try {
        const cm = await loadCampaignManager();
        const approvals = await cm.getPendingApprovals(ctx.userId);
        return formatResource(uri.toString(), approvals);
      } catch (e) {
        return formatResource(uri.toString(), { error: String(e) });
      }
    },
  );
}
