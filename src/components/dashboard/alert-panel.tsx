// ==========================================================================
// C.D4 — Alert Panel
// Dashboard alerts and notifications.
// ==========================================================================

"use client";

import {
  AlertTriangle,
  TrendingDown,
  Clock,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Alert {
  strategyId: string;
  brandName: string;
  reason: "low_coherence" | "high_risk" | "stalled" | "error_pillars";
  detail: string;
}

interface AlertPanelProps {
  alerts: Alert[];
  onBrandClick: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAlertIcon(reason: Alert["reason"]) {
  switch (reason) {
    case "low_coherence":
      return <TrendingDown className="h-4 w-4 text-amber-500" />;
    case "high_risk":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "stalled":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "error_pillars":
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
}

function getAlertBg(reason: Alert["reason"]): string {
  switch (reason) {
    case "low_coherence":
      return "bg-amber-50 dark:bg-amber-950/20";
    case "high_risk":
      return "bg-red-50 dark:bg-red-950/20";
    case "stalled":
      return "bg-blue-50 dark:bg-blue-950/20";
    case "error_pillars":
      return "bg-red-50 dark:bg-red-950/20";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AlertPanel({ alerts, onBrandClick }: AlertPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-terracotta" />
          <CardTitle className="text-base">Alertes</CardTitle>
        </div>
        <CardDescription>
          {alerts.length === 0
            ? "Aucune alerte — tout va bien !"
            : `${alerts.length} alerte${alerts.length > 1 ? "s" : ""} détectée${alerts.length > 1 ? "s" : ""}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed py-6 text-sm text-muted-foreground">
            Toutes les marques sont en bonne santé
          </div>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {alerts.map((alert, i) => (
              <button
                key={`${alert.strategyId}-${alert.reason}-${i}`}
                type="button"
                onClick={() => onBrandClick(alert.strategyId)}
                className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:brightness-95 ${getAlertBg(alert.reason)}`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {getAlertIcon(alert.reason)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {alert.brandName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {alert.detail}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
