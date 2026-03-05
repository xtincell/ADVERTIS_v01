// ==========================================================================
// Hooks barrel export
// Canonical location for all application hooks.
// Domain-specific hooks in ~/components/hooks/ are re-exported here.
// ==========================================================================

// ── New v3 hooks ──
export { useAutoSave } from "./use-auto-save";
export { useOptimisticMutation } from "./use-optimistic-mutation";
export { useStrategy } from "./use-strategy";
export { usePillarForm } from "./use-pillar-form";

// ── Media / responsive ──
export { useMediaQuery, useIsMobile, useIsDesktop } from "./use-media-query";

// ── Domain hooks (re-exported from components/hooks for convenience) ──
export { useRole } from "~/components/hooks/use-role";
export { useOffline } from "~/components/hooks/use-offline";
export { useViewMode } from "~/components/hooks/use-view-mode";
export { useAvailablePortals } from "~/components/hooks/use-available-portals";
