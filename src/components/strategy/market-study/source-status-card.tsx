// ==========================================================================
// C.MS2 — Source Status Card
// Data source status display.
// ==========================================================================

"use client";

import {
  Search,
  TrendingUp,
  Building2,
  Globe,
  Bot,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type { DataSourceName, SourceStatus } from "~/lib/types/market-study";
import { SOURCE_DISPLAY } from "~/lib/types/market-study";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  TrendingUp,
  Building2,
  Globe,
  Bot,
};

interface SourceStatusCardProps {
  sourceId: DataSourceName;
  status: SourceStatus;
  dataPointCount?: number;
  configured: boolean;
  className?: string;
}

export function SourceStatusCard({
  sourceId,
  status,
  dataPointCount,
  configured,
  className,
}: SourceStatusCardProps) {
  const display = SOURCE_DISPLAY[sourceId];
  if (!display) return null;

  const Icon = ICON_MAP[display.icon] ?? Globe;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all",
        status === "complete" && "border-green-200 bg-green-50/50",
        status === "collecting" && "border-terracotta/30 animate-pulse",
        status === "error" && "border-red-200 bg-red-50/50",
        status === "not_configured" && "border-dashed border-muted opacity-50",
        status === "pending" && "border-muted",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              status === "complete" && "bg-green-100 text-green-600",
              status === "collecting" && "bg-terracotta/10 text-terracotta",
              status === "error" && "bg-red-100 text-red-500",
              status === "not_configured" && "bg-muted text-muted-foreground",
              status === "pending" && "bg-muted text-muted-foreground",
            )}
          >
            {status === "collecting" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
          </div>

          <div>
            <p className="text-sm font-medium">{display.label}</p>
            <p className="text-xs text-muted-foreground">{display.description}</p>
          </div>
        </div>

        <StatusBadge status={status} configured={configured} />
      </div>

      {/* Data point count */}
      {status === "complete" && dataPointCount !== undefined && (
        <p className="mt-2 text-xs text-green-600">
          {dataPointCount} données collectées
        </p>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  configured,
}: {
  status: SourceStatus;
  configured: boolean;
}) {
  if (!configured) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <XCircle className="h-3 w-3" />
        Non configuré
      </span>
    );
  }

  const configs = {
    pending: {
      icon: Clock,
      label: "En attente",
      className: "text-muted-foreground",
    },
    collecting: {
      icon: Loader2,
      label: "Collecte...",
      className: "text-terracotta",
    },
    complete: {
      icon: CheckCircle,
      label: "Terminé",
      className: "text-green-600",
    },
    partial: {
      icon: AlertCircle,
      label: "Partiel",
      className: "text-amber-600",
    },
    error: {
      icon: AlertCircle,
      label: "Erreur",
      className: "text-red-500",
    },
    not_configured: {
      icon: XCircle,
      label: "Non configuré",
      className: "text-muted-foreground",
    },
    skipped: {
      icon: XCircle,
      label: "Ignoré",
      className: "text-muted-foreground",
    },
  };

  const config = configs[status];
  const StatusIcon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        config.className,
      )}
    >
      <StatusIcon
        className={cn(
          "h-3 w-3",
          status === "collecting" && "animate-spin",
        )}
      />
      {config.label}
    </span>
  );
}
