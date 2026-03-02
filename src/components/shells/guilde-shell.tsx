// ==========================================================================
// SHELL S.6 — GuildeShell
// Layout shell for La Guilde portal (Talent Marketplace).
// Uses the shared AppShell with sidebar + header + bottom nav.
// Color: emerald-600.
// ==========================================================================

"use client";

import {
  Users,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "./app-shell";
import type { SidebarNavItem } from "./app-sidebar";
import type { BottomNavItem } from "./bottom-nav";

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { href: "/guilde", label: "Répertoire", icon: Users, exact: true },
  { href: "/guilde/matching", label: "Matching", icon: Target },
  { href: "/guilde/certifications", label: "Certifications", icon: Award },
  { href: "/guilde/progression", label: "Progression", icon: TrendingUp },
];

const BOTTOM_NAV_ITEMS: BottomNavItem[] = SIDEBAR_ITEMS;

export function GuildeShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      portalName="La Guilde"
      portalDescription="Talents & matching"
      portalIcon={Users}
      portalColor="#059669"
      items={SIDEBAR_ITEMS}
      bottomNavItems={BOTTOM_NAV_ITEMS}
    >
      {children}
    </AppShell>
  );
}
