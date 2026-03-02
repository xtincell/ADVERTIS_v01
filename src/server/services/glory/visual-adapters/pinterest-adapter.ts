// =============================================================================
// SERVICE S.GLORY.VA.4 — Pinterest Visual Adapter
// =============================================================================
// Searches Pinterest for curated pins matching brand visual direction.
// API: https://api.pinterest.com/v5/search/pins
// Requires env: PINTEREST_ACCESS_TOKEN (Business account required)
// =============================================================================

import type {
  VisualDataAdapter,
  VisualSearchParams,
  VisualSearchResult,
  VisualReference,
} from "./base-visual-adapter";
import { getEnvVar, buildVisualQuery } from "./base-visual-adapter";

const API_BASE = "https://api.pinterest.com/v5/search/pins";

export class PinterestAdapter implements VisualDataAdapter {
  name = "Pinterest";
  sourceId = "pinterest";

  isConfigured(): boolean {
    return !!getEnvVar("PINTEREST_ACCESS_TOKEN");
  }

  async search(params: VisualSearchParams): Promise<VisualSearchResult> {
    const token = getEnvVar("PINTEREST_ACCESS_TOKEN");
    if (!token) {
      return {
        success: false,
        source: this.sourceId,
        references: [],
        error: "PINTEREST_ACCESS_TOKEN not configured",
      };
    }

    try {
      const query = buildVisualQuery(params);
      const pageSize = Math.min(params.perSource ?? 6, 25);

      const url = new URL(API_BASE);
      url.searchParams.set("query", query);
      url.searchParams.set("page_size", String(pageSize));

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return {
          success: false,
          source: this.sourceId,
          references: [],
          error: `Pinterest API error: ${response.status} ${response.statusText}`,
        };
      }

      const data = (await response.json()) as PinterestSearchResponse;

      const references: VisualReference[] = (data.items ?? [])
        .filter((pin) => pin.media?.media_type === "image")
        .map((pin) => ({
          id: `pinterest-${pin.id}`,
          source: this.sourceId,
          title: pin.title ?? pin.description?.slice(0, 80) ?? "Pinterest Pin",
          imageUrl:
            pin.media?.images?.["1200x"]?.url ??
            pin.media?.images?.["600x"]?.url ??
            "",
          thumbnailUrl:
            pin.media?.images?.["236x"]?.url ??
            pin.media?.images?.["150x150"]?.url ??
            "",
          dominantColor: pin.dominant_color ?? undefined,
          colorPalette: undefined,
          attribution: pin.board_owner?.username ?? "Unknown",
          sourceUrl: `https://www.pinterest.com/pin/${pin.id}/`,
          tags: [],
          region: "global",
        }));

      return { success: true, source: this.sourceId, references };
    } catch (error) {
      return {
        success: false,
        source: this.sourceId,
        references: [],
        error: `Pinterest error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PinterestSearchResponse {
  items?: Array<{
    id: string;
    title?: string;
    description?: string;
    dominant_color?: string;
    media?: {
      media_type?: string;
      images?: Record<
        string,
        { url?: string; width?: number; height?: number }
      >;
    };
    board_owner?: { username?: string };
  }>;
  bookmark?: string;
}
