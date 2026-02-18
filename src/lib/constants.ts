export const PILLAR_TYPES = ["A", "D", "V", "E", "R", "T", "I", "S"] as const;
export type PillarType = (typeof PILLAR_TYPES)[number];

export const PILLAR_CONFIG: Record<
  PillarType,
  { title: string; order: number; color: string; description: string }
> = {
  A: {
    title: "Authenticité",
    order: 1,
    color: "#c45a3c",
    description: "ADN de marque, Purpose, Vision, Valeurs",
  },
  D: {
    title: "Distinction",
    order: 2,
    color: "#2d5a3d",
    description: "Positionnement, Personas, Identité visuelle",
  },
  V: {
    title: "Valeur",
    order: 3,
    color: "#c49a3c",
    description: "Proposition de valeur, Pricing, Unit Economics",
  },
  E: {
    title: "Engagement",
    order: 4,
    color: "#3c7ac4",
    description: "Touchpoints, Rituels, AARRR, Communauté",
  },
  R: {
    title: "Risk",
    order: 5,
    color: "#c43c6e",
    description: "SWOT, Score de risque, Mitigation",
  },
  T: {
    title: "Track",
    order: 6,
    color: "#8c3cc4",
    description: "Validation, TAM/SAM/SOM, KPIs",
  },
  I: {
    title: "Implémentation",
    order: 7,
    color: "#3cc4c4",
    description: "Roadmap 36 mois, Budget, Équipe",
  },
  S: {
    title: "Stratégie",
    order: 8,
    color: "#c4783c",
    description: "Bible stratégique, Synthèse exécutive",
  },
};

export const SECTORS = [
  { value: "fashion", label: "Mode & Luxe" },
  { value: "fintech", label: "Fintech & Finance" },
  { value: "fmcg", label: "FMCG & Grande Consommation" },
  { value: "b2b-saas", label: "B2B SaaS & Tech" },
  { value: "hospitality", label: "Hôtellerie & Tourisme" },
  { value: "health", label: "Santé & Bien-être" },
  { value: "education", label: "Éducation" },
  { value: "other", label: "Autre" },
] as const;

// ============================================
// PHASE PIPELINE CONFIGURATION
// ============================================

export const PHASES = [
  "fiche",
  "fiche-review",
  "audit-r",
  "market-study",
  "audit-t",
  "audit-review",
  "implementation",
  "cockpit",
  "complete",
] as const;
export type Phase = (typeof PHASES)[number];

// Pillar groupings by phase
export const FICHE_PILLARS: PillarType[] = ["A", "D", "V", "E"];
export const AUDIT_PILLARS: PillarType[] = ["R", "T"];
export const AUDIT_R_PILLAR: PillarType = "R";
export const AUDIT_T_PILLAR: PillarType = "T";
export const IMPLEMENTATION_PILLAR: PillarType = "I";
export const COCKPIT_PILLAR: PillarType = "S";

// Only these pillars accept user input via the wizard form
export const USER_INPUT_PILLARS: PillarType[] = ["A", "D", "V", "E"];

// The market-study phase can be skipped (audit-r → audit-t directly)
export const SKIPPABLE_PHASES: Phase[] = ["market-study"];

// Legacy phase mapping for backward compatibility
export const LEGACY_PHASE_MAP: Record<string, Phase> = {
  audit: "audit-r",
};

export const PHASE_CONFIG: Record<
  Phase,
  {
    title: string;
    description: string;
    pillars: PillarType[];
    order: number;
    icon: string; // Lucide icon name
  }
> = {
  fiche: {
    title: "Fiche de Marque",
    description: "Collecte des données de la fiche de marque (A-D-V-E)",
    pillars: ["A", "D", "V", "E"],
    order: 1,
    icon: "ClipboardList",
  },
  "fiche-review": {
    title: "Validation Fiche",
    description: "Vérification et correction des données A-D-V-E",
    pillars: ["A", "D", "V", "E"],
    order: 2,
    icon: "ClipboardEdit",
  },
  "audit-r": {
    title: "Audit Risk",
    description: "Analyse SWOT automatique (Pilier R)",
    pillars: ["R"],
    order: 3,
    icon: "Shield",
  },
  "market-study": {
    title: "Étude de Marché",
    description: "Collecte de données marché réelles (optionnel)",
    pillars: [],
    order: 4,
    icon: "Globe",
  },
  "audit-t": {
    title: "Audit Track",
    description: "Validation marché enrichie par l'étude (Pilier T)",
    pillars: ["T"],
    order: 5,
    icon: "BarChart3",
  },
  "audit-review": {
    title: "Validation Audit",
    description: "Revue et correction manuelle des résultats d'audit R+T",
    pillars: ["R", "T"],
    order: 6,
    icon: "ClipboardEdit",
  },
  implementation: {
    title: "Données Stratégiques",
    description: "Génération des données structurées pour le cockpit (I)",
    pillars: ["I"],
    order: 7,
    icon: "FileText",
  },
  cockpit: {
    title: "Cockpit",
    description: "Interface interactive de la fiche de marque",
    pillars: ["S"],
    order: 8,
    icon: "LayoutDashboard",
  },
  complete: {
    title: "Terminé",
    description: "Fiche de marque complète",
    pillars: [],
    order: 9,
    icon: "CheckCircle",
  },
};

// ============================================
// REPORT CONFIGURATION (Phase 3)
// ============================================

