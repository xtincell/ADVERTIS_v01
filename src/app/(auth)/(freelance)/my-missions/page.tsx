// ==========================================================================
// PAGE P.F1 — Freelance Home
// Lists freelance's assigned missions with status, role, and brief count.
// ==========================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  FileText,
  Loader2,
  AlertCircle,
  MessageSquare,
  Save,
} from "lucide-react";

import { api } from "~/trpc/react";
import {
  ASSIGNMENT_ROLE_LABELS,
  MISSION_STATUS_LABELS,
  MISSION_STATUS_COLORS,
  type MissionStatus,
} from "~/lib/constants";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

function AssignmentNotes({
  assignmentId,
  initialNotes,
}: {
  assignmentId: string;
  initialNotes: string | null;
}) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saved, setSaved] = useState(false);

  const updateNotes = api.mission.assignments.updateNotes.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  return (
    <div className="mt-2 space-y-1.5 border-t pt-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MessageSquare className="h-3 w-3" />
        Notes terrain
      </div>
      <Textarea
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
        placeholder="Observations terrain, retours client, difficultés rencontrées..."
        rows={2}
        className="text-xs"
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={updateNotes.isPending || notes === (initialNotes ?? "")}
          onClick={() => updateNotes.mutate({ assignmentId, notes })}
        >
          <Save className="mr-1 h-3 w-3" />
          {updateNotes.isPending ? "..." : "Sauvegarder"}
        </Button>
        {saved && (
          <span className="text-xs text-emerald-600">Sauvegardé</span>
        )}
      </div>
    </div>
  );
}

export default function FreelanceHomePage() {
  const router = useRouter();

  const {
    data: assignments,
    isLoading,
    error,
  } = api.mission.missions.getByFreelance.useQuery();

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
          Erreur lors du chargement de vos missions.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Split active vs completed
  // ---------------------------------------------------------------------------
  const activeAssignments =
    assignments?.filter(
      (a) =>
        a.status !== "REVIEWED" && a.mission.status !== "CLOSED",
    ) ?? [];
  const completedAssignments =
    assignments?.filter(
      (a) =>
        a.status === "REVIEWED" || a.mission.status === "CLOSED",
    ) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Mes Missions</h1>
      </div>

      {/* Active Assignments */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Missions actives ({activeAssignments.length})
        </h2>

        {activeAssignments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucune mission active pour le moment.
            </CardContent>
          </Card>
        ) : (
          activeAssignments.map((assignment) => {
            const missionStatus = assignment.mission
              .status as MissionStatus;
            const statusColor =
              MISSION_STATUS_COLORS[missionStatus] ?? "";

            return (
              <Card
                key={assignment.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() =>
                  router.push(`/freelance/mission/${assignment.mission.id}`)
                }
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">
                        {assignment.mission.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.mission.strategy.brandName}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline">
                          {ASSIGNMENT_ROLE_LABELS[
                            assignment.role as keyof typeof ASSIGNMENT_ROLE_LABELS
                          ] ?? assignment.role}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={statusColor}
                        >
                          {MISSION_STATUS_LABELS[missionStatus] ??
                            assignment.mission.status}
                        </Badge>
                        {assignment.briefType && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            {assignment.briefType}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-xs">
                        {assignment.status}
                      </Badge>
                      {assignment.estimatedDays && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {assignment.estimatedDays}j
                        </span>
                      )}
                    </div>
                  </div>
                  <AssignmentNotes
                    assignmentId={assignment.id}
                    initialNotes={assignment.notes}
                  />
                </CardContent>
              </Card>
            );
          })
        )}
      </section>

      {/* Completed */}
      {completedAssignments.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Missions terminées ({completedAssignments.length})
          </h2>
          {completedAssignments.map((assignment) => (
            <Card key={assignment.id} className="opacity-60">
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">
                    {assignment.mission.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {assignment.mission.strategy.brandName}
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
