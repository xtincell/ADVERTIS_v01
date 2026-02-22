// =============================================================================
// LIB L.4 — Pillar Parsers
// =============================================================================
// Runtime validation utilities for all 8 ADVERTIS pillar types.
// 4-tier fallback: strict parse -> partial coerce -> deep-merge raw+defaults
//   -> full defaults.
// Replaces unsafe `as T` type assertions and legacy parseJsonObject().
// Exports: ParseResult<T>, parsePillarContent<T>(),
//   validatePillarContent(), parseAiGeneratedContent<T>().
// Used by: cockpit, PDF export, editors, tRPC save handlers, AI pipeline.
// =============================================================================

import { PILLAR_SCHEMAS } from "./pillar-schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParseResult<T> {
  success: boolean;
  data: T;
  errors?: string[];
}

// ---------------------------------------------------------------------------
// Deep merge utility — recursively merges defaults with raw data so nested
// object defaults (like valeurMarque.intangible: []) are preserved even when
// the raw data only has valeurMarque.tangible.
// ---------------------------------------------------------------------------

function deepMerge<T extends Record<string, unknown>>(
  defaults: T,
  raw: Record<string, unknown>,
): T {
  const result = { ...defaults } as Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    const rawVal = raw[key];
    const defVal = result[key];
    if (
      rawVal !== null &&
      rawVal !== undefined &&
      typeof rawVal === "object" &&
      !Array.isArray(rawVal) &&
      typeof defVal === "object" &&
      defVal !== null &&
      !Array.isArray(defVal)
    ) {
      // Both are plain objects — recurse
      result[key] = deepMerge(
        defVal as Record<string, unknown>,
        rawVal as Record<string, unknown>,
      );
    } else if (rawVal !== undefined && rawVal !== null) {
      // Primitive, array, or null — raw wins over default
      result[key] = rawVal;
    }
    // If rawVal is undefined/null, keep the default
  }
  return result as T;
}

/** Get schema defaults (always safe — schemas have .default({}) on all fields) */
function getSchemaDefaults(schema: (typeof PILLAR_SCHEMAS)[string]): Record<string, unknown> {
  const r = schema.safeParse({});
  return (r.success ? r.data : {}) as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// 1. parsePillarContent — For consumers (cockpit, PDF, editors)
// ---------------------------------------------------------------------------

/**
 * Parse and validate pillar content from the database.
 * Handles: null, string (legacy markdown), object (current JSON), malformed data.
 * Always returns a usable `data` with defaults applied for missing fields.
 *
 * 4-tier fallback chain:
 *   1. Strict safeParse → perfect data
 *   2. Coerce parse → auto-fix minor issues
 *   3. Deep-merge raw + schema defaults → preserve valid fields
 *   4. Full schema defaults → last resort
 */
export function parsePillarContent<T>(
  pillarType: string,
  content: unknown,
): ParseResult<T> {
  const schema = PILLAR_SCHEMAS[pillarType];
  if (!schema) {
    return {
      success: false,
      data: {} as T,
      errors: [`Unknown pillar type: ${pillarType}`],
    };
  }

  const defaults = getSchemaDefaults(schema);

  // Handle null/undefined → return full schema defaults
  if (content === null || content === undefined) {
    return {
      success: false,
      data: defaults as T,
      errors: ["Content is null"],
    };
  }

  // Handle legacy string content
  let resolved = content;
  if (typeof content === "string") {
    try {
      resolved = JSON.parse(content);
    } catch {
      // Non-JSON string (legacy markdown) → return schema defaults, not bare {}
      return {
        success: false,
        data: defaults as T,
        errors: ["Content is a legacy string, not structured JSON"],
      };
    }
  }

  // Tier 1: Strict validation — all fields match perfectly
  const result = schema.safeParse(resolved);
  if (result.success) {
    return { success: true, data: result.data as T };
  }

  // Tier 2: Coerce — schema.parse() can auto-fix some issues
  try {
    const coerced = schema.parse(resolved);
    return {
      success: false,
      data: coerced as T,
      errors: result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      ),
    };
  } catch {
    // Tier 3: Deep-merge raw data with schema defaults
    // Preserves all valid fields from DB even when some are malformed.
    // Deep merge ensures nested object defaults survive (e.g., valeurMarque.intangible).
    try {
      const rawObj = typeof resolved === "object" && resolved
        ? (resolved as Record<string, unknown>)
        : {};
      const merged = deepMerge(defaults as Record<string, unknown>, rawObj) as T;
      console.warn(
        `[parsePillarContent] Pillar ${pillarType}: schema failed, using deep-merge raw+defaults.`,
        result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      );
      return {
        success: false,
        data: merged,
        errors: result.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`,
        ),
      };
    } catch {
      // Tier 4: Full schema defaults — absolute last resort
      return {
        success: false,
        data: defaults as T,
        errors: result.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`,
        ),
      };
    }
  }
}

