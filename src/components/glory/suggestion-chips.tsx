"use client";

// =============================================================================
// COMP C.GLORY — SuggestionChips
// =============================================================================
// Displays clickable suggestion chips above a form field.
// Click a chip to fill the field. For textarea fields, clicking appends.
// Style: Glory violet, outline badges with hover fill.
// =============================================================================

import { cn } from "~/lib/utils";
import { Lightbulb } from "lucide-react";

interface SuggestionChipsProps {
  suggestions: string[];
  /** "replace" = click replaces value, "append" = click appends to value */
  mode?: "replace" | "append";
  onSelect: (value: string) => void;
  className?: string;
}

export function SuggestionChips({
  suggestions,
  mode = "replace",
  onSelect,
  className,
}: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-start gap-1.5 mb-2", className)}>
      <Lightbulb className="h-3.5 w-3.5 text-violet-500/60 mt-1 shrink-0" />
      {suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(s)}
          title={mode === "append" ? "Cliquer pour ajouter" : "Cliquer pour utiliser"}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs",
            "border border-violet-500/30 text-violet-500 bg-violet-500/5",
            "hover:bg-violet-500/15 hover:border-violet-500/50",
            "active:bg-violet-500/25",
            "transition-colors cursor-pointer",
            "max-w-[280px] truncate",
          )}
        >
          <span className="truncate">{s}</span>
        </button>
      ))}
    </div>
  );
}
