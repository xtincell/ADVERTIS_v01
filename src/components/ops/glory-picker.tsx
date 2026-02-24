// ==========================================================================
// C.O10 — Glory Picker
// Select a GLORY output to attach as mission deliverable reference.
// ==========================================================================

"use client";

import { useState } from "react";
import { Sparkles, Star, Check } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface GloryPickerProps {
  strategyId: string;
  onSelect: (output: { id: string; title: string; toolSlug: string }) => void;
  onCancel: () => void;
}

export function GloryPicker({
  strategyId,
  onSelect,
  onCancel,
}: GloryPickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: outputs, isLoading } = api.glory.listForPicker.useQuery({
    strategyId,
  });

  const selected = outputs?.find((o) => o.id === selectedId);

  return (
    <div className="space-y-3 rounded-md border bg-background p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 text-purple-500" />
        Attacher un output GLORY
      </div>

      {isLoading && (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Chargement...
        </div>
      )}

      {outputs && outputs.length === 0 && (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Aucun output GLORY disponible pour cette strategie.
        </div>
      )}

      {outputs && outputs.length > 0 && (
        <div className="max-h-60 space-y-1 overflow-y-auto">
          {outputs.map((output) => (
            <button
              key={output.id}
              onClick={() => setSelectedId(output.id)}
              className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors ${
                selectedId === output.id
                  ? "border border-purple-300 bg-purple-50"
                  : "hover:bg-muted/50"
              }`}
            >
              {selectedId === output.id ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0 text-purple-600" />
              ) : (
                <div className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-medium">{output.title}</span>
                  {output.isFavorite && (
                    <Star className="h-3 w-3 flex-shrink-0 fill-amber-400 text-amber-400" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {output.toolSlug} · {output.layer} ·{" "}
                  {new Date(output.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          size="sm"
          disabled={!selected}
          onClick={() => {
            if (selected) {
              onSelect({
                id: selected.id,
                title: selected.title,
                toolSlug: selected.toolSlug,
              });
            }
          }}
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Attacher
        </Button>
      </div>
    </div>
  );
}
