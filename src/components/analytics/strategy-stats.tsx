"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CoherenceGauge } from "~/components/analytics/coherence-gauge";
import {
  Target,
  CheckCircle2,
  Layers,
  CalendarClock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StrategyInput {
  status: string;
  coherenceScore?: number | null;
  createdAt: Date;
  pillars: Array<{ status: string }>;
}

interface StrategyStatsProps {
  strategies: StrategyInput[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

function formatMonth(date: Date): string {
  const d = new Date(date);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StrategyStats({ strategies }: StrategyStatsProps) {
  const stats = useMemo(() => {
    // Average coherence score across strategies that have one
    const withScore = strategies.filter(
      (s): s is StrategyInput & { coherenceScore: number } =>
        s.coherenceScore != null,
    );
    const avgCoherence =
      withScore.length > 0
        ? Math.round(
            withScore.reduce((sum, s) => sum + s.coherenceScore, 0) /
              withScore.length,
          )
        : 0;

    // Completion rate
    const completedStrategies = strategies.filter(
      (s) => s.status === "complete",
    ).length;
    const completionRate =
      strategies.length > 0
        ? Math.round((completedStrategies / strategies.length) * 100)
        : 0;

    // Total completed pillars across all strategies
    const totalPillarsGenerated = strategies.reduce(
      (count, s) =>
        count + s.pillars.filter((p) => p.status === "complete").length,
      0,
    );

    // Most productive month
    const monthCounts = new Map<string, number>();
    for (const s of strategies) {
      const key = formatMonth(s.createdAt);
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
    }
    let mostProductiveMonth = "--";
    let maxCount = 0;
    for (const [month, count] of monthCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostProductiveMonth = month;
      }
    }

    return {
      avgCoherence,
      completionRate,
      completedStrategies,
      totalPillarsGenerated,
      mostProductiveMonth,
    };
  }, [strategies]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Average Coherence Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Score de cohérence moyen
          </CardTitle>
          <Target className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <CoherenceGauge score={stats.avgCoherence} size="sm" />
            <div>
              <p className="text-2xl font-bold">{stats.avgCoherence}</p>
              <p className="text-muted-foreground text-xs">sur 100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Taux de complétion
          </CardTitle>
          <CheckCircle2 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.completionRate}%</p>
          <p className="text-muted-foreground text-xs">
            {stats.completedStrategies} stratégie
            {stats.completedStrategies !== 1 ? "s" : ""} terminée
            {stats.completedStrategies !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {/* Total Pillars Generated */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Piliers générés
          </CardTitle>
          <Layers className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.totalPillarsGenerated}</p>
          <p className="text-muted-foreground text-xs">
            piliers avec statut complet
          </p>
        </CardContent>
      </Card>

      {/* Most Productive Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Mois le plus productif
          </CardTitle>
          <CalendarClock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.mostProductiveMonth}</p>
          <p className="text-muted-foreground text-xs">
            en nombre de stratégies créées
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
