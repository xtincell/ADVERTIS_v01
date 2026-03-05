// =============================================================================
// FW-18 — Internal Alignment System Handler
// =============================================================================
// Computes internal alignment data: how brand values become concrete internal
// actions, internal rituals that reinforce culture, brand-champion clergy
// mapping, and a brand-culture fit scorecard.
// Inputs: A.valeurs, A.hierarchie, E.rituels
// Outputs: IA.internalization, IA.internalRituals, IA.clergyMapping,
//          IA.brandCultureFit
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_VALUES = [
  { value: "Excellence", department: "Opérations", kpi: "Taux qualité produit/service", actionable: "Standards qualité documentés et audités mensuellement" },
  { value: "Innovation", department: "R&D / Produit", kpi: "Nombre d'initiatives innovantes par trimestre", actionable: "Sessions d'idéation hebdomadaires et budget innovation dédié" },
  { value: "Authenticité", department: "Communication", kpi: "Score cohérence message interne/externe", actionable: "Charte de transparence appliquée à toutes les communications" },
  { value: "Communauté", department: "RH / Culture", kpi: "eNPS (Employee Net Promoter Score)", actionable: "Programme ambassadeurs internes et rituels d'équipe" },
  { value: "Impact", department: "Direction Générale", kpi: "Indicateurs d'impact social et environnemental", actionable: "Reporting trimestriel d'impact partagé en interne" },
];

const RITUAL_TEMPLATES: Array<{
  id: string;
  name: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL";
  type: "ONBOARDING" | "CELEBRATION" | "ALIGNMENT" | "RECOGNITION" | "STORYTELLING";
  description: string;
  participants: string;
  emotionalTarget: string;
}> = [
  { id: "rit-daily-standup", name: "Stand-up Culture", frequency: "DAILY", type: "ALIGNMENT", description: "Check-in quotidien ancré dans les valeurs de marque — chaque équipe démarre par un rappel de la mission", participants: "Toutes les équipes", emotionalTarget: "Connexion et alignement" },
  { id: "rit-weekly-story", name: "Story Hour", frequency: "WEEKLY", type: "STORYTELLING", description: "Session hebdomadaire de partage d'histoires client illustrant les valeurs en action", participants: "Rotation inter-départements", emotionalTarget: "Fierté et inspiration" },
  { id: "rit-monthly-reco", name: "Héros du Mois", frequency: "MONTHLY", type: "RECOGNITION", description: "Célébration mensuelle des collaborateurs incarnant le mieux les valeurs de marque", participants: "Ensemble de l'entreprise", emotionalTarget: "Reconnaissance et motivation" },
  { id: "rit-quarterly-align", name: "Conseil de Doctrine", frequency: "QUARTERLY", type: "ALIGNMENT", description: "Revue trimestrielle de l'alignement marque-culture avec ajustements stratégiques", participants: "Leadership + Brand Champions", emotionalTarget: "Clarté stratégique" },
  { id: "rit-onboarding", name: "Baptême de Marque", frequency: "MONTHLY", type: "ONBOARDING", description: "Immersion complète des nouveaux arrivants dans la mythologie, les rituels et la doctrine de marque", participants: "Nouveaux collaborateurs + parrain Brand Champion", emotionalTarget: "Appartenance et engagement" },
  { id: "rit-annual-fest", name: "Festival Annuel de Marque", frequency: "ANNUAL", type: "CELEBRATION", description: "Événement annuel célébrant les accomplissements et renforçant la culture à travers storytelling, reconnaissances et vision future", participants: "Ensemble de l'entreprise + partenaires clés", emotionalTarget: "Unité et transcendance" },
];

