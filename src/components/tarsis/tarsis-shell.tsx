"use client";

// =============================================================================
// COMP C.TARSIS — TarsisShell
// =============================================================================
// Main shell layout for the TARSIS market intelligence portal.
// Desktop: sidebar (240px fixed) + main content area.
// Mobile: top header with sheet nav + bottom-safe content.
// =============================================================================

import { Menu, Radar } from "lucide-react";
import { cn } from "~/lib/utils";
import { TarsisSidebar } from "./tarsis-sidebar";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { PortalSwitcherMobile } from "~/components/shells/portal-switcher";
import { ViewAsSwitcher } from "~/components/shells/view-as-switcher";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TarsisShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile portal switcher */}
      <PortalSwitcherMobile />

      {/* Desktop Sidebar */}
      <TarsisSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            "border-b border-border bg-card/80 backdrop-blur-xl shrink-0",
          )}
        >
          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-zinc-950">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation TARSIS</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <TarsisSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile title */}
          <div className="flex items-center gap-2 md:hidden">
            <Radar className="h-5 w-5 text-cyan-600" />
            <span className="font-bold text-lg">TARSIS</span>
          </div>

          {/* Desktop — section title area */}
          <div className="hidden md:flex items-center gap-2">
            <Radar className="h-4 w-4 text-cyan-600" />
            <span className="text-sm font-medium text-muted-foreground">
              Intelligence Marché
            </span>
          </div>

          {/* ViewAs switcher (admin only) */}
          <div className="flex-1 flex justify-end">
            <ViewAsSwitcher />
          </div>
        </header>

        {/* Page content (scrollable) */}
        <main className="flex-1 overflow-y-auto animate-page-enter">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
