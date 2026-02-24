// =============================================================================
// COMPONENT C.K8 — Section Implementation
// =============================================================================
// Pillar I cockpit display: Implementation Plan.
// Props: implContent (ImplementationData).
// Key features: 14 sub-sections — strategic roadmap (sprint 90j, year 1, year 3
// vision), campaign plan (annual calendar, templates, activation phases), budget
// allocation (enveloppe, par poste/phase, ROI projections), team structure
// (current, recruitment, external partners), launch plan (phases, milestones,
// go/no-go), operational playbook (rhythms, escalation, tool stack), brand
// platform, copy strategy, big idea, activation dispositif (POEM), governance,
// workstreams, brand architecture, guiding principles.
// =============================================================================

// Section Implementation (Pillar I) — Strategic Roadmap, Campaigns, Budget,
// Team Structure, Launch Plan, Operational Playbook.

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Rocket,
  Megaphone,
  DollarSign,
  UserPlus,
  Flag,
  BookOpen,
  Target,
  Award,
  Users,
  AlertTriangle,
  Wrench,
  Calendar,
  Crown,
  PenTool,
  Lightbulb,
  Radio,
  Shield,
  Layers,
  Network,
  Compass,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sliders,
} from "lucide-react";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { SupportedCurrency } from "~/lib/constants";
import type { ImplementationData } from "~/lib/types/implementation-data";
import { CockpitSection, MetricCard } from "../cockpit-shared";

const BudgetSimulator = dynamic(
  () => import("../budget-simulator").then((m) => ({ default: m.BudgetSimulator })),
  { ssr: false },
);

const COLOR = PILLAR_CONFIG.I.color; // #3cc4c4

// ---------------------------------------------------------------------------
// SectionImplementation
// ---------------------------------------------------------------------------

