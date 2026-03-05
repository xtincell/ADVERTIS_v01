// =============================================================================
// C.BRANDOS.2 — Transition Designer
// =============================================================================
// Interactive editor for the 5 superfan transitions (AUDIENCE → EVANGELIST).
// Displays and allows viewing of each transition's trigger conditions,
// key experiences, emotional shifts, touchpoints, and proof of transition.
//
// Consumes FW-11 (Experience Architecture) data.
// Used by: ARTEMIS cockpit, Brand OS detail pages
// =============================================================================

"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TransitionData {
  fromStage: string;
  toStage: string;
  triggerCondition: string;
  keyExperience: string;
  emotionalShift: string;
  proofOfTransition: string;
  touchpoints: string[];
  estimatedConversionRate?: number;
}

interface MomentOfTruth {
  id: string;
  name: string;
  stage: string;
  type: string;
  description: string;
  successCriteria: string;
  failureConsequence: string;
  touchpoint: string;
}

interface FrictionPoint {
  id: string;
  stage: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  mitigation: string;
  touchpoint: string;
}

interface TransitionDesignerProps {
  transitions: TransitionData[];
  momentsOfTruth?: MomentOfTruth[];
  frictionPoints?: FrictionPoint[];
  brandCoherenceScore?: number | null;
  className?: string;
}

// ---------------------------------------------------------------------------
// Stage label map
// ---------------------------------------------------------------------------

const STAGE_LABELS: Record<string, string> = {
  AUDIENCE: "Audience",
  FOLLOWER: "Follower",
  ENGAGED: "Engagé",
  FAN: "Fan",
  SUPERFAN: "Superfan",
  EVANGELIST: "Évangéliste",
};

const STAGE_ICONS: Record<string, string> = {
  AUDIENCE: "A",
  FOLLOWER: "F",
  ENGAGED: "E",
  FAN: "Fn",
  SUPERFAN: "SF",
  EVANGELIST: "Ev",
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransitionDesigner({
  transitions,
  momentsOfTruth = [],
  frictionPoints = [],
  brandCoherenceScore,
  className,
}: TransitionDesignerProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = transitions[selectedIdx];

  if (transitions.length === 0) {
    return (
      <Card className={cn("w-full", className)} data-slot="transition-designer">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            Aucune transition définie. Exécutez FW-11 (Experience Architecture)
            pour générer la carte de transitions.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Filter moments & frictions for selected transition's target stage
  const stageMots = momentsOfTruth.filter(
    (m) => m.stage === selected?.toStage,
  );
  const stageFrictions = frictionPoints.filter(
    (f) => f.stage === selected?.toStage,
  );

  return (
    <Card className={cn("w-full", className)} data-slot="transition-designer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Carte des Transitions
          </CardTitle>
          {brandCoherenceScore != null && (
            <Badge variant="outline" className="font-mono text-xs">
              Cohérence: {brandCoherenceScore}/100
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Transition selector — horizontal pipeline */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {transitions.map((t, idx) => {
            const fromLabel = STAGE_ICONS[t.fromStage] ?? t.fromStage;
            const toLabel = STAGE_ICONS[t.toStage] ?? t.toStage;
            const isSelected = idx === selectedIdx;
            const convRate = t.estimatedConversionRate
              ? `${Math.round(t.estimatedConversionRate * 100)}%`
              : "—";

            return (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={cn(
                  "flex items-center gap-1 rounded-lg border px-3 py-2 text-xs transition-all hover:bg-accent/50 shrink-0",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border",
                )}
              >
                <span className="font-mono font-bold">{fromLabel}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono font-bold">{toLabel}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-1 text-[10px] px-1 py-0",
                    t.estimatedConversionRate && t.estimatedConversionRate < 0.2
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : "",
                  )}
                >
                  {convRate}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Selected transition detail */}
        {selected && (
          <div className="space-y-4">
            {/* Header */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <h3 className="font-semibold text-sm mb-3">
                {STAGE_LABELS[selected.fromStage] ?? selected.fromStage}
                {" → "}
                {STAGE_LABELS[selected.toStage] ?? selected.toStage}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailField
                  label="Déclencheur"
                  value={selected.triggerCondition}
                />
                <DetailField
                  label="Expérience clé"
                  value={selected.keyExperience}
                />
                <DetailField
                  label="Cible émotionnelle"
                  value={selected.emotionalShift}
                />
                <DetailField
                  label="Preuve de transition"
                  value={selected.proofOfTransition}
                />
              </div>

              {/* Touchpoints */}
              {selected.touchpoints.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Touchpoints
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selected.touchpoints.map((tp, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        {tp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Moments of Truth for this stage */}
            {stageMots.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Moments de Vérité ({stageMots.length})
                </p>
                <div className="space-y-2">
                  {stageMots.map((mot) => (
                    <div
                      key={mot.id}
                      className="rounded-lg border p-3 text-sm space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{mot.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {mot.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {mot.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <p className="text-[10px] text-muted-foreground">
                            Succès
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            {mot.successCriteria}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">
                            Échec
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {mot.failureConsequence}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friction Points for this stage */}
            {stageFrictions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Points de Friction ({stageFrictions.length})
                </p>
                <div className="space-y-2">
                  {stageFrictions.map((fp) => (
                    <div
                      key={fp.id}
                      className="rounded-lg border p-3 text-sm space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-medium",
                            SEVERITY_COLORS[fp.severity] ?? "",
                          )}
                        >
                          {fp.severity}
                        </span>
                        <span className="text-xs">{fp.description}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Mitigation :</span>{" "}
                        {fp.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  );
}
