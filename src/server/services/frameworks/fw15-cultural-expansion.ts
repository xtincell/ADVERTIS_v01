// =============================================================================
// FW-15 — Cultural Expansion Protocol Handler
// =============================================================================
// AI-native module that designs the cross-market cultural expansion strategy.
// Inputs: A-D-V-E pillars, FW-20 (prophecy, doctrine)
// Outputs: CE.culturalTransposition, CE.localLegitimacy, CE.federalism
// Classifies brand elements as universal / adaptable / local, assesses
// legitimacy in target markets, and defines a federalism governance model.
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";

// ---------------------------------------------------------------------------
// Constants — Brand element templates
// ---------------------------------------------------------------------------

const BRAND_ELEMENTS: Array<{
  element: string;
  defaultCategory: "UNIVERSAL" | "ADAPTABLE" | "LOCAL";
  description: string;
  adaptationNotes: string;
}> = [
  // UNIVERSAL — core values, brand promise, mission
  { element: "Mission de marque", defaultCategory: "UNIVERSAL", description: "La raison d'être fondamentale de la marque, invariable quel que soit le marché", adaptationNotes: "Aucune adaptation — constitue le noyau identitaire non-négociable" },
  { element: "Promesse de marque", defaultCategory: "UNIVERSAL", description: "L'engagement central envers le consommateur, fondement du contrat de confiance", adaptationNotes: "Formulation peut varier mais le fond reste identique" },
  { element: "Valeurs fondatrices", defaultCategory: "UNIVERSAL", description: "Les principes directeurs qui guident toutes les décisions et actions de la marque", adaptationNotes: "Traduction linguistique uniquement — le sens reste intact" },
  { element: "Prophétie de marque", defaultCategory: "UNIVERSAL", description: "La vision transformatrice que la marque porte pour le monde", adaptationNotes: "Le récit prophétique est universel, seuls les exemples illustratifs s'adaptent" },

  // ADAPTABLE — tone, visual style, pricing, rituals, channels
  { element: "Ton de communication", defaultCategory: "ADAPTABLE", description: "Le registre de langue et le style rédactionnel de la marque", adaptationNotes: "Adapter le registre formel/informel selon les normes culturelles locales" },
  { element: "Identité visuelle secondaire", defaultCategory: "ADAPTABLE", description: "Palette de couleurs d'accent, typographies secondaires, motifs graphiques", adaptationNotes: "Adapter les couleurs d'accent et motifs aux sensibilités culturelles locales" },
  { element: "Stratégie de prix", defaultCategory: "ADAPTABLE", description: "Positionnement tarifaire et modèle de pricing", adaptationNotes: "Ajuster au pouvoir d'achat local tout en maintenant le positionnement relatif" },
  { element: "Rituels de marque", defaultCategory: "ADAPTABLE", description: "Les pratiques récurrentes qui rythment la relation marque-communauté", adaptationNotes: "Conserver la structure rituelle, adapter le contenu aux calendriers et coutumes locaux" },
  { element: "Mix de canaux", defaultCategory: "ADAPTABLE", description: "La sélection et la pondération des canaux de communication", adaptationNotes: "Prioriser les plateformes dominantes dans chaque marché (ex: WhatsApp vs Telegram)" },

  // LOCAL — language, cultural references, partnerships, local events
  { element: "Langue et expressions", defaultCategory: "LOCAL", description: "Le vocabulaire, les expressions idiomatiques et le registre linguistique", adaptationNotes: "Créer un lexique de marque spécifique à chaque marché linguistique" },
  { element: "Références culturelles", defaultCategory: "LOCAL", description: "Les symboles, icônes et références ancrés dans la culture locale", adaptationNotes: "Développer un répertoire de références culturelles propres à chaque marché" },
  { element: "Partenariats locaux", defaultCategory: "LOCAL", description: "Les alliances avec des acteurs locaux légitimes et reconnus", adaptationNotes: "Identifier des partenaires clés dans chaque marché pour asseoir la légitimité locale" },
];

// ---------------------------------------------------------------------------
// Constants — Target market templates
// ---------------------------------------------------------------------------

