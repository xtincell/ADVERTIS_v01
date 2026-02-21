// ==========================================================================
// C.O2 — Mission Detail
// Mission detail view.
// ==========================================================================

"use client";

/**
 * MissionDetail — Full detail view of a single mission.
 * Shows: header, status timeline, assignments, deliverables, debrief, costs.
 */

import { useState } from "react";
import {
  ArrowLeft,
  Users,
  FileText,
  MessageSquare,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { api } from "~/trpc/react";
import {
  MISSION_STATUS_LABELS,
  MISSION_STATUS_COLORS,
  MISSION_STATUSES,
  ASSIGNMENT_ROLE_LABELS,
  type MissionStatus,
} from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface MissionDetailProps {
  missionId: string;
  onBack?: () => void;
}

export function MissionDetail({ missionId, onBack }: MissionDetailProps) {
  const { data: mission, isLoading } =
    api.mission.missions.getById.useQuery({ id: missionId });

  if (isLoading || !mission) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  const statusColor =
    MISSION_STATUS_COLORS[mission.status as MissionStatus] ?? "";

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="space-y-3">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour
          </Button>
        )}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{mission.title}</h2>
            <p className="text-sm text-muted-foreground">
              {mission.strategy.brandName} — {mission.strategy.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${
                mission.priority === "P0"
                  ? "border-red-300 text-red-600"
                  : mission.priority === "P1"
                    ? "border-amber-300 text-amber-600"
                    : "border-gray-300"
              }`}
            >
              {mission.priority}
            </Badge>
            <Badge className={statusColor}>
              {MISSION_STATUS_LABELS[mission.status as MissionStatus] ??
                mission.status}
            </Badge>
          </div>
        </div>
        {mission.description && (
          <p className="text-sm text-muted-foreground">{mission.description}</p>
        )}
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            {MISSION_STATUSES.map((status, i) => {
              const currentIdx = MISSION_STATUSES.indexOf(
                mission.status as MissionStatus,
              );
              const isPast = i < currentIdx;
              const isCurrent = i === currentIdx;

              return (
                <div key={status} className="flex items-center">
                  <div
                    className={`flex h-7 items-center rounded-full px-2 text-xs font-medium transition-all ${
                      isCurrent
                        ? MISSION_STATUS_COLORS[status]
                        : isPast
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-muted text-muted-foreground/50"
                    }`}
                  >
                    {isPast && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {isCurrent && <Clock className="mr-1 h-3 w-3" />}
                    {MISSION_STATUS_LABELS[status]}
                  </div>
                  {i < MISSION_STATUSES.length - 1 && (
                    <ChevronRight
                      className={`h-3 w-3 ${isPast ? "text-emerald-400" : "text-muted-foreground/30"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="assignments">
        <TabsList>
          <TabsTrigger value="assignments" className="gap-1">
            <Users className="h-3.5 w-3.5" />
            Équipe ({mission.assignments.length})
          </TabsTrigger>
          <TabsTrigger value="deliverables" className="gap-1">
            <FileText className="h-3.5 w-3.5" />
            Livrables ({mission.deliverables.length})
          </TabsTrigger>
          <TabsTrigger value="debrief" className="gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            Debrief
          </TabsTrigger>
          <TabsTrigger value="costs" className="gap-1">
            <DollarSign className="h-3.5 w-3.5" />
            Coûts
          </TabsTrigger>
        </TabsList>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-3">
          {mission.assignments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune affectation pour le moment.
            </p>
          ) : (
            mission.assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">
                      {ASSIGNMENT_ROLE_LABELS[
                        assignment.role as keyof typeof ASSIGNMENT_ROLE_LABELS
                      ] ?? assignment.role}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {assignment.briefType && `Brief: ${assignment.briefType}`}
                      {assignment.estimatedDays &&
                        ` — ${assignment.estimatedDays}j estimés`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment.dayRate && (
                      <span className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat("fr-FR").format(
                          assignment.dayRate,
                        )}{" "}
                        XAF/j
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {assignment.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Deliverables Tab */}
        <TabsContent value="deliverables" className="space-y-3">
          {mission.deliverables.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun livrable soumis.
            </p>
          ) : (
            mission.deliverables.map((deliverable) => (
              <Card key={deliverable.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {deliverable.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {deliverable.fileType ?? "Pas de fichier"}
                        {deliverable.fileSize &&
                          ` — ${(deliverable.fileSize / 1024).toFixed(0)} Ko`}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      deliverable.status === "APPROVED"
                        ? "border-emerald-300 text-emerald-600"
                        : deliverable.status === "REJECTED"
                          ? "border-red-300 text-red-600"
                          : ""
                    }`}
                  >
                    {deliverable.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Debrief Tab */}
        <TabsContent value="debrief">
          {mission.debrief ? (
            <Card>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                    Résumé
                  </div>
                  <p className="text-sm">{mission.debrief.summary}</p>
                </div>
                <div className="flex gap-4">
                  {mission.debrief.qualityScore != null && (
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Qualité
                      </div>
                      <div className="text-lg font-bold">
                        {mission.debrief.qualityScore}/100
                      </div>
                    </div>
                  )}
                  {mission.debrief.onTime != null && (
                    <div className="flex items-center gap-1 text-sm">
                      {mission.debrief.onTime ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      {mission.debrief.onTime ? "Dans les temps" : "Retard"}
                    </div>
                  )}
                  {mission.debrief.onBudget != null && (
                    <div className="flex items-center gap-1 text-sm">
                      {mission.debrief.onBudget ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      {mission.debrief.onBudget
                        ? "Dans le budget"
                        : "Hors budget"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Pas de debrief. Le debrief est requis pour clôturer la mission.
            </p>
          )}
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs">
          <Card>
            <CardContent className="space-y-2 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Charge estimée</span>
                <span className="font-medium">
                  {mission.estimatedCharge
                    ? `${new Intl.NumberFormat("fr-FR").format(mission.estimatedCharge)} ${mission.currency}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Charge réelle</span>
                <span className="font-medium">
                  {mission.actualCharge
                    ? `${new Intl.NumberFormat("fr-FR").format(mission.actualCharge)} ${mission.currency}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Appels IA</span>
                <span className="font-medium">{mission._count.aiUsageLogs}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
