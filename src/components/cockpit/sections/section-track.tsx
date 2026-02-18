// Section Track (Pillar T) — Track Audit / Market Validation
// Renders triangulation, TAM/SAM/SOM, hypothesis validation, market reality,
// competitive benchmark, brand-market fit score, and strategic recommendations.

import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  Eye,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { TrackAuditResult } from "~/lib/types/pillar-schemas";
import type { ImplementationData } from "~/lib/types/implementation-data";
import {
  CockpitSection,
  DataCard,
  MetricCard,
  ScoreCircle,
  StatusBadge,
  PillarContentDisplay,
  getScoreColor,
  getScoreLabel,
} from "../cockpit-shared";

interface PillarData {
  type: string;
  title: string;
  status: string;
  summary: string | null;
  content: unknown;
}

const COLOR = PILLAR_CONFIG.T.color; // #8c3cc4

// ---------------------------------------------------------------------------
// Helper: status icon for hypothesis validation
// ---------------------------------------------------------------------------
function HypothesisStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "validated":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "invalidated":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <HelpCircle className="h-4 w-4 text-amber-600" />;
  }
}

// ---------------------------------------------------------------------------
// SectionTrack
// ---------------------------------------------------------------------------

export function SectionTrack({
  tContent,
  implContent,
  pillar,
}: {
  tContent: TrackAuditResult;
  implContent: ImplementationData;
  pillar?: PillarData | null;
}) {
  // -------------------------------------------------------------------------
  // Fallback check: if tContent has no meaningful data, use PillarContentDisplay
  // -------------------------------------------------------------------------
  const hasData =
    tContent.brandMarketFitScore !== 0 || !!tContent.tamSamSom?.tam?.value;

  // -------------------------------------------------------------------------
  // Merge recommendations from tContent + implContent
  // -------------------------------------------------------------------------
  const mergedRecommendations = [
    ...(tContent.strategicRecommendations ?? []),
    ...(implContent?.marketValidation?.recommendations ?? []),
  ].filter(Boolean);

  return (
    <CockpitSection
      icon={<BarChart3 className="h-5 w-5" />}
      pillarLetter="T"
      title="Track Audit"
      subtitle="Validation march\u00e9 \u2014 Triangulation, TAM/SAM/SOM, Benchmark"
      color={COLOR}
    >
      {hasData ? (
        <div className="space-y-5">
          {/* ----------------------------------------------------------------- */}
          {/* 1. Brand-Market Fit Score                                         */}
          {/* ----------------------------------------------------------------- */}
          <div className="flex items-center gap-4">
            <ScoreCircle
              score={tContent.brandMarketFitScore}
              label="Brand-Market Fit"
              sublabel={getScoreLabel(tContent.brandMarketFitScore)}
            />
            {tContent.brandMarketFitJustification && (
              <p className="flex-1 text-sm leading-relaxed text-foreground/80">
                {tContent.brandMarketFitJustification}
              </p>
            )}
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* 2. Summary                                                        */}
          {/* ----------------------------------------------------------------- */}
          {tContent.summary && (
            <div className="rounded-xl border bg-muted/30 px-6 py-4">
              <p className="text-sm leading-relaxed text-foreground/80">
                {tContent.summary}
              </p>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* 3. Triangulation des donn\u00e9es                                 */}
          {/* ----------------------------------------------------------------- */}
          {(tContent.triangulation?.internalData ||
            tContent.triangulation?.marketData ||
            tContent.triangulation?.customerData ||
            tContent.triangulation?.synthesis) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Triangulation des donn\u00e9es
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {tContent.triangulation.internalData && (
                  <DataCard
                    icon={<BarChart3 className="h-4 w-4" />}
                    label="Donn\u00e9es internes"
                    value={tContent.triangulation.internalData}
                  />
                )}
                {tContent.triangulation.marketData && (
                  <DataCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Donn\u00e9es march\u00e9"
                    value={tContent.triangulation.marketData}
                  />
                )}
                {tContent.triangulation.customerData && (
                  <DataCard
                    icon={<Users className="h-4 w-4" />}
                    label="Donn\u00e9es clients"
                    value={tContent.triangulation.customerData}
                  />
                )}
              </div>
              {tContent.triangulation.synthesis && (
                <div className="mt-3 rounded-lg border-l-4 border-[#8c3cc4]/30 bg-[#8c3cc4]/5 px-4 py-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Synth\u00e8se de la triangulation
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {tContent.triangulation.synthesis}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* 4. TAM / SAM / SOM                                                */}
          {/* ----------------------------------------------------------------- */}
          {(tContent.tamSamSom?.tam?.value ||
            tContent.tamSamSom?.sam?.value ||
            tContent.tamSamSom?.som?.value) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                TAM / SAM / SOM
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["tam", "sam", "som"] as const).map((key) => {
                  const entry = tContent.tamSamSom[key];
                  if (!entry?.value) return null;
                  return (
                    <Card key={key} className="text-center">
                      <CardContent className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {key.toUpperCase()}
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#8c3cc4]">
                          {entry.value}
                        </p>
                        {entry.description && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {entry.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {tContent.tamSamSom.methodology && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  <span className="font-semibold">M\u00e9thodologie :</span>{" "}
                  {tContent.tamSamSom.methodology}
                </p>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* 5. Validation des hypoth\u00e8ses                                 */}
          {/* ----------------------------------------------------------------- */}
          {Array.isArray(tContent.hypothesisValidation) &&
            tContent.hypothesisValidation.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Validation des hypoth\u00e8ses
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tContent.hypothesisValidation.map((h, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <HypothesisStatusIcon status={h.status} />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {h.variableId}
                          </span>
                        </div>
                        <StatusBadge status={h.status} />
                      </div>
                      {h.hypothesis && (
                        <p className="mt-2 text-sm leading-relaxed">
                          {h.hypothesis}
                        </p>
                      )}
                      {h.evidence && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-semibold">Preuve :</span>{" "}
                          {h.evidence}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* ----------------------------------------------------------------- */}
          {/* 6. R\u00e9alit\u00e9 du march\u00e9                              */}
          {/* ----------------------------------------------------------------- */}
          {(tContent.marketReality?.macroTrends?.length > 0 ||
            tContent.marketReality?.weakSignals?.length > 0 ||
            tContent.marketReality?.emergingPatterns?.length > 0) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                R\u00e9alit\u00e9 du march\u00e9
              </p>
              <div className="space-y-3">
                {/* Macro Trends */}
                {tContent.marketReality.macroTrends.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                      Tendances macro
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tContent.marketReality.macroTrends.map((trend, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#8c3cc4]/20 bg-[#8c3cc4]/5 px-3 py-1 text-sm font-medium"
                        >
                          <TrendingUp className="h-3 w-3 text-[#8c3cc4]" />
                          {trend}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weak Signals */}
                {tContent.marketReality.weakSignals.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                      Signaux faibles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tContent.marketReality.weakSignals.map((signal, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium"
                        >
                          <Search className="h-3 w-3 text-amber-600" />
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emerging Patterns */}
                {tContent.marketReality.emergingPatterns.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                      Patterns \u00e9mergents
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tContent.marketReality.emergingPatterns.map(
                        (pattern, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium"
                          >
                            <Eye className="h-3 w-3 text-blue-600" />
                            {pattern}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* 7. Benchmark concurrentiel                                        */}
          {/* ----------------------------------------------------------------- */}
          {Array.isArray(tContent.competitiveBenchmark) &&
            tContent.competitiveBenchmark.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Benchmark concurrentiel
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tContent.competitiveBenchmark.map((comp, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">
                          {comp.competitor}
                        </span>
                        {comp.marketShare && (
                          <span className="inline-flex items-center rounded-full border bg-muted/30 px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                            {comp.marketShare}
                          </span>
                        )}
                      </div>
                      {comp.strengths.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {comp.strengths.map((s, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-1.5 text-xs text-emerald-700"
                            >
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                      {comp.weaknesses.length > 0 && (
                        <ul className="mt-1.5 space-y-1">
                          {comp.weaknesses.map((w, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-1.5 text-xs text-red-600"
                            >
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* ----------------------------------------------------------------- */}
          {/* 8. Trends from implContent                                        */}
          {/* ----------------------------------------------------------------- */}
          {Array.isArray(implContent?.marketValidation?.trends) &&
            implContent.marketValidation.trends.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tendances march\u00e9
                </p>
                <div className="flex flex-wrap gap-2">
                  {implContent.marketValidation.trends.map((trend, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#8c3cc4]/20 bg-[#8c3cc4]/5 px-3 py-1 text-sm font-medium"
                    >
                      <TrendingUp className="h-3 w-3 text-[#8c3cc4]" />
                      {trend}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* ----------------------------------------------------------------- */}
          {/* 9. Recommandations strat\u00e9giques                              */}
          {/* ----------------------------------------------------------------- */}
          {mergedRecommendations.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recommandations strat\u00e9giques
              </p>
              <div className="space-y-1.5">
                {mergedRecommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2"
                  >
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#8c3cc4]" />
                    <p className="text-sm text-foreground/80">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ------------------------------------------------------------------- */
        /* Fallback: PillarContentDisplay                                      */
        /* ------------------------------------------------------------------- */
        <PillarContentDisplay pillar={pillar} />
      )}
    </CockpitSection>
  );
}
