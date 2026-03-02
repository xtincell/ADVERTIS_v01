// =============================================================================
// SERVICE S.GLORY.VA.2 — Pexels Visual Adapter
// =============================================================================
// Searches Pexels for photos matching brand visual direction.
// API: https://api.pexels.com/v1/search
// Requires env: PEXELS_API_KEY (free tier: 200 req/hour)
// =============================================================================

import type {
  VisualDataAdapter,
  VisualSearchParams,
  VisualSearchResult,
  VisualReference,
} from "./base-visual-adapter";
import { getEnvVar, buildVisualQuery } from "./base-visual-adapter";

const API_BASE = "https://api.pexels.com/v1/search";

export class PexelsAdapter implements VisualDataAdapter {
  name = "Pexels";
  sourceId = "pexels";

  isConfigured(): boolean {
    return !!getEnvVar("PEXELS_API_KEY");
  }

  async search(params: VisualSearchParams): Promise<VisualSearchResult> {
    const apiKey = getEnvVar("PEXELS_API_KEY");
    if (!apiKey) {
      return {
        success: false,
        source: this.sourceId,
        references: [],
        error: "PEXELS_API_KEY not configured",
      };
    }

    try {
      const query = buildVisualQuery(params);
      const perPage = Math.min(params.perSource ?? 6, 80);

      const url = new URL(API_BASE);
      url.searchParams.set("query", query);
      url.searchParams.set("per_page", String(perPage));
      url.searchParams.set("orientation", "landscape");

      // Pexels supports hex color filtering
      if (params.colors && params.colors.length > 0) {
        url.searchParams.set(
          "color",
          params.colors[0]!.replace("#", ""),
        );
      }

      const response = await fetch(url.toString(), {
        headers: { Authorization: apiKey },
      });

      if (!response.ok) {
        return {
          success: false,
          source: this.sourceId,
          references: [],
          error: `Pexels API error: ${response.status} ${response.statusText}`,
        };
      }

      const data = (await response.json()) as PexelsSearchResponse;

      const references: VisualReference[] = (data.photos ?? []).map(
        (photo) => ({
          id: `pexels-${photo.id}`,
          source: this.sourceId,
          title: photo.alt ?? `Photo by ${photo.photographer ?? "Unknown"}`,
          imageUrl: photo.src?.large ?? photo.src?.original ?? "",
          thumbnailUrl: photo.src?.small ?? photo.src?.tiny ?? "",
          dominantColor: photo.avg_color ?? undefined,
          colorPalette: undefined,
          attribution: photo.photographer ?? "Unknown",
          sourceUrl: photo.url ?? `https://www.pexels.com/photo/${photo.id}`,
          tags: [],
          region: "global",
        }),
      );

      return { success: true, source: this.sourceId, references };
    } catch (error) {
      return {
        success: false,
        source: this.sourceId,
        references: [],
        error: `Pexels error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PexelsSearchResponse {
  photos?: Array<{
    id: number;
    url?: string;
    photographer?: string;
    alt?: string;
    avg_color?: string;
    src?: {
      original?: string;
      large?: string;
      medium?: string;
      small?: string;
      tiny?: string;
    };
  }>;
}
