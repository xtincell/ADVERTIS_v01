// =============================================================================
// LIB L.5 — Pillar Data Types
// =============================================================================
// Re-exports typed interfaces from pillar-schemas.ts (the source of truth).
// Exports: AuthenticitePillarData, DistinctionPillarData, ValeurPillarData,
//   EngagementPillarData, SynthesePillarData, PillarData.
// Used by: components and services that consume typed pillar content.
// =============================================================================

export type {
  AuthenticitePillarData,
  DistinctionPillarData,
  ValeurPillarData,
  EngagementPillarData,
  SynthesePillarData,
  PillarData,
} from "./pillar-schemas";
