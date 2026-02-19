"use client";

// Strategy Sub-Navigation — Horizontal tab bar for navigating between
// strategy sub-pages (Fiche, Cockpit, Fiche S, Étude de Marché).
// Uses Next.js Link + usePathname() for active state detection.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "~/lib/utils";

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const STRATEGY_TABS = [
  { key: "fiche",        label: "Fiche",           suffix: "" },
  { key: "cockpit",      label: "Cockpit",         suffix: "/cockpit" },
  { key: "presentation", label: "Fiche S",         suffix: "/presentation" },
  { key: "market-study", label: "Étude de Marché", suffix: "/market-study" },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StrategySubNavProps {
  strategyId: string;
  className?: string;
}

export function StrategySubNav({ strategyId, className }: StrategySubNavProps) {
  const pathname = usePathname();
  const basePath = `/strategy/${strategyId}`;

  return (
    <nav
      className={cn(
        "flex items-center gap-1 border-b bg-background/95 backdrop-blur-sm",
        className,
      )}
    >
      {/* Back to dashboard */}
      <Link
        href="/dashboard"
        className="flex shrink-0 items-center gap-1 px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Retour au tableau de bord"
      >
        <ArrowLeft className="size-4" />
      </Link>

      {/* Separator */}
      <div className="h-5 w-px shrink-0 bg-border" />

      {/* Scrollable tab list */}
      <div className="flex flex-1 items-center gap-0.5 overflow-x-auto scrollbar-hide">
        {STRATEGY_TABS.map((tab) => {
          const href = `${basePath}${tab.suffix}`;
          const isActive =
            tab.suffix === ""
              ? pathname === basePath
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                "relative shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground after:rounded-full"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
