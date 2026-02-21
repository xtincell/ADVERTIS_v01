// ==========================================================================
// HOOK H.4 — useViewMode
// Cockpit view mode state. Controls which sections are visible.
// ==========================================================================

"use client";

import { useState, useCallback } from "react";
import type { ViewMode } from "~/lib/constants";
import { VIEW_MODE_SECTIONS } from "~/lib/constants";

interface ViewModeState {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  visibleSections: string[];
  isVisible: (sectionId: string) => boolean;
}

/**
 * Hook: Manages cockpit view mode state.
 * Returns the current mode, setter, and a list of visible section IDs.
 */
export function useViewMode(initial: ViewMode = "MARKETING"): ViewModeState {
  const [mode, setMode] = useState<ViewMode>(initial);

  const visibleSections = VIEW_MODE_SECTIONS[mode] ?? [];

  const isVisible = useCallback(
    (sectionId: string) => {
      // MARKETING mode shows everything
      if (mode === "MARKETING") return true;
      return visibleSections.includes(sectionId);
    },
    [mode, visibleSections],
  );

  return { mode, setMode, visibleSections, isVisible };
}
