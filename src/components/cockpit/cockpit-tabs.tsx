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
  { id: "creative", label: "Créatif" },
  { id: "planning", label: "Planning" },
  { id: "signals", label: "Signaux" },
  { id: "market", label: "Marché" },
  { id: "briefs", label: "Briefs" },
  { id: "quality", label: "Qualité" },
  { id: "brand-os", label: "Brand OS" },
];

/** Maps tab IDs to the cockpit section keys they should show */
export const TAB_SECTION_MAP: Record<string, string[]> = {
  overview: ["scores", "alerts", "oracle-scores", "synthese", "authenticite", "distinction", "valeur", "engagement", "livrables", "fiche-client"],
  strategy: ["authenticite", "distinction", "valeur", "synthese", "oracle-scores", "aarrr-roadmap"],
  operational: ["engagement", "implementation", "budget", "budget-operationnel", "widgets", "glory", "aarrr-roadmap"],
  creative: ["big-idea-kit", "creative-strategy", "funnel-mapping"],
  planning: ["chrono", "partners", "budget-operationnel"],
  signals: ["signals", "decisions", "veille"],
  market: ["risk", "track", "competitors", "opportunities", "metrics", "multi-markets"],
  briefs: ["briefs", "livrables"],
  quality: ["quality-checklist"],
  "brand-os": ["brand-os-setup"],
};

interface CockpitTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs?: CockpitTab[];
  /** When set, Brand OS tab is only visible for RETAINER mode */
  deliveryMode?: string | null;
}

export function CockpitTabs({
  activeTab,
  onTabChange,
  tabs = DEFAULT_TABS,
  deliveryMode,
}: CockpitTabsProps) {
  const label = useLabel();

  // Filter Brand OS tab: show only when deliveryMode is RETAINER
  const visibleTabs = tabs.filter(
    (t) => t.id !== "brand-os" || deliveryMode === "RETAINER",
  );

  return (
    <div className="sticky top-[57px] z-30 border-b bg-background/80 backdrop-blur-xl">
      <div className="flex overflow-x-auto scrollbar-none">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "shrink-0 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2",
              activeTab === tab.id
                ? "border-primary text-primary"
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
