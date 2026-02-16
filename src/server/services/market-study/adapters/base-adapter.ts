// Base interface for all market study data source adapters.
// Each adapter implements isConfigured() + collect() to fetch data from a specific source.

import type {
  DataSourceAdapter,
  CollectionParams,
  CollectionResult,
  DataSourceName,
} from "~/lib/types/market-study";

export type { DataSourceAdapter, CollectionParams, CollectionResult, DataSourceName };

/**
 * Utility: safely get an env var value (returns undefined if not set or empty).
 */
export function getEnvVar(name: string): string | undefined {
  const val = process.env[name]?.trim();
  return val || undefined;
}

/**
 * Utility: build search queries from collection params.
 */
export function buildSearchQueries(
  params: CollectionParams,
): { query: string; category: string }[] {
  const { brandName, sector, competitors, keywords } = params;
  const lang = params.language ?? "fr";
  const country = params.country ?? "FR";

  const queries: { query: string; category: string }[] = [];

  // Market size queries
  queries.push(
    { query: `${sector} market size ${country} 2024 2025`, category: "market_size" },
    { query: `taille marché ${sector} ${country}`, category: "market_size" },
  );

  // Trend queries
  queries.push(
    { query: `${sector} trends 2025 ${country}`, category: "trends" },
    { query: `tendances ${sector} ${lang === "fr" ? "France" : country}`, category: "trends" },
  );

  // Competitor queries
  for (const comp of competitors.slice(0, 3)) {
    queries.push(
      { query: `${comp} ${sector} company overview`, category: "competitors" },
    );
  }

  // TAM/SAM queries
  queries.push(
    { query: `${sector} TAM SAM SOM ${country}`, category: "tam_sam" },
  );

  // Brand-specific
  queries.push(
    { query: `${brandName} ${sector} avis clients`, category: "general" },
  );

  // Keyword-based
  for (const kw of keywords.slice(0, 2)) {
    queries.push(
      { query: `${kw} ${sector} ${country}`, category: "general" },
    );
  }

  return queries;
}
