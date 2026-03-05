// =============================================================================
// ARTEMIS Framework Registry
// =============================================================================
// Static registry of the 24 ARTEMIS frameworks with metadata:
// id, name, layer, inputs, outputs, dependencies, conditions, category.
//
// API: getFramework(), getFrameworksForLayer(), getFrameworkDependencies(),
//      getExecutionOrder(), getAllFrameworks()
// =============================================================================

import type {
  ArtemisLayer,
  FrameworkDescriptor,
  NodeType,
} from "./types/frameworks/framework-descriptor";

// ---------------------------------------------------------------------------
// The 24 Framework Descriptors
// ---------------------------------------------------------------------------

const FRAMEWORK_DESCRIPTORS: FrameworkDescriptor[] = [
  // ── COUCHE 0 — PHILOSOPHIE ──────────────────────────────────────────
  {
    id: "FW-01",
    name: "ADVE Cult Marketing",
    description:
      "Theoretical framework: cult marketing philosophy that informs all variables",
    layer: "PHILOSOPHY",
    category: "theoretical",
    inputVariables: [],
    outputVariables: [],
    dependsOnFrameworks: [],
    hasImplementation: false,
  },
  {
    id: "FW-20",
    name: "Movement Architecture",
    description:
      "Defines the civilizational project: prophecy, enemy, doctrine, artifacts, mythology",
    layer: "PHILOSOPHY",
    category: "hybrid",
    inputVariables: [
      "A.identite",
      "A.herosJourney",
      "A.valeurs",
      "D.positionnement",
    ],
    outputVariables: [
      "MA.prophecy",
      "MA.existentialEnemy",
      "MA.doctrine",
      "MA.sacredArtifacts",
      "MA.livingMythology",
    ],
    dependsOnFrameworks: ["FW-02"],
    hasImplementation: true,
  },

  // ── COUCHE 1 — IDENTITÉ ─────────────────────────────────────────────
  {
    id: "FW-02",
    name: "ADVERTIS Pipeline",
    description:
      "Core 8-pillar pipeline (A-D-V-E-R-T-I-S) producing the strategy foundation",
    layer: "IDENTITY",
    category: "hybrid",
    inputVariables: [
      "interview.A0", "interview.A1", "interview.A2", "interview.A3",
      "interview.A4", "interview.A5", "interview.A6",
      "interview.D1", "interview.D2", "interview.D3", "interview.D4",
      "interview.D5", "interview.D6", "interview.D7",
      "interview.V0", "interview.V1", "interview.V2", "interview.V3",
      "interview.V4", "interview.V5", "interview.V6", "interview.V7", "interview.V8",
      "interview.E1", "interview.E2", "interview.E3", "interview.E4",
      "interview.E5", "interview.E6",
    ],
    outputVariables: [
      "A.identite", "A.herosJourney", "A.ikigai", "A.valeurs",
      "A.hierarchieCommunautaire", "A.timelineNarrative",
      "D.personas", "D.paysageConcurrentiel", "D.promessesDeMarque",
      "D.positionnement", "D.tonDeVoix", "D.identiteVisuelle", "D.assetsLinguistiques",
      "V.catalogue", "V.productLadder", "V.valeurMarque", "V.valeurClient",
      "V.coutMarque", "V.coutClient", "V.unitEconomics", "V.budgetComm", "V.caVise",
      "E.touchpoints", "E.rituels", "E.principesCommunautaires",
      "E.gamification", "E.aarrr", "E.kpis",
    ],
    dependsOnFrameworks: [],
    hasImplementation: false, // Existing pipeline, not a new module
  },
  {
    id: "FW-05",
    name: "Grammar Systems",
    description:
      "Triple grammar (conceptual, iconographic, transconcept) + C×F×P validation",
    layer: "IDENTITY",
    category: "ai",
    inputVariables: [
      "A.identite",
      "A.valeurs",
      "A.doctrine",
      "MA.sacredArtifacts",
      "D.identiteVisuelle",
    ],
    outputVariables: [
      "GS.conceptualGrammar",
      "GS.iconographicGrammar",
      "GS.transconceptGrammar",
      "GS.tripleAncrage",
      "GS.vocabularyAuthorized",
      "GS.vocabularyForbidden",
    ],
    dependsOnFrameworks: ["FW-02", "FW-20"],
    maturityCondition: ["LAUNCH"],
    hasImplementation: true,
  },

  // ── COUCHE 2 — VALEUR ───────────────────────────────────────────────
  {
    id: "FW-03",
    name: "Parametric Budget",
    description:
      "Deterministic cost modeling: Budget = CA × α(sector) × β(maturity) × γ(environment)",
    layer: "VALUE",
    category: "compute",
    inputVariables: ["V.budgetComm", "V.caVise"],
    outputVariables: ["B.budgetVentile", "B.margeNette", "B.viabilite"],
    dependsOnFrameworks: ["FW-02"],
    hasImplementation: false, // Already exists: budget-formula.ts
  },
  {
    id: "FW-13",
    name: "Value Exchange Design",
    description:
      "Transaction as ritual: tier-segment mapping, belonging signals, exclusivity gradient",
    layer: "VALUE",
    category: "hybrid",
    inputVariables: [
      "V.productLadder",
      "V.catalogue",
      "V.valeurClient",
      "E.gamification",
      "XA.transitionMap",
      "XB.narrativeArc",
      "MA.sacredArtifacts",
    ],
    outputVariables: [
      "XC.tierSegmentMap",
      "XC.transactionRituals",
      "XC.belongingSignals",
      "XC.exclusivityGradient",
      "XC.reciprocityMechanics",
      "XC.monetizationMap",
    ],
    dependsOnFrameworks: ["FW-02", "FW-11", "FW-12", "FW-08", "FW-20"],
    hasImplementation: true,
  },
  {
    id: "FW-21",
    name: "Value Capture Engine",
    description:
      "Revenue modeling: revenue model, pricing mechanics, scenarios, community monetization",
    layer: "VALUE",
    category: "hybrid",
    inputVariables: [
      "V.productLadder",
      "V.unitEconomics",
      "V.caVise",
      "XC.tierSegmentMap",
      "XC.monetizationMap",
    ],
    outputVariables: [
      "VC.revenueModel",
      "VC.pricingMechanics",
      "VC.revenueScenarios",
      "VC.communityMonetization",
      "VC.revenueMixTarget",
    ],
    dependsOnFrameworks: ["FW-02", "FW-13", "FW-08"],
    hasImplementation: true,
  },
  {
    id: "FW-24",
    name: "Alliance Architecture",
    description:
      "Strategic B2B partnerships: taxonomy, packages, narrative integration, mutual value",
    layer: "VALUE",
    category: "ai",
    inputVariables: [
      "MA.prophecy",
      "MA.doctrine",
      "GS.transconceptGrammar",
      "VC.revenueModel",
    ],
    outputVariables: [
      "AA.partnerTaxonomy",
      "AA.partnerPackages",
      "AA.negotiationProtocol",
      "AA.narrativeIntegration",
      "AA.mutualValueMatrix",
    ],
    dependsOnFrameworks: ["FW-02", "FW-20", "FW-05", "FW-21"],
    hasImplementation: true,
  },

  // ── COUCHE 3 — EXPÉRIENCE ───────────────────────────────────────────
  {
    id: "FW-11",
    name: "Experience Architecture",
    description:
      "Conversion by superfan stage: 5 transitions with trigger, experience, emotional shift",
    layer: "EXPERIENCE",
    category: "hybrid",
    inputVariables: [
      "A.identite",
      "D.personas",
      "D.identiteVisuelle",
      "D.tonDeVoix",
      "E.touchpoints",
      "E.rituels",
      "MA.sacredArtifacts",
    ],
    outputVariables: [
      "XA.transitionMap",
      "XA.emotionalArc",
      "XA.momentsDeTruth",
      "XA.frictionMap",
      "XA.brandCoherenceScore",
    ],
    dependsOnFrameworks: ["FW-02", "FW-08", "FW-20"],
    hasImplementation: true,
  },
  {
    id: "FW-12",
    name: "Narrative Engineering",
    description:
      "Story by superfan stage: narrative arcs, sacred texts, vocabulary by stage, story bank",
    layer: "EXPERIENCE",
    category: "ai",
    inputVariables: [
      "A.herosJourney",
      "A.livingMythology",
      "D.assetsLinguistiques",
      "D.tonDeVoix",
      "MA.prophecy",
      "MA.existentialEnemy",
      "MA.doctrine",
      "GS.vocabularyAuthorized",
      "XA.transitionMap",
    ],
    outputVariables: [
      "XB.narrativeArc",
      "XB.sacredTexts",
      "XB.vocabularyByStage",
      "XB.storyBank",
    ],
    dependsOnFrameworks: ["FW-02", "FW-20", "FW-05", "FW-11"],
    hasImplementation: true,
  },
  {
    id: "FW-04",
    name: "Narrative Immersive",
    description:
      "Event-specific narrative: North Star, factions, spatial map, quests, NPCs, diegetic sponsoring",
    layer: "EXPERIENCE",
    category: "ai",
    inputVariables: [
      "D.identiteVisuelle",
      "D.assetsLinguistiques",
      "GS.vocabularyAuthorized",
      "GS.vocabularyForbidden",
    ],
    outputVariables: [
      "NI.northStar",
      "NI.architectureNarrative",
      "NI.spatialMap",
      "NI.questSystem",
      "NI.npcSystem",
      "NI.diegeticSponsoring",
    ],
    dependsOnFrameworks: ["FW-02", "FW-05"],
    condition: ["EVENT", "EDITION"],
    hasImplementation: true,
  },

  // ── COUCHE 4 — VALIDATION ──────────────────────────────────────────
  {
    id: "FW-06",
    name: "Signal Intelligence System",
    description:
      "Real-time market intelligence: metrics, strong signals, weak signals, decision queue",
    layer: "VALIDATION",
    category: "hybrid",
    inputVariables: [],
    outputVariables: [],
    dependsOnFrameworks: ["FW-02"],
    hasImplementation: false, // Existing TARSIS system
  },

  // ── COUCHE 5 — EXÉCUTION ───────────────────────────────────────────
  {
    id: "FW-09",
    name: "GLORY Production System",
    description: "38-tool creative production system across 4 layers",
    layer: "EXECUTION",
    category: "ai",
    inputVariables: [],
    outputVariables: [],
    dependsOnFrameworks: ["FW-02"],
    hasImplementation: false, // Existing GLORY system
  },
  {
    id: "FW-18",
    name: "Internal Alignment System",
    description:
      "Organic dimension: does the team live the brand? Internalization, rituals, clergy mapping",
    layer: "EXECUTION",
    category: "ai",
    inputVariables: [
      "A.valeurs",
      "A.hierarchieCommunautaire",
      "E.rituels",
    ],
    outputVariables: [
      "IA.internalization",
      "IA.internalRituals",
      "IA.clergyMapping",
      "IA.brandCultureFit",
    ],
    dependsOnFrameworks: ["FW-02"],
    hasImplementation: true,
  },
  {
    id: "FW-22",
    name: "Creative Methodology Layer",
    description:
      "Creative thinking methods: Kubo Titling, Nano Banana, Pinterest Curation, DA Diagnostic",
    layer: "EXECUTION",
    category: "compute",
    inputVariables: [],
    outputVariables: ["CM.methodRegistry", "CM.methodToolMapping"],
    dependsOnFrameworks: [],
    hasImplementation: true,
  },
  {
    id: "FW-23",
    name: "Execution Sequencing Engine",
    description:
      "Temporal orchestration: GTM Launch, Annual Planning, Event Production, Retroplanning, Editorial",
    layer: "EXECUTION",
    category: "hybrid",
    inputVariables: [],
    outputVariables: [
      "ES.activeSequence",
      "ES.timeline",
      "ES.goNoGoGates",
      "ES.resourceAllocation",
    ],
    dependsOnFrameworks: ["FW-02"],
    hasImplementation: true,
  },

  // ── COUCHE 6 — MESURE ──────────────────────────────────────────────
  {
    id: "FW-07",
    name: "Cult Index Engine",
    description:
      "Community health: 7-metric composite score measuring brand cult level (0-100)",
    layer: "MEASURE",
    category: "compute",
    inputVariables: [],
    outputVariables: [],
    dependsOnFrameworks: [],
    hasImplementation: false, // Existing cult-index-engine.ts
  },
  {
    id: "FW-08",
    name: "Superfan Segmentation",
    description:
      "6-stage superfan ladder segmentation with transition tracking",
    layer: "MEASURE",
    category: "compute",
    inputVariables: [],
    outputVariables: [],
    dependsOnFrameworks: [],
    hasImplementation: false, // Existing superfan profiles
  },
  {
    id: "FW-10",
    name: "Attribution & Cohort Analysis",
    description:
      "ROI measurement: channel attribution, cohort LTV, touchpoint conversion",
    layer: "MEASURE",
    category: "compute",
    inputVariables: [],
    outputVariables: [],
    dependsOnFrameworks: [],
    hasImplementation: false, // Existing analytics
  },

  // ── COUCHE 7 — CROISSANCE ──────────────────────────────────────────
  {
    id: "FW-19",
    name: "Growth Mechanics Engine",
    description:
      "Flywheel, scaling breakpoints, Ansoff expansion matrix, community monetization",
    layer: "GROWTH",
    category: "hybrid",
    inputVariables: ["VC.revenueModel"],
    outputVariables: [
      "GM.growthEngine",
      "GM.flywheel",
      "GM.scalingBreakpoints",
      "GM.expansionMatrix",
      "GM.communityMonetization",
    ],
    dependsOnFrameworks: ["FW-07", "FW-08", "FW-10", "FW-21"],
    hasImplementation: true,
  },
  {
    id: "FW-15",
    name: "Cultural Expansion Protocol",
    description:
      "New market adaptation: cultural transposition, local legitimacy, federalism",
    layer: "GROWTH",
    category: "ai",
    inputVariables: [
      "MA.doctrine",
    ],
    outputVariables: [
      "CE.culturalTransposition",
      "CE.localLegitimacy",
      "CE.federalism",
    ],
    dependsOnFrameworks: ["FW-02", "FW-20"],
    hasImplementation: true,
  },
  {
    id: "FW-16",
    name: "Brand Architecture System",
    description:
      "Portfolio management: architecture model, inheritance rules, cross-brand cult index",
    layer: "GROWTH",
    category: "compute",
    inputVariables: [],
    outputVariables: [
      "BA.architectureModel",
      "BA.inheritanceRules",
      "BA.crossBrandCultIndex",
    ],
    dependsOnFrameworks: [],
    hasImplementation: true,
  },

  // ── COUCHE 8 — SURVIE ──────────────────────────────────────────────
  {
    id: "FW-14",
    name: "Brand Evolution Engine",
    description:
      "Controlled mutation: immutable vs mutable identity, drift detection, lifecycle stages",
    layer: "SURVIVAL",
    category: "compute",
    inputVariables: [],
    outputVariables: [
      "BE.identityCore",
      "BE.driftDetection",
      "BE.lifecycleStage",
    ],
    dependsOnFrameworks: ["FW-07"],
    hasImplementation: true,
  },
  {
    id: "FW-17",
    name: "Brand Defense Protocol",
    description:
      "Immune system: threat map, community defense, crisis narrative, enemy as fuel",
    layer: "SURVIVAL",
    category: "hybrid",
    inputVariables: [
      "MA.existentialEnemy",
      "MA.doctrine",
    ],
    outputVariables: [
      "BD.threatMap",
      "BD.communityDefense",
      "BD.crisisNarrative",
      "BD.enemyAsFuel",
    ],
    dependsOnFrameworks: ["FW-02", "FW-20", "FW-07", "FW-08"],
    hasImplementation: true,
  },
];

