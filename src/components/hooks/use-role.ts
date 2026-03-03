// ==========================================================================
// HOOK H.1 — useRole
// Returns current user role and view mode from NextAuth session.
// When an ADMIN has ViewAs mode active, returns the simulated role's flags.
// ==========================================================================

"use client";

import { useSession } from "next-auth/react";
import type { UserRole, ViewMode } from "~/lib/constants";
import { useViewAs } from "~/components/providers/view-as-provider";

export interface RoleInfo {
  /** The effective role (real or simulated via ViewAs). */
  role: UserRole;
  viewMode: ViewMode;
  isAdmin: boolean;
  isOperator: boolean;
  isInternal: boolean;
  isFreelance: boolean;
  isClient: boolean;
  isWhiteLabel: boolean;
  isLoading: boolean;
}

/** Build RoleInfo flags from a given role. */
function buildRoleInfo(role: UserRole, isLoading: boolean): RoleInfo {
  return {
    role,
    viewMode: (role === "CLIENT_RETAINER" || role === "CLIENT_STATIC"
      ? "EXECUTIVE"
      : "MARKETING") as ViewMode,
    isAdmin: role === "ADMIN",
    isOperator: role === "OPERATOR",
    isInternal: role === "ADMIN" || role === "OPERATOR",
    isFreelance: role === "FREELANCE",
    isClient: role === "CLIENT_RETAINER" || role === "CLIENT_STATIC",
    isWhiteLabel:
      role === "CLIENT_RETAINER" ||
      role === "CLIENT_STATIC" ||
      role === "FREELANCE",
    isLoading,
  };
}

/**
 * Hook: Returns role info from the current session.
 * When ADMIN has ViewAs active, returns the simulated role's flags so the
 * entire UI (portals, shells, nav) adapts to the target perspective.
 * `isWhiteLabel` is true for CLIENT_RETAINER and CLIENT_STATIC — these users
 * see transposed labels (e.g. "Identité de marque" instead of "Pilier A").
 */
export function useRole(): RoleInfo {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const realRole = (session?.user?.role ?? "OPERATOR") as UserRole;
  const { viewAsRole } = useViewAs();

  // If ADMIN has ViewAs active, use the simulated role
  const effectiveRole = realRole === "ADMIN" && viewAsRole ? viewAsRole : realRole;

  return buildRoleInfo(effectiveRole, isLoading);
}
