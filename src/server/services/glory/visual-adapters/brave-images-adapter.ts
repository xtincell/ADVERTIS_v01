// =============================================================================
// SERVICE S.GLORY.VA.6 — Brave Image Search Adapter
// =============================================================================
// Searches Brave Image Search for visual inspiration with regional diversity.
// API: https://api.search.brave.com/res/v1/images/search
// Reuses: BRAVE_SEARCH_API_KEY (already configured in the system!)
//
// Key feature: runs multi-regional queries to source inspiration from
// Africa, Europe, Americas, and Asia — covering design platforms that
// don't have dedicated APIs (Zcool, Behance regional, Dribbble via search).
// =============================================================================

import type {
  VisualDataAdapter,
  VisualSearchParams,
  VisualSearchResult,
  VisualReference,
} from "./base-visual-adapter";
import { getEnvVar, rateLimitPause } from "./base-visual-adapter";

const API_BASE = "https://api.search.brave.com/res/v1/images/search";

// Regional query templates
const REGIONAL_QUERIES: Record<string, { queries: string[]; lang: string; country: string }> = {
  afrique: {
    queries: [
      "{keyword} african design inspiration branding",
      "design graphique afrique {keyword} identité visuelle",
      "{keyword} african brand identity packaging FMCG",
    ],
    lang: "fr",
    country: "CM",
  },
  europe: {
    queries: [
      "{keyword} european design Swiss minimalism Scandinavian branding",
      "design européen {keyword} identité de marque",
      "{keyword} brand identity design Europe Pentagram Collins",
    ],
    lang: "fr",
    country: "FR",
  },
  ameriques: {
    queries: [
      "{keyword} brand design North America identity",
      "{keyword} Latin American design Brazilian identity vibrant",
      "{keyword} creative branding Americas packaging",
    ],
    lang: "en",
    country: "US",
  },
  asie: {
    queries: [
      "{keyword} design Japan Korea minimalist aesthetic branding",
      "{keyword} Chinese brand identity modern design",
      "{keyword} Asian brand design inspiration contemporary",
    ],
    lang: "en",
    country: "JP",
  },
  "moyen-orient": {
    queries: [
      "{keyword} Middle East brand design Arabic calligraphy modern",
      "{keyword} MENA brand identity luxury design",
    ],
    lang: "en",
    country: "AE",
  },
  global: {
    queries: [
      "{keyword} brand identity design inspiration best",
      "{keyword} visual identity moodboard design",
    ],
    lang: "en",
    country: "US",
  },
};

export class BraveImagesAdapter implements VisualDataAdapter {
  name = "Brave Images";
  sourceId = "brave";

  isConfigured(): boolean {
    return !!getEnvVar("BRAVE_SEARCH_API_KEY");
  }

  async search(params: VisualSearchParams): Promise<VisualSearchResult> {
    const apiKey = getEnvVar("BRAVE_SEARCH_API_KEY");
    if (!apiKey) {
      return {
        success: false,
        source: this.sourceId,
        references: [],
        error: "BRAVE_SEARCH_API_KEY not configured",
      };
    }

    try {
      const keyword = [params.brandName, ...params.keywords.slice(0, 2)].join(
        " ",
      );
      const perSource = params.perSource ?? 6;

      // Determine which regions to search
      const regions = params.regions ??
        (params.region ? [params.region] : ["global"]);

      const allReferences: VisualReference[] = [];

      for (const region of regions) {
        const regionKey = region.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const regionConfig = REGIONAL_QUERIES[regionKey] ?? REGIONAL_QUERIES["global"]!;

        // Run up to 2 queries per region to stay within rate limits
        const queries = regionConfig.queries.slice(0, 2);
        const countPerQuery = Math.ceil(perSource / queries.length);

        for (const queryTemplate of queries) {
          const query = queryTemplate.replace(/\{keyword\}/g, keyword);

          const url = new URL(API_BASE);
          url.searchParams.set("q", query);
          url.searchParams.set("count", String(Math.min(countPerQuery, 10)));
          url.searchParams.set("search_lang", regionConfig.lang);
          url.searchParams.set("country", regionConfig.country);
          url.searchParams.set("safesearch", "moderate");

          const response = await fetch(url.toString(), {
            headers: {
              Accept: "application/json",
              "Accept-Encoding": "gzip",
              "X-Subscription-Token": apiKey,
            },
          });

          if (!response.ok) {
            console.warn(
              `[BraveImages] Query failed (${response.status}): ${query}`,
            );
            await rateLimitPause();
            continue;
          }

          const data = (await response.json()) as BraveImageSearchResponse;

          const refs: VisualReference[] = (data.results ?? []).map(
            (img, idx) => ({
              id: `brave-${region}-${idx}-${Date.now()}`,
              source: this.sourceId,
              title: img.title ?? "Image",
              imageUrl: img.properties?.url ?? img.thumbnail?.src ?? "",
              thumbnailUrl:
                img.thumbnail?.src ?? img.properties?.url ?? "",
              dominantColor: undefined,
              colorPalette: undefined,
              attribution: img.source ?? new URL(img.url ?? "https://unknown").hostname,
              sourceUrl: img.url ?? "",
              tags: [],
              region: region.toLowerCase(),
            }),
          );

          allReferences.push(...refs);

          // Rate limit: 1 req/sec for free tier
          await rateLimitPause();
        }
      }

      return {
        success: true,
        source: this.sourceId,
        references: allReferences.slice(0, perSource * regions.length),
      };
    } catch (error) {
      return {
        success: false,
        source: this.sourceId,
        references: [],
        error: `Brave Images error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BraveImageSearchResponse {
  results?: Array<{
    title?: string;
    url?: string;
    source?: string;
    thumbnail?: { src?: string; width?: number; height?: number };
    properties?: { url?: string };
  }>;
}
