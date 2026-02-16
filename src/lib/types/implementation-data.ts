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
  coherenceScore: number; // 0-100
  executiveSummary: string;
}
