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
    color: "#10B981",
    description: "ADN de marque, Purpose, Vision, Valeurs",
  },
  D: {
    title: "Distinction",
    order: 2,
    color: "#8B5CF6",
    description: "Positionnement, Personas, Identité visuelle",
  },
  V: {
    title: "Valeur",
    order: 3,
    color: "#F59E0B",
    description: "Proposition de valeur, Pricing, Unit Economics",
  },
  E: {
    title: "Engagement",
    order: 4,
    color: "#3B82F6",
    description: "Touchpoints, Rituels, AARRR, Communauté",
  },
  R: {
    title: "Risk",
    order: 5,
    color: "#EF4444",
    description: "SWOT, Score de risque, Mitigation",
  },
  T: {
    title: "Track",
    order: 6,
    color: "#EC4899",
    description: "Validation, TAM/SAM/SOM, KPIs",
  },
  I: {
    title: "Implémentation",
    order: 7,
    color: "#06B6D4",
    description: "Roadmap 36 mois, Budget, Équipe",
  },
  S: {
    title: "Stratégie",
    order: 8,
    color: "#F97316",
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
    "kpi-dashboard", "budget-sim", "budget-operationnel", "axes-strategiques",
    "audit-suggestions", "feedback", "livrables", "glory", "quality-checklist",
  ],
  MARKETING: [
    "synthese", "authenticite", "distinction", "valeur", "engagement",
    "implementation", "campaigns", "briefs", "competitors",
    "opportunities", "widgets", "glory", "signals", "budget-sim",
    "audit-suggestions", "feedback", "big-idea-kit", "creative-strategy",
    "funnel-mapping", "partners", "chrono", "budget-operationnel",
  ],
  FOUNDER: [
    "synthese", "coherence", "risk", "bmf", "authenticite",
    "distinction", "valeur", "decisions", "budget-sim",
    "budget-operationnel", "axes-strategiques", "kpi-dashboard",
    "audit-suggestions", "feedback", "quality-checklist",
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
  WATCH: "text-muted-foreground bg-muted/50 border-border",
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
  P2: { label: "Backlog", color: "text-muted-foreground bg-muted border-border", urgency: "Ce mois" },
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
// PARAMETRIC BUDGET FORMULA — Coefficients αᵢ, βⱼ, γₖ
// ============================================
// Budget_poste_i = CA_visé × αᵢ(secteur) × βⱼ(maturité) × γₖ(environnement)
// Budget_total = Σ Budget_poste_i
// Marge_nette = CA_visé - Budget_total (si < 0 → modèle non viable)

/** Budget cost post names (9 postes universels) */
export const BUDGET_POSTS = [
  "achats",       // Achats / matières premières
  "salaires",     // Masse salariale
  "loyer",        // Loyer & locatif
  "comm",         // Communication & marketing
  "transport",    // Transport & logistique
  "energie",      // Énergie & fluides
  "admin",        // Frais généraux & admin
  "amortissement",// Amortissements
  "provisions",   // Provisions & imprévus
] as const;
export type BudgetPost = (typeof BUDGET_POSTS)[number];

export const BUDGET_POST_LABELS: Record<BudgetPost, string> = {
  achats:        "Achats & matières premières",
  salaires:      "Masse salariale",
  loyer:         "Loyer & locatif",
  comm:          "Communication & marketing",
  transport:     "Transport & logistique",
  energie:       "Énergie & fluides",
  admin:         "Frais généraux & admin",
  amortissement: "Amortissements",
  provisions:    "Provisions & imprévus",
};

/**
 * αᵢ — SECTOR COST COEFFICIENTS (% du CA par poste budgétaire)
 * Chaque secteur a ses propres ratios structurels.
 */
export type SectorCostCoefficients = Record<BudgetPost, number>;

export const SECTOR_ALPHA: Record<string, SectorCostCoefficients> = {
  // Services intellectuels (consulting, b2b-saas, creative, education)
  "consulting":    { achats: 0.02, salaires: 0.45, loyer: 0.07, comm: 0.10, transport: 0.04, energie: 0.02, admin: 0.04, amortissement: 0.03, provisions: 0.03 },
  "b2b-saas":      { achats: 0.02, salaires: 0.50, loyer: 0.04, comm: 0.20, transport: 0.01, energie: 0.08, admin: 0.06, amortissement: 0.03, provisions: 0.03 },
  "creative":      { achats: 0.05, salaires: 0.45, loyer: 0.06, comm: 0.12, transport: 0.03, energie: 0.02, admin: 0.04, amortissement: 0.03, provisions: 0.03 },
  "education":     { achats: 0.05, salaires: 0.40, loyer: 0.08, comm: 0.12, transport: 0.03, energie: 0.04, admin: 0.05, amortissement: 0.04, provisions: 0.03 },
  // Commerce & Retail
  "retail":        { achats: 0.50, salaires: 0.15, loyer: 0.10, comm: 0.05, transport: 0.07, energie: 0.03, admin: 0.04, amortissement: 0.04, provisions: 0.03 },
  "e-commerce":    { achats: 0.40, salaires: 0.18, loyer: 0.03, comm: 0.15, transport: 0.08, energie: 0.03, admin: 0.04, amortissement: 0.03, provisions: 0.03 },
  "fashion":       { achats: 0.35, salaires: 0.18, loyer: 0.10, comm: 0.12, transport: 0.05, energie: 0.02, admin: 0.04, amortissement: 0.04, provisions: 0.03 },
  "beauty":        { achats: 0.30, salaires: 0.18, loyer: 0.08, comm: 0.15, transport: 0.06, energie: 0.02, admin: 0.04, amortissement: 0.04, provisions: 0.03 },
  // Restauration & Agroalimentaire
  "food-bev":      { achats: 0.30, salaires: 0.30, loyer: 0.10, comm: 0.04, transport: 0.03, energie: 0.07, admin: 0.04, amortissement: 0.05, provisions: 0.04 },
  "hospitality":   { achats: 0.25, salaires: 0.30, loyer: 0.12, comm: 0.06, transport: 0.03, energie: 0.08, admin: 0.04, amortissement: 0.05, provisions: 0.04 },
  // Industrie & Ressources
  "manufacturing": { achats: 0.40, salaires: 0.20, loyer: 0.06, comm: 0.03, transport: 0.08, energie: 0.10, admin: 0.04, amortissement: 0.15, provisions: 0.04 },
  "mining":        { achats: 0.30, salaires: 0.20, loyer: 0.05, comm: 0.03, transport: 0.10, energie: 0.12, admin: 0.04, amortissement: 0.15, provisions: 0.05 },
  "energy":        { achats: 0.25, salaires: 0.22, loyer: 0.05, comm: 0.04, transport: 0.06, energie: 0.08, admin: 0.04, amortissement: 0.18, provisions: 0.05 },
  "construction":  { achats: 0.45, salaires: 0.22, loyer: 0.04, comm: 0.03, transport: 0.08, energie: 0.05, admin: 0.04, amortissement: 0.10, provisions: 0.05 },
  "agriculture":   { achats: 0.35, salaires: 0.22, loyer: 0.04, comm: 0.03, transport: 0.10, energie: 0.06, admin: 0.04, amortissement: 0.08, provisions: 0.05 },
  // FMCG
  "fmcg":          { achats: 0.42, salaires: 0.12, loyer: 0.05, comm: 0.12, transport: 0.15, energie: 0.06, admin: 0.04, amortissement: 0.08, provisions: 0.03 },
  // Finance & Tech
  "fintech":       { achats: 0.03, salaires: 0.45, loyer: 0.05, comm: 0.18, transport: 0.02, energie: 0.06, admin: 0.05, amortissement: 0.04, provisions: 0.04 },
  "banking":       { achats: 0.05, salaires: 0.35, loyer: 0.08, comm: 0.08, transport: 0.03, energie: 0.04, admin: 0.06, amortissement: 0.06, provisions: 0.05 },
  "mobile-money":  { achats: 0.04, salaires: 0.40, loyer: 0.04, comm: 0.15, transport: 0.02, energie: 0.06, admin: 0.05, amortissement: 0.04, provisions: 0.04 },
  // Télécoms & Infra
  "telecom":       { achats: 0.15, salaires: 0.25, loyer: 0.06, comm: 0.15, transport: 0.04, energie: 0.08, admin: 0.05, amortissement: 0.12, provisions: 0.04 },
  "logistics":     { achats: 0.15, salaires: 0.25, loyer: 0.06, comm: 0.04, transport: 0.20, energie: 0.08, admin: 0.04, amortissement: 0.10, provisions: 0.04 },
  "maritime":      { achats: 0.20, salaires: 0.22, loyer: 0.05, comm: 0.03, transport: 0.15, energie: 0.10, admin: 0.04, amortissement: 0.12, provisions: 0.05 },
  "real-estate":   { achats: 0.10, salaires: 0.18, loyer: 0.03, comm: 0.08, transport: 0.04, energie: 0.04, admin: 0.05, amortissement: 0.08, provisions: 0.04 },
  // Santé & Bien-être
  "health":        { achats: 0.20, salaires: 0.35, loyer: 0.08, comm: 0.06, transport: 0.03, energie: 0.05, admin: 0.05, amortissement: 0.06, provisions: 0.04 },
  "wellness":      { achats: 0.15, salaires: 0.30, loyer: 0.10, comm: 0.10, transport: 0.03, energie: 0.04, admin: 0.04, amortissement: 0.05, provisions: 0.03 },
  // Médias & Culture
  "media":         { achats: 0.15, salaires: 0.35, loyer: 0.06, comm: 0.10, transport: 0.04, energie: 0.04, admin: 0.04, amortissement: 0.05, provisions: 0.03 },
  "sports":        { achats: 0.15, salaires: 0.25, loyer: 0.08, comm: 0.15, transport: 0.06, energie: 0.04, admin: 0.04, amortissement: 0.05, provisions: 0.04 },
  // Secteur public & ONG
  "public":        { achats: 0.10, salaires: 0.40, loyer: 0.08, comm: 0.06, transport: 0.05, energie: 0.04, admin: 0.06, amortissement: 0.05, provisions: 0.04 },
  "ngo":           { achats: 0.10, salaires: 0.40, loyer: 0.06, comm: 0.08, transport: 0.06, energie: 0.04, admin: 0.05, amortissement: 0.04, provisions: 0.04 },
  // Fallback
  "other":         { achats: 0.20, salaires: 0.30, loyer: 0.07, comm: 0.08, transport: 0.05, energie: 0.05, admin: 0.05, amortissement: 0.05, provisions: 0.04 },
};

/** Helper: get sector alpha coefficients, falling back to "other" */
export function getSectorAlpha(sector: string | null | undefined): SectorCostCoefficients {
  return SECTOR_ALPHA[sector ?? "other"] ?? SECTOR_ALPHA["other"]!;
}

/**
 * βⱼ — MATURITY MULTIPLIERS per budget post
 * Le stade de maturité déforme les ratios de base.
 */
export interface MaturityMultipliers {
  comm: number;
  salaires: number;
  admin: number;
  provisions: number;
  achats: number;
  loyer: number;
  transport: number;
  energie: number;
  amortissement: number;
}

export const MATURITY_BETA: Record<string, MaturityMultipliers> = {
  LAUNCH:  { comm: 2.0, salaires: 0.7, admin: 1.3, provisions: 1.5, achats: 0.8, loyer: 0.8, transport: 0.9, energie: 1.0, amortissement: 0.8 },
  STARTUP: { comm: 1.5, salaires: 0.8, admin: 1.2, provisions: 1.3, achats: 0.9, loyer: 0.9, transport: 1.0, energie: 1.0, amortissement: 0.9 },
  GROWTH:  { comm: 1.2, salaires: 1.2, admin: 1.0, provisions: 1.2, achats: 1.0, loyer: 1.0, transport: 1.0, energie: 1.0, amortissement: 1.0 },
  MATURE:  { comm: 1.0, salaires: 1.0, admin: 1.0, provisions: 1.0, achats: 1.0, loyer: 1.0, transport: 1.0, energie: 1.0, amortissement: 1.0 },
  DEFAULT: { comm: 1.0, salaires: 1.0, admin: 1.0, provisions: 1.0, achats: 1.0, loyer: 1.0, transport: 1.0, energie: 1.0, amortissement: 1.0 },
};

/** Helper: get maturity beta multipliers */
export function getMaturityBeta(maturity: string | null | undefined): MaturityMultipliers {
  return MATURITY_BETA[maturity ?? "DEFAULT"] ?? MATURITY_BETA["DEFAULT"]!;
}

/**
 * γₖ — ENVIRONMENTAL CORRECTORS (West Africa / CEMAC / WAEMU)
 * Facteurs structurels qui déforment les ratios par rapport aux références occidentales.
 */
export interface EnvironmentCorrector {
  label: string;
  factor: number;
  posts: BudgetPost[];
}

export const ENVIRONMENT_GAMMA: Record<string, EnvironmentCorrector> = {
  energieInstable:     { label: "Énergie instable (groupes, onduleurs, fuel)",      factor: 1.5, posts: ["energie"] },
  logistiqueFragile:   { label: "Logistique sous-infrastructurée",                   factor: 1.4, posts: ["transport"] },
  fiscaliteInformelle: { label: "Fiscalité formelle + informelle",                   factor: 1.2, posts: ["admin"] },
  coutCapitalEleve:    { label: "Coût du capital élevé (taux CEMAC 8-15%)",          factor: 1.3, posts: ["amortissement", "provisions"] },
  mainOeuvreRare:      { label: "Main d'œuvre qualifiée rare et sur-sollicitée",     factor: 1.3, posts: ["salaires"] },
  digitalMoinsCher:    { label: "Digital moins cher (CPM/CPC/influence bas)",         factor: 0.7, posts: ["comm"] },
  immobilierBas:       { label: "Immobilier bureau accessible",                      factor: 0.6, posts: ["loyer"] },
};

/** Default set of γ corrections for West Africa */
export const DEFAULT_GAMMA_PROFILE = [
  "energieInstable", "logistiqueFragile", "fiscaliteInformelle",
  "coutCapitalEleve", "mainOeuvreRare", "digitalMoinsCher", "immobilierBas",
] as const;

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
  INTAKE: "text-muted-foreground bg-muted/50 border-border",
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

// ============================================
// LA GUILDE — Talent Marketplace Constants
// ============================================

// ── Talent Categories ──
export const TALENT_CATEGORIES = ["CORE", "EXTENDED", "RESEAU"] as const;
export type TalentCategory = (typeof TALENT_CATEGORIES)[number];
export const TALENT_CATEGORY_LABELS: Record<TalentCategory, string> = {
  CORE: "Core (Freelances individuels)",
  EXTENDED: "Extended (Agences partenaires)",
  RESEAU: "Réseau (Prestataires spécialisés)",
};

// ── Talent Levels (progression) ──
export const TALENT_LEVELS = ["NOVICE", "COMPETENT", "CONFIRMED", "EXPERT", "LEGEND"] as const;
export type TalentLevel = (typeof TALENT_LEVELS)[number];
export const TALENT_LEVEL_LABELS: Record<TalentLevel, string> = {
  NOVICE: "Novice",
  COMPETENT: "Compétent",
  CONFIRMED: "Confirmé",
  EXPERT: "Expert",
  LEGEND: "Légende",
};

// Seuils de progression par niveau
export const TALENT_LEVEL_CONFIG: Record<TalentLevel, {
  minMissions: number;
  minAvgScore: number;
  color: string;
  emoji: string;
}> = {
  NOVICE:    { minMissions: 0,  minAvgScore: 0,   color: "#94A3B8", emoji: "🌱" },
  COMPETENT: { minMissions: 3,  minAvgScore: 3.0, color: "#10B981", emoji: "⚡" },
  CONFIRMED: { minMissions: 8,  minAvgScore: 3.5, color: "#3B82F6", emoji: "🎯" },
  EXPERT:    { minMissions: 15, minAvgScore: 4.0, color: "#8B5CF6", emoji: "🔥" },
  LEGEND:    { minMissions: 30, minAvgScore: 4.5, color: "#F43F5E", emoji: "👑" },
};

// ── Talent Availability ──
export const TALENT_AVAILABILITY = ["AVAILABLE", "PARTIAL", "BUSY", "UNAVAILABLE"] as const;
export type TalentAvailability = (typeof TALENT_AVAILABILITY)[number];
export const TALENT_AVAILABILITY_LABELS: Record<TalentAvailability, string> = {
  AVAILABLE: "Disponible",
  PARTIAL: "Partiellement dispo",
  BUSY: "Occupé",
  UNAVAILABLE: "Indisponible",
};

// ── Talent Specializations ──
export const TALENT_SPECIALIZATIONS = [
  "BRAND_STRATEGY", "CREATIVE_DIRECTION", "COPYWRITING", "GRAPHIC_DESIGN",
  "MOTION_DESIGN", "WEB_DEVELOPMENT", "SOCIAL_MEDIA", "MEDIA_PLANNING",
  "PR_COMMUNICATION", "EVENT_MANAGEMENT", "PHOTOGRAPHY", "VIDEO_PRODUCTION",
  "UX_UI_DESIGN", "SEO_SEA", "DATA_ANALYTICS", "ILLUSTRATION",
  "PACKAGING_DESIGN", "SOUND_DESIGN", "TRANSLATION", "PROJECT_MANAGEMENT",
] as const;
export type TalentSpecialization = (typeof TALENT_SPECIALIZATIONS)[number];
export const TALENT_SPECIALIZATION_LABELS: Record<TalentSpecialization, string> = {
  BRAND_STRATEGY: "Stratégie de marque",
  CREATIVE_DIRECTION: "Direction artistique",
  COPYWRITING: "Conception-rédaction",
  GRAPHIC_DESIGN: "Design graphique",
  MOTION_DESIGN: "Motion design",
  WEB_DEVELOPMENT: "Développement web",
  SOCIAL_MEDIA: "Social media",
  MEDIA_PLANNING: "Média planning",
  PR_COMMUNICATION: "Relations publiques",
  EVENT_MANAGEMENT: "Événementiel",
  PHOTOGRAPHY: "Photographie",
  VIDEO_PRODUCTION: "Production vidéo",
  UX_UI_DESIGN: "UX/UI Design",
  SEO_SEA: "SEO / SEA",
  DATA_ANALYTICS: "Data & Analytics",
  ILLUSTRATION: "Illustration",
  PACKAGING_DESIGN: "Design packaging",
  SOUND_DESIGN: "Sound design",
  TRANSLATION: "Traduction",
  PROJECT_MANAGEMENT: "Gestion de projet",
};

// ── Review Dimensions ──
export const REVIEW_DIMENSIONS = [
  "qualityScore", "communicationScore", "deadlinesScore",
  "creativityScore", "autonomyScore",
] as const;
export type ReviewDimension = (typeof REVIEW_DIMENSIONS)[number];
export const REVIEW_DIMENSION_LABELS: Record<ReviewDimension, string> = {
  qualityScore: "Qualité",
  communicationScore: "Communication",
  deadlinesScore: "Respect des délais",
  creativityScore: "Créativité",
  autonomyScore: "Autonomie",
};

// ============================================
// SÉRÉNITÉ — Finance & Admin Constants
// ============================================

// ── Invoice Types ──
export const INVOICE_TYPES = ["DEVIS", "FACTURE", "AVOIR"] as const;
export type InvoiceType = (typeof INVOICE_TYPES)[number];
export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  DEVIS: "Devis",
  FACTURE: "Facture",
  AVOIR: "Avoir",
};

