// =============================================================================
// LIB L.10 — Variable Definition Registry
// =============================================================================
// Static registry of all ~187 brand variable definitions with metadata and
// dependency graph. Each variable key maps to a definition that describes:
//   - category (interview | pillar | score | framework)
//   - pillar type (A-S) or framework prefix (MA, GS, etc.)
//   - upstream dependencies (dependsOn)
//   - expected data sources
//
// The dependency graph is methodology-defined (static), not per-strategy.
// Used by: variable-store, variable-extractor, pillar-materializer,
//   staleness-propagator, variable tRPC router.
//
// Public API:
//   - getVariableDefinition(key) — lookup by key
//   - getVariablesForPillar(pillarType) — filter by pillar
//   - getVariablesByCategory(category) — filter by category
//   - getDependencies(key) — upstream dependencies (what this key needs)
//   - getDependents(key) — downstream dependents (what depends on this key)
//   - getTopologicalOrder() — Kahn's algorithm sort
//   - ALL_VARIABLE_KEYS — list of all keys
//   - VARIABLE_DEFINITIONS — full definitions array
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VariableCategory = "interview" | "pillar" | "score" | "framework";

export type VariableSource =
  | "user_input"
  | "ai_generation"
  | "file_import"
  | "module"
  | "debrief"
  | "score_engine"
  | "manual_edit"
  | "framework";

export interface VariableDefinition {
  /** Unique key: "interview.A1", "A.identite", "score.coherence" */
  key: string;
  /** Human-readable French label */
  label: string;
  /** Category of this variable */
  category: VariableCategory;
  /** Associated pillar type (A-S), undefined for scores */
  pillarType?: string;
  /** Top-level key in pillar.content JSON (for pillar vars) */
  pillarSection?: string;
  /** Interview variable ID e.g. "A1" (for interview vars only) */
  interviewId?: string;
  /** Keys this variable depends on (upstream) */
  dependsOn: string[];
  /** Expected sources for this variable */
  expectedSources: VariableSource[];
  /** Short description of what this variable represents */
  description: string;
}

// ---------------------------------------------------------------------------
// Key group constants — section keys per pillar
// ---------------------------------------------------------------------------

// Interview variable keys
const INTERVIEW_A = [
  "interview.A0", "interview.A1", "interview.A2", "interview.A3",
  "interview.A4", "interview.A5", "interview.A6",
] as const;

const INTERVIEW_D = [
  "interview.D1", "interview.D2", "interview.D3", "interview.D4",
  "interview.D5", "interview.D6", "interview.D7",
] as const;

const INTERVIEW_V = [
  "interview.V0", "interview.V1", "interview.V2", "interview.V3",
  "interview.V4", "interview.V5", "interview.V6",
  "interview.V7", "interview.V8",
] as const;

const INTERVIEW_E = [
  "interview.E1", "interview.E2", "interview.E3",
  "interview.E4", "interview.E5", "interview.E6",
] as const;

// Pillar section keys (match top-level keys in Zod schemas)
const SECTIONS_A = [
  "A.identite", "A.herosJourney", "A.ikigai",
  "A.valeurs", "A.hierarchieCommunautaire", "A.timelineNarrative",
] as const;

const SECTIONS_D = [
  "D.personas", "D.paysageConcurrentiel", "D.promessesDeMarque",
  "D.positionnement", "D.tonDeVoix", "D.identiteVisuelle",
  "D.assetsLinguistiques",
] as const;

const SECTIONS_V = [
  "V.produitsCatalogue", "V.productLadder",
  "V.valeurMarqueTangible", "V.valeurMarqueIntangible",
  "V.valeurClientTangible", "V.valeurClientIntangible",
  "V.coutMarqueTangible", "V.coutMarqueIntangible",
  "V.coutClientTangible", "V.coutClientIntangible",
  "V.cac", "V.ltv", "V.ltvCacRatio", "V.pointMort",
  "V.marges", "V.notesEconomics", "V.dureeLTV",
  "V.margeNette", "V.roiEstime", "V.paybackPeriod",
] as const;

const SECTIONS_E = [
  "E.touchpoints", "E.rituels", "E.principesCommunautaires",
  "E.gamification", "E.aarrr", "E.kpis",
] as const;

const SECTIONS_R = [
  "R.microSwots", "R.globalSwot", "R.riskScore",
  "R.riskScoreJustification", "R.probabilityImpactMatrix",
  "R.mitigationPriorities", "R.summary",
] as const;

const SECTIONS_T = [
  "T.triangulation", "T.hypothesisValidation", "T.marketReality",
  "T.tamSamSom", "T.competitiveBenchmark", "T.brandMarketFitScore",
  "T.brandMarketFitJustification", "T.strategicRecommendations",
  "T.summary",
] as const;

const SECTIONS_I = [
  "I.brandIdentity", "I.positioning", "I.valueArchitecture",
  "I.engagementStrategy", "I.riskSynthesis", "I.marketValidation",
  "I.strategicRoadmap", "I.campaigns", "I.budgetAllocation",
  "I.teamStructure", "I.launchPlan", "I.operationalPlaybook",
  "I.brandPlatform", "I.copyStrategy", "I.bigIdea",
  "I.activationDispositif", "I.governance", "I.workstreams",
  "I.brandArchitecture", "I.guidingPrinciples",
  "I.coherenceScore", "I.executiveSummary",
] as const;

const SECTIONS_S = [
  "S.syntheseExecutive", "S.visionStrategique", "S.coherencePiliers",
  "S.facteursClesSucces", "S.recommandationsPrioritaires",
  "S.scoreCoherence", "S.axesStrategiques", "S.sprint90Recap",
  "S.campaignsSummary", "S.activationSummary", "S.kpiDashboard",
] as const;

// ARTEMIS pillar extensions (stored in pillar content, produced by frameworks)
const SECTIONS_A_ARTEMIS = [
  "A.prophecy", "A.enemy", "A.doctrine", "A.livingMythology",
] as const;

const SECTIONS_D_ARTEMIS = [
  "D.sacredObjects", "D.proofPoints", "D.symboles",
] as const;

const SECTIONS_E_ARTEMIS = [
  "E.sacredCalendar", "E.commandments", "E.ritesDePassage", "E.sacraments",
] as const;

// Framework output variables (stored in FrameworkOutput, produced by framework modules)
const SECTIONS_MA = [
  "MA.prophecy", "MA.existentialEnemy", "MA.doctrine",
  "MA.sacredArtifacts", "MA.livingMythology",
] as const;

const SECTIONS_GS = [
  "GS.conceptualGrammar", "GS.iconographicGrammar", "GS.transconceptGrammar",
  "GS.tripleAncrage", "GS.vocabularyAuthorized", "GS.vocabularyForbidden",
] as const;

const SECTIONS_B = [
  "B.budgetVentile", "B.margeNette", "B.viabilite",
] as const;

const SECTIONS_XA = [
  "XA.transitionMap", "XA.emotionalArc", "XA.momentsDeTruth",
  "XA.frictionMap", "XA.brandCoherenceScore",
] as const;

const SECTIONS_XB = [
  "XB.narrativeArc", "XB.sacredTexts", "XB.vocabularyByStage", "XB.storyBank",
] as const;

const SECTIONS_NI = [
  "NI.northStar", "NI.architectureNarrative", "NI.spatialMap",
  "NI.questSystem", "NI.npcSystem", "NI.diegeticSponsoring",
] as const;

const SECTIONS_XC = [
  "XC.tierSegmentMap", "XC.transactionRituals", "XC.belongingSignals",
  "XC.exclusivityGradient", "XC.reciprocityMechanics", "XC.monetizationMap",
] as const;

const SECTIONS_VC = [
  "VC.revenueModel", "VC.pricingMechanics", "VC.revenueScenarios",
  "VC.communityMonetization", "VC.revenueMixTarget",
] as const;

const SECTIONS_AA = [
  "AA.partnerTaxonomy", "AA.partnerPackages", "AA.negotiationProtocol",
  "AA.narrativeIntegration", "AA.mutualValueMatrix",
] as const;

const SECTIONS_IA = [
  "IA.internalization", "IA.internalRituals", "IA.clergyMapping",
  "IA.brandCultureFit",
] as const;

const SECTIONS_CM = [
  "CM.methodRegistry", "CM.methodToolMapping",
] as const;

const SECTIONS_ES = [
  "ES.activeSequence", "ES.timeline", "ES.goNoGoGates", "ES.resourceAllocation",
] as const;

const SECTIONS_GM = [
  "GM.growthEngine", "GM.flywheel", "GM.scalingBreakpoints",
  "GM.expansionMatrix", "GM.communityMonetization",
] as const;

const SECTIONS_CE = [
  "CE.culturalTransposition", "CE.localLegitimacy", "CE.federalism",
] as const;

const SECTIONS_BA = [
  "BA.architectureModel", "BA.inheritanceRules", "BA.crossBrandCultIndex",
] as const;

const SECTIONS_BE = [
  "BE.identityCore", "BE.driftDetection", "BE.lifecycleStage",
] as const;

const SECTIONS_BD = [
  "BD.threatMap", "BD.communityDefense", "BD.crisisNarrative", "BD.enemyAsFuel",
] as const;

// ---------------------------------------------------------------------------
// Dependency groups — what each pillar level depends on
// ---------------------------------------------------------------------------
// A sections depend on interview A data
// D sections depend on interview D data + A pillar sections
// V depends on interview V + A + D sections
// E depends on interview E + A + D + V sections
// R depends on all input pillar sections (A-E)
// T depends on R sections
// I depends on A through T sections
// S depends on A through I sections

