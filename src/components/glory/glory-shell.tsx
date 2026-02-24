"use client";

// =============================================================================
// COMP C.GLORY — GloryShell
// =============================================================================
// Main shell layout for the GLORY platform.
// Desktop: sidebar (240px fixed) + main content area.
// Mobile: top header with sheet nav + bottom-safe content.
// =============================================================================

import { useCallback } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Menu, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { GlorySidebar } from "./glory-sidebar";
import { StrategySelector } from "./strategy-selector";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GloryShellProps {
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GloryShell({ children }: GloryShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const strategyId = searchParams.get("strategyId") ?? undefined;

  // Fetch all GLORY tools for the sidebar
  const { data: tools, isLoading: toolsLoading } =
    api.glory.listTools.useQuery();

  // Handle strategy change — update URL search params
  const handleStrategyChange = useCallback(
    (newStrategyId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("strategyId", newStrategyId);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const toolsList = tools ?? [];

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      {/* ----------------------------------------------------------------- */}
      {/* Desktop Sidebar */}
      {/* ----------------------------------------------------------------- */}
      {toolsLoading ? (
        <aside className="hidden md:flex flex-col w-[240px] min-w-[240px] bg-[#1a1a2e] h-screen">
          <div className="flex items-center gap-2 px-5 pt-5 pb-4">
            <Sparkles className="h-6 w-6 text-[#6C5CE7]" />
            <span className="text-xl font-bold tracking-tight text-white">
              GLORY
            </span>
          </div>
          <div className="px-5 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-6 w-full bg-white/10 rounded"
              />
            ))}
          </div>
        </aside>
      ) : (
        <GlorySidebar tools={toolsList} strategyId={strategyId} />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Main content area */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* --------------------------------------------------------------- */}
        {/* Top bar */}
        {/* --------------------------------------------------------------- */}
        <header
          className={cn(
            "flex items-center justify-between gap-3 px-4 py-3",
            "border-b border-gray-200 bg-white shrink-0",
          )}
        >
          {/* Mobile hamburger + sheet nav */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-[#1a1a2e]">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation GLORY</SheetTitle>
                </SheetHeader>
                {!toolsLoading && (
                  <div className="flex flex-col h-full">
                    <GlorySidebar tools={toolsList} strategyId={strategyId} />
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile title */}
          <div className="flex items-center gap-2 md:hidden">
            <Sparkles className="h-5 w-5 text-[#6C5CE7]" />
            <span className="font-bold text-lg">GLORY</span>
          </div>

          {/* Strategy Selector (always visible in top bar) */}
          <div className="flex-1 flex justify-end md:justify-start">
            <StrategySelector
              value={strategyId}
              onChange={handleStrategyChange}
            />
          </div>
        </header>

        {/* --------------------------------------------------------------- */}
        {/* Page content (scrollable) */}
        {/* --------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
