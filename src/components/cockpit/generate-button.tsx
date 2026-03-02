// =============================================================================
// COMPONENT — AI Generate Button (shared)
// =============================================================================
// Reusable "Générer avec l'IA" button for deliverable empty states.
// Shows loading spinner during generation, error toast on failure.
// =============================================================================

"use client";

import { Loader2, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  label?: string;
  loadingLabel?: string;
  className?: string;
  variant?: "primary" | "secondary";
}

export function GenerateButton({
  onClick,
  isLoading,
  label = "Générer avec l'IA",
  loadingLabel = "Génération en cours…",
  className,
  variant = "primary",
}: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60",
        variant === "primary"
          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:from-purple-700 hover:to-indigo-700"
          : "border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
        className,
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}

interface EmptyStateWithGenerateProps {
  message: string;
  onGenerate: () => void;
  isGenerating: boolean;
  error?: string | null;
  generateLabel?: string;
}

export function EmptyStateWithGenerate({
  message,
  onGenerate,
  isGenerating,
  error,
  generateLabel,
}: EmptyStateWithGenerateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <p className="text-center text-sm text-muted-foreground">{message}</p>
      <GenerateButton
        onClick={onGenerate}
        isLoading={isGenerating}
        label={generateLabel}
      />
      {error && (
        <p className="max-w-md text-center text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