// ── Invoice Statuses ──
export const INVOICE_STATUSES = [
  "DRAFT", "SENT", "ACCEPTED", "PAID", "OVERDUE", "CANCELLED",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  ACCEPTED: "Acceptée",
  PAID: "Payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
};

// ── Contract Types ──
export const CONTRACT_TYPES = ["NDA", "PRESTATION", "CESSION_DROITS", "PORTAGE"] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];
export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  NDA: "Accord de confidentialité",
  PRESTATION: "Contrat de prestation",
  CESSION_DROITS: "Cession de droits",
  PORTAGE: "Convention de portage",
};

// ── Contract Statuses ──
export const CONTRACT_STATUSES = [
  "DRAFT", "SENT", "SIGNED", "ACTIVE", "EXPIRED", "TERMINATED",
] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  SIGNED: "Signé",
  ACTIVE: "Actif",
  EXPIRED: "Expiré",
  TERMINATED: "Résilié",
};

// ── Escrow Statuses ──
export const ESCROW_STATUSES = [
  "PENDING", "HELD", "PARTIALLY_RELEASED", "RELEASED", "REFUNDED",
] as const;
export type EscrowStatus = (typeof ESCROW_STATUSES)[number];
export const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  PENDING: "En attente",
  HELD: "Séquestré",
  PARTIALLY_RELEASED: "Partiellement libéré",
  RELEASED: "Libéré",
  REFUNDED: "Remboursé",
};

