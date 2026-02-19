// Section Veille & Opportunites — Surfaces market opportunities prominently
// instead of burying them in the Track Audit section.
// Sources: Track Audit (T) — weak signals, macro trends, emerging patterns,
//          competitive weaknesses, strategic recommendations.

import {
  Zap,
  TrendingUp,
  Eye,
  Target,
  ArrowUpRight,
} from "lucide-react";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { TrackAuditResult } from "~/lib/types/pillar-schemas";
import type { ImplementationData } from "~/lib/types/implementation-data";
import { CockpitSection } from "../cockpit-shared";

const COLOR = PILLAR_CONFIG.T.color; // #8c3cc4

// ---------------------------------------------------------------------------
// SectionVeille
// ---------------------------------------------------------------------------

export function SectionVeille({
  tContent,
  implContent,
}: {
  tContent: TrackAuditResult;
  implContent: ImplementationData;
}) {
  const weakSignals = tContent?.marketReality?.weakSignals ?? [];
  const macroTrends = tContent?.marketReality?.macroTrends ?? [];
  const emergingPatterns = tContent?.marketReality?.emergingPatterns ?? [];

  // Extract competitive weaknesses as opportunities
  const competitiveOpportunities: { competitor: string; weakness: string }[] = [];
  (tContent?.competitiveBenchmark ?? []).forEach((c) => {
    c.weaknesses.forEach((w) => {
      competitiveOpportunities.push({ competitor: c.competitor, weakness: w });
    });
  });

  const recommendations = [
    ...(tContent?.strategicRecommendations ?? []),
    ...(implContent?.marketValidation?.recommendations ?? []),
  ].filter(Boolean);

  // Don't render if no data at all
  const hasData =
    weakSignals.length > 0 ||
    macroTrends.length > 0 ||
    emergingPatterns.length > 0 ||
    competitiveOpportunities.length > 0 ||
    recommendations.length > 0;

  if (!hasData) return null;

  return (
    <CockpitSection
      icon={<Zap className="h-5 w-5" />}
      pillarLetter="T"
      title="Veille & Opportunites"
      subtitle="Signaux de marche, tendances et failles concurrentielles"
      color={COLOR}
    >
      <div className="space-y-5">
        {/* 1. Opportunites de prise de parole — Weak signals (most prominent) */}
        {weakSignals.length > 0 && (
          <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-amber-50/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-600" />
              <h4 className="text-sm font-bold text-amber-900">
                Opportunites de prise de parole
              </h4>
              <span className="ml-auto rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {weakSignals.length} signal{weakSignals.length > 1 ? "ux" : ""}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {weakSignals.map((signal, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-amber-200 bg-white/80 px-3 py-2"
                >
                  <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <p className="text-sm text-amber-900">{signal}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Tendances macro */}
        {macroTrends.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[#8c3cc4]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tendances macro
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {macroTrends.map((trend, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#8c3cc4]/20 bg-[#8c3cc4]/5 px-3 py-1.5 text-sm font-medium"
                >
                  <TrendingUp className="h-3 w-3 text-[#8c3cc4]" />
                  {trend}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 3. Patterns emergents */}
        {emergingPatterns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Signaux emergents
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {emergingPatterns.map((pattern, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium"
                >
                  <Eye className="h-3 w-3 text-blue-600" />
                  {pattern}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 4. Failles concurrentielles = positionnement possible */}
        {competitiveOpportunities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-red-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Failles concurrentielles
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {competitiveOpportunities.slice(0, 8).map((opp, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border bg-muted/20 px-3 py-2"
                >
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                  <p className="text-sm">
                    <span className="font-semibold">{opp.competitor}</span>
                    <span className="text-muted-foreground"> : </span>
                    <span className="text-foreground/80">{opp.weakness}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Recommandations strategiques */}
        {recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-4 w-4 text-[#8c3cc4]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recommandations strategiques
              </p>
            </div>
            <div className="space-y-1.5">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#8c3cc4]/10 text-[10px] font-bold text-[#8c3cc4]">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground/80">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CockpitSection>
  );
}
