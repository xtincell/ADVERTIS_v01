// ==========================================================================
// C.O1 — Mission Board
// Kanban-style mission management.
// ==========================================================================

"use client";

/**
 * MissionBoard — Kanban view of missions grouped by status.
 * 7 columns (one per MISSION_STATUS), drag-and-drop via native HTML5 DnD.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  ChevronRight,
  Clock,
  Users,
  FileText,
} from "lucide-react";
import { api } from "~/trpc/react";
import {
  MISSION_STATUSES,
  MISSION_STATUS_LABELS,
  MISSION_STATUS_COLORS,
  type MissionStatus,
} from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface MissionBoardProps {
  onSelectMission?: (missionId: string) => void;
  onCreateMission?: () => void;
}

export function MissionBoard({
  onSelectMission,
  onCreateMission,
}: MissionBoardProps) {
  const { data: kanban, isLoading } = api.mission.missions.getKanban.useQuery();
  const transitionMutation = api.mission.missions.transition.useMutation();
  const utils = api.useUtils();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, missionId: string) => {
    setDraggedId(missionId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", missionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: MissionStatus) => {
    e.preventDefault();
    const missionId = e.dataTransfer.getData("text/plain");
    if (!missionId) return;

    try {
      await transitionMutation.mutateAsync({
        id: missionId,
        newStatus: targetStatus,
      });
      await utils.mission.missions.getKanban.invalidate();
    } catch {
      // Transition failed (invalid state machine move) — silently ignore
    }
    setDraggedId(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Chargement des missions...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Missions</h2>
          <Badge variant="secondary">
            {Object.values(kanban ?? {}).flat().length}
          </Badge>
        </div>
        {onCreateMission && (
          <Button size="sm" onClick={onCreateMission}>
            <Plus className="mr-1 h-4 w-4" />
            Nouvelle mission
          </Button>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {MISSION_STATUSES.map((status) => {
          const missions = kanban?.[status] ?? [];
          const colorClasses = MISSION_STATUS_COLORS[status];

          return (
            <div
              key={status}
              className="flex min-w-[220px] max-w-[260px] flex-1 flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header */}
              <div
                className={`mb-2 rounded-t-lg border px-3 py-2 text-sm font-medium ${colorClasses}`}
              >
                {MISSION_STATUS_LABELS[status]}
                <span className="ml-1 text-xs opacity-60">
                  ({missions.length})
                </span>
              </div>

              {/* Column Body */}
              <div className="flex min-h-[200px] flex-col gap-2 rounded-b-lg border border-t-0 bg-muted/30 p-2">
                <AnimatePresence>
                  {missions.map((mission) => (
                    <motion.div
                      key={mission.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(
                          e as unknown as React.DragEvent,
                          mission.id,
                        )
                      }
                      className={`cursor-grab rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${
                        draggedId === mission.id ? "opacity-50" : ""
                      }`}
                      onClick={() => onSelectMission?.(mission.id)}
                    >
                      <div className="mb-1 text-sm font-medium leading-tight">
                        {mission.title}
                      </div>
                      <div className="mb-2 text-xs text-muted-foreground">
                        {mission.strategy.brandName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            mission.priority === "P0"
                              ? "border-red-300 text-red-600"
                              : mission.priority === "P1"
                                ? "border-amber-300 text-amber-600"
                                : "border-gray-300"
                          }`}
                        >
                          {mission.priority}
                        </Badge>
                        {mission._count.assignments > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Users className="h-3 w-3" />
                            {mission._count.assignments}
                          </span>
                        )}
                        {mission._count.deliverables > 0 && (
                          <span className="flex items-center gap-0.5">
                            <FileText className="h-3 w-3" />
                            {mission._count.deliverables}
                          </span>
                        )}
                      </div>
                      {mission.estimatedCharge && (
                        <div className="mt-1 text-xs font-medium text-emerald-600">
                          {new Intl.NumberFormat("fr-FR").format(
                            mission.estimatedCharge,
                          )}{" "}
                          {mission.currency}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {missions.length === 0 && (
                  <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground/50">
                    Aucune mission
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