const DEPS_A: string[] = [...INTERVIEW_A];
const DEPS_D: string[] = [...INTERVIEW_D, ...SECTIONS_A];
const DEPS_V: string[] = [...INTERVIEW_V, ...SECTIONS_A, ...SECTIONS_D];
const DEPS_E: string[] = [...INTERVIEW_E, ...SECTIONS_A, ...SECTIONS_D, ...SECTIONS_V];
const DEPS_R: string[] = [...SECTIONS_A, ...SECTIONS_D, ...SECTIONS_V, ...SECTIONS_E];
const DEPS_T: string[] = [...SECTIONS_R];
const DEPS_I: string[] = [
  ...SECTIONS_A, ...SECTIONS_D, ...SECTIONS_V, ...SECTIONS_E,
  ...SECTIONS_R, ...SECTIONS_T,
];
const DEPS_S: string[] = [
  ...SECTIONS_A, ...SECTIONS_D, ...SECTIONS_V, ...SECTIONS_E,
  ...SECTIONS_R, ...SECTIONS_T, ...SECTIONS_I,
];

// ── ARTEMIS dependency groups ──────────────────────────────────────────────
// ARTEMIS pillar extension deps: base pillar deps + existing pillar sections
const DEPS_A_ARTEMIS: string[] = [...DEPS_A, ...SECTIONS_A];
const DEPS_D_ARTEMIS: string[] = [...DEPS_D, ...SECTIONS_D, ...SECTIONS_MA];
const DEPS_E_ARTEMIS: string[] = [...DEPS_E, ...SECTIONS_E];

// Framework output deps: based on each framework's inputVariables
const DEPS_MA: string[] = ["A.identite", "A.herosJourney", "A.valeurs", "D.positionnement"];
const DEPS_GS: string[] = ["A.identite", "A.valeurs", "A.doctrine", "MA.sacredArtifacts", "D.identiteVisuelle"];
const DEPS_FW_B: string[] = ["V.cac", "V.ltv", "V.marges"];
const DEPS_XA: string[] = ["A.identite", "D.personas", "D.identiteVisuelle", "D.tonDeVoix", "E.touchpoints", "E.rituels", "MA.sacredArtifacts"];
const DEPS_XB: string[] = ["A.herosJourney", "A.livingMythology", "D.assetsLinguistiques", "D.tonDeVoix", "MA.prophecy", "MA.existentialEnemy", "MA.doctrine", "GS.vocabularyAuthorized", "XA.transitionMap"];
const DEPS_NI: string[] = ["D.identiteVisuelle", "D.assetsLinguistiques", "GS.vocabularyAuthorized", "GS.vocabularyForbidden"];
const DEPS_XC: string[] = ["V.produitsCatalogue", "V.productLadder", "V.valeurClientTangible", "V.valeurClientIntangible", "E.gamification", "XA.transitionMap", "XB.narrativeArc", "MA.sacredArtifacts"];
const DEPS_VC: string[] = ["V.productLadder", "V.cac", "V.ltv", "XC.tierSegmentMap", "XC.monetizationMap"];
const DEPS_AA: string[] = ["MA.prophecy", "MA.doctrine", "GS.transconceptGrammar", "VC.revenueModel"];
const DEPS_IA: string[] = ["A.valeurs", "A.hierarchieCommunautaire", "E.rituels"];
const DEPS_CM: string[] = [];
const DEPS_ES: string[] = [...SECTIONS_A, ...SECTIONS_D, ...SECTIONS_V, ...SECTIONS_E];
const DEPS_GM: string[] = ["VC.revenueModel"];
const DEPS_CE: string[] = ["MA.doctrine", ...SECTIONS_A, ...SECTIONS_D, ...SECTIONS_V, ...SECTIONS_E];
const DEPS_BA: string[] = [];
const DEPS_BE: string[] = [];
const DEPS_BD: string[] = ["MA.existentialEnemy", "MA.doctrine"];

// ---------------------------------------------------------------------------
// Interview variable definitions (26)
// ---------------------------------------------------------------------------

