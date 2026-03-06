// =============================================================================
// LIB L.ML — Marketing Levers Constants
// =============================================================================
// Constantes pour les leviers psychologiques, Maslow, AARRR, saisonnalité,
// réglementaire, et costing des canaux.
// Used by: product-sheet-enhanced, action-simulator, section-valeur, cockpit
// =============================================================================

import {
  Heart,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  TrendingDown,
  Flame,
  Crown,
  Users,
  Star,
  Zap,
  Home,
  Lock,
  HeartHandshake,
  Award,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Maslow Pyramid
// ---------------------------------------------------------------------------

export interface MaslowLevel {
  id: string;
  level: number;
  label: string;
  description: string;
  color: string;
  icon: LucideIcon;
}

export const MASLOW_LEVELS: MaslowLevel[] = [
  {
    id: "physiologique",
    level: 1,
    label: "Physiologique",
    description: "Besoins vitaux : nourriture, eau, abri, sommeil, santé",
    color: "#EF4444",
    icon: Home,
  },
  {
    id: "securite",
    level: 2,
    label: "Sécurité",
    description: "Sécurité physique, emploi, ressources, santé, propriété",
    color: "#F97316",
    icon: Lock,
  },
  {
    id: "appartenance",
    level: 3,
    label: "Appartenance",
    description: "Amitié, famille, intimité, communauté, tribu",
    color: "#EAB308",
    icon: HeartHandshake,
  },
  {
    id: "estime",
    level: 4,
    label: "Estime",
    description: "Confiance, respect, réussite, reconnaissance, statut",
    color: "#22C55E",
    icon: Award,
  },
  {
    id: "realisation",
    level: 5,
    label: "Réalisation de soi",
    description: "Créativité, moralité, spontanéité, accomplissement",
    color: "#3B82F6",
    icon: Lightbulb,
  },
];

// ---------------------------------------------------------------------------
// Psychological Levers
// ---------------------------------------------------------------------------

export interface PsychologicalLever {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  /** Target demographic segment */
  segment: string;
}

export const PSYCHOLOGICAL_LEVERS: PsychologicalLever[] = [
  {
    id: "desir-masculin",
    label: "Désir masculin",
    description:
      "Performance, virilité, puissance, conquête — levier profond lié à l'identité masculine",
    icon: Flame,
    color: "#DC2626",
    segment: "Hommes 25-55",
  },
  {
    id: "beaute-feminine",
    label: "Beauté féminine",
    description:
      "Éclat, jeunesse, élégance, séduction — aspiration à la beauté idéale",
    icon: Sparkles,
    color: "#EC4899",
    segment: "Femmes 18-55",
  },
  {
    id: "sante-seniors",
    label: "Santé des seniors",
    description:
      "Longévité, vitalité, autonomie, prévention — désir de rester actif et indépendant",
    icon: ShieldCheck,
    color: "#059669",
    segment: "Seniors 55+",
  },
  {
    id: "education-enfants",
    label: "Éducation des enfants",
    description:
      "Réussite scolaire, développement, avenir brillant — investissement parental",
    icon: GraduationCap,
    color: "#2563EB",
    segment: "Parents 25-45",
  },
  {
    id: "peur-perte-csp",
    label: "Peur de la perte (CSP+)",
    description:
      "Protection du patrimoine, du statut et du lifestyle — aversion à la perte des classes aisées",
    icon: TrendingDown,
    color: "#7C3AED",
    segment: "CSP+ / HNWI",
  },
  {
    id: "appartenance-tribale",
    label: "Appartenance tribale",
    description:
      "Besoin d'intégration, identité de groupe, codes communautaires",
    icon: Users,
    color: "#0891B2",
    segment: "Tous segments",
  },
  {
    id: "statut-social",
    label: "Statut social",
    description:
      "Prestige, distinction, exclusivité — signaux visibles de réussite",
    icon: Crown,
    color: "#D97706",
    segment: "CSP+ / Aspirants",
  },
  {
    id: "plaisir-immediat",
    label: "Plaisir immédiat",
    description:
      "Gratification instantanée, dopamine, hédonisme — le « maintenant »",
    icon: Zap,
    color: "#F59E0B",
    segment: "Jeunes 18-35",
  },
  {
    id: "amour-romantique",
    label: "Amour romantique",
    description:
      "Connexion émotionnelle, romance, intimité — désir de lien profond",
    icon: Heart,
    color: "#E11D48",
    segment: "Adultes 18-45",
  },
  {
    id: "excellence-personnelle",
    label: "Excellence personnelle",
    description:
      "Accomplissement, maîtrise, dépassement de soi — être la meilleure version de soi",
    icon: Star,
    color: "#8B5CF6",
    segment: "Tous segments",
  },
];

// ---------------------------------------------------------------------------
// AARRR Stages (Pirate Funnel)
// ---------------------------------------------------------------------------

export interface AARRRStage {
  id: string;
  label: string;
  description: string;
  color: string;
  order: number;
}

export const AARRR_STAGES: AARRRStage[] = [
  {
    id: "acquisition",
    label: "Acquisition",
    description: "Attirer de nouveaux utilisateurs / prospects",
    color: "#3B82F6",
    order: 1,
  },
  {
    id: "activation",
    label: "Activation",
    description: "Première expérience réussie / « aha moment »",
    color: "#8B5CF6",
    order: 2,
  },
  {
    id: "retention",
    label: "Rétention",
    description: "Engagement répété et fidélisation",
    color: "#10B981",
    order: 3,
  },
  {
    id: "revenue",
    label: "Revenu",
    description: "Monétisation et conversion",
    color: "#F59E0B",
    order: 4,
  },
  {
    id: "referral",
    label: "Recommandation",
    description: "Bouche-à-oreille et viralité",
    color: "#EF4444",
    order: 5,
  },
];

// ---------------------------------------------------------------------------
// Regulatory Flags
// ---------------------------------------------------------------------------

export interface RegulatoryFlag {
  id: string;
  label: string;
  description: string;
  severity: "info" | "warning" | "blocking";
}

export const REGULATORY_FLAGS: RegulatoryFlag[] = [
  {
    id: "alcool",
    label: "Alcool",
    description: "Restrictions publicitaires sur les boissons alcoolisées",
    severity: "blocking",
  },
  {
    id: "tabac",
    label: "Tabac",
    description: "Interdiction totale de publicité tabac",
    severity: "blocking",
  },
  {
    id: "pharma",
    label: "Pharmaceutique",
    description: "Réglementation médicaments et compléments alimentaires",
    severity: "blocking",
  },
  {
    id: "mineurs",
    label: "Protection des mineurs",
    description: "Contenu destiné aux -18 ans : restrictions alimentaires, jeux",
    severity: "warning",
  },
  {
    id: "donnees-personnelles",
    label: "Données personnelles",
    description: "RGPD / loi informatique et libertés",
    severity: "warning",
  },
  {
    id: "comparatif",
    label: "Publicité comparative",
    description: "Comparaison directe avec la concurrence — cadre juridique strict",
    severity: "warning",
  },
  {
    id: "environnement",
    label: "Claims environnementaux",
    description: "Greenwashing interdit — justification obligatoire des claims éco",
    severity: "info",
  },
  {
    id: "alimentaire",
    label: "Claims alimentaires",
    description: "Allégations nutritionnelles et de santé réglementées",
    severity: "warning",
  },
];

// ---------------------------------------------------------------------------
// Seasonality Profiles
// ---------------------------------------------------------------------------

export interface SeasonalityProfile {
  id: string;
  label: string;
  coefficient: number;
  color: string;
}

export const SEASONALITY_PROFILES: Record<string, SeasonalityProfile> = {
  PEAK: {
    id: "PEAK",
    label: "Pic",
    coefficient: 1.5,
    color: "#EF4444",
  },
  HIGH: {
    id: "HIGH",
    label: "Haute",
    coefficient: 1.2,
    color: "#F97316",
  },
  NORMAL: {
    id: "NORMAL",
    label: "Normale",
    coefficient: 1.0,
    color: "#22C55E",
  },
  LOW: {
    id: "LOW",
    label: "Basse",
    coefficient: 0.7,
    color: "#3B82F6",
  },
  OFF: {
    id: "OFF",
    label: "Hors saison",
    coefficient: 0.4,
    color: "#94A3B8",
  },
};

export type SeasonalityProfileId = keyof typeof SEASONALITY_PROFILES;

// ---------------------------------------------------------------------------
// Channel Costing Units
// ---------------------------------------------------------------------------

export interface CostingUnit {
  id: string;
  label: string;
  description: string;
}

export const CHANNEL_COSTING_UNITS: CostingUnit[] = [
  { id: "CPM", label: "CPM", description: "Coût pour 1 000 impressions" },
  { id: "CPC", label: "CPC", description: "Coût par clic" },
  { id: "CPL", label: "CPL", description: "Coût par lead" },
  { id: "CPA", label: "CPA", description: "Coût par acquisition" },
  { id: "FLAT", label: "Forfait", description: "Montant fixe / forfaitaire" },
];

// ---------------------------------------------------------------------------
// Action Lines & Types mapping
// ---------------------------------------------------------------------------

export const ACTION_LINE_TYPES = {
  ATL: [
    "TV",
    "RADIO",
    "CINEMA",
    "PRESSE",
    "AFFICHAGE",
    "OOH",
  ],
  BTL: [
    "PLV",
    "STREET_MARKETING",
    "EVENEMENTIEL",
    "SAMPLING",
    "MERCHANDISING",
    "SPONSORING",
    "DIRECT_MAIL",
  ],
  TTL: [
    "DIGITAL",
    "SOCIAL_MEDIA",
    "CRM",
    "EMAILING",
    "SEO",
    "SEA",
    "DISPLAY",
    "INFLUENCER",
    "CONTENT_MARKETING",
  ],
} as const;

export type ActionLine = keyof typeof ACTION_LINE_TYPES;

// ---------------------------------------------------------------------------
// Month names (FR)
// ---------------------------------------------------------------------------

export const MONTH_NAMES_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

// ---------------------------------------------------------------------------
// Nano Banana Style Presets (slim re-export for product sheet)
// ---------------------------------------------------------------------------

export const NANO_BANANA_STYLES = [
  "luxe-raffine",
  "energie-urbaine",
  "nature-organique",
  "tech-futuriste",
  "heritage-authentique",
  "minimalisme-epure",
  "afro-contemporain",
  "pop-culture",
] as const;

export type NanoBananaStyleId = (typeof NANO_BANANA_STYLES)[number];

// ---------------------------------------------------------------------------
// Simulator Score Weights
// ---------------------------------------------------------------------------

export const SIMULATOR_SCORE_WEIGHTS = {
  /** Couverture AARRR : au moins 3/5 stages couverts */
  aarrCoverage: 20,
  /** Équilibre budgétaire : aucun canal > 60% */
  budgetBalance: 20,
  /** Compliance : zéro flag bloquant */
  compliance: 20,
  /** Diversité canaux : ATL + BTL + TTL représentés */
  channelDiversity: 20,
  /** Alignement émotionnel : score ADVE pondéré */
  emotionalAlignment: 20,
} as const;
