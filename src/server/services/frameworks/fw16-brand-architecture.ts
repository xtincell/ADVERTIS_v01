// =============================================================================
// FW-16 — Brand Architecture System Handler
// =============================================================================
// Compute module that determines the optimal brand architecture model,
// generates inheritance rules between parent and child brands, and
// calculates a cross-brand cult index.
//
// Inputs: nodeType (BRAND, PRODUCT, etc.), strategy context
// Outputs: BA.architectureModel, BA.inheritanceRules, BA.crossBrandCultIndex
//
// Architecture selection logic:
//   nodeType === "BRAND" with children → BRANDED_HOUSE or ENDORSED (by depth)
//   nodeType === "PRODUCT"             → HOUSE_OF_BRANDS
//   default                            → HYBRID_ARCH
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const _ARCHITECTURE_TYPES = [
  "BRANDED_HOUSE",
  "HOUSE_OF_BRANDS",
  "ENDORSED",
  "HYBRID_ARCH",
] as const;

type ArchType = (typeof _ARCHITECTURE_TYPES)[number];

const _INHERITANCE_TYPES = ["FULL", "PARTIAL", "OVERRIDE", "NONE"] as const;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
  try {
    const { nodeType, strategyId } = ctx;

    // Resolve optional inputs
    const children = ctx.inputs["children"] as unknown[] | null;
    const depth = typeof ctx.inputs["depth"] === "number" ? ctx.inputs["depth"] : 0;

    // ------------------------------------------------------------------
    // 1. Determine architecture type based on nodeType + structure
    // ------------------------------------------------------------------
    const archType = resolveArchitectureType(nodeType, children, depth);

    // ------------------------------------------------------------------
    // 2. Build architecture model
    // ------------------------------------------------------------------
    const architectureModel = buildArchitectureModel(archType);

    // ------------------------------------------------------------------
    // 3. Generate inheritance rules
    // ------------------------------------------------------------------
    const inheritanceRules = buildInheritanceRules(archType);

    // ------------------------------------------------------------------
    // 4. Compute cross-brand cult index
    // ------------------------------------------------------------------
    const crossBrandCultIndex = buildCrossBrandCultIndex(strategyId, archType);

    return {
      success: true,
      data: {
        architectureModel,
        inheritanceRules,
        crossBrandCultIndex,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {},
      error: error instanceof Error ? error.message : "FW-16 execution error",
    };
  }
}

registerFrameworkHandler("FW-16", execute);

// ---------------------------------------------------------------------------
// Architecture Type Resolution
// ---------------------------------------------------------------------------

function resolveArchitectureType(
  nodeType: string,
  children: unknown[] | null,
  depth: number,
): ArchType {
  if (nodeType === "BRAND" && children && children.length > 0) {
    // Shallow hierarchy → branded house; deeper hierarchy → endorsed
    return depth <= 1 ? "BRANDED_HOUSE" : "ENDORSED";
  }
  if (nodeType === "PRODUCT") {
    return "HOUSE_OF_BRANDS";
  }
  return "HYBRID_ARCH";
}

// ---------------------------------------------------------------------------
// Architecture Model Builder
// ---------------------------------------------------------------------------

function buildArchitectureModel(archType: ArchType) {
  return {
    type: archType,
    description: descriptionFor(archType),
    implications: implicationsFor(archType),
    advantages: advantagesFor(archType),
    risks: risksFor(archType),
  };
}

function descriptionFor(archType: ArchType): string {
  const map: Record<ArchType, string> = {
    BRANDED_HOUSE:
      "Architecture maison de marque : toutes les offres portent la marque mère. " +
      "L'identité est unifiée et la valeur de marque est concentrée.",
    HOUSE_OF_BRANDS:
      "Architecture maison de marques : chaque produit/service dispose de sa propre " +
      "identité de marque distincte, la marque mère reste en retrait.",
    ENDORSED:
      "Architecture endossée : les sous-marques bénéficient de la caution de la marque " +
      "mère tout en conservant leur propre personnalité.",
    HYBRID_ARCH:
      "Architecture hybride : combinaison flexible de plusieurs modèles d'architecture " +
      "adaptée à la complexité du portefeuille.",
  };
  return map[archType];
}

