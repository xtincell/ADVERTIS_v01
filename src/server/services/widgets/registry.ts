// =============================================================================
// MODULE 14R — Widget Registry
// =============================================================================
// Central Map-based registry for cockpit dashboard widgets.
// Same singleton-Map pattern as Module Registry (23) and Integration Registry (24).
// Widgets self-register at import time; the registry then exposes query
// helpers for phase-gating and category filtering.
//
// Public API:
//   registerWidget(handler)                    — Register a WidgetHandler
//   getWidget(widgetId)                        — Retrieve by ID
//   getAllWidgets()                             — List all registered widgets
//   getWidgetsByCategory(category)             — Filter by category
//   getAvailableWidgets(phase, completedPillars)
//     — Phase-gated + pillar-gated widget list for the cockpit UI
//
// Dependencies:
//   ~/lib/types/cockpit-widgets      — WidgetHandler type
//
// Called by:
//   widget implementations (registerWidget at import-time)
//   tRPC cockpit/widget router (getAvailableWidgets, getWidget)
//   widgets/implementations/* (registerWidget)
// =============================================================================

import type { WidgetHandler } from "~/lib/types/cockpit-widgets";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const WIDGET_REGISTRY = new Map<string, WidgetHandler>();

/** Register a widget handler. */
export function registerWidget(handler: WidgetHandler): void {
  if (WIDGET_REGISTRY.has(handler.descriptor.id)) {
    console.warn(
      `[WidgetRegistry] Overwriting widget: ${handler.descriptor.id}`,
    );
  }
  WIDGET_REGISTRY.set(handler.descriptor.id, handler);
}

/** Get a single widget by ID. */
export function getWidget(widgetId: string): WidgetHandler | undefined {
  return WIDGET_REGISTRY.get(widgetId);
}

/** Get all registered widgets. */
export function getAllWidgets(): WidgetHandler[] {
  return Array.from(WIDGET_REGISTRY.values());
}

/** Get widgets by category. */
export function getWidgetsByCategory(
  category: WidgetHandler["descriptor"]["category"],
): WidgetHandler[] {
  return getAllWidgets().filter((w) => w.descriptor.category === category);
}

/** Get widgets available for a given strategy phase. */
export function getAvailableWidgets(
  phase: string,
  completedPillars: string[],
): WidgetHandler[] {
  const phaseOrder = [
    "fiche", "fiche-review", "audit-r", "market-study",
    "audit-t", "audit-review", "implementation", "cockpit", "complete",
  ];
  const currentIdx = phaseOrder.indexOf(phase);

  return getAllWidgets().filter((w) => {
    const requiredIdx = phaseOrder.indexOf(w.descriptor.minimumPhase);
    if (currentIdx < requiredIdx) return false;

    // Check all required pillars have data
    return w.descriptor.requiredPillars.every((p) => completedPillars.includes(p));
  });
}
