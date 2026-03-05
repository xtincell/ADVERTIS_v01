/**
 * Role routing & pillar schema tests — v3 Phase 6
 * Tests getHomeByRole, ROLE_ROUTE_MAP, pillar schemas, and Zod helpers.
 */
import { describe, it, expect } from "vitest";

// ── Role routing ──────────────────────────────────────────────────
describe("Role Routing", () => {
  it("ADMIN goes to /dashboard", async () => {
    const { getHomeByRole } = await import("~/lib/role-routing");
    expect(getHomeByRole("ADMIN")).toBe("/dashboard");
  });

  it("OPERATOR goes to /dashboard", async () => {
    const { getHomeByRole } = await import("~/lib/role-routing");
    expect(getHomeByRole("OPERATOR")).toBe("/dashboard");
  });

  it("FREELANCE goes to /my-missions", async () => {
    const { getHomeByRole } = await import("~/lib/role-routing");
    expect(getHomeByRole("FREELANCE")).toBe("/my-missions");
  });

  it("CLIENT_RETAINER goes to /cockpit", async () => {
    const { getHomeByRole } = await import("~/lib/role-routing");
    expect(getHomeByRole("CLIENT_RETAINER")).toBe("/cockpit");
  });

  it("CLIENT_STATIC goes to /cockpit", async () => {
    const { getHomeByRole } = await import("~/lib/role-routing");
    expect(getHomeByRole("CLIENT_STATIC")).toBe("/cockpit");
  });

  it("unknown role goes to /login", async () => {
    const { getHomeByRole } = await import("~/lib/role-routing");
    expect(getHomeByRole("UNKNOWN")).toBe("/login");
    expect(getHomeByRole("")).toBe("/login");
  });

  it("ROLE_ROUTE_MAP maps operator routes to ADMIN and OPERATOR", async () => {
    const { ROLE_ROUTE_MAP } = await import("~/lib/role-routing");
    const dashboardRoles = ROLE_ROUTE_MAP["/dashboard"];
    expect(dashboardRoles).toContain("ADMIN");
    expect(dashboardRoles).toContain("OPERATOR");
    expect(dashboardRoles).not.toContain("FREELANCE");
  });

  it("ROLE_ROUTE_MAP maps client routes correctly", async () => {
    const { ROLE_ROUTE_MAP } = await import("~/lib/role-routing");
    const cockpitRoles = ROLE_ROUTE_MAP["/cockpit"];
    expect(cockpitRoles).toContain("ADMIN");
    expect(cockpitRoles).toContain("CLIENT_RETAINER");
    expect(cockpitRoles).toContain("CLIENT_STATIC");
    expect(cockpitRoles).not.toContain("OPERATOR");
  });

  it("ROLE_ROUTE_MAP maps freelance routes to ADMIN + FREELANCE", async () => {
    const { ROLE_ROUTE_MAP } = await import("~/lib/role-routing");
    const missionsRoles = ROLE_ROUTE_MAP["/my-missions"];
    expect(missionsRoles).toContain("ADMIN");
    expect(missionsRoles).toContain("FREELANCE");
  });

  it("OPERATOR_ROUTES includes all operator portals", async () => {
    const { OPERATOR_ROUTES } = await import("~/lib/role-routing");
    expect(OPERATOR_ROUTES).toContain("/dashboard");
    expect(OPERATOR_ROUTES).toContain("/impulsion");
    expect(OPERATOR_ROUTES).toContain("/serenite");
    expect(OPERATOR_ROUTES).toContain("/glory");
    expect(OPERATOR_ROUTES).toContain("/tarsis");
    expect(OPERATOR_ROUTES).toContain("/guilde");
    expect(OPERATOR_ROUTES).toContain("/pilotis");
  });
});

// ── Zod flex helpers ──────────────────────────────────────────────
describe("Pillar Zod Helpers", () => {
  it("flexStringArray converts string to array", async () => {
    const { flexStringArray } = await import("~/lib/types/pillars/shared");
    const result = flexStringArray.parse("hello");
    expect(result).toEqual(["hello"]);
  });

  it("flexStringArray passes through arrays", async () => {
    const { flexStringArray } = await import("~/lib/types/pillars/shared");
    const result = flexStringArray.parse(["a", "b"]);
    expect(result).toEqual(["a", "b"]);
  });

  it("flexStringArray defaults to empty array for empty string", async () => {
    const { flexStringArray } = await import("~/lib/types/pillars/shared");
    expect(flexStringArray.parse("")).toEqual([]);
    expect(flexStringArray.parse("  ")).toEqual([]);
  });

  it("flexStringArray defaults to empty array for non-string/array", async () => {
    const { flexStringArray } = await import("~/lib/types/pillars/shared");
    expect(flexStringArray.parse(null)).toEqual([]);
    expect(flexStringArray.parse(undefined)).toEqual([]);
  });

  it("num coerces string numbers", async () => {
    const { num } = await import("~/lib/types/pillars/shared");
    expect(num.parse("42")).toBe(42);
    expect(num.parse("3.14")).toBeCloseTo(3.14);
  });

  it("num defaults to 0", async () => {
    const { num } = await import("~/lib/types/pillars/shared");
    expect(num.parse(undefined)).toBe(0);
  });
});

// ── Pillar schema validation ──────────────────────────────────────
describe("Pillar Schemas — Round-trip", () => {
  it("DistinctionPillarSchema parses empty object with defaults", async () => {
    const { DistinctionPillarSchema } = await import("~/lib/types/pillar-schemas");
    const result = DistinctionPillarSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("ValeurPillarSchema parses empty object with defaults", async () => {
    const { ValeurPillarSchema } = await import("~/lib/types/pillar-schemas");
    const result = ValeurPillarSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("EngagementPillarSchema parses empty object with defaults", async () => {
    const { EngagementPillarSchema } = await import("~/lib/types/pillar-schemas");
    const result = EngagementPillarSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("RiskAuditResultSchema parses empty object with defaults", async () => {
    const { RiskAuditResultSchema } = await import("~/lib/types/pillar-schemas");
    const result = RiskAuditResultSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("TrackAuditResultSchema parses empty object with defaults", async () => {
    const { TrackAuditResultSchema } = await import("~/lib/types/pillar-schemas");
    const result = TrackAuditResultSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("SynthesePillarSchema parses empty object with defaults", async () => {
    const { SynthesePillarSchema } = await import("~/lib/types/pillar-schemas");
    const result = SynthesePillarSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("ImplementationDataSchema parses empty object with defaults", async () => {
    const { ImplementationDataSchema } = await import("~/lib/types/pillar-schemas");
    const result = ImplementationDataSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
