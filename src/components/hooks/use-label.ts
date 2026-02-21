// ==========================================================================
// HOOK H.2 — useLabel
// White-label transposition hook. Returns client-facing labels for
// CLIENT_RETAINER / CLIENT_STATIC / FREELANCE users.
// ==========================================================================

"use client";

import { useCallback } from "react";
import { WHITE_LABEL_MAP } from "~/lib/constants";
import { useRole } from "./use-role";

/**
 * Hook: Returns a `label()` function that transposes internal labels
 * to white-labeled equivalents when the user is not an internal role.
 *
 * Usage: const label = useLabel();
 *        <h2>{label("Authenticité")}</h2> // → "Identité de marque" for clients
 */
export function useLabel() {
  const { isWhiteLabel } = useRole();

  const label = useCallback(
    (internal: string): string => {
      if (!isWhiteLabel) return internal;
      return WHITE_LABEL_MAP[internal] ?? internal;
    },
    [isWhiteLabel],
  );

  return label;
}
