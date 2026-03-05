/**
 * Security tests — v3 Phase 4
 * Tests password validation, rate limiting, and encryption helpers.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Password validation ─────────────────────────────────────────────
describe("Password Validation", () => {
  it("passwordSchema accepts a strong password", async () => {
    const { passwordSchema } = await import("~/lib/validation/password");
    const result = passwordSchema.safeParse("MyStr0ngP@ss");
    expect(result.success).toBe(true);
  });

  it("passwordSchema rejects short passwords", async () => {
    const { passwordSchema } = await import("~/lib/validation/password");
    const result = passwordSchema.safeParse("Ab1");
    expect(result.success).toBe(false);
  });

  it("passwordSchema rejects passwords without uppercase", async () => {
    const { passwordSchema } = await import("~/lib/validation/password");
    const result = passwordSchema.safeParse("nouppercase1");
    expect(result.success).toBe(false);
  });

  it("passwordSchema rejects passwords without lowercase", async () => {
    const { passwordSchema } = await import("~/lib/validation/password");
    const result = passwordSchema.safeParse("NOLOWERCASE1");
    expect(result.success).toBe(false);
  });

  it("passwordSchema rejects passwords without digits", async () => {
    const { passwordSchema } = await import("~/lib/validation/password");
    const result = passwordSchema.safeParse("NoDigitsHere");
    expect(result.success).toBe(false);
  });

  it("getPasswordStrength returns 0 for empty, 100 for strong", async () => {
    const { getPasswordStrength } = await import("~/lib/validation/password");
    expect(getPasswordStrength("")).toBe(0);
    expect(getPasswordStrength("Aa1bcdef")).toBe(100); // meets all 4 rules
  });

  it("getPasswordStrength returns partial scores", async () => {
    const { getPasswordStrength } = await import("~/lib/validation/password");
    // Only length (8+) and lowercase
    expect(getPasswordStrength("abcdefgh")).toBe(50); // 2/4 rules met
  });

  it("PASSWORD_RULES has 4 rules", async () => {
    const { PASSWORD_RULES } = await import("~/lib/validation/password");
    expect(PASSWORD_RULES).toHaveLength(4);
  });
});

// ── Rate limiter ────────────────────────────────────────────────────
describe("Rate Limiter", () => {
  it("allows requests within limit", async () => {
    const { createRateLimiter } = await import("~/server/rate-limit");
    const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });

    expect(limiter.check("user@test.com").success).toBe(true);
    expect(limiter.check("user@test.com").success).toBe(true);
    expect(limiter.check("user@test.com").success).toBe(true);
  });

  it("blocks after exceeding limit", async () => {
    const { createRateLimiter } = await import("~/server/rate-limit");
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });

    limiter.check("user@test.com");
    limiter.check("user@test.com");
    const third = limiter.check("user@test.com");

    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("tracks different identifiers independently", async () => {
    const { createRateLimiter } = await import("~/server/rate-limit");
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });

    expect(limiter.check("user1@test.com").success).toBe(true);
    expect(limiter.check("user2@test.com").success).toBe(true);
    expect(limiter.check("user1@test.com").success).toBe(false);
  });

  it("reset clears the limiter for an identifier", async () => {
    const { createRateLimiter } = await import("~/server/rate-limit");
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });

    limiter.check("user@test.com");
    expect(limiter.check("user@test.com").success).toBe(false);

    limiter.reset("user@test.com");
    expect(limiter.check("user@test.com").success).toBe(true);
  });

  it("peek does not increment counter", async () => {
    const { createRateLimiter } = await import("~/server/rate-limit");
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });

    limiter.check("user@test.com");

    const peek1 = limiter.peek("user@test.com");
    const peek2 = limiter.peek("user@test.com");
    expect(peek1.remaining).toBe(peek2.remaining);
    expect(peek1.remaining).toBe(1);
  });

  it("returns correct remaining count", async () => {
    const { createRateLimiter } = await import("~/server/rate-limit");
    const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

    expect(limiter.check("user@test.com").remaining).toBe(4);
    expect(limiter.check("user@test.com").remaining).toBe(3);
    expect(limiter.check("user@test.com").remaining).toBe(2);
  });
});

// ── Encryption helpers ──────────────────────────────────────────────
describe("Encryption Helpers", () => {
  beforeEach(() => {
    // Set a test AUTH_SECRET for encryption tests
    vi.stubEnv("AUTH_SECRET", "test-secret-that-is-at-least-32-characters-long!!");
  });

  it("encrypt returns a base64 string", async () => {
    const { encrypt } = await import("~/lib/crypto");
    const result = encrypt("hello world");
    expect(typeof result).toBe("string");
    // Should be valid base64
    expect(() => Buffer.from(result, "base64")).not.toThrow();
  });

  it("decrypt recovers the original plaintext", async () => {
    const { encrypt, decrypt } = await import("~/lib/crypto");
    const original = "sk-my-secret-api-key-12345";
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it("different encryptions of same text produce different ciphertexts", async () => {
    const { encrypt } = await import("~/lib/crypto");
    const text = "same-text";
    const enc1 = encrypt(text);
    const enc2 = encrypt(text);
    // Due to random IV, they should differ
    expect(enc1).not.toBe(enc2);
  });

  it("handles empty strings", async () => {
    const { encrypt, decrypt } = await import("~/lib/crypto");
    const encrypted = encrypt("");
    expect(decrypt(encrypted)).toBe("");
  });

  it("handles unicode text", async () => {
    const { encrypt, decrypt } = await import("~/lib/crypto");
    const original = "Stratégie de marque — 品牌策略 🚀";
    const encrypted = encrypt(original);
    expect(decrypt(encrypted)).toBe(original);
  });

  it("isEncrypted detects encrypted values", async () => {
    const { encrypt, isEncrypted } = await import("~/lib/crypto");
    const encrypted = encrypt("test");
    expect(isEncrypted(encrypted)).toBe(true);
    expect(isEncrypted("not-encrypted")).toBe(false);
    expect(isEncrypted("")).toBe(false);
  });
});