// ---------------------------------------------------------------------------
// 2. validatePillarContent — For save-time validation (tRPC)
// ---------------------------------------------------------------------------

/**
 * Validate pillar content strictly. Returns Zod-compatible result.
 * Used in tRPC router to log warnings on invalid saves.
 */
export function validatePillarContent(
  pillarType: string,
  content: unknown,
): { success: boolean; errors?: string[] } {
  const schema = PILLAR_SCHEMAS[pillarType];
  if (!schema) {
    return { success: false, errors: [`Unknown pillar type: ${pillarType}`] };
  }

  // Legacy string content — can't validate structure, warn but allow
  if (typeof content === "string") {
    return { success: true, errors: ["Content is a legacy string — structural validation skipped"] };
  }

  const result = schema.safeParse(content);
  if (result.success) {
    return { success: true };
  }

  return {
    success: false,
    errors: result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    ),
  };
}

// ---------------------------------------------------------------------------
// 3. parseAiGeneratedContent — For AI generation pipeline
// ---------------------------------------------------------------------------

/**
 * Parse AI-generated JSON text into validated pillar data.
 * Strips markdown code blocks, parses JSON, validates with schema.
 * Uses the same 4-tier fallback as parsePillarContent.
 */
export function parseAiGeneratedContent<T>(
  pillarType: string,
  responseText: string,
): ParseResult<T> {
  const schema = PILLAR_SCHEMAS[pillarType];
  if (!schema) {
    return {
      success: false,
      data: {} as T,
      errors: [`Unknown pillar type: ${pillarType}`],
    };
  }

  const defaults = getSchemaDefaults(schema);

  // Strip markdown code blocks if present
  let jsonString = responseText.trim();
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    jsonString = jsonMatch[1].trim();
  }

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    console.error(
      `[Validation] Failed to parse JSON for pillar ${pillarType}:`,
      responseText.substring(0, 200),
    );
    return {
      success: false,
      data: defaults as T,
      errors: ["JSON parse failed"],
    };
  }

  // Tier 1: Strict validation
  const result = schema.safeParse(parsed);
  if (result.success) {
    return { success: true, data: result.data as T };
  }

  // Tier 2: Coerce
  try {
    const coerced = schema.parse(parsed);
    const warnings = result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    );
    console.warn(
      `[Validation] Pillar ${pillarType} has schema issues (auto-fixed):`,
      warnings,
    );
    return { success: true, data: coerced as T, errors: warnings };
  } catch {
    // Tier 3: Deep-merge AI data with schema defaults
    // Preserves valid AI-generated fields even when some fail validation
    try {
      const rawObj = typeof parsed === "object" && parsed
        ? (parsed as Record<string, unknown>)
        : {};
      const merged = deepMerge(defaults as Record<string, unknown>, rawObj) as T;
      console.warn(
        `[Validation] Pillar ${pillarType}: coerce failed, using deep-merge.`,
        result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      );
      return {
        success: false,
        data: merged,
        errors: result.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`,
        ),
      };
    } catch {
      // Tier 4: Full defaults
      return {
        success: false,
        data: defaults as T,
        errors: result.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`,
        ),
      };
    }
  }
}
