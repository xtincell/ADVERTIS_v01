"use client";

// =============================================================================
// PAGE P.CAMPAIGNS — Campaign Manager Hub
// =============================================================================
// Main campaign management page. Shows dashboard, kanban board, and campaign
// list. Supports creating new campaigns and navigating to detail views.
// =============================================================================

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Megaphone,
  LayoutGrid,
  List,
  Plus,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import { CampaignDashboard } from "~/components/campaign/campaign-dashboard";
import { CampaignKanban } from "~/components/campaign/campaign-kanban";
import { CreateCampaignDialog } from "~/components/campaign/create-campaign-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  CAMPAIGN_TYPE_LABELS,
} from "~/lib/constants";

export default function CampaignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const strategyId = searchParams.get("strategyId") ?? undefined;

  const [view, setView] = useState<string>("kanban");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(
    strategyId ?? "",
  );

  // Load strategies for selector
  const { data: strategies } = api.strategy.getAll.useQuery({});

  // Campaign search for list view
  const { data: campaigns, isLoading: listLoading } =
    api.campaign.campaigns.search.useQuery(
      {
        strategyId: selectedStrategyId || undefined,
      },
      { enabled: view === "list" },
    );

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 md:p-8 animate-page-enter">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            <h1 className="text-display-lg">Campaign Manager</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestion 360° de vos campagnes marketing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Strategy selector */}
          {strategies && strategies.length > 1 && (
            <Select
              value={selectedStrategyId}
              onValueChange={setSelectedStrategyId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Toutes les marques" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les marques</SelectItem>
                {strategies.map((s: { id: string; brandName: string }) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.brandName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={() => {
              if (!selectedStrategyId && strategies?.length === 1) {
                setSelectedStrategyId(strategies[0]!.id);
              }
              setShowCreate(true);
            }}
            disabled={!selectedStrategyId && (!strategies || strategies.length !== 1)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Button>
        </div>
      </div>

      {/* Views */}
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="dashboard">
            <LayoutGrid className="mr-1 h-3.5 w-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <LayoutGrid className="mr-1 h-3.5 w-3.5" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="mr-1 h-3.5 w-3.5" />
            Liste
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <CampaignDashboard
            onNavigate={(path) => router.push(path)}
          />
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          <CampaignKanban
            onCampaignClick={(id) => router.push(`/campaigns/${id}`)}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          {listLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="space-y-2">
              {campaigns.map(
                (c: {
                  id: string;
                  name: string;
                  code: string | null;
                  status: string;
                  campaignType: string;
                  priority: string;
                  totalBudget: number | null;
                  startDate: Date | null;
                  endDate: Date | null;
                  strategy: { id: string; brandName: string };
                  _count: { actions: number; teamMembers: number };
                }) => (
                  <Card
                    key={c.id}
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => router.push(`/campaigns/${c.id}`)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.name}</span>
                          <Badge
                            className={`text-[10px] ${
                              CAMPAIGN_STATUS_COLORS[
                                c.status as keyof typeof CAMPAIGN_STATUS_COLORS
                              ] ?? ""
                            }`}
                          >
                            {CAMPAIGN_STATUS_LABELS[
                              c.status as keyof typeof CAMPAIGN_STATUS_LABELS
                            ] ?? c.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              c.priority === "P0"
                                ? "border-red-300 text-red-600"
                                : c.priority === "P1"
                                  ? "border-amber-300 text-amber-600"
                                  : ""
                            }`}
                          >
                            {c.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {c.code && (
                            <span className="font-mono">{c.code}</span>
                          )}
                          <span>{c.strategy.brandName}</span>
                          <span>
                            {CAMPAIGN_TYPE_LABELS[
                              c.campaignType as keyof typeof CAMPAIGN_TYPE_LABELS
                            ] ?? c.campaignType}
                          </span>
                          {c._count.actions > 0 && (
                            <span>{c._count.actions} actions</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {c.totalBudget != null && c.totalBudget > 0 && (
                          <p className="font-medium text-foreground">
                            {c.totalBudget.toLocaleString("fr-FR")} XAF
                          </p>
                        )}
                        {c.startDate && (
                          <p>
                            {new Date(c.startDate).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                            })}
                            {c.endDate &&
                              ` → ${new Date(c.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
              Aucune campagne trouvée.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create dialog */}
      {showCreate && (
        <CreateCampaignDialog
          strategyId={
            selectedStrategyId ||
            (strategies?.length === 1 ? strategies[0]!.id : "")
          }
          onClose={() => setShowCreate(false)}
          onCreated={(id) => router.push(`/campaigns/${id}`)}
        />
      )}
    </div>
  );
}
