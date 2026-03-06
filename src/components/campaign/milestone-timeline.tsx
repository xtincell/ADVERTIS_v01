"use client";

import { useState } from "react";
import {
  Plus,
  Loader2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Circle,
  Shield,
  Calendar,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "~/trpc/react";

interface MilestoneTimelineProps {
  campaignId: string;
}

const STATUS_ICON = {
  PENDING: <Circle className="h-4 w-4 text-muted-foreground" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-blue-500" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  OVERDUE: <AlertTriangle className="h-4 w-4 text-red-500" />,
  SKIPPED: <Circle className="h-4 w-4 text-gray-400 line-through" />,
} as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  OVERDUE: "En retard",
  SKIPPED: "Ignoré",
};

export function MilestoneTimeline({ campaignId }: MilestoneTimelineProps) {
  const [showCreate, setShowCreate] = useState(false);

  const utils = api.useUtils();
  const { data: milestones, isLoading } =
    api.campaign.milestones.getByCampaign.useQuery({ campaignId });

  const updateMut = api.campaign.milestones.update.useMutation({
    onSuccess: () => {
      toast.success("Jalon mis à jour");
      void utils.campaign.milestones.getByCampaign.invalidate({ campaignId });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMut = api.campaign.milestones.delete.useMutation({
    onSuccess: () => {
      toast.success("Jalon supprimé");
      void utils.campaign.milestones.getByCampaign.invalidate({ campaignId });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Timeline des jalons
        </h3>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-1 h-4 w-4" />
          Ajouter jalon
        </Button>
      </div>

      {showCreate && (
        <CreateMilestoneForm
          campaignId={campaignId}
          onCreated={() => {
            setShowCreate(false);
            void utils.campaign.milestones.getByCampaign.invalidate({
              campaignId,
            });
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {milestones && milestones.length > 0 ? (
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-5 top-4 bottom-4 w-px bg-border" />

          {milestones.map(
            (
              m: {
                id: string;
                title: string;
                description: string | null;
                dueDate: Date;
                completedDate: Date | null;
                status: string;
                isGateReview: boolean;
                phase: string | null;
                assignedTo: string | null;
              },
              index: number,
            ) => {
              const isOverdue =
                m.status !== "COMPLETED" &&
                m.status !== "SKIPPED" &&
                new Date(m.dueDate) < new Date();

              return (
                <div
                  key={m.id}
                  className="relative flex items-start gap-4 pb-4 pl-2"
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border">
                    {isOverdue
                      ? STATUS_ICON.OVERDUE
                      : STATUS_ICON[m.status as keyof typeof STATUS_ICON] ??
                        STATUS_ICON.PENDING}
                  </div>

                  {/* Content */}
                  <Card className="flex-1">
                    <CardContent className="flex items-start justify-between p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {m.title}
                          </span>
                          {m.isGateReview && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-amber-300 text-amber-600"
                            >
                              <Shield className="mr-0.5 h-3 w-3" />
                              Gate Review
                            </Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${
                              isOverdue ? "bg-red-100 text-red-700" : ""
                            }`}
                          >
                            {isOverdue
                              ? "En retard"
                              : STATUS_LABEL[m.status] ?? m.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(m.dueDate).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {m.phase && <span>Phase: {m.phase}</span>}
                          {m.completedDate && (
                            <span className="text-green-600">
                              Complété le{" "}
                              {new Date(m.completedDate).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                          )}
                        </div>
                        {m.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {m.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {m.status !== "COMPLETED" && m.status !== "SKIPPED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px]"
                            disabled={updateMut.isPending}
                            onClick={() =>
                              updateMut.mutate({
                                id: m.id,
                                status: "COMPLETED",
                                completedDate: new Date(),
                              })
                            }
                          >
                            <CheckCircle2 className="mr-0.5 h-3 w-3" />
                            Valider
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMut.mutate({ id: m.id })}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            },
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Aucun jalon. Ajoutez des échéances et gate reviews.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function CreateMilestoneForm({
  campaignId,
  onCreated,
  onCancel,
}: {
  campaignId: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isGateReview, setIsGateReview] = useState(false);

  const createMut = api.campaign.milestones.create.useMutation({
    onSuccess: () => {
      toast.success("Jalon créé");
      onCreated();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label>Titre *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Validation brief créa"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label>Date d&apos;échéance *</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isGateReview}
                onChange={(e) => setIsGateReview(e.target.checked)}
                className="rounded"
              />
              <Shield className="h-3 w-3 text-amber-500" />
              Gate Review (bloquant)
            </label>
          </div>
        </div>
        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            size="sm"
            disabled={!title.trim() || !dueDate || createMut.isPending}
            onClick={() =>
              createMut.mutate({
                campaignId,
                title: title.trim(),
                description: description || undefined,
                dueDate: new Date(dueDate),
                isGateReview,
              })
            }
          >
            {createMut.isPending && (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            )}
            Créer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
