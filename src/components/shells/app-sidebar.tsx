// ==========================================================================
// SHELL S.7 — AppSidebar
// Parametric dark sidebar for Operator, Client, Freelance, Guilde portals.
// Mirrors TarsisSidebar pattern: dark bg, icon+label items, portal switcher.
// ==========================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import { PortalSwitcherCompact } from "~/components/shells/portal-switcher";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** If true, only exact pathname match triggers active state. */
  exact?: boolean;
}

interface AppSidebarProps {
  portalName: string;
  portalIcon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  portalColor: string;
  items: SidebarNavItem[];
  /** Optional secondary items shown below a separator. */
  secondaryItems?: SidebarNavItem[];
  /** When true, renders without `hidden md:flex` (for mobile Sheet). */
  mobile?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppSidebar({
  portalName,
  portalIcon: PortalIcon,
  portalColor,
  items,
  secondaryItems,
  mobile = false,
}: AppSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (item: SidebarNavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <aside
      className={cn(
        "flex flex-col w-[240px] min-w-[240px] bg-zinc-950 text-white h-screen",
        mobile ? "sticky top-0" : "hidden md:flex sticky top-0",
      )}
    >
      {/* Portal logo / name */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-2">
        <PortalIcon
          className="h-6 w-6 shrink-0"
          style={{ color: portalColor }}
        />
        <span className="text-xl font-bold tracking-tight">{portalName}</span>
      </div>

      {/* Portal switcher (compact horizontal row) */}
      <PortalSwitcherCompact />

      {/* Separator */}
      <div className="mx-4 mt-3 mb-2 h-px bg-white/10" />

      {/* Navigation items (scrollable) */}
      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-0.5 pb-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-200",
                  active
                    ? "text-white font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white",
                )}
                style={
                  active
                    ? { backgroundColor: `${portalColor}33` } // ~20% opacity
                    : undefined
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          {/* Secondary items (if any) */}
          {secondaryItems && secondaryItems.length > 0 && (
            <>
              <div className="mx-0 my-2 h-px bg-white/10" />
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-200",
                      active
                        ? "text-white font-medium"
                        : "text-white/70 hover:bg-white/5 hover:text-white",
                    )}
                    style={
                      active
                        ? { backgroundColor: `${portalColor}33` }
                        : undefined
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-[10px] text-white/30 text-center">
          {portalName} v1.0 — ADVERTIS
        </p>
      </div>
    </aside>
  );
}
