// ==========================================================================
// PROVIDER PR.1 — RoleProvider
// React context providing role, viewMode, and white-label state to the tree.
// ==========================================================================

"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRole } from "~/components/hooks/use-role";
import type { UserRole, ViewMode } from "~/lib/constants";

interface RoleContextValue {
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

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const roleInfo = useRole();

  return (
    <RoleContext.Provider value={roleInfo}>
      {children}
    </RoleContext.Provider>
  );
}

/**
 * Consume role context. Throws if used outside RoleProvider.
 */
export function useRoleContext(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRoleContext must be used within a RoleProvider");
  }
  return ctx;
}