// ---------------------------------------------------------------------------
// Registry Map (for O(1) lookups)
// ---------------------------------------------------------------------------

const FRAMEWORK_MAP = new Map<string, FrameworkDescriptor>();
for (const fw of FRAMEWORK_DESCRIPTORS) {
  FRAMEWORK_MAP.set(fw.id, fw);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Get a framework descriptor by ID */
export function getFramework(id: string): FrameworkDescriptor | undefined {
  return FRAMEWORK_MAP.get(id);
}

/** Get all framework descriptors */
export function getAllFrameworks(): FrameworkDescriptor[] {
  return [...FRAMEWORK_DESCRIPTORS];
}

/** Get all frameworks for a given layer */
export function getFrameworksForLayer(
  layer: ArtemisLayer,
): FrameworkDescriptor[] {
  return FRAMEWORK_DESCRIPTORS.filter((fw) => fw.layer === layer);
}

/** Get direct dependency framework descriptors for a given framework */
export function getFrameworkDependencies(
  id: string,
): FrameworkDescriptor[] {
  const fw = FRAMEWORK_MAP.get(id);
  if (!fw) return [];
  return fw.dependsOnFrameworks
    .map((depId) => FRAMEWORK_MAP.get(depId))
    .filter((dep): dep is FrameworkDescriptor => dep !== undefined);
}

/** Get frameworks that have module implementations (can be executed) */
export function getImplementedFrameworks(): FrameworkDescriptor[] {
  return FRAMEWORK_DESCRIPTORS.filter((fw) => fw.hasImplementation);
}

/**
 * Get topological execution order for all implemented frameworks.
 * Uses Kahn's algorithm (same as variable-registry.ts).
 */
export function getExecutionOrder(): string[] {
  const implemented = FRAMEWORK_DESCRIPTORS.filter((fw) => fw.hasImplementation);
  const ids = new Set(implemented.map((fw) => fw.id));

  // Build adjacency + in-degree
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const id of ids) {
    inDegree.set(id, 0);
    adjacency.set(id, []);
  }

  for (const fw of implemented) {
    for (const dep of fw.dependsOnFrameworks) {
      if (ids.has(dep)) {
        adjacency.get(dep)!.push(fw.id);
        inDegree.set(fw.id, (inDegree.get(fw.id) ?? 0) + 1);
      }
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  if (order.length !== ids.size) {
    const missing = [...ids].filter((id) => !order.includes(id));
    console.warn(
      `[framework-registry] Cycle detected in framework dependencies. Missing: ${missing.join(", ")}`,
    );
  }

  return order;
}

/**
 * Get frameworks applicable for a given nodeType.
 * Filters out frameworks whose `condition` doesn't match.
 */
export function getFrameworksForNodeType(
  nodeType: string,
): FrameworkDescriptor[] {
  return FRAMEWORK_DESCRIPTORS.filter((fw) => {
    if (!fw.condition) return true; // No condition = always active
    return fw.condition.includes(nodeType as NodeType);
  });
}

/**
 * Collect all output variables across all frameworks.
 */
export function getAllFrameworkOutputVariables(): string[] {
  return FRAMEWORK_DESCRIPTORS.flatMap((fw) => fw.outputVariables);
}
