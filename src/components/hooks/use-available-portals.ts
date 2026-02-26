// ==========================================================================
// HOOK H.5 — useAvailablePortals
// Returns the list of portals the current user can access,
// the currently active portal, and whether the switcher should render.
// ==========================================================================

"use client";

import { usePathname } from "next/navigation";
import { useRole } from "~/components/hooks/use-role";
import { PORTALS, detectPortal, type PortalDefinition } from "~/lib/portal-config";

interface AvailablePortals {
  /** Portals the current user can access. */
  available: PortalDefinition[];
  /** The portal matching the current URL. */
  current: PortalDefinition;
  /** True when the user has access to more than one portal. */
  showSwitcher: boolean;
  /** Session is still loading. */
  isLoading: boolean;
}

export function useAvailablePortals(): AvailablePortals {
  const { role, isLoading } = useRole();
  const pathname = usePathname();

  const available = PORTALS.filter((p) => p.allowedRoles.includes(role));
  const current = detectPortal(pathname);
  const showSwitcher = available.length > 1;

  return { available, current, showSwitcher, isLoading };
}
