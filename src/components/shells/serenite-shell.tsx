// ==========================================================================
// SHELL S.9 — SereniteShell
// Layout shell for Sérénité portal (Finance & Administration).
// Uses the shared AppShell with sidebar + header + bottom nav.
// Color: cyan-500.
// ==========================================================================

"use client";

import {
  Shield,
  LayoutDashboard,
  FileText,
  Handshake,
  Lock,
  Cpu,
  ShieldCheck,
  Settings,
  Users,
  Plug,
} from "lucide-react";
import { AppShell } from "./app-shell";
import type { SidebarNavItem } from "./app-sidebar";
import type { BottomNavItem } from "./bottom-nav";

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { href: "/serenite", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/serenite/invoices", label: "Factures", icon: FileText },
  { href: "/serenite/contracts", label: "Contrats", icon: Handshake },
  { href: "/serenite/escrow", label: "Séquestre", icon: Lock },
];

const SECONDARY_ITEMS: SidebarNavItem[] = [
  { href: "/serenite/users", label: "Utilisateurs", icon: Users },
  { href: "/serenite/costs", label: "Coûts IA", icon: Cpu },
  { href: "/serenite/integrations", label: "Intégrations", icon: Plug },
  { href: "/serenite/admin", label: "Admin", icon: ShieldCheck },
  { href: "/serenite/settings", label: "Paramètres", icon: Settings },
];

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { href: "/serenite", label: "Dashboard", icon: LayoutDashboard },
  { href: "/serenite/invoices", label: "Factures", icon: FileText },
  { href: "/serenite/contracts", label: "Contrats", icon: Handshake },
  { href: "/serenite/escrow", label: "Séquestre", icon: Lock },
  { href: "/serenite/costs", label: "Coûts", icon: Cpu },
];

export function SereniteShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      portalName="Sérénité"
      portalDescription="Finance & administration"
      portalIcon={Shield}
      portalColor="#06B6D4"
      items={SIDEBAR_ITEMS}
      secondaryItems={SECONDARY_ITEMS}
      bottomNavItems={BOTTOM_NAV_ITEMS}
    >
      {children}
    </AppShell>
  );
}
