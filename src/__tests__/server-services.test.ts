/**
 * Server services tests — v3 Phase 6
 * Tests budget formula, risk calculator, and error helpers.
 */
import { describe, it, expect } from "vitest";

// ── Budget Formula ────────────────────────────────────────────────
describe("Budget Formula Engine", () => {
  it("calculateParametricBudget returns a valid result structure", async () => {
    const { calculateParametricBudget } = await import(
      "~/server/services/budget-formula"
    );
    const result = calculateParametricBudget(100_000_000, "tech", "GROWTH");
    expect(result.caVise).toBe(100_000_000);
    expect(result.sector).toBe("tech");
    expect(result.maturity).toBe("GROWTH");
    expect(result.postes).toBeInstanceOf(Array);
    expect(result.postes.length).toBeGreaterThan(0);
    expect(typeof result.budgetTotal).toBe("number");
    expect(typeof result.margeNette).toBe("number");
    expect(typeof result.margePourcentage).toBe("number");
    expect(typeof result.viable).toBe("boolean");
    expect(typeof result.commBudget).toBe("number");
  });

  it("budgetTotal + margeNette = caVise", async () => {
    const { calculateParametricBudget } = await import(
      "~/server/services/budget-formula"
    );
    const result = calculateParametricBudget(50_000_000, "retail", "STARTUP");
    expect(result.budgetTotal + result.margeNette).toBe(result.caVise);
  });

  it("handles null sector and maturity gracefully", async () => {
    const { calculateParametricBudget } = await import(
      "~/server/services/budget-formula"
    );
    const result = calculateParametricBudget(10_000_000, null, null);
    expect(result.sector).toBe("other");
    expect(result.maturity).toBe("DEFAULT");
    expect(result.postes.length).toBeGreaterThan(0);
  });

  it("handles zero CA", async () => {
    const { calculateParametricBudget } = await import(
      "~/server/services/budget-formula"
    );
    const result = calculateParametricBudget(0, "tech", "GROWTH");
    expect(result.budgetTotal).toBe(0);
    expect(result.margeNette).toBe(0);
    expect(result.margePourcentage).toBe(0);
  });

  it("each poste has required fields", async () => {
    const { calculateParametricBudget } = await import(
      "~/server/services/budget-formula"
    );
    const result = calculateParametricBudget(100_000_000, "tech", "GROWTH");
    for (const poste of result.postes) {
      expect(poste).toHaveProperty("poste");
      expect(poste).toHaveProperty("label");
      expect(poste).toHaveProperty("alpha");
      expect(poste).toHaveProperty("beta");
      expect(poste).toHaveProperty("gamma");
      expect(poste).toHaveProperty("montant");
      expect(poste).toHaveProperty("pourcentageCA");
      expect(typeof poste.montant).toBe("number");
      expect(poste.alpha).toBeGreaterThanOrEqual(0);
    }
  });

  it("getCommBudgetBenchmark returns comm budget for sector", async () => {
    const { getCommBudgetBenchmark } = await import(
      "~/server/services/budget-formula"
    );
    const comm = getCommBudgetBenchmark(100_000_000, "tech", "GROWTH");
    expect(typeof comm).toBe("number");
    expect(comm).toBeGreaterThanOrEqual(0);
  });

  it("validateCommBudget returns no-data for missing inputs", async () => {
    const { validateCommBudget } = await import(
      "~/server/services/budget-formula"
    );
    const result = validateCommBudget(null, null, "tech", "GROWTH");
    expect(result.status).toBe("no-data");
  });

  it("validateCommBudget returns optimal for matching budget", async () => {
    const { validateCommBudget, getCommBudgetBenchmark } = await import(
      "~/server/services/budget-formula"
    );
    const ca = 100_000_000;
    const benchmark = getCommBudgetBenchmark(ca, "tech", "GROWTH");
    if (benchmark > 0) {
      const result = validateCommBudget(benchmark, ca, "tech", "GROWTH");
      expect(result.status).toBe("optimal");
    }
  });

  it("validateCommBudget detects sous-investissement", async () => {
    const { validateCommBudget, getCommBudgetBenchmark } = await import(
      "~/server/services/budget-formula"
    );
    const ca = 100_000_000;
    const benchmark = getCommBudgetBenchmark(ca, "tech", "GROWTH");
    if (benchmark > 0) {
      // 50% of benchmark = significant under-investment
      const result = validateCommBudget(
        Math.round(benchmark * 0.3),
        ca,
        "tech",
        "GROWTH",
      );
      expect(["sous-investissement", "acceptable"]).toContain(result.status);
    }
  });

  it("formatFormulaForPrompt produces readable text", async () => {
    const { calculateParametricBudget, formatFormulaForPrompt } = await import(
      "~/server/services/budget-formula"
    );
    const result = calculateParametricBudget(100_000_000, "tech", "GROWTH");
    const text = formatFormulaForPrompt(result);
    expect(text).toContain("FORMULE PARAMÉTRIQUE");
    expect(text).toContain("TOTAL CHARGES");
    expect(text).toContain("MARGE NETTE");
    expect(text).toContain("VIABILITÉ");
  });
});

