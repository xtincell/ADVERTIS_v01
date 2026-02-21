// ==========================================================================
// C.B1 — Compact Brand Card
// Mobile-first compact card for brand list on the dashboard.
// Shows: brand name, sector, phase, coherence score, link to cockpit.
// ==========================================================================

"use client";

import Link from "next/link";
import { getScoreColor } from "~/components/cockpit/cockpit-shared";
import { cn } from "~/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CompactBrandCardProps {
  id: string;
  brandName: string;
  sector?: string | null;
  sectorLabel?: string | null;
  phase?: string | null;
  phaseLabel?: string | null;
  coherenceScore?: number | null;
  riskScore?: number | null;
  bmfScore?: number | null;
  updatedAt?: Date | string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return "";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return "Mis a jour a l'instant";
  if (diffMinutes < 60)
    return `Mis a jour il y a ${diffMinutes} min`;
  if (diffHours < 24)
    return `Mis a jour il y a ${diffHours}h`;
  if (diffDays < 7)
    return `Mis a jour il y a ${diffDays} j`;
  if (diffWeeks < 5)
    return `Mis a jour il y a ${diffWeeks} sem.`;
  return `Mis a jour il y a ${diffMonths} mois`;
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 60) return "bg-blue-50 border-blue-200";
  if (score >= 40) return "bg-amber-50 border-amber-200";
  if (score >= 20) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CompactBrandCard({
  id,
  brandName,
  sectorLabel,
  phaseLabel,
  coherenceScore,
  updatedAt,
}: CompactBrandCardProps) {
  return (
    <Link href={`/brand/${id}`} className="block">
      <div
        className={cn(
          "w-full rounded-xl border bg-white p-4",
          "transition-all hover:shadow-md hover:border-terracotta/30",
          "active:scale-[0.98]",
        )}
      >
        {/* Top row: name + score badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold leading-tight">
              {brandName}
            </h3>

            {/* Pill tags */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {sectorLabel && (
                <span className="inline-flex items-center rounded-full border border-muted bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {sectorLabel}
                </span>
              )}
              {phaseLabel && (
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                  {phaseLabel}
                </span>
              )}
            </div>
          </div>

          {/* Mini score badge */}
          {coherenceScore != null ? (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border",
                getScoreBg(coherenceScore),
              )}
            >
              <span
                className={cn(
                  "text-sm font-bold leading-none",
                  getScoreColor(coherenceScore),
                )}
              >
                {coherenceScore}
              </span>
              <span className="text-[8px] font-medium text-muted-foreground">
                coh.
              </span>
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-muted bg-muted/20">
              <span className="text-sm font-bold leading-none text-muted-foreground/40">
                --
              </span>
              <span className="text-[8px] font-medium text-muted-foreground">
                coh.
              </span>
            </div>
          )}
        </div>

        {/* Bottom row: relative time */}
        {updatedAt && (
          <p className="mt-2.5 text-right text-[10px] text-muted-foreground">
            {getRelativeTime(updatedAt)}
          </p>
        )}
      </div>
    </Link>
  );
}
