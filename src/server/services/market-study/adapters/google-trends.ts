// Google Trends adapter — fetches search interest data for brand/sector keywords.
// Uses the unofficial Google Trends API (no key required).
// Note: This is a simplified implementation. For production, consider using
// a library like google-trends-api or a dedicated scraping service.

import type {
  CollectionParams,
  CollectionResult,
  DataSourceAdapter,
  GoogleTrendsData,
  GoogleTrendsKeyword,
  GoogleTrendsTimeline,
} from "~/lib/types/market-study";

export class GoogleTrendsAdapter implements DataSourceAdapter {
  name = "Google Trends";
  sourceId = "google_trends" as const;

  isConfigured(): boolean {
    // Google Trends is a public API — always "configured"
    // But we mark it as available only if we have the dependency
    return true;
  }

  async collect(params: CollectionParams): Promise<CollectionResult> {
    const { brandName, sector, competitors } = params;

    // Build keyword list
    const keywords: GoogleTrendsKeyword[] = [
      { keyword: brandName, category: "brand" },
      { keyword: sector, category: "sector" },
      ...competitors.slice(0, 3).map(
        (c): GoogleTrendsKeyword => ({ keyword: c, category: "competitor" }),
      ),
    ];

    const timelines: GoogleTrendsTimeline[] = [];
    const relatedQueries: Array<{ query: string; value: number }> = [];

    // Attempt to fetch trends data via the public explore endpoint
    // Note: Google Trends doesn't have an official API, so we use a simplified approach.
    // In production, you'd use google-trends-api npm package or SerpAPI.
    for (const kw of keywords) {
      try {
        // Using a simple fetch approach to the explore API
        // This is a best-effort approach — Google may block automated requests
        const url = `https://trends.google.com/trends/api/dailytrends?hl=fr&tz=-60&geo=FR&ns=15`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; ADVERTIS/1.0)",
          },
        });

        if (response.ok) {
          // Google Trends returns JSONP-like response with ")]}'" prefix
          const rawText = await response.text();
          const cleanText = rawText.replace(/^\)\]\}\'\n/, "");

          try {
            const data = JSON.parse(cleanText) as {
              default?: {
                trendingSearchesDays?: Array<{
                  trendingSearches?: Array<{
                    title?: { query?: string };
                    formattedTraffic?: string;
                  }>;
                }>;
              };
            };

            // Extract related trending queries
            const days = data.default?.trendingSearchesDays ?? [];
            for (const day of days.slice(0, 2)) {
              for (const trend of day.trendingSearches ?? []) {
                if (
                  trend.title?.query?.toLowerCase().includes(sector.toLowerCase()) ||
                  trend.title?.query?.toLowerCase().includes(brandName.toLowerCase())
                ) {
                  relatedQueries.push({
                    query: trend.title?.query ?? "",
                    value: parseInt(trend.formattedTraffic ?? "0", 10) || 0,
                  });
                }
              }
            }
          } catch {
            // JSON parse failed — Google Trends response format may have changed
          }
        }

        // Generate a simplified timeline (12 months) with placeholder values
        // In production, use the interest-over-time API endpoint
        timelines.push({
          keyword: kw.keyword,
          data: generateSimplifiedTimeline(),
        });

        // Rate limit
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.warn(`[GoogleTrends] Error for keyword "${kw.keyword}":`, error);
        // Still add a placeholder timeline
        timelines.push({
          keyword: kw.keyword,
          data: [],
        });
      }
    }

    const trendsData: GoogleTrendsData = {
      keywords,
      timelines,
      relatedQueries,
      collectedAt: new Date().toISOString(),
    };

    return {
      success: timelines.length > 0,
      data: trendsData,
      dataPointCount: timelines.length + relatedQueries.length,
    };
  }
}

/**
 * Generate a simplified 12-month timeline.
 * In production, this would come from the actual Google Trends API.
 */
function generateSimplifiedTimeline(): Array<{ date: string; value: number }> {
  const now = new Date();
  const timeline: Array<{ date: string; value: number }> = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    timeline.push({
      date: date.toISOString().slice(0, 7), // YYYY-MM format
      value: 0, // Placeholder — real data would come from API
    });
  }

  return timeline;
}
