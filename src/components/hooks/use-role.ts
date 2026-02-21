// ==========================================================================
// HOOK H.1 — useRole
// Returns current user role and view mode from NextAuth session.
// ==========================================================================

"use client";

import { useSession } from "next-auth/react";
import type { UserRole, ViewMode } from "~/lib/constants";

interface RoleInfo {
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

/**
 * Hook: Returns role info from the current session.
 * `isWhiteLabel` is true for CLIENT_RETAINER and CLIENT_STATIC — these users
 * see transposed labels (e.g. "Identité de marque" instead of "Pilier A").
 */
export function useRole(): RoleInfo {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const rawRole = (session?.user?.role ?? "OPERATOR") as UserRole;

  return {
    role: rawRole,
    viewMode: (rawRole === "CLIENT_RETAINER" || rawRole === "CLIENT_STATIC"
      ? "EXECUTIVE"
      : "MARKETING") as ViewMode,
    isAdmin: rawRole === "ADMIN",
    isOperator: rawRole === "OPERATOR",
    isInternal: rawRole === "ADMIN" || rawRole === "OPERATOR",
    isFreelance: rawRole === "FREELANCE",
    isClient: rawRole === "CLIENT_RETAINER" || rawRole === "CLIENT_STATIC",
    isWhiteLabel: rawRole === "CLIENT_RETAINER" || rawRole === "CLIENT_STATIC" || rawRole === "FREELANCE",
    isLoading,
  };
}
