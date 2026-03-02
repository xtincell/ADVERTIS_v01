// ==========================================================================
// C.E8 — Synthese Editor
// Pillar S content editor.
// ==========================================================================

"use client";

import type { SynthesePillarData } from "~/lib/types/pillar-schemas";
import { FieldInput, SectionHeader } from "./shared/field-input";
import { ObjectArrayField, StringArrayField } from "./shared/field-array";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface Props {
  data: SynthesePillarData;
  onChange: (data: SynthesePillarData) => void;
}

export function SyntheseEditor({ data, onChange }: Props) {
  const update = (patch: Partial<SynthesePillarData>) =>
    onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      {/* Synthèse Executive */}
      <section className="space-y-3">
        <SectionHeader title="Synthèse Exécutive" description="Vue d'ensemble stratégique" />
        <FieldInput label="Synthèse" value={data.syntheseExecutive} onChange={(v) => update({ syntheseExecutive: v })} multiline rows={5} placeholder="Synthèse exécutive de la stratégie" />
        <FieldInput label="Vision stratégique" value={data.visionStrategique} onChange={(v) => update({ visionStrategique: v })} multiline rows={4} placeholder="Vision stratégique globale" />
      </section>

      {/* Cohérence des piliers */}
      <section className="space-y-3">
        <SectionHeader title="Cohérence des piliers" description="Articulation entre les 8 piliers ADVERTIS" />
        <ObjectArrayField
          label="Piliers"
          items={data.coherencePiliers}
          onChange={(v) => update({ coherencePiliers: v })}
          fields={[
            { key: "pilier", label: "Pilier", placeholder: "A / D / V / E / R / T / I / S" },
            { key: "contribution", label: "Contribution", placeholder: "Contribution clé du pilier" },
            { key: "articulation", label: "Articulation", placeholder: "Comment il s'articule avec les autres" },
          ]}
          defaultItem={{ pilier: "", contribution: "", articulation: "" }}
        />
      </section>

      {/* Axes stratégiques */}
      <section className="space-y-3">
        <SectionHeader title="Axes stratégiques" description="Grands axes de la stratégie" />
        <ObjectArrayField
          label="Axes"
          items={data.axesStrategiques}
          onChange={(v) => update({ axesStrategiques: v })}
          fields={[
            { key: "axe", label: "Axe", placeholder: "Nom de l'axe" },
            { key: "description", label: "Description", placeholder: "Description de l'axe" },
          ]}
          defaultItem={{ axe: "", description: "", piliersLies: [], kpisCles: [] }}
        />
      </section>

      {/* Facteurs clés de succès */}
      <section className="space-y-3">
        <SectionHeader title="Facteurs clés de succès" description="Conditions nécessaires à la réussite" />
        <StringArrayField label="Facteurs" values={data.facteursClesSucces} onChange={(v) => update({ facteursClesSucces: v })} placeholder="Facteur clé" />
      </section>

      {/* Recommandations prioritaires */}
      <section className="space-y-3">
        <SectionHeader title="Recommandations prioritaires" description="Actions recommandées par priorité" />
        <ObjectArrayField
          label="Recommandations"
          items={data.recommandationsPrioritaires}
          onChange={(v) => update({ recommandationsPrioritaires: v })}
          fields={[
            { key: "action", label: "Action", placeholder: "Action recommandée" },
            { key: "priorite", label: "Priorité (1-5)", placeholder: "1" },
            { key: "impact", label: "Impact", placeholder: "Impact attendu" },
            { key: "delai", label: "Délai", placeholder: "Court / Moyen / Long terme" },
          ]}
          defaultItem={{ action: "", priorite: 1, impact: "", delai: "" }}
        />
      </section>

      {/* Sprint 90 Recap */}
      <section className="space-y-3">
        <SectionHeader title="Récapitulatif Sprint 90 jours" description="Bilan des actions prioritaires" />
        <FieldInput label="Résumé" value={data.sprint90Recap.summary} onChange={(v) => update({ sprint90Recap: { ...data.sprint90Recap, summary: v } })} multiline placeholder="Résumé du sprint 90 jours" />
        <ObjectArrayField
          label="Actions"
          items={data.sprint90Recap.actions}
          onChange={(v) => update({ sprint90Recap: { ...data.sprint90Recap, actions: v } })}
          fields={[
            { key: "action", label: "Action", placeholder: "Action" },
            { key: "owner", label: "Responsable", placeholder: "Qui" },
            { key: "kpi", label: "KPI", placeholder: "Indicateur" },
            { key: "status", label: "Statut", placeholder: "à faire / en cours / fait" },
          ]}
          defaultItem={{ action: "", owner: "", kpi: "", status: "à faire" }}
        />
      </section>

      {/* Campagnes Summary */}
      <section className="space-y-3">
        <SectionHeader title="Synthèse campagnes" description="Vue d'ensemble des campagnes" />
        <FieldInput label="Budget total" value={data.campaignsSummary.budgetTotal} onChange={(v) => update({ campaignsSummary: { ...data.campaignsSummary, budgetTotal: v } })} placeholder="€XX XXX" />
        <StringArrayField label="Points saillants" values={data.campaignsSummary.highlights} onChange={(v) => update({ campaignsSummary: { ...data.campaignsSummary, highlights: v } })} placeholder="Highlight" />
        <FieldInput label="Synthèse activation" value={data.activationSummary} onChange={(v) => update({ activationSummary: v })} multiline placeholder="Synthèse du dispositif d'activation" />
      </section>

      {/* KPI Dashboard */}
      <section className="space-y-3">
        <SectionHeader title="Dashboard KPIs" description="Indicateurs clés par pilier" />
        <ObjectArrayField
          label="KPIs"
          items={data.kpiDashboard}
          onChange={(v) => update({ kpiDashboard: v })}
          fields={[
            { key: "pilier", label: "Pilier", placeholder: "A / D / V / E..." },
            { key: "kpi", label: "KPI", placeholder: "Indicateur" },
            { key: "cible", label: "Cible", placeholder: "Objectif" },
            { key: "statut", label: "Statut", placeholder: "En cours / Atteint" },
          ]}
          defaultItem={{ pilier: "", kpi: "", cible: "", statut: "" }}
        />
      </section>

      {/* Score */}
      <section className="space-y-3">
        <SectionHeader title="Score de cohérence" description="Évaluation globale" />
        <div className="flex items-center gap-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score cohérence (0-100)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={data.scoreCoherence}
            onChange={(e) => update({ scoreCoherence: Number(e.target.value) })}
            className="w-24 text-sm"
          />
        </div>
      </section>
    </div>
  );
}
