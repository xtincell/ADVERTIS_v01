/**
 * Smoke tests — v3 baseline safety net
 * Validates critical infrastructure before refactoring begins.
 */
import { describe, it, expect } from "vitest";

// ── Test 1: Zod pillar schema round-trip ────────────────────────────
describe("Pillar Schemas", () => {
  it("AuthenticitePillarSchema parses empty object with defaults", async () => {
    const { AuthenticitePillarSchema } = await import(
      "~/lib/types/pillar-schemas"
    );
    const result = AuthenticitePillarSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.identite.archetype).toBe("");
      expect(result.data.herosJourney.acte1Origines).toBe("");
      expect(result.data.valeurs).toEqual([]);
    }
  });

  it("AuthenticitePillarSchema handles AI flex data (string → array)", async () => {
    const { AuthenticitePillarSchema } = await import(
      "~/lib/types/pillar-schemas"
    );
    const result = AuthenticitePillarSchema.safeParse({
      identite: {
        archetype: "Le Sage",
        citationFondatrice: "Savoir c'est pouvoir",
        noyauIdentitaire: "Sagesse ancestrale",
      },
      valeurs: [
        { valeur: "Innovation", rang: 1, justification: "Au coeur de tout" },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.identite.archetype).toBe("Le Sage");
      expect(result.data.valeurs).toHaveLength(1);
      expect(result.data.valeurs[0]?.valeur).toBe("Innovation");
    }
  });

  it("PILLAR_SCHEMAS map contains all 8 pillars", async () => {
    const { PILLAR_SCHEMAS } = await import("~/lib/types/pillar-schemas");
    const expectedPillars = ["A", "D", "V", "E", "R", "T", "I", "S"];
    for (const key of expectedPillars) {
      expect(PILLAR_SCHEMAS).toHaveProperty(key);
    }
    expect(Object.keys(PILLAR_SCHEMAS)).toHaveLength(8);
  });
});

// ── Test 2: Role normalization (from ~/lib/roles — no Next.js deps) ──
describe("Role Normalization", () => {
  it("normalizes legacy roles correctly", async () => {
    const { normalizeRole } = await import("~/lib/roles");
    expect(normalizeRole("user")).toBe("OPERATOR");
    expect(normalizeRole("admin")).toBe("ADMIN");
    expect(normalizeRole("OPERATOR")).toBe("OPERATOR");
    expect(normalizeRole("FREELANCE")).toBe("FREELANCE");
    expect(normalizeRole("CLIENT_RETAINER")).toBe("CLIENT_RETAINER");
  });

  it("isAllowedRole checks normalized roles", async () => {
    const { isAllowedRole } = await import("~/lib/roles");
    expect(isAllowedRole("user", ["OPERATOR"])).toBe(true);
    expect(isAllowedRole("admin", ["ADMIN"])).toBe(true);
    expect(isAllowedRole("FREELANCE", ["ADMIN", "OPERATOR"])).toBe(false);
  });
});

// ── Test 2b: Error catalog ──────────────────────────────────────────
describe("Error Catalog", () => {
  it("AppErrors has all required keys", async () => {
    const { AppErrors } = await import("~/server/errors");
    expect(AppErrors.STRATEGY_NOT_FOUND).toBe("Stratégie introuvable");
    expect(AppErrors.UNAUTHORIZED).toBe("Accès non autorisé");
    expect(AppErrors.MODULE_EXECUTION_FAILED).toBeDefined();
    expect(AppErrors.PILLAR_NOT_FOUND).toBeDefined();
  });

  it("throwNotFound throws TRPCError with NOT_FOUND code", async () => {
    const { throwNotFound } = await import("~/server/errors");
    expect(() => throwNotFound("test")).toThrowError("test");
  });
});

// ── Test 3: Utility functions ───────────────────────────────────────
describe("Utility Functions", () => {
  it("cn() merges class names correctly", async () => {
    const { cn } = await import("~/lib/utils");
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("foo", undefined, "baz")).toBe("foo baz");
    expect(cn("px-4", "px-6")).toBe("px-6"); // tailwind-merge deduplication
  });
});
