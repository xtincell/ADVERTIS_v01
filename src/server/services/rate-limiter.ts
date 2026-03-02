// =============================================================================
// SERVICE S.RL — In-Memory Rate Limiter
// =============================================================================
// Simple sliding-window rate limiter for AI generation endpoints.
// Prevents runaway API costs and protects against abuse.
//
// Usage:
//   import { aiRateLimiter } from "~/server/services/rate-limiter";
//   const { allowed, remaining, retryAfterMs } = aiRateLimiter.check(userId);
//
// Limits:
//   - 10 AI generation requests per user per 60-second window
//   - 50 AI generation requests per user per hour
// =============================================================================

interface RateLimitEntry {
  timestamps: number[];
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodic cleanup of expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  check(key: string): {
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key) ?? { timestamps: [] };

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter(
      (ts) => now - ts < this.windowMs,
    );

    if (entry.timestamps.length >= this.maxRequests) {
      const oldestInWindow = entry.timestamps[0]!;
      const retryAfterMs = this.windowMs - (now - oldestInWindow);
      return { allowed: false, remaining: 0, retryAfterMs };
    }

    entry.timestamps.push(now);
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.timestamps.length,
      retryAfterMs: 0,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      entry.timestamps = entry.timestamps.filter(
        (ts) => now - ts < this.windowMs,
      );
      if (entry.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

// 10 requests per minute per user
export const aiRateLimiterPerMinute = new RateLimiter(60 * 1000, 10);

// 50 requests per hour per user
export const aiRateLimiterPerHour = new RateLimiter(60 * 60 * 1000, 50);

/**
 * Check both rate limit windows for an AI generation request.
 * Returns { allowed, error } where error is a user-friendly French message.
 */
export function checkAiRateLimit(userId: string): {
  allowed: boolean;
  error?: string;
  retryAfterMs?: number;
} {
  const minuteCheck = aiRateLimiterPerMinute.check(userId);
  if (!minuteCheck.allowed) {
    const seconds = Math.ceil(minuteCheck.retryAfterMs / 1000);
    return {
      allowed: false,
      error: `Trop de requêtes. Veuillez patienter ${seconds} seconde${seconds > 1 ? "s" : ""}.`,
      retryAfterMs: minuteCheck.retryAfterMs,
    };
  }

  const hourCheck = aiRateLimiterPerHour.check(userId);
  if (!hourCheck.allowed) {
    const minutes = Math.ceil(hourCheck.retryAfterMs / 60000);
    return {
      allowed: false,
      error: `Limite horaire atteinte (${minutes} min restantes). Contactez le support pour augmenter votre quota.`,
      retryAfterMs: hourCheck.retryAfterMs,
    };
  }

  return { allowed: true };
}
