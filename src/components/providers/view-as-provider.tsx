// ==========================================================================
// PROVIDER PR.2 — ViewAsProvider
// Allows ADMIN users to simulate viewing the app as another role.
// Persists the selected role in localStorage. Only active when real role is ADMIN.
// ==========================================================================

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type { UserRole } from "~/lib/constants";

const STORAGE_KEY = "advertis-view-as-role";

interface ViewAsContextValue {
  /** The role being simulated, or null when not active. */
  viewAsRole: UserRole | null;
  /** True when the real user is ADMIN (the only role allowed to use ViewAs). */
  isRealAdmin: boolean;
  /** Activate view-as mode for a given role, or null to deactivate. */
  setViewAsRole: (role: UserRole | null) => void;
  /** Shortcut: true when viewAsRole is active. */
  isViewingAs: boolean;
}

const ViewAsContext = createContext<ViewAsContextValue>({
  viewAsRole: null,
  isRealAdmin: false,
  setViewAsRole: () => undefined,
  isViewingAs: false,
});

export function ViewAsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const realRole = (session?.user?.role ?? "OPERATOR") as UserRole;
  const isRealAdmin = realRole === "ADMIN";

  const [viewAsRole, setViewAsRoleState] = useState<UserRole | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (!isRealAdmin) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored !== "ADMIN") {
        setViewAsRoleState(stored as UserRole);
      }
    } catch {
      // SSR or localStorage unavailable
    }
  }, [isRealAdmin]);

  const setViewAsRole = useCallback(
    (role: UserRole | null) => {
      if (!isRealAdmin) return;
      // Null or ADMIN → deactivate
      const value = role === "ADMIN" ? null : role;
      setViewAsRoleState(value);
      try {
        if (value) {
          localStorage.setItem(STORAGE_KEY, value);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // ignore
      }
    },
    [isRealAdmin],
  );

  return (
    <ViewAsContext.Provider
      value={{
        viewAsRole: isRealAdmin ? viewAsRole : null,
        isRealAdmin,
        setViewAsRole,
        isViewingAs: isRealAdmin && viewAsRole !== null,
      }}
    >
      {children}
    </ViewAsContext.Provider>
  );
}

/** Consume the ViewAs context. */
export function useViewAs(): ViewAsContextValue {
  return useContext(ViewAsContext);
}
