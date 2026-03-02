// ==========================================================================
// SHELL S.5 — ClientShell
// Layout shell for CLIENT_RETAINER + CLIENT_STATIC roles.
// Uses the shared AppShell with sidebar + header + bottom nav.
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

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { href: "/cockpit", label: "Cockpit", icon: BarChart3 },
  { href: "/oracle", label: "L'Oracle", icon: Eye },
  { href: "/my-documents", label: "Documents", icon: FileText },
  { href: "/requests", label: "Demandes", icon: MessageSquare },
];

const BOTTOM_NAV_ITEMS: BottomNavItem[] = SIDEBAR_ITEMS;

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      portalName="Client"
      portalDescription="Cockpit et documents"
      portalIcon={BarChart3}
      portalColor="#F43F5E"
      items={SIDEBAR_ITEMS}
      bottomNavItems={BOTTOM_NAV_ITEMS}
    >
      {children}
    </AppShell>
  );
}
