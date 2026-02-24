// =============================================================================
// LIB L.1 — Constants
// =============================================================================
// Central configuration hub for the entire ADVERTIS application.
// Exports: PILLAR_TYPES, PILLAR_CONFIG, SECTOR_GROUPS, SECTORS, PHASES,
//   PHASE_CONFIG, BUDGET_TIER_CONFIG, VERTICAL_DICTIONARY, MATURITY_CONFIG,
//   FRESHNESS_THRESHOLDS, REPORT_CONFIG, BRIEF_TYPES, TRANSLATION_STATUSES,
//   MISSION_STATUSES, USER_ROLES, ASSIGNMENT_ROLES, MARKETS, PRICING_CATEGORIES,
//   SIGNAL_LAYERS, DECISION_PRIORITIES, WHITE_LABEL_MAP, and many more.
// Used by: nearly every module — schemas, routers, UI components, generators.
// =============================================================================

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

// ---------------------------------------------------------------------------
// Sector groups (searchable combobox in strategy creation)
// ---------------------------------------------------------------------------

export interface SectorGroup {
  group: string;
  sectors: { value: string; label: string }[];
}

export const SECTOR_GROUPS: SectorGroup[] = [
  {
    group: "Finance & Tech",
    sectors: [
      { value: "fintech", label: "Fintech & Finance" },
      { value: "banking", label: "Banque & Assurance" },
      { value: "mobile-money", label: "Mobile Money & Paiements" },
      { value: "b2b-saas", label: "B2B SaaS & Tech" },
      { value: "e-commerce", label: "E-commerce & Marketplace" },
    ],
  },
  {
    group: "Consommation & Retail",
    sectors: [
      { value: "fmcg", label: "FMCG & Grande Consommation" },
      { value: "food-bev", label: "Agroalimentaire & Boissons" },
      { value: "fashion", label: "Mode & Luxe" },
      { value: "beauty", label: "Beauté & Cosmétiques" },
      { value: "retail", label: "Retail & Distribution" },
    ],
  },
  {
    group: "Industrie & Ressources",
    sectors: [
      { value: "mining", label: "Mines & Ressources naturelles" },
      { value: "energy", label: "Énergie & Utilities" },
      { value: "agriculture", label: "Agriculture & Agribusiness" },
      { value: "manufacturing", label: "Industrie & Manufacturing" },
      { value: "construction", label: "BTP & Construction" },
    ],
  },
  {
    group: "Services & Infrastructure",
    sectors: [
      { value: "telecom", label: "Télécommunications" },
      { value: "logistics", label: "Transport & Logistique" },
      { value: "maritime", label: "Maritime & Portuaire" },
      { value: "real-estate", label: "Immobilier" },
      { value: "hospitality", label: "Hôtellerie & Tourisme" },
      { value: "consulting", label: "Conseil & Services professionnels" },
    ],
  },
  {
    group: "Santé & Éducation",
    sectors: [
      { value: "health", label: "Santé & Pharma" },
      { value: "wellness", label: "Bien-être & Fitness" },
      { value: "education", label: "Éducation & EdTech" },
    ],
  },
  {
    group: "Médias & Culture",
    sectors: [
      { value: "media", label: "Médias & Entertainment" },
      { value: "creative", label: "Industries Créatives & Design" },
      { value: "sports", label: "Sport & Sponsoring" },
    ],
  },
  {
    group: "Secteur Public & ONG",
    sectors: [
      { value: "public", label: "Secteur public & Gouvernance" },
      { value: "ngo", label: "ONG & Développement" },
    ],
  },
  {
    group: "Autre",
    sectors: [
      { value: "other", label: "Autre" },
    ],
  },
];

// Flat list — backward compatible with all existing code that uses SECTORS
export const SECTORS = SECTOR_GROUPS.flatMap((g) =>
  g.sectors.map((s) => ({ ...s, group: g.group })),
);

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

