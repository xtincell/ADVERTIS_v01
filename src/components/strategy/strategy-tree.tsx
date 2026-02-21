// =============================================================================
// COMPONENT C.S1 — Strategy Tree
// =============================================================================
// Visual recursive tree display for brand hierarchy.
// Props: strategyId, className.
// Key features: recursive TreeNode component with expand/collapse, node type
// badges with color coding (BRAND/PRODUCT/CAMPAIGN/CHARACTER/etc.), brand name
// links to /strategy/{id}, coherence score circles (green/amber/red), pillar
// completion progress bars, connector lines between parent-child nodes,
// auto-expand first 2 depth levels, tRPC getTree query.
// =============================================================================

"use client";

// Strategy Tree — Visual recursive tree display for brand hierarchy
// Each node shows: badge nodeType, brandName, coherence score, pillar completion
// Click navigates to /strategy/{id}

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  Loader2,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { NODE_TYPE_LABELS, PILLAR_CONFIG } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Node type color map
// ---------------------------------------------------------------------------

const NODE_TYPE_COLORS: Record<string, string> = {
  BRAND: "bg-terracotta/10 text-terracotta border-terracotta/20",
  PRODUCT: "bg-blue-50 text-blue-700 border-blue-200",
  CAMPAIGN: "bg-purple-50 text-purple-700 border-purple-200",
  CHARACTER: "bg-amber-50 text-amber-700 border-amber-200",
  ENVIRONMENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  EVENT: "bg-pink-50 text-pink-700 border-pink-200",
  SKU: "bg-gray-50 text-gray-700 border-gray-200",
  COLLECTION: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ZONE: "bg-teal-50 text-teal-700 border-teal-200",
  EDITION: "bg-orange-50 text-orange-700 border-orange-200",
  COMMUNITY: "bg-rose-50 text-rose-700 border-rose-200",
};

// ---------------------------------------------------------------------------
// StrategyTree — Main Component
// ---------------------------------------------------------------------------

interface StrategyTreeProps {
  strategyId: string;
  className?: string;
}

export function StrategyTree({ strategyId, className }: StrategyTreeProps) {
  const { data: tree, isLoading } = api.strategy.getTree.useQuery(
    { id: strategyId },
    { enabled: !!strategyId },
  );

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tree) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className="h-4 w-4 text-terracotta" />
        <h3 className="text-sm font-semibold">Arbre de Marques</h3>
      </div>

      <TreeNode node={tree} depth={0} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// TreeNode — Recursive Component
// ---------------------------------------------------------------------------

interface TreeNodeData {
  id: string;
  name: string;
  brandName: string;
  nodeType: string;
  depth: number;
  coherenceScore: number | null;
  pillars: Array<{ id: string; type: string; status: string }>;
  children?: TreeNodeData[];
}

function TreeNode({ node, depth }: { node: TreeNodeData; depth: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = (node.children?.length ?? 0) > 0;

  const completedPillars = node.pillars.filter((p) => p.status === "complete").length;
  const totalPillars = node.pillars.length;
  const completionPct = totalPillars > 0 ? Math.round((completedPillars / totalPillars) * 100) : 0;

  const nodeTypeLabel = NODE_TYPE_LABELS[node.nodeType as keyof typeof NODE_TYPE_LABELS] ?? node.nodeType;
  const nodeTypeColor = NODE_TYPE_COLORS[node.nodeType] ?? NODE_TYPE_COLORS.BRAND!;

  return (
    <div className={cn("relative", depth > 0 && "ml-6")}>
      {/* Connector line */}
      {depth > 0 && (
        <div className="absolute -left-4 top-0 h-6 w-4 border-l-2 border-b-2 border-border rounded-bl" />
      )}

      {/* Node card */}
      <div className="rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2">
          {/* Expand/collapse toggle */}
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0 rounded p-0.5 hover:bg-muted transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}

          {!hasChildren && <div className="w-5 shrink-0" />}

          {/* Node type badge */}
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              nodeTypeColor,
            )}
          >
            {nodeTypeLabel}
          </span>

          {/* Brand name + link */}
          <Link
            href={`/strategy/${node.id}`}
            className="flex-1 min-w-0 group"
          >
            <span className="text-sm font-semibold group-hover:text-terracotta truncate block transition-colors">
              {node.brandName}
            </span>
            {node.name !== node.brandName && (
              <span className="text-[10px] text-muted-foreground truncate block">
                {node.name}
              </span>
            )}
          </Link>

          {/* Score circle */}
          {node.coherenceScore != null && node.coherenceScore > 0 && (
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                node.coherenceScore >= 70
                  ? "bg-emerald-500"
                  : node.coherenceScore >= 40
                    ? "bg-amber-500"
                    : "bg-red-500",
              )}
            >
              {Math.round(node.coherenceScore)}
            </div>
          )}

          {/* Pillar completion */}
          <div className="shrink-0 text-right">
            <p className="text-[10px] text-muted-foreground">
              {completedPillars}/{totalPillars}
            </p>
            <div className="h-1 w-10 rounded-full bg-muted mt-0.5">
              <div
                className="h-full rounded-full bg-terracotta transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-2 space-y-2">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
