// ============================================
// MODULE SYSTEM — Type Definitions
// ============================================
// Each of the 279 ADVERTIS variables can have its own
// collect → deduce → refine pipeline via a pluggable module.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Module Input Sources — what a module CONSUMES
// ---------------------------------------------------------------------------

/** A data source that a module reads from */
export type ModuleInputSource =
  | { type: "pillar"; pillarType: string; path?: string }
  | { type: "interview"; variableIds: string[] }
  | { type: "strategy"; fields: string[] }
  | { type: "marketStudy"; fields?: string[] }
  | { type: "moduleOutput"; moduleId: string };

// ---------------------------------------------------------------------------
// Module Output Targets — what a module PRODUCES
// ---------------------------------------------------------------------------

/** Where module results are written (partial pillar update) */
export interface ModuleOutputTarget {
  pillarType: string;
  /** Dot-notation path into pillar content, e.g. "identiteVisuelle.directionArtistique" */
  path: string;
  mergeStrategy: "replace" | "append" | "merge";
}

// ---------------------------------------------------------------------------
// Module Descriptor — declarative definition of what a module IS
// ---------------------------------------------------------------------------

export interface ModuleDescriptor {
  /** Unique module identifier, e.g. "da-corpus-refiner", "codb-calculator" */
  id: string;
  /** Human-readable name */
  name: string;
  /** What this module does */
  description: string;
  /** Module category */
  category: "collect" | "deduce" | "refine" | "compute";

  /** What data this module needs */
  inputs: ModuleInputSource[];
  /** Where results are written */
  outputs: ModuleOutputTarget[];

  /** Run automatically when inputs change */
  autoTrigger: boolean;

  /** Zod schema for validating resolved inputs */
  inputSchema: z.ZodType<unknown>;
  /** Zod schema for validating module output */
  outputSchema: z.ZodType<unknown>;
}

// ---------------------------------------------------------------------------
// Module Runtime — execution context and result
// ---------------------------------------------------------------------------

/** Context passed to a module's execute() function */
export interface ModuleContext {
  strategyId: string;
  userId: string;
  /** Resolved input data keyed by a descriptive label */
  inputs: Record<string, unknown>;
}

/** What a module returns after execution */
export interface ModuleResult {
  success: boolean;
  /** Output data — must match the module's outputSchema */
  data: Record<string, unknown>;
  error?: string;
  /** Optional diagnostics or metadata */
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Module Handler — the full interface a module must implement
// ---------------------------------------------------------------------------

export interface ModuleHandler {
  descriptor: ModuleDescriptor;
  execute(ctx: ModuleContext): Promise<ModuleResult>;
}

// ---------------------------------------------------------------------------
// Module Run Status (mirrors Prisma ModuleRun.status)
// ---------------------------------------------------------------------------

export type ModuleRunStatus = "pending" | "running" | "complete" | "error";
export type ModuleTriggeredBy = "manual" | "auto" | "webhook";
