// ==========================================================================
// C.OS9 — BrandOSProvider
// React context for the selected brand across all Brand OS pages.
// Persists selection in localStorage so it survives navigation.
// ==========================================================================

"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "~/trpc/react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BrandInfo {
  id: string;
  brandName: string;
  sector: string | null;
  currency: string;
  coherenceScore: number | null;
  annualBudget: number | null;
  cultIndex: number | null;
  superfanCount: number;
  totalCommunity: number;
  communityHealth: number | null;
}

interface BrandOSContextValue {
  brandId: string | null;
  setBrandId: (id: string) => void;
  brands: BrandInfo[];
  selectedBrand: BrandInfo | null;
  isLoading: boolean;
}

const STORAGE_KEY = "advertis-brand-os-selected";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const BrandOSContext = createContext<BrandOSContextValue>({
  brandId: null,
  setBrandId: () => {},
  brands: [],
  selectedBrand: null,
  isLoading: true,
});

export function useBrandOS() {
  return useContext(BrandOSContext);
}

/** Shortcut — returns just the current brandId (most pages only need this). */
export function useBrandId(): string | null {
  return useContext(BrandOSContext).brandId;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function BrandOSProvider({ children }: { children: ReactNode }) {
  const [brandId, setBrandIdRaw] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { data: portfolio, isLoading } = api.brandOS.getPortfolio.useQuery();

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBrandIdRaw(stored);
    } catch {
      // SSR or localStorage unavailable
    }
    setInitialized(true);
  }, []);

  // Auto-select first brand when portfolio loads and nothing stored
  useEffect(() => {
    if (!initialized || isLoading || !portfolio) return;
    if (portfolio.length === 0) return;

    // If current selection is invalid (deleted brand, etc.), reset
    const valid = portfolio.some((b) => b.id === brandId);
    if (!brandId || !valid) {
      const firstId = portfolio[0]!.id;
      setBrandIdRaw(firstId);
      try { localStorage.setItem(STORAGE_KEY, firstId); } catch {}
    }
  }, [initialized, isLoading, portfolio, brandId]);

  function setBrandId(id: string) {
    setBrandIdRaw(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  }

  const brands = (portfolio ?? []) as BrandInfo[];
  const selectedBrand = brands.find((b) => b.id === brandId) ?? null;

  return (
    <BrandOSContext.Provider
      value={{
        brandId,
        setBrandId,
        brands,
        selectedBrand,
        isLoading: isLoading || !initialized,
      }}
    >
      {children}
    </BrandOSContext.Provider>
  );
}
