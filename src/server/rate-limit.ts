// ==========================================================================
// INFRA — In-Memory Rate Limiter
// ==========================================================================
// Sliding window rate limiter for auth endpoints.
// No external dependencies — uses a Map with automatic cleanup.
//
// For single-server deployment (adequate for MVP/pre-beta).
// Production with multiple instances should migrate to Redis/Upstash.
//
// Usage:
//   const limiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });
//   const { success, remaining, resetAt } = limiter.check(identifier);
// ==========================================================================

interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests per window */
  max: number;
}

interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Remaining attempts in the current window */
  remaining: number;
  /** Timestamp when the window resets (epoch ms) */
  resetAt: number;
}

interface WindowEntry {
  count: number;
  startedAt: number;
}

/**
 * Create a rate limiter instance with a sliding window.
 *
 * @example
 * const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });
 *
 * // In your auth handler:
 * const result = loginLimiter.check(userEmail);
 * if (!result.success) {
 *   throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "..." });
 * }
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, max } = config;
  const windows = new Map<string, WindowEntry>();

  // Periodic cleanup every 5 minutes to prevent memory leaks
  const cleanupInterval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of windows) {
        if (now - entry.startedAt > windowMs) {
          windows.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );

  // Allow garbage collection in Node.js
  if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
  }

  return {
    /**
     * Check if an identifier (email, IP) is within rate limits.
     */
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const entry = windows.get(identifier);

      // No entry or expired window — start fresh
      if (!entry || now - entry.startedAt > windowMs) {
        windows.set(identifier, { count: 1, startedAt: now });
        return {
          success: true,
          remaining: max - 1,
          resetAt: now + windowMs,
        };
      }

      // Within window — check count
      entry.count += 1;

      if (entry.count > max) {
        return {
          success: false,
          remaining: 0,
          resetAt: entry.startedAt + windowMs,
        };
      }

      return {
        success: true,
        remaining: max - entry.count,
        resetAt: entry.startedAt + windowMs,
      };
    },

    /**
     * Reset the limiter for an identifier (e.g., after successful login).
     */
    reset(identifier: string): void {
      windows.delete(identifier);
    },

    /**
     * Get current state without incrementing (for diagnostics).
     */
    peek(identifier: string): RateLimitResult {
      const now = Date.now();
      const entry = windows.get(identifier);

      if (!entry || now - entry.startedAt > windowMs) {
        return { success: true, remaining: max, resetAt: now + windowMs };
      }

      return {
        success: entry.count < max,
        remaining: Math.max(0, max - entry.count),
        resetAt: entry.startedAt + windowMs,
      };
    },
  };
}

// ── Pre-configured limiters ────────────────────────────────────────

/** Login: 5 attempts per 15 minutes per email */
export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

/** Registration: 3 accounts per hour per IP (or email domain) */
export const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
});
