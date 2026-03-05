// =============================================================================
// LIB — Role utilities
// =============================================================================
// Pure functions for role normalization and checks.
// No framework dependencies — safe to import anywhere (server, client, tests).
// =============================================================================

/** All valid role values in the system */
export const ROLES = [
  "ADMIN",
  "OPERATOR",
  "FREELANCE",
  "CLIENT_RETAINER",
  "CLIENT_STATIC",
] as const;

export type Role = (typeof ROLES)[number];

/**
 * Normalize legacy role values to current enum.
 * Handles backward compat: "user" → "OPERATOR", "admin" → "ADMIN".
 */
export function normalizeRole(raw: string): string {
  if (raw === "user") return "OPERATOR";
  if (raw === "admin") return "ADMIN";
  return raw;
}

/** Check if a role string is one of the allowed roles */
export function isAllowedRole(role: string, allowed: string[]): boolean {
  return allowed.includes(normalizeRole(role));
}
