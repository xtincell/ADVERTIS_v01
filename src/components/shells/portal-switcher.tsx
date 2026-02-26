// ==========================================================================
// SHELL S.6 — PortalSwitcher
// Desktop: Popover on the rail-nav logo showing available portals.
// Mobile: Floating button (top-left) opening a bottom Sheet.
// Only renders when the user has access to ≥2 portals.
// ==========================================================================

"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "~/lib/utils";
import { AdvertisMonogram } from "~/components/brand/advertis-logo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useAvailablePortals } from "~/components/hooks/use-available-portals";
import type { PortalDefinition } from "~/lib/portal-config";

// ---------------------------------------------------------------------------
// Icon helper
// ---------------------------------------------------------------------------
type LucideIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

function getPortalIcon(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[iconName] ?? LucideIcons.Puzzle;
}

function PortalIcon({ portal, size = "md" }: { portal: PortalDefinition; size?: "sm" | "md" }) {
  const Icon = getPortalIcon(portal.iconName);
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div
      className={cn("flex items-center justify-center rounded-lg shrink-0", dim, portal.bgClass)}
    >
      <Icon className={cn(iconDim, portal.textClass)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Portal card (shared between desktop and mobile)
// ---------------------------------------------------------------------------
function PortalCard({
  portal,
  isCurrent,
  variant = "list",
}: {
  portal: PortalDefinition;
  isCurrent: boolean;
  variant?: "list" | "grid";
}) {
  if (variant === "grid") {
    return (
      <Link
        href={portal.href}
        className={cn(
          "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all active:scale-[0.97]",
          isCurrent
            ? cn("border-2 shadow-sm", portal.borderClass, portal.bgClass)
            : "border bg-white hover:shadow-md",
        )}
      >
        <PortalIcon portal={portal} />
        <span
          className={cn(
            "text-sm font-semibold",
            isCurrent ? portal.textClass : "text-gray-900",
          )}
        >
          {portal.name}
        </span>
        <span className="text-[10px] text-muted-foreground text-center leading-tight">
          {portal.description}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={portal.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-2 py-2 transition-all",
        isCurrent ? "bg-muted" : "hover:bg-muted/50",
      )}
    >
      <PortalIcon portal={portal} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-sm font-medium",
              isCurrent && portal.textClass,
            )}
          >
            {portal.name}
          </span>
          {isCurrent && (
            <Check className={cn("h-3.5 w-3.5", portal.textClass)} />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {portal.description}
        </p>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Desktop: Popover on logo
// ---------------------------------------------------------------------------
export function PortalSwitcher() {
  const { available, current, showSwitcher } = useAvailablePortals();

  // Single-portal user → plain logo link
  if (!showSwitcher) {
    return (
      <Link href="/" className="flex h-10 w-10 items-center justify-center">
        <AdvertisMonogram className="h-7 w-7" />
      </Link>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
            "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring outline-none",
          )}
          style={{
            boxShadow: `inset 0 -3px 0 0 ${current.color}`,
          }}
          aria-label="Changer de portail"
        >
          <AdvertisMonogram className="h-7 w-7" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={8}
        align="start"
        className="w-[260px] p-2"
      >
        <p className="px-2 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Portails
        </p>
        <div className="flex flex-col gap-0.5">
          {available.map((portal) => (
            <PortalCard
              key={portal.id}
              portal={portal}
              isCurrent={portal.id === current.id}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Mobile: Floating button → bottom sheet
// ---------------------------------------------------------------------------
export function PortalSwitcherMobile() {
  const { available, current, showSwitcher } = useAvailablePortals();

  if (!showSwitcher) return null;

  return (
    <div className="fixed top-3 left-3 z-40 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 bg-background shadow-md transition-transform active:scale-90"
            style={{ borderColor: current.color }}
            aria-label="Changer de portail"
          >
            <AdvertisMonogram className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="pb-8">
          <SheetHeader>
            <SheetTitle className="text-base">Portails</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 p-4">
            {available.map((portal) => (
              <PortalCard
                key={portal.id}
                portal={portal}
                isCurrent={portal.id === current.id}
                variant="grid"
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Glory sidebar: horizontal portal icons row
// ---------------------------------------------------------------------------
export function PortalSwitcherCompact() {
  const { available, current, showSwitcher } = useAvailablePortals();

  if (!showSwitcher) return null;

  return (
    <div className="flex items-center gap-1.5 px-5 py-2">
      {available.map((portal) => {
        const Icon = getPortalIcon(portal.iconName);
        const isCurrent = portal.id === current.id;
        return (
          <Link
            key={portal.id}
            href={portal.href}
            title={portal.name}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              isCurrent
                ? "bg-white/15 ring-1 ring-white/30"
                : "hover:bg-white/10 opacity-50 hover:opacity-80",
            )}
          >
            <Icon
              className="h-4 w-4"
              style={{ color: isCurrent ? portal.color : "rgba(255,255,255,0.7)" }}
            />
          </Link>
        );
      })}
    </div>
  );
}
