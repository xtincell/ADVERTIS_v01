// ==========================================================================
// PAGE P.0 — General Dashboard (v3)
// Cross-portal agency overview: greeting, KPIs, portal access, financial
// snapshot, alerts, and recent activity. Landing page for ADMIN/OPERATOR.
// ==========================================================================

"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  RotateCcw,
  DollarSign,
  FileWarning,
  Receipt,
  Percent,
  ArrowRight,
  Users,
  Briefcase,
  Target,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { AlertPanel } from "~/components/dashboard/alert-panel";
import { AgencyKpiBar } from "~/components/dashboard/agency-kpi-bar";
import { OnboardingHero } from "~/components/dashboard/onboarding-hero";
import { PORTALS } from "~/lib/portal-config";
import { formatCompact } from "~/lib/currency";

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

// formatCFA → replaced by centralized formatCompact from ~/lib/currency

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
    retry: 1,
  });

  const { data: userCounts } = api.users.countByRole.useQuery(undefined, {
    retry: 1,
  });

  const { data: flywheel } = api.analytics.getFlywheelKpis.useQuery(undefined, {
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
      <div className="flex flex-col gap-6 p-4 pb-24 md:p-8 stagger-children">
        <div className="space-y-3">
          <div className="h-9 w-56 shimmer rounded-lg bg-muted" />
          <div className="h-4 w-40 shimmer rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 shimmer rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 shimmer rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 shimmer rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (errorOverview || !overview) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-24">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">
            Impossible de charger le tableau de bord
          </p>
          <p className="text-xs text-muted-foreground">
            Vérifiez votre connexion et réessayez.
          </p>
        </div>
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
    <div className="flex flex-col gap-6 p-4 pb-24 md:p-8 animate-page-enter">
      {/* ── 1. Hero greeting ── */}
      <div className="space-y-1">
        <h1 className="text-display-xl">
          Bonjour{firstName ? ` ${firstName}` : ""} <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
        </h1>
        <p className="text-sm text-muted-foreground capitalize">{todayLabel}</p>
        <p className="text-xs text-muted-foreground/70">{subtitle}</p>
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

      {/* ── 4. Flywheel Ops ── */}
      {flywheel && (
        <section className="space-y-3">
          <SectionHeader>Flywheel Opérationnel</SectionHeader>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <FlywheelCard
              label="Leads actifs"
              value={flywheel.activeLeads}
              icon={Target}
              color="#8B5CF6"
              subtitle="stratégies en cours"
              href="/impulsion"
            />
            <FlywheelCard
              label="Projets"
              value={flywheel.activeMissions}
              icon={Briefcase}
              color="#3B82F6"
              subtitle="missions actives"
              href="/pilotis"
            />
            <FlywheelCard
              label="Talents Guilde"
              value={flywheel.totalTalents}
              icon={Sparkles}
              color="#F59E0B"
              subtitle="freelances"
              href="/guilde"
            />
            <FlywheelCard
              label="Livrés ce mois"
              value={flywheel.completedThisMonth}
              icon={TrendingUp}
              color="#22C55E"
              subtitle="stratégies finalisées"
            />
          </div>
        </section>
      )}

      {/* ── 5. Portal quick-access ── */}
      <section className="space-y-3">
        <SectionHeader>Portails</SectionHeader>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {OPERATOR_PORTALS.map((portal) => {
            const Icon = resolveIcon(portal.iconName);
            return (
              <button
                key={portal.id}
                onClick={() => router.push(portal.href)}
                className="group relative flex flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 cursor-pointer overflow-hidden"
                style={{
                  borderColor: `${portal.color}20`,
                }}
              >
                {/* Subtle gradient background on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${portal.color}08 0%, transparent 60%)`,
                  }}
                />
                <div className="relative flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl transition-shadow duration-200 group-hover:shadow-lg"
                    style={{
                      backgroundColor: `${portal.color}12`,
                    }}
                  >
                    <Icon
                      className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                      style={{ color: portal.color }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold group-hover:text-foreground transition-colors font-[var(--font-display)]">
                      {portal.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {portal.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 6. Financial snapshot ── */}
      <section className="space-y-3">
        <SectionHeader>Finance</SectionHeader>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FinanceCard
            label="Chiffre d'affaires"
            icon={DollarSign}
            value={finance ? `${formatCompact(finance.totalRevenue)} FCFA` : undefined}
            loading={loadingFinance}
            color="#10B981"
          />
          <FinanceCard
            label="Impayés"
            icon={FileWarning}
            value={finance ? `${formatCompact(finance.unpaidAmount)} FCFA` : undefined}
            loading={loadingFinance}
            alert={finance ? finance.unpaidAmount > 0 : false}
            color="#F59E0B"
          />
          <FinanceCard
            label="Factures payées"
            icon={Receipt}
            value={finance ? String(finance.paidInvoicesCount) : undefined}
            loading={loadingFinance}
            color="#3B82F6"
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
            color="#8B5CF6"
          />
        </div>
      </section>

      {/* ── 7. Users quick-access ── */}
      {userCounts && (
        <section className="space-y-3">
          <SectionHeader>Utilisateurs</SectionHeader>
          <button
            onClick={() => router.push("/serenite/users")}
            className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 shrink-0">
              <Users className="h-5 w-5 text-cyan-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold group-hover:text-cyan-500 transition-colors font-[var(--font-display)]">
                {userCounts.total} utilisateur{userCounts.total !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {Object.entries(userCounts.counts)
                  .map(([role, count]) => `${count} ${role.toLowerCase().replace("_", " ")}`)
                  .join(" · ")}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 shrink-0" />
          </button>
        </section>
      )}

      {/* ── 8. Recent activity ── */}
      {overview.recentActivity && overview.recentActivity.length > 0 && (
        <section className="space-y-3">
          <SectionHeader>Activité récente</SectionHeader>
          <Card>
            <CardContent className="divide-y divide-border/50">
              {overview.recentActivity.slice(0, 8).map((activity, i) => (
                <button
                  key={`${activity.strategyId}-${i}`}
                  onClick={() =>
                    router.push(`/impulsion/brand/${activity.strategyId}`)
                  }
                  className="flex w-full items-center justify-between gap-3 py-3 text-left group cursor-pointer first:pt-0 last:pb-0 transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-lg"
                >
                  {/* Timeline dot */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                      {i < (overview.recentActivity?.length ?? 0) - 1 && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-6 bg-border/40" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {activity.brandName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.action}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground/60 tabular-nums">
                      {relativeTime(activity.updatedAt)}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
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
// Section header
// ---------------------------------------------------------------------------
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-[var(--font-display)]">
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Flywheel card sub-component
// ---------------------------------------------------------------------------
function FlywheelCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
  href,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  subtitle: string;
  href?: string;
}) {
  const router = useRouter();
  return (
    <Card
      className="py-4 md:py-4 group transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 cursor-pointer overflow-hidden relative"
      onClick={href ? () => router.push(href) : undefined}
    >
      {/* Subtle gradient bg */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)`,
        }}
      />
      <CardContent className="relative flex items-start gap-3 px-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-shadow duration-200 group-hover:shadow-lg"
          style={{ backgroundColor: `${color}12` }}
        >
          <Icon
            className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
            style={{ color }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground truncate font-medium">
            {label}
          </p>
          <p
            className="text-xl font-bold tabular-nums font-[var(--font-display)]"
            style={{ color }}
          >
            {value}
          </p>
          <p className="text-[10px] text-muted-foreground/50 truncate">
            {subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
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
  color = "#64748B",
}: {
  label: string;
  icon: LucideIcon;
  value: string | undefined;
  loading: boolean;
  alert?: boolean;
  color?: string;
}) {
  return (
    <Card className="py-4 md:py-4 transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5">
      <CardContent className="flex items-start gap-3 px-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}12` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground truncate font-medium">
            {label}
          </p>
          {loading ? (
            <div className="h-5 w-20 shimmer rounded-md bg-muted mt-1" />
          ) : (
            <p
              className={`text-sm font-bold truncate tabular-nums ${alert ? "text-amber-500" : ""}`}
            >
              {value ?? "—"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