// ── Commission Statuses ──
export const COMMISSION_STATUSES = ["CALCULATED", "INVOICED", "PAID"] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

// ── Commission Rates by Talent Level ──
// Le taux de commission diminue avec le niveau (récompense la fidélité)
export const COMMISSION_RATES: Record<TalentLevel, number> = {
  NOVICE: 0.25,     // 25%
  COMPETENT: 0.20,  // 20%
  CONFIRMED: 0.17,  // 17%
  EXPERT: 0.15,     // 15%
  LEGEND: 0.12,     // 12%
};

// =============================================================================
// CRM PIPELINE CONSTANTS
// =============================================================================

export const PIPELINE_STAGES = [
  "DECOUVERTE", "QUALIFICATION", "PROPOSITION", "NEGOCIATION", "GAGNE", "PERDU",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  DECOUVERTE: "Découverte",
  QUALIFICATION: "Qualification",
  PROPOSITION: "Proposition",
  NEGOCIATION: "Négociation",
  GAGNE: "Gagné",
  PERDU: "Perdu",
};

export const PIPELINE_STAGE_COLORS: Record<PipelineStage, string> = {
  DECOUVERTE: "text-sky-600 bg-sky-50 border-sky-200",
  QUALIFICATION: "text-violet-600 bg-violet-50 border-violet-200",
  PROPOSITION: "text-amber-600 bg-amber-50 border-amber-200",
  NEGOCIATION: "text-orange-600 bg-orange-50 border-orange-200",
  GAGNE: "text-emerald-600 bg-emerald-50 border-emerald-200",
  PERDU: "text-red-600 bg-red-50 border-red-200",
};