const TARGET_MARKETS: Array<{
  id: string;
  market: string;
  culturalFit: number;
  barriers: string[];
  enablers: string[];
  adaptationStrategy: string;
  localPartnerRequired: boolean;
  estimatedTimeToLegitimacy: string;
}> = [
  {
    id: "market-afrique-francophone",
    market: "Afrique Francophone",
    culturalFit: 78,
    barriers: [
      "Fragmentation réglementaire entre pays",
      "Infrastructure digitale inégale",
      "Concurrence de marques locales établies",
      "Méfiance envers les marques perçues comme étrangères",
    ],
    enablers: [
      "Langue française partagée",
      "Jeunesse digitale en croissance rapide",
      "Appétit pour les marques authentiques et engagées",
      "Réseaux sociaux comme levier de communauté",
      "Diaspora comme pont culturel",
    ],
    adaptationStrategy: "Ancrage par la langue et les valeurs partagées — s'appuyer sur les créateurs locaux et la diaspora comme ambassadeurs de légitimité. Prioriser le mobile-first et les plateformes de messagerie.",
    localPartnerRequired: true,
    estimatedTimeToLegitimacy: "12-18 mois",
  },
  {
    id: "market-afrique-anglophone",
    market: "Afrique Anglophone",
    culturalFit: 62,
    barriers: [
      "Barrière linguistique nécessitant une traduction complète",
      "Écosystèmes médiatiques différents (Nollywood, Afrobeats)",
      "Normes commerciales et réglementaires distinctes",
      "Marchés dominés par des acteurs anglophones établis",
    ],
    enablers: [
      "Dynamisme économique (Nigeria, Kenya, Ghana)",
      "Culture entrepreneuriale forte",
      "Adoption technologique rapide (M-Pesa, fintech)",
      "Scène créative influente mondialement",
    ],
    adaptationStrategy: "Entrée par co-création avec des partenaires locaux influents — adaptation complète du ton et des références culturelles. S'appuyer sur l'écosystème tech et créatif local comme vecteur de légitimité.",
    localPartnerRequired: true,
    estimatedTimeToLegitimacy: "18-24 mois",
  },
  {
    id: "market-diaspora",
    market: "Diaspora",
    culturalFit: 85,
    barriers: [
      "Dispersion géographique (Europe, Amérique du Nord)",
      "Double identité culturelle complexe",
      "Saturation médiatique dans les marchés d'accueil",
      "Nostalgie vs modernité — équilibre délicat",
    ],
    enablers: [
      "Forte connexion émotionnelle aux racines culturelles",
      "Pouvoir d'achat supérieur à la moyenne",
      "Rôle de prescripteurs auprès du continent",
      "Communautés digitales actives et engagées",
      "Bilinguisme/multilinguisme naturel",
    ],
    adaptationStrategy: "Activation communautaire en s'appuyant sur la fierté identitaire et le rôle de pont culturel. Contenu bilingue, événements communautaires dans les villes-clés, et e-commerce comme canal principal.",
    localPartnerRequired: false,
    estimatedTimeToLegitimacy: "6-12 mois",
  },
];

// ---------------------------------------------------------------------------
// Constants — Default governance
// ---------------------------------------------------------------------------

const DEFAULT_GOVERNANCE_RULES = [
  "La doctrine de marque (FW-20) est non-négociable — toute déclinaison locale doit la respecter intégralement",
  "Les marchés locaux disposent d'une autonomie créative dans le cadre défini par la charte de transposition",
  "Tout nouveau marché doit être validé par un audit de compatibilité culturelle (score minimum 50/100)",
  "Les partenariats locaux sont soumis à validation centrale pour alignement avec les valeurs de marque",
  "Revue trimestrielle de cohérence inter-marchés par le conseil de gouvernance",
  "Budget marketing réparti selon la formule 60% central / 40% local (ajustable par marché)",
  "Les éléments UNIVERSAL ne peuvent être modifiés sans unanimité du conseil de gouvernance",
  "Les éléments ADAPTABLE peuvent être déclinés localement avec validation du Brand Guardian régional",
  "Les éléments LOCAL sont sous responsabilité du directeur de marché local",
];

