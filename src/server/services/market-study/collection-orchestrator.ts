// =============================================================================
// MODULE 25 — Market Study Collection Orchestrator
// =============================================================================
// Orchestrates multi-source data collection for a brand's market study.
// Detects which adapters are configured, creates/updates MarketStudy record,
// runs all adapters in parallel (Promise.allSettled), stores results in the
// corresponding JSON columns, and sets per-source + overall status.
//
// Public API:
//   runMarketStudyCollection(strategyId, brandName, sector, competitors, keywords?)
//     -> { success, sourcesCompleted, sourcesTotal, errors }
//   getAvailableDataSources()
//     -> Array<{ sourceId, name, configured }>
//
// Dependencies:
//   ~/server/db                              — Prisma client (marketStudy)
//   ~/lib/types/market-study                 — DataSourceAdapter, CollectionParams, etc.
//   ./adapters/brave-search                  — BraveSearchAdapter
//   ./adapters/ai-web-search                 — AIWebSearchAdapter
//   ./adapters/google-trends                 — GoogleTrendsAdapter
//   ./adapters/crunchbase                    — CrunchbaseAdapter
//   ./adapters/similarweb                    — SimilarWebAdapter
//
// Called by:
//   tRPC market-study router (collect mutation)
// =============================================================================

import { db } from "~/server/db";
import type {
  DataSourceAdapter,
  CollectionParams,
  SourceStatusMap,
  DataSourceName,
} from "~/lib/types/market-study";
import { BraveSearchAdapter } from "./adapters/brave-search";
import { AIWebSearchAdapter } from "./adapters/ai-web-search";
import { GoogleTrendsAdapter } from "./adapters/google-trends";
import { CrunchbaseAdapter } from "./adapters/crunchbase";
import { SimilarWebAdapter } from "./adapters/similarweb";

// Map source IDs to their respective database fields
const SOURCE_TO_DB_FIELD: Record<DataSourceName, string> = {
  brave_search: "braveSearchResults",
  google_trends: "googleTrendsData",
  crunchbase: "crunchbaseData",
  similarweb: "similarWebData",
  ai_web_search: "aiWebSearchResults",
  // Manual sources are not auto-collected
  manual_internal: "",
  manual_external: "",
  manual_interview: "",
  ai_synthesis: "",
};

/**
 * Run market study data collection for a strategy.
 * 1. Detect which adapters are configured
 * 2. Create/update MarketStudy record → "collecting"
 * 3. Run all adapters in parallel (Promise.allSettled)
 * 4. Store results in the corresponding JSON fields
 * 5. Update source statuses
 * 6. Set overall status → "partial" or "complete"
 */
export async function runMarketStudyCollection(
  strategyId: string,
  brandName: string,
  sector: string,
  competitors: string[],
  keywords?: string[],
): Promise<{
  success: boolean;
  sourcesCompleted: number;
  sourcesTotal: number;
  errors: string[];
}> {
  // Build collection params
  const params: CollectionParams = {
    brandName,
    sector,
    competitors,
    keywords: keywords ?? [brandName, sector],
    country: "FR",
    language: "fr",
  };

  // Initialize all adapters
  const allAdapters: DataSourceAdapter[] = [
    new BraveSearchAdapter(),
    new AIWebSearchAdapter(),
    new GoogleTrendsAdapter(),
    new CrunchbaseAdapter(),
    new SimilarWebAdapter(),
  ];

  // Filter to configured adapters only
  const configuredAdapters = allAdapters.filter((a) => a.isConfigured());
  const unconfiguredAdapters = allAdapters.filter((a) => !a.isConfigured());

  // Build initial source statuses
  const sourceStatuses: SourceStatusMap = {};
  for (const adapter of configuredAdapters) {
    sourceStatuses[adapter.sourceId] = "collecting";
  }
  for (const adapter of unconfiguredAdapters) {
    sourceStatuses[adapter.sourceId] = "not_configured";
  }

  // Create or update MarketStudy record
  const existing = await db.marketStudy.findUnique({
    where: { strategyId },
  });

  if (existing) {
    await db.marketStudy.update({
      where: { strategyId },
      data: {
        status: "collecting",
        sourceStatuses: JSON.parse(JSON.stringify(sourceStatuses)),
      },
    });
  } else {
    await db.marketStudy.create({
      data: {
        strategyId,
        status: "collecting",
        sourceStatuses: JSON.parse(JSON.stringify(sourceStatuses)),
      },
    });
  }

  // Run all configured adapters in parallel
  const results = await Promise.allSettled(
    configuredAdapters.map(async (adapter) => {
      console.log(`[MarketStudy] Starting ${adapter.name}...`);
      const startTime = Date.now();
      const result = await adapter.collect(params);
      const duration = Date.now() - startTime;
      console.log(
        `[MarketStudy] ${adapter.name} ${result.success ? "✓" : "✗"} — ${result.dataPointCount} data points in ${duration}ms`,
      );
      return { adapter, result, duration };
    }),
  );

  // Process results and update database
  const errors: string[] = [];
  let sourcesCompleted = 0;

  for (const settledResult of results) {
    if (settledResult.status === "rejected") {
      const error = settledResult.reason as Error;
      errors.push(`Unknown adapter: ${error.message}`);
      continue;
    }

    const { adapter, result } = settledResult.value;
    const dbField = SOURCE_TO_DB_FIELD[adapter.sourceId];

    // Update source status
    sourceStatuses[adapter.sourceId] = result.success
      ? "complete"
      : result.error
        ? "error"
        : "partial";

    if (result.success) {
      sourcesCompleted++;
    } else if (result.error) {
      errors.push(`${adapter.name}: ${result.error}`);
    }

    // Store results in the corresponding JSON field
    if (dbField && result.data) {
      await db.marketStudy.update({
        where: { strategyId },
        data: {
          [dbField]: JSON.parse(JSON.stringify(result.data)),
          sourceStatuses: JSON.parse(JSON.stringify(sourceStatuses)),
        },
      });
    }
  }

  // Determine overall status
  const totalConfigured = configuredAdapters.length;
  const overallStatus =
    sourcesCompleted === totalConfigured
      ? "complete"
      : sourcesCompleted > 0
        ? "partial"
        : "error";

  // Final update
  await db.marketStudy.update({
    where: { strategyId },
    data: {
      status: overallStatus === "error" ? "partial" : overallStatus,
      sourceStatuses: JSON.parse(JSON.stringify(sourceStatuses)),
    },
  });

  return {
    success: sourcesCompleted > 0,
    sourcesCompleted,
    sourcesTotal: totalConfigured,
    errors,
  };
}

/**
 * Get the list of available/configured data sources with their statuses.
 */
export function getAvailableDataSources(): Array<{
  sourceId: DataSourceName;
  name: string;
  configured: boolean;
}> {
  const adapters: DataSourceAdapter[] = [
    new BraveSearchAdapter(),
    new AIWebSearchAdapter(),
    new GoogleTrendsAdapter(),
    new CrunchbaseAdapter(),
    new SimilarWebAdapter(),
  ];

  return adapters.map((a) => ({
    sourceId: a.sourceId,
    name: a.name,
    configured: a.isConfigured(),
  }));
}
