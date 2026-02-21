// ==========================================================================
// COMPONENT C.K23 — SectionAccordion
// Unified collapsible wrapper for all cockpit sections.
// ==========================================================================

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { useLabel } from "~/components/hooks/use-label";

interface SectionAccordionProps {
  /** Internal section title — will be white-labeled automatically */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Section color accent (pillar color) */
  accentColor?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Badge (e.g. count, status) */
  badge?: React.ReactNode;
  /** Default collapsed state */
  defaultOpen?: boolean;
  /** Section visibility — if false, not rendered at all */
  visible?: boolean;
  children: React.ReactNode;
}

export function SectionAccordion({
  title,
  subtitle,
  accentColor,
  icon,
  badge,
  defaultOpen = false,
  visible = true,
  children,
}: SectionAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const label = useLabel();

  if (!visible) return null;

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
      >
        {/* Accent bar */}
        {accentColor && (
          <div
            className="h-8 w-1 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
        )}

        {/* Icon */}
        {icon && <div className="shrink-0 text-muted-foreground">{icon}</div>}

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{label(title)}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        {/* Badge */}
        {badge && <div className="shrink-0">{badge}</div>}

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
