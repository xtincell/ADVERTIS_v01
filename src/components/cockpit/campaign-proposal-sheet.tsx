// =============================================================================
// COMPONENT C.K8c — Campaign Proposal Sheet
// =============================================================================
// Full-detail side panel for a campaign proposal. Opens from the budget
// simulator when clicking a campaign row. Pulls from ALL available variables:
// enriched calendar data, templates UPGRADERS, copy strategy, big idea,
// activation plan, and POEM dispositif.
//
// Includes "Actions de production" section with inline Glory generation:
// - Devis de production (production quote with market-aligned pricing)
// - Brief prestataire (vendor brief pre-filled from campaign data)
// - Simulation 360° (multi-channel adaptation)
// =============================================================================

"use client";

import { useState, useCallback } from "react";
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
  Wrench,
  Receipt,
  FileText,
  Globe,
  Loader2,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { SupportedCurrency } from "~/lib/constants";
import { formatCurrency, parseCurrencyString } from "~/lib/currency";
import { api } from "~/trpc/react";

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
// Types for Glory generation results
// ---------------------------------------------------------------------------

type GenerationAction = "devis" | "brief" | "360";
type GenerationState = "idle" | "generating" | "complete" | "error";

interface DevisLigne {
  poste: string;
  designation: string;
  specs: string;
  quantite: number;
  prixUnitaire: string;
  total: string;
  delai: string;
  prestataire: string;
}

interface DevisResult {
  devis?: {
    reference?: string;
    campaign?: string;
    date?: string;
    client?: string;
    validite?: string;
  };
  lignes?: DevisLigne[];
  sousTotal?: string;
  fraisGestion?: string;
  totalHT?: string;
  tva?: string;
  totalTTC?: string;
  budgetAnalysis?: {
    budgetDemande?: string;
    budgetEstime?: string;
    ecart?: string;
    ratioProduction?: string;
  };
  planning?: { phase: string; debut: string; fin: string; livrables: string[] }[];
  conditions?: string;
  recommandations?: string;
  risques?: string;
}

interface BriefResult {
  briefTitle?: string;
  vendor?: string;
  projectContext?: string;
  deliverables?: { item: string; specs: string; quantity: string }[];
  timeline?: { milestones: { date: string; deliverable: string }[] };
  technicalRequirements?: string;
  brandGuidelines?: string;
  budget?: string;
  qualityCriteria?: string;
  contactInfo?: string;
}

interface Adaptation360 {
  channel: string;
  format: string;
  headline: string;
  visualAdaptation: string;
  copyAdaptation: string;
  technicalSpecs: string;
  productionNotes: string;
}

interface Result360 {
  adaptations?: Adaptation360[];
  coherenceScore?: number;
  productionPriority?: string[];
  estimatedProductionComplexity?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COLOR = "#06B6D4"; // Pillar I cyan
const ACTION_COLOR = "#8B5CF6"; // Violet for actions section

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

/** Build a deliverables string from campaign data */
function buildDeliverablesString(campaign: EnrichedCampaignItem): string {
  const parts: string[] = [];
  if (Array.isArray(campaign.canaux)) {
    for (const canal of campaign.canaux) {
      parts.push(canal);
    }
  }
  if (Array.isArray(campaign.actionsDetaillees)) {
    for (const action of campaign.actionsDetaillees) {
      if (!parts.some((p) => p.toLowerCase().includes(action.toLowerCase().slice(0, 10)))) {
        parts.push(action);
      }
    }
  }
  return parts.join(", ");
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
// Devis Result Renderer
// ---------------------------------------------------------------------------

function DevisResultView({ data }: { data: DevisResult }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      {data.devis && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono font-bold">{data.devis.reference}</span>
          <span>{data.devis.date}</span>
        </div>
      )}

      {/* Budget analysis */}
      {data.budgetAnalysis && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
            Analyse budget
          </p>
          <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
            {data.budgetAnalysis.budgetDemande && (
              <div>
                <span className="text-muted-foreground">Demand&eacute; : </span>
                <span className="font-semibold">{data.budgetAnalysis.budgetDemande}</span>
              </div>
            )}
            {data.budgetAnalysis.budgetEstime && (
              <div>
                <span className="text-muted-foreground">Estim&eacute; : </span>
                <span className="font-semibold">{data.budgetAnalysis.budgetEstime}</span>
              </div>
            )}
          </div>
          {data.budgetAnalysis.ecart && (
            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
              {data.budgetAnalysis.ecart}
            </p>
          )}
        </div>
      )}

