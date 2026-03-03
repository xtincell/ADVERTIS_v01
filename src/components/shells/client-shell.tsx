// ==========================================================================
// SHELL S.5 — ClientShell
// Layout shell for CLIENT_RETAINER + CLIENT_STATIC roles.
// Uses the shared AppShell with sidebar + header + bottom nav.
// For retainer users: wraps with BrandOSProvider and shows BrandSelector
// in the header so the brand context is always visible.
// ==========================================================================

"use client";

import {
  BarChart3,
  Eye,
  FileText,
  MessageSquare,
} from "lucide-react";
import { AppShell } from "./app-shell";
import type { SidebarNavItem } from "./app-sidebar";
import type { BottomNavItem } from "./bottom-nav";
import { useRole } from "~/components/hooks/use-role";
import { BrandOSProvider } from "~/components/brand-os/brand-os-provider";
import { BrandSelector } from "~/components/brand-os/brand-selector";

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { href: "/cockpit", label: "Cockpit", icon: BarChart3 },
  { href: "/oracle", label: "L'Oracle", icon: Eye },
  { href: "/my-documents", label: "Documents", icon: FileText },
  { href: "/requests", label: "Demandes", icon: MessageSquare },
];

const BOTTOM_NAV_ITEMS: BottomNavItem[] = SIDEBAR_ITEMS;

/** Roles that have access to Brand OS portal. */
const BRAND_OS_ROLES = ["ADMIN", "OPERATOR", "CLIENT_RETAINER"];

function RetainerHeaderSlot() {
  return (
    <div className="flex items-center gap-3 w-full justify-end">
      <BrandSelector compact />
    </div>
  );
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  const hasBrandOS = BRAND_OS_ROLES.includes(role);

  const shell = (
    <AppShell
      portalName="Client"
      portalDescription="Cockpit et documents"
      portalIcon={BarChart3}
      portalColor="#F43F5E"
      items={SIDEBAR_ITEMS}
      bottomNavItems={BOTTOM_NAV_ITEMS}
      headerSlot={hasBrandOS ? <RetainerHeaderSlot /> : undefined}
    >
      {children}
    </AppShell>
  );

  // Wrap with BrandOSProvider so the BrandSelector in the header works
  if (hasBrandOS) {
    return <BrandOSProvider>{shell}</BrandOSProvider>;
  }

  return shell;
}
