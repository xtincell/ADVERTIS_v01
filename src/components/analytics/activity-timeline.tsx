// Activity Timeline — Vertical timeline of recent brand activity.
// Pure HTML/CSS, no external deps.

"use client";

import { Activity, CheckCircle, AlertTriangle, Zap, Clock } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimelineEvent {
  strategyId: string;
  brandName: string;
  action: string;
  updatedAt: Date;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  onBrandClick: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `Il y a ${weeks}sem`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getEventIcon(action: string) {
  if (action.includes("terminée") || action.includes("complété"))
    return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
  if (action.includes("erreur") || action.includes("Erreur"))
    return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
  if (action.includes("génération"))
    return <Zap className="h-3.5 w-3.5 text-amber-500" />;
  if (action.includes("Mise à jour"))
    return <Clock className="h-3.5 w-3.5 text-blue-500" />;
  return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityTimeline({
  events,
  onBrandClick,
}: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
        Aucune activité récente
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

      {events.map((event, i) => (
        <div key={`${event.strategyId}-${i}`} className="relative flex gap-3 py-2">
          {/* Dot */}
          <div className="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-background border">
            {getEventIcon(event.action)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => onBrandClick(event.strategyId)}
              className="text-sm font-medium hover:text-terracotta transition-colors text-left"
            >
              {event.brandName}
            </button>
            <p className="text-xs text-muted-foreground truncate">
              {event.action}
            </p>
          </div>

          {/* Time */}
          <span className="flex-shrink-0 text-xs text-muted-foreground pt-0.5">
            {getRelativeTime(event.updatedAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