      {/* Table */}
      {Array.isArray(data.lignes) && data.lignes.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-2 py-1.5 text-left font-semibold">Poste</th>
                <th className="px-2 py-1.5 text-left font-semibold">D&eacute;signation</th>
                <th className="px-2 py-1.5 text-center font-semibold">Qt&eacute;</th>
                <th className="px-2 py-1.5 text-right font-semibold">P.U.</th>
                <th className="px-2 py-1.5 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.lignes.map((ligne, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-2 py-1.5">
                    <Badge variant="outline" className="text-[9px]">
                      {ligne.poste}
                    </Badge>
                  </td>
                  <td className="px-2 py-1.5">
                    <p className="font-medium">{ligne.designation}</p>
                    <p className="text-[10px] text-muted-foreground">{ligne.specs}</p>
                  </td>
                  <td className="px-2 py-1.5 text-center">{ligne.quantite}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ligne.prixUnitaire}</td>
                  <td className="px-2 py-1.5 text-right font-mono font-semibold">{ligne.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals */}
      <div className="space-y-1 rounded-lg bg-muted/20 p-3 text-xs">
        {data.sousTotal && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sous-total</span>
            <span className="font-mono">{data.sousTotal}</span>
          </div>
        )}
        {data.fraisGestion && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Frais gestion agence</span>
            <span className="font-mono">{data.fraisGestion}</span>
          </div>
        )}
        {data.totalHT && (
          <div className="flex justify-between border-t pt-1">
            <span className="font-semibold">Total HT</span>
            <span className="font-mono font-semibold">{data.totalHT}</span>
          </div>
        )}
        {data.tva && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">TVA</span>
            <span className="font-mono">{data.tva}</span>
          </div>
        )}
        {data.totalTTC && (
          <div className="flex justify-between border-t pt-1" style={{ color: ACTION_COLOR }}>
            <span className="font-bold">Total TTC</span>
            <span className="font-mono font-bold">{data.totalTTC}</span>
          </div>
        )}
      </div>

      {/* Planning */}
      {Array.isArray(data.planning) && data.planning.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Planning</p>
          {data.planning.map((phase, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: ACTION_COLOR }}>
                {i + 1}
              </span>
              <div>
                <span className="font-semibold">{phase.phase}</span>
                <span className="text-muted-foreground"> ({phase.debut} — {phase.fin})</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conditions & Recommendations */}
      {data.conditions && (
        <div className="text-xs">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Conditions</p>
          <p className="text-foreground/80">{data.conditions}</p>
        </div>
      )}
      {data.recommandations && (
        <div className="text-xs">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Recommandations</p>
          <p className="text-foreground/80">{data.recommandations}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brief Result Renderer
// ---------------------------------------------------------------------------

function BriefResultView({ data }: { data: BriefResult }) {
  return (
    <div className="space-y-3">
      {data.briefTitle && (
        <p className="text-sm font-semibold">{data.briefTitle}</p>
      )}
      {data.projectContext && (
        <div className="text-xs">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Contexte</p>
          <p className="text-foreground/80">{data.projectContext}</p>
        </div>
      )}
      {Array.isArray(data.deliverables) && data.deliverables.length > 0 && (
        <div className="text-xs">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Livrables</p>
          <div className="space-y-1 mt-1">
            {data.deliverables.map((d, i) => (
              <div key={i} className="rounded border p-2">
                <p className="font-medium">{d.item}</p>
                <p className="text-muted-foreground">{d.specs}</p>
                {d.quantity && <p className="text-muted-foreground">Qt&eacute; : {d.quantity}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {data.technicalRequirements && (
        <div className="text-xs">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Exigences techniques</p>
          <p className="text-foreground/80">{data.technicalRequirements}</p>
        </div>
      )}
      {data.brandGuidelines && (
        <div className="text-xs">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Guidelines marque</p>
          <p className="text-foreground/80">{data.brandGuidelines}</p>
        </div>
      )}
      {data.qualityCriteria && (
        <div className="text-xs">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Crit&egrave;res qualit&eacute;</p>
          <p className="text-foreground/80">{data.qualityCriteria}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 360° Result Renderer
// ---------------------------------------------------------------------------

function Result360View({ data }: { data: Result360 }) {
  return (
    <div className="space-y-3">
      {data.coherenceScore !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Score de coh&eacute;rence :</span>
          <Badge
            variant="outline"
            className="text-xs font-bold"
            style={{
              borderColor: data.coherenceScore >= 7 ? "#22c55e" : data.coherenceScore >= 5 ? "#eab308" : "#ef4444",
              color: data.coherenceScore >= 7 ? "#22c55e" : data.coherenceScore >= 5 ? "#eab308" : "#ef4444",
            }}
          >
            {data.coherenceScore}/10
          </Badge>
        </div>
      )}
      {Array.isArray(data.adaptations) && data.adaptations.length > 0 && (
        <div className="space-y-2">
          {data.adaptations.map((adapt, i) => (
            <div key={i} className="rounded-lg border p-2.5 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[9px]">{adapt.channel}</Badge>
                <span className="text-muted-foreground">{adapt.format}</span>
              </div>
              {adapt.headline && (
                <p className="font-semibold italic">&ldquo;{adapt.headline}&rdquo;</p>
              )}
              {adapt.visualAdaptation && (
                <p className="text-muted-foreground">{adapt.visualAdaptation}</p>
              )}
              {adapt.technicalSpecs && (
                <p className="font-mono text-[10px] text-muted-foreground">{adapt.technicalSpecs}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {data.estimatedProductionComplexity && (
        <div className="text-xs">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Complexit&eacute; production</p>
          <p className="text-foreground/80">{data.estimatedProductionComplexity}</p>
        </div>
      )}
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
  strategyId,
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
  strategyId?: string;
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

  // ── Glory generation state ──
  const [genStates, setGenStates] = useState<Record<GenerationAction, GenerationState>>({
    devis: "idle",
    brief: "idle",
    "360": "idle",
  });
  const [genResults, setGenResults] = useState<Record<GenerationAction, unknown>>({
    devis: null,
    brief: null,
    "360": null,
  });
  const [genErrors, setGenErrors] = useState<Record<GenerationAction, string>>({
    devis: "",
    brief: "",
    "360": "",
  });
  const [expandedResults, setExpandedResults] = useState<Set<GenerationAction>>(new Set());

  const generateMutation = api.glory.generate.useMutation();

  const prodBudgetSimulated = Math.round(prodOriginal * detailRatio);
  const prodBudgetStr = prodBudgetSimulated > 0
    ? formatCurrency(prodBudgetSimulated, currency)
    : formatCurrency(Math.round(simulatedBudget * 0.25), currency);

  const handleGenerate = useCallback(
    (action: GenerationAction) => {
      if (!strategyId) return;

      setGenStates((prev) => ({ ...prev, [action]: "generating" }));
      setGenErrors((prev) => ({ ...prev, [action]: "" }));

      const deliverablesStr = buildDeliverablesString(campaign);

      let toolSlug: string;
      let inputs: Record<string, string | number | boolean | null>;

      switch (action) {
        case "devis":
          toolSlug = "production-devis-generator";
          inputs = {
            campaignName: campaign.campagne,
            objective: campaign.objectif,
            deliverables: deliverablesStr,
            totalBudget: prodBudgetStr,
            deadline: campaign.timeline?.fin ?? "",
            additionalSpecs: Array.isArray(campaign.actionsDetaillees)
              ? campaign.actionsDetaillees.join("; ")
              : "",
          };
          break;
        case "brief":
          toolSlug = "vendor-brief-generator";
          inputs = {
            vendorType: "realisateur",
            projectDescription: `Campagne "${campaign.campagne}" — Objectif : ${campaign.objectif}. Canaux : ${(campaign.canaux ?? []).join(", ")}. Livrables : ${deliverablesStr}`,
            specs: Array.isArray(campaign.actionsDetaillees) ? campaign.actionsDetaillees.join("\n") : "",
            deadline: campaign.timeline?.fin ?? "",
            budget: prodBudgetStr,
          };
          break;
        case "360":
          toolSlug = "campaign-360-simulator";
          inputs = {
            keyVisual: bigIdea?.concept
              ? `Concept : ${bigIdea.concept}. Mécanisme : ${bigIdea.mechanism ?? ""}`
              : `Campagne ${campaign.campagne} — ${campaign.objectif}`,
            headline: Array.isArray(campaign.messagesCles) && campaign.messagesCles.length > 0
              ? campaign.messagesCles[0]!
              : campaign.campagne,
            channels: (campaign.canaux ?? []).join(", "),
            adaptationNotes: copyStrategy?.tone
              ? `Ton : ${copyStrategy.tone}. Promesse : ${copyStrategy.promise ?? ""}`
              : "",
          };
          break;
      }

      generateMutation.mutate(
        {
          toolSlug,
          strategyId,
          inputs: inputs as Record<string, string | number | boolean | Record<string, unknown> | unknown[] | null>,
          save: false,
        },
        {
          onSuccess: (result) => {
            setGenStates((prev) => ({ ...prev, [action]: "complete" }));
            setGenResults((prev) => ({ ...prev, [action]: result.outputData }));
            setExpandedResults((prev) => new Set(prev).add(action));
          },
          onError: (err) => {
            setGenStates((prev) => ({ ...prev, [action]: "error" }));
            setGenErrors((prev) => ({ ...prev, [action]: err.message }));
          },
        },
      );
    },
    [strategyId, campaign, prodBudgetStr, bigIdea, copyStrategy, generateMutation],
  );

  const handleSave = useCallback(
    (action: GenerationAction) => {
      if (!strategyId) return;

      const deliverablesStr = buildDeliverablesString(campaign);

      const toolSlugMap: Record<GenerationAction, string> = {
        devis: "production-devis-generator",
        brief: "vendor-brief-generator",
        "360": "campaign-360-simulator",
      };

      generateMutation.mutate(
        {
          toolSlug: toolSlugMap[action],
          strategyId,
          inputs: {
            campaignName: campaign.campagne,
            objective: campaign.objectif,
            deliverables: deliverablesStr,
            totalBudget: prodBudgetStr,
          } as Record<string, string | number | boolean | Record<string, unknown> | unknown[] | null>,
          save: true,
          title: `${action === "devis" ? "Devis" : action === "brief" ? "Brief" : "360°"} — ${campaign.campagne}`,
        },
        {
          onSuccess: () => {
            // Saved
          },
        },
      );
    },
    [strategyId, campaign, prodBudgetStr, generateMutation],
  );

  const toggleResult = (action: GenerationAction) => {
    setExpandedResults((prev) => {
      const next = new Set(prev);
      if (next.has(action)) next.delete(action);
      else next.add(action);
      return next;
    });
  };

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
          {/* ── 0. Composition de la Campagne ── */}
          <div className="rounded-lg border-l-4 bg-muted/20 px-4 py-3" style={{ borderColor: COLOR }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Composition de la Campagne
            </p>
            <p className="text-xs text-foreground/70 leading-relaxed">
              Une campagne est une <span className="font-semibold">combinaison harmonisee d&apos;actions marketing</span> coordonnees
              dans le temps et l&apos;espace pour atteindre un objectif precis. Chaque action contribue a un ou
              plusieurs etages du funnel AARRR.
            </p>
          </div>

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

          {/* ── 11. Actions de production (Glory inline generation) ── */}
          {strategyId && (
            <Section
              icon={<Wrench className="h-4 w-4" style={{ color: ACTION_COLOR }} />}
              title="Actions de production"
            >
              <div className="space-y-3">
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    style={{ borderColor: `${ACTION_COLOR}40`, color: ACTION_COLOR }}
                    disabled={genStates.devis === "generating"}
                    onClick={() => handleGenerate("devis")}
                  >
                    {genStates.devis === "generating" ? (
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    ) : (
                      <Receipt className="mr-1.5 h-3 w-3" />
                    )}
                    G&eacute;n&eacute;rer le devis
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    style={{ borderColor: `${ACTION_COLOR}40`, color: ACTION_COLOR }}
                    disabled={genStates.brief === "generating"}
                    onClick={() => handleGenerate("brief")}
                  >
                    {genStates.brief === "generating" ? (
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    ) : (
                      <FileText className="mr-1.5 h-3 w-3" />
                    )}
                    Brief prestataire
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    style={{ borderColor: `${ACTION_COLOR}40`, color: ACTION_COLOR }}
                    disabled={genStates["360"] === "generating"}
                    onClick={() => handleGenerate("360")}
                  >
                    {genStates["360"] === "generating" ? (
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    ) : (
                      <Globe className="mr-1.5 h-3 w-3" />
                    )}
                    Simulation 360&deg;
                  </Button>
                </div>

                {/* ── Devis result ── */}
                {genStates.devis !== "idle" && (
                  <div className="rounded-lg border" style={{ borderColor: `${ACTION_COLOR}30` }}>
                    <button
                      className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold"
                      style={{ color: ACTION_COLOR }}
                      onClick={() => toggleResult("devis")}
                    >
                      <span className="flex items-center gap-1.5">
                        <Receipt className="h-3 w-3" />
                        Devis de production
                        {genStates.devis === "generating" && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {genStates.devis === "complete" && (
                          <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-600">
                            OK
                          </Badge>
                        )}
                      </span>
                      {expandedResults.has("devis") ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                    {expandedResults.has("devis") && (
                      <div className="border-t px-3 py-3">
                        {genStates.devis === "generating" && (
                          <p className="text-xs text-muted-foreground">
                            G&eacute;n&eacute;ration du devis en cours...
                          </p>
                        )}
                        {genStates.devis === "error" && (
                          <p className="text-xs text-red-500">{genErrors.devis}</p>
                        )}
                        {genStates.devis === "complete" && genResults.devis != null && (
                          <>
                            <DevisResultView data={genResults.devis as DevisResult} />
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 text-xs"
                              onClick={() => handleSave("devis")}
                            >
                              <Save className="mr-1.5 h-3 w-3" />
                              Sauvegarder le devis
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Brief result ── */}
                {genStates.brief !== "idle" && (
                  <div className="rounded-lg border" style={{ borderColor: `${ACTION_COLOR}30` }}>
                    <button
                      className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold"
                      style={{ color: ACTION_COLOR }}
                      onClick={() => toggleResult("brief")}
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        Brief prestataire
                        {genStates.brief === "generating" && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {genStates.brief === "complete" && (
                          <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-600">
                            OK
                          </Badge>
                        )}
                      </span>
                      {expandedResults.has("brief") ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                    {expandedResults.has("brief") && (
                      <div className="border-t px-3 py-3">
                        {genStates.brief === "generating" && (
                          <p className="text-xs text-muted-foreground">
                            G&eacute;n&eacute;ration du brief en cours...
                          </p>
                        )}
                        {genStates.brief === "error" && (
                          <p className="text-xs text-red-500">{genErrors.brief}</p>
                        )}
                        {genStates.brief === "complete" && genResults.brief != null && (
                          <>
                            <BriefResultView data={genResults.brief as BriefResult} />
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 text-xs"
                              onClick={() => handleSave("brief")}
                            >
                              <Save className="mr-1.5 h-3 w-3" />
                              Sauvegarder le brief
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── 360° result ── */}
                {genStates["360"] !== "idle" && (
                  <div className="rounded-lg border" style={{ borderColor: `${ACTION_COLOR}30` }}>
                    <button
                      className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold"
                      style={{ color: ACTION_COLOR }}
                      onClick={() => toggleResult("360")}
                    >
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3" />
                        Simulation 360&deg;
                        {genStates["360"] === "generating" && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {genStates["360"] === "complete" && (
                          <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-600">
                            OK
                          </Badge>
                        )}
                      </span>
                      {expandedResults.has("360") ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                    {expandedResults.has("360") && (
                      <div className="border-t px-3 py-3">
                        {genStates["360"] === "generating" && (
                          <p className="text-xs text-muted-foreground">
                            Simulation 360&deg; en cours...
                          </p>
                        )}
                        {genStates["360"] === "error" && (
                          <p className="text-xs text-red-500">{genErrors["360"]}</p>
                        )}
                        {genStates["360"] === "complete" && genResults["360"] != null && (
                          <>
                            <Result360View data={genResults["360"] as Result360} />
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 text-xs"
                              onClick={() => handleSave("360")}
                            >
                              <Save className="mr-1.5 h-3 w-3" />
                              Sauvegarder la simulation
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
