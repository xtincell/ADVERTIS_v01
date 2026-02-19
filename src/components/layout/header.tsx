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
// Page titles
// ---------------------------------------------------------------------------

const pageTitles: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/strategy/new": "Nouvelle Fiche de Marque",
  "/settings": "Paramètres",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }

  // Strategy sub-pages — provide meaningful titles
  if (pathname.match(/^\/strategy\/[^/]+\/cockpit$/)) {
    return "Cockpit Stratégique";
  }
  if (pathname.match(/^\/strategy\/[^/]+\/presentation$/)) {
    return "Fiche S";
  }
  if (pathname.match(/^\/strategy\/[^/]+\/generate$/)) {
    return "Génération";
  }
  if (pathname.match(/^\/strategy\/[^/]+\/market-study$/)) {
    return "Étude de Marché";
  }
  if (pathname.match(/^\/strategy\/[^/]+\/pillar\/[^/]+\/edit$/)) {
    return "Éditeur de pilier";
  }
  if (pathname.match(/^\/strategy\/[^/]+$/)) {
    return "Fiche de Marque";
  }

  // Check prefix matches for dynamic routes
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path + "/")) {
      return title;
    }
  }

  return "ADVERTIS";
}

// ---------------------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------------------

interface Breadcrumb {
  label: string;
  href: string;
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [{ label: "Accueil", href: "/dashboard" }];

  // Strategy sub-pages
  if (pathname.match(/^\/strategy\/[^/]+\/cockpit$/)) {
    crumbs.push({ label: "Stratégie", href: pathname.replace(/\/cockpit$/, "") });
    crumbs.push({ label: "Cockpit", href: pathname });
  } else if (pathname.match(/^\/strategy\/[^/]+\/presentation$/)) {
    crumbs.push({ label: "Stratégie", href: pathname.replace(/\/presentation$/, "") });
    crumbs.push({ label: "Fiche S", href: pathname });
  } else if (pathname.match(/^\/strategy\/[^/]+\/generate$/)) {
    crumbs.push({ label: "Stratégie", href: pathname.replace(/\/generate$/, "") });
    crumbs.push({ label: "Génération", href: pathname });
  } else if (pathname.match(/^\/strategy\/[^/]+\/market-study$/)) {
    crumbs.push({ label: "Stratégie", href: pathname.replace(/\/market-study$/, "") });
    crumbs.push({ label: "Étude de Marché", href: pathname });
  } else if (pathname.match(/^\/strategy\/[^/]+\/pillar\/[^/]+\/edit$/)) {
    const strategyPath = pathname.replace(/\/pillar\/.*$/, "");
    crumbs.push({ label: "Stratégie", href: strategyPath });
    crumbs.push({ label: "Éditeur de pilier", href: pathname });
  } else if (pathname.match(/^\/strategy\/[^/]+$/) && pathname !== "/strategy/new") {
    crumbs.push({ label: "Fiche de Marque", href: pathname });
  } else if (pathname === "/strategy/new") {
    crumbs.push({ label: "Nouvelle Fiche", href: pathname });
  } else if (pathname === "/settings") {
    crumbs.push({ label: "Paramètres", href: pathname });
  }

  return crumbs;
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const segments = getBreadcrumbs(pathname);
  // Don't show breadcrumbs for dashboard (home) or single-level pages
  if (segments.length <= 1) return null;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex items-center gap-1 text-xs text-muted-foreground"
    >
      {segments.map((seg, i) => (
        <Fragment key={seg.href}>
          {i > 0 && <ChevronRight className="size-3 shrink-0 text-muted-foreground/50" />}
          {i === segments.length - 1 ? (
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
            <Link href="/settings" className="cursor-pointer">
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
