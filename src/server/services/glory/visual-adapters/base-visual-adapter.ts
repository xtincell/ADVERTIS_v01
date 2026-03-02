// =============================================================================
// SERVICE S.GLORY.VA.0 — Base Visual Adapter
// =============================================================================
// Abstract adapter interface, shared types, and aggregation logic for all
// visual inspiration platform adapters (Unsplash, Pexels, Pixabay, Pinterest,
// Are.na, Brave Image Search).
//
// Public API:
//   VisualReference, VisualSearchParams, VisualSearchResult, VisualDataAdapter
//   aggregateVisualSearch(params, adapters)
//   loadConfiguredVisualAdapters()
//   formatVisualReferencesForPrompt(refs)
//
// Pattern follows: market-study/adapters/base-adapter.ts
// =============================================================================

import { getEnvVar } from "~/server/services/market-study/adapters/base-adapter";

export { getEnvVar };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VisualReference {
  id: string;
  source: string; // "unsplash" | "pexels" | "pixabay" | "pinterest" | "arena" | "brave"
  title: string;
  imageUrl: string; // Full-res
  thumbnailUrl: string; // Preview
  dominantColor?: string; // Hex
  colorPalette?: string[]; // Array of hex values
  attribution: string; // Photographer/artist credit
  sourceUrl: string; // Link to original
  tags?: string[];
  region?: string; // "africa" | "europe" | "americas" | "asia" | "global"
}

export interface VisualSearchParams {
  brandName: string;
  keywords: string[];
  colors?: string[]; // Hex codes for color filtering
  style?: string; // "minimal" | "bold" | "vintage" | "modern" | ...
  region?: string; // For regional queries
  regions?: string[]; // Multiple regions for multi-region search
  perSource?: number; // Results per source (default: 6)
}

export interface VisualSearchResult {
  success: boolean;
  source: string;
  references: VisualReference[];
  error?: string;
}

export interface VisualDataAdapter {
  name: string;
  sourceId: string;
  isConfigured(): boolean;
  search(params: VisualSearchParams): Promise<VisualSearchResult>;
}

// ---------------------------------------------------------------------------
// Aggregator — calls all configured adapters in parallel
// ---------------------------------------------------------------------------

export async function aggregateVisualSearch(
  params: VisualSearchParams,
  adapters: VisualDataAdapter[],
): Promise<{
  references: VisualReference[];
  sources: string[];
  errors: string[];
}> {
  const configured = adapters.filter((a) => a.isConfigured());

  if (configured.length === 0) {
    return {
      references: [],
      sources: [],
      errors: [
        "Aucun adaptateur visuel configuré. Ajoutez au moins une clé API (UNSPLASH_ACCESS_KEY, PEXELS_API_KEY, etc.).",
      ],
    };
  }

  const results = await Promise.allSettled(
    configured.map((a) => a.search(params)),
  );

  const allRefs: VisualReference[] = [];
  const sources: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i]!;
    const adapter = configured[i]!;

    if (result.status === "fulfilled") {
      if (result.value.success) {
        allRefs.push(...result.value.references);
        sources.push(adapter.name);
      } else if (result.value.error) {
        errors.push(`[${adapter.name}] ${result.value.error}`);
      }
    } else {
      errors.push(
        `[${adapter.name}] ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
      );
    }
  }

  // Deduplicate by sourceUrl
  const seen = new Set<string>();
  const deduplicated = allRefs.filter((ref) => {
    if (seen.has(ref.sourceUrl)) return false;
    seen.add(ref.sourceUrl);
    return true;
  });

  return { references: deduplicated, sources, errors };
}

// ---------------------------------------------------------------------------
// Loader — instantiate all adapters
// ---------------------------------------------------------------------------

export async function loadConfiguredVisualAdapters(): Promise<
  VisualDataAdapter[]
> {
  const { UnsplashAdapter } = await import("./unsplash-adapter");
  const { PexelsAdapter } = await import("./pexels-adapter");
  const { PixabayAdapter } = await import("./pixabay-adapter");
  const { PinterestAdapter } = await import("./pinterest-adapter");
  const { ArenaAdapter } = await import("./arena-adapter");
  const { BraveImagesAdapter } = await import("./brave-images-adapter");

  return [
    new UnsplashAdapter(),
    new PexelsAdapter(),
    new PixabayAdapter(),
    new PinterestAdapter(),
    new ArenaAdapter(),
    new BraveImagesAdapter(),
  ];
}

// ---------------------------------------------------------------------------
// Prompt formatter — turn visual references into AI-readable context
// ---------------------------------------------------------------------------

export function formatVisualReferencesForPrompt(
  refs: VisualReference[],
): string {
  if (refs.length === 0) return "";

  const lines: string[] = [
    "",
    "# RÉFÉRENCES VISUELLES (collectées depuis les plateformes d'inspiration)",
    "",
  ];

  // Group by source
  const bySource = new Map<string, VisualReference[]>();
  for (const ref of refs) {
    const existing = bySource.get(ref.source) ?? [];
    existing.push(ref);
    bySource.set(ref.source, existing);
  }

  for (const [source, sourceRefs] of bySource) {
    lines.push(`## Source : ${source} (${sourceRefs.length} références)`);
    for (const ref of sourceRefs) {
      const colorInfo = ref.dominantColor
        ? ` | Couleur dominante: ${ref.dominantColor}`
        : "";
      const tagInfo =
        ref.tags && ref.tags.length > 0
          ? ` | Tags: ${ref.tags.slice(0, 5).join(", ")}`
          : "";
      const regionInfo = ref.region ? ` | Région: ${ref.region}` : "";
      lines.push(
        `- **${ref.title}** (${ref.attribution})${colorInfo}${tagInfo}${regionInfo}`,
      );
      lines.push(`  URL: ${ref.sourceUrl}`);
    }
    lines.push("");
  }

  // Color palette summary
  const allColors = refs
    .filter((r) => r.dominantColor)
    .map((r) => r.dominantColor!);
  if (allColors.length > 0) {
    const uniqueColors = [...new Set(allColors)];
    lines.push(
      `## Palette chromatique détectée : ${uniqueColors.slice(0, 12).join(", ")}`,
    );
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Build a search query string from brand + keywords */
export function buildVisualQuery(params: VisualSearchParams): string {
  const parts = [params.brandName, ...params.keywords.slice(0, 3)];
  if (params.style) parts.push(params.style);
  return parts.join(" ");
}

/** Rate-limit pause (1.1s) */
export function rateLimitPause(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1100));
}