// ============================================
// PHASE 1 — BRAND TREE CONSTANTS
// ============================================

export const NODE_TYPES = [
  "BRAND", "PRODUCT", "CAMPAIGN", "CHARACTER", "ENVIRONMENT",
  "EVENT", "SKU", "COLLECTION", "ZONE", "EDITION", "COMMUNITY",
] as const;
export type NodeType = (typeof NODE_TYPES)[number];

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  BRAND: "Marque",
  PRODUCT: "Produit",
  CAMPAIGN: "Campagne",
  CHARACTER: "Personnage",
  ENVIRONMENT: "Environnement",
  EVENT: "Événement",
  SKU: "SKU",
  COLLECTION: "Collection",
  ZONE: "Zone",
  EDITION: "Édition",
  COMMUNITY: "Communauté",
};

export const DELIVERY_MODES = ["ONE_SHOT", "PLACEMENT", "RETAINER"] as const;
export type DeliveryMode = (typeof DELIVERY_MODES)[number];

export const VERTICALS = [
  "FMCG", "TECH", "HEALTH_PUBLIC", "INSTITUTIONAL",
  "CULTURE", "LUXURY", "NGO",
] as const;
export type Vertical = (typeof VERTICALS)[number];

export const VERTICAL_LABELS: Record<Vertical, string> = {
  FMCG: "Grande Consommation (FMCG)",
  TECH: "Tech & Digital",
  HEALTH_PUBLIC: "Santé Publique",
  INSTITUTIONAL: "Institutionnel",
  CULTURE: "Culture & Médias",
  LUXURY: "Luxe & Premium",
  NGO: "ONG & Développement",
};

export const MATURITY_PROFILES = ["MATURE", "GROWTH", "STARTUP", "LAUNCH"] as const;
export type MaturityProfile = (typeof MATURITY_PROFILES)[number];

export const MATURITY_CONFIG: Record<MaturityProfile, {
  label: string;
  expectedCoverage: number;
  generationMode: "descriptive" | "mixed" | "projective" | "vision";
  cockpitFocus: string;
  ratio: string;
}> = {
  MATURE:  { label: "Mature",   expectedCoverage: 100, generationMode: "descriptive", cockpitFocus: "Optimisation",  ratio: "100/0" },
  GROWTH:  { label: "Growth",   expectedCoverage: 70,  generationMode: "mixed",       cockpitFocus: "Croissance",    ratio: "70/30" },
  STARTUP: { label: "Startup",  expectedCoverage: 40,  generationMode: "projective",  cockpitFocus: "Acquisition",   ratio: "40/60" },
  LAUNCH:  { label: "Lancement", expectedCoverage: 0,  generationMode: "vision",      cockpitFocus: "Vision",        ratio: "0/100" },
};

export const VIEW_MODES = ["EXECUTIVE", "MARKETING", "FOUNDER", "MINIMAL"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  EXECUTIVE: "Exécutif (DG)",
  MARKETING: "Marketing (complet)",
  FOUNDER: "Fondateur",
  MINIMAL: "Minimal",
};

/** Sections visible per view mode. null key = show all. */
export const VIEW_MODE_SECTIONS: Record<ViewMode, string[]> = {
  EXECUTIVE: [
    "synthese", "coherence", "risk", "bmf", "decisions",
    "kpi-dashboard", "budget-sim", "axes-strategiques", "audit-suggestions",
    "livrables",
  ],
  MARKETING: [
    "synthese", "authenticite", "distinction", "valeur", "engagement",
    "implementation", "campaigns", "briefs", "competitors",
    "opportunities", "widgets", "signals", "budget-sim", "audit-suggestions",
  ],
  FOUNDER: [
    "synthese", "coherence", "risk", "bmf", "authenticite",
    "distinction", "valeur", "decisions", "budget-sim",
    "axes-strategiques", "kpi-dashboard", "audit-suggestions",
  ],
  MINIMAL: [
    "synthese", "coherence", "axes-strategiques", "kpi-dashboard",
  ],
};

