"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const pageTitles: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/strategies": "Mes Strategies",
  "/strategy/new": "Nouvelle Strategie",
  "/settings": "Parametres",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }

  // Check prefix matches for dynamic routes
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path + "/")) {
      return title;
    }
  }

  return "ADVERTIS";
}

function getUserInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const displayTitle = title ?? getPageTitle(pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Page title */}
      <div className="flex items-center gap-4">
        {/* Spacer for mobile menu button */}
        <div className="w-8 lg:hidden" />
        <h1 className="text-lg font-semibold text-foreground">
          {displayTitle}
        </h1>
      </div>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
            Se deconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
