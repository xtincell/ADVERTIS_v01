// =============================================================================
// MODULE 8 — Audit Generation Service (Pillars R + T)
// =============================================================================
//
// R = Risk Audit: micro-SWOT per A-E variable + global SWOT synthesis + risk score 0-100.
// T = Track Audit: market validation, hypothesis triangulation, TAM/SAM/SOM.
// T can be enriched with real market study data when available.
//
// PUBLIC API :
//   8.1  generateRiskAudit()   — Micro-SWOTs in parallel + synthesis → RiskAuditResult
//   8.2  generateTrackAudit()  — Market validation + TAM/SAM/SOM → TrackAuditResult
//
// INTERNAL :
//   8.H1  parseMicroSwots()         — JSON extraction for micro-SWOT batches
//   8.H2  parseSynthesis()          — JSON extraction for global SWOT synthesis
//   8.H3  parseTrackResult()        — JSON extraction for Track audit
//   8.H4  buildMarketStudyContext()  — Market study data formatter for prompt
//
// DEPENDENCIES :
//   - Module 5  (anthropic-client) → resilientGenerateText, anthropic, DEFAULT_MODEL
//   - Module 5B (prompt-helpers)   → injectSpecialization, SpecializationOptions
//   - lib/constants (PILLAR_CONFIG)
//   - lib/interview-schema → getFicheDeMarqueSchema()
//   - lib/types/market-study → MarketStudySynthesis
//
// CALLED BY :
//   - API Route POST /api/ai/generate (pillarType R, T)
//   - Module 10 (fiche-upgrade.ts) → regenerateAllPillars()
//
// =============================================================================

import { anthropic, DEFAULT_MODEL, resilientGenerateText } from "./anthropic-client";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { getFicheDeMarqueSchema } from "~/lib/interview-schema";
import type { MarketStudySynthesis } from "~/lib/types/market-study";
import { injectSpecialization, type SpecializationOptions } from "./prompt-helpers";

// ---------------------------------------------------------------------------
// Types — re-exported from Zod schemas (source of truth)
// ---------------------------------------------------------------------------

import type {
  MicroSwot,
  RiskAuditResult,
  TrackAuditResult,
} from "~/lib/types/pillar-schemas";

export type { MicroSwot, RiskAuditResult, TrackAuditResult };

// ---------------------------------------------------------------------------
// Public API — Risk Audit (Pillar R)
// ---------------------------------------------------------------------------

/**
 * Generates the Risk audit (Pillar R).
 * Performs micro-SWOT analysis on each non-empty A-E variable, then synthesizes
 * a global SWOT with risk score and mitigation priorities.
 *
 * @param interviewData - A-E interview answers keyed by variable id
 * @param ficheContent - Already generated A-E pillar content (for deeper context)
 * @param brandName - Name of the brand
 * @param sector - Industry sector
 */
