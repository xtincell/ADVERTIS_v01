// ==========================================================================
// C.E6 — Risk Editor
// Pillar R content editor.
// ==========================================================================

"use client";

import type { RiskAuditResult } from "~/lib/types/pillar-schemas";
import { FieldInput, SectionHeader } from "./shared/field-input";
import { ObjectArrayField, StringArrayField } from "./shared/field-array";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface Props {
  data: RiskAuditResult;
  onChange: (data: RiskAuditResult) => void;
}

export function RiskEditor({ data, onChange }: Props) {
  const update = (patch: Partial<RiskAuditResult>) =>
    onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      {/* SWOT Global */}
      <section className="space-y-3">
        <SectionHeader title="SWOT Global" description="Forces, faiblesses, opportunités et menaces" />
        <StringArrayField label="Forces" values={data.globalSwot.strengths} onChange={(v) => update({ globalSwot: { ...data.globalSwot, strengths: v } })} placeholder="Force" />
        <StringArrayField label="Faiblesses" values={data.globalSwot.weaknesses} onChange={(v) => update({ globalSwot: { ...data.globalSwot, weaknesses: v } })} placeholder="Faiblesse" />
        <StringArrayField label="Opportunités" values={data.globalSwot.opportunities} onChange={(v) => update({ globalSwot: { ...data.globalSwot, opportunities: v } })} placeholder="Opportunité" />
        <StringArrayField label="Menaces" values={data.globalSwot.threats} onChange={(v) => update({ globalSwot: { ...data.globalSwot, threats: v } })} placeholder="Menace" />
      </section>

      {/* Micro SWOTs */}
      <section className="space-y-3">
        <SectionHeader title="Micro-SWOTs par pilier" description="Analyse SWOT par axe ADVE" />
        <ObjectArrayField
          label="Micro-SWOTs"
          items={data.microSwots}
          onChange={(v) => update({ microSwots: v })}
          fields={[
            { key: "variableId", label: "Variable ID", placeholder: "A1, D3..." },
            { key: "variableLabel", label: "Label", placeholder: "Identité de marque" },
            { key: "commentary", label: "Commentaire", placeholder: "Analyse SWOT" },
            { key: "riskLevel", label: "Niveau de risque", placeholder: "low / medium / high" },
          ]}
          defaultItem={{ variableId: "", variableLabel: "", strengths: [], weaknesses: [], opportunities: [], threats: [], riskLevel: "medium" as const, commentary: "" }}
        />
      </section>

      {/* Matrice Probabilité × Impact */}
      <section className="space-y-3">
        <SectionHeader title="Matrice Probabilité × Impact" description="Classification des risques identifiés" />
        <ObjectArrayField
          label="Risques"
          items={data.probabilityImpactMatrix}
          onChange={(v) => update({ probabilityImpactMatrix: v })}
          fields={[
            { key: "risk", label: "Risque", placeholder: "Description du risque" },
            { key: "probability", label: "Probabilité", placeholder: "low / medium / high" },
            { key: "impact", label: "Impact", placeholder: "low / medium / high" },
            { key: "priority", label: "Priorité (1-5)", placeholder: "3" },
          ]}
          defaultItem={{ risk: "", probability: "medium" as const, impact: "medium" as const, priority: 3 }}
        />
      </section>

      {/* Priorités de mitigation */}
      <section className="space-y-3">
        <SectionHeader title="Priorités de mitigation" description="Actions pour réduire les risques" />
        <ObjectArrayField
          label="Actions"
          items={data.mitigationPriorities}
          onChange={(v) => update({ mitigationPriorities: v })}
          fields={[
            { key: "risk", label: "Risque", placeholder: "Risque ciblé" },
            { key: "action", label: "Action", placeholder: "Action de mitigation" },
            { key: "urgency", label: "Urgence", placeholder: "immediate / short_term / medium_term" },
            { key: "effort", label: "Effort", placeholder: "low / medium / high" },
          ]}
          defaultItem={{ risk: "", action: "", urgency: "medium_term" as const, effort: "medium" as const }}
        />
      </section>

      {/* Score & Synthèse */}
      <section className="space-y-3">
        <SectionHeader title="Score & Synthèse" description="Évaluation globale du risque" />
        <div className="flex items-center gap-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score de risque (0-100)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={data.riskScore}
            onChange={(e) => update({ riskScore: Number(e.target.value) })}
            className="w-24 text-sm"
          />
        </div>
        <FieldInput label="Justification du score" value={data.riskScoreJustification} onChange={(v) => update({ riskScoreJustification: v })} multiline placeholder="Explication du score de risque" />
        <FieldInput label="Synthèse" value={data.summary} onChange={(v) => update({ summary: v })} multiline rows={5} placeholder="Synthèse de l'audit de risque" />
      </section>
    </div>
  );
}
