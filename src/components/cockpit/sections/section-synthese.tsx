// =============================================================================
// COMPONENT C.K9 — Section Synthese
// =============================================================================
// Pillar S cockpit display: Strategic Synthesis.
// Props: sContent (SynthesePillarData), pillar, vertical.
// Key features: coherence score circle, executive summary, strategic vision,
// strategic axes with linked pillars and KPIs, inter-pillar coherence grid,
// sprint 90-day recap table, campaigns summary, activation summary, key success
// factors, prioritized recommendations, KPI dashboard table with per-pillar
// status badges.
// =============================================================================

// Section Synthèse Stratégique (Pillar S) — Strategic synthesis and recommendations

import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  Layers,
  Rocket,
  Target,
  Zap,
} from "lucide-react";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import type { SynthesePillarData } from "~/lib/types/pillar-data";
import {
  CockpitSection,
  DataCard,
  ScoreCircle,
  PillarContentDisplay,
  getScoreLabel,
} from "../cockpit-shared";

interface PillarData {
  type: string;
  title: string;
  status: string;
  summary: string | null;
  content: unknown;
  updatedAt?: Date | string | null;
}

export function SectionSynthese({
  sContent,
  pillar,
  vertical,
}: {
  sContent: SynthesePillarData;
  pillar?: PillarData | null;
  vertical?: string | null;
}) {
  // Check if we have meaningful data
  const hasData =
    sContent.scoreCoherence > 0 ||
    sContent.syntheseExecutive ||
    sContent.visionStrategique ||
    sContent.coherencePiliers.length > 0 ||
    sContent.facteursClesSucces.length > 0 ||
    sContent.recommandationsPrioritaires.length > 0;

  if (!hasData) {
    return (
      <CockpitSection
        icon={<Layers className="h-5 w-5" />}
        pillarLetter="S"
        title="Synthèse Stratégique"
        subtitle="Vision, Cohérence, Recommandations prioritaires"
        color={PILLAR_CONFIG.S.color}
        updatedAt={pillar?.updatedAt}
        vertical={vertical}
      >
        <PillarContentDisplay pillar={pillar} />
      </CockpitSection>
    );
  }

  // Status badge colors
  const statusColor = (s: string) => {
    const lower = s.toLowerCase();
    if (lower.includes("fait") || lower.includes("done") || lower.includes("terminé"))
      return "bg-emerald-100 text-emerald-700";
    if (lower.includes("cours") || lower.includes("progress"))
      return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <CockpitSection
      icon={<Layers className="h-5 w-5" />}
      pillarLetter="S"
      title="Synthèse Stratégique"
      subtitle="Vision, Cohérence, Axes, Sprint 90j, Campagnes, KPIs"
      color={PILLAR_CONFIG.S.color}
      updatedAt={pillar?.updatedAt}
      vertical={vertical}
    >
      <div className="space-y-6">
        {/* Score de cohérence */}
        {sContent.scoreCoherence > 0 && (
          <div className="flex justify-center">
            <ScoreCircle
              score={sContent.scoreCoherence}
              label="Score de Cohérence"
              sublabel={getScoreLabel(sContent.scoreCoherence)}
              size="lg"
            />
          </div>
        )}

        {/* Synthèse Executive — premium encart */}
        {sContent.syntheseExecutive && (
          <div className="rounded-xl border-l-4 border-[#c45a3c]/40 bg-gradient-to-r from-[#c45a3c]/5 to-transparent px-6 py-5">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Synthèse exécutive
            </h3>
            <p className="text-sm leading-relaxed text-foreground/85">
              {sContent.syntheseExecutive}
            </p>
          </div>
        )}

        {/* Vision Stratégique */}
        {sContent.visionStrategique && (
          <div className="rounded-xl border bg-gradient-to-br from-muted/40 to-transparent p-5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c45a3c]/10">
                <Eye className="h-4 w-4 text-[#c45a3c]" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vision stratégique
              </p>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              {sContent.visionStrategique}
            </p>
          </div>
        )}

        {/* Axes Stratégiques (NEW) */}
        {sContent.axesStrategiques && sContent.axesStrategiques.length > 0 && (
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              Axes stratégiques
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {sContent.axesStrategiques.map((axe, i) => (
                <div key={i} className="rounded-lg border bg-gradient-to-br from-violet-50/30 to-transparent p-4">
                  <p className="text-sm font-semibold text-foreground">{axe.axe}</p>
                  {axe.description && (
                    <p className="mt-1 text-xs leading-relaxed text-foreground/70">{axe.description}</p>
                  )}
                  {axe.piliersLies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {axe.piliersLies.map((p, j) => {
                        const key = p.charAt(0).toUpperCase() as PillarType;
                        const color = PILLAR_CONFIG[key]?.color ?? "#6b7280";
                        return (
                          <span
                            key={j}
                            className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                            style={{ backgroundColor: color }}
                          >
                            {key}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {axe.kpisCles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground">KPIs</p>
                      <ul className="mt-0.5 space-y-0.5">
                        {axe.kpisCles.map((kpi, k) => (
                          <li key={k} className="text-xs text-foreground/70">• {kpi}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cohérence des Piliers */}
        {sContent.coherencePiliers.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cohérence inter-piliers
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sContent.coherencePiliers.map((cp, i) => {
                const pillarKey = cp.pilier?.charAt(0)?.toUpperCase() as PillarType | undefined;
                const pillarColor = pillarKey && PILLAR_CONFIG[pillarKey]
                  ? PILLAR_CONFIG[pillarKey].color
                  : "#6b7280";
                const pillarTitle = pillarKey && PILLAR_CONFIG[pillarKey]
                  ? PILLAR_CONFIG[pillarKey].title
                  : cp.pilier;

                return (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white"
                        style={{ backgroundColor: pillarColor }}
                      >
                        {pillarKey ?? "?"}
                      </span>
                      <span className="text-sm font-semibold">{pillarTitle}</span>
                    </div>
                    {cp.contribution && (
                      <div className="mb-1.5">
                        <p className="text-[10px] font-semibold uppercase text-muted-foreground">Contribution</p>
                        <p className="text-xs leading-relaxed text-foreground/80">{cp.contribution}</p>
                      </div>
                    )}
                    {cp.articulation && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-muted-foreground">Articulation</p>
                        <p className="text-xs leading-relaxed text-foreground/80">{cp.articulation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sprint 90 Jours Recap (NEW) */}
        {sContent.sprint90Recap && sContent.sprint90Recap.actions.length > 0 && (
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Rocket className="h-3.5 w-3.5" />
              Sprint 90 jours
            </p>
            {sContent.sprint90Recap.summary && (
              <p className="mb-3 text-sm text-foreground/70 italic">
                {sContent.sprint90Recap.summary}
              </p>
            )}
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Action</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Responsable</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">KPI</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sContent.sprint90Recap.actions.map((a, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-3 py-2 font-medium">{a.action}</td>
                      <td className="px-3 py-2 text-muted-foreground">{a.owner}</td>
                      <td className="px-3 py-2 text-muted-foreground">{a.kpi}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Campagnes Summary (NEW) */}
        {sContent.campaignsSummary && (sContent.campaignsSummary.totalCampaigns > 0 || sContent.campaignsSummary.highlights.length > 0) && (
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Résumé des campagnes
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {sContent.campaignsSummary.totalCampaigns > 0 && (
                <div className="rounded-lg border bg-blue-50/30 p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{sContent.campaignsSummary.totalCampaigns}</p>
                  <p className="text-xs text-muted-foreground">Campagnes prévues</p>
                </div>
              )}
              {sContent.campaignsSummary.budgetTotal && (
                <div className="rounded-lg border bg-emerald-50/30 p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{sContent.campaignsSummary.budgetTotal}</p>
                  <p className="text-xs text-muted-foreground">Budget annuel</p>
                </div>
              )}
            </div>
            {sContent.campaignsSummary.highlights.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {sContent.campaignsSummary.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-md border px-3 py-2">
                    <Zap className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                    <p className="text-xs text-foreground/80">{h}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activation Summary (NEW) */}
        {sContent.activationSummary && (
          <div className="rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-50/30 to-transparent px-5 py-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              Dispositif d&apos;activation
            </p>
            <p className="text-sm leading-relaxed text-foreground/80">
              {sContent.activationSummary}
            </p>
          </div>
        )}

        {/* Facteurs clés de succès */}
        {sContent.facteursClesSucces.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Facteurs clés de succès
            </p>
            <div className="space-y-2">
              {sContent.facteursClesSucces.map((fcs, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-md border bg-emerald-50/30 px-3 py-2.5"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                  </div>
                  <p className="text-sm text-foreground/80">{fcs}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommandations prioritaires */}
        {sContent.recommandationsPrioritaires.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recommandations prioritaires
            </p>
            <div className="space-y-3">
              {sContent.recommandationsPrioritaires
                .sort((a, b) => (a.priorite ?? 99) - (b.priorite ?? 99))
                .map((rec, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#c45a3c]/10 text-xs font-bold text-[#c45a3c]">
                        {rec.priorite ?? i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{rec.action}</p>
                        {rec.impact && (
                          <p className="mt-1 flex items-start gap-1.5 text-xs text-emerald-700">
                            <Target className="mt-0.5 h-3 w-3 shrink-0" />
                            <span>Impact : {rec.impact}</span>
                          </p>
                        )}
                        {rec.delai && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Délai : {rec.delai}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* KPI Dashboard (NEW) */}
        {sContent.kpiDashboard && sContent.kpiDashboard.length > 0 && (
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              Tableau de bord KPI
            </p>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Pilier</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">KPI</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Cible</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sContent.kpiDashboard.map((kpi, i) => {
                    const key = kpi.pilier?.charAt(0)?.toUpperCase() as PillarType | undefined;
                    const color = key && PILLAR_CONFIG[key]?.color;
                    return (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <span
                            className="inline-flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold text-white"
                            style={{ backgroundColor: color ?? "#6b7280" }}
                          >
                            {key ?? "?"}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium">{kpi.kpi}</td>
                        <td className="px-3 py-2 text-muted-foreground">{kpi.cible}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(kpi.statut)}`}>
                            {kpi.statut}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CockpitSection>
  );
}