/** Default probability per stage */
export const PIPELINE_STAGE_PROBABILITY: Record<PipelineStage, number> = {
  DECOUVERTE: 10,
  QUALIFICATION: 30,
  PROPOSITION: 50,
  NEGOCIATION: 70,
  GAGNE: 100,
  PERDU: 0,
};

export const PIPELINE_VALID_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  DECOUVERTE: ["QUALIFICATION", "PERDU"],
  QUALIFICATION: ["PROPOSITION", "DECOUVERTE", "PERDU"],
  PROPOSITION: ["NEGOCIATION", "QUALIFICATION", "PERDU"],
  NEGOCIATION: ["GAGNE", "PROPOSITION", "PERDU"],
  GAGNE: [],
  PERDU: ["DECOUVERTE"],
};

export const DEAL_SOURCES = [
  "referral", "inbound", "cold_outreach", "event", "partner", "upsell",
] as const;
export type DealSource = (typeof DEAL_SOURCES)[number];

export const DEAL_SOURCE_LABELS: Record<DealSource, string> = {
  referral: "Recommandation",
  inbound: "Inbound",
  cold_outreach: "Prospection",
  event: "Événement",
  partner: "Partenaire",
  upsell: "Upsell",
};

// =============================================================================
// AMBASSADOR PROGRAM (Phase 9 — Programme Apôtres)
// =============================================================================

export const AMBASSADOR_TIERS = [
  "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND",
] as const;
export type AmbassadorTier = (typeof AMBASSADOR_TIERS)[number];

export const AMBASSADOR_TIER_LABELS: Record<AmbassadorTier, string> = {
  BRONZE: "Bronze",
  SILVER: "Argent",
  GOLD: "Or",
  PLATINUM: "Platine",
  DIAMOND: "Diamant",
};

export const AMBASSADOR_TIER_COLORS: Record<AmbassadorTier, string> = {
  BRONZE: "bg-orange-50 text-orange-700 border-orange-200",
  SILVER: "bg-slate-50 text-slate-600 border-slate-200",
  GOLD: "bg-amber-50 text-amber-700 border-amber-200",
  PLATINUM: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DIAMOND: "bg-violet-50 text-violet-700 border-violet-200",
};

/** Points required to reach each tier */
export const AMBASSADOR_TIER_THRESHOLDS: Record<AmbassadorTier, number> = {
  BRONZE: 0,
  SILVER: 100,
  GOLD: 500,
  PLATINUM: 2000,
  DIAMOND: 10000,
};