// ============================================
// PHASE 1 — SIGNAL INTELLIGENCE SYSTEM
// ============================================

export const SIGNAL_LAYERS = ["METRIC", "STRONG", "WEAK"] as const;
export type SignalLayer = (typeof SIGNAL_LAYERS)[number];

export const SIGNAL_LAYER_LABELS: Record<SignalLayer, string> = {
  METRIC: "Métriques",
  STRONG: "Signaux forts",
  WEAK: "Signaux faibles",
};

export const SIGNAL_STATUSES: Record<SignalLayer, readonly string[]> = {
  METRIC: ["HEALTHY", "WARNING", "CRITICAL"] as const,
  STRONG: ["ACTIVE", "DECLINING", "EMERGING"] as const,
  WEAK:   ["WATCH", "PROBE", "BET"] as const,
};

export const SIGNAL_STATUS_LABELS: Record<string, string> = {
  HEALTHY: "Sain",     WARNING: "Attention",  CRITICAL: "Critique",
  ACTIVE: "Actif",     DECLINING: "Déclin",   EMERGING: "Émergent",
  WATCH: "Surveiller", PROBE: "Investiguer",  BET: "Parier",
};

export const SIGNAL_STATUS_COLORS: Record<string, string> = {
  HEALTHY: "text-emerald-600 bg-emerald-50 border-emerald-200",
  WARNING: "text-amber-600 bg-amber-50 border-amber-200",
  CRITICAL: "text-red-600 bg-red-50 border-red-200",
  ACTIVE: "text-emerald-600 bg-emerald-50 border-emerald-200",
  DECLINING: "text-red-600 bg-red-50 border-red-200",
  EMERGING: "text-blue-600 bg-blue-50 border-blue-200",
  WATCH: "text-gray-600 bg-gray-50 border-gray-200",
  PROBE: "text-amber-600 bg-amber-50 border-amber-200",
  BET: "text-purple-600 bg-purple-50 border-purple-200",
};

export const SIGNAL_CONFIDENCE = ["LOW", "MEDIUM", "HIGH"] as const;
export type SignalConfidence = (typeof SIGNAL_CONFIDENCE)[number];

// ============================================
// PHASE 1 — DECISION QUEUE
// ============================================

export const DECISION_PRIORITIES = ["P0", "P1", "P2"] as const;
export type DecisionPriority = (typeof DECISION_PRIORITIES)[number];

export const DECISION_PRIORITY_CONFIG: Record<DecisionPriority, { label: string; color: string; urgency: string }> = {
  P0: { label: "Urgent", color: "text-red-700 bg-red-100 border-red-300", urgency: "Immédiat" },
  P1: { label: "Planifié", color: "text-amber-700 bg-amber-100 border-amber-300", urgency: "Cette semaine" },
  P2: { label: "Backlog", color: "text-gray-700 bg-gray-100 border-gray-300", urgency: "Ce mois" },
};

export const DECISION_STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED", "DEFERRED"] as const;
export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export const DECISION_STATUS_LABELS: Record<DecisionStatus, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolue",
  DEFERRED: "Reportée",
};

export const DEADLINE_TYPES = ["MARKETING", "INSTITUTIONAL", "STARTUP"] as const;
export type DeadlineType = (typeof DEADLINE_TYPES)[number];

export const DEADLINE_UNIT: Record<DeadlineType, string> = {
  MARKETING: "semaines",
  INSTITUTIONAL: "mois",
  STARTUP: "jours",
};

// ============================================
// PHASE 1 — MARKET CONTEXT
// ============================================

export const OPPORTUNITY_TYPES = ["SEASONAL", "CULTURAL", "COMPETITIVE", "INTERNAL"] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  SEASONAL: "Saisonnier",
  CULTURAL: "Culturel",
  COMPETITIVE: "Concurrentiel",
  INTERNAL: "Interne",
};

