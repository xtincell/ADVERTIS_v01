// =============================================================================
// MODULE 25C — Brave Search Adapter
// =============================================================================
// Multi-query web search adapter using the Brave Search API. Runs a set of
// targeted queries (market size, trends, competitors, TAM/SAM) sequentially
// with rate-limit pauses, and aggregates results into BraveSearchData.
// Requires env BRAVE_SEARCH_API_KEY.
//
// Implements: DataSourceAdapter { isConfigured(), collect(params) }
// sourceId: "brave_search"
//
// Public API (exported):
//   BraveSearchAdapter class
//
// Dependencies:
//   ~/lib/types/market-study         — CollectionParams, CollectionResult, BraveSearch* types
//   ./base-adapter                   — getEnvVar, buildSearchQueries
//
// Called by:
//   market-study/collection-orchestrator.ts (instantiated + collect())
// =============================================================================

import type {
  CollectionParams,
  CollectionResult,
  DataSourceAdapter,
  BraveSearchData,
  BraveSearchResult,
  BraveSearchQuery,
} from "~/lib/types/market-study";
import { getEnvVar, buildSearchQueries } from "./base-adapter";

const API_BASE = "https://api.search.brave.com/res/v1/web/search";

export class BraveSearchAdapter implements DataSourceAdapter {
  name = "Brave Search";
  sourceId = "brave_search" as const;

  isConfigured(): boolean {
    return !!getEnvVar("BRAVE_SEARCH_API_KEY");
  }

  async collect(params: CollectionParams): Promise<CollectionResult> {
    const apiKey = getEnvVar("BRAVE_SEARCH_API_KEY");
    if (!apiKey) {
      return { success: false, data: null, dataPointCount: 0, error: "BRAVE_SEARCH_API_KEY not configured" };
    }

    const searchQueries = buildSearchQueries(params);
    const queries: BraveSearchQuery[] = [];
    const results: Record<string, BraveSearchResult[]> = {};
    let totalDataPoints = 0;

    // Execute queries sequentially to respect rate limits (1 req/sec for free tier)
    for (const sq of searchQueries) {
      try {
        const url = new URL(API_BASE);
        url.searchParams.set("q", sq.query);
        url.searchParams.set("count", "5");
        url.searchParams.set("search_lang", params.language ?? "fr");
        url.searchParams.set("country", params.country ?? "FR");

        const response = await fetch(url.toString(), {
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": apiKey,
          },
        });

        if (!response.ok) {
          console.warn(`[BraveSearch] Query failed (${response.status}): ${sq.query}`);
          continue;
        }

        const data = (await response.json()) as {
          web?: {
            results?: Array<{
              title: string;
              url: string;
              description: string;
              age?: string;
            }>;
          };
        };

        const webResults: BraveSearchResult[] = (data.web?.results ?? []).map((r) => ({
          title: r.title,
          url: r.url,
          description: r.description,
          age: r.age,
        }));

        queries.push({
          query: sq.query,
          category: sq.category as BraveSearchQuery["category"],
          resultCount: webResults.length,
        });
        results[sq.query] = webResults;
        totalDataPoints += webResults.length;

        // Rate limit: wait 1.1s between requests
        await new Promise((resolve) => setTimeout(resolve, 1100));
      } catch (error) {
        console.warn(`[BraveSearch] Error for query "${sq.query}":`, error);
      }
    }

    const braveData: BraveSearchData = {
      queries,
      results,
      collectedAt: new Date().toISOString(),
    };

    return {
      success: totalDataPoints > 0,
      data: braveData,
      dataPointCount: totalDataPoints,
    };
  }
}
