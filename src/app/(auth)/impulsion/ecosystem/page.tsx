// =============================================================================
// PAGE P.ECOSYSTEM — UPGRADERS Flywheel Dashboard
// =============================================================================
// Unified dashboard showing the 5 ecosystem pillars health, missions pipeline,
// talent pool, revenue pipeline, client journey, and activity feed.
// Uses: api.ecosystem.flywheel, missionsPipeline, talentHealth, revenue,
//       clientJourney, activity, kpis
// =============================================================================

"use client";

import {
  Zap,
  Compass,
  Users,
  Shield,
  Radio,
  TrendingUp,
  Briefcase,
  DollarSign,
  UserCheck,
  Activity,
  Star,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";
import { PageHeader } from "~/components/ui/page-header";
import {
  MISSION_STATUS_LABELS,
  TALENT_LEVEL_LABELS,
  TALENT_LEVEL_CONFIG,
  TALENT_CATEGORY_LABELS,
  TALENT_AVAILABILITY_LABELS,
  INVOICE_STATUS_LABELS,
  type MissionStatus,
  type TalentLevel,
  type TalentCategory,
  type TalentAvailability,
  type InvoiceStatus,
} from "~/lib/constants";

const PILLAR_ICONS: Record<string, typeof Zap> = {
  impulsion: Zap,
  pilotis: Compass,
  guilde: Users,
  serenite: Shield,
  source: Radio,
};

const PILLAR_COLORS: Record<string, string> = {
  impulsion: "#F59E0B",
  pilotis: "#3B82F6",
  guilde: "#059669",
  serenite: "#8B5CF6",
  source: "#EF4444",
};

const HEALTH_BADGES: Record<string, { label: string; variant: string; className: string }> = {
  healthy: { label: "Sain", variant: "default", className: "bg-green-100 text-green-800" },
  warning: { label: "Attention", variant: "outline", className: "bg-amber-100 text-amber-800" },
  critical: { label: "Critique", variant: "destructive", className: "bg-red-100 text-red-800" },
  idle: { label: "Inactif", variant: "secondary", className: "bg-muted text-muted-foreground" },
};

export default function EcosystemDashboardPage() {
  const { data: flywheel, isLoading: flywheelLoading } =
    api.ecosystem.flywheel.useQuery();
  const { data: kpis, isLoading: kpisLoading } =
    api.ecosystem.kpis.useQuery();
  const { data: pipeline } = api.ecosystem.missionsPipeline.useQuery();
  const { data: talentHealth } = api.ecosystem.talentHealth.useQuery();
  const { data: revenue } = api.ecosystem.revenue.useQuery();
  const { data: clientJourney } = api.ecosystem.clientJourney.useQuery();
  const { data: activity } = api.ecosystem.activity.useQuery();

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  const isLoading = flywheelLoading || kpisLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-4 md:grid-cols-5 stagger-children">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted/50 shimmer" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-4 mb-6 stagger-children">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/50 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Écosystème UPGRADERS"
        description="Vue d'ensemble du flywheel — santé des 5 piliers"
        backHref="/impulsion"
        backLabel="Retour au menu"
      />

      {/* ── Row 1: Flywheel Pillars ── */}
      {flywheel && (
        <div className="grid gap-4 md:grid-cols-5">
          {flywheel.pillars.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.id] ?? Activity;
            const color = PILLAR_COLORS[pillar.id] ?? "#6B7280";
            const healthEntry = HEALTH_BADGES[pillar.health] ?? { label: "Inconnu", variant: "secondary", className: "bg-muted text-muted-foreground" };

            return (
              <div
                key={pillar.id}
                className="rounded-xl border bg-white p-4 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ backgroundColor: color }}
                />
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <Icon className="h-4 w-4" style={{ color }} />
                  <span className="text-xs font-semibold" style={{ color }}>
                    {pillar.name}
                  </span>
                </div>
                <div className="text-2xl font-bold tabular-nums mb-1">
                  {typeof pillar.metric === "number"
                    ? fmt(pillar.metric)
                    : pillar.metric}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {pillar.label}
                </div>
                <Badge className={`text-[10px] ${healthEntry.className}`}>
                  {healthEntry.label}
                </Badge>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Row 2: KPI Cards ── */}
      {kpis && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Revenus totaux
            </div>
            <div className="text-xl font-bold tabular-nums">{fmt(kpis.totalRevenue)}</div>
            <div className="text-xs text-muted-foreground">XAF encaissés</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              Missions / 30j
            </div>
            <div className="text-xl font-bold tabular-nums">{kpis.monthlyMissions}</div>
            <div className="text-xs text-muted-foreground">nouvelles missions</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              Talents actifs
            </div>
            <div className="text-xl font-bold tabular-nums">{kpis.activeTalents}</div>
            <div className="text-xs text-muted-foreground">disponibles dans La Guilde</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Star className="h-4 w-4 text-amber-500" />
              NPS estimé
            </div>
            <div className="text-xl font-bold tabular-nums">
              {kpis.avgNPS != null ? kpis.avgNPS : "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              {kpis.totalClients} clients • {fmt(kpis.avgMissionValue)} XAF / mission
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3: Pipeline + Talent Pool ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Missions Pipeline */}
        {pipeline && (
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Pipeline Missions ({pipeline.total})
            </h2>
            <div className="space-y-2">
              {pipeline.stages.map((stage) => (
                <div key={stage.status} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-muted-foreground truncate">
                    {MISSION_STATUS_LABELS[stage.status as MissionStatus] ?? stage.status}
                  </div>
                  <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max(stage.percentage, 8)}%`,
                      }}
                    >
                      <span className="text-[10px] text-white font-medium">
                        {stage.count}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 text-xs text-muted-foreground text-right">
                    {stage.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Talent Pool */}
        {talentHealth && (
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Pool Talents ({talentHealth.total})
            </h2>

            {/* By Level */}
            <div className="mb-4">
              <div className="text-xs font-medium text-muted-foreground mb-2">Par niveau</div>
              <div className="flex flex-wrap gap-2">
                {talentHealth.byLevel.map((g) => {
                  const lvl = g.level as TalentLevel;
                  const config = TALENT_LEVEL_CONFIG[lvl];
                  return (
                    <div
                      key={g.level}
                      className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5"
                    >
                      <span className="text-sm">{config?.emoji ?? "?"}</span>
                      <span className="text-xs font-medium">
                        {TALENT_LEVEL_LABELS[lvl] ?? g.level}
                      </span>
                      <Badge variant="secondary" className="text-[10px] ml-1">
                        {g.count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Category */}
            <div className="mb-4">
              <div className="text-xs font-medium text-muted-foreground mb-2">Par catégorie</div>
              <div className="flex flex-wrap gap-2">
                {talentHealth.byCategory.map((g) => (
                  <div
                    key={g.category}
                    className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5"
                  >
                    <span className="text-xs">
                      {TALENT_CATEGORY_LABELS[g.category as TalentCategory] ?? g.category}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {g.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* By Availability */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Par disponibilité</div>
              <div className="flex flex-wrap gap-2">
                {talentHealth.byAvailability.map((g) => (
                  <Badge key={g.availability} variant="outline" className="text-xs">
                    {TALENT_AVAILABILITY_LABELS[g.availability as TalentAvailability] ?? g.availability}: {g.count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Row 4: Revenue Pipeline + Client Journey ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Pipeline */}
        {revenue && (
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Pipeline Revenus
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <div className="text-lg font-bold tabular-nums text-green-700">
                  {fmt(revenue.collected)}
                </div>
                <div className="text-[10px] text-green-600">
                  Encaissé ({revenue.collectedCount})
                </div>
              </div>
              <div className="rounded-lg bg-orange-50 p-3 text-center">
                <div className="text-lg font-bold tabular-nums text-orange-700">
                  {fmt(revenue.pending)}
                </div>
                <div className="text-[10px] text-orange-600">
                  En attente ({revenue.pendingCount})
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <div className="text-lg font-bold tabular-nums text-muted-foreground">
                  {fmt(revenue.draft)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Brouillons ({revenue.draftCount})
                </div>
              </div>
            </div>
            {revenue.breakdown.length > 0 && (
              <div className="space-y-1">
                {revenue.breakdown.map((b) => (
                  <div
                    key={b.status}
                    className="flex items-center justify-between text-xs p-2 rounded hover:bg-muted/20"
                  >
                    <Badge variant="outline" className="text-[10px]">
                      {INVOICE_STATUS_LABELS[b.status as InvoiceStatus] ?? b.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {b.count} factures • {fmt(b.total)} XAF
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Client Journey */}
        {clientJourney && (
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Parcours Clients ({clientJourney.totalClients})
            </h2>
            {clientJourney.phases.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                Aucune stratégie active.
              </div>
            ) : (
              <div className="space-y-3">
                {clientJourney.phases.map((phase, idx) => (
                  <div key={phase.phase} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{phase.phase}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {phase.count} stratégies
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Row 5: Activity Feed ── */}
      {activity && activity.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Activité Récente
          </h2>
          <div className="space-y-2">
            {activity.map((item, idx) => {
              const typeIcons: Record<string, typeof Briefcase> = {
                mission: Briefcase,
                review: Star,
                invoice: DollarSign,
                signal: Radio,
              };
              const typeColors: Record<string, string> = {
                mission: "text-blue-600",
                review: "text-amber-600",
                invoice: "text-green-600",
                signal: "text-red-500",
              };
              const Icon = typeIcons[item.type] ?? Activity;
              const color = typeColors[item.type] ?? "text-muted-foreground";

              return (
                <div
                  key={`${item.type}-${item.id}-${idx}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20"
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.detail}</div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
