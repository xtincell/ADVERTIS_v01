"use client";

import { BarChart3, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { EditableStringList } from "./editable-string-list";
import { cn } from "~/lib/utils";
import type { TrackAuditResult } from "~/server/services/audit-generation";

interface TrackAuditEditorProps {
  value: TrackAuditResult;
  onChange: (value: TrackAuditResult) => void;
}

export function TrackAuditEditor({ value, onChange }: TrackAuditEditorProps) {
  // --- Triangulation ---
  const updateTriangulation = (
    field: keyof TrackAuditResult["triangulation"],
    text: string,
  ) => {
    onChange({
      ...value,
      triangulation: { ...value.triangulation, [field]: text },
    });
  };

  // --- Hypothesis Validation ---
  const updateHypothesis = (
    index: number,
    updates: Partial<TrackAuditResult["hypothesisValidation"][number]>,
  ) => {
    const updated = [...value.hypothesisValidation];
    updated[index] = { ...updated[index]!, ...updates };
    onChange({ ...value, hypothesisValidation: updated });
  };

  const addHypothesis = () => {
    onChange({
      ...value,
      hypothesisValidation: [
        ...value.hypothesisValidation,
        { variableId: "", hypothesis: "", status: "to_test" as const, evidence: "" },
      ],
    });
  };

  const removeHypothesis = (index: number) => {
    onChange({
      ...value,
      hypothesisValidation: value.hypothesisValidation.filter(
        (_, i) => i !== index,
      ),
    });
  };

  // --- Competitive Benchmark ---
  const updateBenchmark = (
    index: number,
    updates: Partial<TrackAuditResult["competitiveBenchmark"][number]>,
  ) => {
    const updated = [...value.competitiveBenchmark];
    updated[index] = { ...updated[index]!, ...updates };
    onChange({ ...value, competitiveBenchmark: updated });
  };

  const addBenchmark = () => {
    onChange({
      ...value,
      competitiveBenchmark: [
        ...value.competitiveBenchmark,
        { competitor: "", strengths: [], weaknesses: [], marketShare: "" },
      ],
    });
  };

  const removeBenchmark = (index: number) => {
    onChange({
      ...value,
      competitiveBenchmark: value.competitiveBenchmark.filter(
        (_, i) => i !== index,
      ),
    });
  };

  // --- TAM/SAM/SOM ---
  const updateTamSamSom = (
    field: "tam" | "sam" | "som",
    key: "value" | "description",
    text: string,
  ) => {
    onChange({
      ...value,
      tamSamSom: {
        ...value.tamSamSom,
        [field]: { ...value.tamSamSom[field], [key]: text },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Brand-Market Fit Score ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            Score Brand-Market Fit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={value.brandMarketFitScore}
                onChange={(e) =>
                  onChange({
                    ...value,
                    brandMarketFitScore: Math.max(
                      0,
                      Math.min(100, Number(e.target.value)),
                    ),
                  })
                }
                className="h-9 w-20 text-center text-lg font-bold"
              />
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  value.brandMarketFitScore < 30
                    ? "bg-red-500"
                    : value.brandMarketFitScore < 60
                      ? "bg-amber-500"
                      : "bg-green-500",
                )}
                style={{ width: `${value.brandMarketFitScore}%` }}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Justification</Label>
            <Textarea
              value={value.brandMarketFitJustification}
              onChange={(e) =>
                onChange({
                  ...value,
                  brandMarketFitJustification: e.target.value,
                })
              }
              rows={2}
              className="mt-1 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Triangulation ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Triangulation Trois Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Données internes</Label>
            <Textarea
              value={value.triangulation.internalData}
              onChange={(e) =>
                updateTriangulation("internalData", e.target.value)
              }
              rows={3}
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Données marché</Label>
            <Textarea
              value={value.triangulation.marketData}
              onChange={(e) =>
                updateTriangulation("marketData", e.target.value)
              }
              rows={3}
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Données clients</Label>
            <Textarea
              value={value.triangulation.customerData}
              onChange={(e) =>
                updateTriangulation("customerData", e.target.value)
              }
              rows={3}
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Synthèse croisée</Label>
            <Textarea
              value={value.triangulation.synthesis}
              onChange={(e) =>
                updateTriangulation("synthesis", e.target.value)
              }
              rows={3}
              className="mt-1 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Validation des hypothèses ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Validation des Hypothèses ({value.hypothesisValidation.length})
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHypothesis}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {value.hypothesisValidation.map((hyp, index) => (
            <div
              key={index}
              className="rounded-lg border p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={hyp.variableId}
                  onChange={(e) =>
                    updateHypothesis(index, { variableId: e.target.value })
                  }
                  placeholder="Variable ID (ex: A1)"
                  className="h-8 w-24 text-sm"
                />
                <Input
                  value={hyp.hypothesis}
                  onChange={(e) =>
                    updateHypothesis(index, { hypothesis: e.target.value })
                  }
                  placeholder="Hypothèse"
                  className="h-8 flex-1 text-sm"
                />
                <Select
                  value={hyp.status}
                  onValueChange={(v) =>
                    updateHypothesis(index, {
                      status: v as "validated" | "invalidated" | "to_test",
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="validated">Validée</SelectItem>
                    <SelectItem value="invalidated">Invalidée</SelectItem>
                    <SelectItem value="to_test">A tester</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeHypothesis(index)}
                >
                  ×
                </Button>
              </div>
              <Textarea
                value={hyp.evidence}
                onChange={(e) =>
                  updateHypothesis(index, { evidence: e.target.value })
                }
                placeholder="Evidence / justification"
                rows={2}
                className="text-sm"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Réalité Marché ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Réalité Marché</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EditableStringList
            label="Tendances macro"
            value={value.marketReality.macroTrends}
            onChange={(v) =>
              onChange({
                ...value,
                marketReality: { ...value.marketReality, macroTrends: v },
              })
            }
            placeholder="Ajouter une tendance macro..."
          />
          <EditableStringList
            label="Signaux faibles"
            value={value.marketReality.weakSignals}
            onChange={(v) =>
              onChange({
                ...value,
                marketReality: { ...value.marketReality, weakSignals: v },
              })
            }
            placeholder="Ajouter un signal faible..."
          />
          <EditableStringList
            label="Patterns émergents"
            value={value.marketReality.emergingPatterns}
            onChange={(v) =>
              onChange({
                ...value,
                marketReality: {
                  ...value.marketReality,
                  emergingPatterns: v,
                },
              })
            }
            placeholder="Ajouter un pattern émergent..."
          />
        </CardContent>
      </Card>

      {/* ── TAM/SAM/SOM ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">TAM / SAM / SOM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {(["tam", "sam", "som"] as const).map((field) => (
              <div key={field} className="space-y-2">
                <Label className="text-xs font-semibold uppercase">
                  {field.toUpperCase()}
                </Label>
                <Input
                  value={value.tamSamSom[field].value}
                  onChange={(e) =>
                    updateTamSamSom(field, "value", e.target.value)
                  }
                  placeholder="Ex: 5 Mrd EUR"
                  className="h-8 text-sm"
                />
                <Textarea
                  value={value.tamSamSom[field].description}
                  onChange={(e) =>
                    updateTamSamSom(field, "description", e.target.value)
                  }
                  placeholder="Description"
                  rows={2}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
          <div>
            <Label className="text-xs">Méthodologie</Label>
            <Textarea
              value={value.tamSamSom.methodology}
              onChange={(e) =>
                onChange({
                  ...value,
                  tamSamSom: {
                    ...value.tamSamSom,
                    methodology: e.target.value,
                  },
                })
              }
              rows={2}
              className="mt-1 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Benchmarking Concurrentiel ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Benchmarking Concurrentiel ({value.competitiveBenchmark.length})
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBenchmark}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {value.competitiveBenchmark.map((comp, index) => (
            <div key={index} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={comp.competitor}
                  onChange={(e) =>
                    updateBenchmark(index, { competitor: e.target.value })
                  }
                  placeholder="Nom du concurrent"
                  className="h-8 flex-1 text-sm"
                />
                <Input
                  value={comp.marketShare}
                  onChange={(e) =>
                    updateBenchmark(index, { marketShare: e.target.value })
                  }
                  placeholder="Part de marché"
                  className="h-8 w-32 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeBenchmark(index)}
                >
                  ×
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <EditableStringList
                  label="Forces"
                  value={comp.strengths}
                  onChange={(v) =>
                    updateBenchmark(index, { strengths: v })
                  }
                  placeholder="Ajouter une force..."
                />
                <EditableStringList
                  label="Faiblesses"
                  value={comp.weaknesses}
                  onChange={(v) =>
                    updateBenchmark(index, { weaknesses: v })
                  }
                  placeholder="Ajouter une faiblesse..."
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Recommandations Stratégiques ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Recommandations Stratégiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditableStringList
            value={value.strategicRecommendations}
            onChange={(v) =>
              onChange({ ...value, strategicRecommendations: v })
            }
            placeholder="Ajouter une recommandation..."
          />
        </CardContent>
      </Card>

      {/* ── Synthèse ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Synthèse</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={value.summary}
            onChange={(e) => onChange({ ...value, summary: e.target.value })}
            rows={3}
            className="text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}
