// Zod Schemas — Source of truth for all 8 ADVERTIS pillar data types.
// TypeScript types are inferred from these schemas via z.infer<>.
// Runtime validation replaces unsafe `as T` type assertions everywhere.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Helper: coerce number (AI sometimes returns "45" instead of 45)
// ---------------------------------------------------------------------------
const num = z.coerce.number().default(0);

// ---------------------------------------------------------------------------
// Pilier A — Authenticité
// ---------------------------------------------------------------------------

export const AuthenticitePillarSchema = z
  .object({
    identite: z
      .object({
        archetype: z.string().default(""),
        citationFondatrice: z.string().default(""),
        noyauIdentitaire: z.string().default(""),
      })
      .default({}),
    herosJourney: z
      .object({
        acte1Origines: z.string().default(""),
        acte2Appel: z.string().default(""),
        acte3Epreuves: z.string().default(""),
        acte4Transformation: z.string().default(""),
        acte5Revelation: z.string().default(""),
      })
      .default({}),
    ikigai: z
      .object({
        aimer: z.string().default(""),
        competence: z.string().default(""),
        besoinMonde: z.string().default(""),
        remuneration: z.string().default(""),
      })
      .default({}),
    valeurs: z
      .array(
        z.object({
          valeur: z.string().default(""),
          rang: num,
          justification: z.string().default(""),
        }),
      )
      .default([]),
    hierarchieCommunautaire: z
      .array(
        z.object({
          niveau: num,
          nom: z.string().default(""),
          description: z.string().default(""),
          privileges: z.string().default(""),
        }),
      )
      .default([]),
    timelineNarrative: z
      .object({
        origines: z.string().default(""),
        croissance: z.string().default(""),
        pivot: z.string().default(""),
        futur: z.string().default(""),
      })
      .default({}),
  })
  .strip();

export type AuthenticitePillarData = z.infer<typeof AuthenticitePillarSchema>;

// ---------------------------------------------------------------------------
// Pilier D — Distinction
// ---------------------------------------------------------------------------

export const DistinctionPillarSchema = z
  .object({
    personas: z
      .array(
        z.object({
          nom: z.string().default(""),
          demographie: z.string().default(""),
          psychographie: z.string().default(""),
          motivations: z.string().default(""),
          freins: z.string().default(""),
          priorite: num,
        }),
      )
      .default([]),
    paysageConcurrentiel: z
      .object({
        concurrents: z
          .array(
            z.object({
              nom: z.string().default(""),
              forces: z.string().default(""),
              faiblesses: z.string().default(""),
              partDeMarche: z.string().default(""),
            }),
          )
          .default([]),
        avantagesCompetitifs: z.array(z.string()).default([]),
      })
      .default({}),
    promessesDeMarque: z
      .object({
        promesseMaitre: z.string().default(""),
        sousPromesses: z.array(z.string()).default([]),
      })
      .default({}),
    positionnement: z.string().default(""),
    tonDeVoix: z
      .object({
        personnalite: z.string().default(""),
        onDit: z.array(z.string()).default([]),
        onNeditPas: z.array(z.string()).default([]),
      })
      .default({}),
    identiteVisuelle: z
      .object({
        directionArtistique: z.string().default(""),
        paletteCouleurs: z.array(z.string()).default([]),
        mood: z.string().default(""),
      })
      .default({}),
    assetsLinguistiques: z
      .object({
        mantras: z.array(z.string()).default([]),
        vocabulaireProprietaire: z.array(z.string()).default([]),
      })
      .default({}),
  })
  .strip();

export type DistinctionPillarData = z.infer<typeof DistinctionPillarSchema>;

// ---------------------------------------------------------------------------
// Pilier V — Valeur
// ---------------------------------------------------------------------------

