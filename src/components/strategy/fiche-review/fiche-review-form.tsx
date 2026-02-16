"use client";

import { useState, useCallback } from "react";
import {
  ClipboardEdit,
  Save,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Loader2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { PILLAR_CONFIG, FICHE_PILLARS } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import {
  getFicheDeMarqueSchema,
  type InterviewVariable,
  type PillarInterviewSection,
} from "~/lib/interview-schema";

interface FicheReviewFormProps {
  interviewData: Record<string, string>;
  onValidate: (editedData: Record<string, string>) => Promise<void>;
  isValidating?: boolean;
  className?: string;
}

/**
 * FicheReviewForm displays all 25 A-D-V-E variables grouped by pillar tabs.
 * The user can review and edit each value, then validate to advance to audit-r.
 */
export function FicheReviewForm({
  interviewData,
  onValidate,
  isValidating = false,
  className,
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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardEdit className="h-5 w-5 text-terracotta" />
          <h3 className="text-lg font-semibold">Validation de la Fiche de Marque</h3>
        </div>
        {totalModified > 0 && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            {totalModified} modification{totalModified > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Vérifiez et corrigez les données collectées avant de lancer l&apos;audit.
        Les champs marqués d&apos;une étoile (★) sont prioritaires.
      </p>

      {/* Pillar Tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
        {FICHE_PILLARS.map((pillarType) => {
          const config = PILLAR_CONFIG[pillarType];
          const stats = pillarStats.find((s) => s.pillarType === pillarType);
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
                  PILLAR_CONFIG[activeSection.pillarType as PillarType]?.color,
              }}
            />
            <h4 className="text-sm font-semibold">
              Pilier {activeSection.pillarType} — {activeSection.title}
            </h4>
          </div>

          {activeSection.variables.map((variable) => (
            <VariableField
              key={variable.id}
              variable={variable}
              value={editedData[variable.id] ?? ""}
              isModified={modifiedFields.has(variable.id)}
              isCollapsed={collapsedVars.has(variable.id)}
              onChange={(v) => handleFieldChange(variable.id, v)}
              onToggleCollapse={() => toggleCollapse(variable.id)}
            />
          ))}
        </div>
      )}

      {/* Validate button */}
      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          {pillarStats.reduce((sum, s) => sum + s.filled, 0)} /{" "}
          {pillarStats.reduce((sum, s) => sum + s.total, 0)} variables renseignées
        </p>

        <button
          onClick={handleValidate}
          disabled={isValidating}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all",
            isValidating
              ? "bg-terracotta/50 cursor-not-allowed"
              : "bg-terracotta hover:bg-terracotta/90 shadow-sm",
          )}
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Validation en cours…
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
  isCollapsed: boolean;
  onChange: (value: string) => void;
  onToggleCollapse: () => void;
}

function VariableField({
  variable,
  value,
  isModified,
  isCollapsed,
  onChange,
  onToggleCollapse,
}: VariableFieldProps) {
  const isEmpty = !value?.trim();

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all",
        isModified && "border-amber-300 bg-amber-50/30",
        isEmpty && !isModified && "border-dashed border-muted opacity-70",
      )}
    >
      {/* Header row */}
      <button
        onClick={onToggleCollapse}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-muted-foreground">
            {variable.id}
          </span>
          <span className="text-sm font-medium">{variable.label}</span>
          {variable.priority && (
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          )}
          {isModified && (
            <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
              modifié
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
          <p className="text-xs text-muted-foreground">{variable.description}</p>
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
            )}
          />
        </div>
      )}
    </div>
  );
}
