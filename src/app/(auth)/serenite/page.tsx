// =============================================================================
// PAGE P.SERENITE — Financial Dashboard
// =============================================================================
// KPIs (total revenue, unpaid invoices, escrow, avg commission),
// recent invoices table, revenue breakdown.
// =============================================================================

"use client";

import {
  DollarSign,
  FileText,
  Shield,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";
import { PageHeader } from "~/components/ui/page-header";
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from "~/lib/constants";

export default function SereniteDashboardPage() {
  const { data, isLoading } = api.serenite.dashboard.useQuery();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-4 md:grid-cols-4 stagger-children">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/50 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Sérénité — Finance"
        description="Vue d'ensemble financière de l'agence"
        backHref="/serenite"
        backLabel="Retour au menu"
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            Revenus encaissés
          </div>
          <div className="text-2xl font-bold tabular-nums">{fmt(data?.totalRevenue ?? 0)}</div>
          <div className="text-xs text-muted-foreground">XAF • {data?.paidInvoicesCount ?? 0} factures</div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <FileText className="h-4 w-4 text-orange-500" />
            Factures impayées
          </div>
          <div className="text-2xl font-bold tabular-nums text-orange-600">{fmt(data?.unpaidAmount ?? 0)}</div>
          <div className="text-xs text-muted-foreground">XAF en attente</div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            Escrow séquestré
          </div>
          <div className="text-2xl font-bold tabular-nums">{fmt(data?.escrowHeld ?? 0)}</div>
          <div className="text-xs text-muted-foreground">XAF en séquestre</div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            Commission moyenne
          </div>
          <div className="text-2xl font-bold tabular-nums">{((data?.avgCommissionRate ?? 0) * 100).toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Taux moyen • {fmt(data?.totalCommissions ?? 0)} XAF total</div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { href: "/serenite/invoices", label: "Gestion factures", icon: FileText, desc: "Créer, suivre et gérer les factures" },
          { href: "/serenite/contracts", label: "Contrats", icon: Shield, desc: "NDA, prestations, cessions de droits" },
          { href: "/serenite/escrow", label: "Escrow", icon: DollarSign, desc: "Séquestre et libération des fonds" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border bg-white p-4 hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Invoice breakdown */}
      {data?.invoicesByStatus && data.invoicesByStatus.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold mb-4">Répartition par statut</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {data.invoicesByStatus.map((g) => (
              <div key={g.status} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {INVOICE_STATUS_LABELS[g.status as InvoiceStatus] ?? g.status}
                  </Badge>
                  <span className="text-sm">{g.count} factures</span>
                </div>
                <span className="font-medium tabular-nums text-sm">{fmt(g.total)} XAF</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent invoices */}
      {data?.recentInvoices && data.recentInvoices.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold mb-4">Factures récentes</h2>
          <div className="space-y-2">
            {data.recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20">
                <div>
                  <div className="font-medium text-sm">{inv.refNumber}</div>
                  <div className="text-xs text-muted-foreground">{inv.type} • {new Date(inv.createdAt).toLocaleDateString("fr-FR")}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium tabular-nums text-sm">{fmt(inv.total)} XAF</div>
                  <Badge variant="outline" className="text-xs">
                    {INVOICE_STATUS_LABELS[inv.status as InvoiceStatus] ?? inv.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
