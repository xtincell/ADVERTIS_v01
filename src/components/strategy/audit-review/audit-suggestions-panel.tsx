// Audit Suggestions Panel — Displays AI-generated suggestions for updating A-D-V-E
// based on audit R+T results. The user can accept or reject each suggestion.

"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  Check,
  X,
  CheckCheck,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { api } from "~/trpc/react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuditSuggestion {
  pillarType: "A" | "D" | "V" | "E";
  field: string;
  fieldLabel: string;
  currentValue: string;
  suggestedValue: string;
  reason: string;
}

type SuggestionStatus = "pending" | "accepted" | "rejected";

interface SuggestionWithStatus extends AuditSuggestion {
  status: SuggestionStatus;
  index: number;
}

type PanelState = "idle" | "generating" | "reviewing" | "applied";

interface AuditSuggestionsPanelProps {
  strategyId: string;
  pillars: Array<{
    id: string;
    type: string;
    content: unknown;
  }>;
  onSuggestionsApplied?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuditSuggestionsPanel({
  strategyId,
  pillars,
  onSuggestionsApplied,
}: AuditSuggestionsPanelProps) {
  const [state, setState] = useState<PanelState>("idle");
  const [suggestions, setSuggestions] = useState<SuggestionWithStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const updatePillarMutation = api.pillar.update.useMutation();

  // --- Generate suggestions ---
  const handleGenerate = useCallback(async () => {
    setState("generating");
    setError(null);

    try {
      const response = await fetch("/api/ai/audit-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        suggestions?: AuditSuggestion[];
        error?: string;
      };

      if (!response.ok || !data.success || !data.suggestions) {
        throw new Error(data.error ?? "Échec de la génération des suggestions");
      }

      if (data.suggestions.length === 0) {
        setState("idle");
        toast.info("L'audit n'a trouvé aucune amélioration à proposer.");
        return;
      }

      setSuggestions(
        data.suggestions.map((s, i) => ({
          ...s,
          status: "pending" as SuggestionStatus,
          index: i,
        })),
      );
      setState("reviewing");
      toast.success(
        `${data.suggestions.length} suggestion${data.suggestions.length > 1 ? "s" : ""} générée${data.suggestions.length > 1 ? "s" : ""}.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la génération",
      );
      setState("idle");
      toast.error("Erreur lors de la génération des suggestions.");
    }
  }, [strategyId]);

  // --- Accept a suggestion ---
  const handleAccept = useCallback(
    async (index: number) => {
      const suggestion = suggestions[index];
      if (!suggestion) return;

      // Find the pillar to update
      const pillar = pillars.find((p) => p.type === suggestion.pillarType);
      if (!pillar) {
        toast.error(`Pilier ${suggestion.pillarType} non trouvé`);
        return;
      }

      // Merge the suggestion into the pillar content
      try {
        const currentContent =
          typeof pillar.content === "object" && pillar.content !== null
            ? (pillar.content as Record<string, unknown>)
            : {};

        // Set value at dot path
        const updatedContent = { ...currentContent };
        setNestedValue(updatedContent, suggestion.field, suggestion.suggestedValue);

        await updatePillarMutation.mutateAsync({
          id: pillar.id,
          content: JSON.parse(JSON.stringify(updatedContent)),
        });

        setSuggestions((prev) =>
          prev.map((s, i) =>
            i === index ? { ...s, status: "accepted" as SuggestionStatus } : s,
          ),
        );
        toast.success(
          `Suggestion appliquée au pilier ${suggestion.pillarType}`,
        );
      } catch (err) {
        console.error("[AuditSuggestions] Accept failed:", err);
        toast.error("Erreur lors de l'application de la suggestion.");
      }
    },
    [suggestions, pillars, updatePillarMutation],
  );

  // --- Reject a suggestion ---
  const handleReject = useCallback((index: number) => {
    setSuggestions((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, status: "rejected" as SuggestionStatus } : s,
      ),
    );
  }, []);

  // --- Accept all ---
  const handleAcceptAll = useCallback(async () => {
    const pendingIndices = suggestions
      .map((s, i) => (s.status === "pending" ? i : -1))
      .filter((i) => i !== -1);

    for (const index of pendingIndices) {
      await handleAccept(index);
    }

    if (onSuggestionsApplied) {
      onSuggestionsApplied();
    }
  }, [suggestions, handleAccept, onSuggestionsApplied]);

  // --- Reject all ---
  const handleRejectAll = useCallback(() => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.status === "pending"
          ? { ...s, status: "rejected" as SuggestionStatus }
          : s,
      ),
    );
  }, []);

  // --- Check if all done ---
  const allProcessed =
    suggestions.length > 0 &&
    suggestions.every((s) => s.status !== "pending");

  const pendingCount = suggestions.filter(
    (s) => s.status === "pending",
  ).length;
  const acceptedCount = suggestions.filter(
    (s) => s.status === "accepted",
  ).length;
  const rejectedCount = suggestions.filter(
    (s) => s.status === "rejected",
  ).length;

  // Mark as done when all processed
  if (allProcessed && state === "reviewing") {
    setState("applied");
    if (acceptedCount > 0 && onSuggestionsApplied) {
      onSuggestionsApplied();
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card className="border-dashed border-violet-200 dark:border-violet-800">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-violet-600" />
              Suggestions d&apos;amélioration A-D-V-E
            </CardTitle>
            <CardDescription>
              L&apos;IA analyse l&apos;audit pour proposer des mises à jour
              concrètes des piliers de base
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {state === "reviewing" && (
              <Badge variant="secondary" className="text-xs">
                {pendingCount} en attente
              </Badge>
            )}
            {state === "applied" && (
              <Badge className="bg-green-100 text-green-700 text-xs">
                {acceptedCount} appliquée{acceptedCount > 1 ? "s" : ""}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Idle state — Generate button */}
          {state === "idle" && (
            <div className="space-y-3">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <Button
                onClick={handleGenerate}
                variant="outline"
                className="border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Générer les suggestions d&apos;amélioration
              </Button>
              <p className="text-xs text-muted-foreground">
                L&apos;IA analysera les résultats de l&apos;audit R+T pour
                proposer des améliorations des piliers A-D-V-E
              </p>
            </div>
          )}

          {/* Generating state */}
          {state === "generating" && (
            <div className="flex items-center gap-3 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
              <p className="text-sm text-muted-foreground">
                Analyse de l&apos;audit en cours…
              </p>
            </div>
          )}

          {/* Reviewing state — Show suggestions */}
          {(state === "reviewing" || state === "applied") && (
            <div className="space-y-4">
              {/* Bulk actions */}
              {state === "reviewing" && pendingCount > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAcceptAll}
                    className="text-green-700 border-green-200 hover:bg-green-50"
                    disabled={updatePillarMutation.isPending}
                  >
                    <CheckCheck className="mr-1 h-3.5 w-3.5" />
                    Tout accepter ({pendingCount})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRejectAll}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" />
                    Tout rejeter
                  </Button>
                </div>
              )}

              {/* Summary when done */}
              {state === "applied" && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  <Check className="h-4 w-4" />
                  {acceptedCount} suggestion{acceptedCount > 1 ? "s" : ""}{" "}
                  appliquée{acceptedCount > 1 ? "s" : ""}
                  {rejectedCount > 0 && (
                    <span className="text-muted-foreground">
                      , {rejectedCount} rejetée{rejectedCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}

              {/* Suggestion list */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.index}
                    suggestion={suggestion}
                    onAccept={() => handleAccept(suggestion.index)}
                    onReject={() => handleReject(suggestion.index)}
                    isApplying={updatePillarMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Suggestion Card
// ---------------------------------------------------------------------------

function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
  isApplying,
}: {
  suggestion: SuggestionWithStatus;
  onAccept: () => void;
  onReject: () => void;
  isApplying: boolean;
}) {
  const config = PILLAR_CONFIG[suggestion.pillarType as PillarType];
  const isDone = suggestion.status !== "pending";

  return (
    <div
      className={`rounded-lg border p-3 transition-all ${
        suggestion.status === "accepted"
          ? "border-green-200 bg-green-50/50 opacity-75"
          : suggestion.status === "rejected"
            ? "border-red-200 bg-red-50/30 opacity-50"
            : "border-muted"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Badge
          className="text-[10px] text-white"
          style={{ backgroundColor: config?.color }}
        >
          {suggestion.pillarType}
        </Badge>
        <span className="text-xs font-medium text-muted-foreground">
          {suggestion.fieldLabel || suggestion.field}
        </span>
        {suggestion.status === "accepted" && (
          <Badge className="ml-auto bg-green-100 text-green-700 text-[10px]">
            <Check className="mr-0.5 h-2.5 w-2.5" />
            Appliquée
          </Badge>
        )}
        {suggestion.status === "rejected" && (
          <Badge
            variant="outline"
            className="ml-auto text-red-500 text-[10px]"
          >
            <X className="mr-0.5 h-2.5 w-2.5" />
            Rejetée
          </Badge>
        )}
      </div>

      {/* Current → Suggested diff */}
      <div className="space-y-1 mb-2">
        {suggestion.currentValue && (
          <div className="text-xs">
            <span className="text-muted-foreground">Actuel : </span>
            <span className="line-through text-red-600/70">
              {truncate(suggestion.currentValue, 120)}
            </span>
          </div>
        )}
        <div className="text-xs">
          <span className="text-muted-foreground">Proposé : </span>
          <span className="text-green-700 font-medium">
            {truncate(suggestion.suggestedValue, 200)}
          </span>
        </div>
      </div>

      {/* Reason */}
      <p className="text-[11px] text-muted-foreground italic mb-2">
        {suggestion.reason}
      </p>

      {/* Actions */}
      {!isDone && (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={onAccept}
            disabled={isApplying}
            className="h-7 text-xs text-green-700 border-green-200 hover:bg-green-50"
          >
            <Check className="mr-1 h-3 w-3" />
            Accepter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="mr-1 h-3 w-3" />
            Rejeter
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen) + "…";
}

/**
 * Set a value at a dot-notation path in an object.
 * Handles simple dot paths like "positioning.statement".
 * Creates intermediate objects as needed.
 */
function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!;
    if (
      typeof current[key] !== "object" ||
      current[key] === null
    ) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1]!;
  current[lastKey] = value;
}
