// ==========================================================================
// SHELL S.10 — ViewAsSwitcher
// Header dropdown for ADMIN users to simulate another role.
// Shows current simulated role with a colored badge + eye icon.
// ==========================================================================

"use client";

import { useRouter } from "next/navigation";
import { Eye, X, ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { USER_ROLES, USER_ROLE_LABELS, type UserRole } from "~/lib/constants";
import { useViewAs } from "~/components/providers/view-as-provider";
import { getHomeByRole } from "~/lib/role-routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

/** Colors per role for the badge. */
const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "#6366F1",
  OPERATOR: "#6366F1",
  FREELANCE: "#F59E0B",
  CLIENT_RETAINER: "#F43F5E",
  CLIENT_STATIC: "#F43F5E",
};

const ROLE_BG: Record<UserRole, string> = {
  ADMIN: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  OPERATOR: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  FREELANCE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CLIENT_RETAINER: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  CLIENT_STATIC: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export function ViewAsSwitcher() {
  const { viewAsRole, isRealAdmin, setViewAsRole, isViewingAs } = useViewAs();
  const router = useRouter();

  // Only render for real ADMIN users
  if (!isRealAdmin) return null;

  const handleSelectRole = (role: UserRole) => {
    setViewAsRole(role === "ADMIN" ? null : role);
    // Navigate to the home page of the selected role
    router.push(getHomeByRole(role));
  };

  const handleReset = () => {
    setViewAsRole(null);
    router.push(getHomeByRole("ADMIN"));
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
              "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring outline-none",
              isViewingAs
                ? ROLE_BG[viewAsRole!]
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {isViewingAs
                ? USER_ROLE_LABELS[viewAsRole!]
                : "Voir en tant que…"}
            </span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Simuler un rôle
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {USER_ROLES.map((role) => {
            const isActive =
              (role === "ADMIN" && !isViewingAs) ||
              (isViewingAs && viewAsRole === role);
            return (
              <DropdownMenuItem
                key={role}
                onClick={() => handleSelectRole(role)}
                className="flex items-center gap-2"
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: ROLE_COLORS[role] }}
                />
                <span className={cn("flex-1", isActive && "font-semibold")}>
                  {USER_ROLE_LABELS[role]}
                </span>
                {isActive && (
                  <span className="text-[10px] text-muted-foreground">
                    actif
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick reset button when ViewAs is active */}
      {isViewingAs && (
        <button
          onClick={handleReset}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          title="Revenir en mode Admin"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
