// ==========================================================================
// C.A2 — Sector Benchmark
// Displays sector-level benchmarks with percentile positioning.
// ==========================================================================

"use client";

import { BarChart3, TrendingUp, Shield, Target } from "lucide-react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface SectorBenchmarkProps {
  /** If provided, shows the strategy's percentile position within its sector */
  strategyId?: string;
}

function MetricBar({
  label,
  icon: Icon,
  avg,
  p25,
  p75,
  percentile,
  color,
}: {
  label: string;
  icon: React.ElementType;
  avg: number;
  p25: number;
  p75: number;
  percentile?: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 font-medium">
          <Icon className={`h-3 w-3 ${color}`} />
          {label}
        </div>
        <span className="text-muted-foreground">
          moy. {avg} | P25: {p25} | P75: {p75}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        {/* Interquartile range bar */}
        <div
          className={`absolute h-full rounded-full opacity-30 ${color.replace("text-", "bg-")}`}
          style={{
            left: `${p25}%`,
            width: `${Math.max(p75 - p25, 2)}%`,
          }}
        />
        {/* Average marker */}
        <div
          className={`absolute h-full w-0.5 ${color.replace("text-", "bg-")}`}
          style={{ left: `${avg}%` }}
        />
        {/* Strategy position (if provided) */}
        {percentile != null && (
          <div
            className="absolute -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-foreground shadow"
            style={{ left: `${Math.min(percentile, 97)}%` }}
          />
        )}
      </div>
      {percentile != null && (
        <div className="text-right text-xs font-medium">
          Top {100 - percentile}%
        </div>
      )}
    </div>
  );
}

export function SectorBenchmark({ strategyId }: SectorBenchmarkProps) {
  const { data, isLoading } = api.analytics.getSectorBenchmarks.useQuery(
    strategyId ? { strategyId } : undefined,
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Chargement des benchmarks...
        </CardContent>
      </Card>
    );
  }

  if (!data || data.sectors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {data.sectors
        .filter((s) => s.count >= 2) // Only show sectors with enough data
        .map((sector) => {
          const isStrategySector =
            data.strategyPercentile?.sector === sector.sector;

          return (
            <Card key={sector.sector}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  {sector.label}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({sector.count} marques)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <MetricBar
                  label="Coherence"
                  icon={TrendingUp}
                  avg={sector.coherence.avg}
                  p25={sector.coherence.p25}
                  p75={sector.coherence.p75}
                  percentile={
                    isStrategySector
                      ? data.strategyPercentile?.coherencePercentile
                      : undefined
                  }
                  color="text-emerald-500"
                />
                <MetricBar
                  label="Risque"
                  icon={Shield}
                  avg={sector.risk.avg}
                  p25={sector.risk.p25}
                  p75={sector.risk.p75}
                  percentile={
                    isStrategySector
                      ? data.strategyPercentile?.riskPercentile
                      : undefined
                  }
                  color="text-amber-500"
                />
                <MetricBar
                  label="Brand-Market Fit"
                  icon={Target}
                  avg={sector.bmf.avg}
                  p25={sector.bmf.p25}
                  p75={sector.bmf.p75}
                  percentile={
                    isStrategySector
                      ? data.strategyPercentile?.bmfPercentile
                      : undefined
                  }
                  color="text-blue-500"
                />
              </CardContent>
            </Card>
          );
        })}

      {data.sectors.filter((s) => s.count >= 2).length === 0 && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Ajoutez plus de marques dans le meme secteur pour debloquer les
            benchmarks sectoriels.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
