// =============================================================================
// COMPONENT C.K6 — Section Risk
// =============================================================================
// Pillar R cockpit display: Risk Audit.
// Props: rContent (RiskAuditResult), implContent, pillar, vertical.
// Key features: risk score circle with justification, summary, global SWOT
// (4-quadrant), micro-SWOTs per variable with risk level badges, probability x
// impact matrix sorted by priority, mitigation priorities with urgency/effort,
// top risks from implementation with mitigation actions.
// =============================================================================

// Section Risk (Pillar R) — Risk Audit: Micro-SWOTs, Score, Matrice P*I, Mitigation

import { Shield, AlertTriangle } from "lucide-react";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { RiskAuditResult } from "~/lib/types/pillar-schemas";
import type { ImplementationData } from "~/lib/types/implementation-data";
import {
  CockpitSection,
  ScoreCircle,
  SwotCard,
  MiniSwotGrid,
  RiskLevelBadge,
  UrgencyBadge,
  PillarContentDisplay,
  getRiskLevel,
} from "../cockpit-shared";

interface PillarData {
  type: string;
  title: string;
  status: string;
  summary: string | null;
  content: unknown;
  updatedAt?: Date | string | null;
}

export function SectionRisk({
  rContent,
  implContent,
  pillar,
  vertical,
}: {
  rContent: RiskAuditResult;
  implContent: ImplementationData;
  pillar?: PillarData | null;
  vertical?: string | null;
}) {
  // Fallback check: if no meaningful R data, use PillarContentDisplay
  const hasData =
    rContent.riskScore !== 0 ||
    rContent.microSwots.length > 0 ||
    rContent.globalSwot.strengths.length > 0;

  return (
    <CockpitSection
      icon={<Shield className="h-5 w-5" />}
      pillarLetter="R"
      title="Analyse des Risques"
      subtitle="Micro-SWOTs, Score de risque, Mitigation"
      color={PILLAR_CONFIG.R.color}
      updatedAt={pillar?.updatedAt}
      vertical={vertical}
    >
      {hasData ? (
        <div className="space-y-5">
          {/* ── 1. Risk Score ── */}
          {rContent.riskScore != null && (
            <div className="flex items-center gap-5">
              <ScoreCircle
                score={rContent.riskScore}
                label="Score de risque"
                sublabel={getRiskLevel(rContent.riskScore).label}
                invertForRisk={true}
              />
              {rContent.riskScoreJustification && (
                <p className="max-w-md text-sm leading-relaxed text-foreground/80">
                  {rContent.riskScoreJustification}
                </p>
              )}
            </div>
          )}

          {/* ── 2. Summary ── */}
          {rContent.summary && (
            <div className="rounded-lg border bg-muted/30 px-6 py-4">
              <p className="text-sm leading-relaxed text-foreground/80">
                {rContent.summary}
              </p>
            </div>
          )}

          {/* ── 3. Global SWOT ── */}
          {rContent.globalSwot && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                SWOT Globale
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <SwotCard
                  title="Forces"
                  items={rContent.globalSwot.strengths}
                  color="green"
                />
                <SwotCard
                  title="Faiblesses"
                  items={rContent.globalSwot.weaknesses}
                  color="red"
                />
                <SwotCard
                  title="Opportunités"
                  items={rContent.globalSwot.opportunities}
                  color="blue"
                />
                <SwotCard
                  title="Menaces"
                  items={rContent.globalSwot.threats}
                  color="amber"
                />
              </div>
            </div>
          )}

          {/* ── 4. Micro-SWOTs ── */}
          {rContent.microSwots.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Micro-SWOTs par variable
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {rContent.microSwots.map((ms, i) => (
                  <div
                    key={ms.variableId || i}
                    className="rounded-lg border p-3"
                  >
                    {/* Header */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">
                        {ms.variableLabel}
                      </span>
                      <RiskLevelBadge level={ms.riskLevel} />
                    </div>

                    {/* Body */}
                    <MiniSwotGrid
                      strengths={ms.strengths}
                      weaknesses={ms.weaknesses}
                      opportunities={ms.opportunities}
                      threats={ms.threats}
                    />

                    {/* Footer */}
                    {ms.commentary && (
                      <p className="mt-2 text-xs italic text-muted-foreground">
                        {ms.commentary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 5. Matrice Probabilité x Impact ── */}
          {rContent.probabilityImpactMatrix.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Matrice Probabilité &times; Impact
              </p>
              <div className="space-y-2">
                {[...rContent.probabilityImpactMatrix]
                  .sort((a, b) => a.priority - b.priority)
                  .map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border px-3 py-2"
                    >
                      <p className="text-sm font-medium">{item.risk}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          P:
                        </span>
                        <RiskLevelBadge level={item.probability} />
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          I:
                        </span>
                        <RiskLevelBadge level={item.impact} />
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-bold">
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── 6. Priorités de mitigation ── */}
          {rContent.mitigationPriorities.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Priorités de mitigation
              </p>
              <div className="space-y-2">
                {rContent.mitigationPriorities.map((mp, i) => (
                  <div
                    key={i}
                    className="rounded-lg border px-3 py-2"
                  >
                    <div className="flex items-start gap-2">
                      <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c43c6e]" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{mp.risk}</p>
                        <p className="text-xs text-foreground/80">
                          {mp.action}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <UrgencyBadge urgency={mp.urgency} />
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            Effort:
                          </span>
                          <RiskLevelBadge level={mp.effort} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 7. Top Risks from Implementation ── */}
          {implContent?.riskSynthesis?.topRisks &&
            Array.isArray(implContent.riskSynthesis.topRisks) &&
            implContent.riskSynthesis.topRisks.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Risques prioritaires & mitigations
                </p>
                <div className="space-y-2">
                  {implContent.riskSynthesis.topRisks.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-lg border px-3 py-2"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {r.risk ?? "\u2014"}
                          </span>
                          {r.impact && (
                            <p className="text-xs text-muted-foreground">
                              Impact : {r.impact}
                            </p>
                          )}
                          {r.mitigation && (
                            <p className="mt-1 flex items-start gap-1 text-xs text-emerald-700">
                              <Shield className="mt-0.5 h-3 w-3 shrink-0" />
                              {r.mitigation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      ) : (
        <PillarContentDisplay pillar={pillar} />
      )}
    </CockpitSection>
  );
}
