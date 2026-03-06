// ==========================================================================
// C.E3 — Valeur Editor (V2 — atomised variables)
// Pillar V content editor.
// ==========================================================================

"use client";

import type { ValeurPillarDataV2 } from "~/lib/types/pillar-schemas";
import { FieldInput, SectionHeader } from "./shared/field-input";
import { ObjectArrayField } from "./shared/field-array";

interface Props {
  data: ValeurPillarDataV2;
  onChange: (data: ValeurPillarDataV2) => void;
}

export function ValeurEditor({ data, onChange }: Props) {
  const update = (patch: Partial<ValeurPillarDataV2>) =>
    onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      {/* V0 — Catalogue Produits & Services */}
      <section className="space-y-3">
        <SectionHeader
          title="Catalogue Produits & Services"
          description="Source de verite : tous les produits et services de la marque"
        />
        <ObjectArrayField
          label="Produits / Services"
          items={data.produitsCatalogue}
          onChange={(v) => update({ produitsCatalogue: v })}
          fields={[
            { key: "id", label: "ID", placeholder: "prod-001" },
            { key: "nom", label: "Nom", placeholder: "Nom du produit/service" },
            { key: "prix", label: "Prix", placeholder: "Prix de vente" },
            { key: "cout", label: "Cout", placeholder: "Cout de revient" },
            { key: "description", label: "Description", placeholder: "Description courte" },
            { key: "categorie", label: "Categorie", placeholder: "produit / service" },
            { key: "segmentCible", label: "Segment cible", placeholder: "Persona vise" },
            { key: "phaseLifecycle", label: "Phase", placeholder: "launch / growth / mature / decline" },
            { key: "margeUnitaire", label: "Marge unitaire", placeholder: "Marge en %" },
            { key: "canalDistribution", label: "Canal", placeholder: "Canal principal" },
          ]}
          defaultItem={{
            id: "",
            nom: "",
            prix: "",
            cout: "",
            description: "",
            categorie: "produit" as const,
            lienPromesse: "",
            margeUnitaire: "",
            segmentCible: "",
            phaseLifecycle: "launch" as const,
            disponibilite: "",
            canalDistribution: "",
            skuRef: "",
            images: [],
            variantes: [],
            bundles: [],
            dependencies: [],
            scoringInterne: 0,
            leviersPsychologiques: [],
            maslowMapping: [],
            nanoBananaPrompt: { prompt: "", style: "luxe-raffine", mood: "", colorDirection: "", application: "product-hero", aspectRatio: "1:1" },
            elasticitePercue: 5,
            saisonalite: [],
            cannibalisationRisque: [],
            scoreEmotionnelADVE: 0,
            contraintesReglementaires: [],
            mixMarketing: { produit: "", prix: "", place: "", promotion: "" },
          }}
        />
      </section>

      {/* Product Ladder */}
      <section className="space-y-3">
        <SectionHeader
          title="Echelle de produits"
          description="Architecture de l'offre par niveau (compose depuis le catalogue V0)"
        />
        <ObjectArrayField
          label="Tiers"
          items={data.productLadder}
          onChange={(v) => update({ productLadder: v })}
          fields={[
            { key: "tier", label: "Tier", placeholder: "Essentiel, Premium..." },
            { key: "prix", label: "Prix", placeholder: "Fourchette de prix" },
            { key: "description", label: "Description", placeholder: "Description de l'offre" },
            { key: "cible", label: "Cible", placeholder: "Persona vise" },
          ]}
          defaultItem={{ tier: "", prix: "", description: "", cible: "", produitIds: [] }}
        />
      </section>

      {/* Valeur Marque */}
      <section className="space-y-3">
        <SectionHeader
          title="Valeur de la marque"
          description="Actifs tangibles et intangibles"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <ObjectArrayField
            label="Tangible"
            items={data.valeurMarqueTangible}
            onChange={(v) => update({ valeurMarqueTangible: v })}
            fields={[
              { key: "item", label: "Actif", placeholder: "Actif tangible" },
              { key: "montant", label: "Montant", placeholder: "Valeur estimee" },
              { key: "categorie", label: "Categorie", placeholder: "Type" },
            ]}
            defaultItem={{ item: "", montant: "", categorie: "" }}
          />
          <ObjectArrayField
            label="Intangible"
            items={data.valeurMarqueIntangible}
            onChange={(v) => update({ valeurMarqueIntangible: v })}
            fields={[
              { key: "item", label: "Actif", placeholder: "Actif intangible" },
              { key: "montant", label: "Montant", placeholder: "Valeur estimee" },
              { key: "categorie", label: "Categorie", placeholder: "Type" },
            ]}
            defaultItem={{ item: "", montant: "", categorie: "" }}
          />
        </div>
      </section>

      {/* Valeur Client */}
      <section className="space-y-3">
        <SectionHeader
          title="Valeur client"
          description="Gains tangibles et intangibles pour le client"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <ObjectArrayField
            label="Tangible"
            items={data.valeurClientTangible}
            onChange={(v) => update({ valeurClientTangible: v })}
            fields={[
              { key: "item", label: "Gain", placeholder: "Gain tangible" },
              { key: "montant", label: "Montant", placeholder: "Valeur" },
              { key: "categorie", label: "Categorie", placeholder: "fonctionnel / mesurable" },
            ]}
            defaultItem={{ item: "", montant: "", categorie: "" }}
          />
          <ObjectArrayField
            label="Intangible"
            items={data.valeurClientIntangible}
            onChange={(v) => update({ valeurClientIntangible: v })}
            fields={[
              { key: "item", label: "Gain", placeholder: "Gain intangible" },
              { key: "montant", label: "Montant", placeholder: "Valeur" },
              { key: "categorie", label: "Categorie", placeholder: "emotionnel / social" },
            ]}
            defaultItem={{ item: "", montant: "", categorie: "" }}
          />
        </div>
      </section>

      {/* Cout Marque */}
      <section className="space-y-3">
        <SectionHeader
          title="Couts de marque"
          description="Couts tangibles (CAPEX, OPEX) et intangibles (couts caches)"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <ObjectArrayField
            label="Tangible"
            items={data.coutMarqueTangible}
            onChange={(v) => update({ coutMarqueTangible: v })}
            fields={[
              { key: "item", label: "Cout", placeholder: "Cout tangible" },
              { key: "montant", label: "Montant", placeholder: "Montant" },
              { key: "categorie", label: "Categorie", placeholder: "capex / opex" },
            ]}
            defaultItem={{ item: "", montant: "", categorie: "" }}
          />
          <ObjectArrayField
            label="Intangible"
            items={data.coutMarqueIntangible}
            onChange={(v) => update({ coutMarqueIntangible: v })}
            fields={[
              { key: "item", label: "Cout", placeholder: "Cout intangible / cache" },
              { key: "montant", label: "Montant", placeholder: "Montant" },
              { key: "categorie", label: "Categorie", placeholder: "cout_cache" },
            ]}
            defaultItem={{ item: "", montant: "", categorie: "" }}
          />
        </div>
      </section>

      {/* Cout Client */}
      <section className="space-y-3">
        <SectionHeader
          title="Couts client"
          description="Frictions tangibles et intangibles pour le client"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <ObjectArrayField
            label="Tangible"
            items={data.coutClientTangible}
            onChange={(v) => update({ coutClientTangible: v })}
            fields={[
              { key: "item", label: "Friction", placeholder: "Friction tangible" },
              { key: "montant", label: "Montant", placeholder: "Cout estime" },
              { key: "categorie", label: "Categorie", placeholder: "friction / migration" },
            ]}
            defaultItem={{ item: "", montant: "", categorie: "" }}
          />
          <ObjectArrayField
            label="Intangible"
            items={data.coutClientIntangible}
            onChange={(v) => update({ coutClientIntangible: v })}
            fields={[
              { key: "item", label: "Friction", placeholder: "Friction intangible" },
              { key: "montant", label: "Montant", placeholder: "Cout estime" },
              { key: "categorie", label: "Categorie", placeholder: "risque percu / stress" },
            ]}
            defaultItem={{ item: "", montant: "", categorie: "" }}
          />
        </div>
      </section>

      {/* Unit Economics — Base */}
      <section className="space-y-3">
        <SectionHeader
          title="Unit Economics"
          description="Metriques economiques cles"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <FieldInput label="CAC" value={data.cac} onChange={(v) => update({ cac: v })} placeholder="Cout d'acquisition" />
          <FieldInput label="LTV" value={data.ltv} onChange={(v) => update({ ltv: v })} placeholder="Valeur vie client" />
          <FieldInput label="Ratio LTV/CAC" value={data.ltvCacRatio} onChange={(v) => update({ ltvCacRatio: v })} placeholder="Ratio" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <FieldInput label="Point mort" value={data.pointMort} onChange={(v) => update({ pointMort: v })} placeholder="Estimation" />
          <FieldInput label="Marges" value={data.marges} onChange={(v) => update({ marges: v })} placeholder="Marges brutes" />
          <FieldInput label="Duree LTV (mois)" value={String(data.dureeLTV)} onChange={(v) => update({ dureeLTV: Number(v) || 24 })} placeholder="24" />
        </div>
        <FieldInput label="Notes et hypotheses" value={data.notesEconomics} onChange={(v) => update({ notesEconomics: v })} multiline rows={2} />
      </section>

      {/* Unit Economics — Derived (read-only) */}
      {(data.margeNette || data.roiEstime || data.paybackPeriod) && (
        <section className="space-y-3">
          <SectionHeader
            title="Metriques derivees"
            description="Calculees automatiquement depuis CAC, LTV et duree LTV"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-zinc-700 bg-zinc-800/50 p-3">
              <div className="text-xs text-zinc-400">Marge Nette</div>
              <div className="text-sm font-mono text-white">{data.margeNette || "—"}</div>
            </div>
            <div className="rounded-md border border-zinc-700 bg-zinc-800/50 p-3">
              <div className="text-xs text-zinc-400">ROI Estime</div>
              <div className="text-sm font-mono text-white">{data.roiEstime || "—"}</div>
            </div>
            <div className="rounded-md border border-zinc-700 bg-zinc-800/50 p-3">
              <div className="text-xs text-zinc-400">Payback Period</div>
              <div className="text-sm font-mono text-white">{data.paybackPeriod || "—"}</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
