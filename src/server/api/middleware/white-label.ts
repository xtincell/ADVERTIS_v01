// =============================================================================
// INFRA I.4 — White Label Middleware
// =============================================================================
// Multi-tenant branding. Transforms internal ADVERTIS methodology terminology
// to client-facing labels based on user role.
// ADMIN + OPERATOR see raw terminology; external roles see white-labeled versions.
//
// Exports:
//   shouldShowInternalLabels — Determines if a user sees internal labels
//   whiteLabel               — Transforms a single label based on role
//   whiteLabelObject         — Transforms specified fields of an object
//   whiteLabelPillars        — Transforms pillar title fields for client display
//   whiteLabelArray          — Transforms an array of string labels
//
// Dependencies:
//   ~/lib/constants                  — WHITE_LABEL_MAP, UserRole type
//   ~/server/api/middleware/role-guard — INTERNAL_ROLES, normalizeRole
// =============================================================================

import { WHITE_LABEL_MAP, type UserRole } from "~/lib/constants";
import { INTERNAL_ROLES } from "./role-guard";
import { normalizeRole } from "./role-guard";

/**
 * Determines if a user should see internal (ADVERTIS methodology) labels.
 */
export function shouldShowInternalLabels(role: string): boolean {
  const normalized = normalizeRole(role);
  return INTERNAL_ROLES.includes(normalized);
}

/**
 * Transforms a single label based on user role.
 * Internal users see raw labels; external users see white-labeled versions.
 */
export function whiteLabel(label: string, role: string): string {
  if (shouldShowInternalLabels(role)) return label;
  return WHITE_LABEL_MAP[label] ?? label;
}

/**
 * Transforms specified string fields of an object through the white-label map.
 * Useful for transforming entire response objects before sending to clients.
 */
export function whiteLabelObject<T extends Record<string, unknown>>(
  obj: T,
  role: string,
  keysToTransform: (keyof T)[],
): T {
  if (shouldShowInternalLabels(role)) return obj;

  const result = { ...obj };
  for (const key of keysToTransform) {
    const val = result[key];
    if (typeof val === "string") {
      (result as Record<string, unknown>)[key as string] =
        WHITE_LABEL_MAP[val] ?? val;
    }
  }
  return result;
}

/**
 * Transforms an array of pillar objects' title fields for client-facing display.
 */
export function whiteLabelPillars(
  pillars: Array<{ title: string; [key: string]: unknown }>,
  role: string,
): Array<{ title: string; [key: string]: unknown }> {
  if (shouldShowInternalLabels(role)) return pillars;

  return pillars.map((p) => ({
    ...p,
    title: WHITE_LABEL_MAP[p.title] ?? p.title,
  }));
}

/**
 * Transforms an array of string labels through the white-label map.
 */
export function whiteLabelArray(labels: string[], role: string): string[] {
  if (shouldShowInternalLabels(role)) return labels;
  return labels.map((l) => WHITE_LABEL_MAP[l] ?? l);
}