const CLERGY_TEMPLATES: Array<{
  id: string;
  role: string;
  department: string;
  missionBrief: string;
  level: "INITIATE" | "GUARDIAN" | "PRIEST" | "HIGH_PRIEST";
  responsibilities: string[];
}> = [
  {
    id: "clergy-chief-brand",
    role: "Grand Prêtre de Marque (Chief Brand Officer)",
    department: "Direction",
    missionBrief: "Gardien suprême de la doctrine de marque — veille à l'alignement stratégique à tous les niveaux",
    level: "HIGH_PRIEST",
    responsibilities: [
      "Définir et protéger la doctrine de marque",
      "Arbitrer les décisions d'alignement culturel",
      "Représenter la marque dans les instances stratégiques",
      "Former et nommer les Prêtres départementaux",
    ],
  },
  {
    id: "clergy-culture-lead",
    role: "Prêtre de la Culture Interne",
    department: "RH / People & Culture",
    missionBrief: "Architecte des rituels internes et gardien de l'expérience collaborateur alignée à la marque",
    level: "PRIEST",
    responsibilities: [
      "Concevoir et animer les rituels internes",
      "Mesurer l'adoption culturelle (eNPS, sondages)",
      "Gérer le programme d'onboarding marque",
      "Coordonner les Brand Guardians départementaux",
    ],
  },
  {
    id: "clergy-narrative-keeper",
    role: "Prêtre du Récit",
    department: "Communication / Marketing",
    missionBrief: "Gardien de la cohérence narrative entre discours interne et externe",
    level: "PRIEST",
    responsibilities: [
      "Maintenir la Story Bank interne",
      "Valider la cohérence des messages publics",
      "Animer les sessions Story Hour",
      "Former les équipes au storytelling de marque",
    ],
  },
  {
    id: "clergy-ops-guardian",
    role: "Gardien Opérationnel",
    department: "Opérations / Produit",
    missionBrief: "Traducteur des valeurs de marque en standards opérationnels et qualité produit",
    level: "GUARDIAN",
    responsibilities: [
      "Traduire les valeurs en critères qualité mesurables",
      "Auditer l'alignement des process opérationnels",
      "Remonter les incohérences marque-opérations",
    ],
  },
  {
    id: "clergy-dept-ambassador",
    role: "Ambassadeur Départemental",
    department: "Chaque département",
    missionBrief: "Relais de la culture de marque au sein de chaque équipe — premier point de contact pour les questions d'alignement",
    level: "INITIATE",
    responsibilities: [
      "Participer aux Conseils de Doctrine trimestriels",
      "Animer les rituels d'équipe au quotidien",
      "Remonter les signaux faibles de désalignement",
    ],
  },
];

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
  try {
    // Resolve inputs
    const valeurs = ctx.inputs["A.valeurs"] as string[] | Record<string, unknown>[] | null;
    const hierarchie = ctx.inputs["A.hierarchie"] as Record<string, unknown> | null;
    const rituels = ctx.inputs["E.rituels"] as Record<string, unknown>[] | null;

    // ------------------------------------------------------------------
    // 1. Internalization — map brand values to concrete internal actions
    // ------------------------------------------------------------------
    const extractedValues = extractValues(valeurs);
    const internalization = extractedValues.map((v, idx) => {
      const template = DEFAULT_VALUES[idx % DEFAULT_VALUES.length]!;
      return {
        value: v,
        actionableForm: template.actionable,
        department: template.department,
        kpi: template.kpi,
        adoptionRate: computeBaseAdoptionRate(idx, extractedValues.length),
      };
    });

    // ------------------------------------------------------------------
    // 2. Internal Rituals — rituals that reinforce brand culture
    // ------------------------------------------------------------------
    const internalRituals = RITUAL_TEMPLATES.map((rt) => {
      // Enrich from pillar E rituels if available
      const enriched = enrichRitualFromPillar(rt, rituels);
      return {
        id: enriched.id,
        name: enriched.name,
        frequency: enriched.frequency,
        type: enriched.type,
        description: enriched.description,
        participants: enriched.participants,
        emotionalTarget: enriched.emotionalTarget,
      };
    });

    // ------------------------------------------------------------------
    // 3. Clergy Mapping — internal brand champions
    // ------------------------------------------------------------------
    const clergyMapping = CLERGY_TEMPLATES.map((ct) => ({
      id: ct.id,
      role: ct.role,
      department: ct.department,
      missionBrief: ct.missionBrief,
      brandAmbassadorLevel: ct.level,
      responsibilities: ct.responsibilities,
    }));

    // ------------------------------------------------------------------
    // 4. Brand-Culture Fit — scorecard
    // ------------------------------------------------------------------
    const brandCultureFit = computeBrandCultureFit(
      extractedValues,
      hierarchie,
      rituels,
      internalization,
    );

    return {
      success: true,
      data: {
        internalization,
        internalRituals,
        clergyMapping,
        brandCultureFit,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {},
      error: error instanceof Error ? error.message : "FW-18 execution error",
    };
  }
}

registerFrameworkHandler("FW-18", execute);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract value names from various pillar A formats */
function extractValues(
  valeurs: string[] | Record<string, unknown>[] | null,
): string[] {
  if (!valeurs || !Array.isArray(valeurs) || valeurs.length === 0) {
    return DEFAULT_VALUES.map((v) => v.value);
  }

  // If array of strings, use directly
  if (typeof valeurs[0] === "string") {
    return (valeurs as string[]).slice(0, 7);
  }

  // If array of objects, try common property names
  return (valeurs as Record<string, unknown>[])
    .map(
      (v) =>
        String(
          v.nom ??
            v.name ??
            v.valeur ??
            v.value ??
            v.label ??
            "Valeur",
        ),
    )
    .slice(0, 7);
}

/** Compute a base adoption rate that tapers for later values */
function computeBaseAdoptionRate(index: number, total: number): number {
  // First values are more adopted; later ones still ramping
  const base = 75;
  const decay = Math.floor((index / Math.max(total, 1)) * 30);
  return Math.max(base - decay, 35);
}

