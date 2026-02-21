// =============================================================================
// MODULE 9 — Implementation Generation (Pillar I)
// =============================================================================
//
// Generates the operational cockpit data for Pillar I using a 2-pass strategy:
//   Pass 1 (~10K tokens): Core strategic sections (engagement, campaigns, brand platform)
//   Pass 2 (~12K tokens): Operational sections (budget, team, governance, launch plan)
// Total: ~22K tokens of structured JSON output.
//
// PUBLIC API :
//   9.1  generateImplementationData() — Full 2-pass generation → ImplementationData
//
// INTERNAL :
//   9.H1  buildSharedContext()  — Assembles interview + audit + fiche context
//   9.H2  generatePass1()      — Core sections (engagement, campaigns, brand platform)
//   9.H3  generatePass2()      — Operational sections (budget, team, governance)
//   9.H4  mergeResults()       — Deep-merges Pass 1 + Pass 2 into final ImplementationData
//
// DEPENDENCIES :
//   - Module 5  (anthropic-client) → resilientGenerateText, anthropic, DEFAULT_MODEL
//   - Module 5B (prompt-helpers)   → injectSpecialization, SpecializationOptions
//   - lib/types/pillar-schemas → RiskAuditResult, TrackAuditResult, ImplementationData
//
// CALLED BY :
//   - API Route POST /api/ai/generate (pillarType I)
//   - Module 10 (fiche-upgrade.ts) → regenerateAllPillars()
//
// =============================================================================

import { anthropic, DEFAULT_MODEL, resilientGenerateText } from "./anthropic-client";
import type { RiskAuditResult, TrackAuditResult } from "./audit-generation";
import type { ImplementationData } from "~/lib/types/implementation-data";
import { parseAiGeneratedContent } from "~/lib/types/pillar-parsers";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { injectSpecialization, type SpecializationOptions } from "./prompt-helpers";

// ---------------------------------------------------------------------------
// JSON Rules (shared between passes)
// ---------------------------------------------------------------------------

const JSON_RULES = `RÈGLES CRITIQUES :
- Réponds UNIQUEMENT avec du JSON valide
- Pas de commentaires, pas de markdown, pas de texte avant/après le JSON
- Remplis TOUS les champs avec des données concrètes, spécifiques à la marque
- Utilise les données validées de l'audit (pas tes propres analyses)
- Si une donnée n'est pas fournie, propose une recommandation réaliste basée sur le secteur`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate the Implementation Data (Pillar I).
 * Uses a 2-pass approach for higher quality:
 * - Pass 1: Core strategic sections
 * - Pass 2: Enriched operational sections (using Pass 1 as context)
 */
