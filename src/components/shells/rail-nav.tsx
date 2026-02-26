// ==========================================================================
// SHELL S.2 — RailNav
// Desktop icon-only vertical navigation rail (56px width).
// ==========================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { AdvertisMonogram } from "~/components/brand/advertis-logo";

export interface RailNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface RailNavProps {
  items: RailNavItem[];
  /** Optional slot replacing the default logo link. Used by PortalSwitcher. */
  logoSlot?: React.ReactNode;
}

/**
 * Desktop vertical rail navigation (hidden on mobile).
 * 56px wide, icon-only with tooltip on hover.
 */
export function RailNav({ items, logoSlot }: RailNavProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex h-screen w-14 flex-col items-center border-r bg-background py-3 gap-1">
      {/* Logo / Portal Switcher */}
      <div className="mb-4 flex h-10 w-10 items-center justify-center">
        {logoSlot ?? (
          <Link href="/">
            <AdvertisMonogram className="h-7 w-7" />
          </Link>
        )}
      </div>

      {/* Nav items */}
      <div className="flex flex-1 flex-col items-center gap-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-terracotta/10 text-terracotta"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
}
