// ==========================================================================
// PAGE P.C3 — Client Intervention Requests
// Intervention requests page for clients. Shows existing requests and a
// "Nouvelle demande" button (wired to C.O4 ClientPortal patterns).
// ==========================================================================

"use client";

import { useState } from "react";
import {
  MessageSquarePlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

import { api } from "~/trpc/react";
import {
  INTERVENTION_TYPE_LABELS,
  type InterventionType,
} from "~/lib/constants";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

export default function ClientRequestsPage() {
  const {
    data: interventions,
    isLoading,
    error,
  } = api.intervention.getMine.useQuery();

  const utils = api.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<InterventionType>("CONTENT_UPDATE");

  const createMutation = api.intervention.create.useMutation({
    onSuccess: () => {
      setShowForm(false);
      setTitle("");
      setDescription("");
      void utils.intervention.getMine.invalidate();
    },
  });

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="h-8 w-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">
          Erreur lors du chargement de vos demandes.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Status rendering helper
  // ---------------------------------------------------------------------------
  function getStatusBadge(status: string) {
    switch (status) {
      case "RESOLVED":
        return (
          <Badge
            variant="outline"
            className="border-emerald-300 text-emerald-600"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Résolu
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="border-red-300 text-red-600"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Rejeté
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge
            variant="outline"
            className="border-amber-300 text-amber-600"
          >
            <Clock className="mr-1 h-3 w-3" />
            En cours
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        );
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Mes Demandes</h1>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          <MessageSquarePlus className="mr-1 h-4 w-4" />
          Nouvelle demande
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardContent className="space-y-3 pt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InterventionType)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {Object.entries(INTERVENTION_TYPE_LABELS).map(
                  ([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Objet</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Objet de la demande..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description détaillée..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!title || createMutation.isPending}
                onClick={() => {
                  createMutation.mutate({
                    type,
                    title,
                    description: description || undefined,
                  });
                }}
              >
                {createMutation.isPending ? "Envoi..." : "Envoyer"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intervention List */}
      {(!interventions || interventions.length === 0) && !showForm ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aucune demande pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {interventions?.map((intervention) => (
            <Card key={intervention.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{intervention.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {INTERVENTION_TYPE_LABELS[
                      intervention.type as InterventionType
                    ] ?? intervention.type}{" "}
                    &mdash;{" "}
                    {new Date(intervention.createdAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  </div>
                  {intervention.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {intervention.description}
                    </p>
                  )}
                </div>
                <div className="ml-3 shrink-0">
                  {getStatusBadge(intervention.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
