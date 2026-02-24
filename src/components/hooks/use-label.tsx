// ==========================================================================
// HOOK H.2 — useLabel
// White-label + vertical vocabulary transposition hook.
// Returns client-facing labels for CLIENT_RETAINER / CLIENT_STATIC / FREELANCE
// users, and applies vertical-specific vocabulary for all users when a
// VerticalProvider is present in the tree.
// ==========================================================================

"use client";

import { createContext, useCallback, useContext } from "react";
import { WHITE_LABEL_MAP, VERTICAL_DICTIONARY } from "~/lib/constants";
import { useRole } from "./use-role";

// ---------------------------------------------------------------------------
// Vertical Context — provides the current strategy's vertical to all children
// ---------------------------------------------------------------------------

const VerticalContext = createContext<string | null>(null);

export function VerticalProvider({
  vertical,
  children,
}: {
  vertical: string | null;
  children: React.ReactNode;
}) {
  return (
    <VerticalContext.Provider value={vertical}>
      {children}
    </VerticalContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// useLabel hook
// ---------------------------------------------------------------------------

/**
 * Hook: Returns a `label()` function that transposes internal labels
 * to white-labeled equivalents when the user is not an internal role,
 * AND applies vertical-specific vocabulary when a VerticalProvider
 * is present in the component tree.
 *
 * Usage: const label = useLabel();
 *        <h2>{label("Authenticité")}</h2> // → "Identité de marque" for clients
 *        <p>{label("client")}</p>         // → "citoyen / usager" for INSTITUTIONAL
 */
export function useLabel() {
  const { isWhiteLabel } = useRole();
  const vertical = useContext(VerticalContext);

  const label = useCallback(
    (internal: string): string => {
      // Step 1: White-label transposition (pillar/module names)
      let result = internal;
      if (isWhiteLabel) {
        result = WHITE_LABEL_MAP[result] ?? result;
      }

      // Step 2: Vertical vocabulary transposition (sector-specific terms)
      if (vertical && VERTICAL_DICTIONARY[vertical]) {
        const dict = VERTICAL_DICTIONARY[vertical]!;
        for (const [generic, specific] of Object.entries(dict)) {
          const regex = new RegExp(`\\b${generic}\\b`, "gi");
          result = result.replace(regex, specific);
        }
      }

      return result;
    },
    [isWhiteLabel, vertical],
  );

  return label;
}
