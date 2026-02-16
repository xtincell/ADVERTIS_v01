"use client";

import { useState } from "react";
import { Check, AlertCircle, Pencil, RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getFicheDeMarqueSchema } from "~/lib/interview-schema";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VariableMappingPreviewProps {
  mappedVariables: Record<string, string>;
  confidence: number;
  unmappedVariables: string[];
  fileName: string;
  onConfirm: (editedVariables: Record<string, string>) => void;
  onReset: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VariableMappingPreview({
  mappedVariables,
  confidence,
  unmappedVariables,
  fileName,
  onConfirm,
  onReset,
}: VariableMappingPreviewProps) {
  const [editedVariables, setEditedVariables] =
    useState<Record<string, string>>(mappedVariables);
  const [editingId, setEditingId] = useState<string | null>(null);

  const schema = getFicheDeMarqueSchema();

  const handleEdit = (variableId: string, value: string) => {
    setEditedVariables((prev) => ({ ...prev, [variableId]: value }));
  };

  const filledCount = Object.values(editedVariables).filter(
    (v) => v.trim().length > 0,
  ).length;
  const totalCount = Object.keys(editedVariables).length;

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">
              Fichier importé : <span className="text-primary">{fileName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {filledCount}/{totalCount} variables mappées — Confiance IA :{" "}
              {confidence}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={confidence >= 70 ? "default" : "secondary"}
              className={
                confidence >= 70
                  ? "bg-green-100 text-green-800"
                  : confidence >= 40
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }
            >
              {confidence >= 70
                ? "Bon mapping"
                : confidence >= 40
                  ? "Mapping partiel"
                  : "Mapping faible"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Unmapped variables warning */}
      {unmappedVariables.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {unmappedVariables.length} variable(s) non mappée(s)
            </p>
            <p className="text-xs text-yellow-700">
              Ces variables n&apos;ont pas pu être extraites du fichier. Vous
              pouvez les remplir manuellement ci-dessous.
            </p>
          </div>
        </div>
      )}

      {/* Variables by pillar */}
      <Tabs defaultValue={schema[0]?.pillarType ?? "A"}>
        <TabsList className="w-full justify-start">
          {schema.map((section) => {
            const config = PILLAR_CONFIG[section.pillarType as PillarType];
            const sectionFilled = section.variables.filter(
              (v) => editedVariables[v.id]?.trim(),
            ).length;
            return (
              <TabsTrigger
                key={section.pillarType}
                value={section.pillarType}
                className="relative"
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: config?.color }}
                />
                {section.pillarType}
                <Badge variant="outline" className="ml-1.5 text-xs">
                  {sectionFilled}/{section.variables.length}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {schema.map((section) => (
          <TabsContent
            key={section.pillarType}
            value={section.pillarType}
            className="mt-4 space-y-3"
          >
            <h3 className="text-lg font-semibold">
              {section.pillarType} — {section.title}
            </h3>

            {section.variables.map((variable) => {
              const value = editedVariables[variable.id] ?? "";
              const isFilled = value.trim().length > 0;
              const isEditing = editingId === variable.id;

              return (
                <Card
                  key={variable.id}
                  className={`transition-colors ${!isFilled ? "border-yellow-200 bg-yellow-50/50" : ""}`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Badge variant="outline" className="font-mono text-xs">
                          {variable.id}
                        </Badge>
                        {variable.label}
                        {isFilled ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                        )}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingId(isEditing ? null : variable.id)
                        }
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        {isEditing ? "Fermer" : "Modifier"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {variable.description}
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {isEditing ? (
                      <Textarea
                        value={value}
                        onChange={(e) =>
                          handleEdit(variable.id, e.target.value)
                        }
                        placeholder={variable.placeholder}
                        rows={4}
                        className="mt-2"
                      />
                    ) : (
                      <p
                        className={`mt-1 text-sm ${isFilled ? "text-foreground" : "italic text-muted-foreground"}`}
                      >
                        {isFilled
                          ? value.length > 300
                            ? value.substring(0, 300) + "..."
                            : value
                          : "Non renseigné — cliquez sur Modifier pour ajouter manuellement"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>

      {/* Action buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Recommencer l&apos;import
        </Button>
        <Button onClick={() => onConfirm(editedVariables)}>
          <Check className="mr-2 h-4 w-4" />
          Confirmer le mapping ({filledCount}/{totalCount} variables)
        </Button>
      </div>
    </div>
  );
}
