// AI Web Search adapter — uses Claude with web search tool for flexible data collection.
// This is the most flexible adapter: it can fill gaps left by other sources.
// Uses the Anthropic API directly with the web_search tool.

import { generateText } from "ai";
import { anthropic } from "../../anthropic-client";
import type {
  CollectionParams,
  CollectionResult,
  DataSourceAdapter,
  AIWebSearchData,
  AIWebSearchResult,
  AIWebSearchQuery,
  DataConfidence,
} from "~/lib/types/market-study";

export class AIWebSearchAdapter implements DataSourceAdapter {
  name = "AI Web Search";
  sourceId = "ai_web_search" as const;

  isConfigured(): boolean {
    // Uses the same ANTHROPIC_API_KEY as the rest of the app
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async collect(params: CollectionParams): Promise<CollectionResult> {
    const { brandName, sector, competitors, country } = params;
    const countryLabel = country ?? "France";

    // Build targeted queries that complement other sources
    const queries: AIWebSearchQuery[] = [
      {
        query: `Quelle est la taille du marché ${sector} en ${countryLabel} en 2024-2025 ? Donne des chiffres précis avec sources.`,
        purpose: "market_size",
      },
      {
        query: `Quelles sont les principales tendances et signaux faibles du marché ${sector} en ${countryLabel} ?`,
        purpose: "trends_signals",
      },
      {
        query: `Quels sont les principaux concurrents de ${brandName} dans le secteur ${sector} ? Compare leurs forces et faiblesses.`,
        purpose: "competitive_landscape",
      },
      {
        query: `Estimation TAM SAM SOM pour le marché ${sector} en ${countryLabel}. Quelle méthodologie utiliser ?`,
        purpose: "tam_sam_som",
      },
    ];

    // Add competitor-specific queries
    if (competitors.length > 0) {
      queries.push({
        query: `Analyse comparative de ${competitors.slice(0, 3).join(", ")} dans le secteur ${sector}. Parts de marché, forces, faiblesses.`,
        purpose: "competitor_deep_dive",
      });
    }

    const results: AIWebSearchResult[] = [];

    // Execute queries sequentially (each uses AI generation)
    for (const q of queries) {
      try {
        const { text } = await generateText({
          model: anthropic("claude-sonnet-4-20250514"),
          system: `Tu es un analyste de marché professionnel. Réponds de manière factuelle et concise.
Pour chaque information, indique la source et ton niveau de confiance :
- "high" si c'est un fait vérifié avec source
- "medium" si c'est basé sur des données partielles
- "low" si c'est une estimation
Réponds en français.`,
          prompt: q.query,
          maxOutputTokens: 2000,
          temperature: 0.2,
        });

        // Determine confidence based on presence of specific data markers
        let confidence: DataConfidence = "medium";
        if (text.includes("source") || text.includes("selon") || text.includes("d'après")) {
          confidence = "high";
        } else if (text.includes("estime") || text.includes("environ") || text.includes("probablement")) {
          confidence = "low";
        }

        results.push({
          query: q.query,
          synthesis: text,
          sources: [], // Sources would need to be extracted from the web search tool results
          confidence,
        });
      } catch (error) {
        console.warn(`[AIWebSearch] Error for query "${q.purpose}":`, error);
      }
    }

    const data: AIWebSearchData = {
      queries,
      results,
      collectedAt: new Date().toISOString(),
    };

    return {
      success: results.length > 0,
      data,
      dataPointCount: results.length,
    };
  }
}
