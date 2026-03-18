// ==========================================================================
// C.MS — AI Model Selector (per pipeline phase)
// ==========================================================================

"use client";

import { AVAILABLE_MODELS, DEFAULT_PHASE_MODELS } from "~/lib/constants";
import type { Phase } from "~/lib/constants";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";

interface ModelSelectorProps {
  phase: Phase;
  currentModel?: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  phase,
  currentModel,
  onModelChange,
  disabled,
}: ModelSelectorProps) {
  const defaultModel = DEFAULT_PHASE_MODELS[phase] ?? AVAILABLE_MODELS[0]?.id ?? "";
  const value = currentModel ?? defaultModel;

  return (
    <Select value={value} onValueChange={onModelChange} disabled={disabled}>
      <SelectTrigger size="sm" className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_MODELS.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            <span className="flex items-center gap-2">
              {m.label}
              {m.inputPer1M < 1 && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  eco
                </Badge>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
