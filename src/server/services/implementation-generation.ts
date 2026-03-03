// =============================================================================
// MODULE 9 — Implementation Generation (Pillar I)
// =============================================================================
//
// Generates the operational cockpit data for Pillar I using a 3-pass strategy:
//   Pass 1  (~10K tokens): Core strategic sections (identity, positioning, roadmap)
//   Pass 2a (~10K tokens): Campaigns & financial sections (calendar, budget, launch)
//   Pass 2b (~8K tokens):  Brand & operational sections (platform, governance, team)
// Total: ~28K tokens of structured JSON output.
//
// PUBLIC API :
//   9.1  generateImplementationData() — Full 3-pass generation → ImplementationData
//
// INTERNAL :
//   9.H0  safeParseJson()     — JSON.parse with jsonrepair fallback
//   9.H1  buildSharedContext() — Assembles interview + audit + fiche context
//   9.H2  generatePass1()     — Core sections (identity, positioning, roadmap)
//   9.H3  generatePass2a()    — Campaigns & financial sections
//   9.H4  generatePass2b()    — Brand & operational sections
//
// DEPENDENCIES :
//   - Module 5  (anthropic-client) → resilientGenerateText, anthropic, DEFAULT_MODEL
//   - Module 5B (prompt-helpers)   → injectSpecialization, SpecializationOptions
//   - lib/types/pillar-schemas → RiskAuditResult, TrackAuditResult, ImplementationData
//   - jsonrepair              → JSON repair for truncated/malformed AI output
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
import type { PillarType, SupportedCurrency } from "~/lib/constants";
import { injectSpecialization, type SpecializationOptions } from "./prompt-helpers";
import { getCurrencyPromptInstruction, getCurrencySymbol } from "~/lib/currency";
import { jsonrepair } from "jsonrepair";
import type { AIUsageMetadata } from "./ai-generation";
import { calculateParametricBudget, formatFormulaForPrompt } from "./budget-formula";

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
// JSON safe-parser with repair fallback
// ---------------------------------------------------------------------------

/**
 * Parse AI-generated text as JSON with automatic repair.
 * 1. Strip markdown code blocks
 * 2. Try JSON.parse()
 * 3. If that fails → jsonrepair() then JSON.parse() again
 */
