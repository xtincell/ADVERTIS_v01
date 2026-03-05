// ==========================================================================
// HOOK H.3 — useMobile (thin re-export)
// Delegates to the canonical useIsMobile from ~/hooks/use-media-query.
// Kept for backward compatibility — new code should import from ~/hooks.
// ==========================================================================

"use client";

import { useIsMobile } from "~/hooks/use-media-query";

/**
 * @deprecated Use `useIsMobile` from `~/hooks` instead.
 */
export function useMobile(): boolean {
  return useIsMobile();
}
