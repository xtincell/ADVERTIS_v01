// ==========================================================================
// SHELL S.8 — AppShell
// Shared layout orchestrator for Operator, Client, Freelance, Guilde portals.
// Composes: AppSidebar (desktop) + Header (glassmorphism) + BottomNav (mobile)
//           + Sheet hamburger (mobile sidebar).
// Mirrors the Glory/Tarsis shell pattern for a harmonized UX.
// ==========================================================================

"use client";

import { Menu } from "lucide-react";
import { cn } from "~/lib/utils";
import { AppSidebar, type SidebarNavItem } from "./app-sidebar";
import { BottomNav, type BottomNavItem } from "./bottom-nav";
import { ViewAsSwitcher } from "./view-as-switcher";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { PortalSwitcherMobile } from "~/components/shells/portal-switcher";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AppShellProps {
  portalName: string;
  portalDescription: string;
  portalIcon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  portalColor: string;
  /** Sidebar navigation items. */
  items: SidebarNavItem[];
  /** Optional secondary sidebar items (shown below separator). */
  secondaryItems?: SidebarNavItem[];
  /** Items for the mobile bottom nav (max 5 recommended). */
  bottomNavItems: BottomNavItem[];
  /** Optional slot rendered at the right of the header bar. */
  headerSlot?: React.ReactNode;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppShell({
  portalName,
  portalDescription,
  portalIcon: PortalIcon,
  portalColor,
  items,
  secondaryItems,
  bottomNavItems,
  headerSlot,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile portal switcher (floating button) */}
      <PortalSwitcherMobile />

      {/* Desktop sidebar */}
      <AppSidebar
        portalName={portalName}
        portalIcon={PortalIcon}
        portalColor={portalColor}
        items={items}
        secondaryItems={secondaryItems}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* ----------------------------------------------------------------- */}
        {/* Header bar (glassmorphism) */}
        {/* ----------------------------------------------------------------- */}
        <header
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            "border-b border-border bg-card/80 backdrop-blur-xl shrink-0",
          )}
        >
          {/* Mobile: hamburger → Sheet with sidebar */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-zinc-950">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation {portalName}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <AppSidebar
                    portalName={portalName}
                    portalIcon={PortalIcon}
                    portalColor={portalColor}
                    items={items}
                    secondaryItems={secondaryItems}
                    mobile
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile: portal title */}
          <div className="flex items-center gap-2 md:hidden">
            <PortalIcon
              className="h-5 w-5"
              style={{ color: portalColor }}
            />
            <span className="font-bold text-lg">{portalName}</span>
          </div>

          {/* Desktop: section context */}
          <div className="hidden md:flex items-center gap-2">
            <PortalIcon
              className="h-4 w-4"
              style={{ color: portalColor }}
            />
            <span className="text-sm font-medium text-muted-foreground">
              {portalDescription}
            </span>
          </div>

          {/* Right side: ViewAs switcher (admin) + optional header slot */}
          <div className="flex-1 flex items-center justify-end gap-3">
            {headerSlot}
            <ViewAsSwitcher />
          </div>
        </header>

        {/* ----------------------------------------------------------------- */}
        {/* Page content (scrollable) */}
        {/* ----------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 animate-page-enter">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav (kept for thumb reach) */}
      <BottomNav items={bottomNavItems} />
    </div>
  );
}