const INTERVIEW_DEFINITIONS: VariableDefinition[] = [
  // ── Pillar A (Authenticité) — 7 variables ──
  { key: "interview.A0", label: "Marque & Accroche", category: "interview", pillarType: "A", interviewId: "A0", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Nom de marque, signature/accroche et positionnement en une phrase." },
  { key: "interview.A1", label: "Identité de Marque", category: "interview", pillarType: "A", interviewId: "A1", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Noyau identitaire — nom, archétype, citation fondatrice." },
  { key: "interview.A2", label: "Hero's Journey", category: "interview", pillarType: "A", interviewId: "A2", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Histoire en 5 actes de la marque." },
  { key: "interview.A3", label: "Ikigai", category: "interview", pillarType: "A", interviewId: "A3", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Raison d'être via les 4 cercles de l'ikigai." },
  { key: "interview.A4", label: "Valeurs Schwartz", category: "interview", pillarType: "A", interviewId: "A4", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "3 à 5 valeurs universelles hiérarchisées selon Schwartz." },
  { key: "interview.A5", label: "Hiérarchie Communautaire", category: "interview", pillarType: "A", interviewId: "A5", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "6 niveaux de fans : Spectateur → Évangéliste." },
  { key: "interview.A6", label: "Timeline Narrative", category: "interview", pillarType: "A", interviewId: "A6", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Chronologie en 4 actes : Origines → Vision Future." },

  // ── Pillar D (Distinction) — 7 variables ──
  { key: "interview.D1", label: "Personas", category: "interview", pillarType: "D", interviewId: "D1", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Portraits détaillés des clients cibles." },
  { key: "interview.D2", label: "Paysage Concurrentiel", category: "interview", pillarType: "D", interviewId: "D2", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Cartographie de 4+ concurrents." },
  { key: "interview.D3", label: "Promesses de Marque", category: "interview", pillarType: "D", interviewId: "D3", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Promesse maître + sous-promesses par segment." },
  { key: "interview.D4", label: "Positionnement", category: "interview", pillarType: "D", interviewId: "D4", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Statement de positionnement unique." },
  { key: "interview.D5", label: "Ton de Voix", category: "interview", pillarType: "D", interviewId: "D5", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Personnalité vocale de la marque." },
  { key: "interview.D6", label: "Identité Visuelle", category: "interview", pillarType: "D", interviewId: "D6", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Couleurs, direction photo, mood boards, typographies." },
  { key: "interview.D7", label: "Assets Linguistiques", category: "interview", pillarType: "D", interviewId: "D7", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Mantras, slogans, vocabulaire propriétaire." },

  // ── Pillar V (Valeur) — 9 variables ──
  { key: "interview.V0", label: "Catalogue Produits & Services", category: "interview", pillarType: "V", interviewId: "V0", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Liste complète des produits et services avec méta-données." },
  { key: "interview.V1", label: "Product Ladder", category: "interview", pillarType: "V", interviewId: "V1", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Architecture de l'offre en tiers." },
  { key: "interview.V2", label: "Valeur pour la Marque", category: "interview", pillarType: "V", interviewId: "V2", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Actifs tangibles et intangibles de la marque." },
  { key: "interview.V3", label: "Valeur pour le Client", category: "interview", pillarType: "V", interviewId: "V3", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Gains tangibles et intangibles pour le client." },
  { key: "interview.V4", label: "Coût pour la Marque", category: "interview", pillarType: "V", interviewId: "V4", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Coûts tangibles et intangibles pour la marque." },
  { key: "interview.V5", label: "Coût pour le Client", category: "interview", pillarType: "V", interviewId: "V5", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Coûts tangibles et intangibles pour le client." },
  { key: "interview.V6", label: "Unit Economics", category: "interview", pillarType: "V", interviewId: "V6", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "CAC, LTV, marges, point mort, ratio LTV/CAC." },
  { key: "interview.V7", label: "Budget Communication Annuel", category: "interview", pillarType: "V", interviewId: "V7", dependsOn: [], expectedSources: ["user_input"], description: "Budget annuel communication et marketing." },
  { key: "interview.V8", label: "Chiffre d'Affaires Visé", category: "interview", pillarType: "V", interviewId: "V8", dependsOn: [], expectedSources: ["user_input"], description: "CA annuel cible pour les ratios financiers." },

  // ── Pillar E (Engagement) — 6 variables ──
  { key: "interview.E1", label: "Touchpoints", category: "interview", pillarType: "E", interviewId: "E1", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Points de contact physiques, digitaux et humains." },
  { key: "interview.E2", label: "Rituels", category: "interview", pillarType: "E", interviewId: "E2", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Comportements Always-On et Cycliques de la marque." },
  { key: "interview.E3", label: "Principes Communautaires", category: "interview", pillarType: "E", interviewId: "E3", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "5 à 10 principes de la communauté + tabous." },
  { key: "interview.E4", label: "Gamification", category: "interview", pillarType: "E", interviewId: "E4", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Système de progression en 3 à 5 niveaux." },
  { key: "interview.E5", label: "AARRR", category: "interview", pillarType: "E", interviewId: "E5", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "Métriques pirate funnel : Acquisition → Referral." },
  { key: "interview.E6", label: "KPIs Dashboard", category: "interview", pillarType: "E", interviewId: "E6", dependsOn: [], expectedSources: ["user_input", "file_import"], description: "1 à 3 KPIs par variable ADVERTIS." },
];

// ---------------------------------------------------------------------------
// Pillar A section definitions (6)
// ---------------------------------------------------------------------------

const PILLAR_A_DEFINITIONS: VariableDefinition[] = [
  { key: "A.identite", label: "Identité (Pilier A)", category: "pillar", pillarType: "A", pillarSection: "identite", dependsOn: DEPS_A, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Archétype, citation fondatrice, noyau identitaire." },
  { key: "A.herosJourney", label: "Hero's Journey (Pilier A)", category: "pillar", pillarType: "A", pillarSection: "herosJourney", dependsOn: DEPS_A, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Histoire en 5 actes de la marque." },
  { key: "A.ikigai", label: "Ikigai (Pilier A)", category: "pillar", pillarType: "A", pillarSection: "ikigai", dependsOn: DEPS_A, expectedSources: ["ai_generation", "manual_edit", "module"], description: "4 cercles de l'ikigai appliqués à la marque." },
  { key: "A.valeurs", label: "Valeurs (Pilier A)", category: "pillar", pillarType: "A", pillarSection: "valeurs", dependsOn: DEPS_A, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Valeurs Schwartz hiérarchisées et justifiées." },
  { key: "A.hierarchieCommunautaire", label: "Hiérarchie Communautaire (Pilier A)", category: "pillar", pillarType: "A", pillarSection: "hierarchieCommunautaire", dependsOn: DEPS_A, expectedSources: ["ai_generation", "manual_edit", "module"], description: "6 niveaux de fans avec descriptions et privilèges." },
  { key: "A.timelineNarrative", label: "Timeline Narrative (Pilier A)", category: "pillar", pillarType: "A", pillarSection: "timelineNarrative", dependsOn: DEPS_A, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Chronologie en 4 actes de la marque." },
];

// ---------------------------------------------------------------------------
// Pillar D section definitions (7)
// ---------------------------------------------------------------------------

const PILLAR_D_DEFINITIONS: VariableDefinition[] = [
  { key: "D.personas", label: "Personas (Pilier D)", category: "pillar", pillarType: "D", pillarSection: "personas", dependsOn: DEPS_D, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Portraits détaillés des personas cibles." },
  { key: "D.paysageConcurrentiel", label: "Paysage Concurrentiel (Pilier D)", category: "pillar", pillarType: "D", pillarSection: "paysageConcurrentiel", dependsOn: DEPS_D, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Cartographie concurrentielle avec forces/faiblesses." },
  { key: "D.promessesDeMarque", label: "Promesses de Marque (Pilier D)", category: "pillar", pillarType: "D", pillarSection: "promessesDeMarque", dependsOn: DEPS_D, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Promesse maître et sous-promesses." },
  { key: "D.positionnement", label: "Positionnement (Pilier D)", category: "pillar", pillarType: "D", pillarSection: "positionnement", dependsOn: DEPS_D, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Statement de positionnement unique." },
  { key: "D.tonDeVoix", label: "Ton de Voix (Pilier D)", category: "pillar", pillarType: "D", pillarSection: "tonDeVoix", dependsOn: DEPS_D, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Personnalité vocale : on dit / on ne dit pas." },
  { key: "D.identiteVisuelle", label: "Identité Visuelle (Pilier D)", category: "pillar", pillarType: "D", pillarSection: "identiteVisuelle", dependsOn: DEPS_D, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Direction artistique, palette, mood." },
  { key: "D.assetsLinguistiques", label: "Assets Linguistiques (Pilier D)", category: "pillar", pillarType: "D", pillarSection: "assetsLinguistiques", dependsOn: DEPS_D, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Mantras, vocabulaire propriétaire." },
];

// ---------------------------------------------------------------------------
// Pillar V section definitions (20 — atomised)
// ---------------------------------------------------------------------------

const PILLAR_V_DEFINITIONS: VariableDefinition[] = [
  // V0 catalogue
  { key: "V.produitsCatalogue", label: "Catalogue Produits & Services (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "produitsCatalogue", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Source de vérité : tous les produits/services de la marque avec méta-données." },
  // Product Ladder
  { key: "V.productLadder", label: "Product Ladder (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "productLadder", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Architecture de l'offre en tiers composée depuis V0." },
  // 8 atomic value/cost variables
  { key: "V.valeurMarqueTangible", label: "Valeur Marque Tangible (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "valeurMarqueTangible", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Actifs tangibles de la marque (brevets, technologie, base clients)." },
  { key: "V.valeurMarqueIntangible", label: "Valeur Marque Intangible (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "valeurMarqueIntangible", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Actifs intangibles de la marque (réputation, savoir-faire, culture)." },
  { key: "V.valeurClientTangible", label: "Valeur Client Tangible (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "valeurClientTangible", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Gains tangibles pour le client (fonctionnels, mesurables)." },
  { key: "V.valeurClientIntangible", label: "Valeur Client Intangible (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "valeurClientIntangible", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Gains intangibles pour le client (émotionnels, sociaux)." },
  { key: "V.coutMarqueTangible", label: "Coût Marque Tangible (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "coutMarqueTangible", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Coûts tangibles de la marque (CAPEX, OPEX)." },
  { key: "V.coutMarqueIntangible", label: "Coût Marque Intangible (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "coutMarqueIntangible", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Coûts intangibles/cachés de la marque." },
  { key: "V.coutClientTangible", label: "Coût Client Tangible (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "coutClientTangible", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Coûts/frictions tangibles pour le client." },
  { key: "V.coutClientIntangible", label: "Coût Client Intangible (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "coutClientIntangible", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Coûts/frictions intangibles pour le client." },
  // Atomic unit economics — base
  { key: "V.cac", label: "CAC (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "cac", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit"], description: "Coût d'acquisition client." },
  { key: "V.ltv", label: "LTV (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "ltv", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit"], description: "Valeur vie client." },
  { key: "V.ltvCacRatio", label: "Ratio LTV/CAC (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "ltvCacRatio", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit"], description: "Ratio LTV/CAC (seuil sain >= 3x)." },
  { key: "V.pointMort", label: "Point Mort (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "pointMort", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit"], description: "Estimation du point mort / seuil de rentabilité." },
  { key: "V.marges", label: "Marges (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "marges", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit"], description: "Structure de marges brutes." },
  { key: "V.notesEconomics", label: "Notes Economics (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "notesEconomics", dependsOn: DEPS_V, expectedSources: ["ai_generation", "manual_edit"], description: "Hypothèses et notes sur les unit economics." },
  { key: "V.dureeLTV", label: "Durée LTV (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "dureeLTV", dependsOn: DEPS_V, expectedSources: ["user_input", "ai_generation"], description: "Durée de vie client en mois (défaut 24)." },
  // Atomic unit economics — derived (auto-computed)
  { key: "V.margeNette", label: "Marge Nette (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "margeNette", dependsOn: [...DEPS_V, "V.cac", "V.ltv"], expectedSources: ["module"], description: "LTV - CAC (calculé automatiquement)." },
  { key: "V.roiEstime", label: "ROI Estimé (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "roiEstime", dependsOn: [...DEPS_V, "V.cac", "V.ltv"], expectedSources: ["module"], description: "((LTV-CAC)/CAC)*100 (calculé automatiquement)." },
  { key: "V.paybackPeriod", label: "Payback Period (Pilier V)", category: "pillar", pillarType: "V", pillarSection: "paybackPeriod", dependsOn: [...DEPS_V, "V.cac", "V.ltv", "V.dureeLTV"], expectedSources: ["module"], description: "CAC / (LTV/dureeLTV) en mois (calculé automatiquement)." },
];

// ---------------------------------------------------------------------------
// Pillar E section definitions (6)
// ---------------------------------------------------------------------------

const PILLAR_E_DEFINITIONS: VariableDefinition[] = [
  { key: "E.touchpoints", label: "Touchpoints (Pilier E)", category: "pillar", pillarType: "E", pillarSection: "touchpoints", dependsOn: DEPS_E, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Points de contact physiques, digitaux, humains." },
  { key: "E.rituels", label: "Rituels (Pilier E)", category: "pillar", pillarType: "E", pillarSection: "rituels", dependsOn: DEPS_E, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Comportements Always-On et Cycliques." },
  { key: "E.principesCommunautaires", label: "Principes Communautaires (Pilier E)", category: "pillar", pillarType: "E", pillarSection: "principesCommunautaires", dependsOn: DEPS_E, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Principes communautaires et tabous." },
  { key: "E.gamification", label: "Gamification (Pilier E)", category: "pillar", pillarType: "E", pillarSection: "gamification", dependsOn: DEPS_E, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Système de progression en niveaux." },
  { key: "E.aarrr", label: "AARRR (Pilier E)", category: "pillar", pillarType: "E", pillarSection: "aarrr", dependsOn: DEPS_E, expectedSources: ["ai_generation", "manual_edit", "module"], description: "Métriques pirate funnel par étape." },
  { key: "E.kpis", label: "KPIs (Pilier E)", category: "pillar", pillarType: "E", pillarSection: "kpis", dependsOn: DEPS_E, expectedSources: ["ai_generation", "manual_edit", "module"], description: "KPIs par variable ADVERTIS." },
];

// ---------------------------------------------------------------------------
// Pillar R section definitions (7)
// ---------------------------------------------------------------------------

const PILLAR_R_DEFINITIONS: VariableDefinition[] = [
  { key: "R.microSwots", label: "Micro-SWOTs (Pilier R)", category: "pillar", pillarType: "R", pillarSection: "microSwots", dependsOn: DEPS_R, expectedSources: ["ai_generation"], description: "SWOT par variable A-E." },
  { key: "R.globalSwot", label: "SWOT Global (Pilier R)", category: "pillar", pillarType: "R", pillarSection: "globalSwot", dependsOn: DEPS_R, expectedSources: ["ai_generation"], description: "SWOT consolidé toutes variables." },
  { key: "R.riskScore", label: "Risk Score (Pilier R)", category: "pillar", pillarType: "R", pillarSection: "riskScore", dependsOn: DEPS_R, expectedSources: ["ai_generation", "score_engine"], description: "Score de risque 0-100." },
  { key: "R.riskScoreJustification", label: "Justification Risk Score (Pilier R)", category: "pillar", pillarType: "R", pillarSection: "riskScoreJustification", dependsOn: DEPS_R, expectedSources: ["ai_generation"], description: "Justification textuelle du score de risque." },
  { key: "R.probabilityImpactMatrix", label: "Matrice Probabilité/Impact (Pilier R)", category: "pillar", pillarType: "R", pillarSection: "probabilityImpactMatrix", dependsOn: DEPS_R, expectedSources: ["ai_generation"], description: "Matrice d'évaluation des risques." },
  { key: "R.mitigationPriorities", label: "Priorités Mitigation (Pilier R)", category: "pillar", pillarType: "R", pillarSection: "mitigationPriorities", dependsOn: DEPS_R, expectedSources: ["ai_generation"], description: "Actions de mitigation priorisées." },
  { key: "R.summary", label: "Synthèse Risk (Pilier R)", category: "pillar", pillarType: "R", pillarSection: "summary", dependsOn: DEPS_R, expectedSources: ["ai_generation"], description: "Synthèse narrative de l'audit de risque." },
];

// ---------------------------------------------------------------------------
// Pillar T section definitions (9)
// ---------------------------------------------------------------------------

const PILLAR_T_DEFINITIONS: VariableDefinition[] = [
  { key: "T.triangulation", label: "Triangulation (Pilier T)", category: "pillar", pillarType: "T", pillarSection: "triangulation", dependsOn: DEPS_T, expectedSources: ["ai_generation"], description: "Croisement données internes, marché, client." },
  { key: "T.hypothesisValidation", label: "Validation Hypothèses (Pilier T)", category: "pillar", pillarType: "T", pillarSection: "hypothesisValidation", dependsOn: DEPS_T, expectedSources: ["ai_generation"], description: "Validation des hypothèses stratégiques." },
  { key: "T.marketReality", label: "Réalité Marché (Pilier T)", category: "pillar", pillarType: "T", pillarSection: "marketReality", dependsOn: DEPS_T, expectedSources: ["ai_generation"], description: "Tendances macro, signaux faibles, patterns." },
  { key: "T.tamSamSom", label: "TAM/SAM/SOM (Pilier T)", category: "pillar", pillarType: "T", pillarSection: "tamSamSom", dependsOn: DEPS_T, expectedSources: ["ai_generation"], description: "Estimation taille de marché." },
  { key: "T.competitiveBenchmark", label: "Benchmark Concurrentiel (Pilier T)", category: "pillar", pillarType: "T", pillarSection: "competitiveBenchmark", dependsOn: DEPS_T, expectedSources: ["ai_generation"], description: "Benchmark détaillé par concurrent." },
  { key: "T.brandMarketFitScore", label: "Brand-Market Fit Score (Pilier T)", category: "pillar", pillarType: "T", pillarSection: "brandMarketFitScore", dependsOn: DEPS_T, expectedSources: ["ai_generation", "score_engine"], description: "Score Brand-Market Fit 0-100." },
  { key: "T.brandMarketFitJustification", label: "Justification BMF (Pilier T)", category: "pillar", pillarType: "T", pillarSection: "brandMarketFitJustification", dependsOn: DEPS_T, expectedSources: ["ai_generation"], description: "Justification textuelle du score BMF." },
  { key: "T.strategicRecommendations", label: "Recommandations (Pilier T)", category: "pillar", pillarType: "T", pillarSection: "strategicRecommendations", dependsOn: DEPS_T, expectedSources: ["ai_generation"], description: "Recommandations stratégiques issues du Track." },
  { key: "T.summary", label: "Synthèse Track (Pilier T)", category: "pillar", pillarType: "T", pillarSection: "summary", dependsOn: DEPS_T, expectedSources: ["ai_generation"], description: "Synthèse narrative de l'audit Track." },
];

// ---------------------------------------------------------------------------
// Pillar I section definitions (22)
// ---------------------------------------------------------------------------

const PILLAR_I_DEFINITIONS: VariableDefinition[] = [
  { key: "I.brandIdentity", label: "Brand Identity (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "brandIdentity", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Identité de marque consolidée pour implémentation." },
  { key: "I.positioning", label: "Positionnement (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "positioning", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Positionnement opérationnel avec personas et concurrents." },
  { key: "I.valueArchitecture", label: "Architecture Valeur (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "valueArchitecture", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Product ladder, proposition de valeur, unit economics." },
  { key: "I.engagementStrategy", label: "Stratégie Engagement (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "engagementStrategy", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Touchpoints, rituels, AARRR, KPIs opérationnels." },
  { key: "I.riskSynthesis", label: "Synthèse Risques (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "riskSynthesis", dependsOn: DEPS_I, expectedSources: ["ai_generation"], description: "Consolidation des risques pour l'implémentation." },
  { key: "I.marketValidation", label: "Validation Marché (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "marketValidation", dependsOn: DEPS_I, expectedSources: ["ai_generation"], description: "Consolidation TAM/SAM/SOM et recommandations." },
  { key: "I.strategicRoadmap", label: "Roadmap Stratégique (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "strategicRoadmap", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Sprint 90 jours, priorités an 1, vision an 3." },
  { key: "I.campaigns", label: "Campagnes (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "campaigns", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Calendrier annuel, templates, plan d'activation." },
  { key: "I.budgetAllocation", label: "Budget (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "budgetAllocation", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Allocation budgétaire par poste et phase." },
  { key: "I.teamStructure", label: "Équipe (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "teamStructure", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Équipe actuelle, recrutements, partenaires." },
  { key: "I.launchPlan", label: "Plan de Lancement (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "launchPlan", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Phases de lancement et milestones." },
  { key: "I.operationalPlaybook", label: "Playbook Opérationnel (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "operationalPlaybook", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Rythmes quotidien/hebdo/mensuel, escalation, outils." },
  { key: "I.brandPlatform", label: "Plateforme de Marque (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "brandPlatform", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Purpose, vision, mission, values, personality, territory." },
  { key: "I.copyStrategy", label: "Copy Strategy (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "copyStrategy", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Promesse, RTB, bénéfice consommateur, ton, contrainte." },
  { key: "I.bigIdea", label: "Big Idea (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "bigIdea", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Concept central déclinable avec mécanisme." },
  { key: "I.activationDispositif", label: "Dispositif d'Activation (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "activationDispositif", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Axes owned/earned/paid/shared." },
  { key: "I.governance", label: "Gouvernance (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "governance", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Comités, processus validation, délais standards." },
  { key: "I.workstreams", label: "Workstreams (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "workstreams", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Organisation par flux de travail." },
  { key: "I.brandArchitecture", label: "Architecture de Marque (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "brandArchitecture", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Modèle, hiérarchie, règles de coexistence." },
  { key: "I.guidingPrinciples", label: "Principes Directeurs (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "guidingPrinciples", dependsOn: DEPS_I, expectedSources: ["ai_generation", "manual_edit"], description: "Do's, don'ts, principes communication, critères cohérence." },
  { key: "I.coherenceScore", label: "Score Cohérence (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "coherenceScore", dependsOn: DEPS_I, expectedSources: ["ai_generation", "score_engine"], description: "Score de cohérence globale 0-100." },
  { key: "I.executiveSummary", label: "Executive Summary (Pilier I)", category: "pillar", pillarType: "I", pillarSection: "executiveSummary", dependsOn: DEPS_I, expectedSources: ["ai_generation"], description: "Résumé exécutif de l'implémentation." },
];

// ---------------------------------------------------------------------------
// Pillar S section definitions (11)
// ---------------------------------------------------------------------------

const PILLAR_S_DEFINITIONS: VariableDefinition[] = [
  { key: "S.syntheseExecutive", label: "Synthèse Executive (Pilier S)", category: "pillar", pillarType: "S", pillarSection: "syntheseExecutive", dependsOn: DEPS_S, expectedSources: ["ai_generation"], description: "Résumé exécutif de la stratégie complète." },
  { key: "S.visionStrategique", label: "Vision Stratégique (Pilier S)", category: "pillar", pillarType: "S", pillarSection: "visionStrategique", dependsOn: DEPS_S, expectedSources: ["ai_generation"], description: "Vision stratégique consolidée." },
  { key: "S.coherencePiliers", label: "Cohérence Piliers (Pilier S)", category: "pillar", pillarType: "S", pillarSection: "coherencePiliers", dependsOn: DEPS_S, expectedSources: ["ai_generation"], description: "Articulation et contribution de chaque pilier." },
  { key: "S.facteursClesSucces", label: "Facteurs Clés Succès (Pilier S)", category: "pillar", pillarType: "S", pillarSection: "facteursClesSucces", dependsOn: DEPS_S, expectedSources: ["ai_generation"], description: "Facteurs clés de succès identifiés." },
  { key: "S.recommandationsPrioritaires", label: "Recommandations (Pilier S)", category: "pillar", pillarType: "S", pillarSection: "recommandationsPrioritaires", dependsOn: DEPS_S, expectedSources: ["ai_generation"], description: "Recommandations priorisées avec impact et délai." },
  { key: "S.scoreCoherence", label: "Score Cohérence (Pilier S)", category: "pillar", pillarType: "S", pillarSection: "scoreCoherence", dependsOn: DEPS_S, expectedSources: ["ai_generation", "score_engine"], description: "Score de cohérence dans la synthèse." },
  { key: "S.axesStrategiques", label: "Axes Stratégiques (Pilier S)", category: "pillar", pillarType: "S", pillarSection: "axesStrategiques", dependsOn: DEPS_S, expectedSources: ["ai_generation"], description: "Axes stratégiques avec piliers liés et KPIs." },
  { key: "S.sprint90Recap", label: "Sprint 90 Recap (Pilier S)", category: "pillar", pillarType: "S", pillarSection: "sprint90Recap", dependsOn: DEPS_S, expectedSources: ["ai_generation"], description: "Récapitulatif du sprint 90 jours." },
  { key: "S.campaignsSummary", label: "Résumé Campagnes (Pilier S)", category: "pillar", pillarType: "S", pillarSection: "campaignsSummary", dependsOn: DEPS_S, expectedSources: ["ai_generation"], description: "Résumé des campagnes avec budget total." },
  { key: "S.activationSummary", label: "Résumé Activation (Pilier S)", category: "pillar", pillarType: "S", pillarSection: "activationSummary", dependsOn: DEPS_S, expectedSources: ["ai_generation"], description: "Résumé du dispositif d'activation." },
  { key: "S.kpiDashboard", label: "KPI Dashboard (Pilier S)", category: "pillar", pillarType: "S", pillarSection: "kpiDashboard", dependsOn: DEPS_S, expectedSources: ["ai_generation"], description: "Tableau de bord KPI par pilier." },
];

// ---------------------------------------------------------------------------
// Score definitions (3)
// ---------------------------------------------------------------------------

const SCORE_DEFINITIONS: VariableDefinition[] = [
  {
    key: "score.coherence",
    label: "Score de Cohérence",
    category: "score",
    dependsOn: [...SECTIONS_A, ...SECTIONS_D, ...SECTIONS_V, ...SECTIONS_E],
    expectedSources: ["score_engine"],
    description: "Score de cohérence globale A-E (0-100).",
  },
  {
    key: "score.risk",
    label: "Score de Risque",
    category: "score",
    dependsOn: ["R.riskScore"],
    expectedSources: ["score_engine"],
    description: "Score de risque global extrait du pilier R (0-100).",
  },
  {
    key: "score.bmf",
    label: "Score Brand-Market Fit",
    category: "score",
    dependsOn: ["T.brandMarketFitScore"],
    expectedSources: ["score_engine"],
    description: "Score Brand-Market Fit extrait du pilier T (0-100).",
  },
];

// ---------------------------------------------------------------------------
// ARTEMIS pillar extension definitions (11)
// ---------------------------------------------------------------------------
// Stored in pillar content JSON but produced by framework modules.

const PILLAR_A_ARTEMIS_DEFINITIONS: VariableDefinition[] = [
  { key: "A.prophecy", label: "Prophecy (Pilier A)", category: "pillar", pillarType: "A", pillarSection: "prophecy", dependsOn: DEPS_A_ARTEMIS, expectedSources: ["module"], description: "Vision du monde transformé quand le mouvement gagne." },
  { key: "A.enemy", label: "Ennemi Existentiel (Pilier A)", category: "pillar", pillarType: "A", pillarSection: "enemy", dependsOn: DEPS_A_ARTEMIS, expectedSources: ["module"], description: "Force à combattre : manifestations, enjeu, comment vaincre." },
  { key: "A.doctrine", label: "Doctrine (Pilier A)", category: "pillar", pillarType: "A", pillarSection: "doctrine", dependsOn: DEPS_A_ARTEMIS, expectedSources: ["module"], description: "Dogmes, principes et pratiques du mouvement." },
  { key: "A.livingMythology", label: "Mythologie Vivante (Pilier A)", category: "pillar", pillarType: "A", pillarSection: "livingMythology", dependsOn: DEPS_A_ARTEMIS, expectedSources: ["module"], description: "Canon extensible : mythe fondateur, chapitres, règles d'extension." },
];

const PILLAR_D_ARTEMIS_DEFINITIONS: VariableDefinition[] = [
  { key: "D.sacredObjects", label: "Objets Sacrés (Pilier D)", category: "pillar", pillarType: "D", pillarSection: "sacredObjects", dependsOn: DEPS_D_ARTEMIS, expectedSources: ["module"], description: "Artefacts symboliques distincts du catalogue." },
  { key: "D.proofPoints", label: "Proof Points (Pilier D)", category: "pillar", pillarType: "D", pillarSection: "proofPoints", dependsOn: DEPS_D_ARTEMIS, expectedSources: ["module"], description: "Preuves quantifiées, certifications, témoignages." },
  { key: "D.symboles", label: "Symboles (Pilier D)", category: "pillar", pillarType: "D", pillarSection: "symboles", dependsOn: DEPS_D_ARTEMIS, expectedSources: ["module"], description: "Symboles de marque avec significations et contextes d'usage." },
];

const PILLAR_E_ARTEMIS_DEFINITIONS: VariableDefinition[] = [
  { key: "E.sacredCalendar", label: "Calendrier Sacré (Pilier E)", category: "pillar", pillarType: "E", pillarSection: "sacredCalendar", dependsOn: DEPS_E_ARTEMIS, expectedSources: ["module"], description: "Moments propriétaires de la marque." },
  { key: "E.commandments", label: "Commandements (Pilier E)", category: "pillar", pillarType: "E", pillarSection: "commandments", dependsOn: DEPS_E_ARTEMIS, expectedSources: ["module"], description: "10 règles structurées de la communauté." },
  { key: "E.ritesDePassage", label: "Rites de Passage (Pilier E)", category: "pillar", pillarType: "E", pillarSection: "ritesDePassage", dependsOn: DEPS_E_ARTEMIS, expectedSources: ["module"], description: "5 stades avec rituel d'entrée, symboles de statut, récompenses." },
  { key: "E.sacraments", label: "Sacrements (Pilier E)", category: "pillar", pillarType: "E", pillarSection: "sacraments", dependsOn: DEPS_E_ARTEMIS, expectedSources: ["module"], description: "AARRR reformulé en rituels : Trigger → Action → Reward." },
];

// ---------------------------------------------------------------------------
// Framework output definitions (73)
// ---------------------------------------------------------------------------
// Stored in FrameworkOutput records, produced by ARTEMIS framework modules.

// FW-20 Movement Architecture (5)
const FW_MA_DEFINITIONS: VariableDefinition[] = [
  { key: "MA.prophecy", label: "Prophecy (FW-20)", category: "framework", pillarType: "MA", pillarSection: "prophecy", dependsOn: DEPS_MA, expectedSources: ["module"], description: "Vision du monde transformé quand le mouvement gagne." },
  { key: "MA.existentialEnemy", label: "Ennemi Existentiel (FW-20)", category: "framework", pillarType: "MA", pillarSection: "existentialEnemy", dependsOn: DEPS_MA, expectedSources: ["module"], description: "Force à combattre : manifestations et dimension morale." },
  { key: "MA.doctrine", label: "Doctrine (FW-20)", category: "framework", pillarType: "MA", pillarSection: "doctrine", dependsOn: DEPS_MA, expectedSources: ["module"], description: "Dogmes contre-intuitifs, principes, pratiques du mouvement." },
  { key: "MA.sacredArtifacts", label: "Artefacts Sacrés (FW-20)", category: "framework", pillarType: "MA", pillarSection: "sacredArtifacts", dependsOn: DEPS_MA, expectedSources: ["module"], description: "Objets symboliques avec stade superfan et signal social." },
  { key: "MA.livingMythology", label: "Mythologie Vivante (FW-20)", category: "framework", pillarType: "MA", pillarSection: "livingMythology", dependsOn: DEPS_MA, expectedSources: ["module"], description: "Canon extensible avec règles de contribution et capture." },
];

// FW-05 Grammar Systems (6)
const FW_GS_DEFINITIONS: VariableDefinition[] = [
  { key: "GS.conceptualGrammar", label: "Grammaire Conceptuelle (FW-05)", category: "framework", pillarType: "GS", pillarSection: "conceptualGrammar", dependsOn: DEPS_GS, expectedSources: ["module"], description: "Symboles conceptuels et matrice de proximité." },
  { key: "GS.iconographicGrammar", label: "Grammaire Iconographique (FW-05)", category: "framework", pillarType: "GS", pillarSection: "iconographicGrammar", dependsOn: DEPS_GS, expectedSources: ["module"], description: "Textures, patterns, couleurs, matériaux autorisés." },
  { key: "GS.transconceptGrammar", label: "Grammaire Transconcept (FW-05)", category: "framework", pillarType: "GS", pillarSection: "transconceptGrammar", dependsOn: DEPS_GS, expectedSources: ["module"], description: "Mappings inter-sensoriels et règles de traduction." },
  { key: "GS.tripleAncrage", label: "Triple Ancrage C×F×P (FW-05)", category: "framework", pillarType: "GS", pillarSection: "tripleAncrage", dependsOn: DEPS_GS, expectedSources: ["module"], description: "Scores Cognitif × Fonctionnel × Psycho-social par touchpoint." },
  { key: "GS.vocabularyAuthorized", label: "Vocabulaire Autorisé (FW-05)", category: "framework", pillarType: "GS", pillarSection: "vocabularyAuthorized", dependsOn: DEPS_GS, expectedSources: ["module"], description: "Termes approuvés pour la communication de marque." },
  { key: "GS.vocabularyForbidden", label: "Vocabulaire Interdit (FW-05)", category: "framework", pillarType: "GS", pillarSection: "vocabularyForbidden", dependsOn: DEPS_GS, expectedSources: ["module"], description: "Termes interdits dans la communication de marque." },
];

// FW-03 Parametric Budget (3)
const FW_B_DEFINITIONS: VariableDefinition[] = [
  { key: "B.budgetVentile", label: "Budget Ventilé (FW-03)", category: "framework", pillarType: "B", pillarSection: "budgetVentile", dependsOn: DEPS_FW_B, expectedSources: ["module"], description: "Budget décomposé par poste selon formule paramétrique." },
  { key: "B.margeNette", label: "Marge Nette Budget (FW-03)", category: "framework", pillarType: "B", pillarSection: "margeNette", dependsOn: DEPS_FW_B, expectedSources: ["module"], description: "Marge nette après allocation budgétaire." },
  { key: "B.viabilite", label: "Viabilité (FW-03)", category: "framework", pillarType: "B", pillarSection: "viabilite", dependsOn: DEPS_FW_B, expectedSources: ["module"], description: "Score de viabilité budgétaire." },
];

// FW-11 Experience Architecture (5)
const FW_XA_DEFINITIONS: VariableDefinition[] = [
  { key: "XA.transitionMap", label: "Carte des Transitions (FW-11)", category: "framework", pillarType: "XA", pillarSection: "transitionMap", dependsOn: DEPS_XA, expectedSources: ["module"], description: "5 transitions AUDIENCE→EVANGELIST avec triggers et expériences." },
  { key: "XA.emotionalArc", label: "Arc Émotionnel (FW-11)", category: "framework", pillarType: "XA", pillarSection: "emotionalArc", dependsOn: DEPS_XA, expectedSources: ["module"], description: "Trajectoire émotionnelle par stade superfan." },
  { key: "XA.momentsDeTruth", label: "Moments de Vérité (FW-11)", category: "framework", pillarType: "XA", pillarSection: "momentsDeTruth", dependsOn: DEPS_XA, expectedSources: ["module"], description: "Moments clés où l'expérience fait ou défait la conversion." },
  { key: "XA.frictionMap", label: "Carte des Frictions (FW-11)", category: "framework", pillarType: "XA", pillarSection: "frictionMap", dependsOn: DEPS_XA, expectedSources: ["module"], description: "Points de friction par transition avec solutions." },
  { key: "XA.brandCoherenceScore", label: "Score Cohérence Marque (FW-11)", category: "framework", pillarType: "XA", pillarSection: "brandCoherenceScore", dependsOn: DEPS_XA, expectedSources: ["module"], description: "Score de cohérence de l'expérience de marque 0-100." },
];

// FW-12 Narrative Engineering (4)
const FW_XB_DEFINITIONS: VariableDefinition[] = [
  { key: "XB.narrativeArc", label: "Arc Narratif (FW-12)", category: "framework", pillarType: "XB", pillarSection: "narrativeArc", dependsOn: DEPS_XB, expectedSources: ["module"], description: "5 arcs narratifs par stade superfan." },
  { key: "XB.sacredTexts", label: "Textes Sacrés (FW-12)", category: "framework", pillarType: "XB", pillarSection: "sacredTexts", dependsOn: DEPS_XB, expectedSources: ["module"], description: "Textes canoniques de la marque." },
  { key: "XB.vocabularyByStage", label: "Vocabulaire par Stade (FW-12)", category: "framework", pillarType: "XB", pillarSection: "vocabularyByStage", dependsOn: DEPS_XB, expectedSources: ["module"], description: "Registre lexical adapté par stade superfan." },
  { key: "XB.storyBank", label: "Banque d'Histoires (FW-12)", category: "framework", pillarType: "XB", pillarSection: "storyBank", dependsOn: DEPS_XB, expectedSources: ["module"], description: "Bibliothèque d'histoires prêtes à l'emploi." },
];

// FW-04 Narrative Immersive (6)
const FW_NI_DEFINITIONS: VariableDefinition[] = [
  { key: "NI.northStar", label: "North Star (FW-04)", category: "framework", pillarType: "NI", pillarSection: "northStar", dependsOn: DEPS_NI, expectedSources: ["module"], description: "6 mots-clés ADN + charte de cohérence multimodale." },
  { key: "NI.architectureNarrative", label: "Architecture Narrative (FW-04)", category: "framework", pillarType: "NI", pillarSection: "architectureNarrative", dependsOn: DEPS_NI, expectedSources: ["module"], description: "Mythe fondateur + système de factions." },
  { key: "NI.spatialMap", label: "Carte Spatiale (FW-04)", category: "framework", pillarType: "NI", pillarSection: "spatialMap", dependsOn: DEPS_NI, expectedSources: ["module"], description: "Zones narratives avec flux et transitions." },
  { key: "NI.questSystem", label: "Système de Quêtes (FW-04)", category: "framework", pillarType: "NI", pillarSection: "questSystem", dependsOn: DEPS_NI, expectedSources: ["module"], description: "Quêtes principales, secondaires et cachées." },
  { key: "NI.npcSystem", label: "Système NPC (FW-04)", category: "framework", pillarType: "NI", pillarSection: "npcSystem", dependsOn: DEPS_NI, expectedSources: ["module"], description: "Personnages non-joueurs avec scripts et réactions." },
  { key: "NI.diegeticSponsoring", label: "Sponsoring Diégétique (FW-04)", category: "framework", pillarType: "NI", pillarSection: "diegeticSponsoring", dependsOn: DEPS_NI, expectedSources: ["module"], description: "Intégration narrative des sponsors dans l'univers." },
];

// FW-13 Value Exchange Design (6)
const FW_XC_DEFINITIONS: VariableDefinition[] = [
  { key: "XC.tierSegmentMap", label: "Carte Tiers×Segments (FW-13)", category: "framework", pillarType: "XC", pillarSection: "tierSegmentMap", dependsOn: DEPS_XC, expectedSources: ["module"], description: "Mapping tiers produit × segments superfan." },
  { key: "XC.transactionRituals", label: "Rituels de Transaction (FW-13)", category: "framework", pillarType: "XC", pillarSection: "transactionRituals", dependsOn: DEPS_XC, expectedSources: ["module"], description: "Transactions reformulées en rituels d'appartenance." },
  { key: "XC.belongingSignals", label: "Signaux d'Appartenance (FW-13)", category: "framework", pillarType: "XC", pillarSection: "belongingSignals", dependsOn: DEPS_XC, expectedSources: ["module"], description: "Marqueurs d'identité par stade superfan." },
  { key: "XC.exclusivityGradient", label: "Gradient d'Exclusivité (FW-13)", category: "framework", pillarType: "XC", pillarSection: "exclusivityGradient", dependsOn: DEPS_XC, expectedSources: ["module"], description: "Niveaux d'accès exclusif par stade." },
  { key: "XC.reciprocityMechanics", label: "Mécaniques de Réciprocité (FW-13)", category: "framework", pillarType: "XC", pillarSection: "reciprocityMechanics", dependsOn: DEPS_XC, expectedSources: ["module"], description: "Systèmes d'échange de valeur réciproque." },
  { key: "XC.monetizationMap", label: "Carte de Monétisation (FW-13)", category: "framework", pillarType: "XC", pillarSection: "monetizationMap", dependsOn: DEPS_XC, expectedSources: ["module"], description: "Stratégie de monétisation par segment et canal." },
];

// FW-21 Value Capture Engine (5)
const FW_VC_DEFINITIONS: VariableDefinition[] = [
  { key: "VC.revenueModel", label: "Modèle de Revenus (FW-21)", category: "framework", pillarType: "VC", pillarSection: "revenueModel", dependsOn: DEPS_VC, expectedSources: ["module"], description: "Architecture des flux de revenus." },
  { key: "VC.pricingMechanics", label: "Mécaniques de Pricing (FW-21)", category: "framework", pillarType: "VC", pillarSection: "pricingMechanics", dependsOn: DEPS_VC, expectedSources: ["module"], description: "Stratégies de tarification par segment." },
  { key: "VC.revenueScenarios", label: "Scénarios de Revenus (FW-21)", category: "framework", pillarType: "VC", pillarSection: "revenueScenarios", dependsOn: DEPS_VC, expectedSources: ["module"], description: "Projections pessimiste/base/optimiste." },
  { key: "VC.communityMonetization", label: "Monétisation Communautaire (FW-21)", category: "framework", pillarType: "VC", pillarSection: "communityMonetization", dependsOn: DEPS_VC, expectedSources: ["module"], description: "Revenus issus de la communauté superfan." },
  { key: "VC.revenueMixTarget", label: "Mix Revenus Cible (FW-21)", category: "framework", pillarType: "VC", pillarSection: "revenueMixTarget", dependsOn: DEPS_VC, expectedSources: ["module"], description: "Répartition cible des sources de revenus." },
];

// FW-24 Alliance Architecture (5)
const FW_AA_DEFINITIONS: VariableDefinition[] = [
  { key: "AA.partnerTaxonomy", label: "Taxonomie Partenaires (FW-24)", category: "framework", pillarType: "AA", pillarSection: "partnerTaxonomy", dependsOn: DEPS_AA, expectedSources: ["module"], description: "Classification des partenaires par niveau d'intégration." },
  { key: "AA.partnerPackages", label: "Packages Partenaires (FW-24)", category: "framework", pillarType: "AA", pillarSection: "partnerPackages", dependsOn: DEPS_AA, expectedSources: ["module"], description: "Offres de partenariat structurées par niveau." },
  { key: "AA.negotiationProtocol", label: "Protocole de Négociation (FW-24)", category: "framework", pillarType: "AA", pillarSection: "negotiationProtocol", dependsOn: DEPS_AA, expectedSources: ["module"], description: "Processus de négociation et critères d'évaluation." },
  { key: "AA.narrativeIntegration", label: "Intégration Narrative (FW-24)", category: "framework", pillarType: "AA", pillarSection: "narrativeIntegration", dependsOn: DEPS_AA, expectedSources: ["module"], description: "Comment les partenaires s'intègrent dans l'univers narratif." },
  { key: "AA.mutualValueMatrix", label: "Matrice Valeur Mutuelle (FW-24)", category: "framework", pillarType: "AA", pillarSection: "mutualValueMatrix", dependsOn: DEPS_AA, expectedSources: ["module"], description: "Évaluation de la valeur échangée avec chaque partenaire." },
];

// FW-18 Internal Alignment (4)
const FW_IA_DEFINITIONS: VariableDefinition[] = [
  { key: "IA.internalization", label: "Internalisation (FW-18)", category: "framework", pillarType: "IA", pillarSection: "internalization", dependsOn: DEPS_IA, expectedSources: ["module"], description: "Valeurs en action : comment l'équipe vit la marque." },
  { key: "IA.internalRituals", label: "Rituels Internes (FW-18)", category: "framework", pillarType: "IA", pillarSection: "internalRituals", dependsOn: DEPS_IA, expectedSources: ["module"], description: "Rituels d'équipe alignés avec l'identité de marque." },
  { key: "IA.clergyMapping", label: "Cartographie Clergé (FW-18)", category: "framework", pillarType: "IA", pillarSection: "clergyMapping", dependsOn: DEPS_IA, expectedSources: ["module"], description: "Mapping des rôles internes au système communautaire." },
  { key: "IA.brandCultureFit", label: "Brand Culture Fit (FW-18)", category: "framework", pillarType: "IA", pillarSection: "brandCultureFit", dependsOn: DEPS_IA, expectedSources: ["module"], description: "Score d'adéquation culture interne / marque." },
];

// FW-22 Creative Methodology (2)
const FW_CM_DEFINITIONS: VariableDefinition[] = [
  { key: "CM.methodRegistry", label: "Registre Méthodes (FW-22)", category: "framework", pillarType: "CM", pillarSection: "methodRegistry", dependsOn: DEPS_CM, expectedSources: ["module"], description: "Catalogue des méthodes créatives disponibles." },
  { key: "CM.methodToolMapping", label: "Mapping Méthodes→Outils (FW-22)", category: "framework", pillarType: "CM", pillarSection: "methodToolMapping", dependsOn: DEPS_CM, expectedSources: ["module"], description: "Lien entre méthodes créatives et outils GLORY." },
];

// FW-23 Execution Sequencing (4)
const FW_ES_DEFINITIONS: VariableDefinition[] = [
  { key: "ES.activeSequence", label: "Séquence Active (FW-23)", category: "framework", pillarType: "ES", pillarSection: "activeSequence", dependsOn: DEPS_ES, expectedSources: ["module"], description: "Template de séquençage actuellement actif." },
  { key: "ES.timeline", label: "Timeline (FW-23)", category: "framework", pillarType: "ES", pillarSection: "timeline", dependsOn: DEPS_ES, expectedSources: ["module"], description: "Ligne de temps avec phases et jalons." },
  { key: "ES.goNoGoGates", label: "Gates Go/No-Go (FW-23)", category: "framework", pillarType: "ES", pillarSection: "goNoGoGates", dependsOn: DEPS_ES, expectedSources: ["module"], description: "Points de décision avec critères de passage." },
  { key: "ES.resourceAllocation", label: "Allocation Ressources (FW-23)", category: "framework", pillarType: "ES", pillarSection: "resourceAllocation", dependsOn: DEPS_ES, expectedSources: ["module"], description: "Répartition des ressources par phase." },
];

// FW-19 Growth Mechanics (5)
const FW_GM_DEFINITIONS: VariableDefinition[] = [
  { key: "GM.growthEngine", label: "Moteur de Croissance (FW-19)", category: "framework", pillarType: "GM", pillarSection: "growthEngine", dependsOn: DEPS_GM, expectedSources: ["module"], description: "Type de croissance (viral/sticky/paid) avec coefficients." },
  { key: "GM.flywheel", label: "Flywheel (FW-19)", category: "framework", pillarType: "GM", pillarSection: "flywheel", dependsOn: DEPS_GM, expectedSources: ["module"], description: "Boucle de croissance auto-alimentée." },
  { key: "GM.scalingBreakpoints", label: "Points de Rupture (FW-19)", category: "framework", pillarType: "GM", pillarSection: "scalingBreakpoints", dependsOn: DEPS_GM, expectedSources: ["module"], description: "Seuils où le modèle de croissance change." },
  { key: "GM.expansionMatrix", label: "Matrice d'Expansion (FW-19)", category: "framework", pillarType: "GM", pillarSection: "expansionMatrix", dependsOn: DEPS_GM, expectedSources: ["module"], description: "Matrice Ansoff : produits × marchés existants/nouveaux." },
  { key: "GM.communityMonetization", label: "Monétisation Communauté (FW-19)", category: "framework", pillarType: "GM", pillarSection: "communityMonetization", dependsOn: DEPS_GM, expectedSources: ["module"], description: "Modèles de revenus issus de la communauté." },
];

// FW-15 Cultural Expansion (3)
const FW_CE_DEFINITIONS: VariableDefinition[] = [
  { key: "CE.culturalTransposition", label: "Transposition Culturelle (FW-15)", category: "framework", pillarType: "CE", pillarSection: "culturalTransposition", dependsOn: DEPS_CE, expectedSources: ["module"], description: "Matrice universels/adaptables/locaux pour nouveaux marchés." },
  { key: "CE.localLegitimacy", label: "Légitimité Locale (FW-15)", category: "framework", pillarType: "CE", pillarSection: "localLegitimacy", dependsOn: DEPS_CE, expectedSources: ["module"], description: "Stratégie d'ancrage local par marché." },
  { key: "CE.federalism", label: "Fédéralisme (FW-15)", category: "framework", pillarType: "CE", pillarSection: "federalism", dependsOn: DEPS_CE, expectedSources: ["module"], description: "Gouvernance centralisée vs locale par marché." },
];

// FW-16 Brand Architecture (3)
const FW_BA_DEFINITIONS: VariableDefinition[] = [
  { key: "BA.architectureModel", label: "Modèle d'Architecture (FW-16)", category: "framework", pillarType: "BA", pillarSection: "architectureModel", dependsOn: DEPS_BA, expectedSources: ["module"], description: "Type d'architecture de marque et implications." },
  { key: "BA.inheritanceRules", label: "Règles d'Héritage (FW-16)", category: "framework", pillarType: "BA", pillarSection: "inheritanceRules", dependsOn: DEPS_BA, expectedSources: ["module"], description: "Règles d'héritage de variables parent→enfant." },
  { key: "BA.crossBrandCultIndex", label: "Cult Index Transversal (FW-16)", category: "framework", pillarType: "BA", pillarSection: "crossBrandCultIndex", dependsOn: DEPS_BA, expectedSources: ["module"], description: "Score Cult Index consolidé multi-marques." },
];

// FW-14 Brand Evolution (3)
const FW_BE_DEFINITIONS: VariableDefinition[] = [
  { key: "BE.identityCore", label: "Noyau Identitaire (FW-14)", category: "framework", pillarType: "BE", pillarSection: "identityCore", dependsOn: DEPS_BE, expectedSources: ["module"], description: "Éléments immuables vs mutables de l'identité." },
  { key: "BE.driftDetection", label: "Détection de Dérive (FW-14)", category: "framework", pillarType: "BE", pillarSection: "driftDetection", dependsOn: DEPS_BE, expectedSources: ["module"], description: "Indicateurs de dérive identitaire." },
  { key: "BE.lifecycleStage", label: "Stade de Cycle de Vie (FW-14)", category: "framework", pillarType: "BE", pillarSection: "lifecycleStage", dependsOn: DEPS_BE, expectedSources: ["module"], description: "Phase actuelle : LAUNCH→GROWTH→MATURITY→DECLINE→REVITALIZATION." },
];

// FW-17 Brand Defense (4)
const FW_BD_DEFINITIONS: VariableDefinition[] = [
  { key: "BD.threatMap", label: "Carte des Menaces (FW-17)", category: "framework", pillarType: "BD", pillarSection: "threatMap", dependsOn: DEPS_BD, expectedSources: ["module"], description: "Cartographie des menaces par type et sévérité." },
  { key: "BD.communityDefense", label: "Défense Communautaire (FW-17)", category: "framework", pillarType: "BD", pillarSection: "communityDefense", dependsOn: DEPS_BD, expectedSources: ["module"], description: "Capacité de la communauté à défendre la marque." },
  { key: "BD.crisisNarrative", label: "Narratif de Crise (FW-17)", category: "framework", pillarType: "BD", pillarSection: "crisisNarrative", dependsOn: DEPS_BD, expectedSources: ["module"], description: "Récits préparés pour situations de crise." },
  { key: "BD.enemyAsFuel", label: "Ennemi comme Carburant (FW-17)", category: "framework", pillarType: "BD", pillarSection: "enemyAsFuel", dependsOn: DEPS_BD, expectedSources: ["module"], description: "Transformer les attaques en énergie communautaire." },
];

// ---------------------------------------------------------------------------
// Combined definitions array — THE SINGLE SOURCE OF TRUTH
// ---------------------------------------------------------------------------

export const VARIABLE_DEFINITIONS: VariableDefinition[] = [
  ...INTERVIEW_DEFINITIONS,
  ...PILLAR_A_DEFINITIONS,
  ...PILLAR_D_DEFINITIONS,
  ...PILLAR_V_DEFINITIONS,
  ...PILLAR_E_DEFINITIONS,
  ...PILLAR_R_DEFINITIONS,
  ...PILLAR_T_DEFINITIONS,
  ...PILLAR_I_DEFINITIONS,
  ...PILLAR_S_DEFINITIONS,
  ...SCORE_DEFINITIONS,
  // ARTEMIS pillar extensions (11)
  ...PILLAR_A_ARTEMIS_DEFINITIONS,
  ...PILLAR_D_ARTEMIS_DEFINITIONS,
  ...PILLAR_E_ARTEMIS_DEFINITIONS,
  // ARTEMIS framework outputs (73)
  ...FW_MA_DEFINITIONS,
  ...FW_GS_DEFINITIONS,
  ...FW_B_DEFINITIONS,
  ...FW_XA_DEFINITIONS,
  ...FW_XB_DEFINITIONS,
  ...FW_NI_DEFINITIONS,
  ...FW_XC_DEFINITIONS,
  ...FW_VC_DEFINITIONS,
  ...FW_AA_DEFINITIONS,
  ...FW_IA_DEFINITIONS,
  ...FW_CM_DEFINITIONS,
  ...FW_ES_DEFINITIONS,
  ...FW_GM_DEFINITIONS,
  ...FW_CE_DEFINITIONS,
  ...FW_BA_DEFINITIONS,
  ...FW_BE_DEFINITIONS,
  ...FW_BD_DEFINITIONS,
];

/** All variable keys (187 total: 103 base + 11 ARTEMIS pillar + 73 framework) */
export const ALL_VARIABLE_KEYS: string[] = VARIABLE_DEFINITIONS.map((d) => d.key);

// ---------------------------------------------------------------------------
// Lookup maps (lazy-initialized singletons)
// ---------------------------------------------------------------------------

let _definitionMap: Map<string, VariableDefinition> | null = null;
let _dependentsMap: Map<string, string[]> | null = null;
let _topologicalOrder: string[] | null = null;

function getDefinitionMap(): Map<string, VariableDefinition> {
  if (!_definitionMap) {
    _definitionMap = new Map(VARIABLE_DEFINITIONS.map((d) => [d.key, d]));
  }
  return _definitionMap;
}

/**
 * Build the reverse dependency map: for each key, which keys depend on it.
 * This inverts the `dependsOn` arrays.
 */
function getDependentsMap(): Map<string, string[]> {
  if (!_dependentsMap) {
    _dependentsMap = new Map<string, string[]>();
    // Initialize all keys with empty arrays
    for (const key of ALL_VARIABLE_KEYS) {
      _dependentsMap.set(key, []);
    }
    // Populate reverse edges
    for (const def of VARIABLE_DEFINITIONS) {
      for (const depKey of def.dependsOn) {
        const list = _dependentsMap.get(depKey);
        if (list) {
          list.push(def.key);
        }
        // If depKey is not in the registry (shouldn't happen), skip silently
      }
    }
  }
  return _dependentsMap;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up a variable definition by key.
 * @returns The definition, or undefined if key is not in the registry.
 */
export function getVariableDefinition(key: string): VariableDefinition | undefined {
  return getDefinitionMap().get(key);
}

/**
 * Get all variable definitions for a given pillar type.
 * Includes both interview and pillar-section variables.
 */
export function getVariablesForPillar(pillarType: string): VariableDefinition[] {
  return VARIABLE_DEFINITIONS.filter((d) => d.pillarType === pillarType);
}

/**
 * Get all variable definitions for a given category.
 */
export function getVariablesByCategory(category: VariableCategory): VariableDefinition[] {
  return VARIABLE_DEFINITIONS.filter((d) => d.category === category);
}

/**
 * Get only pillar-section definitions for a pillar type (excludes interview vars).
 */
export function getPillarSectionDefinitions(pillarType: string): VariableDefinition[] {
  return VARIABLE_DEFINITIONS.filter(
    (d) => d.category === "pillar" && d.pillarType === pillarType,
  );
}

/**
 * Get the upstream dependencies of a key (what this key needs to be computed).
 * Returns the keys from the definition's `dependsOn` array.
 */
export function getDependencies(key: string): string[] {
  const def = getDefinitionMap().get(key);
  return def ? [...def.dependsOn] : [];
}

/**
 * Get the downstream dependents of a key (what depends on this key).
 * Computed by inverting the dependency graph.
 */
export function getDependents(key: string): string[] {
  const map = getDependentsMap();
  return map.get(key) ?? [];
}

/**
 * Get all keys in a pillar's section namespace.
 * E.g., getSectionKeysForPillar("A") → ["A.identite", "A.herosJourney", ...]
 */
export function getSectionKeysForPillar(pillarType: string): string[] {
  switch (pillarType) {
    case "A": return [...SECTIONS_A, ...SECTIONS_A_ARTEMIS];
    case "D": return [...SECTIONS_D, ...SECTIONS_D_ARTEMIS];
    case "V": return [...SECTIONS_V];
    case "E": return [...SECTIONS_E, ...SECTIONS_E_ARTEMIS];
    case "R": return [...SECTIONS_R];
    case "T": return [...SECTIONS_T];
    case "I": return [...SECTIONS_I];
    case "S": return [...SECTIONS_S];
    // Framework output prefixes
    case "MA": return [...SECTIONS_MA];
    case "GS": return [...SECTIONS_GS];
    case "B": return [...SECTIONS_B];
    case "XA": return [...SECTIONS_XA];
    case "XB": return [...SECTIONS_XB];
    case "NI": return [...SECTIONS_NI];
    case "XC": return [...SECTIONS_XC];
    case "VC": return [...SECTIONS_VC];
    case "AA": return [...SECTIONS_AA];
    case "IA": return [...SECTIONS_IA];
    case "CM": return [...SECTIONS_CM];
    case "ES": return [...SECTIONS_ES];
    case "GM": return [...SECTIONS_GM];
    case "CE": return [...SECTIONS_CE];
    case "BA": return [...SECTIONS_BA];
    case "BE": return [...SECTIONS_BE];
    case "BD": return [...SECTIONS_BD];
    default: return [];
  }
}

/**
 * Get all interview variable keys for a pillar type.
 * E.g., getInterviewKeysForPillar("A") → ["interview.A0", ..., "interview.A6"]
 */
export function getInterviewKeysForPillar(pillarType: string): string[] {
  switch (pillarType) {
    case "A": return [...INTERVIEW_A];
    case "D": return [...INTERVIEW_D];
    case "V": return [...INTERVIEW_V];
    case "E": return [...INTERVIEW_E];
    default: return [];
  }
}

/**
 * Returns all variable keys in topological order (Kahn's algorithm).
 * Sources (no dependencies) come first, downstream variables come last.
 * Useful for determining regeneration order.
 */
export function getTopologicalOrder(): string[] {
  if (_topologicalOrder) return [..._topologicalOrder];

  const defMap = getDefinitionMap();
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize
  for (const key of ALL_VARIABLE_KEYS) {
    inDegree.set(key, 0);
    adjacency.set(key, []);
  }

  // Build adjacency + in-degrees
  for (const def of VARIABLE_DEFINITIONS) {
    for (const dep of def.dependsOn) {
      // dep → def.key (dep must come before def.key)
      if (defMap.has(dep)) {
        adjacency.get(dep)!.push(def.key);
        inDegree.set(def.key, (inDegree.get(def.key) ?? 0) + 1);
      }
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const [key, deg] of inDegree) {
    if (deg === 0) queue.push(key);
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  // Sanity check — if result is shorter than ALL_VARIABLE_KEYS, there's a cycle
  if (result.length < ALL_VARIABLE_KEYS.length) {
    console.warn(
      `[VariableRegistry] Topological sort incomplete: ${result.length}/${ALL_VARIABLE_KEYS.length} — possible cycle in dependency graph.`,
    );
    // Add missing keys at end
    const inResult = new Set(result);
    for (const key of ALL_VARIABLE_KEYS) {
      if (!inResult.has(key)) result.push(key);
    }
  }

  _topologicalOrder = result;
  return [...result];
}

/**
 * Returns the full dependency map as a plain object (for API responses / debugging).
 * Format: { [key]: { dependsOn: string[], dependents: string[] } }
 */
export function getDependencyMap(): Record<string, { dependsOn: string[]; dependents: string[] }> {
  const depMap = getDependentsMap();
  const result: Record<string, { dependsOn: string[]; dependents: string[] }> = {};

  for (const def of VARIABLE_DEFINITIONS) {
    result[def.key] = {
      dependsOn: [...def.dependsOn],
      dependents: depMap.get(def.key) ?? [],
    };
  }

  return result;
}

/**
 * Validate that all dependsOn references point to valid keys in the registry.
 * Returns an array of error messages (empty = valid).
 * Should be called in tests, not at runtime.
 */
export function validateRegistry(): string[] {
  const errors: string[] = [];
  const keySet = new Set(ALL_VARIABLE_KEYS);

  for (const def of VARIABLE_DEFINITIONS) {
    for (const dep of def.dependsOn) {
      if (!keySet.has(dep)) {
        errors.push(`${def.key}: depends on unknown key "${dep}"`);
      }
    }
    // Check for self-dependency
    if (def.dependsOn.includes(def.key)) {
      errors.push(`${def.key}: depends on itself`);
    }
  }

  // Check for duplicate keys
  const seen = new Set<string>();
  for (const def of VARIABLE_DEFINITIONS) {
    if (seen.has(def.key)) {
      errors.push(`Duplicate key: "${def.key}"`);
    }
    seen.add(def.key);
  }

  return errors;
}
