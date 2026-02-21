// ==========================================================================
// SHELL S.5 — ClientShell
// Layout shell for CLIENT_RETAINER role.
// Minimal navigation: cockpit, briefs, intervention requests.
// ==========================================================================

"use client";

import {
  BarChart3,
  FileText,
  MessageSquare,
} from "lucide-react";
import { BottomNav, type BottomNavItem } from "./bottom-nav";
import { RailNav, type RailNavItem } from "./rail-nav";

const NAV_ITEMS: (BottomNavItem & RailNavItem)[] = [
  { href: "/", label: "Cockpit", icon: BarChart3 },
  { href: "/briefs", label: "Briefs", icon: FileText },
  { href: "/requests", label: "Demandes", icon: MessageSquare },
];

interface ClientShellProps {
  children: React.ReactNode;
}

export function ClientShell({ children }: ClientShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <RailNav items={NAV_ITEMS} />
      <main className="flex-1 overflow-auto bg-dotgrid pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav items={NAV_ITEMS} />
    </div>
  );
}
