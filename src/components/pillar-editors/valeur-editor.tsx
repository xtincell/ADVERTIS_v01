// ==========================================================================
// C.E3 — Valeur Editor
// Pillar V content editor.
// ==========================================================================

"use client";

import type { ValeurPillarData } from "~/lib/types/pillar-data";
import { FieldInput, SectionHeader } from "./shared/field-input";
import { StringArrayField, ObjectArrayField } from "./shared/field-array";

interface Props {
  data: ValeurPillarData;
  onChange: (data: ValeurPillarData) => void;
}

export function ValeurEditor({ data, onChange }: Props) {
  const update = (patch: Partial<ValeurPillarData>) =>
    onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      {/* Product Ladder */}
      <section className="space-y-3">
        <SectionHeader title="Échelle de produits" description="Architecture de l'offre par niveau" />
        <ObjectArrayField
          label="Tiers"
          items={data.productLadder}
          onChange={(v) => update({ productLadder: v })}
          fields={[
            { key: "tier", label: "Tier", placeholder: "Essentiel, Premium..." },
            { key: "prix", label: "Prix", placeholder: "Fourchette de prix" },
            { key: "description", label: "Description", placeholder: "Description de l'offre" },
            { key: "cible", label: "Cible", placeholder: "Persona visé" },
          ]}
          defaultItem={{ tier: "", prix: "", description: "", cible: "" }}
        />
      </section>

      {/* Valeur Marque */}
      <section className="space-y-3">
        <SectionHeader title="Valeur de la marque" description="Actifs tangibles et intangibles" />
        <div className="grid gap-3 sm:grid-cols-2">
          <StringArrayField label="Tangible" values={data.valeurMarque.tangible} onChange={(v) => update({ valeurMarque: { ...data.valeurMarque, tangible: v } })} placeholder="Actif tangible" />
          <StringArrayField label="Intangible" values={data.valeurMarque.intangible} onChange={(v) => update({ valeurMarque: { ...data.valeurMarque, intangible: v } })} placeholder="Actif intangible" />
        </div>
      </section>

      {/* Valeur Client */}
      <section className="space-y-3">
        <SectionHeader title="Valeur client" description="Gains fonctionnels, émotionnels, sociaux" />
        <div className="grid gap-3 sm:grid-cols-3">
          <StringArrayField label="Fonctionnels" values={data.valeurClient.fonctionnels} onChange={(v) => update({ valeurClient: { ...data.valeurClient, fonctionnels: v } })} placeholder="Gain fonctionnel" />
          <StringArrayField label="Émotionnels" values={data.valeurClient.emotionnels} onChange={(v) => update({ valeurClient: { ...data.valeurClient, emotionnels: v } })} placeholder="Gain émotionnel" />
          <StringArrayField label="Sociaux" values={data.valeurClient.sociaux} onChange={(v) => update({ valeurClient: { ...data.valeurClient, sociaux: v } })} placeholder="Gain social" />
        </div>
      </section>

      {/* Coût marque */}
      <section className="space-y-3">
        <SectionHeader title="Coûts de marque" description="CAPEX, OPEX, coûts cachés" />
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldInput label="CAPEX" value={data.coutMarque.capex} onChange={(v) => update({ coutMarque: { ...data.coutMarque, capex: v } })} multiline rows={2} />
          <FieldInput label="OPEX" value={data.coutMarque.opex} onChange={(v) => update({ coutMarque: { ...data.coutMarque, opex: v } })} multiline rows={2} />
        </div>
        <StringArrayField label="Coûts cachés" values={data.coutMarque.coutsCaches} onChange={(v) => update({ coutMarque: { ...data.coutMarque, coutsCaches: v } })} placeholder="Coût caché" />
      </section>

      {/* Frictions client */}
      <section className="space-y-3">
        <SectionHeader title="Frictions client" description="Points de friction et solutions" />
        <ObjectArrayField
          label="Frictions"
          items={data.coutClient.frictions}
          onChange={(v) => update({ coutClient: { frictions: v } })}
          fields={[
            { key: "friction", label: "Friction", placeholder: "Point de friction" },
            { key: "solution", label: "Solution", placeholder: "Solution proposée" },
          ]}
          defaultItem={{ friction: "", solution: "" }}
        />
      </section>

      {/* Unit Economics */}
      <section className="space-y-3">
        <SectionHeader title="Unit Economics" description="Métriques économiques clés" />
        <div className="grid gap-3 sm:grid-cols-3">
          <FieldInput label="CAC" value={data.unitEconomics.cac} onChange={(v) => update({ unitEconomics: { ...data.unitEconomics, cac: v } })} placeholder="Coût d'acquisition" />
          <FieldInput label="LTV" value={data.unitEconomics.ltv} onChange={(v) => update({ unitEconomics: { ...data.unitEconomics, ltv: v } })} placeholder="Valeur vie client" />
          <FieldInput label="Ratio LTV/CAC" value={data.unitEconomics.ratio} onChange={(v) => update({ unitEconomics: { ...data.unitEconomics, ratio: v } })} placeholder="Ratio" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldInput label="Point mort" value={data.unitEconomics.pointMort} onChange={(v) => update({ unitEconomics: { ...data.unitEconomics, pointMort: v } })} placeholder="Estimation" />
          <FieldInput label="Marges" value={data.unitEconomics.marges} onChange={(v) => update({ unitEconomics: { ...data.unitEconomics, marges: v } })} placeholder="Marges brutes" />
        </div>
        <FieldInput label="Notes et hypothèses" value={data.unitEconomics.notes} onChange={(v) => update({ unitEconomics: { ...data.unitEconomics, notes: v } })} multiline rows={2} />
      </section>
    </div>
  );
}
