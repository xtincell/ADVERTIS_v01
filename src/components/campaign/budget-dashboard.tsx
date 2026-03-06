"use client";

import { useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import {
  CAMPAIGN_BUDGET_CATEGORIES,
  CAMPAIGN_BUDGET_CATEGORY_LABELS,
  type CampaignBudgetCategory,
} from "~/lib/constants";

interface BudgetDashboardProps {
  campaignId: string;
}

export function BudgetDashboard({ campaignId }: BudgetDashboardProps) {
  const { data: summary, isLoading: summaryLoading } =
    api.campaign.budget.summary.useQuery({ campaignId });
  const { data: budgetLines, isLoading: linesLoading } =
    api.campaign.budget.getByCampaign.useQuery({ campaignId });

  const isLoading = summaryLoading || linesLoading;

  const utilization = useMemo(() => {
    if (!summary || summary.totalBudget === 0) return 0;
    return Math.round((summary.totalSpent / summary.totalBudget) * 100);
  }, [summary]);

  const utilizationColor = useMemo(() => {
    if (utilization > 95) return "bg-red-500";
    if (utilization > 80) return "bg-amber-500";
    if (utilization > 50) return "bg-blue-500";
    return "bg-green-500";
  }, [utilization]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Budget total"
          value={formatCurrency(summary.totalBudget)}
          icon={Wallet}
          color="text-blue-600"
        />
        <KpiCard
          label="Alloue"
          value={formatCurrency(summary.totalAllocated)}
          icon={BarChart3}
          color="text-indigo-600"
        />
        <KpiCard
          label="Engage"
          value={formatCurrency(summary.totalCommitted)}
          icon={PiggyBank}
          color="text-purple-600"
        />
        <KpiCard
          label="Depense"
          value={formatCurrency(summary.totalSpent)}
          icon={DollarSign}
          color="text-amber-600"
        />
        <KpiCard
          label="Restant"
          value={formatCurrency(summary.remaining)}
          icon={summary.remaining >= 0 ? TrendingUp : TrendingDown}
          color={summary.remaining >= 0 ? "text-green-600" : "text-red-600"}
        />
        <KpiCard
          label="Variance"
          value={formatCurrency(Math.abs(summary.variance))}
          icon={summary.variance >= 0 ? TrendingUp : AlertTriangle}
          color={summary.variance >= 0 ? "text-teal-600" : "text-red-600"}
          sub={summary.variance < 0 ? "depassement" : "sous budget"}
        />
      </div>

      {/* Utilization Progress Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Utilisation du budget ({formatCurrency(summary.totalSpent)} / {formatCurrency(summary.totalBudget)})
            </span>
            <span className="font-medium">{utilization}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted">
            <div
              className={`h-3 rounded-full transition-all ${utilizationColor}`}
              style={{ width: `${Math.min(100, utilization)}%` }}
            />
          </div>
          {utilization > 90 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Attention : budget presque epuise</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Lines Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            Lignes budgetaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgetLines && budgetLines.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Categorie</th>
                    <th className="pb-2 pr-4 font-medium">Sous-categorie</th>
                    <th className="pb-2 pr-4 font-medium">Libelle</th>
                    <th className="pb-2 pr-4 text-right font-medium">Alloue</th>
                    <th className="pb-2 pr-4 text-right font-medium">Engage</th>
                    <th className="pb-2 text-right font-medium">Depense</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {budgetLines.map((line: BudgetLine) => {
                    const lineUtil =
                      line.budgetAllocated > 0
                        ? Math.round((line.budgetSpent / line.budgetAllocated) * 100)
                        : 0;
                    return (
                      <tr key={line.id} className="hover:bg-muted/50">
                        <td className="py-2 pr-4">
                          <CategoryBadge category={line.category} />
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {line.subcategory || "—"}
                        </td>
                        <td className="py-2 pr-4 font-medium">{line.label}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {formatCurrency(line.budgetAllocated)}
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {formatCurrency(line.budgetCommitted)}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          <span
                            className={
                              lineUtil > 90
                                ? "text-red-600 font-medium"
                                : lineUtil > 70
                                  ? "text-amber-600"
                                  : ""
                            }
                          >
                            {formatCurrency(line.budgetSpent)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune ligne budgetaire definie.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Helpers ──

interface BudgetLine {
  id: string;
  category: string;
  subcategory?: string | null;
  label: string;
  budgetAllocated: number;
  budgetCommitted: number;
  budgetSpent: number;
}

function CategoryBadge({ category }: { category: string }) {
  const label =
    CAMPAIGN_BUDGET_CATEGORY_LABELS[category as CampaignBudgetCategory] ??
    category;
  return (
    <Badge variant="outline" className="text-xs">
      {label}
    </Badge>
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
  value: string;
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
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold tabular-nums">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
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