export async function generateImplementationData(
  interviewData: Record<string, string>,
  riskAudit: RiskAuditResult,
  trackAudit: TrackAuditResult,
  ficheContent: Array<{ type: string; content: string }>,
  brandName: string,
  sector: string,
  specialization?: SpecializationOptions | null,
  tagline?: string | null,
): Promise<ImplementationData> {
  // Build shared context
  const sharedContext = buildSharedContext(
    interviewData,
    riskAudit,
    trackAudit,
    ficheContent,
    brandName,
    sector,
    tagline,
  );

  // ── Pass 1: Core sections ──
  const pass1Result = await generatePass1(
    sharedContext,
    brandName,
    sector,
    riskAudit,
    trackAudit,
    specialization,
    tagline,
  );

  // ── Pass 2: Enriched sections (with Pass 1 as context) ──
  const pass2Result = await generatePass2(
    sharedContext,
    pass1Result,
    brandName,
    sector,
    specialization,
    tagline,
  );

  // Merge both passes into a single object
  const merged = { ...pass1Result, ...pass2Result };

  // Validate with Zod schema
  const { data, errors } = parseAiGeneratedContent<ImplementationData>("I", JSON.stringify(merged));
  if (errors?.length) {
    console.warn("[Implementation] Pillar I validation issues:", errors);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Context builder (shared between passes)
// ---------------------------------------------------------------------------

interface SharedContext {
  ficheContext: string;
  interviewSummary: string;
  riskSummary: string;
  trackSummary: string;
  taglineContext: string;
}

function buildSharedContext(
  interviewData: Record<string, string>,
  riskAudit: RiskAuditResult,
  trackAudit: TrackAuditResult,
  ficheContent: Array<{ type: string; content: string }>,
  brandName: string,
  sector: string,
  tagline?: string | null,
): SharedContext {
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

  const riskSummary = `Score de risque : ${riskAudit.riskScore}/100
${riskAudit.riskScoreJustification}

SWOT Global :
- Forces : ${riskAudit.globalSwot.strengths.join(", ")}
- Faiblesses : ${riskAudit.globalSwot.weaknesses.join(", ")}
- Opportunités : ${riskAudit.globalSwot.opportunities.join(", ")}
- Menaces : ${riskAudit.globalSwot.threats.join(", ")}

Top risques :
${riskAudit.probabilityImpactMatrix.slice(0, 5).map((r) => `- ${r.risk} (P: ${r.probability}, I: ${r.impact})`).join("\n")}

Mitigations :
${riskAudit.mitigationPriorities.slice(0, 5).map((m) => `- ${m.risk}: ${m.action} (${m.urgency})`).join("\n")}`;

  const trackSummary = `Brand-Market Fit : ${trackAudit.brandMarketFitScore}/100
${trackAudit.brandMarketFitJustification}

TAM : ${trackAudit.tamSamSom.tam.value} — ${trackAudit.tamSamSom.tam.description}
SAM : ${trackAudit.tamSamSom.sam.value} — ${trackAudit.tamSamSom.sam.description}
SOM : ${trackAudit.tamSamSom.som.value} — ${trackAudit.tamSamSom.som.description}

Tendances : ${trackAudit.marketReality.macroTrends.join(", ")}
Signaux faibles : ${trackAudit.marketReality.weakSignals.join(", ")}

Recommandations : ${trackAudit.strategicRecommendations.join(" | ")}

Concurrents :
${trackAudit.competitiveBenchmark.map((c) => `- ${c.competitor}: Forces(${c.strengths.join(", ")}), Faiblesses(${c.weaknesses.join(", ")}), PDM: ${c.marketShare}`).join("\n")}`;

  const taglineContext = tagline ? `Accroche de marque : "${tagline}"` : "";
  return { ficheContext, interviewSummary, riskSummary, trackSummary, taglineContext };
}

// ---------------------------------------------------------------------------
// Pass 1: Core strategic sections
// ---------------------------------------------------------------------------

async function generatePass1(
  ctx: SharedContext,
  brandName: string,
  sector: string,
  riskAudit: RiskAuditResult,
  trackAudit: TrackAuditResult,
  specialization?: SpecializationOptions | null,
  tagline?: string | null,
): Promise<Record<string, unknown>> {
  const { text } = await resilientGenerateText({
    label: "pillar-I-pass1",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`Tu es un consultant stratégique senior utilisant la méthodologie ADVERTIS.
Tu synthétises les données collectées (Fiche A-D-V-E + audits R+T) en données structurées pour le cockpit stratégique.

CONTEXTE :
- Marque : ${brandName}${tagline ? `\n- Accroche : "${tagline}"` : ""}
- Secteur : ${sector || "Non spécifié"}

DONNÉES FICHE DE MARQUE (A-D-V-E) :
${ctx.ficheContext}

DONNÉES D'ENTRETIEN :
${ctx.interviewSummary}

RÉSULTATS AUDIT R (Risk) :
${ctx.riskSummary}

RÉSULTATS AUDIT T (Track) :
${ctx.trackSummary}

INSTRUCTIONS — PASSE 1 (Sections stratégiques core) :
Génère les 7 sections fondamentales + le résumé exécutif.

FORMAT JSON OBLIGATOIRE :
{
  "brandIdentity": {
    "archetype": "L'archétype de marque dominant",
    "purpose": "La raison d'être de la marque",
    "vision": "La vision à long terme",
    "values": ["valeur1", "valeur2", "valeur3"],
    "narrative": "Le récit de marque en 3-5 phrases"
  },
  "positioning": {
    "statement": "Pour [cible], [marque] est [catégorie] qui [diff] parce que [preuve]",
    "differentiators": ["diff1", "diff2", "diff3"],
    "toneOfVoice": "Description du ton de voix",
    "personas": [{ "name": "Nom", "description": "Description", "priority": 1 }],
    "competitors": [{ "name": "Nom", "position": "Position" }]
  },
  "valueArchitecture": {
    "productLadder": [{ "tier": "Nom", "price": "Prix", "description": "Desc" }],
    "valueProposition": "Proposition de valeur principale",
    "unitEconomics": { "cac": "CAC", "ltv": "LTV", "ratio": "Ratio", "notes": "Notes" }
  },
  "engagementStrategy": {
    "touchpoints": [{ "channel": "Canal", "role": "Rôle", "priority": 1 }],
    "rituals": [{ "name": "Nom", "frequency": "Freq", "description": "Desc" }],
    "aarrr": { "acquisition": "...", "activation": "...", "retention": "...", "revenue": "...", "referral": "..." },
    "kpis": [{ "name": "KPI", "target": "Cible", "frequency": "Freq" }]
  },
  "riskSynthesis": {
    "riskScore": ${riskAudit.riskScore},
    "globalSwot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
    "topRisks": [{ "risk": "Risque", "impact": "Impact", "mitigation": "Plan" }]
  },
  "marketValidation": {
    "brandMarketFitScore": ${trackAudit.brandMarketFitScore},
    "tam": "${trackAudit.tamSamSom.tam.value}",
    "sam": "${trackAudit.tamSamSom.sam.value}",
    "som": "${trackAudit.tamSamSom.som.value}",
    "trends": ["tendance1", "tendance2"],
    "recommendations": ["reco1", "reco2"]
  },
  "strategicRoadmap": {
    "sprint90Days": [{ "action": "Action", "owner": "Responsable", "kpi": "KPI" }],
    "year1Priorities": ["priorité1", "priorité2", "priorité3"],
    "year3Vision": "Vision à 3 ans"
  },
  "coherenceScore": 75,
  "executiveSummary": "Résumé exécutif de 5-10 phrases..."
}

RÈGLES :
- Génère 2-4 personas, 3+ différenciateurs, 2-4 tiers de product ladder
- Sprint 90 jours : 8-12 actions concrètes avec owner et KPI
- Le SWOT doit avoir 3-5 items par quadrant
- 3-5 risques prioritaires avec plans de mitigation
- executiveSummary doit faire 5-10 phrases de synthèse complètes
${JSON_RULES}`, specialization),
    prompt: `Génère les données stratégiques core (Passe 1) pour la marque "${brandName}"${tagline ? ` (accroche: "${tagline}")` : ""} dans le secteur "${sector || "Non spécifié"}".`,
    maxOutputTokens: 10000,
    temperature: 0.3,
  });

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    // Validate core fields exist — don't accept empty Pass 1
    if (!parsed.brandIdentity && !parsed.positioning && !parsed.executiveSummary) {
      throw new Error("Pass 1 returned incomplete data — missing core fields");
    }
    return parsed;
  } catch (err) {
    console.error("[Implementation] Pass 1 failed:", err);
    throw new Error(`Pillar I Pass 1: ${err instanceof Error ? err.message : "JSON parse error"}`);
  }
}