const DEFAULT_COORDINATION_MECHANISMS = [
  "Conseil de gouvernance trimestriel réunissant les directeurs de chaque marché",
  "Plateforme digitale partagée pour les assets de marque et guidelines de transposition",
  "Brand Guardian régional dans chaque marché — relais entre le central et le local",
  "Tableau de bord temps réel des KPIs de marque par marché",
  "Processus d'escalade clair pour les décisions impactant la doctrine",
  "Sessions de partage de best practices inter-marchés (mensuel)",
  "Audit de cohérence semestriel avec scoring de transposition par marché",
];

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
  try {
    // Resolve inputs — A-D-V-E pillars and FW-20 doctrine
    const prophecy = ctx.inputs["MA.prophecy"] as Record<string, unknown> | null;
    const doctrine = ctx.inputs["MA.doctrine"] as Record<string, unknown> | null;
    const valeurs = ctx.inputs["A.valeurs"] as string[] | Record<string, unknown>[] | null;
    const _pillarD = ctx.inputs["D.positionnement"] as Record<string, unknown> | null;
    const _pillarV = ctx.inputs["V.promesse"] as Record<string, unknown> | null;
    const _pillarE = ctx.inputs["E.rituels"] as Record<string, unknown>[] | null;

    // ------------------------------------------------------------------
    // 1. Cultural Transposition Matrix
    // ------------------------------------------------------------------
    const brandValues = extractBrandValues(valeurs, prophecy);
    const elements = BRAND_ELEMENTS.map((be, idx) => ({
      id: `ce-${idx + 1}`,
      element: enrichElementName(be.element, brandValues),
      category: be.defaultCategory,
      description: enrichDescription(be.description, doctrine),
      adaptationNotes: be.adaptationNotes,
    }));

    const universals = elements.filter((e) => e.category === "UNIVERSAL");
    const adaptables = elements.filter((e) => e.category === "ADAPTABLE");
    const locals = elements.filter((e) => e.category === "LOCAL");

    const transpositionScore = computeTranspositionScore(universals.length, elements.length);

    const culturalTransposition = {
      universals,
      adaptables,
      locals,
      transpositionScore,
    };

    // ------------------------------------------------------------------
    // 2. Local Legitimacy — per-market assessment
    // ------------------------------------------------------------------
    const localLegitimacy = TARGET_MARKETS.map((tm) => ({
      id: tm.id,
      market: tm.market,
      culturalFit: adjustCulturalFit(tm.culturalFit, brandValues, doctrine),
      barriers: tm.barriers,
      enablers: enrichEnablers(tm.enablers, prophecy),
      adaptationStrategy: tm.adaptationStrategy,
      localPartnerRequired: tm.localPartnerRequired,
      estimatedTimeToLegitimacy: tm.estimatedTimeToLegitimacy,
    }));

    // ------------------------------------------------------------------
    // 3. Federalism — governance model
    // ------------------------------------------------------------------
    const federalism = {
      model: "FEDERATED" as const,
      description: deriveFederalismDescription(doctrine),
      governanceRules: deriveGovernanceRules(doctrine),
      autonomyLevel: computeAutonomyLevel(transpositionScore),
      coordinationMechanisms: DEFAULT_COORDINATION_MECHANISMS,
    };

    return {
      success: true,
      data: {
        culturalTransposition,
        localLegitimacy,
        federalism,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {},
      error: error instanceof Error ? error.message : "FW-15 execution error",
    };
  }
}

registerFrameworkHandler("FW-15", execute);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract brand value names from pillar A and/or prophecy */
function extractBrandValues(
  valeurs: string[] | Record<string, unknown>[] | null,
  prophecy: Record<string, unknown> | null,
): string[] {
  const values: string[] = [];

  if (valeurs && Array.isArray(valeurs) && valeurs.length > 0) {
    if (typeof valeurs[0] === "string") {
      values.push(...(valeurs as string[]));
    } else {
      values.push(
        ...(valeurs as Record<string, unknown>[]).map(
          (v) =>
            String(
              v.nom ?? v.name ?? v.valeur ?? v.value ?? v.label ?? "Valeur",
            ),
        ),
      );
    }
  }

  // Enrich from prophecy if available
  if (prophecy && typeof prophecy === "object") {
    const vision = prophecy.vision ?? prophecy.prophecy;
    if (typeof vision === "string" && vision.length > 0) {
      values.push("Vision prophétique");
    }
  }

  return values.length > 0
    ? values.slice(0, 7)
    : ["Excellence", "Authenticité", "Innovation", "Communauté", "Impact"];
}

