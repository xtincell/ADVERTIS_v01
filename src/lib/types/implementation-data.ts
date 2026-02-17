// ImplementationData — Structured output from Pillar I generation.
// This is the data structure that feeds the Cockpit (Pillar S).
// It synthesizes A-D-V-E fiche data + R+T validated audit results
// into dashboard-ready structured data.

export interface ImplementationData {
  brandIdentity: {
    archetype: string;
    purpose: string;
    vision: string;
    values: string[];
    narrative: string;
  };
  positioning: {
    statement: string;
    differentiators: string[];
    toneOfVoice: string;
    personas: Array<{ name: string; description: string; priority: number }>;
    competitors: Array<{ name: string; position: string }>;
  };
  valueArchitecture: {
    productLadder: Array<{
      tier: string;
      price: string;
      description: string;
    }>;
    valueProposition: string;
    unitEconomics: {
      cac: string;
      ltv: string;
      ratio: string;
      notes: string;
    };
  };
  engagementStrategy: {
    touchpoints: Array<{
      channel: string;
      role: string;
      priority: number;
    }>;
    rituals: Array<{
      name: string;
      frequency: string;
      description: string;
    }>;
    aarrr: {
      acquisition: string;
      activation: string;
      retention: string;
      revenue: string;
      referral: string;
    };
    kpis: Array<{ name: string; target: string; frequency: string }>;
  };
  riskSynthesis: {
    riskScore: number;
    globalSwot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    topRisks: Array<{
      risk: string;
      impact: string;
      mitigation: string;
    }>;
  };
  marketValidation: {
    brandMarketFitScore: number;
    tam: string;
    sam: string;
    som: string;
    trends: string[];
    recommendations: string[];
  };
  strategicRoadmap: {
    sprint90Days: Array<{
      action: string;
      owner: string;
      kpi: string;
    }>;
    year1Priorities: string[];
    year3Vision: string;
  };

  // ---------------------------------------------------------------------------
  // Campagnes — calendrier annuel, templates et plan d'activation
  // ---------------------------------------------------------------------------
  campaigns?: {
    annualCalendar: Array<{
      mois: string;
      campagne: string;
      objectif: string;
      canaux: string[];
      budget: string;
      kpiCible: string;
    }>;
    templates: Array<{
      nom: string;
      type: "lancement" | "recurrence" | "evenement" | "activation";
      description: string;
      duree: string;
      canauxPrincipaux: string[];
      messagesCles: string[];
    }>;
    activationPlan: {
      phase1Teasing: string;
      phase2Lancement: string;
      phase3Amplification: string;
      phase4Fidelisation: string;
    };
  };

  // ---------------------------------------------------------------------------
  // Budget — allocation détaillée, par poste et par phase, projections ROI
  // ---------------------------------------------------------------------------
  budgetAllocation?: {
    enveloppeGlobale: string;
    parPoste: Array<{
      poste: string;
      montant: string;
      pourcentage: number;
      justification: string;
    }>;
    parPhase: Array<{
      phase: string;
      montant: string;
      focus: string;
    }>;
    roiProjections: {
      mois6: string;
      mois12: string;
      mois24: string;
      hypotheses: string;
    };
  };

  // ---------------------------------------------------------------------------
  // Équipe — structure actuelle, plan de recrutement, partenaires
  // ---------------------------------------------------------------------------
  teamStructure?: {
    equipeActuelle: Array<{
      role: string;
      profil: string;
      allocation: string;
    }>;
    recrutements: Array<{
      role: string;
      profil: string;
      echeance: string;
      priorite: number;
    }>;
    partenairesExternes: Array<{
      type: string;
      mission: string;
      budget: string;
      duree: string;
    }>;
  };

  // ---------------------------------------------------------------------------
  // Plan de lancement — phases, milestones, go/no-go
  // ---------------------------------------------------------------------------
  launchPlan?: {
    phases: Array<{
      nom: string;
      debut: string;
      fin: string;
      objectifs: string[];
      livrables: string[];
      goNoGo: string;
    }>;
    milestones: Array<{
      date: string;
      jalon: string;
      responsable: string;
      critereSucces: string;
    }>;
  };

  // ---------------------------------------------------------------------------
  // Playbook opérationnel — rythmes, escalation, stack outils
  // ---------------------------------------------------------------------------
  operationalPlaybook?: {
    rythmeQuotidien: string[];
    rythmeHebdomadaire: string[];
    rythmeMensuel: string[];
    escalation: Array<{
      scenario: string;
      action: string;
      responsable: string;
    }>;
    outilsStack: Array<{
      outil: string;
      usage: string;
      cout: string;
    }>;
  };

  coherenceScore: number; // 0-100
  executiveSummary: string;
}
