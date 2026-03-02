// =============================================================================
// SERVICE S.GLORY.VA.3 — Pixabay Visual Adapter
// =============================================================================
// Searches Pixabay for royalty-free images matching brand visual direction.
// API: https://pixabay.com/api/
// Requires env: PIXABAY_API_KEY (free tier: 5000+ req/hour)
// =============================================================================

import type {
  VisualDataAdapter,
  VisualSearchParams,
  VisualSearchResult,
  VisualReference,
} from "./base-visual-adapter";
import { getEnvVar, buildVisualQuery } from "./base-visual-adapter";

const API_BASE = "https://pixabay.com/api/";

export class PixabayAdapter implements VisualDataAdapter {
  name = "Pixabay";
  sourceId = "pixabay";

  isConfigured(): boolean {
    return !!getEnvVar("PIXABAY_API_KEY");
  }

  async search(params: VisualSearchParams): Promise<VisualSearchResult> {
    const apiKey = getEnvVar("PIXABAY_API_KEY");
    if (!apiKey) {
      return {
        success: false,
        source: this.sourceId,
        references: [],
        error: "PIXABAY_API_KEY not configured",
      };
    }

    try {
      const query = buildVisualQuery(params);
      const perPage = Math.min(params.perSource ?? 6, 200);

      const url = new URL(API_BASE);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("q", query);
      url.searchParams.set("per_page", String(perPage));
      url.searchParams.set("image_type", "photo");
      url.searchParams.set("orientation", "horizontal");
      url.searchParams.set("lang", "fr");
      url.searchParams.set("safesearch", "true");

      // Pixabay supports named color filtering
      if (params.colors && params.colors.length > 0) {
        const pixabayColor = mapHexToPixabayColor(params.colors[0]!);
        if (pixabayColor) {
          url.searchParams.set("colors", pixabayColor);
        }
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        return {
          success: false,
          source: this.sourceId,
          references: [],
          error: `Pixabay API error: ${response.status} ${response.statusText}`,
        };
      }

      const data = (await response.json()) as PixabaySearchResponse;

      const references: VisualReference[] = (data.hits ?? []).map((hit) => ({
        id: `pixabay-${hit.id}`,
        source: this.sourceId,
        title: hit.tags ?? "Untitled",
        imageUrl: hit.largeImageURL ?? hit.webformatURL ?? "",
        thumbnailUrl: hit.previewURL ?? hit.webformatURL ?? "",
        dominantColor: undefined,
        colorPalette: undefined,
        attribution: hit.user ?? "Unknown",
        sourceUrl: hit.pageURL ?? `https://pixabay.com/photos/${hit.id}`,
        tags: (hit.tags ?? "")
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
          .slice(0, 5),
        region: "global",
      }));

      return { success: true, source: this.sourceId, references };
    } catch (error) {
      return {
        success: false,
        source: this.sourceId,
        references: [],
        error: `Pixabay error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PixabaySearchResponse {
  hits?: Array<{
    id: number;
    pageURL?: string;
    tags?: string;
    previewURL?: string;
    webformatURL?: string;
    largeImageURL?: string;
    user?: string;
  }>;
}

/**
 * Map hex to Pixabay named colors:
 * grayscale, transparent, red, orange, yellow, green, turquoise, blue,
 * lilac, pink, white, gray, black, brown
 */
function mapHexToPixabayColor(hex: string): string | null {
  const h = hex.replace("#", "").toLowerCase();
  if (!h || h.length < 6) return null;

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (max - min < 30) {
    if (max < 50) return "black";
    if (max > 200) return "white";
    return "gray";
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
  if (hue < 195) return "turquoise";
  if (hue < 255) return "blue";
  if (hue < 310) return "lilac";
  return "pink";
}