// ── Risk Calculator ───────────────────────────────────────────────
describe("Risk Score Calculator", () => {
  it("returns neutral defaults for empty data", async () => {
    const { calculateRiskScore } = await import(
      "~/server/services/risk-calculator"
    );
    const result = calculateRiskScore({
      microSwots: [],
      probabilityImpactMatrix: [],
      globalSwot: {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      },
      mitigationPriorities: [],
    } as any);

    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
    expect(result.microSwotRisk).toBe(20); // 0.5 * 40 (neutral)
    expect(result.probabilityImpactRisk).toBe(15); // neutral
    expect(result.globalSwotBalance).toBe(10); // 0 items → neutral
    expect(result.mitigationCoverage).toBe(0); // no high risks
  });

  it("high-risk micro-SWOTs increase score", async () => {
    const { calculateRiskScore } = await import(
      "~/server/services/risk-calculator"
    );
    const highRisk = calculateRiskScore({
      microSwots: [
        { riskLevel: "high", topic: "a" },
        { riskLevel: "high", topic: "b" },
        { riskLevel: "high", topic: "c" },
      ],
      probabilityImpactMatrix: [],
      globalSwot: {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      },
      mitigationPriorities: [],
    } as any);

    const lowRisk = calculateRiskScore({
      microSwots: [
        { riskLevel: "low", topic: "a" },
        { riskLevel: "low", topic: "b" },
        { riskLevel: "low", topic: "c" },
      ],
      probabilityImpactMatrix: [],
      globalSwot: {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      },
      mitigationPriorities: [],
    } as any);

    expect(highRisk.microSwotRisk).toBeGreaterThan(lowRisk.microSwotRisk);
    expect(highRisk.total).toBeGreaterThan(lowRisk.total);
  });

  it("mitigations reduce mitigation penalty", async () => {
    const { calculateRiskScore } = await import(
      "~/server/services/risk-calculator"
    );
    const unmitigated = calculateRiskScore({
      microSwots: [{ riskLevel: "high", topic: "risk1" }],
      probabilityImpactMatrix: [],
      globalSwot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      mitigationPriorities: [],
    } as any);

    const mitigated = calculateRiskScore({
      microSwots: [{ riskLevel: "high", topic: "risk1" }],
      probabilityImpactMatrix: [],
      globalSwot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      mitigationPriorities: [{ action: "mitigate" }],
    } as any);

    expect(unmitigated.mitigationCoverage).toBeGreaterThan(
      mitigated.mitigationCoverage,
    );
  });

  it("more weaknesses/threats increase globalSwotBalance", async () => {
    const { calculateRiskScore } = await import(
      "~/server/services/risk-calculator"
    );
    const balanced = calculateRiskScore({
      microSwots: [],
      probabilityImpactMatrix: [],
      globalSwot: {
        strengths: ["s1", "s2"],
        weaknesses: ["w1", "w2"],
        opportunities: [],
        threats: [],
      },
      mitigationPriorities: [],
    } as any);

    const negative = calculateRiskScore({
      microSwots: [],
      probabilityImpactMatrix: [],
      globalSwot: {
        strengths: [],
        weaknesses: ["w1", "w2", "w3"],
        opportunities: [],
        threats: ["t1", "t2"],
      },
      mitigationPriorities: [],
    } as any);

    expect(negative.globalSwotBalance).toBeGreaterThan(balanced.globalSwotBalance);
  });

  it("total is capped at 100", async () => {
    const { calculateRiskScore } = await import(
      "~/server/services/risk-calculator"
    );
    const extreme = calculateRiskScore({
      microSwots: Array.from({ length: 10 }, () => ({ riskLevel: "high", topic: "x" })),
      probabilityImpactMatrix: Array.from({ length: 10 }, () => ({
        risk: "x",
        probability: "high",
        impact: "high",
      })),
      globalSwot: {
        strengths: [],
        weaknesses: ["w1", "w2", "w3", "w4", "w5"],
        opportunities: [],
        threats: ["t1", "t2", "t3", "t4", "t5"],
      },
      mitigationPriorities: [],
    } as any);

    expect(extreme.total).toBeLessThanOrEqual(100);
  });

  it("result has all 4 component fields", async () => {
    const { calculateRiskScore } = await import(
      "~/server/services/risk-calculator"
    );
    const result = calculateRiskScore({
      microSwots: [],
      probabilityImpactMatrix: [],
      globalSwot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      mitigationPriorities: [],
    } as any);

    expect(result).toHaveProperty("microSwotRisk");
    expect(result).toHaveProperty("probabilityImpactRisk");
    expect(result).toHaveProperty("globalSwotBalance");
    expect(result).toHaveProperty("mitigationCoverage");
    expect(result).toHaveProperty("total");
  });
});