function safeParseJson(text: string, label: string): Record<string, unknown> {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    console.warn(`[Implementation] ${label}: JSON.parse failed, attempting repair…`);
    try {
      const repaired = jsonrepair(cleaned);
      return JSON.parse(repaired) as Record<string, unknown>;
    } catch (repairErr) {
      throw new Error(
        `${label}: JSON irréparable — ${repairErr instanceof Error ? repairErr.message : "unknown"}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate the Implementation Data (Pillar I).
 * Uses a 3-pass approach for reliability:
 * - Pass 1:  Core strategic sections (identity, positioning, roadmap)
 * - Pass 2a: Campaigns & financial sections (calendar, budget, launch)
 * - Pass 2b: Brand & operational sections (platform, governance, team)
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
  currency?: SupportedCurrency,
  annualBudget?: number | null,
  targetRevenue?: number | null,
  maturity?: string | null,
): Promise<{ data: ImplementationData; usage: AIUsageMetadata }> {
  const overallStart = Date.now();

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

  // ── Pass 1: Core strategic sections ──
  const { data: pass1Result, usage: pass1Usage } = await generatePass1(
    sharedContext,
    brandName,
    sector,
    riskAudit,
    trackAudit,
    specialization,
    tagline,
    currency,
  );

  // ── Pass 2a: Campaigns & financial sections ──
  const { data: pass2aResult, usage: pass2aUsage } = await generatePass2a(
    sharedContext,
    pass1Result,
    brandName,
    sector,
    specialization,
    tagline,
    currency,
    annualBudget,
    targetRevenue,
    maturity,
  );

  // ── Pass 2b: Brand & operational sections ──
  const { data: pass2bResult, usage: pass2bUsage } = await generatePass2b(
    sharedContext,
    pass1Result,
    pass2aResult,
    brandName,
    sector,
    specialization,
    tagline,
    currency,
  );

  // Merge all 3 passes into a single object
  const merged = { ...pass1Result, ...pass2aResult, ...pass2bResult };

  // Validate with Zod schema (4-tier fallback: strict → coerce → deep-merge → defaults)
  const { data, errors } = parseAiGeneratedContent<ImplementationData>("I", JSON.stringify(merged));
  if (errors?.length) {
    console.warn("[Implementation] Pillar I validation issues:", errors);
  }
  return {
    data,
    usage: {
      model: DEFAULT_MODEL,
      tokensIn: pass1Usage.tokensIn + pass2aUsage.tokensIn + pass2bUsage.tokensIn,
      tokensOut: pass1Usage.tokensOut + pass2aUsage.tokensOut + pass2bUsage.tokensOut,
      durationMs: Date.now() - overallStart,
    },
  };
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
  currency?: SupportedCurrency,
): Promise<{ data: Record<string, unknown>; usage: AIUsageMetadata }> {
  const start = Date.now();
  const { text, usage: callUsage } = await resilientGenerateText({
    label: "pillar-I-pass1",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`${getCurrencyPromptInstruction(currency ?? "XOF")}

Tu es un consultant stratégique senior utilisant la méthodologie ADVERTIS.
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
    const parsed = safeParseJson(text, "Pass 1");
    // Validate core fields exist — don't accept empty Pass 1
    if (!parsed.brandIdentity && !parsed.positioning && !parsed.executiveSummary) {
      throw new Error("Pass 1 returned incomplete data — missing core fields");
    }
    return {
      data: parsed,
      usage: {
        model: DEFAULT_MODEL,
        tokensIn: callUsage?.inputTokens ?? 0,
        tokensOut: callUsage?.outputTokens ?? 0,
        durationMs: Date.now() - start,
      },
    };
  } catch (err) {
    console.error("[Implementation] Pass 1 failed:", err);
    throw new Error(`Pillar I Pass 1: ${err instanceof Error ? err.message : "JSON parse error"}`);
  }
}

// ---------------------------------------------------------------------------
// Pass 2a: Campaigns & financial sections
// ---------------------------------------------------------------------------

async function generatePass2a(
  ctx: SharedContext,
  pass1Data: Record<string, unknown>,
  brandName: string,
  sector: string,
  specialization?: SpecializationOptions | null,
  tagline?: string | null,
  currency?: SupportedCurrency,
  annualBudget?: number | null,
  targetRevenue?: number | null,
  maturity?: string | null,
): Promise<{ data: Record<string, unknown>; usage: AIUsageMetadata }> {
  const pass1Summary = JSON.stringify(pass1Data).substring(0, 6000);

  // --- Build parametric budget context for the prompt ---
  const currencySymbol = getCurrencySymbol(currency ?? "XOF");
  let budgetDirective = "";
  if (annualBudget && annualBudget > 0) {
    budgetDirective = `
⚠️ BUDGET DE RÉFÉRENCE FOURNI PAR LE CLIENT : ${annualBudget.toLocaleString("fr-FR")} ${currencySymbol}
UTILISE CE MONTANT comme enveloppeGlobale. NE L'INVENTE PAS.
Ventile ce budget réel par poste et par phase.`;
  } else {
    budgetDirective = `
⚠️ AUCUN BUDGET FOURNI PAR LE CLIENT.
Indique clairement "ESTIMATION À VALIDER PAR LE CLIENT" dans enveloppeGlobale.`;
  }

  // Add parametric formula context if targetRevenue is available
  let formulaContext = "";
  if (targetRevenue && targetRevenue > 0) {
    const formulaResult = calculateParametricBudget(targetRevenue, sector, maturity);
    formulaContext = `

FORMULE PARAMÉTRIQUE DE RÉFÉRENCE (Budget = CA × α × β × γ) :
${formatFormulaForPrompt(formulaResult, currencySymbol)}

Utilise ces ratios comme guide pour la ventilation par poste.`;
  }

  const start2a = Date.now();
  const { text, usage: callUsage2a } = await resilientGenerateText({
    label: "pillar-I-pass2a",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`${getCurrencyPromptInstruction(currency ?? "XOF")}

Tu es un consultant stratégique senior utilisant la méthodologie ADVERTIS.
Tu génères les sections campagnes et financières de l'implémentation.

CONTEXTE :
- Marque : ${brandName}${tagline ? `\n- Accroche : "${tagline}"` : ""}
- Secteur : ${sector || "Non spécifié"}
${budgetDirective}${formulaContext}

DONNÉES STRATÉGIQUES DÉJÀ GÉNÉRÉES (Passe 1) :
${pass1Summary}

DONNÉES SOURCE :
${ctx.ficheContext.substring(0, 4000)}

INSTRUCTIONS — PASSE 2a (Campagnes & sections financières) :
Génère le calendrier annuel de campagnes, le budget et le plan de lancement.

FORMAT JSON OBLIGATOIRE :
{
  "campaigns": {
    "annualCalendar": [
      {
        "mois": "Janvier",
        "campagne": "Nom de la campagne",
        "objectif": "Objectif stratégique clair",
        "canaux": ["Instagram", "Facebook", "TikTok"],
        "budget": "500 000 ${getCurrencySymbol(currency ?? "XOF")}",
        "kpiCible": "KPI principal chiffré",
        "actionsDetaillees": [
          "Action 1 : description concrète avec support et canal",
          "Action 2 : description concrète avec support et canal",
          "Action 3 : description concrète avec support et canal",
          "Action 4 : description concrète avec support et canal",
          "Action 5 : description concrète avec support et canal"
        ],
        "messagesCles": [
          "Message clé 1 adapté à la cible",
          "Message clé 2 adapté à la cible"
        ],
        "budgetDetail": {
          "production": "200 000 ${getCurrencySymbol(currency ?? "XOF")}",
          "media": "250 000 ${getCurrencySymbol(currency ?? "XOF")}",
          "talent": "50 000 ${getCurrencySymbol(currency ?? "XOF")}"
        },
        "timeline": {
          "debut": "1er Janvier",
          "fin": "31 Janvier"
        },
        "metriquesSucces": [
          "Reach : +50 000 personnes",
          "Engagement rate : >5%",
          "Conversions : 200 leads"
        ]
      }
    ],
    "templates": [
      { "nom": "Template", "type": "lancement", "description": "Desc détaillée", "duree": "3 semaines", "canauxPrincipaux": ["Instagram"], "messagesCles": ["Message clé"], "budgetEstime": "1 500 000 ${getCurrencySymbol(currency ?? "XOF")}", "kpisAttendus": ["KPI 1 chiffré", "KPI 2 chiffré"] }
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
    "parPoste": [{ "poste": "Poste", "montant": "${getCurrencySymbol(currency ?? "XOF")}", "pourcentage": 25, "justification": "Justif" }],
    "parPhase": [{ "phase": "Phase", "montant": "${getCurrencySymbol(currency ?? "XOF")}", "focus": "Focus" }],
    "roiProjections": { "mois6": "ROI 6m", "mois12": "ROI 12m", "mois24": "ROI 24m", "hypotheses": "Hyp" }
  },
  "launchPlan": {
    "phases": [{ "nom": "Phase 1", "debut": "M1", "fin": "M2", "objectifs": ["Obj"], "livrables": ["Livr"], "goNoGo": "Critère" }],
    "milestones": [{ "date": "M1", "jalon": "Jalon", "responsable": "Resp", "critereSucces": "Critère" }]
  }
}

RÈGLES :
- annualCalendar : OBLIGATOIRE 12 mois (un objet par mois, de Janvier à Décembre). Chaque mois DOIT contenir :
  * campagne : nom unique et évocateur
  * objectif : objectif stratégique précis
  * canaux : 2-4 canaux pertinents
  * budget : montant réaliste en ${getCurrencySymbol(currency ?? "XOF")}
  * actionsDetaillees : 5-8 actions concrètes et opérationnelles (format "Action : description avec canal et support")
  * messagesCles : 2-3 messages clés adaptés à la cible
  * budgetDetail : ventilation obligatoire en production, media, talent (en ${getCurrencySymbol(currency ?? "XOF")})
  * timeline : dates de début et fin du mois
  * metriquesSucces : 3-5 KPIs mesurables et chiffrés
- campaigns.templates : 3-4 types différents (lancement, récurrence, événement, activation), chaque template avec budgetEstime et kpisAttendus
- budgetAllocation : ventilé par poste (4-6 postes) ET par phase (3-4 phases)
- launchPlan : 3-5 phases avec critères go/no-go
${JSON_RULES}`, specialization),
    prompt: `Génère les campagnes et données financières (Passe 2a) pour la marque "${brandName}"${tagline ? ` (accroche: "${tagline}")` : ""} dans le secteur "${sector || "Non spécifié"}".
Appuie-toi sur les données stratégiques de la Passe 1 pour garantir la cohérence.`,
    maxOutputTokens: 10000,
    temperature: 0.3,
  });

  try {
    const parsed = safeParseJson(text, "Pass 2a");
    if (!parsed.campaigns && !parsed.budgetAllocation) {
      throw new Error("Pass 2a returned incomplete data — missing campaigns/budget sections");
    }
    return {
      data: parsed,
      usage: {
        model: DEFAULT_MODEL,
        tokensIn: callUsage2a?.inputTokens ?? 0,
        tokensOut: callUsage2a?.outputTokens ?? 0,
        durationMs: Date.now() - start2a,
      },
    };
  } catch (err) {
    console.error("[Implementation] Pass 2a failed:", err);
    throw new Error(`Pillar I Pass 2a: ${err instanceof Error ? err.message : "JSON parse error"}`);
  }
}

