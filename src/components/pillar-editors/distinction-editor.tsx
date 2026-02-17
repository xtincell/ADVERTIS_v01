"use client";

import type { DistinctionPillarData } from "~/lib/types/pillar-data";
import { FieldInput, SectionHeader } from "./shared/field-input";
import { StringArrayField, ObjectArrayField } from "./shared/field-array";

interface Props {
  data: DistinctionPillarData;
  onChange: (data: DistinctionPillarData) => void;
}

export function DistinctionEditor({ data, onChange }: Props) {
  const update = (patch: Partial<DistinctionPillarData>) =>
    onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      {/* Positionnement */}
      <section className="space-y-3">
        <SectionHeader title="Positionnement" description="Déclaration de positionnement" />
        <FieldInput label="Positionnement" value={data.positionnement} onChange={(v) => update({ positionnement: v })} multiline placeholder="Pour [cible], [marque] est [catégorie] qui [différence] parce que [preuve]" />
      </section>

      {/* Personas */}
      <section className="space-y-3">
        <SectionHeader title="Personas" description="Les profils cibles de la marque" />
        <ObjectArrayField
          label="Personas cibles"
          items={data.personas}
          onChange={(v) => update({ personas: v })}
          fields={[
            { key: "nom", label: "Nom", placeholder: "Nom du persona" },
            { key: "priorite", label: "Priorité", type: "number", placeholder: "1" },
            { key: "demographie", label: "Démographie", placeholder: "Âge, CSP, localisation" },
            { key: "psychographie", label: "Psychographie", placeholder: "Valeurs, style de vie" },
            { key: "motivations", label: "Motivations", placeholder: "Ce qui les pousse à acheter" },
            { key: "freins", label: "Freins", placeholder: "Ce qui les retient" },
          ]}
          defaultItem={{ nom: "", demographie: "", psychographie: "", motivations: "", freins: "", priorite: data.personas.length + 1 }}
        />
      </section>

      {/* Promesses de marque */}
      <section className="space-y-3">
        <SectionHeader title="Promesses de marque" />
        <FieldInput label="Promesse maître" value={data.promessesDeMarque.promesseMaitre} onChange={(v) => update({ promessesDeMarque: { ...data.promessesDeMarque, promesseMaitre: v } })} multiline />
        <StringArrayField label="Sous-promesses" values={data.promessesDeMarque.sousPromesses} onChange={(v) => update({ promessesDeMarque: { ...data.promessesDeMarque, sousPromesses: v } })} placeholder="Sous-promesse" />
      </section>

      {/* Paysage concurrentiel */}
      <section className="space-y-3">
        <SectionHeader title="Paysage concurrentiel" />
        <ObjectArrayField
          label="Concurrents"
          items={data.paysageConcurrentiel.concurrents}
          onChange={(v) => update({ paysageConcurrentiel: { ...data.paysageConcurrentiel, concurrents: v } })}
          fields={[
            { key: "nom", label: "Nom", placeholder: "Nom" },
            { key: "forces", label: "Forces", placeholder: "Points forts" },
            { key: "faiblesses", label: "Faiblesses", placeholder: "Points faibles" },
            { key: "partDeMarche", label: "Part de marché", placeholder: "%" },
          ]}
          defaultItem={{ nom: "", forces: "", faiblesses: "", partDeMarche: "" }}
        />
        <StringArrayField label="Avantages compétitifs" values={data.paysageConcurrentiel.avantagesCompetitifs} onChange={(v) => update({ paysageConcurrentiel: { ...data.paysageConcurrentiel, avantagesCompetitifs: v } })} placeholder="Avantage" />
      </section>

      {/* Ton de voix */}
      <section className="space-y-3">
        <SectionHeader title="Ton de voix" description="Personnalité vocale de la marque" />
        <FieldInput label="Personnalité" value={data.tonDeVoix.personnalite} onChange={(v) => update({ tonDeVoix: { ...data.tonDeVoix, personnalite: v } })} multiline />
        <div className="grid gap-3 sm:grid-cols-2">
          <StringArrayField label="On dit" values={data.tonDeVoix.onDit} onChange={(v) => update({ tonDeVoix: { ...data.tonDeVoix, onDit: v } })} placeholder="Expression typique" />
          <StringArrayField label="On ne dit pas" values={data.tonDeVoix.onNeditPas} onChange={(v) => update({ tonDeVoix: { ...data.tonDeVoix, onNeditPas: v } })} placeholder="Expression à éviter" />
        </div>
      </section>

      {/* Identité visuelle */}
      <section className="space-y-3">
        <SectionHeader title="Identité visuelle" />
        <FieldInput label="Direction artistique" value={data.identiteVisuelle.directionArtistique} onChange={(v) => update({ identiteVisuelle: { ...data.identiteVisuelle, directionArtistique: v } })} multiline />
        <StringArrayField label="Palette de couleurs" values={data.identiteVisuelle.paletteCouleurs} onChange={(v) => update({ identiteVisuelle: { ...data.identiteVisuelle, paletteCouleurs: v } })} placeholder="#HEX — Signification" />
        <FieldInput label="Mood" value={data.identiteVisuelle.mood} onChange={(v) => update({ identiteVisuelle: { ...data.identiteVisuelle, mood: v } })} multiline />
      </section>

      {/* Assets linguistiques */}
      <section className="space-y-3">
        <SectionHeader title="Assets linguistiques" />
        <StringArrayField label="Mantras" values={data.assetsLinguistiques.mantras} onChange={(v) => update({ assetsLinguistiques: { ...data.assetsLinguistiques, mantras: v } })} placeholder="Mantra" />
        <StringArrayField label="Vocabulaire propriétaire" values={data.assetsLinguistiques.vocabulaireProprietaire} onChange={(v) => update({ assetsLinguistiques: { ...data.assetsLinguistiques, vocabulaireProprietaire: v } })} placeholder="Terme propriétaire" />
      </section>
    </div>
  );
}
