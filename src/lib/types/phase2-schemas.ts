// =============================================================================
// LIB L.12 — Phase 2 Schemas
// =============================================================================
// Zod input validation schemas for Phase 2 (Audit / Couche Traduction) data.
// Covers: brief generation, preset management, translation document updates.
// Exports: GenerateBriefSchema, GenerateFromPresetSchema, BulkGenerateSchema,
//   UpdateTranslationSchema, CreatePresetSchema, UpdatePresetSchema.
// Used by: phase2 tRPC router, brief generation UI, preset management.
// =============================================================================

import { z } from "zod";
import { BRIEF_TYPES, TRANSLATION_STATUSES } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Translation Document schemas
// ---------------------------------------------------------------------------

/** Generate a single brief for a strategy. */
export const GenerateBriefSchema = z.object({
  strategyId: z.string().min(1),
  type: z.enum(BRIEF_TYPES),
  metadata: z.record(z.unknown()).optional(),
});

/** Generate all briefs from a preset. */
export const GenerateFromPresetSchema = z.object({
  strategyId: z.string().min(1),
  presetId: z.string().min(1),
});

/** Generate multiple briefs in parallel. */
export const BulkGenerateSchema = z.object({
  strategyId: z.string().min(1),
  briefTypes: z.array(z.enum(BRIEF_TYPES)).min(1).max(10),
});

/** Update a translation document (status, approval, etc.). */
export const UpdateTranslationSchema = z.object({
  id: z.string().min(1),
  status: z.enum(TRANSLATION_STATUSES).optional(),
  content: z.unknown().optional(),
  approvedBy: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Brief Preset schemas
// ---------------------------------------------------------------------------

/** Create a custom preset. */
export const CreatePresetSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  briefTypes: z.array(z.string().min(1)).min(1).max(20),
  vertical: z.string().optional(),
});

/** Update an existing preset. */
export const UpdatePresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  briefTypes: z.array(z.string().min(1)).min(1).max(20).optional(),
  vertical: z.string().nullable().optional(),
});
