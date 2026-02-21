// =============================================================================
// MODULE 25G — SimilarWeb Adapter
// =============================================================================
// Fetches web traffic analytics (monthly visits, global/country rank, bounce
// rate, avg visit duration, pages per visit, traffic source breakdown) for
// competitor domains from the SimilarWeb Digital Data API v1.
// Includes a domain-extraction heuristic for company names.
// Requires env SIMILARWEB_API_KEY.
//
// Implements: DataSourceAdapter { isConfigured(), collect(params) }
// sourceId: "similarweb"
//
// Public API (exported):
//   SimilarWebAdapter class
//
// Dependencies:
//   ~/lib/types/market-study         — CollectionParams, CollectionResult, SimilarWeb* types
//   ./base-adapter                   — getEnvVar
//
// Called by:
//   market-study/collection-orchestrator.ts (instantiated + collect())
// =============================================================================

import type {
  CollectionParams,
  CollectionResult,
  DataSourceAdapter,
  SimilarWebData,
  SimilarWebSiteData,
} from "~/lib/types/market-study";
import { getEnvVar } from "./base-adapter";

const API_BASE = "https://api.similarweb.com/v1";

export class SimilarWebAdapter implements DataSourceAdapter {
  name = "SimilarWeb";
  sourceId = "similarweb" as const;

  isConfigured(): boolean {
    return !!getEnvVar("SIMILARWEB_API_KEY");
  }

  async collect(params: CollectionParams): Promise<CollectionResult> {
    const apiKey = getEnvVar("SIMILARWEB_API_KEY");
    if (!apiKey) {
      return {
        success: false,
        data: null,
        dataPointCount: 0,
        error: "SIMILARWEB_API_KEY not configured",
      };
    }

    const sites: SimilarWebSiteData[] = [];

    // Extract domains from competitor names
    // The user should provide domains in the competitors list, but we also try to guess
    const domains = params.competitors
      .slice(0, 5)
      .map((c) => extractDomain(c))
      .filter(Boolean) as string[];

    for (const domain of domains) {
      try {
        // Fetch global rank and traffic data
        const trafficUrl = `${API_BASE}/website/${domain}/total-traffic-and-engagement/visits?api_key=${apiKey}&start_date=2024-10&end_date=2025-01&main_domain_only=false&granularity=monthly`;
        const response = await fetch(trafficUrl);

        if (!response.ok) {
          console.warn(`[SimilarWeb] Traffic failed for "${domain}" (${response.status})`);
          // Add domain with no data
          sites.push({ domain });
          continue;
        }

        const data = (await response.json()) as {
          visits?: Array<{ visits: number }>;
          global_rank?: number;
          country_rank?: number;
          bounce_rate?: number;
          pages_per_visit?: number;
          avg_visit_duration?: number;
        };

        // Get the most recent month's visits
        const latestVisits = data.visits?.[data.visits.length - 1]?.visits;

        // Fetch traffic sources
        let trafficSources: SimilarWebSiteData["trafficSources"] | undefined;
        try {
          const sourcesUrl = `${API_BASE}/website/${domain}/traffic-sources/overview?api_key=${apiKey}&start_date=2024-10&end_date=2025-01&main_domain_only=false&granularity=monthly`;
          const sourcesResponse = await fetch(sourcesUrl);

          if (sourcesResponse.ok) {
            const sourcesData = (await sourcesResponse.json()) as {
              overview?: Array<{
                source_type?: string;
                share?: number;
              }>;
            };

            const sources: Record<string, number> = {};
            for (const item of sourcesData.overview ?? []) {
              if (item.source_type && item.share !== undefined) {
                sources[item.source_type] = item.share;
              }
            }

            if (Object.keys(sources).length > 0) {
              trafficSources = {
                direct: sources["Direct"] ?? 0,
                search: (sources["Organic Search"] ?? 0) + (sources["Paid Search"] ?? 0),
                social: sources["Social"] ?? 0,
                referral: sources["Referrals"] ?? 0,
                mail: sources["Mail"] ?? 0,
                display: sources["Display Ads"] ?? 0,
              };
            }
          }
        } catch {
          // Traffic sources fetch failed — not critical
        }

        sites.push({
          domain,
          globalRank: data.global_rank,
          countryRank: data.country_rank,
          monthlyVisits: latestVisits,
          bounceRate: data.bounce_rate,
          avgVisitDuration: data.avg_visit_duration,
          pagesPerVisit: data.pages_per_visit,
          trafficSources,
        });

        // Rate limit
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.warn(`[SimilarWeb] Error for "${domain}":`, error);
      }
    }

    const similarWebData: SimilarWebData = {
      sites,
      collectedAt: new Date().toISOString(),
    };

    return {
      success: sites.some((s) => s.monthlyVisits !== undefined),
      data: similarWebData,
      dataPointCount: sites.filter((s) => s.monthlyVisits !== undefined).length,
    };
  }
}

/**
 * Attempt to extract a domain from a company name or URL.
 */
function extractDomain(input: string): string | null {
  // If it's already a domain-like string
  if (input.includes(".") && !input.includes(" ")) {
    return input.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  }

  // Try to build a domain from company name
  const cleaned = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "");

  if (cleaned.length > 2) {
    return `${cleaned}.com`;
  }

  return null;
}
