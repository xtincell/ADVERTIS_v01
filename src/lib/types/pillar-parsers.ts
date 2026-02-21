// =============================================================================
// LIB L.4 — Pillar Parsers
// =============================================================================
// Runtime validation utilities for all 8 ADVERTIS pillar types.
// 3-tier fallback: strict parse -> partial coerce -> full defaults.
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
// 1. parsePillarContent — For consumers (cockpit, PDF, editors)
// ---------------------------------------------------------------------------

/**
 * Parse and validate pillar content from the database.
 * Handles: null, string (legacy markdown), object (current JSON), malformed data.
 * Always returns a usable `data` with defaults applied for missing fields.
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

  // Handle null/undefined
  if (content === null || content === undefined) {
    const result = schema.safeParse({});
    return {
      success: false,
      data: (result.success ? result.data : {}) as T,
      errors: ["Content is null"],
    };
  }

  // Handle legacy string content
  let resolved = content;
  if (typeof content === "string") {
    try {
      resolved = JSON.parse(content);
    } catch {
      return {
        success: false,
        data: {} as T,
        errors: ["Content is a legacy string, not structured JSON"],
      };
    }
  }

  // Validate with schema
  const result = schema.safeParse(resolved);
  if (result.success) {
    return { success: true, data: result.data as T };
  }

  // Partial parse: try to salvage what we can with defaults
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
    // Schema couldn't coerce at all — return full defaults
    const defaultResult = schema.safeParse({});
    return {
      success: false,
      data: (defaultResult.success ? defaultResult.data : {}) as T,
      errors: result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      ),
    };
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

  // Skip validation for legacy string content
  if (typeof content === "string") {
    return { success: true };
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
 * Replaces: parseJsonObject() + applyDefaults() in one step.
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
    const defaultResult = schema.safeParse({});
    return {
      success: false,
      data: (defaultResult.success ? defaultResult.data : {}) as T,
      errors: ["JSON parse failed"],
    };
  }

  // Validate with schema
  const result = schema.safeParse(parsed);
  if (result.success) {
    return { success: true, data: result.data as T };
  }

  // Try to salvage with defaults
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
    const defaultResult = schema.safeParse({});
    return {
      success: false,
      data: (defaultResult.success ? defaultResult.data : {}) as T,
      errors: result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      ),
    };
  }
}
