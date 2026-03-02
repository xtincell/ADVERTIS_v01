// =============================================================================
// PAGE P.F5 — Freelance Finances (My Finances)
// =============================================================================
// Displays freelance earnings, commissions, and invoices (read-only).
// Uses: api.serenite.talentEarnings, api.serenite.getMyCommissions,
//       api.serenite.listInvoices
// =============================================================================

"use client";

import {
  Wallet,
  TrendingUp,
  Receipt,
  DollarSign,
  FileText,
  Loader2,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  COMMISSION_RATES,
  TALENT_LEVEL_LABELS,
  TALENT_LEVEL_CONFIG,
  type InvoiceStatus,
  type InvoiceType,
  type TalentLevel,
  type CommissionStatus,
} from "~/lib/constants";

export default function MyFinancesPage() {
  const { data: earnings, isLoading: earningsLoading } =
    api.serenite.talentEarnings.useQuery({ userId: "" }); // Freelance: userId ignored, server uses session
  const { data: commissions, isLoading: commissionsLoading } =
    api.serenite.getMyCommissions.useQuery();
  const { data: invoices, isLoading: invoicesLoading } =
    api.serenite.listInvoices.useQuery({ page: 1, pageSize: 10 });
  const { data: profile } = api.guilde.getMyProfile.useQuery();

  const isLoading = earningsLoading || commissionsLoading || invoicesLoading;

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  const level = (profile?.level as TalentLevel) ?? "NOVICE";
  const levelConfig = TALENT_LEVEL_CONFIG[level];
  const commissionRate = COMMISSION_RATES[level];

  const commissionStatusLabel = (s: string) => {
    switch (s) {
      case "CALCULATED": return "Calculée";
      case "INVOICED": return "Facturée";
      case "PAID": return "Payée";
      default: return s;
    }
  };

  const commissionStatusColor = (s: string) => {
    switch (s) {
      case "PAID": return "default";
      case "INVOICED": return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3 mb-6 stagger-children">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/50 shimmer" />
          ))}
        </div>
        <div className="space-y-3 stagger-children">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/50 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const totalGross = earnings?.totalGross ?? 0;
  const totalNet = earnings?.totalNet ?? 0;
  const totalCommission = earnings?.totalCommissions ?? 0;
  const pendingAmount = commissions
    ?.filter((c) => c.status !== "PAID")
    .reduce((sum, c) => sum + c.netAmount, 0) ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          Mes Finances
        </h1>
        <p className="text-sm text-muted-foreground">
          Suivi de vos revenus, commissions et factures.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            Revenus nets
          </div>
          <div className="text-2xl font-bold tabular-nums">{fmt(totalNet)}</div>
          <div className="text-xs text-muted-foreground">XAF • après commissions</div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Revenus bruts
          </div>
          <div className="text-2xl font-bold tabular-nums">{fmt(totalGross)}</div>
          <div className="text-xs text-muted-foreground">
            Commission : {(commissionRate * 100).toFixed(0)}% ({TALENT_LEVEL_LABELS[level]})
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="h-4 w-4 text-orange-500" />
            En attente
          </div>
          <div className="text-2xl font-bold tabular-nums text-orange-600">
            {fmt(pendingAmount)}
          </div>
          <div className="text-xs text-muted-foreground">XAF • paiements en cours</div>
        </div>
      </div>

      {/* Commission Rate Info */}
      <div className="rounded-xl border bg-white p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">{levelConfig.emoji}</span>
            <div>
              <div className="font-medium text-sm">
                Taux de commission : {(commissionRate * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Niveau {TALENT_LEVEL_LABELS[level]} — le taux diminue avec votre progression
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-xs"
            style={{ borderColor: levelConfig.color, color: levelConfig.color }}
          >
            {TALENT_LEVEL_LABELS[level]}
          </Badge>
        </div>
      </div>

      {/* Commissions List */}
      {commissions && commissions.length > 0 && (
        <div className="rounded-xl border bg-white p-5 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            Commissions ({commissions.length})
          </h2>
          <div className="space-y-2">
            {commissions.map((comm) => (
              <div
                key={comm.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 border"
              >
                <div>
                  <div className="text-sm font-medium">
                    Mission : {comm.missionId.slice(0, 8)}...
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Brut : {fmt(comm.grossAmount)} XAF • Commission : {fmt(comm.commissionAmount)} XAF ({(comm.commissionRate * 100).toFixed(0)}%)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(comm.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium tabular-nums text-sm text-green-700">
                    {fmt(comm.netAmount)} XAF
                  </div>
                  <Badge variant={commissionStatusColor(comm.status) as any} className="text-xs mt-1">
                    {commissionStatusLabel(comm.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Invoices */}
      {invoices && invoices.items && invoices.items.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Mes Factures
          </h2>
          <div className="space-y-2">
            {invoices.items.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20"
              >
                <div>
                  <div className="text-sm font-medium">{inv.refNumber}</div>
                  <div className="text-xs text-muted-foreground">
                    {INVOICE_TYPE_LABELS[inv.type as InvoiceType]} •{" "}
                    {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium tabular-nums text-sm">
                    {fmt(inv.total)} {inv.currency}
                  </div>
                  <Badge
                    variant={
                      inv.status === "PAID"
                        ? "default"
                        : inv.status === "OVERDUE"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {INVOICE_STATUS_LABELS[inv.status as InvoiceStatus]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state if no data at all */}
      {(!commissions || commissions.length === 0) &&
        (!invoices || !invoices.items || invoices.items.length === 0) && (
          <div className="text-center py-16 text-muted-foreground">
            <Wallet className="mx-auto h-12 w-12 mb-4 opacity-30" />
            <p>Aucune donnée financière pour le moment.</p>
            <p className="text-xs mt-1">
              Vos revenus apparaîtront ici après vos premières missions.
            </p>
          </div>
        )}
    </div>
  );
}
