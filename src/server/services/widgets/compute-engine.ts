// =============================================================================
// MODULE 14 — Widget Compute Engine
// =============================================================================
//
// Orchestrates cockpit widget computation. Fetches pillar data, runs each
// widget's compute() function, validates output against Zod schema, and
// stores the result in CockpitWidget records.
//
// PUBLIC API :
//   14.1  computeWidget()                — Compute a single widget by ID
//   14.2  computeAllWidgets()            — Compute all available widgets for a strategy
//   14.3  invalidateWidgetsForPillar()   — Mark dependent widgets as pending
//
// DEPENDENCIES :
//   - Module 14R (widgets/registry) → getWidget(), getAllWidgets()
//   - lib/types/pillar-parsers → parsePillarContent()
//   - lib/types/cockpit-widgets → WidgetInput
//   - Prisma: CockpitWidget, Strategy, Pillar
//
// CALLED BY :
//   - API Route POST /api/ai/generate → computeAllWidgets (fire-and-forget)
//   - Module 10 (fiche-upgrade.ts) → computeAllWidgets after regeneration
//   - tRPC router widget.computeAll
//   - UI: SectionWidgets auto-compute useEffect
//
// =============================================================================

import { db } from "~/server/db";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import { getWidget, getAllWidgets } from "./registry";
import type { WidgetInput } from "~/lib/types/cockpit-widgets";

// ---------------------------------------------------------------------------
// 14.1  computeWidget — Compute a single widget
// ---------------------------------------------------------------------------

export async function computeWidget(
  widgetId: string,
  strategyId: string,
): Promise<{ success: boolean; error?: string }> {
  const handler = getWidget(widgetId);
  if (!handler) {
    return { success: false, error: `Widget not found: ${widgetId}` };
  }

  // Upsert the widget record to "computing" status
  const widget = await db.cockpitWidget.upsert({
    where: { strategyId_widgetType: { strategyId, widgetType: widgetId } },
    create: { widgetType: widgetId, strategyId, status: "computing" },
    update: { status: "computing", errorMessage: null },
  });

  try {
    // 1. Fetch strategy + all pillars
    const strategy = await db.strategy.findUnique({
      where: { id: strategyId },
      include: { pillars: true },
    });

    if (!strategy) {
      throw new Error("Strategy not found");
    }

    // 2. Parse all pillar data
    const pillars: Record<string, unknown> = {};
    for (const pillar of strategy.pillars) {
      const { data } = parsePillarContent(pillar.type, pillar.content);
      pillars[pillar.type] = data;
    }

    // 3. Build widget input
    const input: WidgetInput = {
      strategyId,
      pillars,
      strategy: {
        brandName: strategy.brandName,
        sector: strategy.sector,
        coherenceScore: strategy.coherenceScore,
      },
    };

    // 4. Execute widget compute
    const result = await handler.compute(input);

    if (!result.success) {
      throw new Error(result.error ?? "Widget computation failed");
    }

    // 5. Validate output
    const validation = handler.descriptor.outputSchema.safeParse(result.data);
    if (!validation.success) {
      console.warn(
        `[WidgetEngine] Output validation warnings for ${widgetId}:`,
        validation.error.issues.map((i) => i.message),
      );
    }

    // 6. Store result
    await db.cockpitWidget.update({
      where: { id: widget.id },
      data: {
        status: "ready",
        data: JSON.parse(JSON.stringify(result.data)),
        computedAt: new Date(),
        errorMessage: null,
      },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await db.cockpitWidget.update({
      where: { id: widget.id },
      data: { status: "error", errorMessage: message },
    });
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// 14.2  computeAllWidgets — Compute all available widgets for a strategy
// ---------------------------------------------------------------------------

export async function computeAllWidgets(
  strategyId: string,
): Promise<{ computed: number; errors: number }> {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: { pillars: { select: { type: true, status: true } } },
  });

  if (!strategy) return { computed: 0, errors: 0 };

  const completedPillars = strategy.pillars
    .filter((p) => p.status === "complete")
    .map((p) => p.type);

  const widgets = getAllWidgets().filter((w) => {
    return w.descriptor.requiredPillars.every((p) => completedPillars.includes(p));
  });

  let computed = 0;
  let errors = 0;

  // Run widget computations in parallel
  const results = await Promise.allSettled(
    widgets.map((w) => computeWidget(w.descriptor.id, strategyId)),
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.success) {
      computed++;
    } else {
      errors++;
    }
  }

  return { computed, errors };
}

// ---------------------------------------------------------------------------
// 14.3  invalidateWidgetsForPillar — Mark dependent widgets as pending
// ---------------------------------------------------------------------------

export async function invalidateWidgetsForPillar(
  strategyId: string,
  pillarType: string,
): Promise<void> {
  const affectedWidgets = getAllWidgets().filter((w) =>
    w.descriptor.requiredPillars.includes(pillarType),
  );

  if (affectedWidgets.length === 0) return;

  await db.cockpitWidget.updateMany({
    where: {
      strategyId,
      widgetType: { in: affectedWidgets.map((w) => w.descriptor.id) },
    },
    data: { status: "pending" },
  });
}
