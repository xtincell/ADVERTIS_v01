// =============================================================================
// C.BRANDOS.P10.2 — Methodology Browser
// =============================================================================
// Browse and inspect the 4 creative methods from FW-22 (Creative Methodology).
// Displays method cards in a grid with a selectable detail panel showing
// step-by-step process, inputs/outputs, anti-patterns, and GLORY tools served.
//
// Consumes FW-22 (Creative Methodology) data.
// Used by: ARTEMIS cockpit, Brand OS creative pages
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProcessStep {
  step: number;
  action: string;
  duration: string;
}

interface MethodData {
  id: string;
  name: string;
  type: string;
  description: string;
  inputs: string[];
  process: ProcessStep[];
  outputs: string[];
  antiPatterns: string[];
  gloryToolsServed: string[];
}

interface MethodologyBrowserProps {
  methods: MethodData[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Type badge colors
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<string, string> = {
  DIVERGENT: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  CONVERGENT: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  ITERATIVE: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  GENERATIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MethodologyBrowser({
  methods,
  className,
}: MethodologyBrowserProps) {
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(
    methods[0]?.id ?? null,
  );

  const selectedMethod = methods.find((m) => m.id === selectedMethodId);

  if (methods.length === 0) {
    return (
      <Card className={cn("w-full", className)} data-slot="methodology-browser">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            Aucune méthode définie. Exécutez FW-22 (Creative Methodology)
            pour générer les méthodes créatives.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)} data-slot="methodology-browser">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Méthodes Créatives
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {methods.length} méthode{methods.length > 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Method card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {methods.map((method) => {
            const isSelected = method.id === selectedMethodId;
            const typeColor = TYPE_COLORS[method.type] ?? "";

            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethodId(method.id)}
                className={cn(
                  "flex flex-col items-start rounded-lg border p-4 text-left transition-all hover:shadow-sm",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:bg-accent/50",
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-medium text-sm">{method.name}</span>
                  <Badge
                    variant="secondary"
                    className={cn("text-[10px] px-1.5 py-0", typeColor)}
                  >
                    {method.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {method.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span>{method.process.length} étapes</span>
                  <span>{method.outputs.length} sorties</span>
                  <span>{method.gloryToolsServed.length} outils GLORY</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected method detail */}
        {selectedMethod && (
          <div className="space-y-4">
            {/* Step-by-step process */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Processus ({selectedMethod.process.length} étapes)
              </p>
              <div className="space-y-2">
                {selectedMethod.process.map((step) => (
                  <div
                    key={step.step}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-bold">
                      {step.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{step.action}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Durée : {step.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inputs & Outputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Inputs */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                  Entrées
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedMethod.inputs.map((input, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      {input}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Outputs */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                  Sorties
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedMethod.outputs.map((output, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {output}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Anti-patterns */}
            {selectedMethod.antiPatterns.length > 0 && (
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30 p-3">
                <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-2">
                  Anti-patterns
                </p>
                <div className="space-y-1">
                  {selectedMethod.antiPatterns.map((ap, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-red-400 shrink-0">!</span>
                      <span className="text-red-700 dark:text-red-300">{ap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GLORY tools served */}
            {selectedMethod.gloryToolsServed.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                  Outils GLORY servis
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedMethod.gloryToolsServed.map((tool, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div>
                          <Badge
                            variant="outline"
                            className="text-[10px] cursor-default"
                          >
                            {tool}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">Outil GLORY : {tool}</p>
                      </TooltipContent>
                    </Tooltip>
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
