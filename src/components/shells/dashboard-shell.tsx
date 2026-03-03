// ==========================================================================
// SHELL S.9 — DashboardShell
// Layout shell for the cross-portal general dashboard.
// Uses the shared AppShell with sidebar linking to all operator portals.
// Color: indigo-500.
// For ADMIN users: includes BrandSelector in the header for brand context.
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
  MessageSquare,
  Brain,
} from "lucide-react";
import { AppShell } from "./app-shell";
import type { SidebarNavItem } from "./app-sidebar";
import type { BottomNavItem } from "./bottom-nav";
import { useViewAs } from "~/components/providers/view-as-provider";
import { BrandOSProvider } from "~/components/brand-os/brand-os-provider";
import { BrandSelector } from "~/components/brand-os/brand-selector";

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard, exact: true },
  { href: "/impulsion", label: "Impulsion", icon: Rocket },
  { href: "/pilotis", label: "Pilotis", icon: Compass },
  { href: "/glory", label: "GLORY", icon: Sparkles },
  { href: "/tarsis", label: "TARSIS", icon: Radar },
  { href: "/guilde", label: "La Guilde", icon: Users },
  { href: "/serenite", label: "Sérénité", icon: Shield },
  { href: "/messagerie", label: "Messagerie", icon: MessageSquare },
  { href: "/mestor", label: "MESTOR AI", icon: Brain },
];

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/impulsion", label: "Marques", icon: Rocket },
  { href: "/pilotis", label: "Missions", icon: Compass },
  { href: "/glory", label: "GLORY", icon: Sparkles },
  { href: "/serenite", label: "Finance", icon: Shield },
];

function AdminHeaderSlot() {
  return <BrandSelector compact />;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isRealAdmin, isViewingAs } = useViewAs();

  // Show brand selector for admin in normal mode (not ViewAs)
  const showBrandSelector = isRealAdmin && !isViewingAs;

  const shell = (
    <AppShell
      portalName="Artemis"
      portalDescription="Vue d'ensemble"
      portalIcon={LayoutGrid}
      portalColor="#6366F1"
      items={SIDEBAR_ITEMS}
      bottomNavItems={BOTTOM_NAV_ITEMS}
      headerSlot={showBrandSelector ? <AdminHeaderSlot /> : undefined}
    >
      {children}
    </AppShell>
  );

  if (showBrandSelector) {
    return <BrandOSProvider>{shell}</BrandOSProvider>;
  }

  return shell;
}
