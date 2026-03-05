// =============================================================================
// ARTEMIS Frameworks — Barrel Export
// =============================================================================
// Re-exports all framework types and schemas for clean imports.
// Usage: import { MovementArchitectureSchema, SuperfanStage } from "@/lib/types/frameworks"
// =============================================================================

// ── Core types ──────────────────────────────────────────────────────────
export {
  ARTEMIS_LAYERS,
  ArtemisLayerSchema,
  SUPERFAN_STAGES,
  SuperfanStageSchema,
  FRAMEWORK_CATEGORIES,
  FrameworkCategorySchema,
  NODE_TYPES,
  NodeTypeSchema,
  FRAMEWORK_RUN_STATUSES,
  QUALITY_GATE_IDS,
} from "./framework-descriptor";

export type {
  ArtemisLayer,
  SuperfanStage,
  FrameworkCategory,
  NodeType,
  FrameworkRunStatus,
  FrameworkDescriptor,
  FrameworkOutputData,
  QualityGateId,
  QualityGateResult,
  OrchestrationRequest,
  OrchestrationResult,
} from "./framework-descriptor";

// ── FW-20 — Movement Architecture (Couche 0) ───────────────────────────
export {
  MovementArchitectureSchema,
  ProphecySchema,
  ExistentialEnemySchema,
  DoctrineSchema,
  SacredArtifactSchema,
  LivingMythologySchema,
} from "./movement-architecture";

export type {
  MovementArchitectureData,
  Prophecy,
  ExistentialEnemy,
  Doctrine,
  SacredArtifact,
  LivingMythology,
} from "./movement-architecture";

// ── FW-05 — Grammar Systems (Couche 1) ─────────────────────────────────
export {
  GrammarSystemsSchema,
  ConceptualGrammarSchema,
  IconographicGrammarSchema,
  TransconceptGrammarSchema,
  TripleAncrageSchema,
} from "./grammar-systems";

export type {
  GrammarSystemsData,
  ConceptualGrammar,
  IconographicGrammar,
  TransconceptGrammar,
  TripleAncrage,
} from "./grammar-systems";

// ── FW-04 — Narrative Immersive (Couche 3, EVENT only) ──────────────────
export {
  NarrativeImmersiveSchema,
  NorthStarSchema,
  ArchitectureNarrativeSchema,
  SpatialMapSchema,
  QuestSystemSchema,
  NpcSystemSchema,
} from "./narrative-immersive";

export type {
  NarrativeImmersiveData,
  NorthStar,
  ArchitectureNarrative,
  SpatialMap,
  QuestSystem,
  NpcSystem,
} from "./narrative-immersive";

// ── FW-11 — Experience Architecture (Couche 3) ─────────────────────────
export {
  ExperienceArchitectureOutputSchema,
  TransitionSchema,
  EmotionalArcSchema,
  MomentOfTruthSchema,
  FrictionPointSchema,
} from "./experience-architecture";

export type {
  ExperienceArchitectureOutput,
  Transition,
  EmotionalArc,
  MomentOfTruth,
  FrictionPoint,
} from "./experience-architecture";

// ── FW-12 — Narrative Engineering (Couche 3) ────────────────────────────
export {
  NarrativeEngineeringOutputSchema,
  NarrativeArcSchema,
  SacredTextSchema,
  VocabularyStageSchema,
  StoryBankEntrySchema,
} from "./narrative-engineering";

export type {
  NarrativeEngineeringOutput,
  NarrativeArc,
  SacredText,
  VocabularyStage,
  StoryBankEntry,
} from "./narrative-engineering";

// ── FW-13 — Value Exchange Design (Couche 3) ────────────────────────────
export {
  ValueExchangeDesignOutputSchema,
  TierSegmentSchema,
  TransactionRitualSchema,
  BelongingSignalSchema,
  ExclusivityGradientSchema,
  MonetizationStreamSchema,
} from "./value-exchange-design";

export type {
  ValueExchangeDesignOutput,
  TierSegment,
  TransactionRitual,
  BelongingSignal,
  ExclusivityGradient,
  MonetizationStream,
} from "./value-exchange-design";

// ── FW-19 — Growth Mechanics Engine ───────────────────────────────────────
export {
  GrowthMechanicsOutputSchema,
  GrowthEngineTypeSchema,
  GrowthEngineSchema,
  FlywheelStepSchema,
  ScalingBreakpointSchema,
  AnsoffQuadrantSchema,
  ExpansionEntrySchema,
  GrowthCommunityMonetizationSchema,
} from "./growth-mechanics";

export type {
  GrowthMechanicsOutput,
  GrowthEngineType,
  GrowthEngine,
  FlywheelStep,
  ScalingBreakpoint,
  AnsoffQuadrant,
  ExpansionEntry,
  GrowthCommunityMonetization,
} from "./growth-mechanics";

// ── FW-15 — Cultural Expansion Protocol ──────────────────────────────────
export {
  CulturalExpansionOutputSchema,
  TranspositionCategorySchema,
  CulturalElementSchema,
  CulturalTranspositionSchema,
  LocalLegitimacySchema,
  FederalismModelSchema,
  FederalismSchema,
} from "./cultural-expansion";

