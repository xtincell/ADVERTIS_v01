// ==========================================================================
// LIB — Password Validation
// ==========================================================================
// Shared Zod schema and helpers for password strength enforcement.
// Used by: auth router (server), register page (client).
//
// Rules:
//   - Minimum 8 characters
//   - At least 1 uppercase letter
//   - At least 1 lowercase letter
//   - At least 1 digit
// ==========================================================================

import { z } from "zod";

/**
 * Password strength rules — human-readable for UI feedback.
 */
export const PASSWORD_RULES = [
  { label: "8 caractères minimum", test: (v: string) => v.length >= 8 },
  { label: "1 majuscule", test: (v: string) => /[A-Z]/.test(v) },
  { label: "1 minuscule", test: (v: string) => /[a-z]/.test(v) },
  { label: "1 chiffre", test: (v: string) => /\d/.test(v) },
] as const;

/**
 * Zod schema for password validation with French error messages.
 * Use in both server-side auth router and client-side forms.
 */
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins 1 majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins 1 minuscule")
  .regex(/\d/, "Le mot de passe doit contenir au moins 1 chiffre");

/**
 * Compute a strength score (0–100) for UI progress indicators.
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  return Math.round((passed / PASSWORD_RULES.length) * 100);
}