export const AMBASSADOR_STATUSES = [
  "INVITED", "ACTIVE", "PAUSED", "CHURNED",
] as const;
export type AmbassadorStatus = (typeof AMBASSADOR_STATUSES)[number];

export const AMBASSADOR_STATUS_LABELS: Record<AmbassadorStatus, string> = {
  INVITED: "Invité",
  ACTIVE: "Actif",
  PAUSED: "En pause",
  CHURNED: "Inactif",
};

// =============================================================================
// PUBLICATIONS (Phase 9 — Editorial Calendar)
// =============================================================================

export const PUBLICATION_STATUSES = [
  "IDEA", "DRAFT", "REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "ARCHIVED",
] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  IDEA: "Idée",
  DRAFT: "Brouillon",
  REVIEW: "En revue",
  APPROVED: "Approuvé",
  SCHEDULED: "Planifié",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

export const PUBLICATION_STATUS_COLORS: Record<PublicationStatus, string> = {
  IDEA: "bg-slate-50 text-slate-600 border-slate-200",
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
  REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SCHEDULED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PUBLISHED: "bg-green-50 text-green-700 border-green-200",
  ARCHIVED: "bg-gray-50 text-gray-500 border-gray-200",
};

export const CONTENT_TYPES = [
  "POST", "STORY", "REEL", "ARTICLE", "NEWSLETTER", "VIDEO", "PODCAST", "EVENT",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  POST: "Post",
  STORY: "Story",
  REEL: "Reel",
  ARTICLE: "Article",
  NEWSLETTER: "Newsletter",
  VIDEO: "Vidéo",
  PODCAST: "Podcast",
  EVENT: "Événement",
};

export const PUB_CHANNELS = [
  "INSTAGRAM", "FACEBOOK", "LINKEDIN", "TWITTER", "TIKTOK", "YOUTUBE", "BLOG", "EMAIL",
] as const;
export type PubChannel = (typeof PUB_CHANNELS)[number];

export const PUB_CHANNEL_LABELS: Record<PubChannel, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  TWITTER: "X (Twitter)",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  BLOG: "Blog",
  EMAIL: "Email",
};

export const PUB_CHANNEL_COLORS: Record<PubChannel, string> = {
  INSTAGRAM: "#E4405F",
  FACEBOOK: "#1877F2",
  LINKEDIN: "#0A66C2",
  TWITTER: "#000000",
  TIKTOK: "#00F2EA",
  YOUTUBE: "#FF0000",
  BLOG: "#6366F1",
  EMAIL: "#059669",
};

// =============================================================================
// MESSAGING (Phase 9 — Messagerie)
// =============================================================================

export const CONVERSATION_TYPES = [
  "DIRECT", "GROUP", "STRATEGY", "MISSION",
] as const;
export type ConversationType = (typeof CONVERSATION_TYPES)[number];

export const MESSAGE_TYPES = [
  "TEXT", "FILE", "SYSTEM", "ACTION",
] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

// =============================================================================
// MESTOR AI (Phase 10 — AI Strategic Advisor)
// =============================================================================

export const MESTOR_ROLES = ["user", "assistant", "system"] as const;
export type MestorRole = (typeof MESTOR_ROLES)[number];

// =============================================================================
// COHORT ANALYSIS (Phase 10 — Retention & LTV)
// =============================================================================

export const COHORT_PERIOD_TYPES = [
  "WEEKLY", "MONTHLY", "QUARTERLY",
] as const;
export type CohortPeriodType = (typeof COHORT_PERIOD_TYPES)[number];

// =============================================================================
// ATTRIBUTION (Phase 10 — Channel Attribution)
// =============================================================================

export const ATTRIBUTION_MODELS = [
  "FIRST_TOUCH", "LAST_TOUCH", "LINEAR", "TIME_DECAY", "POSITION",
] as const;
export type AttributionModel = (typeof ATTRIBUTION_MODELS)[number];

export const ATTRIBUTION_MODEL_LABELS: Record<AttributionModel, string> = {
  FIRST_TOUCH: "Premier contact",
  LAST_TOUCH: "Dernier contact",
  LINEAR: "Linéaire",
  TIME_DECAY: "Décroissance temporelle",
  POSITION: "Positionnel",
};

export const ATTRIBUTION_EVENT_TYPES = [
  "IMPRESSION", "CLICK", "ENGAGEMENT", "CONVERSION", "REVENUE",
] as const;
export type AttributionEventType = (typeof ATTRIBUTION_EVENT_TYPES)[number];

export const ATTRIBUTION_CHANNELS = [
  "INSTAGRAM", "FACEBOOK", "GOOGLE_ADS", "LINKEDIN", "TIKTOK",
  "YOUTUBE", "ORGANIC_SEARCH", "EMAIL", "EVENT", "REFERRAL",
  "DIRECT", "INFLUENCER", "PR",
] as const;
export type AttributionChannel = (typeof ATTRIBUTION_CHANNELS)[number];

export const ATTRIBUTION_CHANNEL_LABELS: Record<AttributionChannel, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  GOOGLE_ADS: "Google Ads",
  LINKEDIN: "LinkedIn",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  ORGANIC_SEARCH: "Recherche organique",
  EMAIL: "Email",
  EVENT: "Événement",
  REFERRAL: "Recommandation",
  DIRECT: "Direct",
  INFLUENCER: "Influenceur",
  PR: "Relations presse",
};

export const ATTRIBUTION_CHANNEL_COLORS: Record<AttributionChannel, string> = {
  INSTAGRAM: "#E4405F",
  FACEBOOK: "#1877F2",
  GOOGLE_ADS: "#4285F4",
  LINKEDIN: "#0A66C2",
  TIKTOK: "#00F2EA",
  YOUTUBE: "#FF0000",
  ORGANIC_SEARCH: "#34A853",
  EMAIL: "#059669",
  EVENT: "#F59E0B",
  REFERRAL: "#8B5CF6",
  DIRECT: "#6B7280",
  INFLUENCER: "#EC4899",
  PR: "#14B8A6",
};

// =============================================================================
// BRAND VAULT (Phase 10 — Brand Asset Library)
// =============================================================================

