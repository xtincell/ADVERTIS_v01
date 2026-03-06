"use client";

import { useMemo } from "react";
import {
  Megaphone,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
} from "~/lib/constants";

interface CampaignDashboardProps {
  onNavigate?: (path: string) => void;
}

export function CampaignDashboard({ onNavigate }: CampaignDashboardProps) {
  const { data: dashboard, isLoading } =
    api.campaign.campaigns.dashboard.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!dashboard) return null;

  const budgetUtil =
    dashboard.totalBudget > 0
      ? Math.round((dashboard.totalSpent / dashboard.totalBudget) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Campagnes actives"
          value={dashboard.activeCampaigns}
          icon={Megaphone}
          color="text-blue-600"
        />
        <KpiCard
          label="Total campagnes"
          value={dashboard.totalCampaigns}
          icon={TrendingUp}
          color="text-purple-600"
        />
        <KpiCard
          label="Budget total"
          value={formatCurrency(dashboard.totalBudget)}
          icon={DollarSign}
          color="text-green-600"
          sub={`${budgetUtil}% utilisé`}
        />
        <KpiCard
          label="Budget dépensé"
          value={formatCurrency(dashboard.totalSpent)}
          icon={DollarSign}
          color="text-amber-600"
          sub={`${formatCurrency(dashboard.totalAllocated)} alloué`}
        />
      </div>

      {/* Budget Health Bar */}
      {dashboard.totalBudget > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Utilisation budget global</span>
              <span className="font-medium">{budgetUtil}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={`h-2 rounded-full transition-all ${
                  budgetUtil > 90
                    ? "bg-red-500"
                    : budgetUtil > 70
                      ? "bg-amber-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${Math.min(100, budgetUtil)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Milestones */}
      {dashboard.upcomingMilestones.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Milestones proches (7 jours)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.upcomingMilestones.map((m: { id: string; title: string; dueDate: Date; status: string; campaign: { id: string; name: string } }) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  {m.status === "COMPLETED" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="font-medium">{m.title}</span>
                  <span className="text-muted-foreground">
                    {m.campaign.name}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(m.dueDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate?.("/campaigns")}
        >
          <Megaphone className="mr-2 h-4 w-4" />
          Toutes les campagnes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate?.("/campaigns/calendar")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Calendrier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate?.("/campaigns/templates")}
        >
          <Users className="mr-2 h-4 w-4" />
          Templates
        </Button>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  sub?: string;
}) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-start gap-3 px-4">
        <div className={`rounded-lg bg-muted p-2 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
          {sub && (
            <p className="text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString("fr-FR");
}
