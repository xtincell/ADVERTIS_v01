// =============================================================================
// LIB L.2 — Interview Schema
// =============================================================================
// Defines the 26 Fiche de Marque variables across A-D-V-E input pillars.
// Only pillars A, D, V, E accept user input; R+T are AI-generated audits,
// I generates reports, S is the cockpit. Priority variables correspond to
// the original methodology's star indicators.
// Exports: InterviewVariable, PillarInterviewSection,
//   getFicheDeMarqueSchema(), getInterviewSchema(), getPriorityVariables(),
//   getFicheVariableCount(), getAllFicheVariableIds().
// Used by: Strategy Creation Wizard, fiche form components, phase1 router.
// =============================================================================

export interface InterviewVariable {
  id: string; // e.g. "A1", "D3"
  label: string; // French label
  description: string; // Help text
  placeholder: string;
  priority: boolean; // ★ = true
  type: "text" | "textarea" | "select" | "number";
  options?: { value: string; label: string }[];
}

export interface PillarInterviewSection {
  pillarType: string;
  title: string;
  variables: InterviewVariable[];
}

// ---------------------------------------------------------------------------
// Fiche de Marque — 26 variables across 4 input pillars (A-D-V-E)
// Pillars R, T (Audit), I (Implementation), S (Cockpit) are AI-generated.
// ---------------------------------------------------------------------------

const PILLAR_A_VARIABLES: InterviewVariable[] = [
  {
    id: "A0",
    label: "Marque & Accroche",
    description:
      "Le socle fondateur — nom de marque, signature/accroche (tagline), et positionnement en une phrase. Ce champ ancre toute la strategie ADVERTIS.",
    placeholder:
      'Ex: Bonnet Rouge — « Le gout de la famille, depuis 1970 ». Lait concentre leader en Afrique Centrale.',
    priority: true,
    type: "textarea",
  },
  {
    id: "A1",
    label: "Identite de Marque",
    description:
      "Le noyau identitaire — nom, archetype, citation fondatrice. Decrivez l'essence de votre marque, son archetype (ex: le Heros, le Sage, le Rebelle) et une phrase fondatrice qui la definit.",
    placeholder:
      "Ex: Notre marque incarne l'archetype du Sage. Notre citation fondatrice est...",
    priority: true,
    type: "textarea",
  },
  {
    id: "A2",
    label: "Hero's Journey",
    description:
      "L'histoire en 5 actes de la marque : l'appel, le defi, la transformation, la revelation, le nouvel equilibre.",
    placeholder:
      "Ex: Acte 1 - L'appel : Nous avons identifie un manque sur le marche...",
    priority: false,
    type: "textarea",
  },
  {
    id: "A3",
    label: "Ikigai",
    description:
      "Raison d'etre via les 4 cercles : Ce que vous aimez faire, Ce en quoi vous etes competent, Ce dont le monde a besoin, Ce pour quoi on vous remunere.",
    placeholder:
      "Ex: Aimer : La creation de solutions innovantes. Competence : Expertise technique en IA...",
    priority: true,
    type: "textarea",
  },
  {
    id: "A4",
    label: "Valeurs Schwartz",
    description:
      "3 a 5 valeurs universelles hierarchisees selon le modele de Schwartz (ex: Bienveillance, Autonomie, Accomplissement, Securite, Tradition).",
    placeholder:
      "Ex: 1. Innovation (Autonomie) 2. Excellence (Accomplissement) 3. Integrite (Bienveillance)",
    priority: true,
    type: "textarea",
  },
  {
    id: "A5",
    label: "Hierarchie Communautaire",
    description:
      "Les 6 niveaux de fans : Spectateur, Suiveur, Fan Occasionnel, Fan Engage, Ambassadeur, Evangeliste.",
    placeholder:
      "Ex: Spectateurs : visiteurs du site. Suiveurs : abonnes newsletter...",
    priority: false,
    type: "textarea",
  },
  {
    id: "A6",
    label: "Timeline Narrative",
    description:
      "Chronologie en 4 actes : Origines, Croissance, Pivot/Transformation, Vision Future.",
    placeholder:
      "Ex: 2018 - Fondation a Paris avec une equipe de 3 personnes...",
    priority: false,
    type: "textarea",
  },
];