export const OPPORTUNITY_TYPE_COLORS: Record<OpportunityType, string> = {
  SEASONAL: "text-amber-700 bg-amber-50 border-amber-200",
  CULTURAL: "text-purple-700 bg-purple-50 border-purple-200",
  COMPETITIVE: "text-red-700 bg-red-50 border-red-200",
  INTERNAL: "text-blue-700 bg-blue-50 border-blue-200",
};

export const IMPACT_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type ImpactLevel = (typeof IMPACT_LEVELS)[number];

export const IMPACT_LABELS: Record<ImpactLevel, string> = {
  LOW: "Faible",
  MEDIUM: "Moyen",
  HIGH: "Fort",
};

export const BUDGET_TIERS = ["MICRO", "STARTER", "IMPACT", "CAMPAIGN", "DOMINATION"] as const;
export type BudgetTierType = (typeof BUDGET_TIERS)[number];

export const BUDGET_TIER_CONFIG: Record<BudgetTierType, {
  label: string;
  range: string;
  minBudget: number;
  maxBudget: number;
  description: string;
}> = {
  MICRO:      { label: "Micro",      range: "< 2M",    minBudget: 0,          maxBudget: 2_000_000,  description: "Organique + micro-influence" },
  STARTER:    { label: "Starter",    range: "2-5M",    minBudget: 2_000_000,  maxBudget: 5_000_000,  description: "Paid social + contenu vidéo" },
  IMPACT:     { label: "Impact",     range: "5-15M",   minBudget: 5_000_000,  maxBudget: 15_000_000, description: "Hero vidéo + radio + PLV + events" },
  CAMPAIGN:   { label: "Campaign",   range: "15-35M",  minBudget: 15_000_000, maxBudget: 35_000_000, description: "TV nationale + influenceurs top + event flagship" },
  DOMINATION: { label: "Domination", range: "35-70M",  minBudget: 35_000_000, maxBudget: 70_000_000, description: "Always-on 12 mois + campagnes peak" },
};

// ============================================
// PHASE 1 — VERTICAL DICTIONARY
// ============================================

/** Transposition vocabulary per vertical: maps generic terms to vertical-specific terms */
export const VERTICAL_DICTIONARY: Record<string, Record<string, string>> = {
  FMCG:           { client: "consommateur", product: "SKU", campaign: "activation", revenue: "sell-out", competitor: "concurrent", distribution: "distribution numérique" },
  TECH:           { client: "utilisateur", product: "feature", campaign: "release", revenue: "MRR", competitor: "concurrent", distribution: "acquisition channels" },
  HEALTH_PUBLIC:  { client: "patient / bénéficiaire", product: "programme", campaign: "campagne de sensibilisation", revenue: "taux d'adoption", competitor: "comportement concurrent", distribution: "canaux de diffusion", pricing: "accessibilité" },
  INSTITUTIONAL:  { client: "citoyen / usager", product: "service public", campaign: "communication institutionnelle", revenue: "indicateur d'impact", competitor: "acteur alternatif", ROI: "retour social sur investissement" },
  CULTURE:        { client: "public", product: "œuvre", campaign: "saison", revenue: "billetterie", competitor: "concurrent culturel", distribution: "diffusion" },
  LUXURY:         { client: "client", product: "pièce", campaign: "collection", revenue: "chiffre d'affaires", competitor: "maison concurrente", distribution: "réseau sélectif" },
  NGO:            { client: "bénéficiaire", product: "programme", campaign: "campagne de mobilisation", revenue: "don / subvention", competitor: "acteur similaire", distribution: "déploiement terrain" },
};

// ============================================
// FRESHNESS THRESHOLDS per vertical (days)
// ============================================

