// Implementation Data Generation Service — Pillar I
// Synthesizes A-D-V-E fiche data + validated R+T audit results
// into a structured ImplementationData object for the Cockpit.

import { generateText } from "ai";

import { anthropic, DEFAULT_MODEL } from "./anthropic-client";
import type { RiskAuditResult, TrackAuditResult } from "./audit-generation";
import type { ImplementationData } from "~/lib/types/implementation-data";
import { parseAiGeneratedContent } from "~/lib/types/pillar-parsers";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate the Implementation Data (Pillar I).
 * This takes all A-D-V-E interview data + validated R+T audit results
 * and produces a structured JSON object for the Cockpit dashboard.
 */
export async function generateImplementationData(
  interviewData: Record<string, string>,
  riskAudit: RiskAuditResult,
  trackAudit: TrackAuditResult,
  ficheContent: Array<{ type: string; content: string }>,
  brandName: string,
  sector: string,
): Promise<ImplementationData> {
  // Build context from fiche pillars
  const ficheContext = ficheContent
    .map((p) => {
      const config = PILLAR_CONFIG[p.type as PillarType];
      const truncated =
        p.content.length > 4000
          ? p.content.substring(0, 4000) + "\n[... tronqué ...]"
          : p.content;
      return `### Pilier ${p.type} — ${config?.title ?? p.type}\n${truncated}`;
    })
    .join("\n\n");

  // Summarize interview data (values may be objects from JSON import)
  const interviewSummary = Object.entries(interviewData)
    .filter(([, val]) => {
      const str = typeof val === "string" ? val : JSON.stringify(val ?? "");
      return str.trim().length > 0;
    })
    .map(([key, val]) => {
      const str = typeof val === "string" ? val : JSON.stringify(val ?? "");
      return `- ${key}: ${str.trim().substring(0, 300)}`;
    })
    .join("\n");

  // Risk audit summary
  const riskSummary = `Score de risque : ${riskAudit.riskScore}/100
${riskAudit.riskScoreJustification}

SWOT Global :
- Forces : ${riskAudit.globalSwot.strengths.join(", ")}
- Faiblesses : ${riskAudit.globalSwot.weaknesses.join(", ")}
- Opportunités : ${riskAudit.globalSwot.opportunities.join(", ")}
- Menaces : ${riskAudit.globalSwot.threats.join(", ")}

Top risques :
${riskAudit.probabilityImpactMatrix.slice(0, 5).map((r) => `- ${r.risk} (Probabilité: ${r.probability}, Impact: ${r.impact})`).join("\n")}

Mitigations prioritaires :
${riskAudit.mitigationPriorities.slice(0, 5).map((m) => `- ${m.risk}: ${m.action} (${m.urgency})`).join("\n")}`;

  // Track audit summary
  const trackSummary = `Brand-Market Fit : ${trackAudit.brandMarketFitScore}/100
${trackAudit.brandMarketFitJustification}

TAM : ${trackAudit.tamSamSom.tam.value} — ${trackAudit.tamSamSom.tam.description}
SAM : ${trackAudit.tamSamSom.sam.value} — ${trackAudit.tamSamSom.sam.description}
SOM : ${trackAudit.tamSamSom.som.value} — ${trackAudit.tamSamSom.som.description}

Tendances macro : ${trackAudit.marketReality.macroTrends.join(", ")}
Signaux faibles : ${trackAudit.marketReality.weakSignals.join(", ")}

Recommandations : ${trackAudit.strategicRecommendations.join(" | ")}

Concurrents :
${trackAudit.competitiveBenchmark.map((c) => `- ${c.competitor}: Forces(${c.strengths.join(", ")}), Faiblesses(${c.weaknesses.join(", ")}), PDM: ${c.marketShare}`).join("\n")}`;

  const { text } = await generateText({
    model: anthropic(DEFAULT_MODEL),
    system: `Tu es un consultant stratégique senior utilisant la méthodologie ADVERTIS.
Tu dois synthétiser toutes les données collectées (Fiche de marque A-D-V-E) et les résultats d'audit validés (R+T) en un document de données structurées qui alimentera le cockpit stratégique interactif.

CONTEXTE :
- Marque : ${brandName}
- Secteur : ${sector || "Non spécifié"}

DONNÉES FICHE DE MARQUE (A-D-V-E) :
${ficheContext}

DONNÉES D'ENTRETIEN BRUTES :
${interviewSummary}

RÉSULTATS AUDIT R (Risk) — VALIDÉS :
${riskSummary}

RÉSULTATS AUDIT T (Track) — VALIDÉS :
${trackSummary}

INSTRUCTIONS :
Génère un objet JSON structuré complet de type ImplementationData. Chaque section doit être remplie avec des données concrètes, spécifiques à la marque, et actionables. Ne laisse aucun champ vide.

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict) :
{
  "brandIdentity": {
    "archetype": "L'archétype de marque dominant (ex: Le Magicien, Le Héros...)",
    "purpose": "La raison d'être de la marque",
    "vision": "La vision à long terme",
    "values": ["valeur1", "valeur2", "valeur3"],
    "narrative": "Le récit de marque en 3-5 phrases"
  },
  "positioning": {
    "statement": "Déclaration de positionnement complète",
    "differentiators": ["différenciateur1", "différenciateur2"],
    "toneOfVoice": "Description du ton de voix",
    "personas": [
      { "name": "Nom", "description": "Description", "priority": 1 }
    ],
    "competitors": [
      { "name": "Nom", "position": "Position sur le marché" }
    ]
  },
  "valueArchitecture": {
    "productLadder": [
      { "tier": "Nom du niveau", "price": "Prix", "description": "Description" }
    ],
    "valueProposition": "Proposition de valeur principale",
    "unitEconomics": {
      "cac": "Coût d'acquisition client estimé",
      "ltv": "Valeur vie client estimée",
      "ratio": "Ratio LTV/CAC",
      "notes": "Notes et hypothèses"
    }
  },
  "engagementStrategy": {
    "touchpoints": [
      { "channel": "Canal", "role": "Rôle", "priority": 1 }
    ],
    "rituals": [
      { "name": "Nom", "frequency": "Fréquence", "description": "Description" }
    ],
    "aarrr": {
      "acquisition": "Stratégie d'acquisition",
      "activation": "Stratégie d'activation",
      "retention": "Stratégie de rétention",
      "revenue": "Stratégie de revenu",
      "referral": "Stratégie de referral"
    },
    "kpis": [
      { "name": "Nom du KPI", "target": "Objectif", "frequency": "Fréquence" }
    ]
  },
  "riskSynthesis": {
    "riskScore": ${riskAudit.riskScore},
    "globalSwot": {
      "strengths": ["..."],
      "weaknesses": ["..."],
      "opportunities": ["..."],
      "threats": ["..."]
    },
    "topRisks": [
      { "risk": "Risque", "impact": "Impact", "mitigation": "Plan de mitigation" }
    ]
  },
  "marketValidation": {
    "brandMarketFitScore": ${trackAudit.brandMarketFitScore},
    "tam": "${trackAudit.tamSamSom.tam.value}",
    "sam": "${trackAudit.tamSamSom.sam.value}",
    "som": "${trackAudit.tamSamSom.som.value}",
    "trends": ["tendance1", "tendance2"],
    "recommendations": ["recommandation1", "recommandation2"]
  },
  "strategicRoadmap": {
    "sprint90Days": [
      { "action": "Action", "owner": "Responsable", "kpi": "KPI de suivi" }
    ],
    "year1Priorities": ["priorité1", "priorité2"],
    "year3Vision": "Vision à 3 ans"
  },
  "campaigns": {
    "annualCalendar": [
      { "mois": "Janvier", "campagne": "Nom de la campagne", "objectif": "Objectif principal", "canaux": ["Instagram", "Email"], "budget": "500€", "kpiCible": "KPI mesurable" }
    ],
    "templates": [
      { "nom": "Template Lancement", "type": "lancement", "description": "Description", "duree": "3 semaines", "canauxPrincipaux": ["Instagram", "TikTok"], "messagesCles": ["Message 1"] }
    ],
    "activationPlan": {
      "phase1Teasing": "Stratégie de teasing pré-lancement",
      "phase2Lancement": "Stratégie de lancement",
      "phase3Amplification": "Stratégie d'amplification post-lancement",
      "phase4Fidelisation": "Stratégie de fidélisation"
    }
  },
  "budgetAllocation": {
    "enveloppeGlobale": "Budget total annuel estimé",
    "parPoste": [
      { "poste": "Publicité digitale", "montant": "5000€", "pourcentage": 25, "justification": "Justification de l'allocation" }
    ],
    "parPhase": [
      { "phase": "Phase de lancement (M1-M3)", "montant": "8000€", "focus": "Focus principal de la phase" }
    ],
    "roiProjections": {
      "mois6": "ROI projeté à 6 mois",
      "mois12": "ROI projeté à 12 mois",
      "mois24": "ROI projeté à 24 mois",
      "hypotheses": "Hypothèses sous-jacentes"
    }
  },
  "teamStructure": {
    "equipeActuelle": [
      { "role": "Rôle", "profil": "Profil/compétences", "allocation": "Temps dédié" }
    ],
    "recrutements": [
      { "role": "Rôle à recruter", "profil": "Profil recherché", "echeance": "Échéance", "priorite": 1 }
    ],
    "partenairesExternes": [
      { "type": "Agence / Freelance", "mission": "Mission confiée", "budget": "Budget", "duree": "Durée de la mission" }
    ]
  },
  "launchPlan": {
    "phases": [
      { "nom": "Phase 1 — Préparation", "debut": "M1", "fin": "M2", "objectifs": ["Objectif 1"], "livrables": ["Livrable 1"], "goNoGo": "Critère go/no-go" }
    ],
    "milestones": [
      { "date": "M1 S2", "jalon": "Description du jalon", "responsable": "Responsable", "critereSucces": "Critère de succès" }
    ]
  },
  "operationalPlaybook": {
    "rythmeQuotidien": ["Action quotidienne 1"],
    "rythmeHebdomadaire": ["Action hebdomadaire 1"],
    "rythmeMensuel": ["Action mensuelle 1"],
    "escalation": [
      { "scenario": "Scénario de crise", "action": "Action à prendre", "responsable": "Responsable" }
    ],
    "outilsStack": [
      { "outil": "Nom de l'outil", "usage": "Usage principal", "cout": "Coût mensuel" }
    ]
  },
  "brandPlatform": {
    "purpose": "La raison d'être profonde de la marque (le WHY de Simon Sinek)",
    "vision": "Ce que la marque veut accomplir dans le monde à 10 ans",
    "mission": "Comment la marque concrétise sa vision au quotidien",
    "values": ["valeur1 — explication", "valeur2 — explication", "valeur3 — explication"],
    "personality": "Description de la personnalité de marque (3-5 traits + tonalité)",
    "territory": "Le territoire d'expression exclusif de la marque (univers sémantique, visuel, émotionnel)",
    "tagline": "La signature de marque (baseline) — concise, mémorable, différenciante"
  },
  "copyStrategy": {
    "promise": "La promesse centrale faite au consommateur",
    "rtb": ["Reason to believe 1 — preuve tangible", "Reason to believe 2"],
    "consumerBenefit": "Le bénéfice consommateur principal (fonctionnel + émotionnel)",
    "tone": "Le ton de communication (registre, niveau de langue, attitude)",
    "constraint": "Les contraintes légales, réglementaires ou brand guidelines à respecter"
  },
  "bigIdea": {
    "concept": "Le concept créatif central — l'idée maîtresse de la campagne",
    "mechanism": "Le mécanisme créatif de déploiement (comment l'idée prend vie)",
    "insightLink": "Le lien avec l'insight consommateur qui fonde cette idée",
    "declinaisons": [
      { "support": "Spot TV/Vidéo", "description": "Déclinaison du concept sur ce support" },
      { "support": "Social Media", "description": "Déclinaison du concept sur ce support" },
      { "support": "Affichage/Print", "description": "Déclinaison du concept sur ce support" },
      { "support": "Digital/Web", "description": "Déclinaison du concept sur ce support" },
      { "support": "Activation terrain", "description": "Déclinaison du concept sur ce support" }
    ]
  },
  "activationDispositif": {
    "owned": [
      { "canal": "Canal owned", "role": "Rôle dans le dispositif", "budget": "Budget alloué" }
    ],
    "earned": [
      { "canal": "Canal earned", "role": "Rôle dans le dispositif", "budget": "Budget alloué" }
    ],
    "paid": [
      { "canal": "Canal paid", "role": "Rôle dans le dispositif", "budget": "Budget alloué" }
    ],
    "shared": [
      { "canal": "Canal shared", "role": "Rôle dans le dispositif", "budget": "Budget alloué" }
    ],
    "parcoursConso": "Description du parcours consommateur cross-canal (awareness → consideration → purchase → loyalty)"
  },
  "governance": {
    "comiteStrategique": { "frequence": "Trimestriel", "participants": "Direction + Agence", "objectif": "Validation des orientations stratégiques" },
    "comitePilotage": { "frequence": "Mensuel", "participants": "Équipe projet + Agence", "objectif": "Suivi des KPIs et ajustements tactiques" },
    "pointsOperationnels": { "frequence": "Hebdomadaire", "participants": "Équipe opérationnelle", "objectif": "Coordination des actions en cours" },
    "processValidation": "Description du circuit de validation (brief → concept → exé → BAT → diffusion)",
    "delaisStandards": [
      { "livrable": "Type de livrable", "delai": "Délai standard" }
    ]
  },
  "workstreams": [
    {
      "name": "Nom du stream de travail",
      "objectif": "Objectif principal du stream",
      "livrables": ["Livrable 1", "Livrable 2"],
      "frequence": "Fréquence de livraison",
      "kpis": ["KPI de suivi 1"]
    }
  ],
  "brandArchitecture": {
    "model": "Modèle d'architecture (Branded House / House of Brands / Endorsed / Hybrid)",
    "hierarchy": [
      { "brand": "Nom de la marque/sous-marque", "level": "corporate / master / sub / product", "role": "Rôle dans le portefeuille" }
    ],
    "coexistenceRules": "Règles de coexistence entre marques (lockup, hiérarchie visuelle, contextes d'utilisation)"
  },
  "guidingPrinciples": {
    "dos": ["Ce que la marque DOIT faire — principe directeur 1", "Principe directeur 2"],
    "donts": ["Ce que la marque ne doit JAMAIS faire — interdit 1", "Interdit 2"],
    "communicationPrinciples": ["Principe de communication 1", "Principe 2"],
    "coherenceCriteria": ["Critère de cohérence à vérifier 1", "Critère 2"]
  },
  "coherenceScore": 75,
  "executiveSummary": "Résumé exécutif en 5-10 phrases..."
}

RÈGLES CRITIQUES :
- Réponds UNIQUEMENT avec du JSON valide
- Pas de commentaires, pas de markdown, pas de texte avant/après
- Remplis TOUS les champs avec des données spécifiques à la marque
- Le coherenceScore doit refléter la cohérence globale de la stratégie (0-100)
- L'executiveSummary doit faire 5-10 phrases de synthèse
- Utilise les données validées de l'audit (pas tes propres analyses)
- Le calendrier de campagnes DOIT couvrir 12 mois (un par mois minimum)
- Les templates de campagne doivent inclure 3-4 types différents
- Le budget DOIT être ventilé par poste ET par phase
- L'équipe DOIT inclure les recrutements nécessaires
- Le plan de lancement DOIT avoir 3-5 phases avec des critères go/no-go
- Le playbook opérationnel DOIT inclure les rythmes quotidien, hebdomadaire et mensuel
- brandPlatform DOIT inclure purpose, vision, mission, values (3-5), personality, territory ET tagline — chaque champ doit être spécifique à la marque
- copyStrategy suit le format standard agence : promesse + RTB (2-3 preuves) + bénéfice + ton + contrainte
- bigIdea DOIT être déclinable sur 5+ supports minimum (TV, social, print, digital, terrain)
- activationDispositif DOIT couvrir les 4 catégories POEM (owned, earned, paid, shared) + parcours conso
- governance DOIT inclure 3 niveaux de comités (stratégique, pilotage, opérationnel) + process de validation
- workstreams : minimum 3 streams avec livrables concrets, fréquences et KPIs
- brandArchitecture : identifier le modèle approprié et la hiérarchie des marques
- guidingPrinciples : minimum 3 do's et 3 don'ts + principes de communication`,
    prompt: `Génère les données d'implémentation structurées pour la marque "${brandName}" dans le secteur "${sector || "Non spécifié"}".

Synthétise toutes les données fournies en un ImplementationData complet et actionable.`,
    maxOutputTokens: 18000,
    temperature: 0.3,
  });

  // Parse + validate with Zod schema (applies defaults for missing fields)
  const { data, errors } = parseAiGeneratedContent<ImplementationData>("I", text);
  if (errors?.length) {
    console.warn("[Implementation] Pillar I validation issues:", errors);
  }
  return data;
}
