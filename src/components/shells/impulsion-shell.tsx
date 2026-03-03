// ==========================================================================
// SHELL S.7 — ImpulsionShell
// Layout shell for Impulsion portal (Strategy & Brands).
// Uses the shared AppShell with sidebar + header + bottom nav.
// Color: indigo-500.
// ==========================================================================

"use client";

import {
  Rocket,
  LayoutDashboard,
  Plus,
  GitBranch,
  ShieldAlert,
  BarChart3,
  Brain,
  Globe,
  Palette,
  Handshake,
  Users,
  Target,
} from "lucide-react";
import { AppShell } from "./app-shell";
import type { SidebarNavItem } from "./app-sidebar";
import type { BottomNavItem } from "./bottom-nav";

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { href: "/impulsion", label: "Marques", icon: LayoutDashboard, exact: true },
  { href: "/impulsion/new", label: "Nouveau", icon: Plus },
  { href: "/impulsion/crm", label: "Pipeline CRM", icon: Handshake },
  { href: "/impulsion/tree", label: "Arbre", icon: GitBranch },
];

const SECONDARY_ITEMS: SidebarNavItem[] = [
  { href: "/impulsion/cohorts", label: "Cohortes", icon: Users },
  { href: "/impulsion/attribution", label: "Attribution", icon: Target },
  { href: "/impulsion/risk", label: "Risques", icon: ShieldAlert },
  { href: "/impulsion/market", label: "Marchés", icon: BarChart3 },
  { href: "/impulsion/intelligence", label: "Intelligence", icon: Brain },
  { href: "/impulsion/ecosystem", label: "Écosystème", icon: Globe },
  { href: "/impulsion/presets", label: "Présets", icon: Palette },
];

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { href: "/impulsion", label: "Marques", icon: LayoutDashboard },
  { href: "/impulsion/crm", label: "CRM", icon: Handshake },
  { href: "/impulsion/new", label: "Nouveau", icon: Plus },
  { href: "/impulsion/tree", label: "Arbre", icon: GitBranch },
  { href: "/impulsion/risk", label: "Risques", icon: ShieldAlert },
];

export function ImpulsionShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      portalName="Impulsion"
      portalDescription="Stratégie & marques"
      portalIcon={Rocket}
      portalColor="#6366F1"
      items={SIDEBAR_ITEMS}
      secondaryItems={SECONDARY_ITEMS}
      bottomNavItems={BOTTOM_NAV_ITEMS}
    >
      {children}
    </AppShell>
  );
}