export const FRESHNESS_THRESHOLDS: Record<string, { fresh: number; aging: number }> = {
  FMCG:           { fresh: 30,  aging: 60 },
  TECH:           { fresh: 14,  aging: 30 },
  HEALTH_PUBLIC:  { fresh: 90,  aging: 180 },
  INSTITUTIONAL:  { fresh: 90,  aging: 180 },
  CULTURE:        { fresh: 60,  aging: 120 },
  LUXURY:         { fresh: 60,  aging: 120 },
  NGO:            { fresh: 60,  aging: 120 },
  DEFAULT:        { fresh: 30,  aging: 90 },
};

// ============================================
// REPORT CONFIGURATION (Phase 3)
// ============================================

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

// ==========================================================================
// PHASE 2 — COUCHE TRADUCTION (Brief Generator + Freshness + Presets)
// ==========================================================================

// ── Brief Types ──
export const BRIEF_TYPES = [
  "CREATIVE_PLAYBOOK",
  "PRODUCTION_KIT",
  "MEDIA_MIX",
  "RP_MODULE",
  "BRAND_EXPERIENCE",
  "PACKAGING_BRIEF",
  "CHARACTER_DESIGN",
  "ENVIRONMENT_DESIGN",
  "ZONAGE_FESTIVAL",
  "SOCIAL_BRIEF",
  "ACTIVATION_TERRAIN",
  "NAMING_VERBAL",
  "CHARTE_GRAPHIQUE",
  "GTM_BRIEF",
  "PR_LAUNCH",
  "SENSIBILISATION",
  "SPONSORING_BRIEF",
  "COLLATERAL_BRIEF",
  "PHOTO_PRODUIT",
  "PLV_BRIEF",
] as const;

export type BriefType = (typeof BRIEF_TYPES)[number];

export const BRIEF_TYPE_LABELS: Record<string, string> = {
  CREATIVE_PLAYBOOK: "Creative Playbook",
  PRODUCTION_KIT: "Kit de Production",
  MEDIA_MIX: "Media Mix",
  RP_MODULE: "Module RP",
  BRAND_EXPERIENCE: "Brand Experience Guide",
  PACKAGING_BRIEF: "Brief Packaging",
  CHARACTER_DESIGN: "Character Design",
  ENVIRONMENT_DESIGN: "Environment Design",
  ZONAGE_FESTIVAL: "Zonage Festival",
  SOCIAL_BRIEF: "Brief Social Media",
  ACTIVATION_TERRAIN: "Brief Activation Terrain",
  NAMING_VERBAL: "Naming & Verbal Identity",
  CHARTE_GRAPHIQUE: "Charte Graphique",
  GTM_BRIEF: "Go-to-Market Brief",
  PR_LAUNCH: "Brief PR Lancement",
  SENSIBILISATION: "Brief Sensibilisation",
  SPONSORING_BRIEF: "Brief Sponsoring",
  COLLATERAL_BRIEF: "Brief Collatéral",
  PHOTO_PRODUIT: "Brief Photo Produit",
  PLV_BRIEF: "Brief PLV",
};

// ── Brief Source Pillars (which pillars feed which brief type) ──
export const BRIEF_SOURCE_PILLARS: Record<string, string[]> = {
  CREATIVE_PLAYBOOK: ["A", "D", "E"],
  PRODUCTION_KIT: ["D", "E"],
  MEDIA_MIX: ["E", "T"],
  RP_MODULE: ["A", "V", "E"],
  BRAND_EXPERIENCE: ["A", "D", "V", "E"],
  PACKAGING_BRIEF: ["A", "D", "V"],
  CHARACTER_DESIGN: ["A", "D"],
  ENVIRONMENT_DESIGN: ["A", "D", "V"],
  ZONAGE_FESTIVAL: ["A", "D", "E"],
  SOCIAL_BRIEF: ["A", "D", "E"],
  ACTIVATION_TERRAIN: ["E", "V"],
  NAMING_VERBAL: ["A", "D"],
  CHARTE_GRAPHIQUE: ["A", "D"],
  GTM_BRIEF: ["V", "E", "T"],
  PR_LAUNCH: ["A", "V", "E"],
  SENSIBILISATION: ["A", "V", "E"],
  SPONSORING_BRIEF: ["V", "E"],
  COLLATERAL_BRIEF: ["D", "E"],
  PHOTO_PRODUIT: ["D", "V"],
  PLV_BRIEF: ["D", "V", "E"],
};

