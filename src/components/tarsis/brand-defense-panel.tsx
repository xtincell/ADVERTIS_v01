// =============================================================================
// C.TARSIS.P11.2 — Brand Defense Panel
// =============================================================================
// Defense protocol dashboard for FW-17 Brand Defense data. Displays threat
// map with severity coding, community defense metrics, enemy-as-fuel
// strategy, and collapsible crisis narrative scenarios.
//
// Consumes FW-17 (Brand Defense) data.
// Used by: ARTEMIS cockpit, TARSIS defense pages
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

interface Threat {
  id: string;
  type: string;
  name: string;
  description: string;
  severity: string;
  probability: number;
  impact: string;
  mitigation: string;
  detectionSignals: string[];
}

interface AgentSegment {
  segment: string;
  count: number;
  activationRate: number;
}

interface CommunityDefense {
  agentsBySegment: AgentSegment[];
  brandDefenseRate: number;
  mobilizationProtocol: string[];
  responseTimeTarget: string;
}

interface CrisisNarrative {
  id: string;
  scenarioName: string;
  triggerEvent: string;
  narrativeResponse: string;
  keyMessages: string[];
  spokesperson: string;
  channels: string[];
  timeline: string;
}

interface EnemyAsFuel {
  existentialEnemy: string;
  fuelMechanism: string;
  communityRallyPoints: string[];
  contentOpportunities: string[];
  competitiveAdvantage: string;
}

interface BrandDefensePanelProps {
  threatMap: Threat[];
  communityDefense: CommunityDefense;
  crisisNarrative: CrisisNarrative[];
  enemyAsFuel: EnemyAsFuel;
  className?: string;
}

