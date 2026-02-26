// ==========================================================================
// Portal Configuration
// Centralised definition of all ADVERTIS portals.
// Used by: PortalSwitcher, useAvailablePortals, shells.
// ==========================================================================

import type { UserRole } from "~/lib/constants";

export interface PortalDefinition {
  id: "operator" | "glory" | "client" | "freelance";
  name: string;
  shortName: string;
  description: string;
  href: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  iconName: string;
  allowedRoles: UserRole[];
}

export const PORTALS: PortalDefinition[] = [
  {
    id: "operator",
    name: "ADVERTIS",
    shortName: "ADV",
    description: "Gestion des marques et missions",
    href: "/dashboard",
    color: "var(--terracotta, #c45a3c)",
    bgClass: "bg-terracotta/10",
    textClass: "text-terracotta",
    borderClass: "border-terracotta/30",
    iconName: "LayoutDashboard",
    allowedRoles: ["ADMIN", "OPERATOR"],
  },
  {
    id: "glory",
    name: "GLORY",
    shortName: "GLR",
    description: "Outils IA opérationnels",
    href: "/glory",
    color: "#6C5CE7",
    bgClass: "bg-[#6C5CE7]/10",
    textClass: "text-[#6C5CE7]",
    borderClass: "border-[#6C5CE7]/30",
    iconName: "Sparkles",
    allowedRoles: ["ADMIN", "OPERATOR"],
  },
  {
    id: "client",
    name: "Client",
    shortName: "CLI",
    description: "Cockpit et documents",
    href: "/cockpit",
    color: "var(--forest, #2d5a3d)",
    bgClass: "bg-forest/10",
    textClass: "text-forest",
    borderClass: "border-forest/30",
    iconName: "BarChart3",
    allowedRoles: ["ADMIN", "CLIENT_RETAINER", "CLIENT_STATIC"],
  },
  {
    id: "freelance",
    name: "Freelance",
    shortName: "FRL",
    description: "Missions et livrables",
    href: "/my-missions",
    color: "var(--gold, #c49a3c)",
    bgClass: "bg-gold/10",
    textClass: "text-gold",
    borderClass: "border-gold/30",
    iconName: "Briefcase",
    allowedRoles: ["ADMIN", "FREELANCE"],
  },
];

/** Route prefixes that belong to each portal (for detection). */
const PORTAL_ROUTES: Record<PortalDefinition["id"], string[]> = {
  glory: ["/glory"],
  client: ["/cockpit", "/oracle", "/my-documents", "/requests"],
  freelance: ["/my-missions", "/my-briefs", "/upload", "/profile"],
  operator: ["/dashboard", "/brand", "/new", "/tree", "/missions", "/more"],
};

/** Detect which portal a pathname belongs to. */
export function detectPortal(pathname: string): PortalDefinition {
  for (const portal of PORTALS) {
    const routes = PORTAL_ROUTES[portal.id];
    if (routes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      return portal;
    }
  }
  // Default to operator
  return PORTALS[0]!;
}