// ── Translation Document Statuses ──
export const TRANSLATION_STATUSES = ["DRAFT", "VALIDATED", "STALE", "ARCHIVED"] as const;
export type TranslationStatus = (typeof TRANSLATION_STATUSES)[number];

// ── System Presets (brief compositions for common use cases) ──
export const SYSTEM_PRESETS: Array<{
  name: string;
  description: string;
  briefTypes: string[];
  vertical: string | null;
}> = [
  {
    name: "Campagne FMCG",
    description: "Creative Playbook, Production Kit, Media Mix, Brief activation terrain, Brief social",
    briefTypes: ["CREATIVE_PLAYBOOK", "PRODUCTION_KIT", "MEDIA_MIX", "ACTIVATION_TERRAIN", "SOCIAL_BRIEF"],
    vertical: "FMCG",
  },
  {
    name: "Identité de marque",
    description: "Brief identité visuelle, Brief naming/verbal, Brief charte graphique",
    briefTypes: ["NAMING_VERBAL", "CHARTE_GRAPHIQUE", "CHARACTER_DESIGN"],
    vertical: null,
  },
  {
    name: "Festival / Événement",
    description: "Brief identité, Brief expérience (zonage), Brief com, Brief collatéral, Brief sponsoring",
    briefTypes: ["CHARTE_GRAPHIQUE", "ZONAGE_FESTIVAL", "SOCIAL_BRIEF", "COLLATERAL_BRIEF", "SPONSORING_BRIEF"],
    vertical: "CULTURE",
  },
  {
    name: "Packaging",
    description: "Brief packaging, Brief photo produit, Brief PLV",
    briefTypes: ["PACKAGING_BRIEF", "PHOTO_PRODUIT", "PLV_BRIEF"],
    vertical: "FMCG",
  },
  {
    name: "Campagne institutionnelle",
    description: "Brief sensibilisation, Brief terrain, Media Mix, Brief RP",
    briefTypes: ["SENSIBILISATION", "ACTIVATION_TERRAIN", "MEDIA_MIX", "RP_MODULE"],
    vertical: "INSTITUTIONAL",
  },
  {
    name: "Lancement produit",
    description: "Brief identité, Brief GTM, Media Mix, Brief PR launch",
    briefTypes: ["CHARTE_GRAPHIQUE", "GTM_BRIEF", "MEDIA_MIX", "PR_LAUNCH"],
    vertical: null,
  },
];

// ── White Label Map (spec section VI — IP protection) ──
export const WHITE_LABEL_MAP: Record<string, string> = {
  "Authenticité": "Identité de marque",
  "Distinction": "Positionnement & Personas",
  "Valeur": "Offre & Proposition de valeur",
  "Engagement": "Stratégie d'engagement",
  "Risk": "Analyse de risques",
  "Track": "Validation marché",
  "Implémentation": "Plan d'action",
  "Stratégie": "Synthèse stratégique",
  "Creative Playbook": "Guide créatif",
  "Production Kit": "Kit de production",
  "RP Module": "Relations publiques",
  "Media Mix Recommender": "Plan média",
  "Brand Experience Guide": "Guide d'expérience",
  "ADVE": "Méthodologie Upgraders",
};

// ============================================
// PHASE 3 — UPGRADERS OPS CONSTANTS
// ============================================

