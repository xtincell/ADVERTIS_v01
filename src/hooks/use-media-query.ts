// ==========================================================================
// HOOK — useMediaQuery
// Reactive media query hook for responsive component logic.
// ==========================================================================

"use client";

import { useState, useEffect } from "react";

/**
 * Returns true if the given CSS media query matches the current viewport.
 * SSR-safe: returns `false` during server rendering.
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 767px)");
 * const isDesktop = useMediaQuery("(min-width: 768px)");
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Convenience breakpoints matching Tailwind defaults.
 */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 768px)");
}
