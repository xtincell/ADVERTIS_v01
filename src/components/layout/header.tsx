// ==========================================================================
// LAYOUT — Header
// Top bar with dynamic page title, breadcrumbs, and user menu.
// Routes updated to match /brand/[id]/* (operator), /more/* (operator),
// /cockpit (client), /my-missions (freelance).
// ==========================================================================

"use client";

import { Fragment } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, User, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

// ---------------------------------------------------------------------------
// Page titles — maps pathname patterns to display titles
// ---------------------------------------------------------------------------

const PAGE_TITLES: Record<string, string> = {
  // Impulsion portal (strategy & brands)
  "/impulsion": "Tableau de bord",
  "/impulsion/new": "Nouvelle Fiche de Marque",
  "/impulsion/tree": "Arbre stratégique",
  "/impulsion/risk": "Portrait Risques",
  "/impulsion/market": "Portrait Marché",
  "/impulsion/intelligence": "Intelligence",
  "/impulsion/ecosystem": "Écosystème",
  "/impulsion/presets": "Presets de Briefs",
  // Pilotis portal (missions)
  "/pilotis": "Missions",
  "/pilotis/interventions": "Interventions",
  "/pilotis/pricing": "Référentiel Pricing",
  // Sérénité portal (finance & admin)
  "/serenite": "Sérénité",
  "/serenite/invoices": "Factures",
  "/serenite/contracts": "Contrats",
  "/serenite/escrow": "Escrow",
  "/serenite/costs": "Coûts IA",
  "/serenite/admin": "Administration",
  "/serenite/settings": "Paramètres",
  // Client routes
  "/cockpit": "Cockpit",
  "/oracle": "L'Oracle",
  "/my-documents": "Documents",
  "/requests": "Demandes",
  // Freelance routes
  "/my-missions": "Mes Missions",
  "/my-briefs": "Mes Briefs",
  "/upload": "Upload",
  "/my-finances": "Mes Finances",
  "/profile": "Profil",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]!;

  // Brand sub-pages (Impulsion — /impulsion/brand/[id]/...)
  if (pathname.match(/^\/impulsion\/brand\/[^/]+\/generate$/)) return "Pipeline de génération";
  if (pathname.match(/^\/impulsion\/brand\/[^/]+\/market-study$/)) return "Étude de Marché";
  if (pathname.match(/^\/impulsion\/brand\/[^/]+\/oracle$/)) return "L'Oracle";
  if (pathname.match(/^\/impulsion\/brand\/[^/]+\/edit\/[^/]+$/)) return "Éditeur de pilier";
  if (pathname.match(/^\/impulsion\/brand\/[^/]+\/document\/[^/]+$/)) return "Document";
  if (pathname.match(/^\/impulsion\/brand\/[^/]+$/)) return "Cockpit Stratégique";

  // Mission detail (Pilotis — /pilotis/[id])
  if (pathname.match(/^\/pilotis\/[^/]+$/) && !pathname.startsWith("/pilotis/interventions") && !pathname.startsWith("/pilotis/pricing")) return "Détail Mission";

  // Prefix fallback
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path + "/")) return title;
  }

  return "ADVERTIS";
}

// ---------------------------------------------------------------------------
// Breadcrumbs — build dynamic trail from pathname
// ---------------------------------------------------------------------------

interface BreadcrumbEntry {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  const crumbs: BreadcrumbEntry[] = [];

  // Detect portal context
  const isClient =
    pathname.startsWith("/cockpit") ||
    pathname.startsWith("/oracle") ||
    pathname.startsWith("/my-documents") ||
    pathname.startsWith("/requests");
  const isFreelance =
    pathname.startsWith("/my-missions") ||
    pathname.startsWith("/my-briefs") ||
    pathname.startsWith("/upload") ||
    pathname.startsWith("/my-finances") ||
    pathname.startsWith("/profile");

  // Detect portal context for root crumb
  const isImpulsion = pathname.startsWith("/impulsion");
  const isPilotis = pathname.startsWith("/pilotis");
  const isSerenite = pathname.startsWith("/serenite");

  // Root crumb
  if (isClient) {
    crumbs.push({ label: "Cockpit", href: "/cockpit" });
  } else if (isFreelance) {
    crumbs.push({ label: "Missions", href: "/my-missions" });
  } else if (isPilotis) {
    crumbs.push({ label: "Missions", href: "/pilotis" });
  } else if (isSerenite) {
    crumbs.push({ label: "Sérénité", href: "/serenite" });
  } else {
    crumbs.push({ label: "Marques", href: "/impulsion" });
  }

