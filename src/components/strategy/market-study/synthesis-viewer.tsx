// ==========================================================================
// C.MS4 — Synthesis Viewer
// Market study synthesis display.
// ==========================================================================

"use client";

import {
  BarChart3,
  Users,
  TrendingUp,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type {
  MarketStudySynthesis,
  DataConfidence,
} from "~/lib/types/market-study";
import {
  CONFIDENCE_LABELS,
  CONFIDENCE_COLORS,
} from "~/lib/types/market-study";

interface SynthesisViewerProps {
  synthesis: MarketStudySynthesis;
  className?: string;
}

export function SynthesisViewer({ synthesis, className }: SynthesisViewerProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall confidence score */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div>
          <h3 className="text-sm font-semibold">Score de confiance global</h3>
          <p className="text-xs text-muted-foreground">
            Basé sur la qualité et la diversité des données collectées
          </p>
        </div>
        <ConfidenceScore value={synthesis.overallConfidence} />
      </div>

      {/* Source summary */}
      {synthesis.sourceSummary && (
        <div className="rounded-lg border p-4 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Résumé des sources
          </h4>
          <div className="flex gap-4 text-xs">
            <span>
              <strong>{synthesis.sourceSummary.totalDataPoints}</strong> données totales
            </span>
            {Object.entries(synthesis.sourceSummary.byConfidence).map(
              ([conf, count]) => (
                <span key={conf} className="flex items-center gap-1">
                  <ConfidenceBadge confidence={conf as DataConfidence} />
                  <span>{count}</span>
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {/* Market Size */}
      <SynthesisSection
        icon={BarChart3}
        title="Taille du marché"
        confidence={synthesis.marketSize.confidence}
        sources={synthesis.marketSize.sources}
      >
        <p className="text-sm">{synthesis.marketSize.data}</p>
      </SynthesisSection>

      {/* TAM/SAM/SOM */}
      <SynthesisSection icon={Target} title="Dimensionnement TAM/SAM/SOM">
        <div className="grid gap-3 sm:grid-cols-3">
          {(["tam", "sam", "som"] as const).map((key) => {
            const dim = synthesis.tamSamSom[key];
            return (
              <div key={key} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-muted-foreground">
                    {key.toUpperCase()}
                  </span>
                  <ConfidenceBadge confidence={dim.confidence} />
                </div>
                <p className="text-lg font-bold mt-1">{dim.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dim.description}
                </p>
              </div>
            );
          })}
        </div>
        {synthesis.tamSamSom.methodology && (
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Méthodologie :</strong> {synthesis.tamSamSom.methodology}
          </p>
        )}
      </SynthesisSection>

      {/* Competitive Landscape */}
      <SynthesisSection icon={Users} title="Paysage concurrentiel">
        {synthesis.competitiveLandscape.competitors.length > 0 ? (
          <div className="space-y-3">
            {synthesis.competitiveLandscape.competitors.map((comp, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-semibold">{comp.name}</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {comp.marketShare}
                    </span>
                    <ConfidenceBadge confidence={comp.confidence} />
                  </div>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="font-medium text-green-600">Forces :</span>
                    <ul className="mt-1 list-disc list-inside text-muted-foreground">
                      {comp.strengths.map((s, j) => (
                        <li key={j}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium text-red-500">Faiblesses :</span>
                    <ul className="mt-1 list-disc list-inside text-muted-foreground">
                      {comp.weaknesses.map((w, j) => (
                        <li key={j}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {(comp.funding || comp.traffic) && (
                  <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                    {comp.funding && <span>Funding: {comp.funding}</span>}
                    {comp.traffic && <span>Trafic: {comp.traffic}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun concurrent identifié dans les données collectées.
          </p>
        )}
      </SynthesisSection>

      {/* Macro Trends */}
      <SynthesisSection icon={TrendingUp} title="Tendances macro">
        {synthesis.macroTrends.trends.length > 0 ? (
          <div className="space-y-2">
            {synthesis.macroTrends.trends.map((trend, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-2 rounded-lg border p-2"
              >
                <div className="flex-1">
                  <p className="text-sm">{trend.trend}</p>
                  {trend.timeframe && (
                    <p className="text-xs text-muted-foreground">
                      {trend.timeframe}
                    </p>
                  )}
                </div>
                <ConfidenceBadge confidence={trend.confidence} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucune tendance macro identifiée.
          </p>
        )}
      </SynthesisSection>

      {/* Weak Signals */}
      <SynthesisSection icon={Zap} title="Signaux faibles">
        {synthesis.weakSignals.signals.length > 0 ? (
          <div className="space-y-2">
            {synthesis.weakSignals.signals.map((signal, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-2 rounded-lg border border-dashed p-2"
              >
                <div className="flex-1">
                  <p className="text-sm">{signal.signal}</p>
                  {signal.implication && (
                    <p className="text-xs text-muted-foreground mt-1">
                      → {signal.implication}
                    </p>
                  )}
                </div>
                <ConfidenceBadge confidence={signal.confidence} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun signal faible détecté.
          </p>
        )}
      </SynthesisSection>

      {/* Customer Insights */}
      <SynthesisSection
        icon={Info}
        title="Insights clients"
        confidence={synthesis.customerInsights.confidence}
        sources={synthesis.customerInsights.sources}
      >
        <p className="text-sm">{synthesis.customerInsights.data}</p>
      </SynthesisSection>

      {/* Data Gaps */}
      {synthesis.gaps.length > 0 && (
        <SynthesisSection icon={AlertTriangle} title="Lacunes identifiées">
          <div className="space-y-1">
            {synthesis.gaps.map((gap, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-amber-700"
              >
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{gap}</span>
              </div>
            ))}
          </div>
        </SynthesisSection>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SynthesisSection({
  icon: Icon,
  title,
  confidence,
  sources,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  confidence?: DataConfidence;
  sources?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-terracotta" />
          <h4 className="text-sm font-semibold">{title}</h4>
        </div>
        {confidence && <ConfidenceBadge confidence={confidence} />}
      </div>
      {children}
      {sources && sources.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          Sources : {sources.join(", ")}
        </p>
      )}
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: DataConfidence }) {
  const colors = CONFIDENCE_COLORS[confidence];
  const label = CONFIDENCE_LABELS[confidence];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border",
        colors.bg,
        colors.text,
        colors.border,
      )}
    >
      {label}
    </span>
  );
}

function ConfidenceScore({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 70) return "text-green-600";
    if (value >= 40) return "text-amber-600";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            value >= 70 ? "bg-green-500" : value >= 40 ? "bg-amber-500" : "bg-red-500",
          )}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className={cn("text-2xl font-bold", getColor())}>{value}</span>
      <span className="text-xs text-muted-foreground">/100</span>
    </div>
  );
}
