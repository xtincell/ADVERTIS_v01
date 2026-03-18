// =============================================================================
// Currency utilities for ADVERTIS
// =============================================================================
// Formatting, parsing, and AI prompt helpers for multi-currency support.
// Default currency: XOF (Franc CFA BCEAO) for West African market.
// =============================================================================

import { CURRENCY_CONFIG, type SupportedCurrency } from "./constants";

/**
 * Format a numeric amount with the correct currency symbol and locale.
 * @example formatCurrency(500000, "XOF") → "500 000 FCFA"
 * @example formatCurrency(5000, "EUR")   → "5 000 €"
 * @example formatCurrency(5000, "USD")   → "$5,000"
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = "XOF",
): string {
  const config = CURRENCY_CONFIG[currency];
  if (!config) return `${amount}`;

  // For CFA francs, Intl may not support XOF/XAF well — use manual formatting
  if (currency === "XOF" || currency === "XAF") {
    const formatted = new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted} FCFA`;
  }

  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies
    const formatted = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return config.position === "before"
      ? `${config.symbol}${formatted}`
      : `${formatted} ${config.symbol}`;
  }
}

/**
 * Returns the display symbol for a given currency code.
 * @example getCurrencySymbol("XOF") → "FCFA"
 * @example getCurrencySymbol("EUR") → "€"
 */
export function getCurrencySymbol(currency: SupportedCurrency = "XOF"): string {
  return CURRENCY_CONFIG[currency]?.symbol ?? currency;
}

/**
 * Returns a currency instruction block for AI prompts.
 * Tells the AI which currency to use for all monetary values.
 */
export function getCurrencyPromptInstruction(
  currency: SupportedCurrency = "XOF",
): string {
  const config = CURRENCY_CONFIG[currency];
  const symbol = config?.symbol ?? currency;
  const exampleSmall =
    config?.position === "after" ? `50 000 ${symbol}` : `${symbol}50,000`;
  const exampleLarge =
    config?.position === "after"
      ? `5 000 000 ${symbol}`
      : `${symbol}5,000,000`;

  return `DEVISE OBLIGATOIRE : Utilise la devise "${currency}" (symbole : ${symbol}) pour TOUTES les valeurs monétaires sans exception.
Format attendu : "${exampleSmall}", "${exampleLarge}".
Ne JAMAIS utiliser €, $ ou toute autre devise que ${symbol} dans les montants.`;
}

/**
 * Parse a monetary string (possibly AI-generated) to a numeric value.
 * Handles: "500 000 FCFA", "5 000 €", "$5,000", "15M FCFA", "2.5 Mrd EUR"
 * @returns The numeric value, or null if parsing fails.
 */
export function parseCurrencyString(value: string): number | null {
  if (!value || typeof value !== "string") return null;

  // Remove currency symbols, whitespace, and common labels
  let cleaned = value
    .replace(/FCFA|XOF|XAF|EUR|USD|GHS|NGN|GH₵|₦/gi, "")
    .replace(/[€$]/g, "")
    .trim();

  // Handle "Mrd" (milliard = billion)
  if (/mrd/i.test(cleaned)) {
    const num = parseFloat(cleaned.replace(/mrd/i, "").replace(/\s/g, "").replace(",", "."));
    return isNaN(num) ? null : num * 1_000_000_000;
  }

  // Handle "M" (million) — but not "mois" or "month"
  if (/(\d)\s*M(?!\w)/i.test(cleaned) && !/mois/i.test(value)) {
    const match = cleaned.match(/([\d\s,.]+)\s*M/i);
    if (match?.[1]) {
      const num = parseFloat(match[1].replace(/\s/g, "").replace(",", "."));
      return isNaN(num) ? null : num * 1_000_000;
    }
  }

  // Handle "k" (thousand)
  if (/(\d)\s*k/i.test(cleaned)) {
    const match = cleaned.match(/([\d\s,.]+)\s*k/i);
    if (match?.[1]) {
      const num = parseFloat(match[1].replace(/\s/g, "").replace(",", "."));
      return isNaN(num) ? null : num * 1_000;
    }
  }

  // Standard number: remove spaces (French thousands separator), swap comma for dot
  cleaned = cleaned.replace(/\s/g, "");
  // If there's a comma followed by exactly 2 digits at end → decimal separator
  if (/,\d{2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    // Otherwise comma is thousands separator
    cleaned = cleaned.replace(/,/g, "");
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// =============================================================================
// Dashboard formatters — centralized compact display utilities
// =============================================================================

/**
 * Format compact pour dashboards (1.2M, 500K, 1 234).
 * Utilise le symbole de devise si fourni.
 * @example formatCompact(5_500_000)        → "5.5M"
 * @example formatCompact(500_000, "XOF")   → "500K FCFA"
 * @example formatCompact(1_200_000_000)    → "1.2Mrd"
 */
export function formatCompact(
  value: number,
  currency?: SupportedCurrency,
): string {
  const symbol = currency ? getCurrencySymbol(currency) : "";
  const suffix = symbol ? ` ${symbol}` : "";

  if (Math.abs(value) >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(1)}Mrd${suffix}`;
  if (Math.abs(value) >= 1_000_000)
    return `${(value / 1_000_000).toFixed(1)}M${suffix}`;
  if (Math.abs(value) >= 1_000)
    return `${(value / 1_000).toFixed(0)}K${suffix}`;
  return `${value}${suffix}`;
}

/**
 * Format pourcentage standardisé.
 * @example formatPercent(85.678)     → "86%"
 * @example formatPercent(85.678, 1)  → "85.7%"
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format score (0-100) avec fallback em-dash pour null/undefined.
 * @example formatScore(85)        → "85"
 * @example formatScore(null)      → "—"
 * @example formatScore(undefined) → "—"
 */
export function formatScore(value: number | null | undefined): string {
  return value != null ? String(Math.round(value)) : "\u2014";
}

/**
 * Format entier avec séparateur de milliers (locale fr-FR).
 * @example formatCount(1234567) → "1 234 567"
 * @example formatCount(500)     → "500"
 */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}
