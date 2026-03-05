// ==========================================================================
// SHELL S.7 — AppSidebar (v3)
// Premium dark sidebar with gradient bg, glow icons, accent active bar.
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
// Nav Item (shared between primary & secondary)
// ---------------------------------------------------------------------------

function NavItem({
  item,
  active,
  portalColor,
}: {
  item: SidebarNavItem;
  active: boolean;
  portalColor: string;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
        active
          ? "text-white font-medium"
          : "text-white/60 hover:text-white hover:bg-white/[0.06]",
      )}
      style={
        active
          ? { backgroundColor: `${portalColor}20` }
          : undefined
      }
    >
      {/* Active accent bar */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full animate-scale-in"
          style={{ backgroundColor: portalColor }}
        />
      )}

      {/* Icon with glow on hover/active */}
      <span
        className={cn(
          "shrink-0 transition-all duration-200",
          active
            ? "drop-shadow-[0_0_6px_var(--glow)]"
            : "group-hover:drop-shadow-[0_0_4px_var(--glow)]",
        )}
        style={{ "--glow": `${portalColor}60` } as React.CSSProperties}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="truncate">{item.label}</span>
    </Link>
  );
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
        "flex flex-col w-[240px] min-w-[240px] h-screen sidebar-transition",
        // Gradient background: subtle emerald tint at the top
        "bg-gradient-to-b from-[oklch(0.13_0.008_163)] to-[oklch(0.09_0.003_163)]",
        "text-white border-r border-white/[0.06]",
        mobile ? "sticky top-0" : "hidden md:flex sticky top-0",
      )}
    >
      {/* Portal logo / name */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-2">
        <PortalIcon
          className="h-7 w-7 shrink-0 drop-shadow-[0_0_8px_var(--glow)]"
          style={{
            color: portalColor,
            "--glow": `${portalColor}40`,
          } as React.CSSProperties}
        />
        <span className="text-lg font-bold tracking-tight font-[var(--font-display)]">
          {portalName}
        </span>
      </div>

      {/* Portal switcher (compact horizontal row) */}
      <PortalSwitcherCompact />

      {/* Separator — gradient fade */}
      <div className="mx-4 mt-3 mb-2 section-divider opacity-30" />

      {/* Navigation items (scrollable) */}
      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-0.5 pb-4">
          {items.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={isItemActive(item)}
              portalColor={portalColor}
            />
          ))}

          {/* Secondary items (if any) */}
          {secondaryItems && secondaryItems.length > 0 && (
            <>
              <div className="mx-0 my-2 section-divider opacity-30" />
              {secondaryItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  active={isItemActive(item)}
                  portalColor={portalColor}
                />
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <p className="text-[10px] text-white/25 text-center tracking-wider uppercase">
          {portalName} — ADVERTIS
        </p>
      </div>
    </aside>
  );
}
