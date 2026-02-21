// =============================================================================
// MODULE 17B — Intel Report Generator
// =============================================================================
// Generates vendable market intelligence reports from strategy data. Combines
// pillars, signals, market context, competitor snapshots, pricing, and
// opportunity calendars into comprehensive AI-generated reports. Reports are
// persisted as TranslationDocuments with type "INTEL_REPORT" and can be
// exported as PDF/HTML for sale.
//
// Public API:
//   1. generateIntelReport() — Generate an intel report for a strategy
//
// Dependencies:
//   - ai (generateText)
//   - anthropic-client (anthropic, DEFAULT_MODEL)
//   - ~/server/db (Prisma — Strategy, Pillar, Signal, CompetitorSnapshot,
//                   MarketPricing, OpportunityCalendar, TranslationDocument)
//   - ~/lib/constants (MARKET_LABELS, PRICING_CATEGORY_LABELS)
//
// Called by:
//   - tRPC intel router (intel.generate)
// =============================================================================

import { generateText } from "ai";
import { anthropic, DEFAULT_MODEL } from "./anthropic-client";
import { db } from "~/server/db";
import { MARKET_LABELS, PRICING_CATEGORY_LABELS } from "~/lib/constants";

// ============================================
// TYPES
// ============================================

interface IntelReportOptions {
  market?: string;
  focusAreas?: string[];
  includeCompetitors?: boolean;
  includePricing?: boolean;
  includeSignals?: boolean;
}

interface IntelReportContext {
  strategy: {
    name: string;
    brandName: string;
    sector: string | null;
    vertical: string | null;
  };
  pillars: Array<{
    type: string;
    title: string;
    content: unknown;
  }>;
  signals: Array<{
    pillar: string;
    layer: string;
    title: string;
    description: string | null;
  }>;
  competitors: Array<{
    name: string;
    positioning: string | null;
  }>;
  pricing: Array<{
    category: string;
    subcategory: string;
    label: string;
    avgPrice: number | null;
    currency: string;
    market: string;
  }>;
  opportunities: Array<{
    title: string;
    type: string;
    impact: string;
    startDate: Date | null;
    endDate: Date | null;
  }>;
}

interface IntelReportSection {
  heading: string;
  content: string;
  dataPoints: Array<{
    label: string;
    value: string;
    source: string;
  }>;
}

interface IntelReportContent {
  title: string;
  reportType: string;
  generatedAt: string;
  market: string | null;
  executive_summary: string;
  sections: IntelReportSection[];
  methodology: string;
}

// ============================================
// CONTEXT LOADING
// ============================================

/**
 * Load all relevant context for generating an intel report.
 */
async function getReportContext(
  strategyId: string,
  options: IntelReportOptions,
): Promise<IntelReportContext> {
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    select: {
      name: true,
      brandName: true,
      sector: true,
      vertical: true,
    },
  });

  const pillars = await db.pillar.findMany({
    where: { strategyId, status: "complete" },
    select: { type: true, title: true, content: true },
  });

  const signals = options.includeSignals !== false
    ? await db.signal.findMany({
        where: { strategyId, status: { in: ["active", "acknowledged"] } },
        select: { pillar: true, layer: true, title: true, description: true },
        take: 20,
      })
    : [];

  const competitors = options.includeCompetitors !== false
    ? await db.competitorSnapshot.findMany({
        where: { strategyId },
        select: { name: true, positioning: true },
        take: 10,
      })
    : [];

  const pricing = options.includePricing !== false
    ? await db.marketPricing.findMany({
        where: options.market ? { market: options.market } : {},
        select: {
          category: true,
          subcategory: true,
          label: true,
          avgPrice: true,
          currency: true,
          market: true,
        },
        take: 50,
      })
    : [];

  const opportunities = await db.opportunityCalendar.findMany({
    where: { strategyId },
    select: { title: true, type: true, impact: true, startDate: true, endDate: true },
    take: 15,
  });

  return { strategy, pillars, signals, competitors, pricing, opportunities };
}

// ============================================
// PROMPT BUILDING
// ============================================

/**
 * Build the AI prompt for intel report generation.
 */
