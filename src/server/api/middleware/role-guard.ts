// =============================================================================
// INFRA I.3 — Role Guard Middleware
// =============================================================================
// Role-based access control utilities. Normalizes legacy roles and checks
// permissions outside of tRPC procedures (for services, API routes, etc.).
// For tRPC procedure-level guards, use `roleProtectedProcedure` from trpc.ts.
//
// Exports:
//   normalizeRole    — Normalize legacy role values ("user" -> "OPERATOR", "admin" -> "ADMIN")
//   hasPermission    — Check if a role has a specific permission
//   isRoleAllowed    — Check if a role is in the allowed list
//   INTERNAL_ROLES   — Roles that can see ADVERTIS methodology internals
//   MANAGER_ROLES    — Roles that can manage missions and assignments
//
// Dependencies:
//   ~/lib/constants — USER_ROLE_PERMISSIONS, UserRole type
// =============================================================================

import {
  USER_ROLE_PERMISSIONS,
  type UserRole,
} from "~/lib/constants";

/**
 * Normalize legacy role values to the Phase 3 role system.
 * "user" → "OPERATOR", "admin" → "ADMIN".
 */
export function normalizeRole(role: string): UserRole {
  const LEGACY_MAP: Record<string, UserRole> = {
    user: "OPERATOR",
    admin: "ADMIN",
  };
  return (LEGACY_MAP[role] ?? role) as UserRole;
}

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(
  role: string,
  permission: keyof (typeof USER_ROLE_PERMISSIONS)["ADMIN"],
): boolean {
  const normalized = normalizeRole(role);
  const perms = USER_ROLE_PERMISSIONS[normalized];
  if (!perms) return false;
  return perms[permission];
}

/**
 * Check if a role is in the allowed list.
 */
export function isRoleAllowed(role: string, allowedRoles: UserRole[]): boolean {
  const normalized = normalizeRole(role);
  return allowedRoles.includes(normalized);
}

/**
 * Internal roles that can see ADVERTIS methodology internals.
 */
export const INTERNAL_ROLES: UserRole[] = ["ADMIN", "OPERATOR"];

/**
 * Roles that can manage missions and assignments.
 */
export const MANAGER_ROLES: UserRole[] = ["ADMIN", "OPERATOR"];