export const ASSET_CATEGORIES = [
  "LOGO", "TYPOGRAPHY", "COLOR_PALETTE", "GUIDELINE", "TEMPLATE",
  "PHOTO", "VIDEO", "ILLUSTRATION", "ICON", "DOCUMENT", "OTHER",
] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  LOGO: "Logo",
  TYPOGRAPHY: "Typographie",
  COLOR_PALETTE: "Palette couleurs",
  GUIDELINE: "Charte graphique",
  TEMPLATE: "Template",
  PHOTO: "Photo",
  VIDEO: "Vidéo",
  ILLUSTRATION: "Illustration",
  ICON: "Icône",
  DOCUMENT: "Document",
  OTHER: "Autre",
};

export const ASSET_STATUSES = [
  "ACTIVE", "ARCHIVED", "DEPRECATED",
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

// =============================================================================
// CAMPAIGN MANAGER (360° Campaign Ops)
// =============================================================================

// ── Campaign Status Machine ──
export const CAMPAIGN_STATUSES = [
  "BRIEF_DRAFT", "BRIEF_VALIDATED", "PLANNING", "CREATIVE_DEV",
  "PRODUCTION", "PRE_PRODUCTION", "APPROVAL", "READY_TO_LAUNCH",
  "LIVE", "POST_CAMPAIGN", "ARCHIVED", "CANCELLED",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  BRIEF_DRAFT: "Brouillon Brief",
  BRIEF_VALIDATED: "Brief Validé",
  PLANNING: "Planification",
  CREATIVE_DEV: "Développement Créatif",
  PRODUCTION: "Production",
  PRE_PRODUCTION: "Pré-Production",
  APPROVAL: "Validation Client",
  READY_TO_LAUNCH: "Prêt au Lancement",
  LIVE: "En Cours",
  POST_CAMPAIGN: "Post-Campagne",
  ARCHIVED: "Archivée",
  CANCELLED: "Annulée",
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  BRIEF_DRAFT: "text-gray-600 bg-gray-50 border-gray-200",
  BRIEF_VALIDATED: "text-blue-600 bg-blue-50 border-blue-200",
  PLANNING: "text-indigo-600 bg-indigo-50 border-indigo-200",
  CREATIVE_DEV: "text-purple-600 bg-purple-50 border-purple-200",
  PRODUCTION: "text-orange-600 bg-orange-50 border-orange-200",
  PRE_PRODUCTION: "text-amber-600 bg-amber-50 border-amber-200",
  APPROVAL: "text-yellow-600 bg-yellow-50 border-yellow-200",
  READY_TO_LAUNCH: "text-lime-600 bg-lime-50 border-lime-200",
  LIVE: "text-green-600 bg-green-50 border-green-200",
  POST_CAMPAIGN: "text-teal-600 bg-teal-50 border-teal-200",
  ARCHIVED: "text-slate-600 bg-slate-50 border-slate-200",
  CANCELLED: "text-red-600 bg-red-50 border-red-200",
};

export const CAMPAIGN_VALID_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  BRIEF_DRAFT: ["BRIEF_VALIDATED", "CANCELLED"],
  BRIEF_VALIDATED: ["PLANNING", "BRIEF_DRAFT", "CANCELLED"],
  PLANNING: ["CREATIVE_DEV", "BRIEF_VALIDATED", "CANCELLED"],
  CREATIVE_DEV: ["PRODUCTION", "PLANNING", "CANCELLED"],
  PRODUCTION: ["PRE_PRODUCTION", "CREATIVE_DEV", "CANCELLED"],
  PRE_PRODUCTION: ["APPROVAL", "PRODUCTION"],
  APPROVAL: ["READY_TO_LAUNCH", "CREATIVE_DEV", "PRODUCTION"],
  READY_TO_LAUNCH: ["LIVE", "APPROVAL"],
  LIVE: ["POST_CAMPAIGN"],
  POST_CAMPAIGN: ["ARCHIVED"],
  ARCHIVED: [],
  CANCELLED: ["BRIEF_DRAFT"],
};

// ── Campaign Types ──
export const CAMPAIGN_TYPES = [
  "LAUNCH", "RECURRING", "EVENT", "ACTIVATION", "INSTITUTIONAL", "TACTICAL",
] as const;
export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  LAUNCH: "Lancement",
  RECURRING: "Récurrente",
  EVENT: "Événementielle",
  ACTIVATION: "Activation",
  INSTITUTIONAL: "Institutionnelle",
  TACTICAL: "Tactique",
};

export const CAMPAIGN_TYPE_COLORS: Record<CampaignType, string> = {
  LAUNCH: "text-emerald-700 bg-emerald-50 border-emerald-200",
  RECURRING: "text-blue-700 bg-blue-50 border-blue-200",
  EVENT: "text-purple-700 bg-purple-50 border-purple-200",
  ACTIVATION: "text-orange-700 bg-orange-50 border-orange-200",
  INSTITUTIONAL: "text-slate-700 bg-slate-50 border-slate-200",
  TACTICAL: "text-amber-700 bg-amber-50 border-amber-200",
};

// ── Action Lines (ATL / BTL / TTL) ──
export const ACTION_LINES = ["ATL", "BTL", "TTL"] as const;
export type ActionLine = (typeof ACTION_LINES)[number];

export const ACTION_LINE_LABELS: Record<ActionLine, string> = {
  ATL: "Above The Line",
  BTL: "Below The Line",
  TTL: "Through The Line",
};

export const ATL_TYPES = [
  "TV", "RADIO", "CINEMA", "PRESSE", "AFFICHAGE", "OOH",
] as const;
export type ATLType = (typeof ATL_TYPES)[number];

export const ATL_TYPE_LABELS: Record<ATLType, string> = {
  TV: "Télévision",
  RADIO: "Radio",
  CINEMA: "Cinéma",
  PRESSE: "Presse",
  AFFICHAGE: "Affichage",
  OOH: "Out Of Home",
};

export const BTL_TYPES = [
  "PLV", "STREET_MARKETING", "EVENEMENTIEL", "SAMPLING", "MERCHANDISING", "SPONSORING", "DIRECT_MAIL",
] as const;
export type BTLType = (typeof BTL_TYPES)[number];

export const BTL_TYPE_LABELS: Record<BTLType, string> = {
  PLV: "PLV",
  STREET_MARKETING: "Street Marketing",
  EVENEMENTIEL: "Événementiel",
  SAMPLING: "Sampling",
  MERCHANDISING: "Merchandising",
  SPONSORING: "Sponsoring",
  DIRECT_MAIL: "Mailing Direct",
};

