// Structured Pillar Data Types — A-D-V-E-S
// Each pillar generates structured JSON instead of markdown.
// These interfaces mirror the methodology's section structure per pillar.

// ---------------------------------------------------------------------------
// Pilier A — Authenticité
// ---------------------------------------------------------------------------

export interface AuthenticitePillarData {
  identite: {
    archetype: string;
    citationFondatrice: string;
    noyauIdentitaire: string;
  };
  herosJourney: {
    acte1Origines: string;
    acte2Appel: string;
    acte3Epreuves: string;
    acte4Transformation: string;
    acte5Revelation: string;
  };
  ikigai: {
    aimer: string;
    competence: string;
    besoinMonde: string;
    remuneration: string;
  };
  valeurs: Array<{
    valeur: string;
    rang: number;
    justification: string;
  }>;
  hierarchieCommunautaire: Array<{
    niveau: number;
    nom: string;
    description: string;
    privileges: string;
  }>;
  timelineNarrative: {
    origines: string;
    croissance: string;
    pivot: string;
    futur: string;
  };
}

// ---------------------------------------------------------------------------
// Pilier D — Distinction
// ---------------------------------------------------------------------------

export interface DistinctionPillarData {
  personas: Array<{
    nom: string;
    demographie: string;
    psychographie: string;
    motivations: string;
    freins: string;
    priorite: number;
  }>;
  paysageConcurrentiel: {
    concurrents: Array<{
      nom: string;
      forces: string;
      faiblesses: string;
      partDeMarche: string;
    }>;
    avantagesCompetitifs: string[];
  };
  promessesDeMarque: {
    promesseMaitre: string;
    sousPromesses: string[];
  };
  positionnement: string;
  tonDeVoix: {
    personnalite: string;
    onDit: string[];
    onNeditPas: string[];
  };
  identiteVisuelle: {
    directionArtistique: string;
    paletteCouleurs: string[];
    mood: string;
  };
  assetsLinguistiques: {
    mantras: string[];
    vocabulaireProprietaire: string[];
  };
}

// ---------------------------------------------------------------------------
// Pilier V — Valeur
// ---------------------------------------------------------------------------

export interface ValeurPillarData {
  productLadder: Array<{
    tier: string;
    prix: string;
    description: string;
    cible: string;
  }>;
  valeurMarque: {
    tangible: string[];
    intangible: string[];
  };
  valeurClient: {
    fonctionnels: string[];
    emotionnels: string[];
    sociaux: string[];
  };
  coutMarque: {
    capex: string;
    opex: string;
    coutsCaches: string[];
  };
  coutClient: {
    frictions: Array<{
      friction: string;
      solution: string;
    }>;
  };
  unitEconomics: {
    cac: string;
    ltv: string;
    ratio: string;
    pointMort: string;
    marges: string;
    notes: string;
  };
}

// ---------------------------------------------------------------------------
// Pilier E — Engagement
// ---------------------------------------------------------------------------

export interface EngagementPillarData {
  touchpoints: Array<{
    canal: string;
    type: "physique" | "digital" | "humain";
    role: string;
    priorite: number;
  }>;
  rituels: Array<{
    nom: string;
    type: "always-on" | "cyclique";
    frequence: string;
    description: string;
  }>;
  principesCommunautaires: {
    principes: string[];
    tabous: string[];
  };
  gamification: Array<{
    niveau: number;
    nom: string;
    condition: string;
    recompense: string;
  }>;
  aarrr: {
    acquisition: string;
    activation: string;
    retention: string;
    revenue: string;
    referral: string;
  };
  kpis: Array<{
    variable: string;
    nom: string;
    cible: string;
    frequence: string;
  }>;
}

// ---------------------------------------------------------------------------
// Pilier S — Synthèse Stratégique
// ---------------------------------------------------------------------------

export interface SynthesePillarData {
  syntheseExecutive: string;
  visionStrategique: string;
  coherencePiliers: Array<{
    pilier: string;
    contribution: string;
    articulation: string;
  }>;
  facteursClesSucces: string[];
  recommandationsPrioritaires: Array<{
    action: string;
    priorite: number;
    impact: string;
    delai: string;
  }>;
  scoreCoherence: number;
}

// ---------------------------------------------------------------------------
// Union type for any pillar data
// ---------------------------------------------------------------------------

export type PillarData =
  | AuthenticitePillarData
  | DistinctionPillarData
  | ValeurPillarData
  | EngagementPillarData
  | SynthesePillarData;
