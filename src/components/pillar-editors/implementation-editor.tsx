// ==========================================================================
// C.E7 — Implementation Editor
// Pillar I content editor.
// ==========================================================================

"use client";

import type { ImplementationData } from "~/lib/types/pillar-schemas";
import { FieldInput, SectionHeader } from "./shared/field-input";
import { ObjectArrayField, StringArrayField } from "./shared/field-array";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface Props {
  data: ImplementationData;
  onChange: (data: ImplementationData) => void;
}

export function ImplementationEditor({ data, onChange }: Props) {
  const update = (patch: Partial<ImplementationData>) =>
    onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      {/* Brand Identity */}
      <section className="space-y-3">
        <SectionHeader title="Identité de marque" description="Noyau identitaire synthétisé" />
        <FieldInput label="Archétype" value={data.brandIdentity.archetype} onChange={(v) => update({ brandIdentity: { ...data.brandIdentity, archetype: v } })} placeholder="Archétype de marque" />
        <FieldInput label="Purpose" value={data.brandIdentity.purpose} onChange={(v) => update({ brandIdentity: { ...data.brandIdentity, purpose: v } })} multiline placeholder="Raison d'être" />
        <FieldInput label="Vision" value={data.brandIdentity.vision} onChange={(v) => update({ brandIdentity: { ...data.brandIdentity, vision: v } })} multiline placeholder="Vision long terme" />
        <StringArrayField label="Valeurs" values={data.brandIdentity.values} onChange={(v) => update({ brandIdentity: { ...data.brandIdentity, values: v } })} placeholder="Valeur" />
        <FieldInput label="Narrative" value={data.brandIdentity.narrative} onChange={(v) => update({ brandIdentity: { ...data.brandIdentity, narrative: v } })} multiline placeholder="Récit de marque" />
      </section>

      {/* Positioning */}
      <section className="space-y-3">
        <SectionHeader title="Positionnement" description="Statement, différenciateurs et ton" />
        <FieldInput label="Statement" value={data.positioning.statement} onChange={(v) => update({ positioning: { ...data.positioning, statement: v } })} multiline placeholder="Statement de positionnement" />
        <StringArrayField label="Différenciateurs" values={data.positioning.differentiators} onChange={(v) => update({ positioning: { ...data.positioning, differentiators: v } })} placeholder="Différenciateur" />
        <FieldInput label="Ton de voix" value={data.positioning.toneOfVoice} onChange={(v) => update({ positioning: { ...data.positioning, toneOfVoice: v } })} multiline placeholder="Personnalité vocale" />
      </section>

      {/* Value Architecture */}
      <section className="space-y-3">
        <SectionHeader title="Architecture de valeur" description="Offre, proposition de valeur et unit economics" />
        <FieldInput label="Proposition de valeur" value={data.valueArchitecture.valueProposition} onChange={(v) => update({ valueArchitecture: { ...data.valueArchitecture, valueProposition: v } })} multiline placeholder="Proposition de valeur clé" />
        <ObjectArrayField
          label="Product Ladder"
          items={data.valueArchitecture.productLadder}
          onChange={(v) => update({ valueArchitecture: { ...data.valueArchitecture, productLadder: v } })}
          fields={[
            { key: "tier", label: "Palier", placeholder: "Entry / Core / Premium" },
            { key: "price", label: "Prix", placeholder: "€XX" },
            { key: "description", label: "Description", placeholder: "Description du palier" },
          ]}
          defaultItem={{ tier: "", price: "", description: "" }}
        />
        <div className="grid grid-cols-2 gap-3">
          <FieldInput label="CAC" value={data.valueArchitecture.unitEconomics.cac} onChange={(v) => update({ valueArchitecture: { ...data.valueArchitecture, unitEconomics: { ...data.valueArchitecture.unitEconomics, cac: v } } })} placeholder="Coût d'acquisition" />
          <FieldInput label="LTV" value={data.valueArchitecture.unitEconomics.ltv} onChange={(v) => update({ valueArchitecture: { ...data.valueArchitecture, unitEconomics: { ...data.valueArchitecture.unitEconomics, ltv: v } } })} placeholder="Lifetime Value" />
          <FieldInput label="Ratio LTV/CAC" value={data.valueArchitecture.unitEconomics.ratio} onChange={(v) => update({ valueArchitecture: { ...data.valueArchitecture, unitEconomics: { ...data.valueArchitecture.unitEconomics, ratio: v } } })} placeholder="3.5x" />
          <FieldInput label="Notes" value={data.valueArchitecture.unitEconomics.notes} onChange={(v) => update({ valueArchitecture: { ...data.valueArchitecture, unitEconomics: { ...data.valueArchitecture.unitEconomics, notes: v } } })} placeholder="Hypothèses" />
        </div>
      </section>

      {/* Strategic Roadmap */}
      <section className="space-y-3">
        <SectionHeader title="Feuille de route stratégique" description="Sprint 90 jours et vision" />
        <ObjectArrayField
          label="Sprint 90 jours"
          items={data.strategicRoadmap.sprint90Days}
          onChange={(v) => update({ strategicRoadmap: { ...data.strategicRoadmap, sprint90Days: v } })}
          fields={[
            { key: "action", label: "Action", placeholder: "Action clé" },
            { key: "owner", label: "Responsable", placeholder: "Qui" },
            { key: "kpi", label: "KPI", placeholder: "Indicateur de succès" },
          ]}
          defaultItem={{ action: "", owner: "", kpi: "" }}
        />
        <StringArrayField label="Priorités année 1" values={data.strategicRoadmap.year1Priorities} onChange={(v) => update({ strategicRoadmap: { ...data.strategicRoadmap, year1Priorities: v } })} placeholder="Priorité" />
        <FieldInput label="Vision 3 ans" value={data.strategicRoadmap.year3Vision} onChange={(v) => update({ strategicRoadmap: { ...data.strategicRoadmap, year3Vision: v } })} multiline placeholder="Ambition à 3 ans" />
      </section>

      {/* Budget Allocation */}
      <section className="space-y-3">
        <SectionHeader title="Budget" description="Allocation budgétaire et projections ROI" />
        <FieldInput label="Enveloppe globale" value={data.budgetAllocation.enveloppeGlobale} onChange={(v) => update({ budgetAllocation: { ...data.budgetAllocation, enveloppeGlobale: v } })} placeholder="€XX XXX" />
        <ObjectArrayField
          label="Répartition par poste"
          items={data.budgetAllocation.parPoste}
          onChange={(v) => update({ budgetAllocation: { ...data.budgetAllocation, parPoste: v } })}
          fields={[
            { key: "poste", label: "Poste", placeholder: "Média, Production..." },
            { key: "montant", label: "Montant", placeholder: "€XX" },
            { key: "justification", label: "Justification", placeholder: "Raison" },
          ]}
          defaultItem={{ poste: "", montant: "", pourcentage: 0, justification: "" }}
        />
      </section>

      {/* Brand Platform */}
      <section className="space-y-3">
        <SectionHeader title="Plateforme de marque" description="Socle identitaire complet" />
        <FieldInput label="Purpose" value={data.brandPlatform.purpose} onChange={(v) => update({ brandPlatform: { ...data.brandPlatform, purpose: v } })} multiline placeholder="Raison d'être" />
        <FieldInput label="Vision" value={data.brandPlatform.vision} onChange={(v) => update({ brandPlatform: { ...data.brandPlatform, vision: v } })} multiline placeholder="Vision" />
        <FieldInput label="Mission" value={data.brandPlatform.mission} onChange={(v) => update({ brandPlatform: { ...data.brandPlatform, mission: v } })} multiline placeholder="Mission" />
        <StringArrayField label="Valeurs" values={data.brandPlatform.values} onChange={(v) => update({ brandPlatform: { ...data.brandPlatform, values: v } })} placeholder="Valeur" />
        <FieldInput label="Personnalité" value={data.brandPlatform.personality} onChange={(v) => update({ brandPlatform: { ...data.brandPlatform, personality: v } })} placeholder="Personnalité de marque" />
        <FieldInput label="Territoire" value={data.brandPlatform.territory} onChange={(v) => update({ brandPlatform: { ...data.brandPlatform, territory: v } })} placeholder="Territoire de marque" />
        <FieldInput label="Tagline" value={data.brandPlatform.tagline} onChange={(v) => update({ brandPlatform: { ...data.brandPlatform, tagline: v } })} placeholder="Signature" />
      </section>

      {/* Copy Strategy */}
      <section className="space-y-3">
        <SectionHeader title="Copy Strategy" description="Contrat stratégique création/stratégie" />
        <FieldInput label="Promesse" value={data.copyStrategy.promise} onChange={(v) => update({ copyStrategy: { ...data.copyStrategy, promise: v } })} multiline placeholder="Promesse centrale" />
        <StringArrayField label="Reasons to Believe" values={data.copyStrategy.rtb} onChange={(v) => update({ copyStrategy: { ...data.copyStrategy, rtb: v } })} placeholder="RTB" />
        <FieldInput label="Bénéfice consommateur" value={data.copyStrategy.consumerBenefit} onChange={(v) => update({ copyStrategy: { ...data.copyStrategy, consumerBenefit: v } })} multiline placeholder="Bénéfice principal" />
        <FieldInput label="Ton" value={data.copyStrategy.tone} onChange={(v) => update({ copyStrategy: { ...data.copyStrategy, tone: v } })} placeholder="Ton de communication" />
        <FieldInput label="Contrainte" value={data.copyStrategy.constraint} onChange={(v) => update({ copyStrategy: { ...data.copyStrategy, constraint: v } })} placeholder="Contrainte créative" />
      </section>

      {/* Big Idea */}
      <section className="space-y-3">
        <SectionHeader title="Big Idea" description="Concept central déclinable" />
        <FieldInput label="Concept" value={data.bigIdea.concept} onChange={(v) => update({ bigIdea: { ...data.bigIdea, concept: v } })} multiline placeholder="Concept créatif central" />
        <FieldInput label="Mécanisme" value={data.bigIdea.mechanism} onChange={(v) => update({ bigIdea: { ...data.bigIdea, mechanism: v } })} multiline placeholder="Mécanisme créatif" />
        <FieldInput label="Lien insight" value={data.bigIdea.insightLink} onChange={(v) => update({ bigIdea: { ...data.bigIdea, insightLink: v } })} multiline placeholder="Lien avec l'insight consommateur" />
      </section>

      {/* Score & Executive Summary */}
      <section className="space-y-3">
        <SectionHeader title="Score & Synthèse" description="Évaluation globale" />
        <div className="flex items-center gap-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score cohérence (0-100)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={data.coherenceScore}
            onChange={(e) => update({ coherenceScore: Number(e.target.value) })}
            className="w-24 text-sm"
          />
        </div>
        <FieldInput label="Executive Summary" value={data.executiveSummary} onChange={(v) => update({ executiveSummary: v })} multiline rows={5} placeholder="Résumé exécutif de l'implémentation" />
      </section>
    </div>
  );
}
