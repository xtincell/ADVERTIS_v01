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
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { BottomNav, type BottomNavItem } from "./bottom-nav";
import { RailNav, type RailNavItem } from "./rail-nav";

const NAV_ITEMS: (BottomNavItem & RailNavItem)[] = [
  { href: "/dashboard", label: "Marques", icon: LayoutDashboard },
  { href: "/tree", label: "Arbre", icon: GitBranch },
  { href: "/new", label: "Nouveau", icon: Plus },
  { href: "/missions", label: "Missions", icon: Briefcase },
  { href: "/glory", label: "Glory", icon: Sparkles },
  { href: "/more", label: "Plus", icon: MoreHorizontal },
];

interface OperatorShellProps {
  children: React.ReactNode;
}

export function OperatorShell({ children }: OperatorShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop: Rail nav */}
      <RailNav items={NAV_ITEMS} />

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-dotgrid pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile: Bottom nav */}
      <BottomNav items={NAV_ITEMS} />
    </div>
  );
}