export async function generateRiskAudit(
  interviewData: Record<string, string>,
  ficheContent: Array<{ type: string; content: string }>,
  brandName: string,
  sector: string,
  specialization?: SpecializationOptions | null,
  tagline?: string | null,
): Promise<RiskAuditResult> {
  const schema = getFicheDeMarqueSchema();

  // Collect non-empty variables for micro-SWOT analysis
  const filledVariables: Array<{
    id: string;
    label: string;
    pillar: string;
    value: string;
  }> = [];

  for (const section of schema) {
    for (const variable of section.variables) {
      const raw = interviewData[variable.id];
      const value = (typeof raw === "string" ? raw : JSON.stringify(raw ?? "")).trim();
      if (value) {
        filledVariables.push({
          id: variable.id,
          label: variable.label,
          pillar: section.pillarType,
          value,
        });
      }
    }
  }

  // Build context from fiche pillars
  const ficheContext = ficheContent
    .map((p) => {
      const config = PILLAR_CONFIG[p.type as PillarType];
      const truncated =
        p.content.length > 3000
          ? p.content.substring(0, 3000) + "\n[... tronqué ...]"
          : p.content;
      return `### Pilier ${p.type} — ${config?.title ?? p.type}\n${truncated}`;
    })
    .join("\n\n");

  // --- Step 1: Batch micro-SWOT analysis ---
  // Instead of 25 individual calls, batch variables by pillar (4 calls)
  const microSwots: MicroSwot[] = [];
  const pillarGroups = new Map<string, typeof filledVariables>();

  for (const v of filledVariables) {
    const group = pillarGroups.get(v.pillar) ?? [];
    group.push(v);
    pillarGroups.set(v.pillar, group);
  }

  // Generate micro-SWOTs in parallel per pillar (max 4 parallel calls)
  const pillarPromises = Array.from(pillarGroups.entries()).map(
    async ([pillarType, variables]) => {
      const variablesList = variables
        .map((v) => `- ${v.id} (${v.label}): ${v.value}`)
        .join("\n");

      const { text } = await resilientGenerateText({
        label: `audit-R-microswot-${pillarType}`,
        model: anthropic(DEFAULT_MODEL),
        system: injectSpecialization(`Tu es un auditeur stratégique expert utilisant la méthodologie ADVERTIS.
Tu dois réaliser une analyse micro-SWOT pour chaque variable du Pilier ${pillarType} — ${PILLAR_CONFIG[pillarType as PillarType]?.title}.

CONTEXTE DE LA MARQUE :
- Marque : ${brandName}${tagline ? `\n- Accroche : "${tagline}"` : ""}
- Secteur : ${sector || "Non spécifié"}

DONNÉES DES PILIERS FICHE DE MARQUE :
${ficheContext}

INSTRUCTIONS :
Pour CHAQUE variable fournie, génère une analyse SWOT avec :
- strengths : 2-3 forces identifiées
- weaknesses : 2-3 faiblesses identifiées
- opportunities : 2-3 opportunités
- threats : 2-3 menaces
- riskLevel : "low", "medium" ou "high"
- commentary : 1-2 phrases de synthèse

FORMAT DE RÉPONSE :
Réponds UNIQUEMENT avec un tableau JSON valide d'objets micro-SWOT.
Exemple :
[
  {
    "variableId": "A1",
    "variableLabel": "Identité de Marque",
    "strengths": ["Force 1", "Force 2"],
    "weaknesses": ["Faiblesse 1"],
    "opportunities": ["Opportunité 1"],
    "threats": ["Menace 1"],
    "riskLevel": "medium",
    "commentary": "L'identité est bien définie mais manque de différenciation..."
  }
]`, specialization),
        prompt: `Variables du Pilier ${pillarType} à analyser :\n\n${variablesList}`,
        maxOutputTokens: 4000,
        temperature: 0.4,
      });

      return parseJsonArray<MicroSwot>(text);
    },
  );

  const pillarResults = await Promise.all(pillarPromises);
  for (const result of pillarResults) {
    microSwots.push(...result);
  }

  // --- Step 2: Global SWOT synthesis + risk score ---
  const microSwotSummary = microSwots
    .map(
      (ms) =>
        `${ms.variableId} (${ms.variableLabel}) — Risque: ${ms.riskLevel}\n` +
        `  Forces: ${ms.strengths.join(", ")}\n` +
        `  Faiblesses: ${ms.weaknesses.join(", ")}\n` +
        `  Opportunités: ${ms.opportunities.join(", ")}\n` +
        `  Menaces: ${ms.threats.join(", ")}`,
    )
    .join("\n\n");

  const { text: synthesisText } = await resilientGenerateText({
    label: "audit-R-synthesis",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`Tu es un auditeur stratégique expert utilisant la méthodologie ADVERTIS.
Tu dois synthétiser les micro-SWOTs individuels en une analyse globale.

CONTEXTE :
- Marque : ${brandName}${tagline ? `\n- Accroche : "${tagline}"` : ""}
- Secteur : ${sector || "Non spécifié"}

INSTRUCTIONS :
À partir des micro-SWOTs individuels, génère :
1. Un SWOT global (patterns transversaux, pas la simple somme des SWOTs)
2. Un score de risque global 0-100 (0 = aucun risque, 100 = risque critique) avec justification
3. Une matrice probabilité × impact des 5-10 risques majeurs
4. Des priorités de mitigation classées par urgence

FORMAT : Réponds UNIQUEMENT avec un objet JSON valide :
{
  "globalSwot": {
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "opportunities": ["...", "..."],
    "threats": ["...", "..."]
  },
  "riskScore": 45,
  "riskScoreJustification": "...",
  "probabilityImpactMatrix": [
    { "risk": "...", "probability": "high", "impact": "high", "priority": 1 }
  ],
  "mitigationPriorities": [
    { "risk": "...", "action": "...", "urgency": "immediate", "effort": "medium" }
  ],
  "summary": "Synthèse en 3-5 phrases..."
}`, specialization),
    prompt: `Voici les micro-SWOTs individuels de la marque "${brandName}" :\n\n${microSwotSummary}`,
    maxOutputTokens: 3000,
    temperature: 0.3,
  });

  const synthesis = parseJsonObject<{
    globalSwot: RiskAuditResult["globalSwot"];
    riskScore: number;
    riskScoreJustification: string;
    probabilityImpactMatrix: RiskAuditResult["probabilityImpactMatrix"];
    mitigationPriorities: RiskAuditResult["mitigationPriorities"];
    summary: string;
  }>(synthesisText);

  return {
    microSwots,
    globalSwot: synthesis.globalSwot ?? {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
    riskScore: synthesis.riskScore ?? 50,
    riskScoreJustification:
      synthesis.riskScoreJustification ?? "Score non calculé",
    probabilityImpactMatrix: synthesis.probabilityImpactMatrix ?? [],
    mitigationPriorities: synthesis.mitigationPriorities ?? [],
    summary: synthesis.summary ?? "",
  };
}