export const ValeurPillarSchema = z
  .object({
    productLadder: z
      .array(
        z.object({
          tier: z.string().default(""),
          prix: z.string().default(""),
          description: z.string().default(""),
          cible: z.string().default(""),
        }),
      )
      .default([]),
    valeurMarque: z
      .object({
        tangible: z.array(z.string()).default([]),
        intangible: z.array(z.string()).default([]),
      })
      .default({}),
    valeurClient: z
      .object({
        fonctionnels: z.array(z.string()).default([]),
        emotionnels: z.array(z.string()).default([]),
        sociaux: z.array(z.string()).default([]),
      })
      .default({}),
    coutMarque: z
      .object({
        capex: z.string().default(""),
        opex: z.string().default(""),
        coutsCaches: z.array(z.string()).default([]),
      })
      .default({}),
    coutClient: z
      .object({
        frictions: z
          .array(
            z.object({
              friction: z.string().default(""),
              solution: z.string().default(""),
            }),
          )
          .default([]),
      })
      .default({}),
    unitEconomics: z
      .object({
        cac: z.string().default(""),
        ltv: z.string().default(""),
        ratio: z.string().default(""),
        pointMort: z.string().default(""),
        marges: z.string().default(""),
        notes: z.string().default(""),
      })
      .default({}),
  })
  .strip();

export type ValeurPillarData = z.infer<typeof ValeurPillarSchema>;

// ---------------------------------------------------------------------------
// Pilier E — Engagement
// ---------------------------------------------------------------------------

const TouchpointTypeEnum = z
  .enum(["physique", "digital", "humain"])
  .catch("digital");

const RituelTypeEnum = z.enum(["always-on", "cyclique"]).catch("always-on");

export const EngagementPillarSchema = z
  .object({
    touchpoints: z
      .array(
        z.object({
          canal: z.string().default(""),
          type: TouchpointTypeEnum,
          role: z.string().default(""),
          priorite: num,
        }),
      )
      .default([]),
    rituels: z
      .array(
        z.object({
          nom: z.string().default(""),
          type: RituelTypeEnum,
          frequence: z.string().default(""),
          description: z.string().default(""),
        }),
      )
      .default([]),
    principesCommunautaires: z
      .object({
        principes: z.array(z.string()).default([]),
        tabous: z.array(z.string()).default([]),
      })
      .default({}),
    gamification: z
      .array(
        z.object({
          niveau: num,
          nom: z.string().default(""),
          condition: z.string().default(""),
          recompense: z.string().default(""),
        }),
      )
      .default([]),
    aarrr: z
      .object({
        acquisition: z.string().default(""),
        activation: z.string().default(""),
        retention: z.string().default(""),
        revenue: z.string().default(""),
        referral: z.string().default(""),
      })
      .default({}),
    kpis: z
      .array(
        z.object({
          variable: z.string().default(""),
          nom: z.string().default(""),
          cible: z.string().default(""),
          frequence: z.string().default(""),
        }),
      )
      .default([]),
  })
  .strip();

export type EngagementPillarData = z.infer<typeof EngagementPillarSchema>;

// ---------------------------------------------------------------------------
// Pilier R — Risk Audit
// ---------------------------------------------------------------------------

const RiskLevelEnum = z.enum(["low", "medium", "high"]).catch("medium");

export const MicroSwotSchema = z.object({
  variableId: z.string().default(""),
  variableLabel: z.string().default(""),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  opportunities: z.array(z.string()).default([]),
  threats: z.array(z.string()).default([]),
  riskLevel: RiskLevelEnum,
  commentary: z.string().default(""),
});