function implicationsFor(archType: ArchType): string[] {
  const map: Record<ArchType, string[]> = {
    BRANDED_HOUSE: [
      "Toute communication renforce la marque mère",
      "Un incident sur une offre impacte l'ensemble du portefeuille",
      "L'extension de gamme est facilitée par la notoriété existante",
      "Les investissements marketing sont mutualisés",
    ],
    HOUSE_OF_BRANDS: [
      "Chaque marque nécessite son propre investissement marketing",
      "Les risques sont compartimentés par marque",
      "Permet de cibler des segments très différents sans confusion",
      "La gestion du portefeuille est plus complexe et coûteuse",
    ],
    ENDORSED: [
      "La marque mère apporte crédibilité sans limiter la créativité",
      "Les sous-marques peuvent explorer des territoires adjacents",
      "L'endossement crée un lien de confiance transférable",
      "Nécessite des guidelines claires d'utilisation de l'endossement",
    ],
    HYBRID_ARCH: [
      "Flexibilité maximale pour s'adapter aux contextes variés",
      "Complexité accrue dans la gouvernance de marque",
      "Chaque décision d'architecture doit être justifiée individuellement",
      "Risque de confusion interne si les règles ne sont pas claires",
    ],
  };
  return map[archType];
}

function advantagesFor(archType: ArchType): string[] {
  const map: Record<ArchType, string[]> = {
    BRANDED_HOUSE: [
      "Efficacité maximale des investissements marketing",
      "Transfert de confiance immédiat sur les nouvelles offres",
      "Cohérence perçue forte par les audiences",
      "Simplification de la gestion de marque",
    ],
    HOUSE_OF_BRANDS: [
      "Isolation des risques entre marques",
      "Possibilité de positionner des marques concurrentes",
      "Liberté totale de positionnement par marque",
      "Chaque marque peut développer son propre cult following",
    ],
    ENDORSED: [
      "Équilibre entre autonomie et soutien de la marque mère",
      "Extension du territoire de marque sans dilution",
      "Capitalisation sur la réputation existante",
      "Flexibilité pour diversifier sans cannibaliser",
    ],
    HYBRID_ARCH: [
      "Adaptation au cas par cas selon le contexte",
      "Maximisation de la valeur sur chaque segment",
      "Évolution progressive possible sans restructuration",
      "Capacité à intégrer des acquisitions avec leur propre identité",
    ],
  };
  return map[archType];
}

function risksFor(archType: ArchType): string[] {
  const map: Record<ArchType, string[]> = {
    BRANDED_HOUSE: [
      "Contamination croisée : un échec affecte toutes les offres",
      "Difficulté à cibler des segments contradictoires",
      "Rigidité : toute offre doit s'aligner sur la marque mère",
      "Dépendance totale à la santé de la marque principale",
    ],
    HOUSE_OF_BRANDS: [
      "Coûts marketing multipliés par le nombre de marques",
      "Pas de synergie de notoriété entre marques",
      "Complexité de gestion du portefeuille",
      "Risque de cannibalisation inter-marques non détectée",
    ],
    ENDORSED: [
      "Dilution potentielle de la marque mère si trop d'endossements",
      "Ambiguïté sur le rôle exact de la marque mère",
      "Dépendance bidirectionnelle entre mère et filles",
      "Complexité dans les guidelines de co-branding",
    ],
    HYBRID_ARCH: [
      "Confusion interne et externe sur la logique d'architecture",
      "Difficulté à maintenir la cohérence globale",
      "Décisions cas par cas sans framework unifié",
      "Risque de drift architecturel au fil du temps",
    ],
  };
  return map[archType];
}

// ---------------------------------------------------------------------------
// Inheritance Rules Builder
// ---------------------------------------------------------------------------

interface RuleTemplate {
  parentVariable: string;
  childVariable: string;
  label: string;
}