function buildIntelPrompt(
  context: IntelReportContext,
  options: IntelReportOptions,
): { system: string; user: string } {
  const marketLabel = options.market
    ? MARKET_LABELS[options.market as keyof typeof MARKET_LABELS] ?? options.market
    : "multi-marché";

  const system = `Tu es un analyste senior en stratégie de marque et intelligence marché pour le marché ${marketLabel}.
Tu rédiges des rapports d'intelligence vendables — structurés, factuels, actionnables.
Chaque assertion doit être étayée par des données ou des sources identifiables.
Le rapport doit être professionnel, en français, et prêt à être présenté à un comité de direction.
Format de sortie : JSON avec la structure IntelReportContent (title, executive_summary, sections[], methodology).`;

  const pillarSummaries = context.pillars
    .map((p) => `- Pilier ${p.type} (${p.title}): ${typeof p.content === "string" ? p.content.substring(0, 200) : "données structurées disponibles"}`)
    .join("\n");

  const signalSummaries = context.signals.length > 0
    ? context.signals
        .map((s) => `- [${s.pillar}/${s.layer}] ${s.title}: ${s.description ?? ""}`)
        .join("\n")
    : "Aucun signal actif.";

  const competitorSummaries = context.competitors.length > 0
    ? context.competitors
        .map((c) => `- ${c.name}${c.positioning ? ` (${c.positioning})` : ""}`)
        .join("\n")
    : "Aucune donnée concurrentielle.";

  const pricingSummaries = context.pricing.length > 0
    ? Object.entries(
        context.pricing.reduce<Record<string, typeof context.pricing>>((acc, p) => {
          const cat = PRICING_CATEGORY_LABELS[p.category as keyof typeof PRICING_CATEGORY_LABELS] ?? p.category;
          if (!acc[cat]) acc[cat] = [];
          acc[cat]!.push(p);
          return acc;
        }, {}),
      )
        .map(([cat, items]) => `${cat}: ${items.length} entrées`)
        .join(", ")
    : "Aucune donnée tarifaire.";

  const opportunitySummaries = context.opportunities.length > 0
    ? context.opportunities
        .map((o) => `- ${o.title} (${o.type}, impact ${o.impact})`)
        .join("\n")
    : "Aucune opportunité calendrier.";

  const focusText = options.focusAreas?.length
    ? `Focus spécifique : ${options.focusAreas.join(", ")}`
    : "";

  const user = `Génère un rapport d'intelligence marché pour la marque "${context.strategy.brandName}" (projet: ${context.strategy.name}).
Secteur : ${context.strategy.sector ?? "non spécifié"}
Marché : ${marketLabel}
${focusText}

=== DONNÉES PILIERS ===
${pillarSummaries || "Aucune donnée pilier."}

=== SIGNAUX ACTIFS ===
${signalSummaries}

=== CONCURRENTS ===
${competitorSummaries}

=== DONNÉES TARIFAIRES ===
${pricingSummaries}

=== OPPORTUNITÉS ===
${opportunitySummaries}

Produis un rapport JSON complet avec :
1. Un executive summary de 3-5 phrases
2. 4-6 sections thématiques avec heading, content, et dataPoints
3. Une note méthodologique

Réponds UNIQUEMENT avec le JSON valide, sans markdown.`;

  return { system, user };
}

// ============================================
// GENERATION
// ============================================

/**
 * Generate an intel report for a strategy.
 */
export async function generateIntelReport(
  strategyId: string,
  generatedBy: string,
  options: IntelReportOptions = {},
) {
  // 1. Load context
  const context = await getReportContext(strategyId, options);

  // 2. Build prompt
  const { system, user } = buildIntelPrompt(context, options);

  // 3. Generate with AI
  const startTime = Date.now();
  const result = await generateText({
    model: anthropic(DEFAULT_MODEL),
    system,
    prompt: user,
    maxOutputTokens: 4000,
    temperature: 0.3,
  });

  const durationMs = Date.now() - startTime;

  // 4. Parse response
  let reportContent: IntelReportContent;
  try {
    reportContent = JSON.parse(result.text) as IntelReportContent;
  } catch {
    // Fallback: wrap raw text as report
    reportContent = {
      title: `Rapport Intel — ${context.strategy.brandName}`,
      reportType: "INTEL_REPORT",
      generatedAt: new Date().toISOString(),
      market: options.market ?? null,
      executive_summary: result.text.substring(0, 500),
      sections: [
        {
          heading: "Analyse complète",
          content: result.text,
          dataPoints: [],
        },
      ],
      methodology: "Généré par IA à partir des données ADVERTIS.",
    };
  }

  // 5. Persist as TranslationDocument
  const doc = await db.translationDocument.create({
    data: {
      strategyId,
      type: "INTEL_REPORT",
      version: 1,
      content: JSON.parse(JSON.stringify(reportContent)),
      status: "DRAFT",
      sourcePillars: JSON.parse(JSON.stringify(context.pillars.map((p) => p.type))),
      generatedBy,
      generatedAt: new Date(),
      metadata: JSON.parse(JSON.stringify({
        market: options.market,
        focusAreas: options.focusAreas,
        durationMs,
        tokensIn: result.usage?.inputTokens ?? 0,
        tokensOut: result.usage?.outputTokens ?? 0,
      })),
    },
  });

  return {
    document: {
      id: doc.id,
      type: doc.type,
      version: doc.version,
      status: doc.status,
      content: reportContent,
    },
    usage: {
      tokensIn: result.usage?.inputTokens ?? 0,
      tokensOut: result.usage?.outputTokens ?? 0,
      durationMs,
    },
  };
}
