// ==========================================================================
// C.OS8 — Brand Selector
// Dropdown to switch between retainer brands in the Brand OS portal.
// Reads/writes from BrandOSProvider context (persisted in localStorage).
// ==========================================================================

"use client";

import { useBrandOS } from "./brand-os-provider";

// Re-export convenience hook so pages can just import from brand-selector
export { useBrandId } from "./brand-os-provider";

interface BrandSelectorProps {
  className?: string;
  /** Compact mode for header (no label, smaller). */
  compact?: boolean;
}

export function BrandSelector({ className, compact }: BrandSelectorProps) {
  const { brandId, setBrandId, brands, isLoading } = useBrandOS();

  if (isLoading) {
    return (
      <div className={`h-8 w-40 rounded-lg bg-muted-foreground/10 animate-pulse ${className ?? ""}`} />
    );
  }

  if (brands.length === 0) {
    return (
      <div className={`text-xs text-muted-foreground ${className ?? ""}`}>
        Aucune marque retainer
      </div>
    );
  }

  return (
    <select
      value={brandId ?? ""}
      onChange={(e) => setBrandId(e.target.value)}
      className={`${compact ? "h-8 text-xs" : "h-9 text-sm"} rounded-lg border border-border/50 bg-card/50 px-3 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${className ?? ""}`}
    >
      {brands.map((brand) => (
        <option key={brand.id} value={brand.id}>
          {brand.brandName}
          {brand.cultIndex != null ? ` (${Math.round(brand.cultIndex)})` : ""}
        </option>
      ))}
    </select>
  );
}