const RULE_TEMPLATES: RuleTemplate[] = [
  {
    parentVariable: "brand.values",
    childVariable: "subBrand.values",
    label: "Brand Values",
  },
  {
    parentVariable: "brand.visualIdentity",
    childVariable: "subBrand.visualIdentity",
    label: "Visual Identity",
  },
  {
    parentVariable: "brand.toneOfVoice",
    childVariable: "subBrand.toneOfVoice",
    label: "Tone of Voice",
  },
  {
    parentVariable: "brand.positioning",
    childVariable: "subBrand.positioning",
    label: "Positioning",
  },
  {
    parentVariable: "brand.audienceSegments",
    childVariable: "subBrand.audienceSegments",
    label: "Audience Segments",
  },
  {
    parentVariable: "brand.pricingStrategy",
    childVariable: "subBrand.pricingStrategy",
    label: "Pricing Strategy",
  },
];

function buildInheritanceRules(archType: ArchType) {
  return RULE_TEMPLATES.map((tpl, idx) => ({
    id: `ir-${(idx + 1).toString().padStart(2, "0")}`,
    parentVariable: tpl.parentVariable,
    childVariable: tpl.childVariable,
    inheritanceType: resolveInheritanceType(archType, tpl.label),
    description: describeInheritance(archType, tpl.label),
    conditions: conditionsFor(archType, tpl.label),
  }));
}

function resolveInheritanceType(
  archType: ArchType,
  label: string,
): (typeof _INHERITANCE_TYPES)[number] {
  // Inheritance logic per architecture type
  const matrix: Record<ArchType, Record<string, (typeof _INHERITANCE_TYPES)[number]>> = {
    BRANDED_HOUSE: {
      "Brand Values": "FULL",
      "Visual Identity": "FULL",
      "Tone of Voice": "FULL",
      "Positioning": "PARTIAL",
      "Audience Segments": "PARTIAL",
      "Pricing Strategy": "PARTIAL",
    },
    HOUSE_OF_BRANDS: {
      "Brand Values": "NONE",
      "Visual Identity": "NONE",
      "Tone of Voice": "NONE",
      "Positioning": "NONE",
      "Audience Segments": "OVERRIDE",
      "Pricing Strategy": "OVERRIDE",
    },
    ENDORSED: {
      "Brand Values": "PARTIAL",
      "Visual Identity": "PARTIAL",
      "Tone of Voice": "PARTIAL",
      "Positioning": "OVERRIDE",
      "Audience Segments": "PARTIAL",
      "Pricing Strategy": "OVERRIDE",
    },
    HYBRID_ARCH: {
      "Brand Values": "PARTIAL",
      "Visual Identity": "PARTIAL",
      "Tone of Voice": "OVERRIDE",
      "Positioning": "OVERRIDE",
      "Audience Segments": "OVERRIDE",
      "Pricing Strategy": "OVERRIDE",
    },
  };
  return matrix[archType][label] ?? "PARTIAL";
}

function describeInheritance(archType: ArchType, label: string): string {
  const iType = resolveInheritanceType(archType, label);
  const descriptions: Record<string, string> = {
    FULL: `${label} : héritage complet — la sous-marque adopte intégralement les éléments de la marque mère.`,
    PARTIAL: `${label} : héritage partiel — la sous-marque s'inspire de la marque mère tout en pouvant adapter.`,
    OVERRIDE: `${label} : substitution — la sous-marque définit ses propres éléments, indépendamment de la marque mère.`,
    NONE: `${label} : aucun héritage — pas de lien formel entre la marque mère et la sous-marque sur cet axe.`,
  };
  return descriptions[iType] ?? `${label} : règle d'héritage par défaut.`;
}

function conditionsFor(archType: ArchType, label: string): string {
  const iType = resolveInheritanceType(archType, label);
  const conditions: Record<string, string> = {
    FULL: "Applicable dans tous les contextes ; aucune dérogation autorisée sans validation du brand council.",
    PARTIAL: "Adaptation autorisée si validée par le brand guardian et cohérente avec la doctrine.",
    OVERRIDE: "La sous-marque est libre de définir ses propres éléments ; la marque mère n'impose aucune contrainte.",
    NONE: "Aucune relation formelle ; les deux entités opèrent indépendamment sur cet axe.",
  };
  return conditions[iType] ?? "Conditions standard d'héritage.";
}

// ---------------------------------------------------------------------------
// Cross-Brand Cult Index Builder
// ---------------------------------------------------------------------------

