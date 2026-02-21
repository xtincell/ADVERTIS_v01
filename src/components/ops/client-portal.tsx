// ==========================================================================
// C.O4 — Client Portal
// Client-facing interface.
// ==========================================================================

"use client";

/**
 * ClientPortal — Dashboard for CLIENT_RETAINER and CLIENT_STATIC users.
 * White-labeled view of missions + intervention requests.
 */

import { useState } from "react";
import {
  Eye,
  MessageSquarePlus,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { api } from "~/trpc/react";
import {
  INTERVENTION_TYPE_LABELS,
  type InterventionType,
} from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

export function ClientPortal() {
  const { data: interventions } = api.intervention.getMine.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<InterventionType>("CONTENT_UPDATE");

  const createMutation = api.intervention.create.useMutation({
    onSuccess: () => {
      setShowForm(false);
      setTitle("");
      setDescription("");
    },
  });

  const utils = api.useUtils();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Espace Client</h2>
      </div>

      {/* Intervention Requests */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Mes demandes
          </h3>
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
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InterventionType)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {Object.entries(INTERVENTION_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Objet de la demande..."
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description détaillée..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={!title || createMutation.isPending}
                  onClick={() => {
                    createMutation.mutate(
                      { type, title, description: description || undefined },
                      {
                        onSuccess: () =>
                          void utils.intervention.getMine.invalidate(),
                      },
                    );
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
        {interventions?.map((intervention) => (
          <Card key={intervention.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium">{intervention.title}</div>
                <div className="text-xs text-muted-foreground">
                  {INTERVENTION_TYPE_LABELS[
                    intervention.type as InterventionType
                  ] ?? intervention.type}{" "}
                  —{" "}
                  {new Date(intervention.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  intervention.status === "RESOLVED"
                    ? "border-emerald-300 text-emerald-600"
                    : intervention.status === "REJECTED"
                      ? "border-red-300 text-red-600"
                      : intervention.status === "IN_PROGRESS"
                        ? "border-amber-300 text-amber-600"
                        : ""
                }`}
              >
                {intervention.status}
              </Badge>
            </CardContent>
          </Card>
        ))}

        {(!interventions || interventions.length === 0) && !showForm && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucune demande pour le moment.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
