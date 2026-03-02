// =============================================================================
// SERVICE S.GLORY.VA.5 — Are.na Visual Adapter
// =============================================================================
// Searches Are.na for curated visual blocks from the design community.
// API: https://api.are.na/v2/search
// Env: ARENA_ACCESS_TOKEN (optional — public API works without auth, rate-limited)
// Are.na is particularly valuable for high-quality, design-focused references
// curated by creative professionals worldwide.
// =============================================================================

import type {
  VisualDataAdapter,
  VisualSearchParams,
  VisualSearchResult,
  VisualReference,
} from "./base-visual-adapter";
import { getEnvVar, buildVisualQuery } from "./base-visual-adapter";

const API_BASE = "https://api.are.na/v2/search/blocks";

export class ArenaAdapter implements VisualDataAdapter {
  name = "Are.na";
  sourceId = "arena";

  // Are.na public API works without auth (lower rate limits)
  isConfigured(): boolean {
    return true;
  }

  async search(params: VisualSearchParams): Promise<VisualSearchResult> {
    try {
      const query = buildVisualQuery(params);
      const perPage = Math.min(params.perSource ?? 6, 40);

      const url = new URL(API_BASE);
      url.searchParams.set("q", query);
      url.searchParams.set("per", String(perPage));

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Optional auth for higher rate limits
      const token = getEnvVar("ARENA_ACCESS_TOKEN");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        return {
          success: false,
          source: this.sourceId,
          references: [],
          error: `Are.na API error: ${response.status} ${response.statusText}`,
        };
      }

      const data = (await response.json()) as ArenaSearchResponse;

      const references: VisualReference[] = (data.blocks ?? [])
        .filter(
          (block) =>
            block.class === "Image" &&
            block.image?.display?.url,
        )
        .map((block) => ({
          id: `arena-${block.id}`,
          source: this.sourceId,
          title: block.title ?? block.generated_title ?? "Are.na Block",
          imageUrl: block.image?.display?.url ?? block.image?.original?.url ?? "",
          thumbnailUrl: block.image?.thumb?.url ?? block.image?.display?.url ?? "",
          dominantColor: undefined,
          colorPalette: undefined,
          attribution: block.user?.full_name ?? block.user?.slug ?? "Unknown",
          sourceUrl: `https://www.are.na/block/${block.id}`,
          tags: block.source?.title ? [block.source.title] : [],
          region: "global",
        }));

      return { success: true, source: this.sourceId, references };
    } catch (error) {
      return {
        success: false,
        source: this.sourceId,
        references: [],
        error: `Are.na error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ArenaSearchResponse {
  blocks?: Array<{
    id: number;
    title?: string;
    generated_title?: string;
    class?: string; // "Image" | "Text" | "Link" | "Media" | "Attachment"
    image?: {
      display?: { url?: string };
      thumb?: { url?: string };
      original?: { url?: string };
    };
    user?: { full_name?: string; slug?: string };
    source?: { title?: string; url?: string };
  }>;
}
