// =============================================================================
// FW-23 — Execution Sequencing Engine Schema
// =============================================================================
// Defines sequence templates, timeline entries, go/no-go gates,
// and resource allocation for campaign execution planning.
// Variables: ES.activeSequence, ES.timeline, ES.goNoGoGates, ES.resourceAllocation
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Sequence Phase
// ---------------------------------------------------------------------------

export const SequencePhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number(),
  durationDays: z.number(),
  description: z.string(),
  deliverables: z.array(z.string()),
  budgetPercent: z.number(),
  dependencies: z.array(z.string()),
});

export type SequencePhase = z.infer<typeof SequencePhaseSchema>;

// ---------------------------------------------------------------------------
// Sequencing Template
// ---------------------------------------------------------------------------

export const SequencingTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    "GTM_LAUNCH",
    "ANNUAL_PLANNING",
    "EVENT_PRODUCTION",
    "RETROPLANNING",
    "EDITORIAL_CALENDAR",
  ]),
  description: z.string(),
  totalDurationDays: z.number(),
  phases: z.array(SequencePhaseSchema),
  suitableFor: z.array(z.string()),
});

export type SequencingTemplate = z.infer<typeof SequencingTemplateSchema>;

// ---------------------------------------------------------------------------
// Go / No-Go Gate
// ---------------------------------------------------------------------------

export const GoNoGoGateSchema = z.object({
  id: z.string(),
  name: z.string(),
  afterPhaseId: z.string(),
  criteria: z.array(
    z.object({
      criterion: z.string(),
      threshold: z.string(),
      weight: z.number(),
    }),
  ),
  minimumScore: z.number(),
});

export type GoNoGoGate = z.infer<typeof GoNoGoGateSchema>;

// ---------------------------------------------------------------------------
// Resource Allocation
// ---------------------------------------------------------------------------

export const ResourceAllocationSchema = z.object({
  phaseId: z.string(),
  phaseName: z.string(),
  budgetPercent: z.number(),
  teamSize: z.number(),
  keyRoles: z.array(z.string()),
});

export type ResourceAllocation = z.infer<typeof ResourceAllocationSchema>;

// ---------------------------------------------------------------------------
// Timeline Entry
// ---------------------------------------------------------------------------

export const TimelineEntrySchema = z.object({
  id: z.string(),
  phaseId: z.string(),
  name: z.string(),
  startDay: z.number(),
  endDay: z.number(),
  status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "BLOCKED"]),
});

export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;

// ---------------------------------------------------------------------------
// Execution Sequencing — Combined Output
// ---------------------------------------------------------------------------

export const ExecutionSequencingOutputSchema = z.object({
  activeSequence: SequencingTemplateSchema,
  timeline: z.array(TimelineEntrySchema),
  goNoGoGates: z.array(GoNoGoGateSchema),
  resourceAllocation: z.array(ResourceAllocationSchema),
});

export type ExecutionSequencingOutput = z.infer<typeof ExecutionSequencingOutputSchema>;