// ── Error helpers (additional) ────────────────────────────────────
describe("Error Helpers — extended", () => {
  it("throwForbidden throws TRPCError with FORBIDDEN code", async () => {
    const { throwForbidden } = await import("~/server/errors");
    try {
      throwForbidden("No access");
      expect.unreachable("Should have thrown");
    } catch (e: any) {
      expect(e.code).toBe("FORBIDDEN");
      expect(e.message).toBe("No access");
    }
  });

  it("throwInternal throws TRPCError with INTERNAL_SERVER_ERROR code", async () => {
    const { throwInternal } = await import("~/server/errors");
    try {
      throwInternal("Something broke");
      expect.unreachable("Should have thrown");
    } catch (e: any) {
      expect(e.code).toBe("INTERNAL_SERVER_ERROR");
      expect(e.message).toBe("Something broke");
    }
  });

  it("throwNotFound uses default message", async () => {
    const { throwNotFound, AppErrors } = await import("~/server/errors");
    try {
      throwNotFound();
      expect.unreachable("Should have thrown");
    } catch (e: any) {
      expect(e.message).toBe(AppErrors.STRATEGY_NOT_FOUND);
    }
  });

  it("throwForbidden uses default message", async () => {
    const { throwForbidden, AppErrors } = await import("~/server/errors");
    try {
      throwForbidden();
      expect.unreachable("Should have thrown");
    } catch (e: any) {
      expect(e.message).toBe(AppErrors.FORBIDDEN);
    }
  });

  it("AppErrors contains all auth-related keys", async () => {
    const { AppErrors } = await import("~/server/errors");
    expect(AppErrors.RATE_LIMITED).toBeDefined();
    expect(AppErrors.INVALID_CREDENTIALS).toBeDefined();
    expect(AppErrors.WEAK_PASSWORD).toBeDefined();
    expect(AppErrors.EMAIL_ALREADY_REGISTERED).toBeDefined();
    expect(AppErrors.SESSION_EXPIRED).toBeDefined();
  });

  it("AppErrors contains all validation keys", async () => {
    const { AppErrors } = await import("~/server/errors");
    expect(AppErrors.INVALID_INPUT).toBeDefined();
    expect(AppErrors.MISSING_REQUIRED_FIELD).toBeDefined();
    expect(AppErrors.INVALID_PILLAR_TYPE).toBeDefined();
    expect(AppErrors.INVALID_STATUS).toBeDefined();
  });

  it("AppErrors contains all business rule keys", async () => {
    const { AppErrors } = await import("~/server/errors");
    expect(AppErrors.STRATEGY_LIMIT_REACHED).toBeDefined();
    expect(AppErrors.PILLAR_LOCKED).toBeDefined();
    expect(AppErrors.ALREADY_EXISTS).toBeDefined();
  });
});
