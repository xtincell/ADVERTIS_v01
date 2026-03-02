// ==========================================================================
// Portal Configuration
// Centralised definition of all ADVERTIS portals.
// Used by: PortalSwitcher, useAvailablePortals, shells.
// ==========================================================================

import type { UserRole } from "~/lib/constants";

export interface PortalDefinition {
  id:
    | "impulsion"
    | "pilotis"
    | "glory"
    | "tarsis"
    | "client"
    | "freelance"
    | "guilde"
    | "serenite";
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
    id: "impulsion",
    name: "Impulsion",
    shortName: "IMP",
    description: "Stratégie & marques",
    href: "/impulsion",
    color: "#6366F1",
    bgClass: "bg-indigo-500/10",
    textClass: "text-indigo-500",
    borderClass: "border-indigo-500/30",
    iconName: "Rocket",
    allowedRoles: ["ADMIN", "OPERATOR"],
  },
  {
    id: "pilotis",
    name: "Pilotis",
    shortName: "PLT",
    description: "Gestion des missions",
    href: "/pilotis",
    color: "#F97316",
    bgClass: "bg-orange-500/10",
    textClass: "text-orange-500",
    borderClass: "border-orange-500/30",
    iconName: "Compass",
    allowedRoles: ["ADMIN", "OPERATOR"],
  },
  {
    id: "glory",
    name: "GLORY",
    shortName: "GLR",
    description: "Outils IA opérationnels",
    href: "/glory",
    color: "#8B5CF6",
    bgClass: "bg-violet-500/10",
    textClass: "text-violet-500",
    borderClass: "border-violet-500/30",
    iconName: "Sparkles",
    allowedRoles: ["ADMIN", "OPERATOR"],
  },
  {
    id: "tarsis",
    name: "TARSIS",
    shortName: "TRS",
    description: "Intelligence marché & signaux",
    href: "/tarsis",
    color: "#0891B2",
    bgClass: "bg-cyan-600/10",
    textClass: "text-cyan-600",
    borderClass: "border-cyan-600/30",
    iconName: "Radar",
    allowedRoles: ["ADMIN", "OPERATOR"],
  },
  {
    id: "guilde",
    name: "La Guilde",
    shortName: "GLD",
    description: "Talents & matching",
    href: "/guilde",
    color: "#059669",
    bgClass: "bg-emerald-600/10",
    textClass: "text-emerald-600",
    borderClass: "border-emerald-600/30",
    iconName: "Users",
    allowedRoles: ["ADMIN", "OPERATOR"],
  },
  {
    id: "serenite",
    name: "Sérénité",
    shortName: "SER",
    description: "Finance & administration",
    href: "/serenite",
    color: "#06B6D4",
    bgClass: "bg-cyan-500/10",
    textClass: "text-cyan-500",
    borderClass: "border-cyan-500/30",
    iconName: "Shield",
    allowedRoles: ["ADMIN", "OPERATOR"],
  },
  {
    id: "client",
    name: "Client",
    shortName: "CLI",
    description: "Cockpit et documents",
    href: "/cockpit",
    color: "#F43F5E",
    bgClass: "bg-rose-500/10",
    textClass: "text-rose-500",
    borderClass: "border-rose-500/30",
    iconName: "BarChart3",
    allowedRoles: ["ADMIN", "CLIENT_RETAINER", "CLIENT_STATIC"],
  },
  {
    id: "freelance",
    name: "Freelance",
    shortName: "FRL",
    description: "Missions et livrables",
    href: "/my-missions",
    color: "#F59E0B",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-600",
    borderClass: "border-amber-500/30",
    iconName: "Briefcase",
    allowedRoles: ["ADMIN", "FREELANCE"],
  },
];

/** Route prefixes that belong to each portal (for detection). */
const PORTAL_ROUTES: Record<PortalDefinition["id"], string[]> = {
  impulsion: ["/impulsion"],
  pilotis: ["/pilotis"],
  glory: ["/glory"],
  tarsis: ["/tarsis"],
  guilde: ["/guilde"],
  serenite: ["/serenite"],
  client: ["/cockpit", "/oracle", "/my-documents", "/requests"],
  freelance: ["/my-missions", "/my-briefs", "/upload", "/profile", "/my-finances"],
};

/** Detect which portal a pathname belongs to. */
export function detectPortal(pathname: string): PortalDefinition {
  for (const portal of PORTALS) {
    const routes = PORTAL_ROUTES[portal.id];
    if (routes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      return portal;
    }
  }
  // Default to impulsion
  return PORTALS[0]!;
}
