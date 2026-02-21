// ==========================================================================
// C.AR2 — Risk Audit Editor
// Pillar R review/edit.
// ==========================================================================

"use client";

import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
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
import type {
  RiskAuditResult,
  MicroSwot,
} from "~/server/services/audit-generation";

interface RiskAuditEditorProps {
  value: RiskAuditResult;
  onChange: (value: RiskAuditResult) => void;
}

export function RiskAuditEditor({ value, onChange }: RiskAuditEditorProps) {
  const [expandedSwots, setExpandedSwots] = useState<Set<number>>(new Set());

  const toggleSwot = (index: number) => {
    setExpandedSwots((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSwots(new Set(value.microSwots.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedSwots(new Set());
  };

  // --- Micro-SWOT update helpers ---
  const updateMicroSwot = (index: number, updates: Partial<MicroSwot>) => {
    const updated = [...value.microSwots];
    updated[index] = { ...updated[index]!, ...updates };
    onChange({ ...value, microSwots: updated });
  };

  // --- Global fields update helpers ---
  const updateGlobalSwot = (
    field: keyof RiskAuditResult["globalSwot"],
    items: string[],
  ) => {
    onChange({
      ...value,
      globalSwot: { ...value.globalSwot, [field]: items },
    });
  };

  const updateMatrix = (
    index: number,
    updates: Partial<RiskAuditResult["probabilityImpactMatrix"][number]>,
  ) => {
    const updated = [...value.probabilityImpactMatrix];
    updated[index] = { ...updated[index]!, ...updates };
    onChange({ ...value, probabilityImpactMatrix: updated });
  };

  const addMatrixRow = () => {
    onChange({
      ...value,
      probabilityImpactMatrix: [
        ...value.probabilityImpactMatrix,
        { risk: "", probability: "medium", impact: "medium", priority: value.probabilityImpactMatrix.length + 1 },
      ],
    });
  };

  const removeMatrixRow = (index: number) => {
    onChange({
      ...value,
      probabilityImpactMatrix: value.probabilityImpactMatrix.filter(
        (_, i) => i !== index,
      ),
    });
  };

  const updateMitigation = (
    index: number,
    updates: Partial<RiskAuditResult["mitigationPriorities"][number]>,
  ) => {
    const updated = [...value.mitigationPriorities];
    updated[index] = { ...updated[index]!, ...updates };
    onChange({ ...value, mitigationPriorities: updated });
  };

  const addMitigation = () => {
    onChange({
      ...value,
      mitigationPriorities: [
        ...value.mitigationPriorities,
        { risk: "", action: "", urgency: "short_term", effort: "medium" },
      ],
    });
  };

  const removeMitigation = (index: number) => {
    onChange({
      ...value,
      mitigationPriorities: value.mitigationPriorities.filter(
        (_, i) => i !== index,
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Score de risque ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Score de Risque Global
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={value.riskScore}
                onChange={(e) =>
                  onChange({
                    ...value,
                    riskScore: Math.max(0, Math.min(100, Number(e.target.value))),
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
                  value.riskScore < 30
                    ? "bg-green-500"
                    : value.riskScore < 60
                      ? "bg-amber-500"
                      : "bg-red-500",
                )}
                style={{ width: `${value.riskScore}%` }}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Justification</Label>
            <Textarea
              value={value.riskScoreJustification}
              onChange={(e) =>
                onChange({ ...value, riskScoreJustification: e.target.value })
              }
              rows={2}
              className="mt-1 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Micro-SWOTs ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Micro-SWOTs par Variable ({value.microSwots.length})
            </CardTitle>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={expandAll}
                className="text-xs"
              >
                Tout ouvrir
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={collapseAll}
                className="text-xs"
              >
                Tout fermer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {value.microSwots.map((ms, index) => {
            const isExpanded = expandedSwots.has(index);
            const riskColors = {
              low: "bg-green-100 text-green-700",
              medium: "bg-amber-100 text-amber-700",
              high: "bg-red-100 text-red-700",
            };

            return (
              <div
                key={index}
                className="rounded-lg border"
              >
                {/* Header (always visible) */}
                <button
                  type="button"
                  onClick={() => toggleSwot(index)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {ms.variableId} — {ms.variableLabel}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn("ml-auto text-xs", riskColors[ms.riskLevel])}
                  >
                    {ms.riskLevel === "low"
                      ? "Faible"
                      : ms.riskLevel === "medium"
                        ? "Moyen"
                        : "Elevé"}
                  </Badge>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="space-y-3 border-t px-4 py-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <EditableStringList
                        label="Forces"
                        value={ms.strengths}
                        onChange={(v) =>
                          updateMicroSwot(index, { strengths: v })
                        }
                        placeholder="Ajouter une force..."
                      />
                      <EditableStringList
                        label="Faiblesses"
                        value={ms.weaknesses}
                        onChange={(v) =>
                          updateMicroSwot(index, { weaknesses: v })
                        }
                        placeholder="Ajouter une faiblesse..."
                      />
                      <EditableStringList
                        label="Opportunités"
                        value={ms.opportunities}
                        onChange={(v) =>
                          updateMicroSwot(index, { opportunities: v })
                        }
                        placeholder="Ajouter une opportunité..."
                      />
                      <EditableStringList
                        label="Menaces"
                        value={ms.threats}
                        onChange={(v) =>
                          updateMicroSwot(index, { threats: v })
                        }
                        placeholder="Ajouter une menace..."
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <Label className="text-xs">Niveau de risque</Label>
                        <Select
                          value={ms.riskLevel}
                          onValueChange={(v) =>
                            updateMicroSwot(index, {
                              riskLevel: v as "low" | "medium" | "high",
                            })
                          }
                        >
                          <SelectTrigger className="mt-1 h-8 w-32 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Faible</SelectItem>
                            <SelectItem value="medium">Moyen</SelectItem>
                            <SelectItem value="high">Elevé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">Commentaire</Label>
                        <Textarea
                          value={ms.commentary}
                          onChange={(e) =>
                            updateMicroSwot(index, {
                              commentary: e.target.value,
                            })
                          }
                          rows={2}
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── SWOT Global ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">SWOT Global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <EditableStringList
              label="Forces"
              value={value.globalSwot.strengths}
              onChange={(v) => updateGlobalSwot("strengths", v)}
              placeholder="Ajouter une force..."
            />
            <EditableStringList
              label="Faiblesses"
              value={value.globalSwot.weaknesses}
              onChange={(v) => updateGlobalSwot("weaknesses", v)}
              placeholder="Ajouter une faiblesse..."
            />
            <EditableStringList
              label="Opportunités"
              value={value.globalSwot.opportunities}
              onChange={(v) => updateGlobalSwot("opportunities", v)}
              placeholder="Ajouter une opportunité..."
            />
            <EditableStringList
              label="Menaces"
              value={value.globalSwot.threats}
              onChange={(v) => updateGlobalSwot("threats", v)}
              placeholder="Ajouter une menace..."
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Matrice Probabilité × Impact ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Matrice Probabilité × Impact
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMatrixRow}
            >
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {value.probabilityImpactMatrix.map((row, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded border p-2"
              >
                <Input
                  value={row.risk}
                  onChange={(e) =>
                    updateMatrix(index, { risk: e.target.value })
                  }
                  placeholder="Risque"
                  className="h-8 flex-1 text-sm"
                />
                <Select
                  value={row.probability}
                  onValueChange={(v) =>
                    updateMatrix(index, {
                      probability: v as "low" | "medium" | "high",
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Prob. faible</SelectItem>
                    <SelectItem value="medium">Prob. moy.</SelectItem>
                    <SelectItem value="high">Prob. haute</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={row.impact}
                  onValueChange={(v) =>
                    updateMatrix(index, {
                      impact: v as "low" | "medium" | "high",
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Impact faible</SelectItem>
                    <SelectItem value="medium">Impact moy.</SelectItem>
                    <SelectItem value="high">Impact haut</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={row.priority}
                  onChange={(e) =>
                    updateMatrix(index, { priority: Number(e.target.value) })
                  }
                  className="h-8 w-14 text-center text-xs"
                  title="Priorité"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeMatrixRow(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Priorités de mitigation ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Priorités de Mitigation
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMitigation}
            >
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {value.mitigationPriorities.map((row, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-2 rounded border p-2"
              >
                <Input
                  value={row.risk}
                  onChange={(e) =>
                    updateMitigation(index, { risk: e.target.value })
                  }
                  placeholder="Risque"
                  className="h-8 min-w-[120px] flex-1 text-sm"
                />
                <Input
                  value={row.action}
                  onChange={(e) =>
                    updateMitigation(index, { action: e.target.value })
                  }
                  placeholder="Action"
                  className="h-8 min-w-[120px] flex-1 text-sm"
                />
                <Select
                  value={row.urgency}
                  onValueChange={(v) =>
                    updateMitigation(index, {
                      urgency: v as "immediate" | "short_term" | "medium_term",
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immédiat</SelectItem>
                    <SelectItem value="short_term">Court terme</SelectItem>
                    <SelectItem value="medium_term">Moyen terme</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={row.effort}
                  onValueChange={(v) =>
                    updateMitigation(index, {
                      effort: v as "low" | "medium" | "high",
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Effort faible</SelectItem>
                    <SelectItem value="medium">Effort moy.</SelectItem>
                    <SelectItem value="high">Effort haut</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeMitigation(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
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