export const REPORT_TYPES = [
  "rapport_a",
  "rapport_d",
  "rapport_v",
  "rapport_e",
  "rapport_r",
  "rapport_t",
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

// ============================================
// TEMPLATE CONFIGURATION (Livrables UPGRADERS)
// ============================================

export const TEMPLATE_TYPES = [
  "protocole_strategique",
  "reco_campagne",
  "mandat_360",
] as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export const TEMPLATE_CONFIG: Record<
  TemplateType,
  {
    title: string;
    subtitle: string;
    estimatedSlides: [number, number]; // [min, max]
    unit: "slides" | "pages";
    sections: string[];
  }
> = {
  protocole_strategique: {
    title: "Protocole Stratégique",
    subtitle: "Conseil de marque & positionnement",
    estimatedSlides: [60, 120],
    unit: "slides",
    sections: [
      "Couverture & Sommaire",
      "Contexte de Mission",
      "Méthodologie ADVE",
      "Audit de Marque (Synthèse A-D-V-E)",
      "Analyse Marché & Consommateur",
      "Synthèse Diagnostique",
      "Vision Stratégique",
      "Plateforme de Marque",
      "Architecture de Marque",
      "Stratégie d'Engagement",
      "Principes Directeurs",
      "Recommandations d'Activation",
      "Investissement & Gouvernance",
    ],
  },
  reco_campagne: {
    title: "Recommandation de Campagne",
    subtitle: "Création & activation",
    estimatedSlides: [30, 60],
    unit: "slides",
    sections: [
      "Brief Recap",
      "Diagnostic Marché",
      "Insight Consommateur",
      "Copy Strategy",
      "Territoire Stratégique",
      "Big Idea",
      "Déclinaisons Créatives",
      "Stratégie Média & Touchpoints",
      "Plan de Production",
      "Chronologie & Budget",
    ],
  },
  mandat_360: {
    title: "Mandat 360 / Retainer",
    subtitle: "Scope of work annuel",
    estimatedSlides: [20, 40],
    unit: "pages",
    sections: [
      "Contexte & Vision",
      "Streams de Travail",
      "Matrice des Livrables",
      "Gouvernance",
      "Dispositif d'Intervention",
      "Roadmap Annuelle",
      "Calendrier T1",
      "Rémunération & Budget",
      "Performance & KPIs",
    ],
  },
};

export const REPORT_CONFIG: Record<
  ReportType,
  {
    title: string;
    pillarSource: PillarType;
    estimatedPages: [number, number]; // [min, max]
    sections: string[];
  }
> = {
  rapport_a: {
    title: "Rapport A : ADN de Marque",
    pillarSource: "A",
    estimatedPages: [15, 30],
    sections: [
      "Manifest de Marque",
      "Identité Archétypale (Deep Dive)",
      "Hero's Journey Narrative",
      "Analyse Ikigai",
      "Framework de Valeurs (Schwartz)",
      "Blueprint Hiérarchie Communautaire",
      "Timeline & Narrative Historique",
      "Brand Folio : Guidelines Identité Visuelle",
    ],
  },
  rapport_d: {
    title: "Rapport D : Identité Visuelle & Positionnement",
    pillarSource: "D",
    estimatedPages: [30, 80],
    sections: [
      "Profils Persona (Full Depth)",
      "Analyse du Paysage Concurrentiel",
      "Architecture de Promesse de Marque",
      "Déclaration de Positionnement & Rationnel",
      "Playbook Tone of Voice",
      "Système d'Identité Visuelle",
      "Assets Linguistiques & Vocabulaire de Marque",
      "Preuves de Réussite & Case Evidence",
    ],
  },
  rapport_v: {
    title: "Rapport V : Offres Commerciales & CODB",
    pillarSource: "V",
    estimatedPages: [20, 40],
    sections: [
      "Architecture Product Ladder",
      "Évaluation de la Valeur de Marque (Tangible & Intangible)",
      "Proposition de Valeur Client (Deep Dive)",
      "Analyse Structure de Coûts (Brand-side)",
      "Analyse Coûts & Frictions Client",
      "Modèle Unit Economics",
      "Dashboard CODB (Cost of Doing Business)",
    ],
  },
  rapport_e: {
    title: "Rapport E : Bible Marketing & Leviers d'Action",
    pillarSource: "E",
    estimatedPages: [40, 70],
    sections: [
      "Cartographie Écosystème Touchpoints",
      "Design de Rituels (Always-On & Cycliques)",
      "Principes & Gouvernance Communautaire",
      "Système de Gamification",
      "Stratégie Funnel AARRR",
      "Blueprint Dashboard KPIs",
      "Bible d'Actions Marketing : Sprint 90 Jours",
      "Playbook Tactique Canal par Canal",
      "Analyse & Priorisation des Leviers Clés",
    ],
  },
  rapport_r: {
    title: "Rapport R : SWOTs par Pilier",
    pillarSource: "R",
    estimatedPages: [30, 60],
    sections: [
      "Méthodologie : Framework Micro-SWOT",
      "Analyse SWOT Pilier A (par variable)",
      "Analyse SWOT Pilier D (par variable)",
      "Analyse SWOT Pilier V (par variable)",
      "Analyse SWOT Pilier E (par variable)",
      "Synthèse SWOT Globale",
      "Score Card de Risque (0-100)",
      "Matrice Probabilité × Impact",
      "Roadmap de Mitigation Prioritaire",
    ],
  },
  rapport_t: {
    title: "Rapport T : Analyse Brand vs Marché",
    pillarSource: "T",
    estimatedPages: [35, 60],
    sections: [
      "Triangulation Trois Sources",
      "Matrice de Validation des Hypothèses (A-E)",
      "Rapport Réalité Marché : Tendances Macro",
      "Détection de Signaux : Signaux Faibles & Patterns Émergents",
      "Modèle de Dimensionnement TAM/SAM/SOM",
      "Benchmarking Concurrentiel (Deep Dive)",
      "Score Brand-Market Fit",
      "Recommandations Stratégiques Issues du Track",
    ],
  },
};