  // ── Brand cockpit (/impulsion/brand/[id]) ──
  if (pathname.match(/^\/impulsion\/brand\/[^/]+$/) && !pathname.match(/^\/impulsion\/brand\/[^/]+\//)) {
    crumbs.push({ label: "Cockpit" });
    return crumbs;
  }

  // ── Brand sub-pages (/impulsion/brand/[id]/generate, etc.) ──
  const brandSubMatch = pathname.match(/^\/impulsion\/brand\/([^/]+)\//);
  if (brandSubMatch) {
    const brandId = brandSubMatch[1];
    crumbs.push({ label: "Cockpit", href: `/impulsion/brand/${brandId}` });

    if (pathname.endsWith("/generate")) {
      crumbs.push({ label: "Génération" });
    } else if (pathname.endsWith("/market-study")) {
      crumbs.push({ label: "Étude de Marché" });
    } else if (pathname.endsWith("/oracle")) {
      crumbs.push({ label: "L'Oracle" });
    } else if (pathname.match(/\/edit\/[^/]+$/)) {
      crumbs.push({ label: "Éditeur de pilier" });
    } else if (pathname.match(/\/document\/[^/]+$/)) {
      crumbs.push({ label: "Document" });
    }
    return crumbs;
  }

  // ── Mission detail (/pilotis/[id]) ──
  if (pathname.match(/^\/pilotis\/[^/]+$/) && !pathname.startsWith("/pilotis/interventions") && !pathname.startsWith("/pilotis/pricing")) {
    crumbs.push({ label: "Détail" });
    return crumbs;
  }

  // ── Sérénité sub-pages ──
  if (isSerenite && pathname !== "/serenite") {
    const title = PAGE_TITLES[pathname];
    if (title) crumbs.push({ label: title });
    return crumbs;
  }

  // ── Impulsion sub-pages ──
  if (isImpulsion && pathname !== "/impulsion" && !pathname.startsWith("/impulsion/brand/")) {
    const title = PAGE_TITLES[pathname];
    if (title) crumbs.push({ label: title });
    return crumbs;
  }

  // ── Pilotis sub-pages ──
  if (isPilotis && pathname !== "/pilotis") {
    const title = PAGE_TITLES[pathname];
    if (title) crumbs.push({ label: title });
    return crumbs;
  }

  // ── Top-level pages — no breadcrumbs ──
  const topLevelPages = [
    "/impulsion", "/pilotis", "/serenite",
    "/cockpit", "/my-missions", "/my-briefs",
  ];
  if (topLevelPages.includes(pathname)) return [];

  // ── Single-level secondary pages (oracle, requests, etc.) ──
  const title = PAGE_TITLES[pathname];
  if (title && crumbs.length === 1) {
    crumbs.push({ label: title });
  }

  return crumbs.length <= 1 ? [] : crumbs;
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const segments = getBreadcrumbs(pathname);
  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex items-center gap-1 text-xs text-muted-foreground"
    >
      {segments.map((seg, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <ChevronRight className="size-3 shrink-0 text-muted-foreground/50" />
          )}
          {i === segments.length - 1 || !seg.href ? (
            <span className="font-medium text-foreground/80">{seg.label}</span>
          ) : (
            <Link
              href={seg.href}
              className="transition-colors hover:text-foreground"
            >
              {seg.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getUserInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Header Component
// ---------------------------------------------------------------------------

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const displayTitle = title ?? getPageTitle(pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Page title + breadcrumbs */}
      <div className="flex flex-col justify-center gap-0.5">
        <div className="flex items-center gap-4">
          {/* Spacer for mobile menu button */}
          <div className="w-8 lg:hidden" />
          <h1 className="text-lg font-semibold text-foreground/90">
            {displayTitle}
          </h1>
        </div>
        <div>
          <Breadcrumbs pathname={pathname} />
        </div>
      </div>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Menu utilisateur"
          >
            <span className="hidden text-sm font-medium text-foreground/80 md:block">
              {session?.user?.name ?? "Utilisateur"}
            </span>
            <Avatar size="default">
              <AvatarImage
                src={session?.user?.image ?? undefined}
                alt={session?.user?.name ?? "Utilisateur"}
              />
              <AvatarFallback>
                {getUserInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session?.user?.name ?? "Utilisateur"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session?.user?.email ?? ""}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/serenite/settings" className="cursor-pointer">
              <User className="mr-2 size-4" />
              Profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 size-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
