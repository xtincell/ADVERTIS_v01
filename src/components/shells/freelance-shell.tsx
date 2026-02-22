// ==========================================================================
// SHELL S.4 — FreelanceShell
// Layout shell for FREELANCE role.
// Simplified navigation: missions, briefs, upload, profile.
// ==========================================================================

"use client";

import {
  Briefcase,
  FileText,
  Upload,
  User,
} from "lucide-react";
import { BottomNav, type BottomNavItem } from "./bottom-nav";
import { RailNav, type RailNavItem } from "./rail-nav";

const NAV_ITEMS: (BottomNavItem & RailNavItem)[] = [
  { href: "/my-missions", label: "Missions", icon: Briefcase },
  { href: "/my-briefs", label: "Briefs", icon: FileText },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/profile", label: "Profil", icon: User },
];

interface FreelanceShellProps {
  children: React.ReactNode;
}

export function FreelanceShell({ children }: FreelanceShellProps) {
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