// ---------------------------------------------------------------------------
// Pass 2: Enriched operational sections
// ---------------------------------------------------------------------------

async function generatePass2(
  ctx: SharedContext,
  pass1Data: Record<string, unknown>,
  brandName: string,
  sector: string,
  specialization?: SpecializationOptions | null,
  tagline?: string | null,
): Promise<Record<string, unknown>> {
  // Summarize Pass 1 for context continuity
  const pass1Summary = JSON.stringify(pass1Data).substring(0, 6000);

  const { text } = await resilientGenerateText({
    label: "pillar-I-pass2",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`Tu es un consultant stratégique senior utilisant la méthodologie ADVERTIS.
Tu complètes les données d'implémentation avec les sections opérationnelles enrichies.

CONTEXTE :
- Marque : ${brandName}${tagline ? `\n- Accroche : "${tagline}"` : ""}
- Secteur : ${sector || "Non spécifié"}

DONNÉES STRATÉGIQUES DÉJÀ GÉNÉRÉES (Passe 1) :
${pass1Summary}

DONNÉES SOURCE :
${ctx.ficheContext.substring(0, 4000)}

INSTRUCTIONS — PASSE 2 (Sections opérationnelles enrichies) :
Génère les sections opérationnelles. Chaque section doit être remplie en détail.

FORMAT JSON OBLIGATOIRE :
{
  "campaigns": {
    "annualCalendar": [
      { "mois": "Janvier", "campagne": "Nom", "objectif": "Objectif", "canaux": ["Instagram"], "budget": "500€", "kpiCible": "KPI" }
    ],
    "templates": [
      { "nom": "Template", "type": "lancement", "description": "Desc", "duree": "3 semaines", "canauxPrincipaux": ["Instagram"], "messagesCles": ["Message"] }
    ],
    "activationPlan": {
      "phase1Teasing": "Stratégie de teasing",
      "phase2Lancement": "Stratégie de lancement",
      "phase3Amplification": "Stratégie d'amplification",
      "phase4Fidelisation": "Stratégie de fidélisation"
    }
  },
  "budgetAllocation": {
    "enveloppeGlobale": "Budget total annuel",
    "parPoste": [{ "poste": "Poste", "montant": "€", "pourcentage": 25, "justification": "Justif" }],
    "parPhase": [{ "phase": "Phase", "montant": "€", "focus": "Focus" }],
    "roiProjections": { "mois6": "ROI 6m", "mois12": "ROI 12m", "mois24": "ROI 24m", "hypotheses": "Hyp" }
  },
  "teamStructure": {
    "equipeActuelle": [{ "role": "Rôle", "profil": "Profil", "allocation": "Temps" }],
    "recrutements": [{ "role": "Rôle", "profil": "Profil", "echeance": "Échéance", "priorite": 1 }],
    "partenairesExternes": [{ "type": "Type", "mission": "Mission", "budget": "€", "duree": "Durée" }]
  },
  "launchPlan": {
    "phases": [{ "nom": "Phase 1", "debut": "M1", "fin": "M2", "objectifs": ["Obj"], "livrables": ["Livr"], "goNoGo": "Critère" }],
    "milestones": [{ "date": "M1", "jalon": "Jalon", "responsable": "Resp", "critereSucces": "Critère" }]
  },
  "operationalPlaybook": {
    "rythmeQuotidien": ["Action 1"],
    "rythmeHebdomadaire": ["Action 1"],
    "rythmeMensuel": ["Action 1"],
    "escalation": [{ "scenario": "Crise", "action": "Action", "responsable": "Resp" }],
    "outilsStack": [{ "outil": "Outil", "usage": "Usage", "cout": "€/mois" }]
  },
  "brandPlatform": {
    "purpose": "Raison d'être (WHY)",
    "vision": "Vision à 10 ans",
    "mission": "Mission quotidienne",
    "values": ["valeur1 — explication", "valeur2 — explication", "valeur3 — explication"],
    "personality": "Personnalité de marque (3-5 traits)",
    "territory": "Territoire d'expression",
    "tagline": "Signature de marque"
  },
  "copyStrategy": {
    "promise": "Promesse centrale",
    "rtb": ["RTB 1", "RTB 2"],
    "consumerBenefit": "Bénéfice consommateur",
    "tone": "Ton de communication",
    "constraint": "Contraintes"
  },
  "bigIdea": {
    "concept": "Concept créatif central",
    "mechanism": "Mécanisme créatif",
    "insightLink": "Lien avec l'insight",
    "declinaisons": [
      { "support": "Spot TV/Vidéo", "description": "Déclinaison" },
      { "support": "Social Media", "description": "Déclinaison" },
      { "support": "Affichage/Print", "description": "Déclinaison" },
      { "support": "Digital/Web", "description": "Déclinaison" },
      { "support": "Activation terrain", "description": "Déclinaison" }
    ]
  },
  "activationDispositif": {
    "owned": [{ "canal": "Canal", "role": "Rôle", "budget": "€" }],
    "earned": [{ "canal": "Canal", "role": "Rôle", "budget": "€" }],
    "paid": [{ "canal": "Canal", "role": "Rôle", "budget": "€" }],
    "shared": [{ "canal": "Canal", "role": "Rôle", "budget": "€" }],
    "parcoursConso": "Parcours cross-canal"
  },
  "governance": {
    "comiteStrategique": { "frequence": "Trimestriel", "participants": "Direction", "objectif": "Orientations" },
    "comitePilotage": { "frequence": "Mensuel", "participants": "Équipe", "objectif": "Suivi KPIs" },
    "pointsOperationnels": { "frequence": "Hebdomadaire", "participants": "Opérationnel", "objectif": "Coordination" },
    "processValidation": "Circuit de validation",
    "delaisStandards": [{ "livrable": "Type", "delai": "Délai" }]
  },
  "workstreams": [
    { "name": "Stream", "objectif": "Objectif", "livrables": ["L1"], "frequence": "Freq", "kpis": ["KPI"] }
  ],
  "brandArchitecture": {
    "model": "Branded House / House of Brands / Endorsed / Hybrid",
    "hierarchy": [{ "brand": "Nom", "level": "corporate/master/sub/product", "role": "Rôle" }],
    "coexistenceRules": "Règles de coexistence"
  },
  "guidingPrinciples": {
    "dos": ["Do 1", "Do 2", "Do 3"],
    "donts": ["Don't 1", "Don't 2", "Don't 3"],
    "communicationPrinciples": ["Principe 1", "Principe 2"],
    "coherenceCriteria": ["Critère 1", "Critère 2"]
  }
}

RÈGLES :
- annualCalendar : OBLIGATOIRE 12 mois (un par mois)
- campaigns.templates : 3-4 types différents (lancement, récurrence, événement, activation)
- budgetAllocation : ventilé par poste ET par phase
- launchPlan : 3-5 phases avec critères go/no-go
- operationalPlaybook : rythmes quotidien, hebdo et mensuel
- brandPlatform : purpose, vision, mission, values (3-5), personality, territory, tagline — tout rempli
- copyStrategy : promesse + RTB (2-3) + bénéfice + ton + contrainte
- bigIdea : 5+ déclinaisons (TV, social, print, digital, terrain)
- activationDispositif : 4 catégories POEM + parcours conso
- governance : 3 niveaux + process validation
- workstreams : minimum 3 streams
- guidingPrinciples : minimum 3 do's et 3 don'ts
${JSON_RULES}`, specialization),
    prompt: `Génère les données opérationnelles enrichies (Passe 2) pour la marque "${brandName}"${tagline ? ` (accroche: "${tagline}")` : ""} dans le secteur "${sector || "Non spécifié"}".
Appuie-toi sur les données stratégiques de la Passe 1 pour garantir la cohérence.`,
    maxOutputTokens: 12000,
    temperature: 0.3,
  });

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    // Validate operational fields exist — don't accept empty Pass 2
    if (!parsed.campaigns && !parsed.budgetAllocation && !parsed.brandPlatform) {
      throw new Error("Pass 2 returned incomplete data — missing operational sections");
    }
    return parsed;
  } catch (err) {
    console.error("[Implementation] Pass 2 failed:", err);
    throw new Error(`Pillar I Pass 2: ${err instanceof Error ? err.message : "JSON parse error"}`);
  }
}
