"use client";

import type { AuthenticitePillarData } from "~/lib/types/pillar-data";
import { FieldInput, SectionHeader } from "./shared/field-input";
import { ObjectArrayField } from "./shared/field-array";

interface Props {
  data: AuthenticitePillarData;
  onChange: (data: AuthenticitePillarData) => void;
}

export function AuthenticiteEditor({ data, onChange }: Props) {
  const update = (patch: Partial<AuthenticitePillarData>) =>
    onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      {/* Identite */}
      <section className="space-y-3">
        <SectionHeader title="Identité" description="Archétype, citation fondatrice, noyau identitaire" />
        <FieldInput label="Archétype" value={data.identite.archetype} onChange={(v) => update({ identite: { ...data.identite, archetype: v } })} placeholder="Le Magicien, Le Héros..." />
        <FieldInput label="Citation fondatrice" value={data.identite.citationFondatrice} onChange={(v) => update({ identite: { ...data.identite, citationFondatrice: v } })} placeholder="La citation ou le mantra fondateur" />
        <FieldInput label="Noyau identitaire" value={data.identite.noyauIdentitaire} onChange={(v) => update({ identite: { ...data.identite, noyauIdentitaire: v } })} multiline placeholder="Ce qui rend la marque unique" />
      </section>

      {/* Hero's Journey */}
      <section className="space-y-3">
        <SectionHeader title="Parcours du héros" description="L'histoire de la marque en 5 actes" />
        <FieldInput label="Acte 1 — Origines" value={data.herosJourney.acte1Origines} onChange={(v) => update({ herosJourney: { ...data.herosJourney, acte1Origines: v } })} multiline />
        <FieldInput label="Acte 2 — L'appel" value={data.herosJourney.acte2Appel} onChange={(v) => update({ herosJourney: { ...data.herosJourney, acte2Appel: v } })} multiline />
        <FieldInput label="Acte 3 — Les épreuves" value={data.herosJourney.acte3Epreuves} onChange={(v) => update({ herosJourney: { ...data.herosJourney, acte3Epreuves: v } })} multiline />
        <FieldInput label="Acte 4 — Transformation" value={data.herosJourney.acte4Transformation} onChange={(v) => update({ herosJourney: { ...data.herosJourney, acte4Transformation: v } })} multiline />
        <FieldInput label="Acte 5 — Révélation" value={data.herosJourney.acte5Revelation} onChange={(v) => update({ herosJourney: { ...data.herosJourney, acte5Revelation: v } })} multiline />
      </section>

      {/* Ikigai */}
      <section className="space-y-3">
        <SectionHeader title="Ikigai" description="La raison d'être de la marque" />
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldInput label="Ce que la marque aime" value={data.ikigai.aimer} onChange={(v) => update({ ikigai: { ...data.ikigai, aimer: v } })} multiline rows={2} />
          <FieldInput label="Compétence" value={data.ikigai.competence} onChange={(v) => update({ ikigai: { ...data.ikigai, competence: v } })} multiline rows={2} />
          <FieldInput label="Besoin du monde" value={data.ikigai.besoinMonde} onChange={(v) => update({ ikigai: { ...data.ikigai, besoinMonde: v } })} multiline rows={2} />
          <FieldInput label="Rémunération" value={data.ikigai.remuneration} onChange={(v) => update({ ikigai: { ...data.ikigai, remuneration: v } })} multiline rows={2} />
        </div>
      </section>

      {/* Valeurs */}
      <section className="space-y-3">
        <SectionHeader title="Valeurs" description="Les valeurs fondamentales classées par priorité" />
        <ObjectArrayField
          label="Valeurs fondamentales"
          items={data.valeurs}
          onChange={(v) => update({ valeurs: v })}
          fields={[
            { key: "valeur", label: "Valeur", placeholder: "Nom de la valeur" },
            { key: "rang", label: "Rang", type: "number", placeholder: "1" },
            { key: "justification", label: "Justification", placeholder: "Pourquoi cette valeur" },
          ]}
          defaultItem={{ valeur: "", rang: data.valeurs.length + 1, justification: "" }}
        />
      </section>

      {/* Hiérarchie communautaire */}
      <section className="space-y-3">
        <SectionHeader title="Hiérarchie communautaire" description="Niveaux de la communauté de marque" />
        <ObjectArrayField
          label="Niveaux"
          items={data.hierarchieCommunautaire}
          onChange={(v) => update({ hierarchieCommunautaire: v })}
          fields={[
            { key: "niveau", label: "Niveau", type: "number", placeholder: "1" },
            { key: "nom", label: "Nom", placeholder: "Nom du niveau" },
            { key: "description", label: "Description", placeholder: "Description" },
            { key: "privileges", label: "Privilèges", placeholder: "Avantages spécifiques" },
          ]}
          defaultItem={{ niveau: data.hierarchieCommunautaire.length + 1, nom: "", description: "", privileges: "" }}
        />
      </section>

      {/* Timeline narrative */}
      <section className="space-y-3">
        <SectionHeader title="Timeline narrative" description="L'évolution de la marque dans le temps" />
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldInput label="Origines" value={data.timelineNarrative.origines} onChange={(v) => update({ timelineNarrative: { ...data.timelineNarrative, origines: v } })} multiline rows={2} />
          <FieldInput label="Croissance" value={data.timelineNarrative.croissance} onChange={(v) => update({ timelineNarrative: { ...data.timelineNarrative, croissance: v } })} multiline rows={2} />
          <FieldInput label="Pivot" value={data.timelineNarrative.pivot} onChange={(v) => update({ timelineNarrative: { ...data.timelineNarrative, pivot: v } })} multiline rows={2} />
          <FieldInput label="Vision future" value={data.timelineNarrative.futur} onChange={(v) => update({ timelineNarrative: { ...data.timelineNarrative, futur: v } })} multiline rows={2} />
        </div>
      </section>
    </div>
  );
}
