// =============================================================================
// Pilier I — Implementation
// =============================================================================

import { z } from "zod";
import { flexStringArray, num } from "./shared";

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
        values: flexStringArray,
        narrative: z.string().default(""),
      })
      .default({}),
    positioning: z
      .object({
        statement: z.string().default(""),
        differentiators: flexStringArray,
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
            strengths: flexStringArray,
            weaknesses: flexStringArray,
            opportunities: flexStringArray,
            threats: flexStringArray,
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
        trends: flexStringArray,
        recommendations: flexStringArray,
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
        year1Priorities: flexStringArray,
        year3Vision: z.string().default(""),
      })
      .default({}),
    campaigns: z
      .object({
        annualCalendar: z
          .array(
            z.object({
              mois: z.string().default(""),
              campagne: z.string().default(""),
              objectif: z.string().default(""),
              canaux: flexStringArray,
              budget: z.string().default(""),
              kpiCible: z.string().default(""),
              actionsDetaillees: flexStringArray,
              messagesCles: flexStringArray,
              budgetDetail: z
                .object({
                  production: z.string().default(""),
                  media: z.string().default(""),
                  talent: z.string().default(""),
                })
                .optional(),
              timeline: z
                .object({
                  debut: z.string().default(""),
                  fin: z.string().default(""),
                })
                .optional(),
              metriquesSucces: flexStringArray,
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
              canauxPrincipaux: flexStringArray,
              messagesCles: flexStringArray,
              budgetEstime: z.string().default(""),
              kpisAttendus: flexStringArray,
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
      .default({}),
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
      .default({}),
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
      .default({}),
    launchPlan: z
      .object({
        phases: z
          .array(
            z.object({
              nom: z.string().default(""),
              debut: z.string().default(""),
              fin: z.string().default(""),
              objectifs: flexStringArray,
              livrables: flexStringArray,
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
      .default({}),
    operationalPlaybook: z
      .object({
        rythmeQuotidien: flexStringArray,
        rythmeHebdomadaire: flexStringArray,
        rythmeMensuel: flexStringArray,
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
      .default({}),

    // ====== SECTIONS STRATÉGIQUES UPGRADERS ======

    brandPlatform: z
      .object({
        purpose: z.string().default(""),
        vision: z.string().default(""),
        mission: z.string().default(""),
        values: flexStringArray,
        personality: z.string().default(""),
        territory: z.string().default(""),
        tagline: z.string().default(""),
      })
      .default({}),
    copyStrategy: z
      .object({
        promise: z.string().default(""),
        rtb: flexStringArray,
        consumerBenefit: z.string().default(""),
        tone: z.string().default(""),
        constraint: z.string().default(""),
      })
      .default({}),
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
      .default({}),
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
      .default({}),
    governance: z
      .object({
        comiteStrategique: z
          .object({
            frequence: z.string().default(""),
            participants: flexStringArray,
            objectif: z.string().default(""),
          })
          .default({}),
        comitePilotage: z
          .object({
            frequence: z.string().default(""),
            participants: flexStringArray,
            objectif: z.string().default(""),
          })
          .default({}),
        pointsOperationnels: z
          .object({
            frequence: z.string().default(""),
            participants: flexStringArray,
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
      .default({}),
    workstreams: z
      .array(
        z.object({
          name: z.string().default(""),
          objectif: z.string().default(""),
          livrables: flexStringArray,
          frequence: z.string().default(""),
          kpis: flexStringArray,
        }),
      )
      .default([]),
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
      .default({}),
    guidingPrinciples: z
      .object({
        dos: flexStringArray,
        donts: flexStringArray,
        communicationPrinciples: flexStringArray,
        coherenceCriteria: flexStringArray,
      })
      .default({}),

    coherenceScore: z.coerce.number().min(0).max(100).catch(0),
    executiveSummary: z.string().default(""),
  })
  .strip();

export type ImplementationData = z.infer<typeof ImplementationDataSchema>;
