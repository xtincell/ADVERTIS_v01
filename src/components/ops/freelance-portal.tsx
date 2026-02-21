// ==========================================================================
// C.O3 — Freelance Portal
// Freelancer management interface.
// ==========================================================================

"use client";

/**
 * FreelancePortal — Dashboard for FREELANCE role users.
 * Shows: my assignments, my deliverables, mission context.
 */

import { Briefcase, FileText, Clock, CheckCircle2 } from "lucide-react";
import { api } from "~/trpc/react";
import {
  ASSIGNMENT_ROLE_LABELS,
  MISSION_STATUS_LABELS,
  type MissionStatus,
} from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export function FreelancePortal() {
  const { data: assignments, isLoading } =
    api.mission.missions.getByFreelance.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Mon espace Freelance</h2>
      </div>

      {/* Active Assignments */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Missions actives ({activeAssignments.length})
        </h3>
        {activeAssignments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucune mission active pour le moment.
            </CardContent>
          </Card>
        ) : (
          activeAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      {assignment.mission.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {assignment.mission.strategy.brandName}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <Badge variant="outline">
                        {ASSIGNMENT_ROLE_LABELS[
                          assignment.role as keyof typeof ASSIGNMENT_ROLE_LABELS
                        ] ?? assignment.role}
                      </Badge>
                      {assignment.briefType && (
                        <span className="text-muted-foreground">
                          Brief: {assignment.briefType}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {assignment.status}
                    </Badge>
                    {assignment.estimatedDays && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {assignment.estimatedDays}j
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Completed */}
      {completedAssignments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Missions terminées ({completedAssignments.length})
          </h3>
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
        </div>
      )}
    </div>
  );
}
