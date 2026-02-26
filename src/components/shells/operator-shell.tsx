// ==========================================================================
// SHELL S.3 — OperatorShell
// Layout shell for ADMIN + OPERATOR roles.
// Rail nav (desktop) + bottom nav (mobile) + main content area.
// ==========================================================================

"use client";

import {
  LayoutDashboard,
  GitBranch,
  Plus,
  Briefcase,
  MoreHorizontal,
} from "lucide-react";
import { BottomNav, type BottomNavItem } from "./bottom-nav";
import { RailNav, type RailNavItem } from "./rail-nav";
import { PortalSwitcher, PortalSwitcherMobile } from "./portal-switcher";

const NAV_ITEMS: (BottomNavItem & RailNavItem)[] = [
  { href: "/dashboard", label: "Marques", icon: LayoutDashboard },
  { href: "/tree", label: "Arbre", icon: GitBranch },
  { href: "/new", label: "Nouveau", icon: Plus },
  { href: "/missions", label: "Missions", icon: Briefcase },
  { href: "/more", label: "Plus", icon: MoreHorizontal },
];

interface OperatorShellProps {
  children: React.ReactNode;
}

export function OperatorShell({ children }: OperatorShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop: Rail nav with portal switcher on logo */}
      <RailNav items={NAV_ITEMS} logoSlot={<PortalSwitcher />} />

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-dotgrid pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile: Bottom nav + portal switcher */}
      <BottomNav items={NAV_ITEMS} />
      <PortalSwitcherMobile />
    </div>
  );
}
