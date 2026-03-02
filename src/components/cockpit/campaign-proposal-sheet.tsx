// =============================================================================
// COMPONENT C.K8c — Campaign Proposal Sheet
// =============================================================================
// Full-detail side panel for a campaign proposal. Opens from the budget
// simulator when clicking a campaign row. Pulls from ALL available variables:
// enriched calendar data, templates UPGRADERS, copy strategy, big idea,
// activation plan, and POEM dispositif.
// =============================================================================

"use client";

import {
  Calendar,
  Target,
  Megaphone,
  Lightbulb,
  PenTool,
  Radio,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import type { SupportedCurrency } from "~/lib/constants";
import { formatCurrency, parseCurrencyString } from "~/lib/currency";

// ---------------------------------------------------------------------------
// Types (match pillar-schemas.ts structures)
// ---------------------------------------------------------------------------

export interface EnrichedCampaignItem {
  mois: string;
  campagne: string;
  objectif: string;
  budget: string;
  canaux: string[];
  kpiCible: string;
  actionsDetaillees?: string[];
  messagesCles?: string[];
  budgetDetail?: {
    production: string;
    media: string;
    talent: string;
  };
  timeline?: {
    debut: string;
    fin: string;
  };
  metriquesSucces?: string[];
}

export interface CampaignTemplate {
  nom: string;
  type: string;
  description: string;
  duree: string;
  canauxPrincipaux: string[];
  messagesCles: string[];
  budgetEstime: string;
  kpisAttendus: string[];
}

export interface ActivationPlan {
  phase1Teasing: string;
  phase2Lancement: string;
  phase3Amplification: string;
  phase4Fidelisation: string;
}

export interface CopyStrategy {
  promise: string;
  rtb: string[];
  consumerBenefit: string;
  tone: string;
  constraint: string;
}

export interface BigIdea {
  concept: string;
  mechanism: string;
  insightLink: string;
  declinaisons: { support: string; description: string }[];
}

export interface ActivationDispositif {
  owned: { canal: string; role: string; budget: string }[];
  earned: { canal: string; role: string; budget: string }[];
  paid: { canal: string; role: string; budget: string }[];
  shared: { canal: string; role: string; budget: string }[];
  parcoursConso: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COLOR = "#06B6D4"; // Pillar I cyan

function getBudgetHealthColor(ratio: number): string {
  if (ratio >= 0.8) return "#22c55e";
  if (ratio >= 0.5) return "#eab308";
  if (ratio >= 0.3) return "#f97316";
  return "#ef4444";
}

/** Map month index (0-11) to activation phase */
function getActivationPhaseForMonth(monthIndex: number): {
  key: keyof ActivationPlan;
  label: string;
  icon: string;
} | null {
  if (monthIndex <= 1)
    return { key: "phase1Teasing", label: "Phase 1 \u2014 Teasing", icon: "\uD83D\uDC40" };
  if (monthIndex <= 4)
    return { key: "phase2Lancement", label: "Phase 2 \u2014 Lancement", icon: "\uD83D\uDE80" };
  if (monthIndex <= 8)
    return { key: "phase3Amplification", label: "Phase 3 \u2014 Amplification", icon: "\uD83D\uDCE2" };
  return { key: "phase4Fidelisation", label: "Phase 4 \u2014 Fid\u00e9lisation", icon: "\u2764\uFE0F" };
}

/** Find matching templates by overlapping channels */
function findMatchingTemplates(
  campaign: EnrichedCampaignItem,
  templates: CampaignTemplate[],
): CampaignTemplate[] {
  if (!templates.length || !campaign.canaux?.length) return [];
  const campaignChannels = new Set(
    campaign.canaux.map((c) => c.toLowerCase()),
  );
  return templates.filter((t) =>
    t.canauxPrincipaux?.some((c) => campaignChannels.has(c.toLowerCase())),
  );
}

/** Find POEM channels matching campaign channels */
function findPOEMChannels(
  campaign: EnrichedCampaignItem,
  dispositif: ActivationDispositif | undefined,
): { type: string; canal: string; role: string; budget: string }[] {
  if (!dispositif || !campaign.canaux?.length) return [];
  const campaignChannels = new Set(
    campaign.canaux.map((c) => c.toLowerCase()),
  );
  const results: { type: string; canal: string; role: string; budget: string }[] = [];
  const categories = [
    { type: "Owned", items: dispositif.owned },
    { type: "Earned", items: dispositif.earned },
    { type: "Paid", items: dispositif.paid },
    { type: "Shared", items: dispositif.shared },
  ];
  for (const cat of categories) {
    for (const item of cat.items ?? []) {
      if (campaignChannels.has(item.canal.toLowerCase())) {
        results.push({ type: cat.type, ...item });
      }
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Sub-section component
// ---------------------------------------------------------------------------

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CampaignProposalSheet({
  campaign,
  campaignIndex,
  simulatedBudget,
  originalBudget,
  currency,
  templates,
  activationPlan,
  copyStrategy,
  bigIdea,
  activationDispositif,
  open,
  onOpenChange,
}: {
  campaign: EnrichedCampaignItem;
  campaignIndex: number;
  simulatedBudget: number;
  originalBudget: number;
  currency: SupportedCurrency;
  templates?: CampaignTemplate[];
  activationPlan?: ActivationPlan;
  copyStrategy?: CopyStrategy;
  bigIdea?: BigIdea;
  activationDispositif?: ActivationDispositif;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const budgetRatio = originalBudget > 0 ? simulatedBudget / originalBudget : 1;
  const budgetVariation = Math.round((budgetRatio - 1) * 100);

  // Recalculate budget breakdown proportionally
  const prodOriginal = parseCurrencyString(campaign.budgetDetail?.production ?? "") ?? 0;
  const mediaOriginal = parseCurrencyString(campaign.budgetDetail?.media ?? "") ?? 0;
  const talentOriginal = parseCurrencyString(campaign.budgetDetail?.talent ?? "") ?? 0;
  const detailTotal = prodOriginal + mediaOriginal + talentOriginal;
  const detailRatio = detailTotal > 0 ? simulatedBudget / detailTotal : budgetRatio;

  // Cross-reference data
  const matchingTemplates = findMatchingTemplates(campaign, templates ?? []);
  const poemChannels = findPOEMChannels(campaign, activationDispositif);
  const activationPhase = getActivationPhaseForMonth(campaignIndex);
  const phaseDescription =
    activationPhase && activationPlan
      ? activationPlan[activationPhase.key]
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-xl lg:max-w-2xl"
      >
        {/* ── Header ── */}
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-white"
              style={{ backgroundColor: COLOR }}
            >
              {campaign.mois}
            </span>
            {budgetVariation !== 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: getBudgetHealthColor(budgetRatio) }}
              >
                <TrendingUp className="h-2.5 w-2.5" />
                {budgetVariation > 0 ? "+" : ""}
                {budgetVariation}%
              </span>
            )}
          </div>
          <SheetTitle className="text-xl">{campaign.campagne}</SheetTitle>
          {campaign.objectif && (
            <SheetDescription>{campaign.objectif}</SheetDescription>
          )}
        </SheetHeader>

        <div className="space-y-6 p-4">
          {/* ── 1. Budget comparatif ── */}
          <Section
            icon={<DollarSign className="h-4 w-4" style={{ color: COLOR }} />}
            title="Budget"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-muted/20 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Original
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {formatCurrency(originalBudget, currency)}
                </p>
              </div>
              <div
                className="rounded-lg border-2 p-3 text-center"
                style={{ borderColor: COLOR }}
              >
                <p
                  className="text-[10px] font-semibold uppercase"
                  style={{ color: COLOR }}
                >
                  Simul&eacute;
                </p>
                <p className="mt-1 text-lg font-bold" style={{ color: COLOR }}>
                  {formatCurrency(simulatedBudget, currency)}
                </p>
              </div>
            </div>

            {/* Budget breakdown */}
            {campaign.budgetDetail &&
              (campaign.budgetDetail.production ||
                campaign.budgetDetail.media ||
                campaign.budgetDetail.talent) && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      label: "Production",
                      original: prodOriginal,
                      simulated: Math.round(prodOriginal * detailRatio),
                    },
                    {
                      label: "M\u00e9dia",
                      original: mediaOriginal,
                      simulated: Math.round(mediaOriginal * detailRatio),
                    },
                    {
                      label: "Talent",
                      original: talentOriginal,
                      simulated: Math.round(talentOriginal * detailRatio),
                    },
                  ].map((item) =>
                    item.original > 0 ? (
                      <div
                        key={item.label}
                        className="rounded-lg bg-muted/30 px-3 py-2 text-center"
                      >
                        <p className="text-[9px] font-medium text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="text-xs font-semibold text-foreground/70 line-through">
                          {formatCurrency(item.original, currency)}
                        </p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: COLOR }}
                        >
                          {formatCurrency(item.simulated, currency)}
                        </p>
                      </div>
                    ) : null,
                  )}
                </div>
              )}
          </Section>

          {/* ── 2. Timeline ── */}
          {campaign.timeline &&
            (campaign.timeline.debut || campaign.timeline.fin) && (
              <Section
                icon={
                  <Calendar className="h-4 w-4" style={{ color: COLOR }} />
                }
                title="Timeline"
              >
                <div className="flex items-center gap-3 rounded-lg bg-muted/20 px-4 py-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {campaign.timeline.debut}
                      {campaign.timeline.fin &&
                        ` \u2014 ${campaign.timeline.fin}`}
                    </p>
                  </div>
                </div>
              </Section>
            )}

          {/* ── 3. Actions détaillées ── */}
          {Array.isArray(campaign.actionsDetaillees) &&
            campaign.actionsDetaillees.length > 0 && (
              <Section
                icon={
                  <CheckCircle className="h-4 w-4" style={{ color: COLOR }} />
                }
                title="Actions d&eacute;taill&eacute;es"
              >
                <ol className="space-y-1.5">
                  {campaign.actionsDetaillees.map((action, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: COLOR }}
                      >
                        {i + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ol>
              </Section>
            )}

          {/* ── 4. Messages clés ── */}
          {Array.isArray(campaign.messagesCles) &&
            campaign.messagesCles.length > 0 && (
              <Section
                icon={
                  <Megaphone className="h-4 w-4" style={{ color: COLOR }} />
                }
                title="Messages cl&eacute;s"
              >
                <div className="space-y-2">
                  {campaign.messagesCles.map((msg, i) => (
                    <div
                      key={i}
                      className="rounded-lg border-l-4 bg-muted/20 px-4 py-2"
                      style={{ borderColor: COLOR }}
                    >
                      <p className="text-sm italic text-foreground/80">
                        &ldquo;{msg}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

          {/* ── 5. Canaux & POEM ── */}
          {Array.isArray(campaign.canaux) && campaign.canaux.length > 0 && (
            <Section
              icon={<Radio className="h-4 w-4" style={{ color: COLOR }} />}
              title="Canaux &amp; Touchpoints"
            >
              <div className="flex flex-wrap gap-1.5">
                {campaign.canaux.map((canal, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="border-cyan-500/30 bg-cyan-500/5 text-xs"
                  >
                    {canal}
                  </Badge>
                ))}
              </div>
              {poemChannels.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Dispositif POEM
                  </p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {poemChannels.map((ch, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-lg bg-muted/20 px-3 py-2"
                      >
                        <Badge variant="secondary" className="shrink-0 text-[9px]">
                          {ch.type}
                        </Badge>
                        <div className="min-w-0 text-xs">
                          <p className="font-medium">{ch.canal}</p>
                          {ch.role && (
                            <p className="text-muted-foreground">{ch.role}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* ── 6. KPIs & Métriques ── */}
          {((campaign.kpiCible) ||
            (Array.isArray(campaign.metriquesSucces) &&
              campaign.metriquesSucces.length > 0)) && (
            <Section
              icon={<Target className="h-4 w-4" style={{ color: COLOR }} />}
              title="KPIs &amp; M&eacute;triques de succ&egrave;s"
            >
              {campaign.kpiCible && (
                <div className="rounded-lg border bg-muted/20 px-4 py-2">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                    KPI cible
                  </p>
                  <p className="text-sm font-medium">{campaign.kpiCible}</p>
                </div>
              )}
              {Array.isArray(campaign.metriquesSucces) &&
                campaign.metriquesSucces.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {campaign.metriquesSucces.map((kpi, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700"
                      >
                        <Target className="mr-1 h-3 w-3" />
                        {kpi}
                      </span>
                    ))}
                  </div>
                )}
            </Section>
          )}

          {/* ── 7. Copy Strategy ── */}
          {copyStrategy &&
            (copyStrategy.promise || copyStrategy.tone) && (
              <Section
                icon={
                  <PenTool className="h-4 w-4" style={{ color: COLOR }} />
                }
                title="Copy Strategy"
              >
                <div className="space-y-2 rounded-lg border bg-muted/10 p-3">
                  {copyStrategy.promise && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Promesse
                      </p>
                      <p className="text-sm">{copyStrategy.promise}</p>
                    </div>
                  )}
                  {Array.isArray(copyStrategy.rtb) &&
                    copyStrategy.rtb.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">
                          Reasons to Believe
                        </p>
                        <ul className="list-disc pl-4">
                          {copyStrategy.rtb.map((r, i) => (
                            <li
                              key={i}
                              className="text-xs text-foreground/80"
                            >
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {copyStrategy.consumerBenefit && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        B&eacute;n&eacute;fice consommateur
                      </p>
                      <p className="text-sm">{copyStrategy.consumerBenefit}</p>
                    </div>
                  )}
                  {copyStrategy.tone && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Tone of voice
                      </p>
                      <p className="text-sm italic">{copyStrategy.tone}</p>
                    </div>
                  )}
                </div>
              </Section>
            )}

          {/* ── 8. Big Idea ── */}
          {bigIdea && bigIdea.concept && (
            <Section
              icon={
                <Lightbulb className="h-4 w-4" style={{ color: COLOR }} />
              }
              title="Big Idea"
            >
              <div className="space-y-2 rounded-lg border bg-muted/10 p-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">
                    Concept
                  </p>
                  <p className="text-sm font-semibold" style={{ color: COLOR }}>
                    {bigIdea.concept}
                  </p>
                </div>
                {bigIdea.mechanism && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      M&eacute;canisme
                    </p>
                    <p className="text-sm">{bigIdea.mechanism}</p>
                  </div>
                )}
                {bigIdea.insightLink && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      Lien insight
                    </p>
                    <p className="text-xs text-foreground/70">
                      {bigIdea.insightLink}
                    </p>
                  </div>
                )}
                {Array.isArray(bigIdea.declinaisons) &&
                  bigIdea.declinaisons.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        D&eacute;clinaisons
                      </p>
                      <div className="space-y-1">
                        {bigIdea.declinaisons.map((d, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs"
                          >
                            <Badge
                              variant="outline"
                              className="shrink-0 text-[9px]"
                            >
                              {d.support}
                            </Badge>
                            <span className="text-foreground/70">
                              {d.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </Section>
          )}

          {/* ── 9. Template associé ── */}
          {matchingTemplates.length > 0 && (
            <Section
              icon={
                <Megaphone className="h-4 w-4" style={{ color: COLOR }} />
              }
              title="Templates UPGRADERS associ&eacute;s"
            >
              <div className="space-y-2">
                {matchingTemplates.map((tpl, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{tpl.nom}</span>
                      <Badge
                        className="text-[10px] text-white"
                        style={{ backgroundColor: COLOR }}
                      >
                        {tpl.type}
                      </Badge>
                      {tpl.duree && (
                        <span className="text-[10px] text-muted-foreground">
                          {tpl.duree}
                        </span>
                      )}
                    </div>
                    {tpl.description && (
                      <p className="text-xs text-muted-foreground">
                        {tpl.description}
                      </p>
                    )}
                    {tpl.budgetEstime && (
                      <p className="text-xs">
                        <span className="font-semibold">Budget estim&eacute; :</span>{" "}
                        {tpl.budgetEstime}
                      </p>
                    )}
                    {Array.isArray(tpl.kpisAttendus) &&
                      tpl.kpisAttendus.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tpl.kpisAttendus.map((kpi, j) => (
                            <span
                              key={j}
                              className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700"
                            >
                              {kpi}
                            </span>
                          ))}
                        </div>
                      )}
                    {Array.isArray(tpl.messagesCles) &&
                      tpl.messagesCles.length > 0 && (
                        <div className="space-y-0.5">
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
            </Section>
          )}

          {/* ── 10. Phase d'activation ── */}
          {activationPhase && phaseDescription && (
            <Section
              icon={<TrendingUp className="h-4 w-4" style={{ color: COLOR }} />}
              title="Phase d&apos;activation"
            >
              <div className="flex items-start gap-3 rounded-lg border bg-muted/20 px-4 py-3">
                <span className="mt-0.5 text-xl">{activationPhase.icon}</span>
                <div>
                  <p className="text-sm font-semibold">
                    {activationPhase.label}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/70">
                    {phaseDescription}
                  </p>
                </div>
              </div>
            </Section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
