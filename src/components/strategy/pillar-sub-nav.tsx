// =============================================================================
// COMPONENT C.S3 — Pillar Sub Nav
// =============================================================================
// Horizontal navigation for switching between pillar editors (A-D-V-E-R-T-I-S).
// Props: strategyId, currentPillarType, availablePillars, className.
// Key features: prev/next pillar buttons with ChevronLeft/ChevronRight, center
// dot navigation sorted by canonical ADVERTIS order, back button to strategy
// detail page, color-coded pillar dots from PILLAR_CONFIG, active pillar ring
// highlight, responsive (dots hidden on small screens).
// =============================================================================

"use client";

// Pillar Sub-Navigation — Allows navigating between pillar editors (A-D-V-E-R-T-I-S)
// without going back to the strategy detail page.

import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PillarInfo {
  type: string;
  title: string;
  color: string;
}

interface PillarSubNavProps {
  strategyId: string;
  currentPillarType: string;
  availablePillars: PillarInfo[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PillarSubNav({
  strategyId,
  currentPillarType,
  availablePillars,
  className,
}: PillarSubNavProps) {
  // Sort pillars by canonical ADVERTIS order
  const sorted = [...availablePillars].sort(
    (a, b) =>
      (PILLAR_CONFIG[a.type as PillarType]?.order ?? 99) -
      (PILLAR_CONFIG[b.type as PillarType]?.order ?? 99),
  );

  const currentIndex = sorted.findIndex((p) => p.type === currentPillarType);
  const prev = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const next = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  return (
    <nav className={cn("flex items-center justify-between gap-2", className)}>
      {/* Left: back + prev */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/strategy/${strategyId}`}>
            <ArrowLeft className="mr-1.5 size-4" />
            <span className="hidden sm:inline">Retour</span>
          </Link>
        </Button>

        {prev && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/strategy/${strategyId}/pillar/${prev.type}/edit`}>
              <ChevronLeft className="mr-1 size-3.5" />
              <span className="hidden sm:inline">Pilier</span> {prev.type}
            </Link>
          </Button>
        )}
      </div>

      {/* Center: pillar dots (hidden on very small screens) */}
      <div className="hidden sm:flex items-center gap-1">
        {sorted.map((p) => {
          const config = PILLAR_CONFIG[p.type as PillarType];
          const isActive = p.type === currentPillarType;
          return (
            <Link
              key={p.type}
              href={`/strategy/${strategyId}/pillar/${p.type}/edit`}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-muted",
              )}
              title={config?.title ?? p.type}
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: config?.color }}
              />
              {p.type}
            </Link>
          );
        })}
      </div>

      {/* Right: next */}
      <div className="flex items-center gap-2">
        {next ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/strategy/${strategyId}/pillar/${next.type}/edit`}>
              <span className="hidden sm:inline">Pilier</span> {next.type}
              <ChevronRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        ) : (
          /* Placeholder to keep layout balanced */
          <div />
        )}
      </div>
    </nav>
  );
}
