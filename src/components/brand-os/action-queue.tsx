// ==========================================================================
// C.OS5 — Action Queue
// Prioritized action items for the Brand OS command center.
// ==========================================================================

"use client";

import { ACTION_CATEGORIES, type ActionCategory } from "~/lib/types/brand-os";

interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  effort: string;
  impact: string;
  channel: string | null;
  deadline: Date | string | null;
  source: string;
}

interface ActionQueueProps {
  actions: ActionItem[];
  onStatusChange?: (id: string, status: string) => void;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; ring: string }> = {
  P0: { label: "URGENT", color: "#ef4444", ring: "ring-red-500/30" },
  P1: { label: "Planifié", color: "#f59e0b", ring: "ring-amber-500/30" },
  P2: { label: "Backlog", color: "#6b7280", ring: "ring-zinc-500/30" },
};

const STATUS_CONFIG: Record<string, { label: string; bgClass: string }> = {
  TODO: { label: "À faire", bgClass: "bg-zinc-500/10" },
  IN_PROGRESS: { label: "En cours", bgClass: "bg-blue-500/10" },
  DONE: { label: "Fait", bgClass: "bg-green-500/10" },
  DISMISSED: { label: "Écarté", bgClass: "bg-zinc-500/5" },
};

const EFFORT_DOTS: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };

export function ActionQueue({ actions, onStatusChange }: ActionQueueProps) {
  // Group by priority
  const grouped = {
    P0: actions.filter((a) => a.priority === "P0" && a.status !== "DONE" && a.status !== "DISMISSED"),
    P1: actions.filter((a) => a.priority === "P1" && a.status !== "DONE" && a.status !== "DISMISSED"),
    P2: actions.filter((a) => a.priority === "P2" && a.status !== "DONE" && a.status !== "DISMISSED"),
  };

  return (
    <div className="space-y-4">
      {(["P0", "P1", "P2"] as const).map((priority) => {
        const items = grouped[priority];
        if (items.length === 0) return null;
        const pConfig = PRIORITY_CONFIG[priority] ?? { label: priority, color: "#6b7280", ring: "ring-zinc-500/30" };

        return (
          <div key={priority} className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${pConfig.color}20`, color: pConfig.color }}
              >
                {pConfig.label}
              </span>
              <span className="text-xs text-muted-foreground">{items.length} actions</span>
            </div>

            <div className="space-y-1.5">
              {items.map((action) => {
                const catConfig = ACTION_CATEGORIES[action.category as ActionCategory];
                const sConfig = STATUS_CONFIG[action.status] ?? { label: "À faire", bgClass: "bg-zinc-500/10" };
                const effortDots = EFFORT_DOTS[action.effort] ?? 2;

                return (
                  <div
                    key={action.id}
                    className={`rounded-lg border border-border/40 p-3 flex items-start gap-3 ${sConfig.bgClass} transition-colors`}
                  >
                    {/* Completion checkbox */}
                    <button
                      className="mt-0.5 w-5 h-5 rounded-md border-2 border-border/60 hover:border-green-500 flex items-center justify-center shrink-0 transition-colors"
                      onClick={() => onStatusChange?.(action.id, "DONE")}
                      title="Marquer comme fait"
                    >
                      {action.status === "IN_PROGRESS" && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{action.title}</p>
                      {action.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {action.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {catConfig && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${catConfig.color}15`, color: catConfig.color }}
                          >
                            {catConfig.label}
                          </span>
                        )}
                        {action.channel && (
                          <span className="text-[10px] text-muted-foreground">
                            {action.channel}
                          </span>
                        )}
                        {/* Effort indicator */}
                        <span className="flex gap-0.5">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i < effortDots ? "bg-muted-foreground/40" : "bg-muted-foreground/10"
                              }`}
                            />
                          ))}
                        </span>
                      </div>
                    </div>

                    {/* Source badge */}
                    {action.source === "ai_suggestion" && (
                      <span className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded shrink-0">
                        IA
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