// ---------------------------------------------------------------------------
// Public API — Track Audit (Pillar T)
// ---------------------------------------------------------------------------

/**
 * Generates the Track audit (Pillar T).
 * Market validation, hypothesis triangulation, TAM/SAM/SOM, competitive benchmark.
 *
 * When marketStudyData is provided, the prompt is enriched with real market data
 * and the AI is instructed to prioritize real data over speculation.
 *
 * @param interviewData - A-E interview answers
 * @param ficheContent - Generated A-E pillar content
 * @param riskResults - Results from Risk audit (R) for cross-reference
 * @param brandName - Brand name
 * @param sector - Industry sector
 * @param marketStudyData - Optional real market study synthesis (from market study module)
 */
export async function generateTrackAudit(
  interviewData: Record<string, string>,
  ficheContent: Array<{ type: string; content: string }>,
  riskResults: RiskAuditResult,
  brandName: string,
  sector: string,
  marketStudyData?: MarketStudySynthesis | null,
  specialization?: SpecializationOptions | null,
  tagline?: string | null,
): Promise<TrackAuditResult> {
  // Build comprehensive context
  const ficheContext = ficheContent
    .map((p) => {
      const config = PILLAR_CONFIG[p.type as PillarType];
      const truncated =
        p.content.length > 3000
          ? p.content.substring(0, 3000) + "\n[... tronqué ...]"
          : p.content;
      return `### Pilier ${p.type} — ${config?.title ?? p.type}\n${truncated}`;
    })
    .join("\n\n");

  // Summarize interview data
  const schema = getFicheDeMarqueSchema();
  const interviewSummary = schema
    .flatMap((section) =>
      section.variables
        .filter((v) => {
          const raw = interviewData[v.id];
          return (typeof raw === "string" ? raw : JSON.stringify(raw ?? "")).trim().length > 0;
        })
        .map((v) => {
          const raw = interviewData[v.id];
          const str = (typeof raw === "string" ? raw : JSON.stringify(raw ?? "")).trim();
          return `- ${v.id} (${v.label}): ${str}`;
        }),
    )
    .join("\n");

  // Risk audit summary for cross-reference
  const riskSummary = `Score de risque global : ${riskResults.riskScore}/100
${riskResults.riskScoreJustification}

SWOT Global :
- Forces : ${riskResults.globalSwot.strengths.join(", ")}
- Faiblesses : ${riskResults.globalSwot.weaknesses.join(", ")}
- Opportunités : ${riskResults.globalSwot.opportunities.join(", ")}
- Menaces : ${riskResults.globalSwot.threats.join(", ")}`;

  // Build market study context if available
  const hasMarketStudy = !!marketStudyData;
  const marketStudyContext = hasMarketStudy
    ? buildMarketStudyContext(marketStudyData)
    : "";

  const marketStudyInstructions = hasMarketStudy
    ? `

IMPORTANT — DONNÉES D'ÉTUDE DE MARCHÉ RÉELLES DISPONIBLES :
Tu disposes de données réelles collectées lors de l'étude de marché.
- PRIORITÉ ABSOLUE : utilise les données réelles pour la triangulation, le TAM/SAM/SOM, le benchmarking concurrentiel et les tendances.
- Pour chaque donnée utilisée, indique si elle provient de données RÉELLES (étude de marché) ou d'ESTIMATIONS IA.
- Ne spécule PAS quand tu as des données réelles. Utilise-les telles quelles.
- Si les données réelles sont partielles, complète avec des estimations IA mais marque-les clairement.
- Score de confiance global de l'étude : ${marketStudyData.overallConfidence}/100`
    : `

NOTE : Aucune étude de marché réelle n'est disponible.
Toutes tes analyses seront basées sur tes connaissances du secteur.
Indique explicitement quand tu spécules ou estimes.`;

  const { text } = await resilientGenerateText({
    label: "audit-T-track",
    model: anthropic(DEFAULT_MODEL),
    system: injectSpecialization(`Tu es un analyste marché expert utilisant la méthodologie ADVERTIS.
Tu réalises le Pilier T — Track : validation de la stratégie par confrontation aux données marché.

CONTEXTE DE LA MARQUE :
- Marque : ${brandName}${tagline ? `\n- Accroche : "${tagline}"` : ""}
- Secteur : ${sector || "Non spécifié"}

DONNÉES FICHE DE MARQUE (A-D-V-E) :
${ficheContext}

DONNÉES D'ENTRETIEN :
${interviewSummary}

RÉSULTATS AUDIT R (Risk) :
${riskSummary}
${marketStudyContext}${marketStudyInstructions}

INSTRUCTIONS :
Génère une analyse Track complète avec :

1. **Triangulation 3 sources** : croise données internes (fiche de marque), données marché (${hasMarketStudy ? "étude de marché RÉELLE fournie" : "tendances sectorielles connues"}), et données clients (insights des personas)

2. **Validation des hypothèses** : pour chaque variable A-E non vide, évalue si l'hypothèse est validée, invalidée ou à tester par rapport aux réalités du marché

3. **Rapport réalité marché** : tendances macro, signaux faibles, patterns émergents dans le secteur "${sector}"

4. **TAM/SAM/SOM** : ${hasMarketStudy ? "utilise les données réelles de l'étude de marché pour le dimensionnement" : "estimations chiffrées réalistes basées sur le secteur et le positionnement"}

5. **Benchmarking concurrentiel** : ${hasMarketStudy ? "utilise les profils concurrents réels de l'étude de marché" : "3-5 concurrents avec forces/faiblesses/parts de marché (basé sur les données D2 si disponibles)"}

6. **Score Brand-Market Fit** : 0-100 avec justification

7. **Recommandations stratégiques** : 5-8 recommandations issues de l'analyse Track

FORMAT : Réponds UNIQUEMENT avec un objet JSON valide :
{
  "triangulation": {
    "internalData": "Synthèse données internes...",
    "marketData": "Synthèse données marché...",
    "customerData": "Synthèse données clients...",
    "synthesis": "Synthèse croisée..."
  },
  "hypothesisValidation": [
    { "variableId": "A1", "hypothesis": "...", "status": "validated", "evidence": "..." }
  ],
  "marketReality": {
    "macroTrends": ["..."],
    "weakSignals": ["..."],
    "emergingPatterns": ["..."]
  },
  "tamSamSom": {
    "tam": { "value": "X Mrd EUR", "description": "..." },
    "sam": { "value": "X M EUR", "description": "..." },
    "som": { "value": "X M EUR", "description": "..." },
    "methodology": "..."
  },
  "competitiveBenchmark": [
    { "competitor": "...", "strengths": ["..."], "weaknesses": ["..."], "marketShare": "..." }
  ],
  "brandMarketFitScore": 65,
  "brandMarketFitJustification": "...",
  "strategicRecommendations": ["..."],
  "summary": "Synthèse en 3-5 phrases..."
}`, specialization),
    prompt: `Réalise l'analyse Track complète pour la marque "${brandName}" dans le secteur "${sector || "Non spécifié"}".

${hasMarketStudy ? "UTILISE EN PRIORITÉ les données réelles de l'étude de marché fournies dans le contexte." : "Base ton analyse sur les données fournies dans le contexte."} Sois factuel et précis. Si des données manquent, indique-le explicitement plutôt que d'inventer.`,
    maxOutputTokens: 6000,
    temperature: 0.3,
  });

  const result = parseJsonObject<TrackAuditResult>(text);

  return {
    triangulation: result.triangulation ?? {
      internalData: "",
      marketData: "",
      customerData: "",
      synthesis: "",
    },
    hypothesisValidation: result.hypothesisValidation ?? [],
    marketReality: result.marketReality ?? {
      macroTrends: [],
      weakSignals: [],
      emergingPatterns: [],
    },
    tamSamSom: result.tamSamSom ?? {
      tam: { value: "", description: "" },
      sam: { value: "", description: "" },
      som: { value: "", description: "" },
      methodology: "",
    },
    competitiveBenchmark: result.competitiveBenchmark ?? [],
    brandMarketFitScore: result.brandMarketFitScore ?? 50,
    brandMarketFitJustification:
      result.brandMarketFitJustification ?? "Score non calculé",
    strategicRecommendations: result.strategicRecommendations ?? [],
    summary: result.summary ?? "",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse AI response as a JSON array, with fallback to empty array.
 */
function parseJsonArray<T>(responseText: string): T[] {
  let jsonString = responseText.trim();

  // Remove markdown code block if present
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    jsonString = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonString) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.error(
      "[Audit] Failed to parse JSON array:",
      responseText.substring(0, 200),
    );
    return [];
  }
}

