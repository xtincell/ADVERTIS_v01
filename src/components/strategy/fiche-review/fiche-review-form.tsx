// =============================================================================
// COMPONENT C.S11 — Fiche Review Form (Enhanced)
// =============================================================================
// Interview data review/edit form for validating the Fiche de Marque.
// Props: strategyId, interviewData, onValidate, isValidating, className,
//   pillarContents (optional ADVE pillar data), riskData/trackData (optional).
// Key features: displays all 25 A-D-V-E interview variables grouped by pillar
// tabs with filled/total counters, collapsible VariableField sub-components
// with textarea editing, priority star indicators, modification tracking with
// amber highlights, AI auto-fill via POST /api/ai/fill-interview for empty
// variables with violet highlight, merge logic respecting user edits,
// validate button to advance to audit-r phase, schema-driven from
// getFicheDeMarqueSchema().
// NEW: Mode toggle for "Variables" vs "Contenu ADVE" editing,
//   R+T audit recommendations panel when audit data is available.
// =============================================================================

"use client";

import { useState, useCallback } from "react";
import {
  ClipboardEdit,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Loader2,
  Sparkles,
  Lightbulb,
  Check,
  X,
  FileEdit,
  ToggleLeft,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { PILLAR_CONFIG, FICHE_PILLARS } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import {
  getFicheDeMarqueSchema,
  type InterviewVariable,
} from "~/lib/interview-schema";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PillarContentEntry {
  type: string;
  content: unknown;
}

interface AuditSuggestion {
  pillarType: string;
  field: string;
  fieldLabel: string;
  currentValue: string;
  suggestedValue: string;
  reason: string;
}

interface FicheReviewFormProps {
  strategyId: string;
  interviewData: Record<string, string>;
  onValidate: (editedData: Record<string, string>) => Promise<void>;
  isValidating?: boolean;
  className?: string;
  /** Optional: ADVE pillar content for structured editing */
  pillarContents?: PillarContentEntry[];
  /** Optional: Risk audit data (enables R+T recommendations when present) */
  riskData?: unknown | null;
  /** Optional: Track audit data (enables R+T recommendations when present) */
  trackData?: unknown | null;
}

type EditMode = "variables" | "content";

/**
 * FicheReviewForm displays all 25 A-D-V-E variables grouped by pillar tabs.
 * The user can review and edit each value, then validate to advance to audit-r.
 * Includes AI auto-fill for empty variables.
 * Enhanced: pillar content editing + R+T recommendations when available.
 */
export function FicheReviewForm({
  strategyId,
  interviewData,
  onValidate,
  isValidating = false,
  className,
  pillarContents,
  riskData,
  trackData,
}: FicheReviewFormProps) {
  const schema = getFicheDeMarqueSchema();

  // Local editable copy of interview data
  const [editedData, setEditedData] = useState<Record<string, string>>({
    ...interviewData,
  });

  // Track which pillar tab is active
  const [activeTab, setActiveTab] = useState<PillarType>("A");

  // Track which variables have been modified
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

  // Track collapsed sections
  const [collapsedVars, setCollapsedVars] = useState<Set<string>>(new Set());

  // Track AI auto-filled variables
  const [autoFilledIds, setAutoFilledIds] = useState<Set<string>>(new Set());

  // AI fill loading state
  const [isAiFilling, setIsAiFilling] = useState(false);

  // Edit mode toggle: "variables" (interview data) or "content" (pillar content)
  const [editMode, setEditMode] = useState<EditMode>("variables");

  // Pillar content editing state (JSON text per pillar)
  const [editedPillarContent, setEditedPillarContent] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    if (pillarContents) {
      for (const p of pillarContents) {
        initial[p.type] =
          typeof p.content === "string"
            ? p.content
            : JSON.stringify(p.content, null, 2);
      }
    }
    return initial;
  });
  const [modifiedPillarContent, setModifiedPillarContent] = useState<
    Set<string>
  >(new Set());

  // R+T Recommendations state
  const [showRecos, setShowRecos] = useState(false);
  const [suggestions, setSuggestions] = useState<AuditSuggestion[]>([]);
  const [isFetchingRecos, setIsFetchingRecos] = useState(false);
  const [recosFetched, setRecosFetched] = useState(false);

  const hasAuditData = !!(riskData && trackData);

  const handleFieldChange = useCallback(
    (variableId: string, value: string) => {
      setEditedData((prev) => ({ ...prev, [variableId]: value }));
      setModifiedFields((prev) => {
        const next = new Set(prev);
        if (value !== (interviewData[variableId] ?? "")) {
          next.add(variableId);
        } else {
          next.delete(variableId);
        }
        return next;
      });
    },
    [interviewData],
  );

  const handlePillarContentChange = useCallback(
    (pillarType: string, value: string) => {
      setEditedPillarContent((prev) => ({ ...prev, [pillarType]: value }));
      setModifiedPillarContent((prev) => {
        const next = new Set(prev);
        next.add(pillarType);
        return next;
      });
    },
    [],
  );

  const toggleCollapse = useCallback((variableId: string) => {
    setCollapsedVars((prev) => {
      const next = new Set(prev);
      if (next.has(variableId)) {
        next.delete(variableId);
      } else {
        next.add(variableId);
      }
      return next;
    });
  }, []);

  const handleValidate = async () => {
    await onValidate(editedData);
  };

  // --- AI Fill handler ---
  const handleAiFill = useCallback(async () => {
    setIsAiFilling(true);
    try {
      const response = await fetch("/api/ai/fill-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "Erreur serveur");
      }

      const result = (await response.json()) as {
        filledData: Record<string, string>;
        autoFilledIds: string[];
        totalFilled: number;
      };

      // Merge: keep user edits, only fill variables that are still empty in editedData
      setEditedData((prev) => {
        const merged = { ...prev };
        for (const id of result.autoFilledIds) {
          if (!merged[id]?.trim() && result.filledData[id]?.trim()) {
            merged[id] = result.filledData[id]!;
          }
        }
        return merged;
      });

      setAutoFilledIds((prev) => {
        const next = new Set(prev);
        for (const id of result.autoFilledIds) {
          next.add(id);
        }
        return next;
      });

      setCollapsedVars((prev) => {
        const next = new Set(prev);
        for (const id of result.autoFilledIds) {
          next.delete(id);
        }
        return next;
      });

      toast.success(
        `${result.autoFilledIds.length} variable${result.autoFilledIds.length > 1 ? "s" : ""} compl\u00e9t\u00e9e${result.autoFilledIds.length > 1 ? "s" : ""} par l'IA`,
      );
    } catch (error) {
      console.error("[FicheReview] AI fill failed:", error);
      toast.error("Erreur lors de la compl\u00e9tion IA. R\u00e9essayez.");
    } finally {
      setIsAiFilling(false);
    }
  }, [strategyId]);

  // --- Fetch R+T recommendations ---
  const handleFetchRecos = useCallback(async () => {
    if (!hasAuditData) return;
    setIsFetchingRecos(true);
    try {
      const response = await fetch("/api/ai/audit-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la r\u00e9cup\u00e9ration des recommandations");
      }

      const data = (await response.json()) as {
        suggestions: AuditSuggestion[];
      };

      // Filter to ADVE pillars only
      const adveSuggestions = (data.suggestions ?? []).filter((s) =>
        ["A", "D", "V", "E"].includes(s.pillarType),
      );
      setSuggestions(adveSuggestions);
      setRecosFetched(true);
      setShowRecos(true);

      if (adveSuggestions.length === 0) {
        toast.info("Aucune recommandation ADVE trouv\u00e9e dans les audits R+T.");
      } else {
        toast.success(
          `${adveSuggestions.length} recommandation${adveSuggestions.length > 1 ? "s" : ""} ADVE trouv\u00e9e${adveSuggestions.length > 1 ? "s" : ""}`,
        );
      }
    } catch (error) {
      console.error("[FicheReview] Fetch recos failed:", error);
      toast.error("Erreur lors de la r\u00e9cup\u00e9ration des recommandations.");
    } finally {
      setIsFetchingRecos(false);
    }
  }, [strategyId, hasAuditData]);

  // Apply a suggestion to the interview data
  const handleAcceptSuggestion = useCallback(
    (suggestion: AuditSuggestion) => {
      // Try to match suggestion field to an interview variable ID
      // The field path is like "identite.archetype" — we need to find the matching variable
      // For now, we apply to the most relevant variable based on pillarType
      const variablePrefix = suggestion.pillarType;
      const matchingVarIds = Object.keys(editedData).filter((id) =>
        id.startsWith(variablePrefix),
      );

      if (matchingVarIds.length > 0) {
        // Find the best match based on the field label
        const bestMatch = matchingVarIds[0]!;
        setEditedData((prev) => ({
          ...prev,
          [bestMatch]: suggestion.suggestedValue,
        }));
        setModifiedFields((prev) => {
          const next = new Set(prev);
          next.add(bestMatch);
          return next;
        });
        toast.success(`Suggestion appliqu\u00e9e \u00e0 ${bestMatch}`);
      }

      // Remove from list
      setSuggestions((prev) => prev.filter((s) => s !== suggestion));
    },
    [editedData],
  );

  const handleDismissSuggestion = useCallback(
    (suggestion: AuditSuggestion) => {
      setSuggestions((prev) => prev.filter((s) => s !== suggestion));
    },
    [],
  );

  const activeSection = schema.find((s) => s.pillarType === activeTab);
  const totalModified = modifiedFields.size;

  // Count filled/total per pillar
  const pillarStats = schema.map((section) => {
    const filled = section.variables.filter(
      (v) => editedData[v.id]?.trim(),
    ).length;
    return {
      pillarType: section.pillarType as PillarType,
      filled,
      total: section.variables.length,
    };
  });

  const totalFilled = pillarStats.reduce((sum, s) => sum + s.filled, 0);
  const totalVars = pillarStats.reduce((sum, s) => sum + s.total, 0);
  const hasEmptyVars = totalFilled < totalVars;
  const hasPillarContent =
    pillarContents && pillarContents.some((p) => p.content != null);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardEdit className="h-5 w-5 text-terracotta" />
          <h3 className="text-lg font-semibold">
            Validation de la Fiche de Marque
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {totalModified > 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              {totalModified} modification{totalModified > 1 ? "s" : ""}
            </span>
          )}
          {modifiedPillarContent.size > 0 && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {modifiedPillarContent.size} pilier
              {modifiedPillarContent.size > 1 ? "s" : ""} modifi\u00e9
              {modifiedPillarContent.size > 1 ? "s" : ""}
            </span>
          )}
          {autoFilledIds.size > 0 && (
            <span className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
              {autoFilledIds.size} par IA
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        V\u00e9rifiez et corrigez les donn\u00e9es collect\u00e9es avant de lancer l&apos;audit.
        Les champs marqu\u00e9s d&apos;une \u00e9toile (\u2605) sont prioritaires.
      </p>

      {/* Mode Toggle: Variables vs Content */}
      {hasPillarContent && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-1">
          <button
            onClick={() => setEditMode("variables")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
              editMode === "variables"
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50",
            )}
          >
            <ToggleLeft className="h-3.5 w-3.5" />
            Variables d&apos;interview
          </button>
          <button
            onClick={() => setEditMode("content")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
              editMode === "content"
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50",
            )}
          >
            <FileEdit className="h-3.5 w-3.5" />
            Contenu ADVE g\u00e9n\u00e9r\u00e9
          </button>
        </div>
      )}

      {/* R+T Recommendations banner (when audit data is available) */}
      {hasAuditData && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">
                Recommandations R+T disponibles
              </span>
              {recosFetched && suggestions.length > 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  {suggestions.length} suggestion
                  {suggestions.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                if (!recosFetched) {
                  void handleFetchRecos();
                } else {
                  setShowRecos(!showRecos);
                }
              }}
              disabled={isFetchingRecos}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-50"
            >
              {isFetchingRecos ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Analyse en cours\u2026
                </>
              ) : recosFetched ? (
                showRecos ? (
                  "Masquer"
                ) : (
                  "Afficher"
                )
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  Charger les recommandations
                </>
              )}
            </button>
          </div>

          {/* Suggestions list */}
          {showRecos && suggestions.length > 0 && (
            <div className="mt-3 space-y-2">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-emerald-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {suggestion.pillarType}
                        </span>
                        <span className="text-sm font-medium truncate">
                          {suggestion.fieldLabel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {suggestion.reason}
                      </p>
                      <div className="text-xs">
                        <span className="text-muted-foreground">
                          Suggestion :{" "}
                        </span>
                        <span className="text-emerald-700">
                          {suggestion.suggestedValue.length > 150
                            ? suggestion.suggestedValue.slice(0, 150) + "\u2026"
                            : suggestion.suggestedValue}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleAcceptSuggestion(suggestion)}
                        className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Accepter"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDismissSuggestion(suggestion)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                        title="Ignorer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showRecos && recosFetched && suggestions.length === 0 && (
            <p className="mt-2 text-xs text-emerald-600">
              Toutes les recommandations ont \u00e9t\u00e9 trait\u00e9es.
            </p>
          )}
        </div>
      )}

      {editMode === "variables" ? (
        <>
          {/* AI Fill Button — only when there are empty vars */}
          {hasEmptyVars && (
            <button
              onClick={handleAiFill}
              disabled={isAiFilling || isValidating}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm font-medium transition-all",
                isAiFilling
                  ? "border-violet-300 bg-violet-50 text-violet-500 cursor-wait"
                  : "border-violet-300 bg-violet-50/50 text-violet-700 hover:bg-violet-100 hover:border-violet-400",
              )}
            >
              {isAiFilling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Compl\u00e9tion IA en cours\u2026 ({totalVars - totalFilled} variable
                  {totalVars - totalFilled > 1 ? "s" : ""})
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Compl\u00e9ter les {totalVars - totalFilled} champ
                  {totalVars - totalFilled > 1 ? "s" : ""} vide
                  {totalVars - totalFilled > 1 ? "s" : ""} avec l&apos;IA
                </>
              )}
            </button>
          )}

          {/* Pillar Tabs */}
          <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
            {FICHE_PILLARS.map((pillarType) => {
              const config = PILLAR_CONFIG[pillarType];
              const stats = pillarStats.find(
                (s) => s.pillarType === pillarType,
              );
              const isActive = activeTab === pillarType;

              return (
                <button
                  key={pillarType}
                  onClick={() => setActiveTab(pillarType)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50",
                  )}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span>{pillarType}</span>
                    <span className="text-xs text-muted-foreground">
                      ({stats?.filled ?? 0}/{stats?.total ?? 0})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active pillar section */}
          {activeSection && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      PILLAR_CONFIG[activeSection.pillarType as PillarType]
                        ?.color,
                  }}
                />
                <h4 className="text-sm font-semibold">
                  Pilier {activeSection.pillarType} \u2014{" "}
                  {activeSection.title}
                </h4>
              </div>

              {activeSection.variables.map((variable) => (
                <VariableField
                  key={variable.id}
                  variable={variable}
                  value={editedData[variable.id] ?? ""}
                  isModified={modifiedFields.has(variable.id)}
                  isAutoFilled={autoFilledIds.has(variable.id)}
                  isCollapsed={collapsedVars.has(variable.id)}
                  onChange={(v) => handleFieldChange(variable.id, v)}
                  onToggleCollapse={() => toggleCollapse(variable.id)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Pillar Content Editing Mode */
        <div className="space-y-4">
          {/* Pillar Tabs (same tabs, different content) */}
          <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
            {FICHE_PILLARS.map((pillarType) => {
              const config = PILLAR_CONFIG[pillarType];
              const isActive = activeTab === pillarType;
              const isModified = modifiedPillarContent.has(pillarType);

              return (
                <button
                  key={pillarType}
                  onClick={() => setActiveTab(pillarType)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50",
                  )}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span>{pillarType}</span>
                    {isModified && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pillar content editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: PILLAR_CONFIG[activeTab]?.color,
                  }}
                />
                <h4 className="text-sm font-semibold">
                  Contenu du Pilier {activeTab} \u2014{" "}
                  {PILLAR_CONFIG[activeTab]?.title}
                </h4>
              </div>
              {modifiedPillarContent.has(activeTab) && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  modifi\u00e9
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground px-1">
              \u00c9ditez le contenu g\u00e9n\u00e9r\u00e9 du pilier. Format JSON structur\u00e9.
            </p>

            {editedPillarContent[activeTab] ? (
              <textarea
                value={editedPillarContent[activeTab] ?? ""}
                onChange={(e) =>
                  handlePillarContentChange(activeTab, e.target.value)
                }
                rows={20}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 text-xs font-mono",
                  "placeholder:text-muted-foreground/50",
                  "focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta",
                  "resize-y min-h-[300px]",
                  modifiedPillarContent.has(activeTab) &&
                    "border-amber-300 bg-amber-50/20",
                )}
              />
            ) : (
              <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center">
                <FileEdit className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucun contenu g\u00e9n\u00e9r\u00e9 pour ce pilier.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  G\u00e9n\u00e9rez d&apos;abord la fiche de marque (A-D-V-E) dans le
                  pipeline.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validate button */}
      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          {totalFilled} / {totalVars} variables renseign\u00e9es
        </p>

        <button
          onClick={handleValidate}
          disabled={isValidating || isAiFilling}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all",
            isValidating || isAiFilling
              ? "bg-terracotta/50 cursor-not-allowed"
              : "bg-terracotta hover:bg-terracotta/90 shadow-sm",
          )}
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Validation en cours\u2026
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Valider la fiche et lancer l&apos;audit
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Variable Field sub-component
// ---------------------------------------------------------------------------

interface VariableFieldProps {
  variable: InterviewVariable;
  value: string;
  isModified: boolean;
  isAutoFilled: boolean;
  isCollapsed: boolean;
  onChange: (value: string) => void;
  onToggleCollapse: () => void;
}

function VariableField({
  variable,
  value,
  isModified,
  isAutoFilled,
  isCollapsed,
  onChange,
  onToggleCollapse,
}: VariableFieldProps) {
  const isEmpty = !value?.trim();

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all",
        isAutoFilled && !isModified && "border-violet-300 bg-violet-50/30",
        isModified && "border-amber-300 bg-amber-50/30",
        isEmpty &&
          !isModified &&
          !isAutoFilled &&
          "border-dashed border-muted opacity-70",
      )}
    >
      {/* Header row */}
      <button
        onClick={onToggleCollapse}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold text-muted-foreground">
            {variable.id}
          </span>
          <span className="text-sm font-medium">{variable.label}</span>
          {variable.priority && (
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          )}
          {isAutoFilled && !isModified && (
            <span className="inline-flex items-center gap-1 text-xs text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded">
              <Sparkles className="h-2.5 w-2.5" />
              IA
            </span>
          )}
          {isModified && (
            <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
              modifi\u00e9
            </span>
          )}
          {isEmpty && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              vide
            </span>
          )}
        </div>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content (collapsible) */}
      {!isCollapsed && (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-muted-foreground">
            {variable.description}
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={variable.placeholder}
            rows={Math.max(3, Math.ceil((value?.length ?? 0) / 80))}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta",
              "resize-y min-h-[72px]",
              isAutoFilled &&
                !isModified &&
                "border-violet-200 focus:ring-violet-300 focus:border-violet-400",
            )}
          />
        </div>
      )}
    </div>
  );
}