// ── Mission Statuses ──
export const MISSION_STATUSES = [
  "INTAKE", "INTELLIGENCE", "STAFFING", "IN_PROGRESS", "REVIEW", "CLOSED", "MAINTENANCE",
] as const;
export type MissionStatus = (typeof MISSION_STATUSES)[number];

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  INTAKE: "Prise en charge",
  INTELLIGENCE: "Intelligence",
  STAFFING: "Staffing",
  IN_PROGRESS: "En cours",
  REVIEW: "Revue",
  CLOSED: "Clôturé",
  MAINTENANCE: "Maintenance",
};

export const MISSION_STATUS_COLORS: Record<MissionStatus, string> = {
  INTAKE: "text-gray-600 bg-gray-50 border-gray-200",
  INTELLIGENCE: "text-blue-600 bg-blue-50 border-blue-200",
  STAFFING: "text-purple-600 bg-purple-50 border-purple-200",
  IN_PROGRESS: "text-amber-600 bg-amber-50 border-amber-200",
  REVIEW: "text-orange-600 bg-orange-50 border-orange-200",
  CLOSED: "text-emerald-600 bg-emerald-50 border-emerald-200",
  MAINTENANCE: "text-cyan-600 bg-cyan-50 border-cyan-200",
};

// ── Mission State Machine (valid transitions) ──
export const MISSION_VALID_TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
  INTAKE: ["INTELLIGENCE"],
  INTELLIGENCE: ["STAFFING"],
  STAFFING: ["IN_PROGRESS"],
  IN_PROGRESS: ["REVIEW"],
  REVIEW: ["CLOSED", "IN_PROGRESS"],
  CLOSED: ["MAINTENANCE"],
  MAINTENANCE: ["CLOSED"],
};

// ── User Roles ──
export const USER_ROLES = [
  "ADMIN", "OPERATOR", "FREELANCE", "CLIENT_RETAINER", "CLIENT_STATIC",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  OPERATOR: "Opérateur",
  FREELANCE: "Freelance",
  CLIENT_RETAINER: "Client Retainer",
  CLIENT_STATIC: "Client Statique",
};

export const USER_ROLE_PERMISSIONS: Record<UserRole, {
  canManageMissions: boolean;
  canViewInternals: boolean;
  canAssignFreelances: boolean;
  canViewPricing: boolean;
  canCreateInterventions: boolean;
  canViewCostDashboard: boolean;
}> = {
  ADMIN:           { canManageMissions: true,  canViewInternals: true,  canAssignFreelances: true,  canViewPricing: true,  canCreateInterventions: true,  canViewCostDashboard: true },
  OPERATOR:        { canManageMissions: true,  canViewInternals: true,  canAssignFreelances: true,  canViewPricing: true,  canCreateInterventions: true,  canViewCostDashboard: true },
  FREELANCE:       { canManageMissions: false, canViewInternals: false, canAssignFreelances: false, canViewPricing: false, canCreateInterventions: false, canViewCostDashboard: false },
  CLIENT_RETAINER: { canManageMissions: false, canViewInternals: false, canAssignFreelances: false, canViewPricing: false, canCreateInterventions: true,  canViewCostDashboard: false },
  CLIENT_STATIC:   { canManageMissions: false, canViewInternals: false, canAssignFreelances: false, canViewPricing: false, canCreateInterventions: false, canViewCostDashboard: false },
};

// ── Assignment Roles ──
export const ASSIGNMENT_ROLES = [
  "DA", "CR", "STRAT", "PROD", "DEV", "MEDIA", "SOCIAL", "RP", "EVENT",
] as const;
export type AssignmentRole = (typeof ASSIGNMENT_ROLES)[number];

export const ASSIGNMENT_ROLE_LABELS: Record<AssignmentRole, string> = {
  DA: "Directeur Artistique",
  CR: "Concepteur-Rédacteur",
  STRAT: "Stratège",
  PROD: "Producteur",
  DEV: "Développeur",
  MEDIA: "Media Planner",
  SOCIAL: "Community Manager",
  RP: "Relations Publiques",
  EVENT: "Événementiel",
};