/**
 * Parse AI response as a JSON object, with fallback to empty object.
 */
function parseJsonObject<T>(responseText: string): Partial<T> {
  let jsonString = responseText.trim();

  // Remove markdown code block if present
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    jsonString = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(jsonString) as Partial<T>;
  } catch {
    console.error(
      "[Audit] Failed to parse JSON object:",
      responseText.substring(0, 200),
    );
    return {} as Partial<T>;
  }
}

/**
 * Build a structured context string from MarketStudySynthesis for the Track audit prompt.
 */
function buildMarketStudyContext(
  synthesis: MarketStudySynthesis,
): string {
  const sections: string[] = [];

  sections.push("\n\nDONNÉES D'ÉTUDE DE MARCHÉ RÉELLES :");

  // Market size
  if (synthesis.marketSize?.data) {
    sections.push(
      `\n### Taille du marché (confiance: ${synthesis.marketSize.confidence})`,
      synthesis.marketSize.data,
      `Sources : ${synthesis.marketSize.sources.join(", ")}`,
    );
  }

  // TAM/SAM/SOM
  if (synthesis.tamSamSom) {
    sections.push(
      "\n### Dimensionnement TAM/SAM/SOM",
      `- TAM : ${synthesis.tamSamSom.tam.value} — ${synthesis.tamSamSom.tam.description} (confiance: ${synthesis.tamSamSom.tam.confidence}, source: ${synthesis.tamSamSom.tam.source})`,
      `- SAM : ${synthesis.tamSamSom.sam.value} — ${synthesis.tamSamSom.sam.description} (confiance: ${synthesis.tamSamSom.sam.confidence}, source: ${synthesis.tamSamSom.sam.source})`,
      `- SOM : ${synthesis.tamSamSom.som.value} — ${synthesis.tamSamSom.som.description} (confiance: ${synthesis.tamSamSom.som.confidence}, source: ${synthesis.tamSamSom.som.source})`,
      `Méthodologie : ${synthesis.tamSamSom.methodology}`,
    );
  }

  // Competitors
  if (synthesis.competitiveLandscape?.competitors?.length) {
    sections.push("\n### Paysage Concurrentiel");
    for (const c of synthesis.competitiveLandscape.competitors) {
      sections.push(
        `- **${c.name}** (confiance: ${c.confidence}, source: ${c.source})`,
        `  Forces : ${c.strengths.join(", ")}`,
        `  Faiblesses : ${c.weaknesses.join(", ")}`,
        `  Part de marché : ${c.marketShare}`,
        c.funding ? `  Funding : ${c.funding}` : "",
        c.traffic ? `  Trafic : ${c.traffic}` : "",
      );
    }
  }

  // Macro trends
  if (synthesis.macroTrends?.trends?.length) {
    sections.push("\n### Tendances Macro");
    for (const t of synthesis.macroTrends.trends) {
      sections.push(
        `- ${t.trend} (confiance: ${t.confidence}, source: ${t.source})`,
      );
    }
  }

  // Weak signals
  if (synthesis.weakSignals?.signals?.length) {
    sections.push("\n### Signaux Faibles");
    for (const s of synthesis.weakSignals.signals) {
      sections.push(
        `- ${s.signal} (confiance: ${s.confidence}, source: ${s.source})`,
      );
    }
  }

  // Customer insights
  if (synthesis.customerInsights?.data) {
    sections.push(
      `\n### Insights Clients (confiance: ${synthesis.customerInsights.confidence})`,
      synthesis.customerInsights.data,
    );
  }

  // Gaps
  if (synthesis.gaps?.length) {
    sections.push(
      "\n### Lacunes identifiées (données manquantes)",
      ...synthesis.gaps.map((g) => `- ${g}`),
    );
  }

  return sections.filter(Boolean).join("\n");
}