const PILLAR_D_VARIABLES: InterviewVariable[] = [
  {
    id: "D1",
    label: "Personas",
    description:
      "Portraits detailles des clients cibles : demographie, psychographie, motivations, freins, jobs-to-be-done.",
    placeholder:
      "Ex: Persona 1 - Marie, 35 ans, directrice marketing dans une PME. Motivations : gagner du temps...",
    priority: true,
    type: "textarea",
  },
  {
    id: "D2",
    label: "Paysage Concurrentiel",
    description:
      "Cartographie de 4+ concurrents : positionnement, forces, faiblesses, parts de marche estimees.",
    placeholder:
      "Ex: Concurrent 1 - Acme Corp : Leader du marche, fort en distribution mais faible en innovation...",
    priority: false,
    type: "textarea",
  },
  {
    id: "D3",
    label: "Promesses de Marque",
    description:
      "Promesse maitre (la promesse principale unique) + sous-promesses par segment ou produit.",
    placeholder:
      "Ex: Promesse maitre : Simplifier la gestion financiere des PME. Sous-promesse 1 : Automatiser la comptabilite...",
    priority: true,
    type: "textarea",
  },
  {
    id: "D4",
    label: "Positionnement",
    description:
      "Statement de positionnement unique : Pour [cible], [marque] est [categorie] qui [benefice cle] parce que [raison de croire].",
    placeholder:
      "Ex: Pour les PME ambitieuses, [Marque] est la plateforme SaaS qui simplifie la strategie de marque...",
    priority: true,
    type: "textarea",
  },
  {
    id: "D5",
    label: "Ton de Voix",
    description:
      "Personnalite vocale de la marque : adjectifs definissant le ton, ce que la marque dit vs ne dit jamais.",
    placeholder:
      "Ex: Ton : Expert mais accessible, chaleureux sans etre familier. On dit : 'Construisons ensemble'. On ne dit jamais : ...",
    priority: false,
    type: "textarea",
  },
  {
    id: "D6",
    label: "Identite Visuelle",
    description:
      "Couleurs, direction photo, mood boards, typographies, ambiance generale souhaitee.",
    placeholder:
      "Ex: Palette : Bleu profond (#1a365d), Or (#c49a3c). Direction photo : minimaliste, lumiere naturelle...",
    priority: false,
    type: "textarea",
  },
  {
    id: "D7",
    label: "Assets Linguistiques",
    description:
      "Mantras internes, slogans, vocabulaire proprietaire, expressions recurrentes de la marque.",
    placeholder:
      "Ex: Mantra interne : 'Build what matters'. Vocabulaire proprietaire : on parle de 'co-pilotes' pas de 'clients'...",
    priority: false,
    type: "textarea",
  },
];

const PILLAR_V_VARIABLES: InterviewVariable[] = [
  {
    id: "V1",
    label: "Product Ladder",
    description:
      "Architecture de l'offre en tiers : entree de gamme, coeur de gamme, premium. Prix et positionnement de chaque niveau.",
    placeholder:
      "Ex: Tier 1 (Starter) : 29 EUR/mois — fonctionnalites de base. Tier 2 (Pro) : 99 EUR/mois...",
    priority: true,
    type: "textarea",
  },
  {
    id: "V2",
    label: "Valeur pour la Marque",
    description:
      "Actifs tangibles (brevets, technologie, base clients) et intangibles (reputation, savoir-faire, culture) de la marque.",
    placeholder:
      "Ex: Tangible : base de 10 000 clients actifs, technologie proprietaire. Intangible : reputation d'expert...",
    priority: false,
    type: "textarea",
  },
  {
    id: "V3",
    label: "Valeur pour le Client",
    description:
      "Ce que le client obtient concretement : gains fonctionnels, emotionnels, sociaux. Transformation promise.",
    placeholder:
      "Ex: Gain fonctionnel : 5h/semaine gagnees. Gain emotionnel : confiance dans sa strategie. Gain social : credibilite...",
    priority: true,
    type: "textarea",
  },
  {
    id: "V4",
    label: "Cout pour la Marque",
    description:
      "CAPEX, OPEX, couts caches : infrastructure, personnel, marketing, R&D, conformite.",
    placeholder:
      "Ex: CAPEX initial : 50K EUR (dev). OPEX mensuel : 15K EUR (serveurs, equipe). Couts caches : formation...",
    priority: false,
    type: "textarea",
  },
  {
    id: "V5",
    label: "Cout pour le Client",
    description:
      "Frictions identifiees : cout financier, temps d'apprentissage, cout de migration, risques percus.",
    placeholder:
      "Ex: Friction 1 : Migration des donnees depuis l'ancien outil (2-3 jours). Friction 2 : Courbe d'apprentissage...",
    priority: false,
    type: "textarea",
  },
  {
    id: "V6",
    label: "Unit Economics",
    description:
      "CAC (cout d'acquisition client), LTV (valeur vie client), marges, point mort, ratio LTV/CAC.",
    placeholder:
      "Ex: CAC : 150 EUR. LTV : 2 400 EUR (24 mois x 100 EUR). Marge brute : 75%. Ratio LTV/CAC : 16x...",
    priority: true,
    type: "textarea",
  },
];

