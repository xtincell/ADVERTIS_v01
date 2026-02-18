// Section Synthèse Stratégique (Pillar S) — Strategic synthesis and recommendations

import {
  Award,
  CheckCircle2,
  Eye,
  FileText,
  Layers,
  Target,
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
}

export function SectionSynthese({
  sContent,
  pillar,
}: {
  sContent: SynthesePillarData;
  pillar?: PillarData | null;
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
      >
        <PillarContentDisplay pillar={pillar} />
      </CockpitSection>
    );
  }

  return (
    <CockpitSection
      icon={<Layers className="h-5 w-5" />}
      pillarLetter="S"
      title="Synthèse Stratégique"
      subtitle="Vision, Cohérence, Recommandations prioritaires"
      color={PILLAR_CONFIG.S.color}
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

        {/* Cohérence des Piliers */}
        {sContent.coherencePiliers.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cohérence inter-piliers
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sContent.coherencePiliers.map((cp, i) => {
                // Try to get pillar color from config
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
      </div>
    </CockpitSection>
  );
}
