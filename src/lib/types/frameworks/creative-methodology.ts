// =============================================================================
// FW-22 — Creative Methodology Layer Schema
// =============================================================================
// Defines the creative method registry and method-to-tool mappings that power
// the GLORY tools layer.  Each method is a repeatable creative process with
// defined inputs, steps, outputs, and anti-patterns.
// Variables produced: CM.methodRegistry, CM.methodToolMapping
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Creative Method Types
// ---------------------------------------------------------------------------

export const CreativeMethodTypeSchema = z.enum([
  "NAMING",
  "VISUAL",
  "CONTENT",
  "DIAGNOSTIC",
  "IDEATION",
  "CURATION",
]);

export type CreativeMethodType = z.infer<typeof CreativeMethodTypeSchema>;

// ---------------------------------------------------------------------------
// Process Step
// ---------------------------------------------------------------------------

export const ProcessStepSchema = z.object({
  step: z.number(),
  action: z.string(),
  duration: z.string(),
});

export type ProcessStep = z.infer<typeof ProcessStepSchema>;

// ---------------------------------------------------------------------------
// Creative Method
// ---------------------------------------------------------------------------

export const CreativeMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: CreativeMethodTypeSchema,
  description: z.string(),
  inputs: z.array(z.string()),
  process: z.array(ProcessStepSchema),
  outputs: z.array(z.string()),
  antiPatterns: z.array(z.string()),
  gloryToolsServed: z.array(z.string()),
});

export type CreativeMethod = z.infer<typeof CreativeMethodSchema>;

// ---------------------------------------------------------------------------
// Method ↔ Tool Mapping
// ---------------------------------------------------------------------------

export const MethodToolRelationshipSchema = z.enum([
  "FEEDS",
  "VALIDATES",
  "ENRICHES",
]);

export type MethodToolRelationship = z.infer<typeof MethodToolRelationshipSchema>;

export const MethodToolMappingSchema = z.object({
  methodId: z.string(),
  toolId: z.string(),
  relationship: MethodToolRelationshipSchema,
  description: z.string(),
});

export type MethodToolMapping = z.infer<typeof MethodToolMappingSchema>;

// ---------------------------------------------------------------------------
// Creative Methodology — Combined Output
// ---------------------------------------------------------------------------

export const CreativeMethodologyOutputSchema = z.object({
  methodRegistry: z.array(CreativeMethodSchema),
  methodToolMapping: z.array(MethodToolMappingSchema),
});

export type CreativeMethodologyOutput = z.infer<typeof CreativeMethodologyOutputSchema>;