export const TTL_TYPES = [
  "DIGITAL", "SOCIAL_MEDIA", "CRM", "EMAILING", "SEO", "SEA", "DISPLAY", "INFLUENCER", "CONTENT_MARKETING",
] as const;
export type TTLType = (typeof TTL_TYPES)[number];

export const TTL_TYPE_LABELS: Record<TTLType, string> = {
  DIGITAL: "Digital",
  SOCIAL_MEDIA: "Réseaux Sociaux",
  CRM: "CRM",
  EMAILING: "Emailing",
  SEO: "SEO",
  SEA: "SEA",
  DISPLAY: "Display",
  INFLUENCER: "Influenceur",
  CONTENT_MARKETING: "Content Marketing",
};

// ── Action Statuses ──
export const CAMPAIGN_ACTION_STATUSES = [
  "PLANNED", "BRIEFED", "IN_PRODUCTION", "READY", "ACTIVE", "COMPLETED", "CANCELLED",
] as const;
export type CampaignActionStatus = (typeof CAMPAIGN_ACTION_STATUSES)[number];

export const CAMPAIGN_ACTION_STATUS_LABELS: Record<CampaignActionStatus, string> = {
  PLANNED: "Planifié",
  BRIEFED: "Briefé",
  IN_PRODUCTION: "En Production",
  READY: "Prêt",
  ACTIVE: "Actif",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

// ── Execution Types ──
export const EXECUTION_TYPES = [
  "OOH", "POINT_DE_CONTACT", "DECLINAISON", "PLV", "PACKAGING",
  "PRINT", "VIDEO_PROD", "PHOTO_PROD", "WEB_DEV", "APP_DEV",
  "SIGNAGE", "STAND", "VEHICULE_WRAP",
] as const;
export type ExecutionType = (typeof EXECUTION_TYPES)[number];

export const EXECUTION_TYPE_LABELS: Record<ExecutionType, string> = {
  OOH: "Out Of Home",
  POINT_DE_CONTACT: "Point de Contact",
  DECLINAISON: "Déclinaison",
  PLV: "PLV",
  PACKAGING: "Packaging",
  PRINT: "Print",
  VIDEO_PROD: "Production Vidéo",
  PHOTO_PROD: "Production Photo",
  WEB_DEV: "Développement Web",
  APP_DEV: "Développement App",
  SIGNAGE: "Signalétique",
  STAND: "Stand",
  VEHICULE_WRAP: "Habillage Véhicule",
};

// ── Execution Statuses (production pipeline) ──
export const EXECUTION_STATUSES = [
  "DEVIS", "BAT", "EN_PRODUCTION", "LIVRAISON", "INSTALLE", "TERMINE",
] as const;
export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];

export const EXECUTION_STATUS_LABELS: Record<ExecutionStatus, string> = {
  DEVIS: "Devis",
  BAT: "BAT",
  EN_PRODUCTION: "En Production",
  LIVRAISON: "Livraison",
  INSTALLE: "Installé",
  TERMINE: "Terminé",
};

export const EXECUTION_VALID_TRANSITIONS: Record<ExecutionStatus, ExecutionStatus[]> = {
  DEVIS: ["BAT"],
  BAT: ["EN_PRODUCTION", "DEVIS"],
  EN_PRODUCTION: ["LIVRAISON", "BAT"],
  LIVRAISON: ["INSTALLE", "TERMINE"],
  INSTALLE: ["TERMINE"],
  TERMINE: [],
};

export const EXECUTION_STATUS_COLORS: Record<ExecutionStatus, string> = {
  DEVIS: "text-slate-500",
  BAT: "text-blue-500",
  EN_PRODUCTION: "text-amber-500",
  LIVRAISON: "text-indigo-500",
  INSTALLE: "text-emerald-500",
  TERMINE: "text-green-600",
};

// ── Amplification Media Types ──
export const AMPLIFICATION_MEDIA_TYPES = [
  "TV_SPOT", "RADIO_SPOT", "PRESSE_INSERTION", "DIGITAL_AD", "SOCIAL_AD",
  "OOH_BUY", "CINEMA_SPOT", "PROGRAMMATIC", "NATIVE_AD", "PODCAST_AD", "INFLUENCER_POST",
] as const;
export type AmplificationMediaType = (typeof AMPLIFICATION_MEDIA_TYPES)[number];

export const AMPLIFICATION_MEDIA_TYPE_LABELS: Record<AmplificationMediaType, string> = {
  TV_SPOT: "Spot TV",
  RADIO_SPOT: "Spot Radio",
  PRESSE_INSERTION: "Insertion Presse",
  DIGITAL_AD: "Publicité Digitale",
  SOCIAL_AD: "Social Ads",
  OOH_BUY: "Achat OOH",
  CINEMA_SPOT: "Spot Cinéma",
  PROGRAMMATIC: "Programmatique",
  NATIVE_AD: "Native Ad",
  PODCAST_AD: "Podcast Ad",
  INFLUENCER_POST: "Post Influenceur",
};

export const AMPLIFICATION_STATUSES = [
  "PLANNED", "BOOKED", "CONFIRMED", "LIVE", "COMPLETED", "CANCELLED",
] as const;
export type AmplificationStatus = (typeof AMPLIFICATION_STATUSES)[number];

