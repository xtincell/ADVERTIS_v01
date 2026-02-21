// =============================================================================
// MODULE 25A — Market Study Synthesis
// =============================================================================
// AI-powered synthesis of all collected market data (automated sources +
// manual entries + uploaded files) into a structured MarketStudySynthesis
// with per-datum confidence annotations (high / medium / low / ai_estimated).
// Uses Claude (claude-sonnet-4) for the synthesis call.
//
// Public API:
//   synthesizeMarketStudy(strategyId)
//     -> MarketStudySynthesis
//
// Internal helpers:
//   buildSynthesisContext(data, interviewData?, completedPillars?)
//     — Compiles all source data into a single context string for the LLM
//   parseSynthesisResponse(responseText)
//     — Extracts & defaults the JSON synthesis from Claude's response
//
// Dependencies:
//   ../anthropic-client              — anthropic model ref, resilientGenerateText
//   ~/server/db                      — Prisma client (marketStudy, strategy)
//   ~/lib/interview-schema           — getFicheDeMarqueSchema
//   ~/lib/constants                  — PILLAR_CONFIG
//   ~/lib/types/market-study         — MarketStudySynthesis + all source data types
//
// Called by:
//   tRPC market-study router (synthesize mutation)
// =============================================================================

import { anthropic, resilientGenerateText } from "../anthropic-client";
import { db } from "~/server/db";
import { getFicheDeMarqueSchema } from "~/lib/interview-schema";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import type {
  MarketStudySynthesis,
  BraveSearchData,
  GoogleTrendsData,
  CrunchbaseData,
  SimilarWebData,
  AIWebSearchData,
  ManualDataStore,
  UploadedFileEntry,
} from "~/lib/types/market-study";

/**
 * Synthesize all collected market study data into a structured MarketStudySynthesis.
 *
 * 1. Load MarketStudy with all data fields
 * 2. Compile structured context (automated + manual)
 * 3. Call Claude to synthesize:
 *    - Use REAL data (mark "high" confidence)
 *    - Fill gaps with AI estimation (mark "ai_estimated")
 *    - Attribute sources for each data point
 * 4. Store in MarketStudy.synthesis
 * 5. Return the synthesis
 */