// ---------------------------------------------------------------------------
// Pass 2b: Brand & operational sections
// ---------------------------------------------------------------------------

async function generatePass2b(
  ctx: SharedContext,
  pass1Data: Record<string, unknown>,
  pass2aData: Record<string, unknown>,
  brandName: string,
  sector: string,
  specialization?: SpecializationOptions | null,
  tagline?: string | null,
  currency?: SupportedCurrency,
): Promise<{ data: Record<string, unknown>; usage: AIUsageMetadata }> {
  const pass1Summary = JSON.stringify(pass1Data).substring(0, 4000);
  const pass2aSummary = JSON.stringify(pass2aData).substring(0, 3000);

  const start2b = Date.now();
  const { text, usage: callUsage2b } = await resilientGenerateText({
    label: "pillar-I-pass2b",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`${getCurrencyPromptInstruction(currency ?? "XOF")}

Tu es un consultant stratégique senior utilisant la méthodologie ADVERTIS.
Tu complètes les données d'implémentation avec les sections brand platform et opérationnelles.

CONTEXTE :
- Marque : ${brandName}${tagline ? `\n- Accroche : "${tagline}"` : ""}
- Secteur : ${sector || "Non spécifié"}

DONNÉES STRATÉGIQUES (Passe 1) :
${pass1Summary}

DONNÉES CAMPAGNES & BUDGET (Passe 2a) :
${pass2aSummary}

DONNÉES SOURCE :
${ctx.ficheContext.substring(0, 3000)}

INSTRUCTIONS — PASSE 2b (Brand platform & sections opérationnelles) :
Génère les sections brand platform, copy strategy, big idea, dispositif d'activation,
équipe, playbook opérationnel, governance, workstreams, architecture et principes directeurs.

FORMAT JSON OBLIGATOIRE :
{
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
    "owned": [{ "canal": "Canal", "role": "Rôle", "budget": "${getCurrencySymbol(currency ?? "XOF")}" }],
    "earned": [{ "canal": "Canal", "role": "Rôle", "budget": "${getCurrencySymbol(currency ?? "XOF")}" }],
    "paid": [{ "canal": "Canal", "role": "Rôle", "budget": "${getCurrencySymbol(currency ?? "XOF")}" }],
    "shared": [{ "canal": "Canal", "role": "Rôle", "budget": "${getCurrencySymbol(currency ?? "XOF")}" }],
    "parcoursConso": "Parcours cross-canal"
  },
  "teamStructure": {
    "equipeActuelle": [{ "role": "Rôle", "profil": "Profil", "allocation": "Temps" }],
    "recrutements": [{ "role": "Rôle", "profil": "Profil", "echeance": "Échéance", "priorite": 1 }],
    "partenairesExternes": [{ "type": "Type", "mission": "Mission", "budget": "${getCurrencySymbol(currency ?? "XOF")}", "duree": "Durée" }]
  },
  "operationalPlaybook": {
    "rythmeQuotidien": ["Action 1"],
    "rythmeHebdomadaire": ["Action 1"],
    "rythmeMensuel": ["Action 1"],
    "escalation": [{ "scenario": "Crise", "action": "Action", "responsable": "Resp" }],
    "outilsStack": [{ "outil": "Outil", "usage": "Usage", "cout": "${getCurrencySymbol(currency ?? "XOF")}/mois" }]
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
- brandPlatform : purpose, vision, mission, values (3-5), personality, territory, tagline — tout rempli
- copyStrategy : promesse + RTB (2-3) + bénéfice + ton + contrainte
- bigIdea : 5+ déclinaisons (TV, social, print, digital, terrain)
- activationDispositif : 4 catégories POEM + parcours conso
- teamStructure : équipe actuelle + recrutements + partenaires
- operationalPlaybook : rythmes quotidien, hebdo et mensuel + escalation + outils
- governance : 3 niveaux + process validation + délais standards
- workstreams : minimum 3 streams avec objectifs et KPIs
- brandArchitecture : modèle + hiérarchie + règles de coexistence
- guidingPrinciples : minimum 3 do's et 3 don'ts + principes communication
${JSON_RULES}`, specialization),
    prompt: `Génère les sections brand platform et opérationnelles (Passe 2b) pour la marque "${brandName}"${tagline ? ` (accroche: "${tagline}")` : ""} dans le secteur "${sector || "Non spécifié"}".
Appuie-toi sur les données des Passes 1 et 2a pour garantir la cohérence globale.`,
    maxOutputTokens: 8000,
    temperature: 0.3,
  });

  try {
    const parsed = safeParseJson(text, "Pass 2b");
    if (!parsed.brandPlatform && !parsed.governance && !parsed.guidingPrinciples) {
      throw new Error("Pass 2b returned incomplete data — missing brand/operational sections");
    }
    return {
      data: parsed,
      usage: {
        model: DEFAULT_MODEL,
        tokensIn: callUsage2b?.inputTokens ?? 0,
        tokensOut: callUsage2b?.outputTokens ?? 0,
        durationMs: Date.now() - start2b,
      },
    };
  } catch (err) {
    console.error("[Implementation] Pass 2b failed:", err);
    throw new Error(`Pillar I Pass 2b: ${err instanceof Error ? err.message : "JSON parse error"}`);
  }
}