export function SectionImplementation({
  implContent,
  currency = "XOF",
}: {
  implContent: ImplementationData;
  currency?: SupportedCurrency;
}) {
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<number>>(new Set());
  const [showSimulator, setShowSimulator] = useState(false);

  const toggleCampaign = (index: number) => {
    setExpandedCampaigns((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };
  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* 1. Strategic Roadmap                                              */}
      {/* ================================================================= */}
      {implContent.strategicRoadmap && (
        <CockpitSection
          icon={<Rocket className="h-5 w-5" />}
          pillarLetter="I"
          title="Roadmap Stratégique"
          subtitle="Sprint 90 jours, Priorités annuelles, Vision 3 ans"
          color={COLOR}
        >
          <div className="space-y-5">
            {/* Sprint 90 Days */}
            {Array.isArray(implContent.strategicRoadmap.sprint90Days) &&
              implContent.strategicRoadmap.sprint90Days.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sprint 90 jours
                  </p>
                  <div className="space-y-2">
                    {implContent.strategicRoadmap.sprint90Days.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        <div
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: COLOR }}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{item.action}</p>
                          {item.owner && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {"\uD83D\uDC64"} {item.owner}
                            </p>
                          )}
                          {item.kpi && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {"\uD83D\uDCCA"} {item.kpi}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Year 1 Priorities */}
            {Array.isArray(implContent.strategicRoadmap.year1Priorities) &&
              implContent.strategicRoadmap.year1Priorities.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Priorités Année 1
                  </p>
                  <div className="space-y-1.5">
                    {implContent.strategicRoadmap.year1Priorities.map((prio, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2"
                      >
                        <Award className="mt-0.5 h-4 w-4 shrink-0 text-[#c45a3c]" />
                        <p className="text-sm text-foreground/80">{prio}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Year 3 Vision */}
            {implContent.strategicRoadmap.year3Vision && (
              <div className="rounded-lg border-l-4 border-[#3cc4c4]/30 bg-[#3cc4c4]/5 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Vision 3 ans
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {implContent.strategicRoadmap.year3Vision}
                </p>
              </div>
            )}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 2. Campaigns                                                      */}
      {/* ================================================================= */}
      {implContent.campaigns && (
        <CockpitSection
          icon={<Megaphone className="h-5 w-5" />}
          pillarLetter="I"
          title="Plan de Campagnes"
          subtitle="Calendrier annuel, Templates, Activation"
          color={COLOR}
        >
          <div className="space-y-5">
            {/* Annual Calendar */}
            {Array.isArray(implContent.campaigns.annualCalendar) &&
              implContent.campaigns.annualCalendar.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Calendrier annuel
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {implContent.campaigns.annualCalendar.map((cal, i) => {
                      const isExpanded = expandedCampaigns.has(i);
                      const hasDetails =
                        (Array.isArray(cal.actionsDetaillees) && cal.actionsDetaillees.length > 0) ||
                        (Array.isArray(cal.messagesCles) && cal.messagesCles.length > 0) ||
                        cal.budgetDetail ||
                        cal.timeline ||
                        (Array.isArray(cal.metriquesSucces) && cal.metriquesSucces.length > 0);

                      return (
                        <div
                          key={i}
                          className="rounded-lg border p-3 transition-shadow hover:shadow-sm cursor-pointer"
                          onClick={() => hasDetails && toggleCampaign(i)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className="text-xs font-bold uppercase tracking-wider"
                              style={{ color: COLOR }}
                            >
                              {cal.mois}
                            </p>
                            {hasDetails && (
                              <button className="shrink-0 text-muted-foreground hover:text-foreground">
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                          <p className="mt-1 text-sm font-semibold">{cal.campagne}</p>
                          {cal.objectif && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {cal.objectif}
                            </p>
                          )}
                          {Array.isArray(cal.canaux) && cal.canaux.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {cal.canaux.map((canal, j) => (
                                <span
                                  key={j}
                                  className="inline-flex items-center rounded-full border border-[#3cc4c4]/20 bg-[#3cc4c4]/5 px-2 py-0.5 text-[10px] font-medium"
                                >
                                  {canal}
                                </span>
                              ))}
                            </div>
                          )}
                          {cal.budget && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Budget : {cal.budget}
                            </p>
                          )}
                          {cal.kpiCible && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              KPI : {cal.kpiCible}
                            </p>
                          )}

                          {/* ── Expanded Details ── */}
                          {isExpanded && hasDetails && (
                            <div
                              className="mt-3 space-y-2 border-t pt-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Timeline */}
                              {cal.timeline && (cal.timeline.debut || cal.timeline.fin) && (
                                <div className="flex items-center gap-2 text-xs text-foreground/70">
                                  <Calendar className="h-3 w-3 shrink-0" />
                                  <span>
                                    {cal.timeline.debut}
                                    {cal.timeline.fin && ` — ${cal.timeline.fin}`}
                                  </span>
                                </div>
                              )}

                              {/* Actions d\u00e9taill\u00e9es */}
                              {Array.isArray(cal.actionsDetaillees) && cal.actionsDetaillees.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    Actions
                                  </p>
                                  <ol className="space-y-0.5 list-decimal list-inside">
                                    {cal.actionsDetaillees.map((action, j) => (
                                      <li key={j} className="text-xs text-foreground/80">
                                        {action}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}

                              {/* Messages cl\u00e9s */}
                              {Array.isArray(cal.messagesCles) && cal.messagesCles.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    Messages cl\u00e9s
                                  </p>
                                  <div className="space-y-0.5">
                                    {cal.messagesCles.map((msg, j) => (
                                      <p key={j} className="text-xs italic text-foreground/70">
                                        &ldquo;{msg}&rdquo;
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Budget d\u00e9taill\u00e9 */}
                              {cal.budgetDetail && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    Ventilation budget
                                  </p>
                                  <div className="grid grid-cols-3 gap-1.5">
                                    {cal.budgetDetail.production && (
                                      <div className="rounded bg-muted/30 px-2 py-1 text-center">
                                        <p className="text-[9px] text-muted-foreground">Production</p>
                                        <p className="text-xs font-semibold">{cal.budgetDetail.production}</p>
                                      </div>
                                    )}
                                    {cal.budgetDetail.media && (
                                      <div className="rounded bg-muted/30 px-2 py-1 text-center">
                                        <p className="text-[9px] text-muted-foreground">M\u00e9dia</p>
                                        <p className="text-xs font-semibold">{cal.budgetDetail.media}</p>
                                      </div>
                                    )}
                                    {cal.budgetDetail.talent && (
                                      <div className="rounded bg-muted/30 px-2 py-1 text-center">
                                        <p className="text-[9px] text-muted-foreground">Talent</p>
                                        <p className="text-xs font-semibold">{cal.budgetDetail.talent}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* M\u00e9triques de succ\u00e8s */}
                              {Array.isArray(cal.metriquesSucces) && cal.metriquesSucces.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    M\u00e9triques de succ\u00e8s
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {cal.metriquesSucces.map((kpi, j) => (
                                      <span
                                        key={j}
                                        className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] font-medium text-green-700"
                                      >
                                        <Target className="mr-1 h-2.5 w-2.5" />
                                        {kpi}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Templates */}
            {Array.isArray(implContent.campaigns.templates) &&
              implContent.campaigns.templates.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Templates de campagne
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {implContent.campaigns.templates.map((tpl, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">{tpl.nom}</span>
                          <span
                            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold text-white"
                            style={{ backgroundColor: COLOR, borderColor: COLOR }}
                          >
                            {tpl.type}
                          </span>
                        </div>
                        {tpl.description && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {tpl.description}
                          </p>
                        )}
                        {tpl.duree && (
                          <p className="mt-0.5 text-xs text-foreground/80">
                            Durée : {tpl.duree}
                          </p>
                        )}
                        {Array.isArray(tpl.canauxPrincipaux) &&
                          tpl.canauxPrincipaux.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {tpl.canauxPrincipaux.map((c, j) => (
                                <span
                                  key={j}
                                  className="inline-flex items-center rounded-full border border-[#3cc4c4]/20 bg-[#3cc4c4]/5 px-2 py-0.5 text-[10px] font-medium"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        {Array.isArray(tpl.messagesCles) &&
                          tpl.messagesCles.length > 0 && (
                            <div className="mt-1.5 space-y-0.5">
                              {tpl.messagesCles.map((msg, j) => (
                                <p
                                  key={j}
                                  className="text-xs italic text-foreground/70"
                                >
                                  &ldquo;{msg}&rdquo;
                                </p>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Activation Plan */}
            {implContent.campaigns.activationPlan &&
              (implContent.campaigns.activationPlan.phase1Teasing ||
                implContent.campaigns.activationPlan.phase2Lancement ||
                implContent.campaigns.activationPlan.phase3Amplification ||
                implContent.campaigns.activationPlan.phase4Fidelisation) && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Plan d&apos;activation
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      {
                        key: "phase1Teasing" as const,
                        label: "Phase 1 — Teasing",
                        icon: "\uD83D\uDC40",
                      },
                      {
                        key: "phase2Lancement" as const,
                        label: "Phase 2 — Lancement",
                        icon: "\uD83D\uDE80",
                      },
                      {
                        key: "phase3Amplification" as const,
                        label: "Phase 3 — Amplification",
                        icon: "\uD83D\uDCE2",
                      },
                      {
                        key: "phase4Fidelisation" as const,
                        label: "Phase 4 — Fidélisation",
                        icon: "\u2764\uFE0F",
                      },
                    ].map((phase) => {
                      const value =
                        implContent.campaigns!.activationPlan[phase.key];
                      if (!value) return null;
                      return (
                        <div
                          key={phase.key}
                          className="flex items-start gap-3 rounded-lg border bg-muted/20 px-3 py-2"
                        >
                          <span className="mt-0.5 text-base">{phase.icon}</span>
                          <div className="flex-1">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                              {phase.label}
                            </p>
                            <p className="mt-0.5 text-sm text-foreground/80">
                              {value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 3. Budget Allocation                                              */}
      {/* ================================================================= */}
      {implContent.budgetAllocation && (
        <CockpitSection
          icon={<DollarSign className="h-5 w-5" />}
          pillarLetter="I"
          title="Allocation Budgétaire"
          subtitle="Répartition par poste, par phase, projections ROI"
          color={COLOR}
        >
          <div className="space-y-5">
            {/* Enveloppe Globale */}
            {implContent.budgetAllocation.enveloppeGlobale && (
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Enveloppe globale
                </p>
                <p
                  className="mt-1 text-2xl font-bold"
                  style={{ color: COLOR }}
                >
                  {implContent.budgetAllocation.enveloppeGlobale}
                </p>
              </div>
            )}

            {/* Par Poste */}
            {Array.isArray(implContent.budgetAllocation.parPoste) &&
              implContent.budgetAllocation.parPoste.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Répartition par poste
                  </p>
                  <div className="space-y-2">
                    {implContent.budgetAllocation.parPoste.map((poste, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">
                            {poste.poste}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-bold"
                              style={{ color: COLOR }}
                            >
                              {poste.montant}
                            </span>
                            {poste.pourcentage > 0 && (
                              <span className="inline-flex items-center rounded-full border bg-muted/30 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                {poste.pourcentage}%
                              </span>
                            )}
                          </div>
                        </div>
                        {poste.justification && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {poste.justification}
                          </p>
                        )}
                        {poste.pourcentage > 0 && (
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/30">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(poste.pourcentage, 100)}%`,
                                backgroundColor: COLOR,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Par Phase */}
            {Array.isArray(implContent.budgetAllocation.parPhase) &&
              implContent.budgetAllocation.parPhase.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Répartition par phase
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {implContent.budgetAllocation.parPhase.map((phase, i) => (
                      <div
                        key={i}
                        className="rounded-lg border bg-muted/20 p-3 text-center"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {phase.phase}
                        </p>
                        <p
                          className="mt-1 text-lg font-bold"
                          style={{ color: COLOR }}
                        >
                          {phase.montant}
                        </p>
                        {phase.focus && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {phase.focus}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* ROI Projections */}
            {implContent.budgetAllocation.roiProjections &&
              (implContent.budgetAllocation.roiProjections.mois6 ||
                implContent.budgetAllocation.roiProjections.mois12 ||
                implContent.budgetAllocation.roiProjections.mois24) && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Projections ROI
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricCard
                      label="6 mois"
                      value={implContent.budgetAllocation.roiProjections.mois6}
                      description="Projection court terme"
                    />
                    <MetricCard
                      label="12 mois"
                      value={implContent.budgetAllocation.roiProjections.mois12}
                      description="Projection moyen terme"
                    />
                    <MetricCard
                      label="24 mois"
                      value={implContent.budgetAllocation.roiProjections.mois24}
                      description="Projection long terme"
                    />
                  </div>
                  {implContent.budgetAllocation.roiProjections.hypotheses && (
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      {implContent.budgetAllocation.roiProjections.hypotheses}
                    </p>
                  )}
                </div>
              )}

            {/* Budget Simulator Toggle */}
            <div className="pt-2 border-t">
              <button
                onClick={() => setShowSimulator(!showSimulator)}
                className="flex items-center gap-2 rounded-lg border border-[#3cc4c4]/30 bg-[#3cc4c4]/5 px-4 py-2 text-sm font-medium text-[#3cc4c4] transition-colors hover:bg-[#3cc4c4]/10 w-full justify-center"
              >
                <Sliders className="h-4 w-4" />
                {showSimulator ? "Masquer le simulateur" : "Ouvrir le simulateur budget"}
              </button>
            </div>

            {showSimulator && (
              <BudgetSimulator
                campaigns={implContent.campaigns?.annualCalendar ?? []}
                budgetAllocation={implContent.budgetAllocation}
                currency={currency}
              />
            )}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 4. Team Structure                                                 */}
      {/* ================================================================= */}
      {implContent.teamStructure && (
        <CockpitSection
          icon={<UserPlus className="h-5 w-5" />}
          pillarLetter="I"
          title="Structure d&apos;Équipe"
          subtitle="Équipe actuelle, Recrutements, Partenaires"
          color={COLOR}
        >
          <div className="space-y-5">
            {/* Equipe Actuelle */}
            {Array.isArray(implContent.teamStructure.equipeActuelle) &&
              implContent.teamStructure.equipeActuelle.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Équipe actuelle
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {implContent.teamStructure.equipeActuelle.map((member, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm font-semibold">
                            {member.role}
                          </span>
                        </div>
                        {member.profil && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {member.profil}
                          </p>
                        )}
                        {member.allocation && (
                          <p className="mt-0.5 text-xs text-foreground/80">
                            Allocation : {member.allocation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Recrutements */}
            {Array.isArray(implContent.teamStructure.recrutements) &&
              implContent.teamStructure.recrutements.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recrutements
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {implContent.teamStructure.recrutements.map((rec, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-[#3cc4c4]/30 bg-[#3cc4c4]/10 px-2 py-0.5 text-[10px] font-bold" style={{ color: COLOR }}>
                            P{rec.priorite}
                          </span>
                          <span className="text-sm font-semibold">
                            {rec.role}
                          </span>
                        </div>
                        {rec.profil && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {rec.profil}
                          </p>
                        )}
                        {rec.echeance && (
                          <p className="mt-0.5 text-xs text-foreground/80">
                            <Calendar className="mr-1 inline h-3 w-3" />
                            {rec.echeance}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Partenaires Externes */}
            {Array.isArray(implContent.teamStructure.partenairesExternes) &&
              implContent.teamStructure.partenairesExternes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Partenaires externes
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {implContent.teamStructure.partenairesExternes.map(
                      (partner, i) => (
                        <div key={i} className="rounded-lg border p-3">
                          <p className="text-sm font-semibold">{partner.type}</p>
                          {partner.mission && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {partner.mission}
                            </p>
                          )}
                          <div className="mt-1.5 flex items-center gap-3 text-xs text-foreground/80">
                            {partner.budget && (
                              <span>{"\uD83D\uDCB0"} {partner.budget}</span>
                            )}
                            {partner.duree && (
                              <span>{"\u23F1"} {partner.duree}</span>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 5. Launch Plan                                                    */}
      {/* ================================================================= */}
      {implContent.launchPlan && (
        <CockpitSection
          icon={<Flag className="h-5 w-5" />}
          pillarLetter="I"
          title="Plan de Lancement"
          subtitle="Phases, Milestones, Go/No-Go"
          color={COLOR}
        >
          <div className="space-y-5">
            {/* Phases */}
            {Array.isArray(implContent.launchPlan.phases) &&
              implContent.launchPlan.phases.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phases
                  </p>
                  <div className="space-y-3">
                    {implContent.launchPlan.phases.map((phase, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-sm font-semibold">
                            {phase.nom}
                          </span>
                          {(phase.debut || phase.fin) && (
                            <span className="text-xs text-muted-foreground">
                              {phase.debut}
                              {phase.debut && phase.fin ? " \u2192 " : ""}
                              {phase.fin}
                            </span>
                          )}
                        </div>

                        {/* Objectifs */}
                        {Array.isArray(phase.objectifs) &&
                          phase.objectifs.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {phase.objectifs.map((obj, j) => (
                                <div
                                  key={j}
                                  className="flex items-start gap-1.5 text-xs text-foreground/80"
                                >
                                  <Target className="mt-0.5 h-3 w-3 shrink-0" style={{ color: COLOR }} />
                                  <span>{obj}</span>
                                </div>
                              ))}
                            </div>
                          )}

                        {/* Livrables */}
                        {Array.isArray(phase.livrables) &&
                          phase.livrables.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {phase.livrables.map((liv, j) => (
                                <span
                                  key={j}
                                  className="inline-flex items-center rounded-full border border-[#3cc4c4]/20 bg-[#3cc4c4]/5 px-2 py-0.5 text-[10px] font-medium"
                                >
                                  {liv}
                                </span>
                              ))}
                            </div>
                          )}

                        {/* Go/No-Go */}
                        {phase.goNoGo && (
                          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50/50 px-3 py-1.5">
                            <p className="text-xs text-amber-800">
                              <span className="font-semibold">Go/No-Go :</span>{" "}
                              {phase.goNoGo}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Milestones */}
            {Array.isArray(implContent.launchPlan.milestones) &&
              implContent.launchPlan.milestones.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Milestones
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {implContent.launchPlan.milestones.map((ms, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: COLOR }}
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{ms.jalon}</p>
                            {ms.date && (
                              <p className="text-xs text-muted-foreground">
                                {ms.date}
                              </p>
                            )}
                          </div>
                        </div>
                        {ms.responsable && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {"\uD83D\uDC64"} {ms.responsable}
                          </p>
                        )}
                        {ms.critereSucces && (
                          <p className="mt-0.5 text-xs text-emerald-700">
                            {"\u2713"} {ms.critereSucces}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 6. Operational Playbook                                           */}
      {/* ================================================================= */}
      {implContent.operationalPlaybook && (
        <CockpitSection
          icon={<BookOpen className="h-5 w-5" />}
          pillarLetter="I"
          title="Playbook Opérationnel"
          subtitle="Rythmes, Escalation, Stack outils"
          color={COLOR}
        >
          <div className="space-y-5">
            {/* Rythmes — 3-column grid */}
            {((Array.isArray(implContent.operationalPlaybook.rythmeQuotidien) &&
              implContent.operationalPlaybook.rythmeQuotidien.length > 0) ||
              (Array.isArray(implContent.operationalPlaybook.rythmeHebdomadaire) &&
                implContent.operationalPlaybook.rythmeHebdomadaire.length > 0) ||
              (Array.isArray(implContent.operationalPlaybook.rythmeMensuel) &&
                implContent.operationalPlaybook.rythmeMensuel.length > 0)) && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rythmes opérationnels
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Quotidien */}
                  {Array.isArray(implContent.operationalPlaybook.rythmeQuotidien) &&
                    implContent.operationalPlaybook.rythmeQuotidien.length > 0 && (
                      <div className="rounded-lg border p-3">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {"\uD83D\uDCC5"} Quotidien
                        </p>
                        <ul className="space-y-1">
                          {implContent.operationalPlaybook.rythmeQuotidien.map(
                            (item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-1.5 text-xs text-foreground/80"
                              >
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3cc4c4]" />
                                {item}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Hebdomadaire */}
                  {Array.isArray(
                    implContent.operationalPlaybook.rythmeHebdomadaire,
                  ) &&
                    implContent.operationalPlaybook.rythmeHebdomadaire.length >
                      0 && (
                      <div className="rounded-lg border p-3">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {"\uD83D\uDCC6"} Hebdomadaire
                        </p>
                        <ul className="space-y-1">
                          {implContent.operationalPlaybook.rythmeHebdomadaire.map(
                            (item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-1.5 text-xs text-foreground/80"
                              >
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3cc4c4]" />
                                {item}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Mensuel */}
                  {Array.isArray(implContent.operationalPlaybook.rythmeMensuel) &&
                    implContent.operationalPlaybook.rythmeMensuel.length > 0 && (
                      <div className="rounded-lg border p-3">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {"\uD83D\uDDD3"} Mensuel
                        </p>
                        <ul className="space-y-1">
                          {implContent.operationalPlaybook.rythmeMensuel.map(
                            (item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-1.5 text-xs text-foreground/80"
                              >
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3cc4c4]" />
                                {item}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Escalation */}
            {Array.isArray(implContent.operationalPlaybook.escalation) &&
              implContent.operationalPlaybook.escalation.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Escalation
                  </p>
                  <div className="space-y-2">
                    {implContent.operationalPlaybook.escalation.map((esc, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{esc.scenario}</p>
                          {esc.action && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {esc.action}
                            </p>
                          )}
                          {esc.responsable && (
                            <p className="mt-0.5 text-xs text-foreground/80">
                              Responsable : {esc.responsable}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Outils Stack */}
            {Array.isArray(implContent.operationalPlaybook.outilsStack) &&
              implContent.operationalPlaybook.outilsStack.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Stack outils
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {implContent.operationalPlaybook.outilsStack.map(
                      (tool, i) => (
                        <div key={i} className="rounded-lg border p-3">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="text-sm font-semibold">
                              {tool.outil}
                            </span>
                          </div>
                          {tool.usage && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {tool.usage}
                            </p>
                          )}
                          {tool.cout && (
                            <p
                              className="mt-0.5 text-xs font-semibold"
                              style={{ color: COLOR }}
                            >
                              {tool.cout}
                            </p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 7. Brand Platform                                                 */}
      {/* ================================================================= */}
      {implContent.brandPlatform && (
        <CockpitSection
          icon={<Crown className="h-5 w-5" />}
          pillarLetter="I"
          title="Plateforme de Marque"
          subtitle="Purpose, Vision, Mission, Valeurs, Personnalité, Territoire, Tagline"
          color={COLOR}
        >
          <div className="space-y-4">
            {/* Hero card — Purpose, Vision, Mission */}
            <div className="grid gap-3 sm:grid-cols-3">
              {implContent.brandPlatform.purpose && (
                <div className="rounded-lg border-l-4 border-[#3cc4c4] bg-[#3cc4c4]/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Purpose (WHY)
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed">
                    {implContent.brandPlatform.purpose}
                  </p>
                </div>
              )}
              {implContent.brandPlatform.vision && (
                <div className="rounded-lg border-l-4 border-[#c45a3c] bg-[#c45a3c]/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Vision
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed">
                    {implContent.brandPlatform.vision}
                  </p>
                </div>
              )}
              {implContent.brandPlatform.mission && (
                <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50/50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mission
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed">
                    {implContent.brandPlatform.mission}
                  </p>
                </div>
              )}
            </div>

            {/* Values */}
            {Array.isArray(implContent.brandPlatform.values) &&
              implContent.brandPlatform.values.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Valeurs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {implContent.brandPlatform.values.map((val, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-[#3cc4c4]/30 bg-[#3cc4c4]/10 px-3 py-1.5 text-xs font-semibold"
                        style={{ color: COLOR }}
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Personality + Territory */}
            <div className="grid gap-3 sm:grid-cols-2">
              {implContent.brandPlatform.personality && (
                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Personnalité de marque
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                    {implContent.brandPlatform.personality}
                  </p>
                </div>
              )}
              {implContent.brandPlatform.territory && (
                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Territoire d&apos;expression
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                    {implContent.brandPlatform.territory}
                  </p>
                </div>
              )}
            </div>

            {/* Tagline */}
            {implContent.brandPlatform.tagline && (
              <div className="rounded-lg border-2 border-dashed border-[#3cc4c4]/40 bg-[#3cc4c4]/5 px-6 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tagline / Signature
                </p>
                <p
                  className="mt-2 text-xl font-bold italic"
                  style={{ color: COLOR }}
                >
                  &ldquo;{implContent.brandPlatform.tagline}&rdquo;
                </p>
              </div>
            )}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 8. Copy Strategy                                                  */}
      {/* ================================================================= */}
      {implContent.copyStrategy && (
        <CockpitSection
          icon={<PenTool className="h-5 w-5" />}
          pillarLetter="I"
          title="Copy Strategy"
          subtitle="Promesse, RTB, Bénéfice, Ton, Contrainte"
          color={COLOR}
        >
          <div className="space-y-1">
            {/* Table layout */}
            <div className="overflow-hidden rounded-lg border">
              {[
                { label: "Promesse", value: implContent.copyStrategy.promise },
                { label: "Bénéfice consommateur", value: implContent.copyStrategy.consumerBenefit },
                { label: "Ton", value: implContent.copyStrategy.tone },
                { label: "Contrainte", value: implContent.copyStrategy.constraint },
              ]
                .filter((row) => row.value)
                .map((row, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 px-4 py-3 ${i % 2 === 0 ? "bg-muted/20" : ""}`}
                  >
                    <span className="w-40 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {row.label}
                    </span>
                    <span className="text-sm text-foreground/80">{row.value}</span>
                  </div>
                ))}

              {/* RTB as special row with bullets */}
              {Array.isArray(implContent.copyStrategy.rtb) &&
                implContent.copyStrategy.rtb.length > 0 && (
                  <div className="flex items-start gap-4 px-4 py-3 bg-muted/20">
                    <span className="w-40 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Reasons to Believe
                    </span>
                    <div className="space-y-1">
                      {implContent.copyStrategy.rtb.map((item, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-sm text-foreground/80">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: COLOR }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 9. Big Idea                                                       */}
      {/* ================================================================= */}
      {implContent.bigIdea && (
        <CockpitSection
          icon={<Lightbulb className="h-5 w-5" />}
          pillarLetter="I"
          title="Big Idea"
          subtitle="Concept créatif, Mécanisme, Déclinaisons"
          color={COLOR}
        >
          <div className="space-y-4">
            {/* Concept hero */}
            {implContent.bigIdea.concept && (
              <div className="rounded-lg border-2 border-[#c45a3c]/30 bg-[#c45a3c]/5 px-6 py-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Concept central
                </p>
                <p className="mt-2 text-lg font-bold text-[#c45a3c]">
                  {implContent.bigIdea.concept}
                </p>
              </div>
            )}

            {/* Mechanism + Insight */}
            <div className="grid gap-3 sm:grid-cols-2">
              {implContent.bigIdea.mechanism && (
                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mécanisme créatif
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                    {implContent.bigIdea.mechanism}
                  </p>
                </div>
              )}
              {implContent.bigIdea.insightLink && (
                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Lien insight consommateur
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                    {implContent.bigIdea.insightLink}
                  </p>
                </div>
              )}
            </div>

            {/* Déclinaisons */}
            {Array.isArray(implContent.bigIdea.declinaisons) &&
              implContent.bigIdea.declinaisons.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Déclinaisons par support
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {implContent.bigIdea.declinaisons.map((dec, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <p className="text-xs font-bold uppercase" style={{ color: COLOR }}>
                          {dec.support}
                        </p>
                        <p className="mt-1 text-sm text-foreground/80">
                          {dec.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 10. Activation Dispositif (POEM)                                  */}
      {/* ================================================================= */}
      {implContent.activationDispositif && (
        <CockpitSection
          icon={<Radio className="h-5 w-5" />}
          pillarLetter="I"
          title="Dispositif d&apos;Activation"
          subtitle="Owned, Earned, Paid, Shared + Parcours consommateur"
          color={COLOR}
        >
          <div className="space-y-4">
            {/* 4-column POEM grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  { key: "owned" as const, label: "Owned", color: "#3cc4c4" },
                  { key: "earned" as const, label: "Earned", color: "#c45a3c" },
                  { key: "paid" as const, label: "Paid", color: "#e6a23c" },
                  { key: "shared" as const, label: "Shared", color: "#7c5cbf" },
                ] as const
              ).map((cat) => {
                const items = implContent.activationDispositif?.[cat.key];
                if (!Array.isArray(items) || items.length === 0) return null;
                return (
                  <div key={cat.key} className="rounded-lg border p-3">
                    <p
                      className="mb-2 text-xs font-bold uppercase tracking-wider"
                      style={{ color: cat.color }}
                    >
                      {cat.label}
                    </p>
                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className="text-xs">
                          <p className="font-semibold">{item.canal}</p>
                          {item.role && (
                            <p className="text-muted-foreground">{item.role}</p>
                          )}
                          {item.budget && (
                            <p className="font-medium" style={{ color: cat.color }}>
                              {item.budget}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Parcours conso */}
            {implContent.activationDispositif.parcoursConso && (
              <div className="rounded-lg border-l-4 border-[#3cc4c4]/30 bg-[#3cc4c4]/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Parcours consommateur
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  {implContent.activationDispositif.parcoursConso}
                </p>
              </div>
            )}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 11. Governance                                                    */}
      {/* ================================================================= */}
      {implContent.governance && (
        <CockpitSection
          icon={<Shield className="h-5 w-5" />}
          pillarLetter="I"
          title="Gouvernance"
          subtitle="Comités, Process de validation, Délais"
          color={COLOR}
        >
          <div className="space-y-4">
            {/* Comités — 3 columns */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { key: "comiteStrategique" as const, label: "Comité Stratégique", icon: "🏛️" },
                { key: "comitePilotage" as const, label: "Comité de Pilotage", icon: "🎯" },
                { key: "pointsOperationnels" as const, label: "Points Opérationnels", icon: "⚙️" },
              ].map((comite) => {
                const data = implContent.governance?.[comite.key];
                if (!data) return null;
                return (
                  <div key={comite.key} className="rounded-lg border p-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {comite.icon} {comite.label}
                    </p>
                    {data.frequence && (
                      <p className="mt-1 text-sm font-semibold" style={{ color: COLOR }}>
                        {data.frequence}
                      </p>
                    )}
                    {data.participants && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        👥 {data.participants}
                      </p>
                    )}
                    {data.objectif && (
                      <p className="mt-1 text-xs text-foreground/80">
                        {data.objectif}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Process validation */}
            {implContent.governance.processValidation && (
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Process de validation
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  {implContent.governance.processValidation}
                </p>
              </div>
            )}

            {/* Délais standards */}
            {Array.isArray(implContent.governance.delaisStandards) &&
              implContent.governance.delaisStandards.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Délais standards
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {implContent.governance.delaisStandards.map((d, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <span className="text-xs text-foreground/80">{d.livrable}</span>
                        <span className="text-xs font-bold" style={{ color: COLOR }}>
                          {d.delai}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 12. Workstreams                                                   */}
      {/* ================================================================= */}
      {Array.isArray(implContent.workstreams) &&
        implContent.workstreams.length > 0 && (
        <CockpitSection
          icon={<Layers className="h-5 w-5" />}
          pillarLetter="I"
          title="Streams de Travail"
          subtitle="Objectifs, Livrables, Fréquences, KPIs"
          color={COLOR}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {implContent.workstreams.map((stream, i) => (
              <div key={i} className="rounded-lg border p-4">
                <p className="text-sm font-bold" style={{ color: COLOR }}>
                  {stream.name}
                </p>
                {stream.objectif && (
                  <p className="mt-1 text-xs text-foreground/80">
                    {stream.objectif}
                  </p>
                )}
                {stream.frequence && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    📅 {stream.frequence}
                  </p>
                )}

                {/* Livrables */}
                {Array.isArray(stream.livrables) &&
                  stream.livrables.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Livrables
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {stream.livrables.map((liv, j) => (
                          <span
                            key={j}
                            className="inline-flex items-center rounded-full border border-[#3cc4c4]/20 bg-[#3cc4c4]/5 px-2 py-0.5 text-[10px] font-medium"
                          >
                            {liv}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* KPIs */}
                {Array.isArray(stream.kpis) && stream.kpis.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      KPIs
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {stream.kpis.map((kpi, j) => (
                        <div key={j} className="flex items-start gap-1 text-[11px] text-foreground/80">
                          <Target className="mt-0.5 h-3 w-3 shrink-0" style={{ color: COLOR }} />
                          {kpi}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 13. Brand Architecture                                            */}
      {/* ================================================================= */}
      {implContent.brandArchitecture && (
        <CockpitSection
          icon={<Network className="h-5 w-5" />}
          pillarLetter="I"
          title="Architecture de Marque"
          subtitle="Modèle, Hiérarchie, Règles de coexistence"
          color={COLOR}
        >
          <div className="space-y-4">
            {/* Model */}
            {implContent.brandArchitecture.model && (
              <div className="rounded-lg border-l-4 border-[#3cc4c4] bg-[#3cc4c4]/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Modèle d&apos;architecture
                </p>
                <p className="mt-1 text-sm font-bold" style={{ color: COLOR }}>
                  {implContent.brandArchitecture.model}
                </p>
              </div>
            )}

            {/* Hierarchy */}
            {Array.isArray(implContent.brandArchitecture.hierarchy) &&
              implContent.brandArchitecture.hierarchy.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hiérarchie des marques
                  </p>
                  <div className="space-y-2">
                    {implContent.brandArchitecture.hierarchy.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: COLOR }}
                        >
                          {item.level?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{item.brand}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.level}
                            {item.role ? ` — ${item.role}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Coexistence Rules */}
            {implContent.brandArchitecture.coexistenceRules && (
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Règles de coexistence
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  {implContent.brandArchitecture.coexistenceRules}
                </p>
              </div>
            )}
          </div>
        </CockpitSection>
      )}

      {/* ================================================================= */}
      {/* 14. Guiding Principles                                            */}
      {/* ================================================================= */}
      {implContent.guidingPrinciples && (
        <CockpitSection
          icon={<Compass className="h-5 w-5" />}
          pillarLetter="I"
          title="Principes Directeurs"
          subtitle="Do&apos;s, Don&apos;ts, Principes de communication, Critères de cohérence"
          color={COLOR}
        >
          <div className="space-y-4">
            {/* Do's and Don'ts — 2 columns */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Do's */}
              {Array.isArray(implContent.guidingPrinciples.dos) &&
                implContent.guidingPrinciples.dos.length > 0 && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                      <CheckCircle className="mr-1 inline h-3.5 w-3.5" />
                      Do&apos;s
                    </p>
                    <div className="space-y-1.5">
                      {implContent.guidingPrinciples.dos.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-emerald-800">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Don'ts */}
              {Array.isArray(implContent.guidingPrinciples.donts) &&
                implContent.guidingPrinciples.donts.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-700">
                      <XCircle className="mr-1 inline h-3.5 w-3.5" />
                      Don&apos;ts
                    </p>
                    <div className="space-y-1.5">
                      {implContent.guidingPrinciples.donts.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-red-800">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Communication Principles */}
            {Array.isArray(implContent.guidingPrinciples.communicationPrinciples) &&
              implContent.guidingPrinciples.communicationPrinciples.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Principes de communication
                  </p>
                  <div className="space-y-1.5">
                    {implContent.guidingPrinciples.communicationPrinciples.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2"
                      >
                        <Compass className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: COLOR }} />
                        <p className="text-xs text-foreground/80">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Coherence Criteria */}
            {Array.isArray(implContent.guidingPrinciples.coherenceCriteria) &&
              implContent.guidingPrinciples.coherenceCriteria.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Critères de cohérence
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {implContent.guidingPrinciples.coherenceCriteria.map((item, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-[#3cc4c4]/30 bg-[#3cc4c4]/10 px-3 py-1 text-[11px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </CockpitSection>
      )}
    </div>
  );
}
