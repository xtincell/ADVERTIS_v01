"use client";

import { useMemo } from "react";
import {
  Loader2,
  Lightbulb,
  Layers,
  Printer,
  Radio,
  Users,
  Wallet,
  CalendarClock,
  ShieldCheck,
  FolderOpen,
  ArrowRight,
  Calendar,
  Tag,
  FileText,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  CAMPAIGN_TYPE_LABELS,
  CAMPAIGN_VALID_TRANSITIONS,
  type CampaignStatus,
} from "~/lib/constants";

// Campaign sub-components
import { ActionManager } from "~/components/campaign/action-manager";
import { ExecutionTracker } from "~/components/campaign/execution-tracker";
import { MediaPlan } from "~/components/campaign/media-plan";
import { TeamPanel } from "~/components/campaign/team-panel";
import { BudgetDashboard } from "~/components/campaign/budget-dashboard";
import { MilestoneTimeline } from "~/components/campaign/milestone-timeline";
import { ApprovalWorkflow } from "~/components/campaign/approval-workflow";
import { AssetGallery } from "~/components/campaign/asset-gallery";
import { CampaignBriefEditor } from "~/components/campaign/campaign-brief-editor";
import { CampaignReport } from "~/components/campaign/campaign-report";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CampaignDetailProps {
  campaignId: string;
  onNavigate?: (path: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "---";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function priorityColor(p: string) {
  if (p === "P0") return "border-red-300 text-red-600";
  if (p === "P1") return "border-amber-300 text-amber-600";
  return "border-gray-300 text-gray-600";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CampaignDetail({ campaignId }: CampaignDetailProps) {
  const utils = api.useUtils();

  const { data: campaign, isLoading } =
    api.campaign.campaigns.getById.useQuery({ id: campaignId });

  const transition = api.campaign.campaigns.transition.useMutation({
    onSuccess: () => {
      toast.success("Statut mis a jour");
      void utils.campaign.campaigns.getById.invalidate({ id: campaignId });
    },
    onError: (err) => toast.error(err.message),
  });

  const nextStatuses = useMemo(() => {
    if (!campaign) return [];
    return CAMPAIGN_VALID_TRANSITIONS[campaign.status as CampaignStatus] ?? [];
  }, [campaign]);

  // ---- Loading / empty states ----

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) return null;

  const status = campaign.status as CampaignStatus;
  const statusLabel = CAMPAIGN_STATUS_LABELS[status] ?? status;
  const statusColor = CAMPAIGN_STATUS_COLORS[status] ?? "";
  const typeLabel =
    CAMPAIGN_TYPE_LABELS[campaign.campaignType as keyof typeof CAMPAIGN_TYPE_LABELS] ??
    campaign.campaignType;

  const counts = campaign._count;
  const pendingApprovals = campaign.approvals?.filter(
    (a: { status: string }) => a.status === "PENDING",
  ).length ?? 0;

  // ---- Render ----

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {campaign.code && (
                <span className="font-mono text-xs">{campaign.code}</span>
              )}
              <span>{campaign.strategy?.brandName}</span>
              <Badge variant="outline" className="text-xs">
                {typeLabel}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${priorityColor(campaign.priority)}`}>
              {campaign.priority}
            </Badge>
            <Badge variant="secondary" className={`text-xs ${statusColor}`}>
              {statusLabel}
            </Badge>
          </div>
        </div>

        {/* Dates row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {fmtDate(campaign.startDate)} &rarr; {fmtDate(campaign.endDate)}
          </span>
          {campaign.launchDate && (
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Lancement: {fmtDate(campaign.launchDate)}
            </span>
          )}
        </div>

        {/* Transition buttons */}
        {nextStatuses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((ns) => (
              <Button
                key={ns}
                size="sm"
                variant="outline"
                disabled={transition.isPending}
                onClick={() => transition.mutate({ id: campaignId, newStatus: ns })}
              >
                <ArrowRight className="mr-1 h-3 w-3" />
                {CAMPAIGN_STATUS_LABELS[ns] ?? ns}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="contexte">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="contexte">
            <Lightbulb className="mr-1 h-3.5 w-3.5" /> Contexte
          </TabsTrigger>
          <TabsTrigger value="actions">
            <Layers className="mr-1 h-3.5 w-3.5" /> Actions ({counts.actions})
          </TabsTrigger>
          <TabsTrigger value="executions">
            <Printer className="mr-1 h-3.5 w-3.5" /> Executions ({counts.executions})
          </TabsTrigger>
          <TabsTrigger value="media">
            <Radio className="mr-1 h-3.5 w-3.5" /> Media ({counts.amplifications})
          </TabsTrigger>
          <TabsTrigger value="equipe">
            <Users className="mr-1 h-3.5 w-3.5" /> Equipe ({counts.teamMembers})
          </TabsTrigger>
          <TabsTrigger value="budget">
            <Wallet className="mr-1 h-3.5 w-3.5" /> Budget
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <CalendarClock className="mr-1 h-3.5 w-3.5" /> Timeline ({counts.milestones})
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Approvals ({pendingApprovals})
          </TabsTrigger>
          <TabsTrigger value="assets">
            <FolderOpen className="mr-1 h-3.5 w-3.5" /> Assets ({counts.assets})
          </TabsTrigger>
          <TabsTrigger value="briefs">
            <FileText className="mr-1 h-3.5 w-3.5" /> Briefs
          </TabsTrigger>
          <TabsTrigger value="rapports">
            <BarChart3 className="mr-1 h-3.5 w-3.5" /> Rapports
          </TabsTrigger>
        </TabsList>

        {/* ── Contexte ── */}
        <TabsContent value="contexte">
          <div className="grid gap-4 sm:grid-cols-2">
            <ContextCard label="Big Idea" value={campaign.bigIdea} />
            <ContextCard label="Axe Creatif" value={campaign.axeCreatif} />
            <ContextCard label="Piste Creative" value={campaign.pisteCreative} />
            <ContextCard label="Insight" value={campaign.insight} />
            <ContextCard label="Promesse" value={campaign.promesse} />
            <ContextCard label="Positionnement" value={campaign.positioning} />
            <ContextCard
              label="Cible"
              value={
                typeof campaign.targetAudience === "string"
                  ? campaign.targetAudience
                  : campaign.targetAudience
                    ? JSON.stringify(campaign.targetAudience, null, 2)
                    : null
              }
            />
          </div>
        </TabsContent>

        {/* ── Actions ── */}
        <TabsContent value="actions">
          <ActionManager campaignId={campaignId} />
        </TabsContent>

        {/* ── Executions ── */}
        <TabsContent value="executions">
          <ExecutionTracker campaignId={campaignId} />
        </TabsContent>

        {/* ── Media ── */}
        <TabsContent value="media">
          <MediaPlan campaignId={campaignId} />
        </TabsContent>

        {/* ── Equipe ── */}
        <TabsContent value="equipe">
          <TeamPanel campaignId={campaignId} />
        </TabsContent>

        {/* ── Budget ── */}
        <TabsContent value="budget">
          <BudgetDashboard campaignId={campaignId} />
        </TabsContent>

        {/* ── Timeline ── */}
        <TabsContent value="timeline">
          <MilestoneTimeline campaignId={campaignId} />
        </TabsContent>

        {/* ── Approvals ── */}
        <TabsContent value="approvals">
          <ApprovalWorkflow campaignId={campaignId} />
        </TabsContent>

        {/* ── Assets ── */}
        <TabsContent value="assets">
          <AssetGallery campaignId={campaignId} />
        </TabsContent>

        {/* ── Briefs ── */}
        <TabsContent value="briefs">
          <CampaignBriefEditor campaignId={campaignId} />
        </TabsContent>

        {/* ── Rapports ── */}
        <TabsContent value="rapports">
          <CampaignReport campaignId={campaignId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ContextCard({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">
          {value || <span className="text-muted-foreground italic">Non renseigne</span>}
        </p>
      </CardContent>
    </Card>
  );
}