export const AMPLIFICATION_STATUS_LABELS: Record<AmplificationStatus, string> = {
  PLANNED: "Planifié",
  BOOKED: "Réservé",
  CONFIRMED: "Confirmé",
  LIVE: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

export const AMPLIFICATION_STATUS_COLORS: Record<AmplificationStatus, string> = {
  PLANNED: "text-slate-500",
  BOOKED: "text-blue-500",
  CONFIRMED: "text-indigo-500",
  LIVE: "text-emerald-500",
  COMPLETED: "text-green-600",
  CANCELLED: "text-red-500",
};

// ── Campaign Budget Categories ──
export const CAMPAIGN_BUDGET_CATEGORIES = [
  "PRODUCTION", "MEDIA", "TALENT", "LOGISTICS", "TECHNOLOGY", "LEGAL", "CONTINGENCY", "AGENCY_FEE",
] as const;
export type CampaignBudgetCategory = (typeof CAMPAIGN_BUDGET_CATEGORIES)[number];

export const CAMPAIGN_BUDGET_CATEGORY_LABELS: Record<CampaignBudgetCategory, string> = {
  PRODUCTION: "Production",
  MEDIA: "Média",
  TALENT: "Talent",
  LOGISTICS: "Logistique",
  TECHNOLOGY: "Technologie",
  LEGAL: "Juridique",
  CONTINGENCY: "Contingence",
  AGENCY_FEE: "Honoraires Agence",
};

// ── Campaign Approval Types ──
export const CAMPAIGN_APPROVAL_TYPES = [
  "BRIEF", "CREATIVE_CONCEPT", "KEY_VISUAL", "COPY", "BAT", "MEDIA_PLAN", "BUDGET", "FINAL_DELIVERY", "LAUNCH",
] as const;
export type CampaignApprovalType = (typeof CAMPAIGN_APPROVAL_TYPES)[number];

export const CAMPAIGN_APPROVAL_TYPE_LABELS: Record<CampaignApprovalType, string> = {
  BRIEF: "Brief",
  CREATIVE_CONCEPT: "Concept Créatif",
  KEY_VISUAL: "Key Visual",
  COPY: "Copie / Texte",
  BAT: "Bon à Tirer",
  MEDIA_PLAN: "Plan Média",
  BUDGET: "Budget",
  FINAL_DELIVERY: "Livraison Finale",
  LAUNCH: "Lancement",
};

export const CAMPAIGN_APPROVAL_STATUSES = [
  "PENDING", "APPROVED", "REJECTED", "REVISION_REQUESTED",
] as const;
export type CampaignApprovalStatus = (typeof CAMPAIGN_APPROVAL_STATUSES)[number];

// ── Campaign Team Roles ──
export const CAMPAIGN_TEAM_ROLES = [
  "CAMPAIGN_DIRECTOR", "CREATIVE_DIRECTOR", "ART_DIRECTOR", "COPYWRITER",
  "STRATEGIST", "MEDIA_PLANNER", "MEDIA_BUYER", "PRODUCER", "DEVELOPER",
  "COMMUNITY_MANAGER", "PROJECT_MANAGER", "CLIENT_LEAD", "EXTERNAL_VENDOR",
] as const;
export type CampaignTeamRole = (typeof CAMPAIGN_TEAM_ROLES)[number];

export const CAMPAIGN_TEAM_ROLE_LABELS: Record<CampaignTeamRole, string> = {
  CAMPAIGN_DIRECTOR: "Directeur de Campagne",
  CREATIVE_DIRECTOR: "Directeur de Création",
  ART_DIRECTOR: "Directeur Artistique",
  COPYWRITER: "Concepteur-Rédacteur",
  STRATEGIST: "Stratège",
  MEDIA_PLANNER: "Média Planner",
  MEDIA_BUYER: "Acheteur Média",
  PRODUCER: "Producteur",
  DEVELOPER: "Développeur",
  COMMUNITY_MANAGER: "Community Manager",
  PROJECT_MANAGER: "Chef de Projet",
  CLIENT_LEAD: "Responsable Client",
  EXTERNAL_VENDOR: "Prestataire Externe",
};

// ── Campaign Brief Types ──
export const CAMPAIGN_BRIEF_TYPES = [
  "CREATIVE", "MEDIA", "PRODUCTION", "VENDOR", "EVENT", "DIGITAL", "RP",
] as const;
export type CampaignBriefType = (typeof CAMPAIGN_BRIEF_TYPES)[number];

export const CAMPAIGN_BRIEF_TYPE_LABELS: Record<CampaignBriefType, string> = {
  CREATIVE: "Brief Créatif",
  MEDIA: "Brief Média",
  PRODUCTION: "Brief Production",
  VENDOR: "Brief Prestataire",
  EVENT: "Brief Événementiel",
  DIGITAL: "Brief Digital",
  RP: "Brief Relations Presse",
};

// ── Campaign Report Types ──
export const CAMPAIGN_REPORT_TYPES = [
  "WEEKLY_STATUS", "MONTHLY_STATUS", "MID_CAMPAIGN", "POST_CAMPAIGN",
  "ROI_ANALYSIS", "MEDIA_PERFORMANCE", "CREATIVE_PERFORMANCE",
] as const;
export type CampaignReportType = (typeof CAMPAIGN_REPORT_TYPES)[number];

export const CAMPAIGN_REPORT_TYPE_LABELS: Record<CampaignReportType, string> = {
  WEEKLY_STATUS: "Rapport Hebdomadaire",
  MONTHLY_STATUS: "Rapport Mensuel",
  MID_CAMPAIGN: "Bilan Mi-Campagne",
  POST_CAMPAIGN: "Bilan Post-Campagne",
  ROI_ANALYSIS: "Analyse ROI",
  MEDIA_PERFORMANCE: "Performance Média",
  CREATIVE_PERFORMANCE: "Performance Créative",
};

// ── Campaign Asset Types ──
export const CAMPAIGN_ASSET_TYPES = [
  "KEY_VISUAL", "VIDEO", "AUDIO", "PRINT", "DIGITAL_BANNER", "SOCIAL_POST",
  "PACKAGING", "PLV", "DOCUMENT", "SCRIPT", "STORYBOARD", "MOODBOARD",
] as const;
export type CampaignAssetType = (typeof CAMPAIGN_ASSET_TYPES)[number];

export const CAMPAIGN_ASSET_TYPE_LABELS: Record<CampaignAssetType, string> = {
  KEY_VISUAL: "Key Visual",
  VIDEO: "Vidéo",
  AUDIO: "Audio",
  PRINT: "Print",
  DIGITAL_BANNER: "Bannière Digitale",
  SOCIAL_POST: "Post Social",
  PACKAGING: "Packaging",
  PLV: "PLV",
  DOCUMENT: "Document",
  SCRIPT: "Script",
  STORYBOARD: "Storyboard",
  MOODBOARD: "Moodboard",
};

// ── Funnel Stages ──
export const FUNNEL_STAGES = [
  "AWARENESS", "CONSIDERATION", "CONVERSION", "LOYALTY", "ADVOCACY",
] as const;
export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  AWARENESS: "Notoriété",
  CONSIDERATION: "Considération",
  CONVERSION: "Conversion",
  LOYALTY: "Fidélisation",
  ADVOCACY: "Advocacy",
};

// ── Campaign Dependency Types ──
export const CAMPAIGN_DEPENDENCY_TYPES = [
  "BLOCKS", "REQUIRES", "FOLLOWS", "PARALLEL",
] as const;
export type CampaignDependencyType = (typeof CAMPAIGN_DEPENDENCY_TYPES)[number];
