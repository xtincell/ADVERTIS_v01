"use client";

// =============================================================================
// COMP C.TARSIS — TarsisSidebar
// =============================================================================
// Sidebar navigation for the TARSIS market intelligence portal.
// 6 static navigation links — no dynamic tools, no collapsible sections.
// =============================================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BarChart3,
  Zap,
  FlaskConical,
  Calendar,
  Radar,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import { PortalSwitcherCompact } from "~/components/shells/portal-switcher";

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { href: "/tarsis", label: "Hub", icon: Home, exact: true },
  { href: "/tarsis/radar", label: "Radar Concurrentiel", icon: Users, exact: false },
  { href: "/tarsis/sizing", label: "Dimensionnement", icon: BarChart3, exact: false },
  { href: "/tarsis/signals", label: "Signaux & Tendances", icon: Zap, exact: false },
  { href: "/tarsis/hypotheses", label: "Hypothèses", icon: FlaskConical, exact: false },
  { href: "/tarsis/opportunities", label: "Opportunités", icon: Calendar, exact: false },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TarsisSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[240px] min-w-[240px] bg-zinc-950 text-white h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
        <Radar className="h-6 w-6 text-cyan-600" />
        <span className="text-xl font-bold tracking-tight">TARSIS</span>
      </div>

      {/* Portal switcher */}
      <PortalSwitcherCompact />

      {/* Separator */}
      <div className="mx-4 mt-3 mb-2 h-px bg-white/10" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-0.5 pb-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-200",
                  isActive
                    ? "bg-cyan-600/20 text-white font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-[10px] text-white/30 text-center">
          TARSIS v1.0 — ADVERTIS
        </p>
      </div>
    </aside>
  );
}
