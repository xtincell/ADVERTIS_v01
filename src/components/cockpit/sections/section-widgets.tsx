// =============================================================================
// COMPONENT C.K10 — Section Widgets
// =============================================================================
// Widget grid with auto-compute for cockpit analytics.
// Props: strategyId.
// Key features: 4 widget types (superfan_tracker, campaign_tracker,
// da_visual_identity, codb_calculator), auto-compute on first load if pending,
// per-widget data fetching via tRPC, specialized renderers per widget type
// (score gauges, fan level bars, campaign calendar preview, health indicators,
// DA completeness breakdown), manual recalculate button.
// =============================================================================

"use client";

// Section Widgets — Displays all cockpit widgets (superfan, campaign, DA, CoDB)
// in a responsive grid inside the cockpit view.

import { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Loader2,
  Palette,
  RefreshCcw,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { getScoreColor, getScoreBorderColor, getScoreLabel } from "../cockpit-shared";

// ---------------------------------------------------------------------------
// Widget icon map
// ---------------------------------------------------------------------------

const WIDGET_ICONS: Record<string, React.ReactNode> = {
  superfan_tracker: <Users className="h-5 w-5" />,
  campaign_tracker: <Calendar className="h-5 w-5" />,
  da_visual_identity: <Palette className="h-5 w-5" />,
  codb_calculator: <DollarSign className="h-5 w-5" />,
};

const WIDGET_LABELS: Record<string, { title: string; description: string }> = {
  superfan_tracker: {
    title: "Superfan Tracker",
    description: "Niveaux de fans et matrice d'engagement",
  },
  campaign_tracker: {
    title: "Campaign Tracker",
    description: "Calendrier annuel, Big Idea et readiness",
  },
  da_visual_identity: {
    title: "Direction Artistique",
    description: "Complétude identité visuelle et tonale",
  },
  codb_calculator: {
    title: "Cost of Doing Business",
    description: "Unit economics et santé financière",
  },
};

// ---------------------------------------------------------------------------
// Individual widget card renderers
// ---------------------------------------------------------------------------

function WidgetScoreGauge({ score, label }: { score: number; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${getScoreBorderColor(score)}`}>
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</span>
      </div>
      {label && (
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className={`text-xs font-semibold ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
        </div>
      )}
    </div>
  );
}

function InsightsList({ insights }: { insights: string[] }) {
  if (!insights || insights.length === 0) return null;
  return (
    <div className="mt-3 space-y-1.5">
      {insights.slice(0, 3).map((insight, i) => (
        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
          <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
          <span>{insight}</span>
        </div>
      ))}
    </div>
  );
}

function HealthIndicator({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-red-400" />
      )}
      <span className="text-[11px]">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaign Widget Card
// ---------------------------------------------------------------------------

