// ==========================================================================
// SHELL S.9 — DashboardShell
// Layout shell for the cross-portal general dashboard.
// Uses the shared AppShell with sidebar linking to all operator portals.
// Color: indigo-500.
// ==========================================================================

"use client";

import {
  LayoutGrid,
  LayoutDashboard,
  Rocket,
  Compass,
  Sparkles,
  Radar,
  Users,
  Shield,
} from "lucide-react";
import { AppShell } from "./app-shell";
import type { SidebarNavItem } from "./app-sidebar";
import type { BottomNavItem } from "./bottom-nav";

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard, exact: true },
  { href: "/impulsion", label: "Impulsion", icon: Rocket },
  { href: "/pilotis", label: "Pilotis", icon: Compass },
  { href: "/glory", label: "GLORY", icon: Sparkles },
  { href: "/tarsis", label: "TARSIS", icon: Radar },
  { href: "/guilde", label: "La Guilde", icon: Users },
  { href: "/serenite", label: "Sérénité", icon: Shield },
];

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/impulsion", label: "Marques", icon: Rocket },
  { href: "/pilotis", label: "Missions", icon: Compass },
  { href: "/glory", label: "GLORY", icon: Sparkles },
  { href: "/serenite", label: "Finance", icon: Shield },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      portalName="Artemis"
      portalDescription="Vue d'ensemble"
      portalIcon={LayoutGrid}
      portalColor="#6366F1"
      items={SIDEBAR_ITEMS}
      bottomNavItems={BOTTOM_NAV_ITEMS}
    >
      {children}
    </AppShell>
  );
}
