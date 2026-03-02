// ==========================================================================
// PAGE P.0 — General Dashboard
// Cross-portal agency overview: greeting, KPIs, portal access, financial
// snapshot, alerts, and recent activity. Landing page for ADMIN/OPERATOR.
// ==========================================================================

"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  FileWarning,
  Receipt,
  Percent,
  Clock,
  ArrowRight,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertPanel } from "~/components/dashboard/alert-panel";
import { AgencyKpiBar } from "~/components/dashboard/agency-kpi-bar";
import { OnboardingHero } from "~/components/dashboard/onboarding-hero";
import { PORTALS } from "~/lib/portal-config";

// ---------------------------------------------------------------------------
// Icon resolver (portal-config stores icon names as strings)
// ---------------------------------------------------------------------------
function resolveIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? LucideIcons.Puzzle;
}

// ---------------------------------------------------------------------------
// Portal cards for operator portals
// ---------------------------------------------------------------------------
const OPERATOR_PORTALS = PORTALS.filter(
  (p) =>
    p.allowedRoles.includes("ADMIN") &&
    p.allowedRoles.includes("OPERATOR") &&
    p.href !== "/dashboard",
);

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------
function relativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

// ---------------------------------------------------------------------------
// Format currency (FCFA)
// ---------------------------------------------------------------------------
function formatCFA(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

// ==========================================================================
// Page
// ==========================================================================
export default function GeneralDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  // ── Data queries ──
  const {
    data: overview,
    isLoading: loadingOverview,
    isError: errorOverview,
    refetch: refetchOverview,
  } = api.analytics.getAgencyOverview.useQuery();

  const {
    data: finance,
    isLoading: loadingFinance,
  } = api.serenite.dashboard.useQuery(undefined, {
    // Financial data is secondary — don't block the page
    retry: 1,
  });

  const isLoading = loadingOverview;

  // ── Today's date ──
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 pb-24 md:p-6 stagger-children">
        <div className="space-y-2">
          <div className="h-7 w-48 shimmer rounded-md bg-muted" />
          <div className="h-4 w-32 shimmer rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 shimmer rounded-xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 shimmer rounded-xl bg-muted" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 shimmer rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (errorOverview || !overview) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">
          Impossible de charger le tableau de bord
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetchOverview()}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  // ── Onboarding: no brands yet ──
  if (overview.totalBrands === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 pb-24 bg-mesh">
        <OnboardingHero
          firstName={firstName}
          onCreateBrand={() => router.push("/impulsion/new")}
        />
      </div>
    );
  }

  // ── Summary line ──
  const subtitle = [
    `${overview.totalBrands} marque${overview.totalBrands !== 1 ? "s" : ""}`,
    overview.avgCoherence > 0
      ? `Santé ${overview.avgCoherence}%`
      : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-5 p-4 pb-24 md:p-6 animate-page-enter">
      {/* ── 1. Greeting ── */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">
          Bonjour{firstName ? ` ${firstName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground capitalize">{todayLabel}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      {/* ── 2. Alert banner ── */}
      {overview.alerts.length > 0 && (
        <AlertPanel
          alerts={overview.alerts}
          onBrandClick={(id) => router.push(`/impulsion/brand/${id}`)}
        />
      )}

      {/* ── 3. KPI bar ── */}
      <AgencyKpiBar
        totalBrands={overview.totalBrands}
        avgCoherence={overview.avgCoherence}
        avgRisk={overview.avgRisk}
        avgBrandMarketFit={overview.avgBrandMarketFit}
        completionRate={overview.completionRate}
      />

      {/* ── 4. Portal quick-access ── */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Portails
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {OPERATOR_PORTALS.map((portal) => {
            const Icon = resolveIcon(portal.iconName);
            return (
              <button
                key={portal.id}
                onClick={() => router.push(portal.href)}
                className="group flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all hover:shadow-md cursor-pointer"
                style={{
                  borderColor: `${portal.color}30`,
                }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${portal.color}15` }}
                >
                  <Icon
                    className="h-4.5 w-4.5"
                    style={{ color: portal.color }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                    {portal.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {portal.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 5. Financial snapshot ── */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Finance
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FinanceCard
            label="Chiffre d'affaires"
            icon={DollarSign}
            value={finance ? `${formatCFA(finance.totalRevenue)} FCFA` : undefined}
            loading={loadingFinance}
          />
          <FinanceCard
            label="Impayés"
            icon={FileWarning}
            value={finance ? `${formatCFA(finance.unpaidAmount)} FCFA` : undefined}
            loading={loadingFinance}
            alert={finance ? finance.unpaidAmount > 0 : false}
          />
          <FinanceCard
            label="Factures payées"
            icon={Receipt}
            value={finance ? String(finance.paidInvoicesCount) : undefined}
            loading={loadingFinance}
          />
          <FinanceCard
            label="Taux commission"
            icon={Percent}
            value={
              finance
                ? `${finance.avgCommissionRate.toFixed(1)}%`
                : undefined
            }
            loading={loadingFinance}
          />
        </div>
      </section>

      {/* ── 6. Recent activity ── */}
      {overview.recentActivity && overview.recentActivity.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Activité récente
          </h2>
          <Card>
            <CardContent className="divide-y">
              {overview.recentActivity.slice(0, 8).map((activity, i) => (
                <button
                  key={`${activity.strategyId}-${i}`}
                  onClick={() =>
                    router.push(`/impulsion/brand/${activity.strategyId}`)
                  }
                  className="flex w-full items-center justify-between gap-3 py-2.5 text-left group cursor-pointer first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate group-hover:text-indigo-500 transition-colors">
                      {activity.brandName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.action}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground">
                      {relativeTime(activity.updatedAt)}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Finance card sub-component
// ---------------------------------------------------------------------------
function FinanceCard({
  label,
  icon: Icon,
  value,
  loading,
  alert,
}: {
  label: string;
  icon: LucideIcon;
  value: string | undefined;
  loading: boolean;
  alert?: boolean;
}) {
  return (
    <Card className="py-3 md:py-3">
      <CardContent className="flex items-start gap-3 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground truncate">{label}</p>
          {loading ? (
            <div className="h-5 w-16 shimmer rounded bg-muted mt-0.5" />
          ) : (
            <p
              className={`text-sm font-semibold truncate ${alert ? "text-amber-500" : ""}`}
            >
              {value ?? "—"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