export const RiskAuditResultSchema = z
  .object({
    microSwots: z.array(MicroSwotSchema).default([]),
    globalSwot: z
      .object({
        strengths: z.array(z.string()).default([]),
        weaknesses: z.array(z.string()).default([]),
        opportunities: z.array(z.string()).default([]),
        threats: z.array(z.string()).default([]),
      })
      .default({}),
    riskScore: z.coerce.number().min(0).max(100).catch(50),
    riskScoreJustification: z.string().default(""),
    probabilityImpactMatrix: z
      .array(
        z.object({
          risk: z.string().default(""),
          probability: RiskLevelEnum,
          impact: RiskLevelEnum,
          priority: z.coerce.number().min(1).max(5).catch(3),
        }),
      )
      .default([]),
    mitigationPriorities: z
      .array(
        z.object({
          risk: z.string().default(""),
          action: z.string().default(""),
          urgency: z
            .enum(["immediate", "short_term", "medium_term"])
            .catch("medium_term"),
          effort: RiskLevelEnum,
        }),
      )
      .default([]),
    summary: z.string().default(""),
  })
  .strip();

export type MicroSwot = z.infer<typeof MicroSwotSchema>;
export type RiskAuditResult = z.infer<typeof RiskAuditResultSchema>;

// ---------------------------------------------------------------------------
// Pilier T — Track Audit
// ---------------------------------------------------------------------------

export const TrackAuditResultSchema = z
  .object({
    triangulation: z
      .object({
        internalData: z.string().default(""),
        marketData: z.string().default(""),
        customerData: z.string().default(""),
        synthesis: z.string().default(""),
      })
      .default({}),
    hypothesisValidation: z
      .array(
        z.object({
          variableId: z.string().default(""),
          hypothesis: z.string().default(""),
          status: z
            .enum(["validated", "invalidated", "to_test"])
            .catch("to_test"),
          evidence: z.string().default(""),
        }),
      )
      .default([]),
    marketReality: z
      .object({
        macroTrends: z.array(z.string()).default([]),
        weakSignals: z.array(z.string()).default([]),
        emergingPatterns: z.array(z.string()).default([]),
      })
      .default({}),
    tamSamSom: z
      .object({
        tam: z
          .object({ value: z.string().default(""), description: z.string().default("") })
          .default({}),
        sam: z
          .object({ value: z.string().default(""), description: z.string().default("") })
          .default({}),
        som: z
          .object({ value: z.string().default(""), description: z.string().default("") })
          .default({}),
        methodology: z.string().default(""),
      })
      .default({}),
    competitiveBenchmark: z
      .array(
        z.object({
          competitor: z.string().default(""),
          strengths: z.array(z.string()).default([]),
          weaknesses: z.array(z.string()).default([]),
          marketShare: z.string().default(""),
        }),
      )
      .default([]),
    brandMarketFitScore: z.coerce.number().min(0).max(100).catch(50),
    brandMarketFitJustification: z.string().default(""),
    strategicRecommendations: z.array(z.string()).default([]),
    summary: z.string().default(""),
  })
  .strip();

export type TrackAuditResult = z.infer<typeof TrackAuditResultSchema>;

// ---------------------------------------------------------------------------
// Pilier I — Implementation
// ---------------------------------------------------------------------------

const CampaignTypeEnum = z
  .enum(["lancement", "recurrence", "evenement", "activation"])
  .catch("lancement");

