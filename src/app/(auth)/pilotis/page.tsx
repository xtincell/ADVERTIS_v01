// ==========================================================================
// PAGE P.5 — Missions Board
// Responsive missions view: mobile list (< 768px) or desktop kanban board.
// ==========================================================================

"use client";

/**
 * MissionsPage — Top-level missions view with filter tabs and responsive layout.
 * Mobile: accordion-grouped list (MissionListMobile).
 * Desktop: kanban board (MissionBoard).
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";

import { useMobile } from "~/components/hooks/use-mobile";
import { MissionListMobile } from "~/components/missions/mission-list-mobile";
import dynamic from "next/dynamic";
const MissionBoard = dynamic(
  () => import("~/components/ops/mission-board").then((m) => ({ default: m.MissionBoard })),
  { ssr: false },
);
import { CreateMissionDialog } from "~/components/missions/create-mission-dialog";

// ---------------------------------------------------------------------------
// Filter tab definitions
// ---------------------------------------------------------------------------
type FilterKey = "all" | "active" | "done";

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "active", label: "En cours" },
  { key: "done", label: "Terminées" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MissionsPage() {
  const router = useRouter();
  const isMobile = useMobile();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const handleSelectMission = (id: string) => {
    router.push(`/pilotis/${id}`);
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 md:p-6 animate-page-enter">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h1 className="text-display-lg">Missions</h1>
        </div>
        <CreateMissionDialog />
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content: mobile list or desktop kanban ── */}
      {isMobile ? (
        <MissionListMobile onSelectMission={handleSelectMission} />
      ) : (
        <MissionBoard onSelectMission={handleSelectMission} />
      )}
    </div>
  );
}
