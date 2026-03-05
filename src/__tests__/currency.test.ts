/**
 * Currency utilities tests — v3 Phase 6
 * Tests formatCurrency, getCurrencySymbol, parseCurrencyString.
 */
import { describe, it, expect } from "vitest";

describe("Currency Utilities", () => {
  // ── formatCurrency ──────────────────────────────────────────────
  describe("formatCurrency", () => {
    it("formats XOF (default) with FCFA suffix", async () => {
      const { formatCurrency } = await import("~/lib/currency");
      const result = formatCurrency(500000);
      expect(result).toContain("FCFA");
      expect(result).toContain("500");
    });

    it("formats XOF explicitly", async () => {
      const { formatCurrency } = await import("~/lib/currency");
      const result = formatCurrency(1000000, "XOF");
      expect(result).toContain("FCFA");
      expect(result).toContain("000");
    });

    it("formats XAF with FCFA suffix", async () => {
      const { formatCurrency } = await import("~/lib/currency");
      const result = formatCurrency(250000, "XAF");
      expect(result).toContain("FCFA");
    });

    it("formats EUR with euro symbol", async () => {
      const { formatCurrency } = await import("~/lib/currency");
      const result = formatCurrency(5000, "EUR");
      expect(result).toMatch(/€|EUR/);
    });

    it("formats USD with dollar symbol", async () => {
      const { formatCurrency } = await import("~/lib/currency");
      const result = formatCurrency(5000, "USD");
      expect(result).toMatch(/\$|USD/);
    });

    it("handles zero amount", async () => {
      const { formatCurrency } = await import("~/lib/currency");
      const result = formatCurrency(0);
      expect(result).toContain("0");
      expect(result).toContain("FCFA");
    });
  });

  // ── getCurrencySymbol ───────────────────────────────────────────
  describe("getCurrencySymbol", () => {
    it("returns FCFA for XOF", async () => {
      const { getCurrencySymbol } = await import("~/lib/currency");
      expect(getCurrencySymbol("XOF")).toBe("FCFA");
    });

    it("returns default FCFA when no argument", async () => {
      const { getCurrencySymbol } = await import("~/lib/currency");
      expect(getCurrencySymbol()).toBe("FCFA");
    });
  });

  // ── parseCurrencyString ─────────────────────────────────────────
  describe("parseCurrencyString", () => {
    it("parses simple numbers", async () => {
      const { parseCurrencyString } = await import("~/lib/currency");
      expect(parseCurrencyString("1000")).toBe(1000);
    });

    it("parses FCFA formatted strings", async () => {
      const { parseCurrencyString } = await import("~/lib/currency");
      expect(parseCurrencyString("500 000 FCFA")).toBe(500000);
    });

    it("parses EUR formatted strings", async () => {
      const { parseCurrencyString } = await import("~/lib/currency");
      expect(parseCurrencyString("5 000 EUR")).toBe(5000);
    });

    it("parses strings with euro symbol", async () => {
      const { parseCurrencyString } = await import("~/lib/currency");
      expect(parseCurrencyString("5 000 €")).toBe(5000);
    });

    it("parses strings with dollar symbol", async () => {
      const { parseCurrencyString } = await import("~/lib/currency");
      expect(parseCurrencyString("$5,000")).toBe(5000);
    });

    it("parses millions (M suffix)", async () => {
      const { parseCurrencyString } = await import("~/lib/currency");
      expect(parseCurrencyString("15M FCFA")).toBe(15000000);
    });

    it("parses billions (Mrd suffix)", async () => {
      const { parseCurrencyString } = await import("~/lib/currency");
      expect(parseCurrencyString("2.5 Mrd EUR")).toBe(2500000000);
    });

    it("parses thousands (k suffix)", async () => {
      const { parseCurrencyString } = await import("~/lib/currency");
      expect(parseCurrencyString("500k")).toBe(500000);
    });

    it("returns null for empty input", async () => {
      const { parseCurrencyString } = await import("~/lib/currency");
      expect(parseCurrencyString("")).toBeNull();
    });

    it("returns null for non-numeric input", async () => {
      const { parseCurrencyString } = await import("~/lib/currency");
      expect(parseCurrencyString("not a number")).toBeNull();
    });

    it("handles French decimal format (comma as decimal)", async () => {
      const { parseCurrencyString } = await import("~/lib/currency");
      expect(parseCurrencyString("1 500,50")).toBe(1500.50);
    });
  });

  // ── getCurrencyPromptInstruction ────────────────────────────────
  describe("getCurrencyPromptInstruction", () => {
    it("returns French instruction with currency info", async () => {
      const { getCurrencyPromptInstruction } = await import("~/lib/currency");
      const result = getCurrencyPromptInstruction("XOF");
      expect(result).toContain("FCFA");
      expect(result).toContain("XOF");
      expect(result).toContain("DEVISE OBLIGATOIRE");
    });

    it("returns instruction for EUR", async () => {
      const { getCurrencyPromptInstruction } = await import("~/lib/currency");
      const result = getCurrencyPromptInstruction("EUR");
      expect(result).toContain("EUR");
    });
  });
});
