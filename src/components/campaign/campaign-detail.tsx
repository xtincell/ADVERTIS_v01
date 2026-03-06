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

function fmtCurrency(amount: number | null | undefined) {
  if (!amount) return "0";
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString("fr-FR");
}

function priorityColor(p: string) {
  if (p === "P0") return "border-red-300 text-red-600";
  if (p === "P1") return "border-amber-300 text-amber-600";
  return "border-gray-300 text-gray-600";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CampaignDetail({ campaignId, onNavigate }: CampaignDetailProps) {
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

  const budgetAllocated = campaign.budgetLines?.reduce(
    (sum: number, b: { budgetAllocated: number }) => sum + (b.budgetAllocated ?? 0),
    0,
  ) ?? 0;
  const budgetSpent = campaign.budgetLines?.reduce(
    (sum: number, b: { budgetSpent?: number | null }) => sum + (b.budgetSpent ?? 0),
    0,
  ) ?? 0;

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
          <SummaryCard
            icon={Layers}
            title="Actions ATL / BTL / TTL"
            count={counts.actions}
            description={`${campaign.actions?.filter((a: { actionLine: string }) => a.actionLine === "ATL").length ?? 0} ATL, ${campaign.actions?.filter((a: { actionLine: string }) => a.actionLine === "BTL").length ?? 0} BTL, ${campaign.actions?.filter((a: { actionLine: string }) => a.actionLine === "TTL").length ?? 0} TTL`}
          />
          {onNavigate && counts.actions > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => onNavigate(`/campaigns/${campaignId}/actions`)}
            >
              Gerer les actions <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </TabsContent>

        {/* ── Executions ── */}
        <TabsContent value="executions">
          <SummaryCard
            icon={Printer}
            title="Executions (Production)"
            count={counts.executions}
            description="Pipeline de production: devis, BAT, livraison, installation"
          />
        </TabsContent>

        {/* ── Media ── */}
        <TabsContent value="media">
          <SummaryCard
            icon={Radio}
            title="Amplifications Media"
            count={counts.amplifications}
            description="Achat media, placements, flights, performances"
          />
        </TabsContent>

        {/* ── Equipe ── */}
        <TabsContent value="equipe">
          <SummaryCard
            icon={Users}
            title="Membres de l'equipe"
            count={counts.teamMembers}
            description={
              campaign.teamMembers?.filter((m: { isLead: boolean }) => m.isLead).length
                ? `${campaign.teamMembers.filter((m: { isLead: boolean }) => m.isLead).length} lead(s)`
                : "Aucun lead assigne"
            }
          />
        </TabsContent>

        {/* ── Budget ── */}
        <TabsContent value="budget">
          <div className="grid gap-4 sm:grid-cols-3">
            <MiniKpi label="Budget total" value={fmtCurrency(campaign.totalBudget)} unit={campaign.currency ?? "XAF"} />
            <MiniKpi label="Alloue" value={fmtCurrency(budgetAllocated)} unit={campaign.currency ?? "XAF"} />
            <MiniKpi label="Depense" value={fmtCurrency(budgetSpent)} unit={campaign.currency ?? "XAF"} />
          </div>
          {campaign.totalBudget && campaign.totalBudget > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Utilisation</span>
                <span>{Math.round((budgetSpent / campaign.totalBudget) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(100, Math.round((budgetSpent / campaign.totalBudget) * 100))}%` }}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Timeline ── */}
        <TabsContent value="timeline">
          <div className="space-y-2">
            {campaign.milestones?.length ? (
              campaign.milestones.map(
                (m: { id: string; title: string; dueDate: Date; status: string; isGateReview: boolean }) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          m.status === "COMPLETED"
                            ? "bg-green-500"
                            : m.status === "OVERDUE"
                              ? "bg-red-500"
                              : "bg-amber-400"
                        }`}
                      />
                      <span className="font-medium">{m.title}</span>
                      {m.isGateReview && (
                        <Badge variant="outline" className="text-[10px]">
                          Gate
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{fmtDate(m.dueDate)}</span>
                  </div>
                ),
              )
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucun jalon</p>
            )}
          </div>
        </TabsContent>

        {/* ── Approvals ── */}
        <TabsContent value="approvals">
          <SummaryCard
            icon={ShieldCheck}
            title="Approbations"
            count={counts.approvals}
            description={
              pendingApprovals > 0
                ? `${pendingApprovals} en attente de validation`
                : "Aucune approbation en attente"
            }
          />
        </TabsContent>

        {/* ── Assets ── */}
        <TabsContent value="assets">
          <SummaryCard
            icon={FolderOpen}
            title="Assets de campagne"
            count={counts.assets}
            description="Visuels, videos, fichiers de production"
          />
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

function SummaryCard({
  icon: Icon,
  title,
  count,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 py-5">
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{count}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniKpi({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <Card>
      <CardContent className="py-4 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{unit}</p>
      </CardContent>
    </Card>
  );
}
