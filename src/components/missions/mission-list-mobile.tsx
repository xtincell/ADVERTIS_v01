// ==========================================================================
// C.M1 — Mission List Mobile
// Mobile-first mission list grouped by status (accordion-style).
// ==========================================================================

"use client";

/**
 * MissionListMobile — Accordion-grouped mission list for mobile viewports.
 * Each status group is collapsible; active statuses expanded by default.
 * Touch-friendly cards with min-h-12 tap targets.
 */

import { useState } from "react";
import { Loader2, AlertTriangle, RotateCcw, ChevronDown } from "lucide-react";
import { api } from "~/trpc/react";
import {
  MISSION_STATUSES,
  MISSION_STATUS_LABELS,
  MISSION_STATUS_COLORS,
  type MissionStatus,
} from "~/lib/constants";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

// ---------------------------------------------------------------------------
// Statuses that are expanded by default (active pipeline)
// ---------------------------------------------------------------------------
const ACTIVE_STATUSES: MissionStatus[] = [
  "INTAKE",
  "INTELLIGENCE",
  "STAFFING",
  "IN_PROGRESS",
  "REVIEW",
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface MissionListMobileProps {
  onSelectMission?: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function MissionListMobile({
  onSelectMission,
}: MissionListMobileProps) {
  const {
    data: kanban,
    isLoading,
    isError,
    refetch,
  } = api.mission.missions.getKanban.useQuery();

  // Track which status groups are expanded/collapsed
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const status of MISSION_STATUSES) {
      initial[status] = ACTIVE_STATUSES.includes(status);
    }
    return initial;
  });

  const toggleGroup = (status: MissionStatus) => {
    setExpanded((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <p className="text-sm text-muted-foreground">
          Impossible de charger les missions
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {MISSION_STATUSES.map((status) => {
        const missions = kanban?.[status] ?? [];
        const colorClasses = MISSION_STATUS_COLORS[status];
        const isExpanded = expanded[status] ?? false;

        // Extract dot color from the color classes (e.g. "text-blue-600 ..." -> "bg-blue-600")
        const dotColor = colorClasses
          .split(" ")
          .find((c) => c.startsWith("text-"))
          ?.replace("text-", "bg-") ?? "bg-gray-400";

        return (
          <div key={status} className="rounded-lg border">
            {/* ── Group Header (toggle) ── */}
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-left min-h-12"
              onClick={() => toggleGroup(status)}
            >
              {/* Colored status dot */}
              <span
                className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`}
              />

              {/* Label */}
              <span className="flex-1 text-sm font-medium">
                {MISSION_STATUS_LABELS[status]}
              </span>

              {/* Count */}
              <Badge variant="secondary" className="text-xs tabular-nums">
                {missions.length}
              </Badge>

              {/* Chevron */}
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* ── Mission Cards ── */}
            {isExpanded && missions.length > 0 && (
              <div className="border-t px-2 pb-2 pt-1 space-y-1">
                {missions.map((mission) => (
                  <button
                    key={mission.id}
                    type="button"
                    className="flex w-full flex-col gap-1 rounded-md px-3 py-2.5 text-left min-h-12 transition-colors hover:bg-accent active:bg-accent/80"
                    onClick={() => onSelectMission?.(mission.id)}
                  >
                    {/* Row 1: Title + Priority */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold leading-tight">
                        {mission.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-xs ${
                          mission.priority === "P0"
                            ? "border-red-300 text-red-600"
                            : mission.priority === "P1"
                              ? "border-amber-300 text-amber-600"
                              : "border-green-300 text-green-600"
                        }`}
                      >
                        {mission.priority}
                      </Badge>
                    </div>

                    {/* Row 2: Brand name */}
                    <span className="text-xs text-muted-foreground">
                      {mission.strategy.brandName}
                    </span>

                    {/* Row 3: Counts */}
                    <span className="text-xs text-muted-foreground">
                      {mission._count.assignments} freelance
                      {mission._count.assignments !== 1 ? "s" : ""}
                      {" \u00B7 "}
                      {mission._count.deliverables} livrable
                      {mission._count.deliverables !== 1 ? "s" : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state inside expanded group */}
            {isExpanded && missions.length === 0 && (
              <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground/50">
                Aucune mission
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