function CampaignWidgetCard({ data }: { data: Record<string, unknown> }) {
  const d = data as {
    bigIdea: { concept: string; mechanism: string; declinaisonCount: number } | null;
    annualCalendar: Array<{ mois: string; campagne: string; objectif: string; canaux: string[]; budget: string; kpiCible: string }>;
    campaignTemplateCount: number;
    activationPhases: { teasing: boolean; lancement: boolean; amplification: boolean; fidelisation: boolean };
    totalBudgetAllocated: string;
    campaignReadinessScore: number;
    insights: string[];
  };

  const calendarCount = Array.isArray(d.annualCalendar) ? d.annualCalendar.length : 0;
  const activeFilled = [d.activationPhases?.teasing, d.activationPhases?.lancement, d.activationPhases?.amplification, d.activationPhases?.fidelisation].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <WidgetScoreGauge score={d.campaignReadinessScore} label="Campaign Readiness" />

      {d.bigIdea && (
        <div className="rounded-md border bg-amber-50/50 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Big Idea</p>
          <p className="mt-0.5 text-xs font-medium">{d.bigIdea.concept || "—"}</p>
          {d.bigIdea.mechanism && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{d.bigIdea.mechanism}</p>
          )}
        </div>
      )}

      {/* Calendar preview — top 4 campaigns */}
      {calendarCount > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Calendrier</p>
          {d.annualCalendar.slice(0, 4).map((entry, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border px-2 py-1">
              <span className="text-[10px] font-semibold text-terracotta w-[28px]">{entry.mois?.substring(0, 3)}</span>
              <span className="text-[11px] truncate flex-1">{entry.campagne}</span>
              <span className="text-[10px] text-muted-foreground">{entry.budget}</span>
            </div>
          ))}
          {calendarCount > 4 && (
            <p className="text-[10px] text-muted-foreground text-center">
              +{calendarCount - 4} autres campagnes
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border p-1.5">
          <p className="text-lg font-bold">{calendarCount}</p>
          <p className="text-[10px] text-muted-foreground">Campagnes</p>
        </div>
        <div className="rounded-md border p-1.5">
          <p className="text-lg font-bold">{d.campaignTemplateCount}</p>
          <p className="text-[10px] text-muted-foreground">Templates</p>
        </div>
        <div className="rounded-md border p-1.5">
          <p className="text-lg font-bold">{activeFilled}/4</p>
          <p className="text-[10px] text-muted-foreground">Phases</p>
        </div>
      </div>

      {d.totalBudgetAllocated && (
        <p className="text-xs text-muted-foreground">
          Budget total : <span className="font-semibold text-foreground">{d.totalBudgetAllocated}</span>
        </p>
      )}

      <InsightsList insights={d.insights} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DA Widget Card
// ---------------------------------------------------------------------------

function DaWidgetCard({ data }: { data: Record<string, unknown> }) {
  const d = data as {
    visualIdentityScore: number;
    components: Record<string, boolean>;
    completenessBreakdown: Array<{ component: string; filled: boolean; weight: number }>;
    insights: string[];
  };

  return (
    <div className="space-y-3">
      <WidgetScoreGauge score={d.visualIdentityScore} label="Identité Visuelle" />

      {d.completenessBreakdown && (
        <div className="space-y-1.5">
          {d.completenessBreakdown.map((item) => (
            <div key={item.component} className="flex items-center gap-2">
              <span className="w-[100px] truncate text-[11px]">{item.component}</span>
              <div className="flex-1">
                <Progress value={item.filled ? 100 : 0} className="h-1.5" />
              </div>
              <span className="text-[10px] text-muted-foreground w-[30px] text-right">
                {item.filled ? item.weight : 0}/{item.weight}
              </span>
            </div>
          ))}
        </div>
      )}

      <InsightsList insights={d.insights} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CoDB Widget Card
// ---------------------------------------------------------------------------

function CodbWidgetCard({ data }: { data: Record<string, unknown> }) {
  const d = data as {
    unitEconomics: { cac: string; ltv: string; ltvCacRatio: string; pointMort: string; marges: string };
    costStructure: { capex: string; opex: string; frictionCount: number };
    healthIndicators: { ltvCacHealthy: boolean; hasBreakeven: boolean; hasMargins: boolean; hasBudget: boolean };
    codbReadinessScore: number;
    insights: string[];
  };

  return (
    <div className="space-y-3">
      <WidgetScoreGauge score={d.codbReadinessScore} label="CoDB Readiness" />

      <div className="grid grid-cols-2 gap-2">
        {d.unitEconomics?.cac && (
          <div className="rounded-md border bg-muted/20 p-2 text-center">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">CAC</p>
            <p className="text-sm font-bold">{d.unitEconomics.cac}</p>
          </div>
        )}
        {d.unitEconomics?.ltv && (
          <div className="rounded-md border bg-muted/20 p-2 text-center">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">LTV</p>
            <p className="text-sm font-bold">{d.unitEconomics.ltv}</p>
          </div>
        )}
      </div>

      {d.unitEconomics?.ltvCacRatio && (
        <p className="text-xs text-muted-foreground">
          Ratio LTV/CAC : <span className="font-semibold text-foreground">{d.unitEconomics.ltvCacRatio}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <HealthIndicator label="LTV/CAC sain" ok={d.healthIndicators?.ltvCacHealthy ?? false} />
        <HealthIndicator label="Point mort" ok={d.healthIndicators?.hasBreakeven ?? false} />
        <HealthIndicator label="Marges" ok={d.healthIndicators?.hasMargins ?? false} />
        <HealthIndicator label="Budget" ok={d.healthIndicators?.hasBudget ?? false} />
      </div>

      <InsightsList insights={d.insights} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Superfan Widget Card
// ---------------------------------------------------------------------------

function SuperfanWidgetCard({ data }: { data: Record<string, unknown> }) {
  const d = data as {
    fanLevels: Array<{ level: string; count: number; percentage: number }>;
    engagementScore: number;
    insights: string[];
  };

  return (
    <div className="space-y-3">
      <WidgetScoreGauge score={d.engagementScore ?? 0} label="Engagement Score" />

      {d.fanLevels && d.fanLevels.length > 0 && (
        <div className="space-y-1.5">
          {d.fanLevels.map((level) => (
            <div key={level.level} className="flex items-center gap-2">
              <span className="w-[80px] truncate text-[11px] font-medium">{level.level}</span>
              <div className="flex-1">
                <Progress value={level.percentage} className="h-1.5" />
              </div>
              <span className="text-[10px] text-muted-foreground w-[30px] text-right">
                {level.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}

      <InsightsList insights={d.insights} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic widget card (fallback)
// ---------------------------------------------------------------------------

function GenericWidgetCard({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="text-xs text-muted-foreground">
      <p>Widget calculé avec succès.</p>
      <p className="mt-1">{Object.keys(data).length} champs de données.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget Card Router
// ---------------------------------------------------------------------------

function WidgetDataRenderer({ widgetType, data }: { widgetType: string; data: Record<string, unknown> }) {
  switch (widgetType) {
    case "campaign_tracker":
      return <CampaignWidgetCard data={data} />;
    case "da_visual_identity":
      return <DaWidgetCard data={data} />;
    case "codb_calculator":
      return <CodbWidgetCard data={data} />;
    case "superfan_tracker":
      return <SuperfanWidgetCard data={data} />;
    default:
      return <GenericWidgetCard data={data} />;
  }
}

// ---------------------------------------------------------------------------
// Single Widget Card with data fetching
// ---------------------------------------------------------------------------

function WidgetCard({
  widgetId,
  strategyId,
  available,
  status,
}: {
  widgetId: string;
  strategyId: string;
  available: boolean;
  status: string;
}) {
  const info = WIDGET_LABELS[widgetId] ?? { title: widgetId, description: "" };
  const icon = WIDGET_ICONS[widgetId] ?? <BarChart3 className="h-5 w-5" />;

  const { data: widgetData, isLoading } = api.widget.getData.useQuery(
    { widgetId, strategyId },
    {
      enabled: available && status === "complete",
      retry: false,
    },
  );

  // Not available — pillar requirements not met
  if (!available) {
    return (
      <Card className="opacity-50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {icon}
            </div>
            <div>
              <CardTitle className="text-sm">{info.title}</CardTitle>
              <CardDescription className="text-[11px]">{info.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Piliers requis non complétés</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending or computing
  if (status !== "complete" || isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {icon}
            </div>
            <div>
              <CardTitle className="text-sm">{info.title}</CardTitle>
              <CardDescription className="text-[11px]">{info.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{isLoading ? "Chargement..." : "En attente de calcul"}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Complete with data
  const data = (widgetData?.data ?? {}) as Record<string, unknown>;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-terracotta/10 text-terracotta">
            {icon}
          </div>
          <div>
            <CardTitle className="text-sm">{info.title}</CardTitle>
            <CardDescription className="text-[11px]">{info.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <WidgetDataRenderer widgetType={widgetId} data={data} />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// SectionWidgets — Main export
// ---------------------------------------------------------------------------

export function SectionWidgets({ strategyId }: { strategyId: string }) {
  const [isComputing, setIsComputing] = useState(false);
  const autoComputeTriggered = useRef(false);

  const {
    data: widgets,
    isLoading,
    refetch,
  } = api.widget.listAvailable.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const computeAll = api.widget.computeAll.useMutation({
    onMutate: () => setIsComputing(true),
    onSettled: () => {
      setIsComputing(false);
      void refetch();
    },
  });

  // Auto-compute widgets on first load if any are pending but available
  useEffect(() => {
    if (!widgets || autoComputeTriggered.current || isComputing) return;
    const hasPending = widgets.some((w) => w.available && w.status !== "complete");
    const hasAvailable = widgets.some((w) => w.available);
    if (hasPending && hasAvailable) {
      autoComputeTriggered.current = true;
      computeAll.mutate({ strategyId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgets, strategyId]);

  if (isLoading || !widgets) return null;

  // Only show section if at least one widget is available
  const availableWidgets = widgets.filter((w) => w.available);
  if (availableWidgets.length === 0 && widgets.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Widgets Analytiques</h2>
          <p className="text-sm text-muted-foreground">
            Métriques calculées à partir de vos piliers
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => computeAll.mutate({ strategyId })}
          disabled={isComputing}
        >
          {isComputing ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
          )}
          Recalculer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {widgets.map((w) => (
          <WidgetCard
            key={w.id}
            widgetId={w.id}
            strategyId={strategyId}
            available={w.available}
            status={w.status}
          />
        ))}
      </div>
    </section>
  );
}
