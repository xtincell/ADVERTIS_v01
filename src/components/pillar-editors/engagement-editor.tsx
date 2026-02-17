"use client";

import type { EngagementPillarData } from "~/lib/types/pillar-data";
import { FieldInput, SectionHeader } from "./shared/field-input";
import { StringArrayField, ObjectArrayField } from "./shared/field-array";

interface Props {
  data: EngagementPillarData;
  onChange: (data: EngagementPillarData) => void;
}

export function EngagementEditor({ data, onChange }: Props) {
  const update = (patch: Partial<EngagementPillarData>) =>
    onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      {/* AARRR */}
      <section className="space-y-3">
        <SectionHeader title="Stratégie AARRR" description="Funnel de croissance" />
        <FieldInput label="Acquisition" value={data.aarrr.acquisition} onChange={(v) => update({ aarrr: { ...data.aarrr, acquisition: v } })} multiline rows={2} />
        <FieldInput label="Activation" value={data.aarrr.activation} onChange={(v) => update({ aarrr: { ...data.aarrr, activation: v } })} multiline rows={2} />
        <FieldInput label="Rétention" value={data.aarrr.retention} onChange={(v) => update({ aarrr: { ...data.aarrr, retention: v } })} multiline rows={2} />
        <FieldInput label="Revenue" value={data.aarrr.revenue} onChange={(v) => update({ aarrr: { ...data.aarrr, revenue: v } })} multiline rows={2} />
        <FieldInput label="Referral" value={data.aarrr.referral} onChange={(v) => update({ aarrr: { ...data.aarrr, referral: v } })} multiline rows={2} />
      </section>

      {/* Touchpoints */}
      <section className="space-y-3">
        <SectionHeader title="Touchpoints" description="Points de contact de la marque" />
        <ObjectArrayField
          label="Points de contact"
          items={data.touchpoints}
          onChange={(v) => update({ touchpoints: v })}
          fields={[
            { key: "canal", label: "Canal", placeholder: "Nom du canal" },
            { key: "type", label: "Type", placeholder: "physique / digital / humain" },
            { key: "role", label: "Rôle", placeholder: "Rôle dans le parcours" },
            { key: "priorite", label: "Priorité", type: "number", placeholder: "1" },
          ]}
          defaultItem={{ canal: "", type: "digital" as const, role: "", priorite: data.touchpoints.length + 1 }}
        />
      </section>

      {/* Rituels */}
      <section className="space-y-3">
        <SectionHeader title="Rituels de marque" description="Rendez-vous récurrents" />
        <ObjectArrayField
          label="Rituels"
          items={data.rituels}
          onChange={(v) => update({ rituels: v })}
          fields={[
            { key: "nom", label: "Nom", placeholder: "Nom du rituel" },
            { key: "type", label: "Type", placeholder: "always-on / cyclique" },
            { key: "frequence", label: "Fréquence", placeholder: "Quotidien, Hebdomadaire..." },
            { key: "description", label: "Description", placeholder: "Description" },
          ]}
          defaultItem={{ nom: "", type: "always-on" as const, frequence: "", description: "" }}
        />
      </section>

      {/* Principes communautaires */}
      <section className="space-y-3">
        <SectionHeader title="Principes communautaires" description="Ce que la communauté fait et ne fait pas" />
        <div className="grid gap-3 sm:grid-cols-2">
          <StringArrayField label="Principes" values={data.principesCommunautaires.principes} onChange={(v) => update({ principesCommunautaires: { ...data.principesCommunautaires, principes: v } })} placeholder="Principe" />
          <StringArrayField label="Tabous" values={data.principesCommunautaires.tabous} onChange={(v) => update({ principesCommunautaires: { ...data.principesCommunautaires, tabous: v } })} placeholder="Tabou" />
        </div>
      </section>

      {/* Gamification */}
      <section className="space-y-3">
        <SectionHeader title="Gamification" description="Niveaux et récompenses" />
        <ObjectArrayField
          label="Niveaux"
          items={data.gamification}
          onChange={(v) => update({ gamification: v })}
          fields={[
            { key: "niveau", label: "Niveau", type: "number", placeholder: "1" },
            { key: "nom", label: "Nom", placeholder: "Nom du niveau" },
            { key: "condition", label: "Condition", placeholder: "Condition d'accès" },
            { key: "recompense", label: "Récompense", placeholder: "Récompense" },
          ]}
          defaultItem={{ niveau: data.gamification.length + 1, nom: "", condition: "", recompense: "" }}
        />
      </section>

      {/* KPIs */}
      <section className="space-y-3">
        <SectionHeader title="KPIs" description="Indicateurs de performance" />
        <ObjectArrayField
          label="KPIs"
          items={data.kpis}
          onChange={(v) => update({ kpis: v })}
          fields={[
            { key: "variable", label: "Variable", placeholder: "E1, E2..." },
            { key: "nom", label: "Nom", placeholder: "Nom du KPI" },
            { key: "cible", label: "Cible", placeholder: "Objectif chiffré" },
            { key: "frequence", label: "Fréquence", placeholder: "Mensuel" },
          ]}
          defaultItem={{ variable: `E${data.kpis.length + 1}`, nom: "", cible: "", frequence: "Mensuel" }}
        />
      </section>
    </div>
  );
}
