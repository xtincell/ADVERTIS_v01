// =============================================================================
// ARTEMIS Framework Descriptor Types
// =============================================================================
// Core types for the ARTEMIS framework system: 24 frameworks across 9
// concentric layers, transforming 29 inputs into a living brand ecosystem.
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Artemis Layer — the 9 concentric layers of the ARTEMIS system
// ---------------------------------------------------------------------------

export const ARTEMIS_LAYERS = [
  "PHILOSOPHY",    // Couche 0 — FW-01, FW-20
  "IDENTITY",      // Couche 1 — FW-02(A-D), FW-05
  "VALUE",         // Couche 2 — FW-02(V), FW-13, FW-21, FW-03, FW-24
  "EXPERIENCE",    // Couche 3 — FW-02(E), FW-11, FW-12, FW-04
  "VALIDATION",    // Couche 4 — FW-02(R+T), FW-06
  "EXECUTION",     // Couche 5 — FW-02(I+S), FW-09, FW-18, FW-22, FW-23
  "MEASURE",       // Couche 6 — FW-07, FW-08, FW-10
  "GROWTH",        // Couche 7 — FW-19, FW-15, FW-16
  "SURVIVAL",      // Couche 8 — FW-14, FW-17
] as const;

export type ArtemisLayer = (typeof ARTEMIS_LAYERS)[number];

export const ArtemisLayerSchema = z.enum(ARTEMIS_LAYERS);

// ---------------------------------------------------------------------------
// Superfan Stage — the 6-stage devotion ladder
// ---------------------------------------------------------------------------

export const SUPERFAN_STAGES = [
  "AUDIENCE",
  "FOLLOWER",
  "ENGAGED",
  "FAN",
  "SUPERFAN",
  "EVANGELIST",
] as const;

export type SuperfanStage = (typeof SUPERFAN_STAGES)[number];

export const SuperfanStageSchema = z.enum(SUPERFAN_STAGES);

// ---------------------------------------------------------------------------
// Framework Category — how the framework produces its output
// ---------------------------------------------------------------------------

export const FRAMEWORK_CATEGORIES = [
  "theoretical",   // Pure conceptual framework (FW-01) — no code execution
  "compute",       // Deterministic computation from inputs (FW-03, FW-16)
  "ai",            // AI-native generation from variables (FW-12, FW-15)
  "hybrid",        // Mix of compute + AI (FW-11, FW-13, FW-20)
] as const;

export type FrameworkCategory = (typeof FRAMEWORK_CATEGORIES)[number];

export const FrameworkCategorySchema = z.enum(FRAMEWORK_CATEGORIES);

// ---------------------------------------------------------------------------
// Node Type — strategy types that conditionally activate frameworks
// ---------------------------------------------------------------------------

export const NODE_TYPES = [
  "BRAND",
  "EVENT",
  "EDITION",
  "PRODUCT",
  "SKU",
  "COMMUNITY",
  "CAMPAIGN",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export const NodeTypeSchema = z.enum(NODE_TYPES);

// ---------------------------------------------------------------------------
// Framework Execution Status
// ---------------------------------------------------------------------------

export const FRAMEWORK_RUN_STATUSES = [
  "pending",
  "running",
  "complete",
  "error",
  "skipped",
] as const;

export type FrameworkRunStatus = (typeof FRAMEWORK_RUN_STATUSES)[number];

// ---------------------------------------------------------------------------
// Framework Descriptor — static metadata for each framework
// ---------------------------------------------------------------------------

export interface FrameworkDescriptor {
  /** Unique framework ID, e.g. "FW-20" */
  id: string;

  /** Human-readable name, e.g. "Movement Architecture" */
  name: string;

  /** Short description of what the framework does */
  description: string;

  /** Which concentric layer this framework belongs to */
  layer: ArtemisLayer;

  /** How the framework produces output */
  category: FrameworkCategory;

  /** Variable keys this framework reads as input */
  inputVariables: string[];

  /** Variable keys this framework produces as output */
  outputVariables: string[];

  /** Other framework IDs this one depends on */
  dependsOnFrameworks: string[];

  /**
   * Conditional activation by nodeType.
   * - undefined = always active
   * - string[] = only active when Strategy.nodeType is in the list
   */
  condition?: NodeType[];

  /**
   * Conditional activation by maturity profile.
   * - undefined = always active
   * - string[] = only active when maturity is in the list
   */
  maturityCondition?: string[];

  /** Whether this framework has a module implementation */
  hasImplementation: boolean;
}

// ---------------------------------------------------------------------------
// Framework Output — runtime result of a framework execution
// ---------------------------------------------------------------------------

export interface FrameworkOutputData {
  /** Framework ID that produced this output */
  frameworkId: string;

  /** Version number (increments on re-run) */
  version: number;

  /** The output data (framework-specific) */
  data: Record<string, unknown>;

  /** Whether this output is stale (source inputs have changed) */
  isStale: boolean;

  /** Reason for staleness, if stale */
  staleReason?: string;

  /** Who/what generated this output */
  generatedBy: "ai" | "compute" | "hybrid" | "manual";

  /** Timestamp of generation */
  generatedAt: Date;

  /** Duration of generation in milliseconds */
  durationMs?: number;
}

// ---------------------------------------------------------------------------
// Quality Gate — validation checkpoints
// ---------------------------------------------------------------------------

export const QUALITY_GATE_IDS = [
  "DATA_COMPLETENESS",
  "INSIGHT_DEPTH",
  "STRATEGIC_SOUNDNESS",
  "CROSS_FRAMEWORK_COHERENCE",
  "DELIVERABLE_QUALITY",
] as const;

export type QualityGateId = (typeof QUALITY_GATE_IDS)[number];

export interface QualityGateResult {
  id: QualityGateId;
  name: string;
  passed: boolean;
  score: number;
  threshold: number;
  details: string;
  blockers?: string[];
}

// ---------------------------------------------------------------------------
// Orchestration Request
// ---------------------------------------------------------------------------

export interface OrchestrationRequest {
  strategyId: string;
  userId: string;
  /** Specific frameworks to run (default: all applicable) */
  frameworkIds?: string[];
  /** Force re-run even if outputs are fresh */
  forceRerun?: boolean;
  /** Stop on first error vs continue */
  stopOnError?: boolean;
}

export interface OrchestrationResult {
  success: boolean;
  frameworksRun: number;
  frameworksSkipped: number;
  frameworksFailed: number;
  errors: Array<{ frameworkId: string; error: string }>;
  durationMs: number;
  artemisScore?: number;
}