const PILLAR_E_VARIABLES: InterviewVariable[] = [
  {
    id: "E1",
    label: "Touchpoints",
    description:
      "Points de contact physiques (evenements, pop-ups), digitaux (site, app, reseaux) et humains (support, vente).",
    placeholder:
      "Ex: Digital : site web, app mobile, LinkedIn, newsletter. Physique : salons professionnels. Humain : equipe support...",
    priority: true,
    type: "textarea",
  },
  {
    id: "E2",
    label: "Rituels",
    description:
      "Comportements Always-On (quotidiens/hebdomadaires) et Cycliques (saisonniers, evenementiels) de la marque.",
    placeholder:
      "Ex: Always-On : newsletter hebdo, posts LinkedIn 3x/semaine. Cycliques : webinar mensuel, rapport trimestriel...",
    priority: true,
    type: "textarea",
  },
  {
    id: "E3",
    label: "Principes Communautaires",
    description:
      "5 a 10 principes de la communaute + tabous (ce qui est interdit ou mal vu dans votre communaute).",
    placeholder:
      "Ex: Principe 1 : Partager ses apprentissages. Principe 2 : Entraide avant competition. Tabou : spam...",
    priority: false,
    type: "textarea",
  },
  {
    id: "E4",
    label: "Gamification",
    description:
      "Systeme de progression en 3 a 5 niveaux : badges, recompenses, jalons, mecaniques de jeu.",
    placeholder:
      "Ex: Niveau 1 : Explorateur (inscription). Niveau 2 : Praticien (5 projets). Niveau 3 : Expert (certification)...",
    priority: false,
    type: "textarea",
  },
  {
    id: "E5",
    label: "AARRR",
    description:
      "Metriques pirate funnel : Acquisition, Activation, Retention, Revenue, Referral. Indicateurs cles pour chaque etape.",
    placeholder:
      "Ex: Acquisition : trafic organique, SEA. Activation : taux de premiere utilisation. Retention : MAU, churn rate...",
    priority: true,
    type: "textarea",
  },
  {
    id: "E6",
    label: "KPIs Dashboard",
    description:
      "1 a 3 KPIs par variable ADVERTIS pour mesurer la performance de chaque pilier.",
    placeholder:
      "Ex: A : Brand awareness score. D : NPS par persona. V : MRR et ARR. E : Taux d'engagement communautaire...",
    priority: false,
    type: "textarea",
  },
];

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Returns the Fiche de Marque schema: 26 variables across pillars A-D-V-E.
 * Only these pillars accept user input. R, T, I, S are AI-generated.
 */
export function getFicheDeMarqueSchema(): PillarInterviewSection[] {
  return [
    {
      pillarType: "A",
      title: "Authenticite",
      variables: PILLAR_A_VARIABLES,
    },
    {
      pillarType: "D",
      title: "Distinction",
      variables: PILLAR_D_VARIABLES,
    },
    {
      pillarType: "V",
      title: "Valeur",
      variables: PILLAR_V_VARIABLES,
    },
    {
      pillarType: "E",
      title: "Engagement",
      variables: PILLAR_E_VARIABLES,
    },
  ];
}

/**
 * Alias for backward compatibility — returns the same as getFicheDeMarqueSchema().
 */
export function getInterviewSchema(): PillarInterviewSection[] {
  return getFicheDeMarqueSchema();
}

/**
 * Returns only priority (★) variables from A-D-V-E pillars.
 * Used by Express mode in the wizard. (~12 variables)
 */
export function getPriorityVariables(): PillarInterviewSection[] {
  return getFicheDeMarqueSchema().map((section) => ({
    ...section,
    variables: section.variables.filter((v) => v.priority),
  }));
}

/**
 * Returns the total count of user-input variables (25).
 */
export function getFicheVariableCount(): number {
  return getFicheDeMarqueSchema().reduce(
    (sum, section) => sum + section.variables.length,
    0,
  );
}

/**
 * Returns all variable IDs for the Fiche de Marque (A0-A6, D1-D7, V1-V6, E1-E6).
 */
export function getAllFicheVariableIds(): string[] {
  return getFicheDeMarqueSchema().flatMap((section) =>
    section.variables.map((v) => v.id),
  );
}
