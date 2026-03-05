// =============================================================================
// Pillar Schemas — Barrel export
// =============================================================================
// Re-exports all 8 pillar schemas, types, helpers, and the PILLAR_SCHEMAS map.
// Import from here: import { AuthenticitePillarSchema, PILLAR_SCHEMAS } from "~/lib/types/pillars";
// =============================================================================

import { z } from "zod";

// ── Shared helpers ──────────────────────────────────────────────────────
export { flexStringArray, num } from "./shared";

// ── Pilier A — Authenticité ─────────────────────────────────────────────
export {
  AuthenticitePillarSchema,
  type AuthenticitePillarData,
} from "./authenticite";

// ── Pilier D — Distinction ──────────────────────────────────────────────
export {
  DistinctionPillarSchema,
  type DistinctionPillarData,
} from "./distinction";

// ── Pilier V — Valeur ───────────────────────────────────────────────────
export {
  ValeurPillarSchema,
  type ValeurPillarData,
  ValeurPillarSchemaV2,
  type ValeurPillarDataV2,
  ProduitServiceSchema,
  type ProduitService,
  ValeurCoutItemSchema,
  type ValeurCoutItem,
} from "./valeur";

// ── Pilier E — Engagement ───────────────────────────────────────────────
export {
  EngagementPillarSchema,
  type EngagementPillarData,
} from "./engagement";

// ── Pilier R — Risk ─────────────────────────────────────────────────────
export {
  MicroSwotSchema,
  type MicroSwot,
  RiskAuditResultSchema,
  type RiskAuditResult,
} from "./risk";

// ── Pilier T — Track ────────────────────────────────────────────────────
export {
  TrackAuditResultSchema,
  type TrackAuditResult,
} from "./track";

// ── Pilier I — Implementation ───────────────────────────────────────────
export {
  ImplementationDataSchema,
  type ImplementationData,
} from "./implementation";

// ── Pilier S — Synthèse ─────────────────────────────────────────────────
export {
  SynthesePillarSchema,
  type SynthesePillarData,
} from "./synthese";

// ── Re-imports for union type + map ─────────────────────────────────────
import type { AuthenticitePillarData } from "./authenticite";
import type { DistinctionPillarData } from "./distinction";
import type { ValeurPillarData } from "./valeur";
import type { EngagementPillarData } from "./engagement";
import type { RiskAuditResult } from "./risk";
import type { TrackAuditResult } from "./track";
import type { ImplementationData } from "./implementation";
import type { SynthesePillarData } from "./synthese";

import { AuthenticitePillarSchema } from "./authenticite";
import { DistinctionPillarSchema } from "./distinction";
import { ValeurPillarSchemaV2 } from "./valeur";
import { EngagementPillarSchema } from "./engagement";
import { RiskAuditResultSchema } from "./risk";
import { TrackAuditResultSchema } from "./track";
import { ImplementationDataSchema } from "./implementation";
import { SynthesePillarSchema } from "./synthese";

// ── Union type ──────────────────────────────────────────────────────────

export type PillarData =
  | AuthenticitePillarData
  | DistinctionPillarData
  | ValeurPillarData
  | EngagementPillarData
  | RiskAuditResult
  | TrackAuditResult
  | ImplementationData
  | SynthesePillarData;

// ── Schema map — dispatch by pillar type ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PILLAR_SCHEMAS: Record<string, z.ZodType<any>> = {
  A: AuthenticitePillarSchema,
  D: DistinctionPillarSchema,
  V: ValeurPillarSchemaV2,
  E: EngagementPillarSchema,
  R: RiskAuditResultSchema,
  T: TrackAuditResultSchema,
  I: ImplementationDataSchema,
  S: SynthesePillarSchema,
};
