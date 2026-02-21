// =============================================================================
// LIB L.8 — Cockpit Widget Types
// =============================================================================
// Type definitions for dashboard widgets that consume pillar data (read-only)
// and produce derived insights (e.g. Superfan Tracker, Brand Health Score).
// Exports: WidgetDescriptor, WidgetInput, WidgetResult, WidgetHandler,
//   WidgetStatus.
// Used by: cockpit dashboard, widget registry, widget compute pipeline.
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Widget Descriptor — declarative definition of what a widget IS
// ---------------------------------------------------------------------------

export interface WidgetDescriptor {
  /** Unique widget identifier, e.g. "superfan_tracker" */
  id: string;
  /** Human-readable name */
  name: string;
  /** What this widget shows/computes */
  description: string;
  /** Lucide icon name for UI */
  icon: string;
  /** Widget category for grouping */
  category: "engagement" | "analytics" | "community" | "financial" | "health";

  /** Which pillar types this widget needs to compute (e.g. ["A", "E"]) */
  requiredPillars: string[];
  /** Minimum strategy phase for this widget to be available */
  minimumPhase: string;

  /** Zod schema for validating widget output */
  outputSchema: z.ZodType<unknown>;

  /** Size hint for dashboard layout */
  size: "small" | "medium" | "large";
}

// ---------------------------------------------------------------------------
// Widget Input — what is passed to compute()
// ---------------------------------------------------------------------------

export interface WidgetInput {
  strategyId: string;
  /** Parsed pillar content keyed by pillar type */
  pillars: Record<string, unknown>;
  /** Strategy-level metadata */
  strategy: {
    brandName: string;
    sector: string | null;
    coherenceScore: number | null;
  };
}

// ---------------------------------------------------------------------------
// Widget Result — what compute() returns
// ---------------------------------------------------------------------------

export interface WidgetResult {
  success: boolean;
  /** Computed data — must match the widget's outputSchema */
  data: unknown;
  error?: string;
}

// ---------------------------------------------------------------------------
// Widget Handler — the full interface a widget must implement
// ---------------------------------------------------------------------------

export interface WidgetHandler {
  descriptor: WidgetDescriptor;
  compute(input: WidgetInput): Promise<WidgetResult>;
}

// ---------------------------------------------------------------------------
// Widget Status (mirrors Prisma CockpitWidget.status)
// ---------------------------------------------------------------------------

export type WidgetStatus = "pending" | "computing" | "ready" | "error";
