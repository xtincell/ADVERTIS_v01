// =============================================================================
// LIB L.3 — Pillar Schemas (Zod)
// =============================================================================
// BACKWARD-COMPAT RE-EXPORT — v3 splits schemas into per-pillar files.
// All 35+ consumers keep importing from here; actual code lives in pillars/.
// =============================================================================

export {
  // Shared helpers
  flexStringArray,
  num,

  // Pilier A
  AuthenticitePillarSchema,
  type AuthenticitePillarData,

  // Pilier D
  DistinctionPillarSchema,
  type DistinctionPillarData,

  // Pilier V
  ValeurPillarSchema,
  type ValeurPillarData,
  ValeurPillarSchemaV2,
  type ValeurPillarDataV2,
  ProduitServiceSchema,
  type ProduitService,
  ValeurCoutItemSchema,
  type ValeurCoutItem,

  // Pilier E
  EngagementPillarSchema,
  type EngagementPillarData,

  // Pilier R
  MicroSwotSchema,
  type MicroSwot,
  RiskAuditResultSchema,
  type RiskAuditResult,

  // Pilier T
  TrackAuditResultSchema,
  type TrackAuditResult,

  // Pilier I
  ImplementationDataSchema,
  type ImplementationData,

  // Pilier S
  SynthesePillarSchema,
  type SynthesePillarData,

  // Union + map
  type PillarData,
  PILLAR_SCHEMAS,
} from "./pillars";
