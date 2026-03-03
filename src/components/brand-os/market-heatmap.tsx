// ==========================================================================
// C.OS3 — Market Heatmap
// Geographic distribution of superfans across West African markets.
// ==========================================================================

"use client";

interface MarketData {
  market: string | null;
  count: number;
  avgDepth: number;
}

interface MarketHeatmapProps {
  data: MarketData[];
}

const MARKET_CONFIG: Record<string, { label: string; flag: string }> = {
  CM: { label: "Cameroun", flag: "🇨🇲" },
  CI: { label: "Côte d'Ivoire", flag: "🇨🇮" },
  SN: { label: "Sénégal", flag: "🇸🇳" },
  GH: { label: "Ghana", flag: "🇬🇭" },
  NG: { label: "Nigéria", flag: "🇳🇬" },
};

function getIntensityColor(count: number, maxCount: number): string {
  if (maxCount === 0) return "rgba(245, 158, 11, 0.05)";
  const ratio = count / maxCount;
  if (ratio > 0.7) return "rgba(245, 158, 11, 0.4)";
  if (ratio > 0.4) return "rgba(245, 158, 11, 0.25)";
  if (ratio > 0.1) return "rgba(245, 158, 11, 0.15)";
  return "rgba(245, 158, 11, 0.07)";
}

export function MarketHeatmap({ data }: MarketHeatmapProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalFans = data.reduce((sum, d) => sum + d.count, 0);

  const markets = Object.entries(MARKET_CONFIG).map(([code, config]) => {
    const match = data.find((d) => d.market === code);
    return {
      code,
      ...config,
      count: match?.count ?? 0,
      avgDepth: match?.avgDepth ?? 0,
      pct: totalFans > 0 ? ((match?.count ?? 0) / totalFans * 100).toFixed(1) : "0",
    };
  });

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Répartition géographique
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {markets.map((m) => (
          <div
            key={m.code}
            className="rounded-xl border border-border/50 p-3 flex flex-col items-center gap-1 transition-colors"
            style={{ backgroundColor: getIntensityColor(m.count, maxCount) }}
          >
            <span className="text-2xl">{m.flag}</span>
            <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
            <span className="text-lg font-bold tabular-nums text-foreground">
              {m.count.toLocaleString("fr-FR")}
            </span>
            <span className="text-[10px] text-muted-foreground">{m.pct}%</span>
            {m.avgDepth > 0 && (
              <div className="w-full mt-1">
                <div className="h-1 rounded-full bg-muted-foreground/10">
                  <div
                    className="h-1 rounded-full bg-amber-500/60 transition-all"
                    style={{ width: `${m.avgDepth}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">Profondeur: {m.avgDepth}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