// ── Deliverable Statuses ──
export const DELIVERABLE_STATUSES = [
  "PENDING", "UPLOADED", "UNDER_REVIEW", "APPROVED", "REJECTED",
] as const;
export type DeliverableStatus = (typeof DELIVERABLE_STATUSES)[number];

// ── Intervention Types ──
export const INTERVENTION_TYPES = [
  "URGENT_CHANGE", "SCOPE_EXTENSION", "BUG_FIX", "CONTENT_UPDATE",
] as const;
export type InterventionType = (typeof INTERVENTION_TYPES)[number];

export const INTERVENTION_TYPE_LABELS: Record<InterventionType, string> = {
  URGENT_CHANGE: "Modification urgente",
  SCOPE_EXTENSION: "Extension de scope",
  BUG_FIX: "Correction",
  CONTENT_UPDATE: "Mise à jour contenu",
};

// ── Intervention Statuses ──
export const INTERVENTION_STATUSES = [
  "OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED", "REJECTED",
] as const;
export type InterventionStatus = (typeof INTERVENTION_STATUSES)[number];

// ── AI Generation Types (for cost tracking) ──
export const AI_GENERATION_TYPES = [
  "brief_generation", "report_generation", "audit_generation",
  "translation", "freetext", "intel_report",
] as const;
export type AIGenerationType = (typeof AI_GENERATION_TYPES)[number];

// ── Markets (for pricing reference) ──
export const MARKETS = ["CM", "CI", "SN", "GH", "NG"] as const;
export type Market = (typeof MARKETS)[number];

export const MARKET_LABELS: Record<Market, string> = {
  CM: "Cameroun",
  CI: "Côte d'Ivoire",
  SN: "Sénégal",
  GH: "Ghana",
  NG: "Nigeria",
};

// ── Pricing Categories ──
export const PRICING_CATEGORIES = [
  "PRODUCTION", "MEDIA", "EVENT", "TALENT", "DIGITAL",
] as const;
export type PricingCategory = (typeof PRICING_CATEGORIES)[number];

export const PRICING_CATEGORY_LABELS: Record<PricingCategory, string> = {
  PRODUCTION: "Production",
  MEDIA: "Média",
  EVENT: "Événementiel",
  TALENT: "Talent",
  DIGITAL: "Digital",
};

// ── Currency Configuration ──
export const SUPPORTED_CURRENCIES = ["XOF", "XAF", "EUR", "USD", "GHS", "NGN"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_CONFIG: Record<SupportedCurrency, {
  label: string;
  symbol: string;
  locale: string;
  position: "before" | "after";
}> = {
  XOF: { label: "Franc CFA (BCEAO)", symbol: "FCFA", locale: "fr-FR", position: "after" },
  XAF: { label: "Franc CFA (BEAC)", symbol: "FCFA", locale: "fr-FR", position: "after" },
  EUR: { label: "Euro", symbol: "€", locale: "fr-FR", position: "after" },
  USD: { label: "Dollar US", symbol: "$", locale: "en-US", position: "before" },
  GHS: { label: "Cedi ghanéen", symbol: "GH₵", locale: "en-GH", position: "before" },
  NGN: { label: "Naira nigérian", symbol: "₦", locale: "en-NG", position: "before" },
};

// Exchange rates to XOF (approximate, updatable)
export const EXCHANGE_RATES_TO_XOF: Record<SupportedCurrency, number> = {
  XOF: 1,
  XAF: 1,          // 1:1 parity between BCEAO and BEAC
  EUR: 655.957,    // Fixed CFA/EUR peg
  USD: 600,        // Approximate
  GHS: 40,         // Approximate
  NGN: 0.4,        // Approximate
};

export const EUR_TO_XOF_RATE = 655.957;
export const USD_TO_XAF_RATE = 600; // Kept for backward compat

// ── Assignment Statuses ──
export const ASSIGNMENT_STATUSES = [
  "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "DELIVERED", "REVIEWED",
] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];
