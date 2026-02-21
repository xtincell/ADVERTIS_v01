// ==========================================================================
// COMPONENT C.K24 — QuickActions
// Floating Action Button (FAB) for mobile quick actions.
// ==========================================================================

"use client";

import { useState } from "react";
import { Plus, X, Download, Share2, RefreshCw, FileText } from "lucide-react";
import { cn } from "~/lib/utils";

interface QuickActionsProps {
  onExport?: () => void;
  onShare?: () => void;
  onRefresh?: () => void;
  onGenerateBrief?: () => void;
}

export function QuickActions({
  onExport,
  onShare,
  onRefresh,
  onGenerateBrief,
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Download, label: "Exporter", action: onExport },
    { icon: Share2, label: "Partager", action: onShare },
    { icon: RefreshCw, label: "Recalculer", action: onRefresh },
    { icon: FileText, label: "Nouveau brief", action: onGenerateBrief },
  ].filter((a) => a.action);

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden">
      {/* Action buttons (expanded) */}
      {isOpen && (
        <div className="mb-3 flex flex-col-reverse items-end gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => {
                  action.action?.();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 rounded-full bg-card border px-3 py-2 shadow-lg text-sm font-medium hover:bg-accent transition-colors"
              >
                <Icon className="h-4 w-4" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* FAB toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          isOpen
            ? "bg-foreground text-background rotate-45"
            : "bg-terracotta text-white",
        )}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
    </div>
  );
}