export const ImplementationDataSchema = z
  .object({
    brandIdentity: z
      .object({
        archetype: z.string().default(""),
        purpose: z.string().default(""),
        vision: z.string().default(""),
        values: z.array(z.string()).default([]),
        narrative: z.string().default(""),
      })
      .default({}),
    positioning: z
      .object({
        statement: z.string().default(""),
        differentiators: z.array(z.string()).default([]),
        toneOfVoice: z.string().default(""),
        personas: z
          .array(
            z.object({
              name: z.string().default(""),
              description: z.string().default(""),
              priority: num,
            }),
          )
          .default([]),
        competitors: z
          .array(
            z.object({
              name: z.string().default(""),
              position: z.string().default(""),
            }),
          )
          .default([]),
      })
      .default({}),
    valueArchitecture: z
      .object({
        productLadder: z
          .array(
            z.object({
              tier: z.string().default(""),
              price: z.string().default(""),
              description: z.string().default(""),
            }),
          )
          .default([]),
        valueProposition: z.string().default(""),
        unitEconomics: z
          .object({
            cac: z.string().default(""),
            ltv: z.string().default(""),
            ratio: z.string().default(""),
            notes: z.string().default(""),
          })
          .default({}),
      })
      .default({}),
    engagementStrategy: z
      .object({
        touchpoints: z
          .array(
            z.object({
              channel: z.string().default(""),
              role: z.string().default(""),
              priority: num,
            }),
          )
          .default([]),
        rituals: z
          .array(
            z.object({
              name: z.string().default(""),
              frequency: z.string().default(""),
              description: z.string().default(""),
            }),
          )
          .default([]),
        aarrr: z
          .object({
            acquisition: z.string().default(""),
            activation: z.string().default(""),
            retention: z.string().default(""),
            revenue: z.string().default(""),
            referral: z.string().default(""),
          })
          .default({}),
        kpis: z
          .array(
            z.object({
              name: z.string().default(""),
              target: z.string().default(""),
              frequency: z.string().default(""),
            }),
          )
          .default([]),
      })
      .default({}),
    riskSynthesis: z
      .object({
        riskScore: num,
        globalSwot: z
          .object({
            strengths: z.array(z.string()).default([]),
            weaknesses: z.array(z.string()).default([]),
            opportunities: z.array(z.string()).default([]),
            threats: z.array(z.string()).default([]),
          })
          .default({}),
        topRisks: z
          .array(
            z.object({
              risk: z.string().default(""),
              impact: z.string().default(""),
              mitigation: z.string().default(""),
            }),
          )
          .default([]),
      })
      .default({}),
    marketValidation: z
      .object({
        brandMarketFitScore: num,
        tam: z.string().default(""),
        sam: z.string().default(""),
        som: z.string().default(""),
        trends: z.array(z.string()).default([]),
        recommendations: z.array(z.string()).default([]),
      })
      .default({}),
    strategicRoadmap: z
      .object({
        sprint90Days: z
          .array(
            z.object({
              action: z.string().default(""),
              owner: z.string().default(""),
              kpi: z.string().default(""),
            }),
          )
          .default([]),
        year1Priorities: z.array(z.string()).default([]),
        year3Vision: z.string().default(""),
      })
      .default({}),

    // Optional enriched sections
    campaigns: z
      .object({
        annualCalendar: z
          .array(
            z.object({
              mois: z.string().default(""),
              campagne: z.string().default(""),
              objectif: z.string().default(""),
              canaux: z.array(z.string()).default([]),
              budget: z.string().default(""),
              kpiCible: z.string().default(""),
            }),
          )
          .default([]),
        templates: z
          .array(
            z.object({
              nom: z.string().default(""),
              type: CampaignTypeEnum,
              description: z.string().default(""),
              duree: z.string().default(""),
              canauxPrincipaux: z.array(z.string()).default([]),
              messagesCles: z.array(z.string()).default([]),
            }),
          )
          .default([]),
        activationPlan: z
          .object({
            phase1Teasing: z.string().default(""),
            phase2Lancement: z.string().default(""),
            phase3Amplification: z.string().default(""),
            phase4Fidelisation: z.string().default(""),
          })
          .default({}),
      })
      .optional(),
    budgetAllocation: z
      .object({
        enveloppeGlobale: z.string().default(""),
        parPoste: z
          .array(
            z.object({
              poste: z.string().default(""),
              montant: z.string().default(""),
              pourcentage: num,
              justification: z.string().default(""),
            }),
          )
          .default([]),
        parPhase: z
          .array(
            z.object({
              phase: z.string().default(""),
              montant: z.string().default(""),
              focus: z.string().default(""),
            }),
          )
          .default([]),
        roiProjections: z
          .object({
            mois6: z.string().default(""),
            mois12: z.string().default(""),
            mois24: z.string().default(""),
            hypotheses: z.string().default(""),
          })
          .default({}),
      })
      .optional(),
    teamStructure: z
      .object({
        equipeActuelle: z
          .array(
            z.object({
              role: z.string().default(""),
              profil: z.string().default(""),
              allocation: z.string().default(""),
            }),
          )
          .default([]),
        recrutements: z
          .array(
            z.object({
              role: z.string().default(""),
              profil: z.string().default(""),
              echeance: z.string().default(""),
              priorite: num,
            }),
          )
          .default([]),
        partenairesExternes: z
          .array(
            z.object({
              type: z.string().default(""),
              mission: z.string().default(""),
              budget: z.string().default(""),
              duree: z.string().default(""),
            }),
          )
          .default([]),
      })
      .optional(),
    launchPlan: z
      .object({
        phases: z
          .array(
            z.object({
              nom: z.string().default(""),
              debut: z.string().default(""),
              fin: z.string().default(""),
              objectifs: z.array(z.string()).default([]),
              livrables: z.array(z.string()).default([]),
              goNoGo: z.string().default(""),
            }),
          )
          .default([]),
        milestones: z
          .array(
            z.object({
              date: z.string().default(""),
              jalon: z.string().default(""),
              responsable: z.string().default(""),
              critereSucces: z.string().default(""),
            }),
          )
          .default([]),
      })
      .optional(),
    operationalPlaybook: z
      .object({
        rythmeQuotidien: z.array(z.string()).default([]),
        rythmeHebdomadaire: z.array(z.string()).default([]),
        rythmeMensuel: z.array(z.string()).default([]),
        escalation: z
          .array(
            z.object({
              scenario: z.string().default(""),
              action: z.string().default(""),
              responsable: z.string().default(""),
            }),
          )
          .default([]),
        outilsStack: z
          .array(
            z.object({
              outil: z.string().default(""),
              usage: z.string().default(""),
              cout: z.string().default(""),
            }),
          )
          .default([]),
      })
      .optional(),

    // ====== SECTIONS STRATÉGIQUES UPGRADERS ======

    // Plateforme de Marque — Le socle identitaire complet
    brandPlatform: z
      .object({
        purpose: z.string().default(""),
        vision: z.string().default(""),
        mission: z.string().default(""),
        values: z.array(z.string()).default([]),
        personality: z.string().default(""),
        territory: z.string().default(""),
        tagline: z.string().default(""),
      })
      .optional(),

    // Copy Strategy — Le contrat stratégique création/stratégie
    copyStrategy: z
      .object({
        promise: z.string().default(""),
        rtb: z.array(z.string()).default([]),
        consumerBenefit: z.string().default(""),
        tone: z.string().default(""),
        constraint: z.string().default(""),
      })
      .optional(),

    // Big Idea — Le concept central déclinable
    bigIdea: z
      .object({
        concept: z.string().default(""),
        mechanism: z.string().default(""),
        insightLink: z.string().default(""),
        declinaisons: z
          .array(
            z.object({
              support: z.string().default(""),
              description: z.string().default(""),
            }),
          )
          .default([]),
      })
      .optional(),

    // Dispositif d'Activation — Axes owned/earned/paid/shared
    activationDispositif: z
      .object({
        owned: z
          .array(
            z.object({
              canal: z.string().default(""),
              role: z.string().default(""),
              budget: z.string().default(""),
            }),
          )
          .default([]),
        earned: z
          .array(
            z.object({
              canal: z.string().default(""),
              role: z.string().default(""),
              budget: z.string().default(""),
            }),
          )
          .default([]),
        paid: z
          .array(
            z.object({
              canal: z.string().default(""),
              role: z.string().default(""),
              budget: z.string().default(""),
            }),
          )
          .default([]),
        shared: z
          .array(
            z.object({
              canal: z.string().default(""),
              role: z.string().default(""),
              budget: z.string().default(""),
            }),
          )
          .default([]),
        parcoursConso: z.string().default(""),
      })
      .optional(),

    // Gouvernance — Modèle de pilotage et décision
    governance: z
      .object({
        comiteStrategique: z
          .object({
            frequence: z.string().default(""),
            participants: z.array(z.string()).default([]),
            objectif: z.string().default(""),
          })
          .default({}),
        comitePilotage: z
          .object({
            frequence: z.string().default(""),
            participants: z.array(z.string()).default([]),
            objectif: z.string().default(""),
          })
          .default({}),
        pointsOperationnels: z
          .object({
            frequence: z.string().default(""),
            participants: z.array(z.string()).default([]),
            objectif: z.string().default(""),
          })
          .default({}),
        processValidation: z.string().default(""),
        delaisStandards: z
          .array(
            z.object({
              livrable: z.string().default(""),
              delai: z.string().default(""),
            }),
          )
          .default([]),
      })
      .optional(),

    // Streams de travail — Organisation par flux
    workstreams: z
      .array(
        z.object({
          name: z.string().default(""),
          objectif: z.string().default(""),
          livrables: z.array(z.string()).default([]),
          frequence: z.string().default(""),
          kpis: z.array(z.string()).default([]),
        }),
      )
      .optional(),

    // Architecture de Marque — Hiérarchie et coexistence
    brandArchitecture: z
      .object({
        model: z.string().default(""),
        hierarchy: z
          .array(
            z.object({
              brand: z.string().default(""),
              level: z.string().default(""),
              role: z.string().default(""),
            }),
          )
          .default([]),
        coexistenceRules: z.string().default(""),
      })
      .optional(),

    // Principes directeurs — Do's / Don'ts / Critères
    guidingPrinciples: z
      .object({
        dos: z.array(z.string()).default([]),
        donts: z.array(z.string()).default([]),
        communicationPrinciples: z.array(z.string()).default([]),
        coherenceCriteria: z.array(z.string()).default([]),
      })
      .optional(),

    coherenceScore: z.coerce.number().min(0).max(100).catch(0),
    executiveSummary: z.string().default(""),
  })
  .strip();