// ---------------------------------------------------------------------------
// Severity color mapping
// ---------------------------------------------------------------------------

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const SEVERITY_BAR: Record<string, string> = {
  LOW: "bg-emerald-500 dark:bg-emerald-400",
  MEDIUM: "bg-amber-500 dark:bg-amber-400",
  HIGH: "bg-orange-500 dark:bg-orange-400",
  CRITICAL: "bg-red-500 dark:bg-red-400",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function activationBarColor(rate: number): string {
  if (rate >= 70) return "bg-emerald-500 dark:bg-emerald-400";
  if (rate >= 40) return "bg-amber-500 dark:bg-amber-400";
  return "bg-red-500 dark:bg-red-400";
}

function defenseRateVariant(rate: number): "default" | "secondary" | "destructive" {
  if (rate >= 70) return "default";
  if (rate >= 40) return "secondary";
  return "destructive";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BrandDefensePanel({
  threatMap,
  communityDefense,
  crisisNarrative,
  enemyAsFuel,
  className,
}: BrandDefensePanelProps) {
  const [selectedThreatId, setSelectedThreatId] = useState<string | null>(null);
  const [expandedCrisisId, setExpandedCrisisId] = useState<string | null>(null);

  return (
    <Card className={cn("w-full", className)} data-slot="brand-defense-panel">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Protocole de Défense
          </CardTitle>
          <Badge
            variant={defenseRateVariant(communityDefense.brandDefenseRate)}
            className="font-mono text-xs"
          >
            {communityDefense.brandDefenseRate}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Threat Map ── */}
        {threatMap.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Carte des menaces ({threatMap.length})
            </p>

            <div className="space-y-2">
              {threatMap.map((threat) => {
                const isSelected = threat.id === selectedThreatId;
                const severityColor = SEVERITY_COLORS[threat.severity] ?? "";
                const barColor = SEVERITY_BAR[threat.severity] ?? "bg-slate-400";

                return (
                  <button
                    key={threat.id}
                    onClick={() =>
                      setSelectedThreatId(isSelected ? null : threat.id)
                    }
                    className={cn(
                      "flex flex-col w-full rounded-lg border p-3 text-left transition-all hover:shadow-sm",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:bg-accent/50",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="secondary"
                        className={cn("text-[10px] px-1.5 py-0", severityColor)}
                      >
                        {threat.severity}
                      </Badge>
                      <span className="font-medium text-sm">{threat.name}</span>
                      <Badge variant="outline" className="text-[10px] ml-auto">
                        {threat.type}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      {threat.description}
                    </p>

                    {/* Probability bar */}
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          Probabilité
                        </span>
                        <span className="font-mono text-[10px] font-semibold">
                          {Math.round(threat.probability * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full transition-all", barColor)}
                          style={{ width: `${threat.probability * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Impact */}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      <span className="font-medium">Impact :</span> {threat.impact}
                    </p>

                    {/* Expanded mitigation & signals */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t w-full space-y-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            Mitigation
                          </p>
                          <p className="text-xs">{threat.mitigation}</p>
                        </div>

                        {threat.detectionSignals.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                              Signaux de détection
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {threat.detectionSignals.map((signal, i) => (
                                <Badge key={i} variant="outline" className="text-[10px]">
                                  {signal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Community Defense ── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Défense communautaire
          </p>

          {/* Agents by segment with activation rate bars */}
          {communityDefense.agentsBySegment.length > 0 && (
            <div className="space-y-2 mb-3">
              {communityDefense.agentsBySegment.map((seg, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{seg.segment}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {seg.count} agents
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold">
                      {seg.activationRate}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all", activationBarColor(seg.activationRate))}
                      style={{ width: `${seg.activationRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Response time target */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Temps de réponse cible :</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {communityDefense.responseTimeTarget}
            </Badge>
          </div>

          {/* Mobilization protocol */}
          {communityDefense.mobilizationProtocol.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Protocole de mobilisation
              </p>
              <div className="space-y-0.5">
                {communityDefense.mobilizationProtocol.map((step, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    {i + 1}. {step}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Enemy as Fuel ── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Ennemi comme carburant
          </p>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            {/* Enemy name prominent */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Ennemi existentiel
              </p>
              <p className="text-lg font-bold mt-0.5">
                {enemyAsFuel.existentialEnemy}
              </p>
            </div>

            {/* Fuel mechanism */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Mécanisme
              </p>
              <p className="text-sm mt-0.5">{enemyAsFuel.fuelMechanism}</p>
            </div>

            {/* Rally points as badges */}
            {enemyAsFuel.communityRallyPoints.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                  Points de ralliement
                </p>
                <div className="flex flex-wrap gap-1">
                  {enemyAsFuel.communityRallyPoints.map((point, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Content opportunities */}
            {enemyAsFuel.contentOpportunities.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Opportunités de contenu
                </p>
                <div className="space-y-0.5">
                  {enemyAsFuel.contentOpportunities.map((opp, i) => (
                    <p key={i} className="text-xs">
                      {i + 1}. {opp}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive advantage */}
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Avantage concurrentiel :</span>{" "}
              {enemyAsFuel.competitiveAdvantage}
            </p>
          </div>
        </div>

        {/* ── Crisis Scenarios ── */}
        {crisisNarrative.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Scénarios de crise ({crisisNarrative.length})
            </p>

            <div className="space-y-2">
              {crisisNarrative.map((scenario) => {
                const isExpanded = scenario.id === expandedCrisisId;

                return (
                  <button
                    key={scenario.id}
                    onClick={() =>
                      setExpandedCrisisId(isExpanded ? null : scenario.id)
                    }
                    className={cn(
                      "flex flex-col w-full rounded-lg border p-3 text-left transition-all hover:shadow-sm",
                      isExpanded
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:bg-accent/50",
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">
                        {scenario.scenarioName}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {scenario.timeline}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Déclencheur :</span>{" "}
                      {scenario.triggerEvent}
                    </p>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t w-full space-y-3">
                        {/* Narrative response */}
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            Réponse narrative
                          </p>
                          <p className="text-xs">{scenario.narrativeResponse}</p>
                        </div>

                        {/* Key messages */}
                        {scenario.keyMessages.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                              Messages clés
                            </p>
                            <div className="space-y-0.5">
                              {scenario.keyMessages.map((msg, i) => (
                                <p key={i} className="text-xs">
                                  {i + 1}. {msg}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Spokesperson */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            Porte-parole :
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {scenario.spokesperson}
                          </Badge>
                        </div>

                        {/* Channels */}
                        {scenario.channels.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                              Canaux
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {scenario.channels.map((ch, i) => (
                                <Badge key={i} variant="outline" className="text-[10px]">
                                  {ch}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