function buildCrossBrandCultIndex(strategyId: string, archType: ArchType) {
  // Primary brand entry (current strategy)
  const primaryBrand = {
    brandId: strategyId,
    brandName: "Marque Principale",
    cultIndexScore: 72,
    coherenceWithParent: 100,
    stage: "ESTABLISHED",
  };

  // Mock sub-brand entries to illustrate the architecture potential
  const subBrands = generateSubBrandEntries(archType);

  const allBrands = [primaryBrand, ...subBrands];

  // Compute overall score as a weighted average
  const totalScore = allBrands.reduce((sum, b) => sum + b.cultIndexScore, 0);
  const overallScore = Math.round(totalScore / allBrands.length);

  return {
    overallScore,
    brands: allBrands,
    synergiesIdentified: synergiesFor(archType),
    conflictsDetected: conflictsFor(archType),
  };
}

function generateSubBrandEntries(archType: ArchType) {
  const subBrandTemplates: Array<{
    id: string;
    name: string;
    score: number;
    coherence: number;
    stage: string;
  }> = [
    { id: "sub-premium", name: "Ligne Premium", score: 68, coherence: 85, stage: "GROWTH" },
    { id: "sub-accessible", name: "Ligne Accessible", score: 55, coherence: 70, stage: "LAUNCH" },
    { id: "sub-digital", name: "Offre Digitale", score: 60, coherence: 75, stage: "GROWTH" },
  ];

  // Adjust coherence based on architecture type
  const coherenceModifier: Record<ArchType, number> = {
    BRANDED_HOUSE: 10,
    ENDORSED: 0,
    HOUSE_OF_BRANDS: -15,
    HYBRID_ARCH: -5,
  };

  return subBrandTemplates.map((tpl) => ({
    brandId: tpl.id,
    brandName: tpl.name,
    cultIndexScore: tpl.score,
    coherenceWithParent: Math.max(0, Math.min(100, tpl.coherence + coherenceModifier[archType])),
    stage: tpl.stage,
  }));
}

function synergiesFor(archType: ArchType): string[] {
  const map: Record<ArchType, string[]> = {
    BRANDED_HOUSE: [
      "Transfert de notoriété immédiat vers toutes les lignes",
      "Économies d'échelle sur les investissements média",
      "Base de fidèles partagée entre toutes les offres",
      "Cross-selling naturel entre les gammes",
    ],
    HOUSE_OF_BRANDS: [
      "Conquête de segments disjoints sans interférence",
      "Liberté d'expérimentation sur chaque marque",
      "Possibilité de marques concurrentes en interne",
    ],
    ENDORSED: [
      "Crédibilité transférée avec flexibilité créative",
      "Audiences complémentaires avec lien de confiance",
      "Innovation facilitée sous le parapluie de la marque mère",
    ],
    HYBRID_ARCH: [
      "Optimisation cas par cas des synergies de portefeuille",
      "Flexibilité pour s'adapter aux dynamiques de marché",
      "Capitalisation sélective sur la marque mère",
    ],
  };
  return map[archType];
}

function conflictsFor(archType: ArchType): string[] {
  const map: Record<ArchType, string[]> = {
    BRANDED_HOUSE: [
      "Risque de contamination si une ligne échoue",
      "Tension potentielle entre segments premium et accessible",
      "Limite la possibilité de cibler des audiences contradictoires",
    ],
    HOUSE_OF_BRANDS: [
      "Cannibalisation possible entre marques non détectée",
      "Coûts de gestion élevés pour chaque identité distincte",
      "Aucune synergie de notoriété entre les marques",
      "Difficulté à créer un sentiment d'appartenance global",
    ],
    ENDORSED: [
      "Dilution potentielle de la marque mère avec trop de sous-marques",
      "Complexité dans les règles d'utilisation de l'endossement",
      "Dépendance bidirectionnelle en cas de crise",
    ],
    HYBRID_ARCH: [
      "Confusion sur la logique d'architecture auprès des équipes internes",
      "Manque de cohérence perçu par le marché",
      "Risque de décisions ad hoc sans cadre unifié",
      "Difficulté à mesurer la performance globale du portefeuille",
    ],
  };
  return map[archType];
}
