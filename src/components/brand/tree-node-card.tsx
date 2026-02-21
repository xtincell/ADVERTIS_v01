// =============================================================================
// COMPONENT C.B3 — Tree Node Card
// =============================================================================
// Compact tree node card for the mobile-first brand tree view.
// Props: id, name, brandName, nodeType, depth, coherenceScore, pillarCount,
//   completedPillars, children, onNavigate.
// Key features: recursive rendering with depth-based indentation, node type
// icon mapping (lucide-react), coherence score mini badge (colored),
// expand/collapse toggle, tap to navigate, mobile-first touch targets.
// =============================================================================

"use client";

import { useState } from "react";
import {
  Building2,
  Package,
  Megaphone,
  Users,
  MapPin,
  Calendar,
  Box,
  Layers,
  Map,
  BookOpen,
  Heart,
  ChevronRight,
} from "lucide-react";
import { cn } from "~/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TreeNodeCardData {
  id: string;
  name: string;
  brandName: string;
  nodeType: string;
  depth: number;
  coherenceScore: number | null;
  pillarCount?: number;
  completedPillars?: number;
  children?: TreeNodeCardData[];
}

interface TreeNodeCardProps extends TreeNodeCardData {
  onNavigate: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Node type icon mapping
// ---------------------------------------------------------------------------

const NODE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BRAND: Building2,
  PRODUCT: Package,
  CAMPAIGN: Megaphone,
  CHARACTER: Users,
  ENVIRONMENT: MapPin,
  EVENT: Calendar,
  SKU: Box,
  COLLECTION: Layers,
  ZONE: Map,
  EDITION: BookOpen,
  COMMUNITY: Heart,
};

// ---------------------------------------------------------------------------
// Node type background colors (muted tint for icon container)
// ---------------------------------------------------------------------------

const NODE_TYPE_COLORS: Record<string, string> = {
  BRAND: "bg-terracotta/10 text-terracotta",
  PRODUCT: "bg-blue-50 text-blue-600",
  CAMPAIGN: "bg-purple-50 text-purple-600",
  CHARACTER: "bg-amber-50 text-amber-600",
  ENVIRONMENT: "bg-emerald-50 text-emerald-600",
  EVENT: "bg-pink-50 text-pink-600",
  SKU: "bg-gray-100 text-gray-600",
  COLLECTION: "bg-indigo-50 text-indigo-600",
  ZONE: "bg-teal-50 text-teal-600",
  EDITION: "bg-orange-50 text-orange-600",
  COMMUNITY: "bg-rose-50 text-rose-600",
};

// ---------------------------------------------------------------------------
// Coherence score color helper
// ---------------------------------------------------------------------------

function scoreColorClasses(score: number): string {
  if (score >= 70) return "bg-emerald-500 text-white";
  if (score >= 40) return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
}

// ---------------------------------------------------------------------------
// Indentation helper — maps depth to Tailwind padding
// ---------------------------------------------------------------------------

function depthPadding(depth: number): string {
  const map: Record<number, string> = {
    0: "pl-0",
    1: "pl-4",
    2: "pl-8",
    3: "pl-12",
    4: "pl-16",
    5: "pl-20",
  };
  return map[depth] ?? "pl-20";
}

// ---------------------------------------------------------------------------
// TreeNodeCard — Main Component
// ---------------------------------------------------------------------------

export function TreeNodeCard({
  id,
  name,
  brandName,
  nodeType,
  depth,
  coherenceScore,
  pillarCount,
  completedPillars,
  children,
  onNavigate,
}: TreeNodeCardProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = (children?.length ?? 0) > 0;

  const Icon = NODE_TYPE_ICONS[nodeType] ?? Building2;
  const iconColors = NODE_TYPE_COLORS[nodeType] ?? NODE_TYPE_COLORS.BRAND!;

  return (
    <div className={cn(depthPadding(depth))}>
      {/* Row — single node */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border bg-white p-3",
          "active:bg-muted/50 transition-colors",
          "min-h-[48px]", // touch-friendly height
        )}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label={isExpanded ? "Réduire" : "Développer"}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-90",
              )}
            />
          </button>
        ) : (
          <div className="w-8 shrink-0" />
        )}

        {/* Node type icon */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            iconColors,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Name area — tappable */}
        <button
          type="button"
          onClick={() => onNavigate(id)}
          className="flex flex-1 min-w-0 flex-col items-start text-left"
        >
          <span className="text-sm font-semibold truncate w-full">
            {brandName}
          </span>
          {name !== brandName && (
            <span className="text-[11px] text-muted-foreground truncate w-full">
              {name}
            </span>
          )}
        </button>

        {/* Pillar completion mini (optional) */}
        {pillarCount != null && pillarCount > 0 && (
          <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
            {completedPillars ?? 0}/{pillarCount}
          </span>
        )}

        {/* Coherence score mini badge */}
        {coherenceScore != null && coherenceScore > 0 && (
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
              scoreColorClasses(coherenceScore),
            )}
          >
            {Math.round(coherenceScore)}
          </div>
        )}
      </div>

      {/* Children — recursive */}
      {isExpanded && hasChildren && (
        <div className="mt-1.5 space-y-1.5">
          {children!.map((child) => (
            <TreeNodeCard
              key={child.id}
              {...child}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
