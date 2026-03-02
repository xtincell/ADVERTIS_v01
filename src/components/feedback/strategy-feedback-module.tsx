// =============================================================================
// C.FB1 — Strategy Feedback Module
// =============================================================================
// Reusable component for natural language strategy feedback.
// Used in both cockpit and SaaS client views.
// Two-phase flow: 1) Analyze → show impacts → 2) Confirm → regenerate.
// =============================================================================

"use client";

import { useState, useCallback, useRef } from "react";
import {
  MessageSquareText,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FeedbackAnalysis {
  impactedPillars: Array<{
    pillar: string;
    reason: string;
    severity: "high" | "medium" | "low";
    sectionsToUpdate: string[];
  }>;
  changesSummary: string;
  interviewDataUpdates: Record<string, string>;
}

type FeedbackPhase = "input" | "analyzing" | "review" | "applying" | "done";

interface StrategyFeedbackModuleProps {
  strategyId: string;
  onComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StrategyFeedbackModule({
  strategyId,
  onComplete,
}: StrategyFeedbackModuleProps) {
  const [phase, setPhase] = useState<FeedbackPhase>("input");
  const [feedback, setFeedback] = useState("");
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
  const [selectedPillars, setSelectedPillars] = useState<Set<string>>(new Set());
  const [updatingPillar, setUpdatingPillar] = useState<string | null>(null);
  const [updatedPillars, setUpdatedPillars] = useState<string[]>([]);
  const [progressMessage, setProgressMessage] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // ── Phase 1: Analyze ──
  const handleAnalyze = useCallback(async () => {
    if (!feedback.trim()) {
      toast.error("Décrivez ce qui a changé avant d'analyser.");
      return;
    }

    setPhase("analyzing");
    setAnalysis(null);

    try {
      abortRef.current = new AbortController();
      const response = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyId,
          feedback: feedback.trim(),
          action: "analyze",
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as Record<string, unknown>;
            if (event.event === "progress") {
              setProgressMessage(event.message as string);
            } else if (event.event === "analysis" || event.event === "complete") {
              const data = (event.data ?? event.analysis) as FeedbackAnalysis;
              if (data?.impactedPillars) {
                setAnalysis(data);
                // Pre-select high and medium severity pillars
                const preSelected = new Set(
                  data.impactedPillars
                    .filter((p) => p.severity === "high" || p.severity === "medium")
                    .map((p) => p.pillar),
                );
                setSelectedPillars(preSelected);
                setPhase("review");
              }
            } else if (event.event === "error") {
              throw new Error(event.error as string);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("[Feedback] Analysis error:", err);
      toast.error("Erreur lors de l'analyse du feedback.");
      setPhase("input");
    }
  }, [feedback, strategyId]);

  // ── Phase 2: Apply ──
  const handleApply = useCallback(async () => {
    if (!analysis || selectedPillars.size === 0) return;

    setPhase("applying");
    setUpdatedPillars([]);

    try {
      abortRef.current = new AbortController();
      const response = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyId,
          feedback: feedback.trim(),
          action: "apply",
          analysis,
          pillarsToRegenerate: Array.from(selectedPillars),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as Record<string, unknown>;
            if (event.event === "progress") {
              setProgressMessage(event.message as string);
              // Extract pillar type from message if regenerating
              const match = (event.message as string).match(/pilier (\w)/);
              if (match) setUpdatingPillar(match[1]!);
            } else if (event.event === "pillar_updated") {
              setUpdatedPillars((prev) => [...prev, event.pillar as string]);
              setUpdatingPillar(null);
            } else if (event.event === "complete") {
              setPhase("done");
              toast.success("Stratégie mise à jour avec succès !");
              onComplete?.();
            } else if (event.event === "error") {
              throw new Error(event.error as string);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("[Feedback] Apply error:", err);
      toast.error("Erreur lors de la mise à jour.");
      setPhase("review");
    }
  }, [analysis, selectedPillars, feedback, strategyId, onComplete]);

  const togglePillar = (pillar: string) => {
    setSelectedPillars((prev) => {
      const next = new Set(prev);
      if (next.has(pillar)) next.delete(pillar);
      else next.add(pillar);
      return next;
    });
  };

  const reset = () => {
    setPhase("input");
    setFeedback("");
    setAnalysis(null);
    setSelectedPillars(new Set());
    setUpdatedPillars([]);
    setUpdatingPillar(null);
    abortRef.current?.abort();
  };

  const severityColor = (s: string) => {
    switch (s) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "low": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const severityLabel = (s: string) => {
    switch (s) {
      case "high": return "Critique";
      case "medium": return "Modéré";
      case "low": return "Mineur";
      default: return s;
    }
  };

  // ── Render ──
  return (
    <div className="space-y-4">
      {/* Input Phase */}
      {(phase === "input" || phase === "analyzing") && (
        <>
          <div className="relative">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Décrivez ce qui a changé dans votre contexte…&#10;&#10;Exemples :&#10;• &quot;Notre budget a été réduit de 30%&quot;&#10;• &quot;On lance au Sénégal au lieu du Cameroun&quot;&#10;• &quot;Nouvelle réglementation sur la pub digitale&quot;&#10;• &quot;Le concurrent X a lancé un produit similaire&quot;"
              className="w-full min-h-[120px] rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y"
              disabled={phase === "analyzing"}
            />
            {phase === "analyzing" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {progressMessage || "Analyse en cours…"}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => void handleAnalyze()}
            disabled={phase === "analyzing" || !feedback.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Analyser les changements
          </button>
        </>
      )}

      {/* Review Phase */}
      {phase === "review" && analysis && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
            <div className="flex items-start gap-2">
              <MessageSquareText className="h-4 w-4 mt-0.5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Résumé des changements
                </p>
                <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                  {analysis.changesSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Impacted Pillars */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Piliers impactés ({analysis.impactedPillars.length})
            </p>
            <div className="space-y-2">
              {analysis.impactedPillars.map((p) => {
                const config = PILLAR_CONFIG[p.pillar as PillarType];
                const isSelected = selectedPillars.has(p.pillar);

                return (
                  <button
                    key={p.pillar}
                    onClick={() => togglePillar(p.pillar)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? "border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-900/20"
                        : "border-transparent bg-muted/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white ${
                          isSelected ? "" : "opacity-50"
                        }`}
                        style={{ backgroundColor: config?.color ?? "#6B7280" }}
                      >
                        {p.pillar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {config?.title ?? p.pillar}
                          </span>
                          <Badge className={`text-[10px] ${severityColor(p.severity)}`}>
                            {severityLabel(p.severity)}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">
                          {p.reason}
                        </p>
                      </div>
                      <div className={`h-4 w-4 rounded border-2 transition-colors ${
                        isSelected
                          ? "border-amber-500 bg-amber-500"
                          : "border-muted-foreground/30"
                      }`}>
                        {isSelected && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interview Data Updates */}
          {Object.keys(analysis.interviewDataUpdates).length > 0 && (
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Variables d&apos;entretien à mettre à jour
              </p>
              <div className="space-y-1">
                {Object.entries(analysis.interviewDataUpdates).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2 text-xs">
                    <Badge variant="outline" className="text-[10px] shrink-0">{key}</Badge>
                    <span className="text-muted-foreground truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => void handleApply()}
              disabled={selectedPillars.size === 0}
              className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Mettre à jour {selectedPillars.size} pilier{selectedPillars.size > 1 ? "s" : ""}
            </button>
            <button
              onClick={reset}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Applying Phase */}
      {phase === "applying" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            {progressMessage || "Mise à jour en cours…"}
          </div>

          <div className="space-y-1.5">
            {Array.from(selectedPillars)
              .sort((a, b) => {
                const order = ["A", "D", "V", "E", "R", "T", "I", "S"];
                return order.indexOf(a) - order.indexOf(b);
              })
              .map((p) => {
                const config = PILLAR_CONFIG[p as PillarType];
                const isDone = updatedPillars.includes(p);
                const isActive = updatingPillar === p;

                return (
                  <div
                    key={p}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                      isDone
                        ? "bg-green-50 dark:bg-green-900/10"
                        : isActive
                          ? "bg-amber-50 dark:bg-amber-900/10"
                          : "bg-muted/20"
                    }`}
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold text-white"
                      style={{ backgroundColor: config?.color ?? "#6B7280" }}
                    >
                      {p}
                    </div>
                    <span className="flex-1">{config?.title ?? p}</span>
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Done Phase */}
      {phase === "done" && (
        <div className="space-y-3">
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-800 dark:bg-green-900/10">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-200">
                  Stratégie mise à jour
                </p>
                <p className="mt-1 text-xs text-green-800 dark:text-green-300">
                  {updatedPillars.length} pilier{updatedPillars.length > 1 ? "s" : ""} régénéré{updatedPillars.length > 1 ? "s" : ""} : {updatedPillars.join(", ")}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={reset}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <RefreshCw className="mr-1 inline h-3 w-3" />
            Nouveau feedback
          </button>
        </div>
      )}
    </div>
  );
}