/** Optionally enrich a ritual template from pillar E data */
function enrichRitualFromPillar(
  template: (typeof RITUAL_TEMPLATES)[number],
  rituels: Record<string, unknown>[] | null,
): (typeof RITUAL_TEMPLATES)[number] {
  if (!rituels || rituels.length === 0) return template;

  // Try to find a matching ritual from pillar E by type keyword
  const typeKeywords: Record<string, string[]> = {
    ONBOARDING: ["onboarding", "intégration", "accueil", "baptême"],
    CELEBRATION: ["célébration", "festival", "fête", "annuel"],
    ALIGNMENT: ["alignement", "doctrine", "stand-up", "standup"],
    RECOGNITION: ["reconnaissance", "héros", "récompense", "champion"],
    STORYTELLING: ["story", "récit", "narration", "histoire"],
  };

  const keywords = typeKeywords[template.type] ?? [];
  const match = rituels.find((r) => {
    const text = JSON.stringify(r).toLowerCase();
    return keywords.some((kw) => text.includes(kw));
  });

  if (!match) return template;

  // Merge pillar E data into template where applicable
  return {
    ...template,
    description:
      typeof match.description === "string"
        ? match.description
        : template.description,
    emotionalTarget:
      typeof match.emotionalTarget === "string" ||
      typeof match.emotion === "string"
        ? String(match.emotionalTarget ?? match.emotion)
        : template.emotionalTarget,
  };
}

/** Compute brand-culture fit from available data */
function computeBrandCultureFit(
  values: string[],
  hierarchie: Record<string, unknown> | null,
  rituels: Record<string, unknown>[] | null,
  internalization: Array<{ adoptionRate: number }>,
): {
  score: number;
  dimensions: {
    valueAlignment: number;
    behavioralConsistency: number;
    narrativeAdoption: number;
    ritualParticipation: number;
    symbolRecognition: number;
  };
  gaps: Array<{
    dimension: string;
    current: number;
    target: number;
    actionPlan: string;
  }>;
  overallAssessment: string;
} {
  // Score each dimension based on data availability and richness
  const hasValues = values.length > 0;
  const hasHierarchie = hierarchie !== null && Object.keys(hierarchie).length > 0;
  const hasRituels = rituels !== null && rituels.length > 0;
  const avgAdoption =
    internalization.length > 0
      ? Math.round(
          internalization.reduce((s, i) => s + i.adoptionRate, 0) /
            internalization.length,
        )
      : 50;

  const valueAlignment = hasValues ? Math.min(avgAdoption + 10, 100) : 45;
  const behavioralConsistency = hasHierarchie ? 62 : 48;
  const narrativeAdoption = hasValues && hasHierarchie ? 58 : 40;
  const ritualParticipation = hasRituels ? 65 : 42;
  const symbolRecognition = hasValues ? 55 : 38;

  const dimensions = {
    valueAlignment,
    behavioralConsistency,
    narrativeAdoption,
    ritualParticipation,
    symbolRecognition,
  };

  const score = Math.round(
    (valueAlignment +
      behavioralConsistency +
      narrativeAdoption +
      ritualParticipation +
      symbolRecognition) /
      5,
  );

  // Identify gaps (dimensions below 60 target 85)
  const TARGET = 85;
  const dimensionLabels: Record<string, string> = {
    valueAlignment: "Alignement des valeurs",
    behavioralConsistency: "Cohérence comportementale",
    narrativeAdoption: "Adoption du récit",
    ritualParticipation: "Participation aux rituels",
    symbolRecognition: "Reconnaissance des symboles",
  };

  const actionPlans: Record<string, string> = {
    valueAlignment:
      "Renforcer les ateliers d'appropriation des valeurs et intégrer les valeurs dans les critères d'évaluation de performance",
    behavioralConsistency:
      "Définir des comportements attendus par valeur et département, auditer trimestriellement",
    narrativeAdoption:
      "Intensifier les Story Hours et créer un guide narratif interne accessible à tous",
    ritualParticipation:
      "Simplifier la participation aux rituels, mesurer l'assiduité et recueillir le feedback",
    symbolRecognition:
      "Déployer les artefacts de marque dans les espaces physiques et digitaux internes",
  };

  const gaps = Object.entries(dimensions)
    .filter(([, val]) => val < TARGET)
    .map(([key, val]) => ({
      dimension: dimensionLabels[key] ?? key,
      current: val,
      target: TARGET,
      actionPlan: actionPlans[key] ?? "Élaborer un plan d'action dédié",
    }));

  // Overall assessment
  let overallAssessment: string;
  if (score >= 75) {
    overallAssessment =
      "Alignement interne solide — la culture de marque est bien ancrée. Focus sur l'optimisation continue et le renforcement des dimensions les plus faibles.";
  } else if (score >= 55) {
    overallAssessment =
      "Alignement modéré — les fondations existent mais des gaps significatifs subsistent. Priorité : rituels réguliers, formation narrative, et programme de Brand Champions actif.";
  } else {
    overallAssessment =
      "Alignement faible — la culture de marque est insuffisamment intégrée en interne. Action urgente requise : définir les valeurs opérationnelles, lancer les rituels fondamentaux, et nommer un clergé de marque.";
  }

  return { score, dimensions, gaps, overallAssessment };
}
