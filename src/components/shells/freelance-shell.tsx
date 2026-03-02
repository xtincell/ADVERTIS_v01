// ==========================================================================
// SHELL S.4 — FreelanceShell
// Layout shell for FREELANCE role.
// Uses the shared AppShell with sidebar + header + bottom nav.
// ==========================================================================

"use client";

import {
  Briefcase,
  FileText,
  Upload,
  User,
  Wallet,
} from "lucide-react";
import { AppShell } from "./app-shell";
import type { SidebarNavItem } from "./app-sidebar";
import type { BottomNavItem } from "./bottom-nav";

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { href: "/my-missions", label: "Missions", icon: Briefcase },
  { href: "/my-briefs", label: "Briefs", icon: FileText },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/my-finances", label: "Finances", icon: Wallet },
  { href: "/profile", label: "Profil", icon: User },
];

const BOTTOM_NAV_ITEMS: BottomNavItem[] = SIDEBAR_ITEMS;

export function FreelanceShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      portalName="Freelance"
      portalDescription="Missions et livrables"
      portalIcon={Briefcase}
      portalColor="#F59E0B"
      items={SIDEBAR_ITEMS}
      bottomNavItems={BOTTOM_NAV_ITEMS}
    >
      {children}
    </AppShell>
  );
}
