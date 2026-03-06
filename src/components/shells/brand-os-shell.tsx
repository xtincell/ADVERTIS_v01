// ==========================================================================
// SHELL S.9 — BrandOSShell
// Layout shell for the Brand OS portal (Retainer clients).
// Uses the shared AppShell with sidebar + header + bottom nav.
// Wraps children in BrandOSProvider for global brand selection.
// Color: amber-500 (gold — the retainer crown).
// ==========================================================================

"use client";

import {
  Atom,
  Activity,
  Radio,
  Zap,
  Radar,
  FlaskConical,
  Sparkles,
  ShieldAlert,
  LayoutDashboard,
  Crown,
  FolderOpen,
  Settings,
} from "lucide-react";
import { AppShell } from "./app-shell";
import type { SidebarNavItem } from "./app-sidebar";
import type { BottomNavItem } from "./bottom-nav";
import { BrandOSProvider } from "~/components/brand-os/brand-os-provider";
import { BrandSelector } from "~/components/brand-os/brand-selector";
import { BrandOSBreadcrumb } from "~/components/brand-os/brand-os-breadcrumb";

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { href: "/os", label: "Nucleus", icon: Atom, exact: true },
  { href: "/os/pulse", label: "Pulse", icon: Activity },
  { href: "/os/touchpoints", label: "Touchpoints", icon: Radio },
  { href: "/os/actions", label: "Actions", icon: Zap },
  { href: "/os/opportunities", label: "Opportunités", icon: Radar },
  { href: "/os/apostres", label: "Apôtres", icon: Crown },
  { href: "/os/vault", label: "Brand Vault", icon: FolderOpen },
];

const SECONDARY_ITEMS: SidebarNavItem[] = [
  { href: "/os/strategy-lab", label: "Strategy Lab", icon: FlaskConical },
  { href: "/os/glory-feed", label: "Glory Feed", icon: Sparkles },
  { href: "/os/risk-radar", label: "Risk Radar", icon: ShieldAlert },
  { href: "/os/bridge", label: "Bridge", icon: LayoutDashboard },
  { href: "/os/settings", label: "Paramètres", icon: Settings },
];

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { href: "/os", label: "Nucleus", icon: Atom },
  { href: "/os/pulse", label: "Pulse", icon: Activity },
  { href: "/os/actions", label: "Actions", icon: Zap },
  { href: "/os/opportunities", label: "Radar", icon: Radar },
  { href: "/os/bridge", label: "Bridge", icon: LayoutDashboard },
];

function HeaderSlot() {
  return (
    <div className="flex items-center gap-3 w-full">
      <BrandOSBreadcrumb />
      <div className="flex-1" />
      <BrandSelector compact />
    </div>
  );
}

export function BrandOSShell({ children }: { children: React.ReactNode }) {
  return (
    <BrandOSProvider>
      <AppShell
        portalName="Brand OS"
        portalDescription="OS de marque — Retainer"
        portalIcon={Atom}
        portalColor="#F59E0B"
        items={SIDEBAR_ITEMS}
        secondaryItems={SECONDARY_ITEMS}
        bottomNavItems={BOTTOM_NAV_ITEMS}
        headerSlot={<HeaderSlot />}
      >
        {children}
      </AppShell>
    </BrandOSProvider>
  );
}
