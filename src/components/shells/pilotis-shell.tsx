// ==========================================================================
// SHELL S.8 — PilotisShell
// Layout shell for Pilotis portal (Mission Operations).
// Uses the shared AppShell with sidebar + header + bottom nav.
// Color: orange-500.
// ==========================================================================

"use client";

import {
  Compass,
  Briefcase,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { AppShell } from "./app-shell";
import type { SidebarNavItem } from "./app-sidebar";
import type { BottomNavItem } from "./bottom-nav";

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { href: "/pilotis", label: "Missions", icon: Briefcase, exact: true },
  { href: "/pilotis/interventions", label: "Interventions", icon: AlertTriangle },
  { href: "/pilotis/pricing", label: "Tarification", icon: DollarSign },
];

const BOTTOM_NAV_ITEMS: BottomNavItem[] = SIDEBAR_ITEMS;

export function PilotisShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      portalName="Pilotis"
      portalDescription="Gestion des missions"
      portalIcon={Compass}
      portalColor="#F97316"
      items={SIDEBAR_ITEMS}
      bottomNavItems={BOTTOM_NAV_ITEMS}
    >
      {children}
    </AppShell>
  );
}