export type {
  CulturalExpansionOutput,
  TranspositionCategory,
  CulturalElement,
  CulturalTransposition,
  LocalLegitimacy,
  FederalismModel,
  Federalism,
} from "./cultural-expansion";

// ── FW-17 — Brand Defense Protocol ────────────────────────────────────────
export {
  BrandDefenseOutputSchema,
  ThreatTypeSchema,
  ThreatSeveritySchema,
  ThreatSchema,
  CommunityDefenseSchema,
  CrisisNarrativeSchema,
  EnemyAsFuelSchema,
} from "./brand-defense";

export type {
  BrandDefenseOutput,
  ThreatType,
  ThreatSeverity,
  Threat,
  CommunityDefense,
  CrisisNarrative,
  EnemyAsFuel,
} from "./brand-defense";

// ── FW-18 — Internal Alignment System ────────────────────────────────────
export {
  InternalAlignmentOutputSchema,
  InternalizationItemSchema,
  InternalizationSchema,
  InternalRitualSchema,
  RitualFrequencySchema,
  RitualTypeSchema,
  ClergyMemberSchema,
  BrandAmbassadorLevelSchema,
  BrandCultureFitSchema,
  BrandCultureDimensionsSchema,
  BrandCultureGapSchema,
} from "./internal-alignment";

export type {
  InternalAlignmentOutput,
  InternalizationItem,
  Internalization,
  InternalRitual,
  RitualFrequency,
  RitualType,
  ClergyMember,
  BrandAmbassadorLevel,
  BrandCultureFit,
  BrandCultureDimensions,
  BrandCultureGap,
} from "./internal-alignment";

// ── FW-21 — Value Capture Engine (Couche 5) ──────────────────────────────
export {
  ValueCaptureEngineOutputSchema,
  RevenueModelSchema,
  RevenueStreamSchema,
  PricingMechanicSchema,
  RevenueScenarioSchema,
  CommunityMonetizationSchema,
  RevenueMixTargetSchema,
} from "./value-capture-engine";

export type {
  ValueCaptureEngineOutput,
  RevenueModel,
  PricingMechanic,
  RevenueScenario,
  CommunityMonetization,
  RevenueMixTarget,
} from "./value-capture-engine";

// ── FW-22 — Creative Methodology Layer ────────────────────────────────────
export {
  CreativeMethodologyOutputSchema,
  CreativeMethodTypeSchema,
  ProcessStepSchema,
  CreativeMethodSchema,
  MethodToolRelationshipSchema,
  MethodToolMappingSchema,
} from "./creative-methodology";

export type {
  CreativeMethodologyOutput,
  CreativeMethodType,
  ProcessStep,
  CreativeMethod,
  MethodToolRelationship,
  MethodToolMapping,
} from "./creative-methodology";

// ── FW-23 — Execution Sequencing Engine ──────────────────────────────────
export {
  ExecutionSequencingOutputSchema,
  SequencePhaseSchema,
  SequencingTemplateSchema,
  GoNoGoGateSchema,
  ResourceAllocationSchema,
  TimelineEntrySchema,
} from "./execution-sequencing";

export type {
  ExecutionSequencingOutput,
  SequencePhase,
  SequencingTemplate,
  GoNoGoGate,
  ResourceAllocation,
  TimelineEntry,
} from "./execution-sequencing";

// ── FW-14 — Brand Evolution Engine (Couche 4) ────────────────────────────
export {
  BrandEvolutionOutputSchema,
  IdentityCoreSchema,
  IdentityCoreElementSchema,
  DriftDetectionSchema,
  DriftIndicatorSchema,
  LifecycleStageSchema,
  LifecycleDetectionSchema,
} from "./brand-evolution";

export type {
  BrandEvolutionOutput,
  IdentityCore,
  IdentityCoreElement,
  DriftDetection,
  DriftIndicator,
  LifecycleStage,
  LifecycleDetection,
} from "./brand-evolution";

// ── FW-16 — Brand Architecture System ─────────────────────────────────────
export {
  BrandArchitectureOutputSchema,
  ArchitectureTypeSchema,
  ArchitectureModelSchema,
  InheritanceRuleSchema,
  CrossBrandMetricSchema,
  CrossBrandCultIndexSchema,
} from "./brand-architecture";

export type {
  BrandArchitectureOutput,
  ArchitectureType,
  ArchitectureModel,
  InheritanceRule,
  CrossBrandMetric,
  CrossBrandCultIndex,
} from "./brand-architecture";

// ── FW-24 — Alliance Architecture (Couche 5) ────────────────────────────
export {
  AllianceArchitectureOutputSchema,
  PartnerIntegrationLevelSchema,
  PartnerCategorySchema,
  PartnerPackageSchema,
  NegotiationProtocolSchema,
  NarrativeIntegrationSchema,
  MutualValueEntrySchema,
} from "./alliance-architecture";

export type {
  AllianceArchitectureOutput,
  PartnerIntegrationLevel,
  PartnerCategory,
  PartnerPackage,
  NegotiationProtocol,
  NarrativeIntegration,
  MutualValueEntry,
} from "./alliance-architecture";