/** Enrich element name with brand-specific context when available */
function enrichElementName(baseName: string, brandValues: string[]): string {
  if (brandValues.length === 0) return baseName;
  // For the "Valeurs fondatrices" element, append brand values as context
  if (baseName === "Valeurs fondatrices" && brandValues.length > 0) {
    const valueList = brandValues.slice(0, 3).join(", ");
    return `${baseName} (${valueList})`;
  }
  return baseName;
}

/** Enrich description with doctrine context when available */
function enrichDescription(
  baseDescription: string,
  doctrine: Record<string, unknown> | null,
): string {
  if (!doctrine || typeof doctrine !== "object") return baseDescription;
  const doctrineText = doctrine.summary ?? doctrine.description ?? doctrine.core;
  if (typeof doctrineText === "string" && doctrineText.length > 0) {
    return `${baseDescription} — aligné avec la doctrine de marque`;
  }
  return baseDescription;
}

/** Compute transposition score — ratio of universals to total elements */
function computeTranspositionScore(
  universalCount: number,
  totalCount: number,
): number {
  if (totalCount === 0) return 0;
  // Base score from universal ratio, weighted toward portability
  const ratio = universalCount / totalCount;
  return Math.round(ratio * 100);
}

/** Adjust cultural fit based on brand values alignment with market */
function adjustCulturalFit(
  baseFit: number,
  brandValues: string[],
  doctrine: Record<string, unknown> | null,
): number {
  let adjustment = 0;

  // Brands with explicit values score slightly higher on cultural fit
  if (brandValues.length >= 3) {
    adjustment += 3;
  }

  // Doctrine-backed brands have stronger positioning
  if (doctrine && typeof doctrine === "object" && Object.keys(doctrine).length > 0) {
    adjustment += 2;
  }

  return Math.min(Math.round(baseFit + adjustment), 100);
}

/** Enrich enablers with prophecy-derived elements */
function enrichEnablers(
  baseEnablers: string[],
  prophecy: Record<string, unknown> | null,
): string[] {
  if (!prophecy || typeof prophecy !== "object") return baseEnablers;
  const vision = prophecy.vision ?? prophecy.prophecy;
  if (typeof vision === "string" && vision.length > 0) {
    return [
      ...baseEnablers,
      "Prophétie de marque résonnant avec les aspirations locales",
    ];
  }
  return baseEnablers;
}

/** Derive federalism description from doctrine */
function deriveFederalismDescription(
  doctrine: Record<string, unknown> | null,
): string {
  const base =
    "Modèle fédéré — la doctrine de marque est définie centralement et constitue le socle non-négociable. " +
    "Chaque marché dispose d'une autonomie encadrée pour adapter les éléments ADAPTABLE et LOCAL, " +
    "tout en respectant les garde-fous de transposition culturelle.";

  if (doctrine && typeof doctrine === "object" && Object.keys(doctrine).length > 0) {
    return `${base} La doctrine issue de FW-20 sert de constitution fédérale.`;
  }
  return base;
}

/** Derive governance rules, enriched with doctrine if available */
function deriveGovernanceRules(
  doctrine: Record<string, unknown> | null,
): string[] {
  const rules = [...DEFAULT_GOVERNANCE_RULES];
  if (doctrine && typeof doctrine === "object" && Object.keys(doctrine).length > 0) {
    rules.push(
      "La doctrine FW-20 fait office de constitution — tout amendement requiert un processus de révision formalisé",
    );
  }
  return rules;
}

/** Compute autonomy level — inversely related to transposition score */
function computeAutonomyLevel(transpositionScore: number): number {
  // Higher transposition score (more universals) = less local autonomy needed
  // Lower transposition score = more local autonomy required
  // Range: 40 (highly universal brand) to 75 (highly local brand)
  const base = 65;
  const adjustment = Math.round((50 - transpositionScore) * 0.35);
  return Math.max(40, Math.min(75, base + adjustment));
}
