// =============================================================================
// INFRA — Centralized Error Catalog
// =============================================================================
// Single source of truth for all user-facing error messages.
// All messages in French (target audience: Francophone Africa).
// Used by: all tRPC routers via AppErrors + throwNotFound/throwForbidden helpers.
// =============================================================================

import { TRPCError } from "@trpc/server";

/**
 * Centralized error messages — consistent, always French, always clear.
 */
export const AppErrors = {
  // ── Resource not found ──────────────────────────────────────────────
  STRATEGY_NOT_FOUND: "Stratégie introuvable",
  PILLAR_NOT_FOUND: "Pilier introuvable",
  DOCUMENT_NOT_FOUND: "Document introuvable",
  MISSION_NOT_FOUND: "Mission introuvable",
  SIGNAL_NOT_FOUND: "Signal introuvable",
  DECISION_NOT_FOUND: "Décision introuvable",
  MODULE_NOT_FOUND: "Module introuvable",
  WIDGET_NOT_FOUND: "Widget introuvable",
  VARIABLE_NOT_FOUND: "Variable introuvable",
  INTEGRATION_NOT_FOUND: "Intégration introuvable",
  MARKET_STUDY_NOT_FOUND: "Étude de marché introuvable",
  INTERVENTION_NOT_FOUND: "Intervention introuvable",
  USER_NOT_FOUND: "Utilisateur introuvable",
  TEMPLATE_NOT_FOUND: "Template introuvable",

  // ── Auth & permissions ──────────────────────────────────────────────
  UNAUTHORIZED: "Accès non autorisé",
  FORBIDDEN: "Vous n'avez pas les permissions nécessaires",
  SESSION_EXPIRED: "Session expirée, veuillez vous reconnecter",
  RATE_LIMITED:
    "Trop de tentatives. Veuillez réessayer dans quelques minutes.",
  INVALID_CREDENTIALS: "Email ou mot de passe incorrect",
  WEAK_PASSWORD:
    "Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre",
  EMAIL_ALREADY_REGISTERED: "Un compte existe déjà avec cet email",

  // ── Validation ──────────────────────────────────────────────────────
  INVALID_INPUT: "Données invalides",
  MISSING_REQUIRED_FIELD: "Champ requis manquant",
  INVALID_PILLAR_TYPE: "Type de pilier invalide",
  INVALID_STATUS: "Statut invalide",

  // ── Operations ──────────────────────────────────────────────────────
  MODULE_EXECUTION_FAILED: "Erreur d'exécution du module",
  EXPORT_FAILED: "Erreur lors de l'export",
  AI_GENERATION_FAILED: "Erreur lors de la génération IA",
  TRANSLATION_FAILED: "Erreur lors de la traduction",
  IMPORT_FAILED: "Erreur lors de l'import",

  // ── Business rules ──────────────────────────────────────────────────
  STRATEGY_LIMIT_REACHED: "Limite de stratégies atteinte",
  PILLAR_LOCKED: "Ce pilier est verrouillé",
  ALREADY_EXISTS: "Cette ressource existe déjà",
} as const;

// ── Helper factories ────────────────────────────────────────────────

/** Throw TRPCError NOT_FOUND with consistent message */
export function throwNotFound(message: string = AppErrors.STRATEGY_NOT_FOUND): never {
  throw new TRPCError({ code: "NOT_FOUND", message });
}

/** Throw TRPCError FORBIDDEN with consistent message */
export function throwForbidden(message: string = AppErrors.FORBIDDEN): never {
  throw new TRPCError({ code: "FORBIDDEN", message });
}

/** Throw TRPCError INTERNAL_SERVER_ERROR with consistent message */
export function throwInternal(message: string, cause?: unknown): never {
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message, cause });
}
