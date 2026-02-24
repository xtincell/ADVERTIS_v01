// ==========================================================================
// C.O5 — Intervention Panel
// Team intervention tracker.
// ==========================================================================

"use client";

/**
 * InterventionPanel — Intervention request management for ADMIN/OPERATOR.
 * Shows pending interventions with triage/resolve actions.
 */

import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, Clock, Filter, Radio } from "lucide-react";
import { api } from "~/trpc/react";
import {
  INTERVENTION_TYPE_LABELS,
  PILLAR_CONFIG,
  PILLAR_TYPES,
  type InterventionType,
  type PillarType,
} from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

export function InterventionPanel() {
  const { data: interventions, isLoading } =
    api.intervention.getPending.useQuery();
  const utils = api.useUtils();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [createSignal, setCreateSignal] = useState(false);
  const [signalPillar, setSignalPillar] = useState<PillarType>("A");

  const triageMutation = api.intervention.triage.useMutation({
    onSuccess: () => void utils.intervention.getPending.invalidate(),
  });
  const resolveMutation = api.intervention.resolve.useMutation({
    onSuccess: () => {
      setResolvingId(null);
      setResolution("");
      setCreateSignal(false);
      void utils.intervention.getPending.invalidate();
    },
  });
  const rejectMutation = api.intervention.reject.useMutation({
    onSuccess: () => {
      setResolvingId(null);
      setResolution("");
      setCreateSignal(false);
      void utils.intervention.getPending.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Interventions</h2>
          <Badge variant="secondary">{interventions?.length ?? 0}</Badge>
        </div>
      </div>

      {(!interventions || interventions.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aucune intervention en attente.
          </CardContent>
        </Card>
      )}

      {interventions?.map((intervention) => (
        <Card
          key={intervention.id}
          className={
            intervention.priority === "P0" ? "border-red-200" : ""
          }
        >
          <CardContent className="space-y-3 py-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {intervention.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      intervention.priority === "P0"
                        ? "border-red-300 text-red-600"
                        : intervention.priority === "P1"
                          ? "border-amber-300 text-amber-600"
                          : ""
                    }`}
                  >
                    {intervention.priority}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {INTERVENTION_TYPE_LABELS[
                    intervention.type as InterventionType
                  ] ?? intervention.type}{" "}
                  —{" "}
                  {new Date(intervention.createdAt).toLocaleDateString("fr-FR")}
                </div>
                {intervention.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {intervention.description}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  intervention.status === "OPEN"
                    ? "border-red-300 text-red-600"
                    : intervention.status === "TRIAGED"
                      ? "border-amber-300 text-amber-600"
                      : "border-blue-300 text-blue-600"
                }`}
              >
                {intervention.status}
              </Badge>
            </div>

            {/* Resolve Form */}
            {resolvingId === intervention.id ? (
              <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Résolution..."
                  rows={2}
                />
                {/* Signal creation toggle */}
                {intervention.strategyId && (
                  <div className="space-y-2 rounded border bg-background/50 p-2">
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={createSignal}
                        onChange={(e) => setCreateSignal(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Radio className="h-3 w-3 text-blue-500" />
                      Créer un signal dans le SIS
                    </label>
                    {createSignal && (
                      <select
                        value={signalPillar}
                        onChange={(e) =>
                          setSignalPillar(e.target.value as PillarType)
                        }
                        className="w-full rounded border border-gray-200 bg-background px-2 py-1 text-xs"
                      >
                        {PILLAR_TYPES.map((p) => (
                          <option key={p} value={p}>
                            {p} — {PILLAR_CONFIG[p].title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={!resolution || resolveMutation.isPending}
                    onClick={() =>
                      resolveMutation.mutate({
                        id: intervention.id,
                        resolution,
                        createSignal: createSignal || undefined,
                        signalPillar: createSignal ? signalPillar : undefined,
                      })
                    }
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Résoudre
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={!resolution || rejectMutation.isPending}
                    onClick={() =>
                      rejectMutation.mutate({
                        id: intervention.id,
                        reason: resolution,
                      })
                    }
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Rejeter
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setResolvingId(null)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                {intervention.status === "OPEN" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      triageMutation.mutate({ id: intervention.id })
                    }
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    Trier
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setResolvingId(intervention.id)}
                >
                  Résoudre / Rejeter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