export async function synthesizeMarketStudy(
  strategyId: string,
): Promise<MarketStudySynthesis> {
  // 1. Load all market study data
  const marketStudy = await db.marketStudy.findUnique({
    where: { strategyId },
  });

  if (!marketStudy) {
    throw new Error("Market study not found for strategy " + strategyId);
  }

  // Also load strategy context for brand/sector info + completed pillars
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: {
      brandName: true,
      tagline: true,
      sector: true,
      interviewData: true,
      pillars: {
        where: { status: "complete", type: { in: ["A", "D", "V", "E"] } },
        select: { type: true, content: true, summary: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!strategy) {
    throw new Error("Strategy not found: " + strategyId);
  }

  // 2. Build context from all data sources
  const context = buildSynthesisContext(
    {
      braveSearch: marketStudy.braveSearchResults as BraveSearchData | null,
      googleTrends: marketStudy.googleTrendsData as GoogleTrendsData | null,
      crunchbase: marketStudy.crunchbaseData as CrunchbaseData | null,
      similarWeb: marketStudy.similarWebData as SimilarWebData | null,
      aiWebSearch: marketStudy.aiWebSearchResults as AIWebSearchData | null,
      manualData: marketStudy.manualData as ManualDataStore | null,
      uploadedFiles: marketStudy.uploadedFiles as UploadedFileEntry[] | null,
    },
    strategy.interviewData as Record<string, string> | null,
    strategy.pillars,
  );

  // 3. Call Claude for synthesis
  let text: string;
  try {
    const result = await resilientGenerateText({
      label: "market-study-synthesis",
      model: anthropic("claude-sonnet-4-20250514"),
      system: `Tu es un analyste marché senior spécialisé dans la synthèse de données multi-sources.
Tu travailles pour le module d'étude de marché ADVERTIS.

CONTEXTE :
- Marque : ${strategy.brandName}${strategy.tagline ? `\n- Accroche : "${strategy.tagline}"` : ""}
- Secteur : ${strategy.sector ?? "Non spécifié"}

RÈGLES DE CONFIANCE :
- "high" : donnée vérifiable avec source citée (rapports, APIs, données publiques)
- "medium" : donnée croisée de plusieurs sources mais pas exactement vérifiable
- "low" : donnée provenant d'une seule source non vérifiée ou estimation basée sur des données partielles
- "ai_estimated" : estimation générée par l'IA en l'absence de données réelles — TOUJOURS marquer clairement

INSTRUCTIONS :
1. Synthétise TOUTES les données disponibles ci-dessous
2. Pour CHAQUE information dans ta synthèse, indique la source et le niveau de confiance
3. Quand les données réelles manquent, ESTIME mais marque TOUJOURS "ai_estimated"
4. Identifie explicitement les LACUNES (données manquantes critiques)
5. Calcule un score de confiance global (0-100) reflétant la qualité des données disponibles

FORMAT : Réponds UNIQUEMENT avec un objet JSON valide conforme au type MarketStudySynthesis :
{
  "marketSize": {
    "data": "Description de la taille du marché...",
    "sources": ["Brave Search", "Rapport XYZ"],
    "confidence": "high"
  },
  "competitiveLandscape": {
    "competitors": [
      {
        "name": "Concurrent 1",
        "strengths": ["..."],
        "weaknesses": ["..."],
        "marketShare": "X%",
        "source": "Crunchbase",
        "confidence": "high",
        "funding": "$10M",
        "traffic": "100K/mois"
      }
    ],
    "competitiveIntensity": {
      "data": "Description de l'intensité concurrentielle...",
      "sources": ["..."],
      "confidence": "medium"
    }
  },
  "macroTrends": {
    "trends": [
      { "trend": "...", "source": "Google Trends", "confidence": "high", "timeframe": "2024-2025" }
    ]
  },
  "weakSignals": {
    "signals": [
      { "signal": "...", "source": "AI Web Search", "confidence": "medium", "implication": "..." }
    ]
  },
  "customerInsights": {
    "data": "Synthèse des insights clients...",
    "sources": ["..."],
    "confidence": "medium"
  },
  "tamSamSom": {
    "tam": { "value": "X Mrd EUR", "description": "...", "source": "...", "confidence": "medium", "methodology": "..." },
    "sam": { "value": "X M EUR", "description": "...", "source": "...", "confidence": "medium" },
    "som": { "value": "X M EUR", "description": "...", "source": "...", "confidence": "low" },
    "methodology": "Description de la méthodologie..."
  },
  "gaps": ["Liste des données manquantes critiques..."],
  "overallConfidence": 65,
  "sourceSummary": {
    "totalDataPoints": 42,
    "bySource": { "brave_search": 20, "crunchbase": 5, "manual_internal": 3, "ai_synthesis": 14 },
    "byConfidence": { "high": 10, "medium": 15, "low": 5, "ai_estimated": 12 }
  }
}`,
      prompt: `DONNÉES COLLECTÉES :\n\n${context}\n\nSynthétise ces données en une analyse marché structurée pour la marque "${strategy.brandName}"${strategy.tagline ? ` (accroche: "${strategy.tagline}")` : ""} dans le secteur "${strategy.sector ?? "Non spécifié"}".`,
      maxOutputTokens: 8000,
      temperature: 0.2,
    });
    text = result.text;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      "[MarketStudy Synthesis] Anthropic API call failed:",
      message,
    );
    throw new Error(`Erreur lors de l'appel IA : ${message}`);
  }

  // 4. Parse the synthesis
  const synthesis = parseSynthesisResponse(text);

  // 5. Store in database
  try {
    await db.marketStudy.update({
      where: { strategyId },
      data: {
        synthesis: JSON.parse(JSON.stringify(synthesis)),
        synthesizedAt: new Date(),
      },
    });
  } catch (dbErr) {
    console.error("[MarketStudy Synthesis] DB update failed:", dbErr);
    throw new Error("Erreur lors de la sauvegarde de la synthèse");
  }

  return synthesis;
}

// ---------------------------------------------------------------------------
// Context building helpers
// ---------------------------------------------------------------------------

interface AllSourceData {
  braveSearch: BraveSearchData | null;
  googleTrends: GoogleTrendsData | null;
  crunchbase: CrunchbaseData | null;
  similarWeb: SimilarWebData | null;
  aiWebSearch: AIWebSearchData | null;
  manualData: ManualDataStore | null;
  uploadedFiles: UploadedFileEntry[] | null;
}

function buildSynthesisContext(
  data: AllSourceData,
  interviewData?: Record<string, string> | null,
  completedPillars?: Array<{ type: string; content: unknown; summary: string | null }>,
): string {
  const sections: string[] = [];

  // Brave Search results
  if (data.braveSearch?.queries?.length) {
    sections.push("## BRAVE SEARCH RESULTS");
    for (const query of data.braveSearch.queries) {
      const results = data.braveSearch.results[query.query] ?? [];
      sections.push(`### Requête: "${query.query}" (${query.category}) — ${results.length} résultats`);
      for (const r of results.slice(0, 3)) {
        sections.push(`- **${r.title}** (${r.url})\n  ${r.description}`);
      }
    }
  }

  // Google Trends data
  if (data.googleTrends?.relatedQueries?.length) {
    sections.push("## GOOGLE TRENDS");
    sections.push("### Requêtes liées:");
    for (const q of data.googleTrends.relatedQueries.slice(0, 10)) {
      sections.push(`- "${q.query}" (intérêt: ${q.value})`);
    }
    if (data.googleTrends.keywords?.length) {
      sections.push("### Mots-clés suivis:");
      for (const kw of data.googleTrends.keywords) {
        sections.push(`- ${kw.keyword} (${kw.category})`);
      }
    }
  }

  // Crunchbase data
  if (data.crunchbase?.competitors?.length) {
    sections.push("## CRUNCHBASE — DONNÉES CONCURRENTS");
    for (const c of data.crunchbase.competitors) {
      const details = [
        c.foundedDate ? `Fondée: ${c.foundedDate}` : null,
        c.employeeCount ? `Employés: ${c.employeeCount}` : null,
        c.totalFunding ? `Funding: ${c.totalFunding}` : null,
        c.lastFundingRound ? `Dernier tour: ${c.lastFundingRound}` : null,
        c.headquartersLocation ? `Siège: ${c.headquartersLocation}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      sections.push(`### ${c.name}`);
      sections.push(c.description);
      if (details) sections.push(details);
      if (c.categories?.length) sections.push(`Catégories: ${c.categories.join(", ")}`);
    }
  }

  // SimilarWeb data
  if (data.similarWeb?.sites?.length) {
    sections.push("## SIMILARWEB — TRAFIC WEB");
    for (const site of data.similarWeb.sites) {
      const metrics = [
        site.monthlyVisits
          ? `Visites mensuelles: ${formatNumber(site.monthlyVisits)}`
          : null,
        site.globalRank ? `Rang global: #${site.globalRank}` : null,
        site.bounceRate
          ? `Taux de rebond: ${(site.bounceRate * 100).toFixed(1)}%`
          : null,
        site.avgVisitDuration
          ? `Durée moy: ${Math.round(site.avgVisitDuration)}s`
          : null,
      ]
        .filter(Boolean)
        .join(" | ");

      sections.push(`### ${site.domain}`);
      if (metrics) sections.push(metrics);
      if (site.trafficSources) {
        const sources = Object.entries(site.trafficSources)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${k}: ${(v * 100).toFixed(1)}%`)
          .join(", ");
        if (sources) sections.push(`Sources de trafic: ${sources}`);
      }
    }
  }

  // AI Web Search results
  if (data.aiWebSearch?.results?.length) {
    sections.push("## AI WEB SEARCH — ANALYSES IA");
    for (const r of data.aiWebSearch.results) {
      sections.push(`### ${r.query}`);
      sections.push(`Confiance: ${r.confidence}`);
      // Truncate long syntheses
      const truncated =
        r.synthesis.length > 1500
          ? r.synthesis.substring(0, 1500) + "\n[... tronqué ...]"
          : r.synthesis;
      sections.push(truncated);
    }
  }

  // Manual data
  if (data.manualData?.entries?.length) {
    sections.push("## DONNÉES MANUELLES");
    for (const entry of data.manualData.entries) {
      sections.push(`### [${entry.category}] ${entry.title} (${entry.sourceType})`);
      const truncated =
        entry.content.length > 1000
          ? entry.content.substring(0, 1000) + "\n[... tronqué ...]"
          : entry.content;
      sections.push(truncated);
    }
  }

  // Uploaded files
  if (data.uploadedFiles?.length) {
    sections.push("## FICHIERS IMPORTÉS");
    for (const file of data.uploadedFiles) {
      sections.push(`### ${file.fileName} (${file.fileType}, ${formatFileSize(file.fileSize)})`);
      const truncated =
        file.extractedText.length > 2000
          ? file.extractedText.substring(0, 2000) + "\n[... tronqué ...]"
          : file.extractedText;
      sections.push(truncated);
    }
  }

  // When no external data was collected, enrich with fiche de marque context
  // so the AI has material for estimation
  if (sections.length === 0) {
    sections.push("## AUCUNE DONNÉE EXTERNE COLLECTÉE");
    sections.push(
      "Toutes les analyses devront être basées sur les données internes " +
      "de la fiche de marque ci-dessous et tes connaissances du secteur. " +
      "Marque TOUTES les données comme 'ai_estimated'.",
    );
  }

  // Always inject interview data as internal context for richer estimation
  if (interviewData && Object.keys(interviewData).length > 0) {
    const schema = getFicheDeMarqueSchema();
    const interviewLines: string[] = [];

    for (const section of schema) {
      for (const variable of section.variables) {
        const raw = interviewData[variable.id];
        const value = (typeof raw === "string" ? raw : JSON.stringify(raw ?? "")).trim();
        if (value && value !== '""') {
          interviewLines.push(`- ${variable.id} (${variable.label}): ${value}`);
        }
      }
    }

    if (interviewLines.length > 0) {
      sections.push("## DONNÉES INTERNES — FICHE DE MARQUE (entretien)");
      sections.push(interviewLines.join("\n"));
    }
  }

  // Inject completed pillar summaries for strategic context
  if (completedPillars?.length) {
    sections.push("## PILIERS STRATÉGIQUES COMPLÉTÉS (A-D-V-E)");
    for (const p of completedPillars) {
      const config = PILLAR_CONFIG[p.type as PillarType];
      const label = config?.title ?? p.type;
      const contentStr =
        typeof p.content === "string"
          ? p.content
          : JSON.stringify(p.content ?? "");
      const truncated =
        contentStr.length > 2000
          ? contentStr.substring(0, 2000) + "\n[... tronqué ...]"
          : contentStr;
      sections.push(`### Pilier ${p.type} — ${label}`);
      if (p.summary) sections.push(`Résumé : ${p.summary}`);
      sections.push(truncated);
    }
  }

  return sections.join("\n\n");
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

// ---------------------------------------------------------------------------
// Response parsing
// ---------------------------------------------------------------------------

function parseSynthesisResponse(responseText: string): MarketStudySynthesis {
  let jsonString = responseText.trim();

  // Remove markdown code block if present
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    jsonString = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonString) as Partial<MarketStudySynthesis>;

    // Return with sensible defaults for missing fields
    return {
      marketSize: parsed.marketSize ?? {
        data: "Données non disponibles",
        sources: [],
        confidence: "ai_estimated",
      },
      competitiveLandscape: parsed.competitiveLandscape ?? {
        competitors: [],
        competitiveIntensity: {
          data: "Non évalué",
          sources: [],
          confidence: "ai_estimated",
        },
      },
      macroTrends: parsed.macroTrends ?? { trends: [] },
      weakSignals: parsed.weakSignals ?? { signals: [] },
      customerInsights: parsed.customerInsights ?? {
        data: "Données non disponibles",
        sources: [],
        confidence: "ai_estimated",
      },
      tamSamSom: parsed.tamSamSom ?? {
        tam: {
          value: "Non estimé",
          description: "",
          source: "ai_synthesis",
          confidence: "ai_estimated",
        },
        sam: {
          value: "Non estimé",
          description: "",
          source: "ai_synthesis",
          confidence: "ai_estimated",
        },
        som: {
          value: "Non estimé",
          description: "",
          source: "ai_synthesis",
          confidence: "ai_estimated",
        },
        methodology: "",
      },
      gaps: parsed.gaps ?? [],
      overallConfidence: parsed.overallConfidence ?? 0,
      sourceSummary: parsed.sourceSummary ?? {
        totalDataPoints: 0,
        bySource: {},
        byConfidence: { high: 0, medium: 0, low: 0, ai_estimated: 0 },
      },
    };
  } catch {
    console.error(
      "[MarketStudy Synthesis] Failed to parse JSON:",
      responseText.substring(0, 300),
    );

    // Return a minimal synthesis
    return {
      marketSize: {
        data: "Erreur lors de la synthèse",
        sources: [],
        confidence: "ai_estimated",
      },
      competitiveLandscape: {
        competitors: [],
        competitiveIntensity: {
          data: "Non évalué",
          sources: [],
          confidence: "ai_estimated",
        },
      },
      macroTrends: { trends: [] },
      weakSignals: { signals: [] },
      customerInsights: {
        data: "Erreur lors de la synthèse",
        sources: [],
        confidence: "ai_estimated",
      },
      tamSamSom: {
        tam: { value: "N/A", description: "", source: "", confidence: "ai_estimated" },
        sam: { value: "N/A", description: "", source: "", confidence: "ai_estimated" },
        som: { value: "N/A", description: "", source: "", confidence: "ai_estimated" },
        methodology: "",
      },
      gaps: ["Erreur lors de la synthèse — toutes les données sont manquantes"],
      overallConfidence: 0,
      sourceSummary: {
        totalDataPoints: 0,
        bySource: {},
        byConfidence: { high: 0, medium: 0, low: 0, ai_estimated: 0 },
      },
    };
  }
}
