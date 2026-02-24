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
