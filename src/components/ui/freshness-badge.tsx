// ==========================================================================
// C.U1 — Freshness Badge
// Data freshness indicator.
// ==========================================================================

"use client";

import { FRESHNESS_THRESHOLDS } from "~/lib/constants";
import { cn } from "~/lib/utils";

type FreshnessStatus = "FRESH" | "AGING" | "STALE";

function getFreshnessStatus(
  date: Date | string | null | undefined,
  vertical?: string | null,
): FreshnessStatus {
  if (!date) return "STALE";

  const d = typeof date === "string" ? new Date(date) : date;
  const daysSinceUpdate = Math.floor(
    (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24),
  );

  const thresholds =
    FRESHNESS_THRESHOLDS[vertical ?? ""] ?? FRESHNESS_THRESHOLDS.DEFAULT!;

  if (daysSinceUpdate <= thresholds.fresh) return "FRESH";
  if (daysSinceUpdate <= thresholds.aging) return "AGING";
  return "STALE";
}

const STATUS_CONFIG: Record<
  FreshnessStatus,
  { label: string; className: string; dot: string }
> = {
  FRESH: {
    label: "Frais",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
    dot: "\u25CF",
  },
  AGING: {
    label: "Vieillissant",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    dot: "\u25D0",
  },
  STALE: {
    label: "Obsolete",
    className:
      "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    dot: "\u25CB",
  },
};

interface FreshnessBadgeProps {
  date: Date | string | null | undefined;
  vertical?: string | null;
  className?: string;
  showLabel?: boolean;
}

export function FreshnessBadge({
  date,
  vertical,
  className,
  showLabel = true,
}: FreshnessBadgeProps) {
  const status = getFreshnessStatus(date, vertical);
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        config.className,
        className,
      )}
      title={`${config.label}`}
    >
      <span className="text-[8px]">{config.dot}</span>
      {showLabel && config.label}
    </span>
  );
}
