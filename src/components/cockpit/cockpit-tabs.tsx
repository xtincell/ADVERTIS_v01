// ==========================================================================
// COMPONENT C.K22 — CockpitTabs
// Horizontal scrollable tabs for filtering cockpit sections by category.
// ==========================================================================

"use client";

import { cn } from "~/lib/utils";
import { useLabel } from "~/components/hooks/use-label";

export interface CockpitTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

const DEFAULT_TABS: CockpitTab[] = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "strategy", label: "Stratégie" },
  { id: "operational", label: "Opérationnel" },
  { id: "signals", label: "Signaux" },
  { id: "market", label: "Marché" },
  { id: "briefs", label: "Briefs" },
];

/** Maps tab IDs to the cockpit section keys they should show */
export const TAB_SECTION_MAP: Record<string, string[]> = {
  overview: ["scores", "alerts", "synthese", "authenticite", "distinction", "valeur", "engagement", "livrables"],
  strategy: ["authenticite", "distinction", "valeur", "synthese"],
  operational: ["engagement", "implementation", "budget", "widgets", "glory"],
  signals: ["signals", "decisions", "veille"],
  market: ["risk", "track", "competitors", "opportunities"],
  briefs: ["briefs", "livrables"],
};

interface CockpitTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs?: CockpitTab[];
}

export function CockpitTabs({
  activeTab,
  onTabChange,
  tabs = DEFAULT_TABS,
}: CockpitTabsProps) {
  const label = useLabel();

  return (
    <div className="sticky top-[57px] z-30 border-b bg-background/95 backdrop-blur-sm">
      <div className="flex overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2",
              activeTab === tab.id
                ? "border-terracotta text-terracotta"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {label(tab.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