export type ImplementationData = z.infer<typeof ImplementationDataSchema>;

// ---------------------------------------------------------------------------
// Pilier S — Synthèse Stratégique
// ---------------------------------------------------------------------------

export const SynthesePillarSchema = z
  .object({
    syntheseExecutive: z.string().default(""),
    visionStrategique: z.string().default(""),
    coherencePiliers: z
      .array(
        z.object({
          pilier: z.string().default(""),
          contribution: z.string().default(""),
          articulation: z.string().default(""),
        }),
      )
      .default([]),
    facteursClesSucces: z.array(z.string()).default([]),
    recommandationsPrioritaires: z
      .array(
        z.object({
          action: z.string().default(""),
          priorite: num,
          impact: z.string().default(""),
          delai: z.string().default(""),
        }),
      )
      .default([]),
    scoreCoherence: z.coerce.number().min(0).max(100).catch(0),
  })
  .strip();

export type SynthesePillarData = z.infer<typeof SynthesePillarSchema>;

// ---------------------------------------------------------------------------
// Union type for any pillar data
// ---------------------------------------------------------------------------

export type PillarData =
  | AuthenticitePillarData
  | DistinctionPillarData
  | ValeurPillarData
  | EngagementPillarData
  | SynthesePillarData;

// ---------------------------------------------------------------------------
// Schema map — dispatch by pillar type
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PILLAR_SCHEMAS: Record<string, z.ZodType<any>> = {
  A: AuthenticitePillarSchema,
  D: DistinctionPillarSchema,
  V: ValeurPillarSchema,
  E: EngagementPillarSchema,
  R: RiskAuditResultSchema,
  T: TrackAuditResultSchema,
  I: ImplementationDataSchema,
  S: SynthesePillarSchema,
};
