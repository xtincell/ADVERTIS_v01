// ==========================================================================
// C.E5 — Track Editor
// Pillar T content editor.
// ==========================================================================

"use client";

import type { TrackAuditResult } from "~/lib/types/pillar-schemas";
import { FieldInput, SectionHeader } from "./shared/field-input";
import { ObjectArrayField, StringArrayField } from "./shared/field-array";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface Props {
  data: TrackAuditResult;
  onChange: (data: TrackAuditResult) => void;
}

export function TrackEditor({ data, onChange }: Props) {
  const update = (patch: Partial<TrackAuditResult>) =>
    onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      {/* Triangulation */}
      <section className="space-y-3">
        <SectionHeader title="Triangulation" description="Croisement des données internes, marché et clients" />
        <FieldInput label="Données internes" value={data.triangulation.internalData} onChange={(v) => update({ triangulation: { ...data.triangulation, internalData: v } })} multiline placeholder="Données internes de l'entreprise" />
        <FieldInput label="Données marché" value={data.triangulation.marketData} onChange={(v) => update({ triangulation: { ...data.triangulation, marketData: v } })} multiline placeholder="Données de marché sectorielles" />
        <FieldInput label="Données clients" value={data.triangulation.customerData} onChange={(v) => update({ triangulation: { ...data.triangulation, customerData: v } })} multiline placeholder="Insights clients et feedback" />
        <FieldInput label="Synthèse" value={data.triangulation.synthesis} onChange={(v) => update({ triangulation: { ...data.triangulation, synthesis: v } })} multiline placeholder="Synthèse de la triangulation" />
      </section>

      {/* Hypothesis Validation */}
      <section className="space-y-3">
        <SectionHeader title="Validation des hypothèses" description="Test des hypothèses clés de la stratégie" />
        <ObjectArrayField
          label="Hypothèses"
          items={data.hypothesisValidation}
          onChange={(v) => update({ hypothesisValidation: v })}
          fields={[
            { key: "variableId", label: "Variable", placeholder: "A1, D3..." },
            { key: "hypothesis", label: "Hypothèse", placeholder: "Hypothèse à tester" },
            { key: "status", label: "Statut", placeholder: "validated / invalidated / to_test" },
            { key: "evidence", label: "Preuve", placeholder: "Éléments de preuve" },
          ]}
          defaultItem={{ variableId: "", hypothesis: "", status: "to_test" as const, evidence: "" }}
        />
      </section>

      {/* Market Reality */}
      <section className="space-y-3">
        <SectionHeader title="Réalité du marché" description="Tendances, signaux faibles et patterns émergents" />
        <StringArrayField label="Tendances macro" values={data.marketReality.macroTrends} onChange={(v) => update({ marketReality: { ...data.marketReality, macroTrends: v } })} placeholder="Tendance macro" />
        <StringArrayField label="Signaux faibles" values={data.marketReality.weakSignals} onChange={(v) => update({ marketReality: { ...data.marketReality, weakSignals: v } })} placeholder="Signal faible" />
        <StringArrayField label="Patterns émergents" values={data.marketReality.emergingPatterns} onChange={(v) => update({ marketReality: { ...data.marketReality, emergingPatterns: v } })} placeholder="Pattern émergent" />
      </section>

      {/* TAM / SAM / SOM */}
      <section className="space-y-3">
        <SectionHeader title="TAM / SAM / SOM" description="Dimensionnement du marché" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">TAM</Label>
            <FieldInput label="Valeur" value={data.tamSamSom.tam.value} onChange={(v) => update({ tamSamSom: { ...data.tamSamSom, tam: { ...data.tamSamSom.tam, value: v } } })} placeholder="Ex: 500M€" />
            <FieldInput label="Description" value={data.tamSamSom.tam.description} onChange={(v) => update({ tamSamSom: { ...data.tamSamSom, tam: { ...data.tamSamSom.tam, description: v } } })} multiline rows={2} placeholder="Description du TAM" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SAM</Label>
            <FieldInput label="Valeur" value={data.tamSamSom.sam.value} onChange={(v) => update({ tamSamSom: { ...data.tamSamSom, sam: { ...data.tamSamSom.sam, value: v } } })} placeholder="Ex: 120M€" />
            <FieldInput label="Description" value={data.tamSamSom.sam.description} onChange={(v) => update({ tamSamSom: { ...data.tamSamSom, sam: { ...data.tamSamSom.sam, description: v } } })} multiline rows={2} placeholder="Description du SAM" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SOM</Label>
            <FieldInput label="Valeur" value={data.tamSamSom.som.value} onChange={(v) => update({ tamSamSom: { ...data.tamSamSom, som: { ...data.tamSamSom.som, value: v } } })} placeholder="Ex: 15M€" />
            <FieldInput label="Description" value={data.tamSamSom.som.description} onChange={(v) => update({ tamSamSom: { ...data.tamSamSom, som: { ...data.tamSamSom.som, description: v } } })} multiline rows={2} placeholder="Description du SOM" />
          </div>
        </div>
        <FieldInput label="Méthodologie" value={data.tamSamSom.methodology} onChange={(v) => update({ tamSamSom: { ...data.tamSamSom, methodology: v } })} multiline placeholder="Méthodologie de calcul" />
      </section>

      {/* Competitive Benchmark */}
      <section className="space-y-3">
        <SectionHeader title="Benchmark concurrentiel" description="Analyse des forces/faiblesses des concurrents" />
        {data.competitiveBenchmark.map((bench, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <FieldInput label="Concurrent" value={bench.competitor} onChange={(v) => {
                const next = [...data.competitiveBenchmark];
                next[i] = { ...bench, competitor: v };
                update({ competitiveBenchmark: next });
              }} placeholder="Nom du concurrent" />
            </div>
            <FieldInput label="Part de marché" value={bench.marketShare} onChange={(v) => {
              const next = [...data.competitiveBenchmark];
              next[i] = { ...bench, marketShare: v };
              update({ competitiveBenchmark: next });
            }} placeholder="Ex: 15%" />
            <StringArrayField label="Forces" values={bench.strengths} onChange={(v) => {
              const next = [...data.competitiveBenchmark];
              next[i] = { ...bench, strengths: v };
              update({ competitiveBenchmark: next });
            }} placeholder="Force du concurrent" />
            <StringArrayField label="Faiblesses" values={bench.weaknesses} onChange={(v) => {
              const next = [...data.competitiveBenchmark];
              next[i] = { ...bench, weaknesses: v };
              update({ competitiveBenchmark: next });
            }} placeholder="Faiblesse du concurrent" />
          </div>
        ))}
        <button
          type="button"
          className="rounded-md border border-dashed px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50"
          onClick={() => update({ competitiveBenchmark: [...data.competitiveBenchmark, { competitor: "", strengths: [], weaknesses: [], marketShare: "" }] })}
        >
          + Ajouter un concurrent
        </button>
      </section>

      {/* Brand-Market Fit Score */}
      <section className="space-y-3">
        <SectionHeader title="Brand-Market Fit" description="Score d'adéquation marque-marché (0-100)" />
        <div className="flex items-center gap-4">
          <div className="w-32">
            <Label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={data.brandMarketFitScore}
              onChange={(e) => update({ brandMarketFitScore: Number(e.target.value) || 0 })}
              className="text-lg font-bold text-center"
            />
          </div>
          <div className="flex-1">
            <FieldInput label="Justification" value={data.brandMarketFitJustification ?? ""} onChange={(v) => update({ brandMarketFitJustification: v })} multiline rows={2} placeholder="Justification du score BMF" />
          </div>
        </div>
      </section>

      {/* Strategic Recommendations */}
      <section className="space-y-3">
        <SectionHeader title="Recommandations stratégiques" description="Actions recommandées suite à l'audit" />
        <StringArrayField label="Recommandations" values={data.strategicRecommendations} onChange={(v) => update({ strategicRecommendations: v })} placeholder="Recommandation stratégique" />
      </section>

      {/* Summary */}
      <section className="space-y-3">
        <SectionHeader title="Résumé" description="Synthèse narrative de l'audit Track" />
        <FieldInput label="Résumé" value={data.summary} onChange={(v) => update({ summary: v })} multiline rows={4} placeholder="Synthèse de l'audit Track/BMF" />
      </section>
    </div>
  );
}
