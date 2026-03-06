"use client";

import { useMemo } from "react";
import { Loader2, Megaphone, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  CAMPAIGN_STATUSES,
} from "~/lib/constants";

interface CampaignKanbanProps {
  onCampaignClick?: (campaignId: string) => void;
}

const KANBAN_COLUMNS = [
  "BRIEF_DRAFT",
  "BRIEF_VALIDATED",
  "PLANNING",
  "CREATIVE_DEV",
  "PRODUCTION",
  "PRE_PRODUCTION",
  "APPROVAL",
  "READY_TO_LAUNCH",
  "LIVE",
  "POST_CAMPAIGN",
] as const;

export function CampaignKanban({ onCampaignClick }: CampaignKanbanProps) {
  const { data: kanban, isLoading } =
    api.campaign.campaigns.getKanban.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!kanban) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((status) => {
        const campaigns = kanban[status] ?? [];
        const label =
          CAMPAIGN_STATUS_LABELS[status as keyof typeof CAMPAIGN_STATUS_LABELS] ??
          status;
        const color =
          CAMPAIGN_STATUS_COLORS[status as keyof typeof CAMPAIGN_STATUS_COLORS] ??
          "bg-gray-100 text-gray-700";

        return (
          <div
            key={status}
            className="flex min-w-[260px] max-w-[300px] flex-shrink-0 flex-col gap-2"
          >
            {/* Column header */}
            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${color}`}>
                  {label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {campaigns.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2">
              {campaigns.map(
                (campaign: {
                  id: string;
                  name: string;
                  code: string | null;
                  priority: string;
                  totalBudget: number | null;
                  startDate: Date | null;
                  endDate: Date | null;
                  strategy: { id: string; brandName: string };
                  _count: {
                    actions: number;
                    milestones: number;
                    teamMembers: number;
                  };
                }) => (
                  <Card
                    key={campaign.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                    onClick={() => onCampaignClick?.(campaign.id)}
                  >
                    <CardContent className="space-y-2 p-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium leading-tight">
                            {campaign.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {campaign.strategy.brandName}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            campaign.priority === "P0"
                              ? "border-red-300 text-red-600"
                              : campaign.priority === "P1"
                                ? "border-amber-300 text-amber-600"
                                : "border-gray-300 text-gray-600"
                          }`}
                        >
                          {campaign.priority}
                        </Badge>
                      </div>

                      {campaign.code && (
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {campaign.code}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        {campaign._count.actions > 0 && (
                          <span>{campaign._count.actions} actions</span>
                        )}
                        {campaign._count.teamMembers > 0 && (
                          <span>{campaign._count.teamMembers} membres</span>
                        )}
                        {campaign._count.milestones > 0 && (
                          <span>{campaign._count.milestones} jalons</span>
                        )}
                      </div>

                      {/* Dates */}
                      {campaign.startDate && (
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(campaign.startDate).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "short" },
                          )}
                          {campaign.endDate &&
                            ` → ${new Date(campaign.endDate).toLocaleDateString(
                              "fr-FR",
                              { day: "numeric", month: "short" },
                            )}`}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ),
              )}

              {campaigns.length === 0 && (
                <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
                  Aucune campagne
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
