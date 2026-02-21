// ==========================================================================
// PAGE P.F2 — Freelance Briefs
// Shows briefs assigned to this freelance user via their mission assignments.
// ==========================================================================

"use client";

import {
  FileText,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { api } from "~/trpc/react";
import {
  BRIEF_TYPE_LABELS,
  ASSIGNMENT_ROLE_LABELS,
} from "~/lib/constants";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function FreelanceBriefsPage() {
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
          Erreur lors du chargement de vos briefs.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Extract briefs from assignments
  // ---------------------------------------------------------------------------
  const briefAssignments =
    assignments?.filter((a) => a.briefType) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Mes Briefs</h1>
      </div>

      {/* Brief List */}
      {briefAssignments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aucun brief assigné pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {briefAssignments.map((assignment) => {
            const briefLabel =
              BRIEF_TYPE_LABELS[assignment.briefType ?? ""] ??
              assignment.briefType;
            const isCompleted =
              assignment.status === "REVIEWED" ||
              assignment.mission.status === "CLOSED";

            return (
              <Card
                key={assignment.id}
                className={isCompleted ? "opacity-60" : ""}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{briefLabel}</span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {assignment.mission.title} — {assignment.mission.strategy.brandName}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline">
                          {ASSIGNMENT_ROLE_LABELS[
                            assignment.role as keyof typeof ASSIGNMENT_ROLE_LABELS
                          ] ?? assignment.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {assignment.status}
                        </Badge>
                      )}
                      {assignment.estimatedDays && !isCompleted && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {assignment.estimatedDays}j
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
