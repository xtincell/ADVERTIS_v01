// =============================================================================
// SERVICE S.GLORY.VA.1 — Unsplash Visual Adapter
// =============================================================================
// Searches Unsplash for high-quality photos matching brand visual direction.
// API: https://api.unsplash.com/search/photos
// Requires env: UNSPLASH_ACCESS_KEY (free tier: 50 req/hour)
// =============================================================================

import type {
  VisualDataAdapter,
  VisualSearchParams,
  VisualSearchResult,
  VisualReference,
} from "./base-visual-adapter";
import { getEnvVar, buildVisualQuery } from "./base-visual-adapter";

const API_BASE = "https://api.unsplash.com/search/photos";

export class UnsplashAdapter implements VisualDataAdapter {
  name = "Unsplash";
  sourceId = "unsplash";

  isConfigured(): boolean {
    return !!getEnvVar("UNSPLASH_ACCESS_KEY");
  }

  async search(params: VisualSearchParams): Promise<VisualSearchResult> {
    const apiKey = getEnvVar("UNSPLASH_ACCESS_KEY");
    if (!apiKey) {
      return {
        success: false,
        source: this.sourceId,
        references: [],
        error: "UNSPLASH_ACCESS_KEY not configured",
      };
    }

    try {
      const query = buildVisualQuery(params);
      const perPage = Math.min(params.perSource ?? 6, 30);

      const url = new URL(API_BASE);
      url.searchParams.set("query", query);
      url.searchParams.set("per_page", String(perPage));
      url.searchParams.set("orientation", "landscape");

      // Color filter — Unsplash supports named colors
      if (params.colors && params.colors.length > 0) {
        const unsplashColor = mapHexToUnsplashColor(params.colors[0]!);
        if (unsplashColor) {
          url.searchParams.set("color", unsplashColor);
        }
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Client-ID ${apiKey}`,
          "Accept-Version": "v1",
        },
      });

      if (!response.ok) {
        return {
          success: false,
          source: this.sourceId,
          references: [],
          error: `Unsplash API error: ${response.status} ${response.statusText}`,
        };
      }

      const data = (await response.json()) as UnsplashSearchResponse;

      const references: VisualReference[] = (data.results ?? []).map(
        (photo) => ({
          id: `unsplash-${photo.id}`,
          source: this.sourceId,
          title: photo.description ?? photo.alt_description ?? "Untitled",
          imageUrl: photo.urls?.regular ?? photo.urls?.full ?? "",
          thumbnailUrl: photo.urls?.thumb ?? photo.urls?.small ?? "",
          dominantColor: photo.color ?? undefined,
          colorPalette: undefined,
          attribution: photo.user?.name ?? "Unknown",
          sourceUrl: photo.links?.html ?? `https://unsplash.com/photos/${photo.id}`,
          tags: (photo.tags ?? [])
            .map((t: { title?: string }) => t.title)
            .filter(Boolean)
            .slice(0, 5) as string[],
          region: "global",
        }),
      );

      return { success: true, source: this.sourceId, references };
    } catch (error) {
      return {
        success: false,
        source: this.sourceId,
        references: [],
        error: `Unsplash error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface UnsplashSearchResponse {
  results?: Array<{
    id: string;
    description?: string;
    alt_description?: string;
    color?: string;
    urls?: {
      raw?: string;
      full?: string;
      regular?: string;
      small?: string;
      thumb?: string;
    };
    links?: { html?: string };
    user?: { name?: string };
    tags?: Array<{ title?: string }>;
  }>;
}

/**
 * Map a hex color to Unsplash's supported named colors.
 * Unsplash supports: black_and_white, black, white, yellow, orange, red,
 * purple, magenta, green, teal, blue.
 */
function mapHexToUnsplashColor(hex: string): string | null {
  const h = hex.replace("#", "").toLowerCase();
  if (!h || h.length < 6) return null;

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  // Simple hue-based mapping
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (max - min < 30) {
    if (max < 50) return "black";
    if (max > 200) return "white";
    return null;
  }

  let hue = 0;
  if (max === r) hue = ((g - b) / (max - min)) * 60;
  else if (max === g) hue = (2 + (b - r) / (max - min)) * 60;
  else hue = (4 + (r - g) / (max - min)) * 60;
  if (hue < 0) hue += 360;

  if (hue < 15 || hue >= 345) return "red";
  if (hue < 45) return "orange";
  if (hue < 75) return "yellow";
  if (hue < 165) return "green";
  if (hue < 195) return "teal";
  if (hue < 255) return "blue";
  if (hue < 285) return "purple";
  return "magenta";
}
