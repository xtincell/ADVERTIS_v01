// Widget Registry — Map-based registry for cockpit-derived widgets.
// Same pattern as module registry and PILLAR_SCHEMAS.

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
