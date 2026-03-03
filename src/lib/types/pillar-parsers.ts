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

import {
  PILLAR_SCHEMAS,
  ValeurPillarSchema,
  ValeurPillarSchemaV2,
  type ValeurPillarData,
  type ValeurPillarDataV2,
} from "./pillar-schemas";

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
// V1 → V2 migration (Pillar V atomisation)
// ---------------------------------------------------------------------------

/**
 * Detect whether raw data uses the old V1 format (nested valeurMarque/coutMarque/etc.)
 * vs the new V2 format (flat atomic variables).
 */
function isValeurV1Format(obj: Record<string, unknown>): boolean {
  return (
    "valeurMarque" in obj ||
    "coutMarque" in obj ||
    "coutClient" in obj ||
    "unitEconomics" in obj
  );
}

/**
 * Lenient V1→V2 migration that works from raw untyped objects.
 * Handles malformed fields (e.g. frictions as string instead of array)
 * without requiring the V1 schema to validate first.
 */
function migrateRawV1(obj: Record<string, unknown>): ValeurPillarDataV2 {
  const toItem = (s: string, categorie = "") => ({
    item: s,
    montant: "",
    categorie,
  });
  const asStrArr = (val: unknown): string[] => {
    if (Array.isArray(val)) return val.filter((v) => typeof v === "string");
    return [];
  };
  const asObj = (val: unknown): Record<string, unknown> =>
    val && typeof val === "object" && !Array.isArray(val)
      ? (val as Record<string, unknown>)
      : {};

  const vm = asObj(obj.valeurMarque);
  const vc = asObj(obj.valeurClient);
  const cm = asObj(obj.coutMarque);
  const cc = asObj(obj.coutClient);
  const ue = asObj(obj.unitEconomics);
  const pl = Array.isArray(obj.productLadder) ? obj.productLadder : [];

  // Handle frictions: could be array of {friction,solution}, array of strings, or string
  let frictionItems: { item: string; montant: string; categorie: string }[] = [];
  const rawFrictions = cc.frictions;
  if (Array.isArray(rawFrictions)) {
    frictionItems = rawFrictions.map((f: unknown) => {
      if (typeof f === "string") return toItem(f, "friction");
      if (f && typeof f === "object") {
        const fo = f as Record<string, unknown>;
        const friction = String(fo.friction ?? "");
        const solution = String(fo.solution ?? "");
        return toItem(
          solution ? `${friction} \u2192 ${solution}` : friction,
          "friction",
        );
      }
      return toItem("", "friction");
    }).filter((i) => i.item.trim().length > 0);
  } else if (typeof rawFrictions === "string" && rawFrictions.trim()) {
    frictionItems = [toItem(rawFrictions, "friction")];
  }

  return {
    produitsCatalogue: [],
    productLadder: pl.map((t: unknown) => {
      const to = asObj(t);
      return {
        tier: String(to.tier ?? ""),
        prix: String(to.prix ?? ""),
        description: String(to.description ?? ""),
        cible: String(to.cible ?? ""),
        produitIds: [],
      };
    }),
    valeurMarqueTangible: asStrArr(vm.tangible).map((s) => toItem(s)),
    valeurMarqueIntangible: asStrArr(vm.intangible).map((s) => toItem(s)),
    valeurClientTangible: asStrArr(vc.fonctionnels).map((s) => toItem(s, "fonctionnel")),
    valeurClientIntangible: [
      ...asStrArr(vc.emotionnels).map((s) => toItem(s, "emotionnel")),
      ...asStrArr(vc.sociaux).map((s) => toItem(s, "social")),
    ],
    coutMarqueTangible: [
      ...(typeof cm.capex === "string" && cm.capex.trim() ? [toItem(cm.capex, "capex")] : []),
      ...(typeof cm.opex === "string" && cm.opex.trim() ? [toItem(cm.opex, "opex")] : []),
    ],
    coutMarqueIntangible: asStrArr(cm.coutsCaches).map((s) => toItem(s, "cout_cache")),
    coutClientTangible: frictionItems,
    coutClientIntangible: [],
    cac: typeof ue.cac === "string" ? ue.cac : "",
    ltv: typeof ue.ltv === "string" ? ue.ltv : "",
    ltvCacRatio: typeof ue.ratio === "string" ? ue.ratio : "",
    pointMort: typeof ue.pointMort === "string" ? ue.pointMort : "",
    marges: typeof ue.marges === "string" ? ue.marges : "",
    notesEconomics: typeof ue.notes === "string" ? ue.notes : "",
    dureeLTV: 24,
    margeNette: "",
    roiEstime: "",
    paybackPeriod: "",
  };
}

/**
 * Migrate old V1 Valeur pillar data to V2 atomic format.
 * Mapping:
 *   valeurMarque.tangible[]     → valeurMarqueTangible[{item}]
 *   valeurMarque.intangible[]   → valeurMarqueIntangible[{item}]
 *   valeurClient.fonctionnels[] → valeurClientTangible[{item, categorie:"fonctionnel"}]
 *   valeurClient.emotionnels[]  → valeurClientIntangible[{item, categorie:"emotionnel"}]
 *   valeurClient.sociaux[]      → valeurClientIntangible[{item, categorie:"social"}]  (append)
 *   coutMarque.capex            → coutMarqueTangible[{item, categorie:"capex"}]
 *   coutMarque.opex             → coutMarqueTangible[{item, categorie:"opex"}]       (append)
 *   coutMarque.coutsCaches[]    → coutMarqueIntangible[{item, categorie:"cout_cache"}]
 *   coutClient.frictions[]      → coutClientTangible[{item:"friction → solution", categorie:"friction"}]
 *   unitEconomics.*             → flat cac, ltv, ltvCacRatio, pointMort, marges, notesEconomics
 */
export function migrateValeurV1toV2(old: ValeurPillarData): ValeurPillarDataV2 {
  const toItem = (s: string, categorie = "") => ({
    item: s,
    montant: "",
    categorie,
  });

  return {
    produitsCatalogue: [],

    productLadder: (old.productLadder ?? []).map((t) => ({
      tier: t.tier,
      prix: t.prix,
      description: t.description,
      cible: t.cible,
      produitIds: [],
    })),

    valeurMarqueTangible: (old.valeurMarque?.tangible ?? []).map((s) =>
      toItem(s),
    ),
    valeurMarqueIntangible: (old.valeurMarque?.intangible ?? []).map((s) =>
      toItem(s),
    ),

    valeurClientTangible: (old.valeurClient?.fonctionnels ?? []).map((s) =>
      toItem(s, "fonctionnel"),
    ),
    valeurClientIntangible: [
      ...(old.valeurClient?.emotionnels ?? []).map((s) =>
        toItem(s, "emotionnel"),
      ),
      ...(old.valeurClient?.sociaux ?? []).map((s) => toItem(s, "social")),
    ],

    coutMarqueTangible: [
      ...(old.coutMarque?.capex
        ? [toItem(old.coutMarque.capex, "capex")]
        : []),
      ...(old.coutMarque?.opex ? [toItem(old.coutMarque.opex, "opex")] : []),
    ].filter((i) => i.item.trim().length > 0),
    coutMarqueIntangible: (old.coutMarque?.coutsCaches ?? []).map((s) =>
      toItem(s, "cout_cache"),
    ),

    coutClientTangible: (old.coutClient?.frictions ?? []).map((f) =>
      toItem(
        f.solution
          ? `${f.friction} \u2192 ${f.solution}`
          : f.friction,
        "friction",
      ),
    ),
    coutClientIntangible: [],

    cac: old.unitEconomics?.cac ?? "",
    ltv: old.unitEconomics?.ltv ?? "",
    ltvCacRatio: old.unitEconomics?.ratio ?? "",
    pointMort: old.unitEconomics?.pointMort ?? "",
    marges: old.unitEconomics?.marges ?? "",
    notesEconomics: old.unitEconomics?.notes ?? "",
    dureeLTV: 24,

    margeNette: "",
    roiEstime: "",
    paybackPeriod: "",
  };
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

  // Auto-migrate V1 → V2 for Pillar V
  if (
    pillarType === "V" &&
    resolved &&
    typeof resolved === "object" &&
    !Array.isArray(resolved)
  ) {
    const obj = resolved as Record<string, unknown>;
    if (isValeurV1Format(obj)) {
      // Try strict V1 parse first, then fallback to lenient raw migration
      const oldResult = ValeurPillarSchema.safeParse(resolved);
      const v1Data = oldResult.success
        ? oldResult.data
        : migrateRawV1(obj); // Lenient extraction from raw object
      const migrated = oldResult.success
        ? migrateValeurV1toV2(v1Data as ValeurPillarData)
        : (v1Data as ValeurPillarDataV2);
      // Re-validate through V2 schema
      const v2Result = ValeurPillarSchemaV2.safeParse(migrated);
      if (v2Result.success) {
        return { success: true, data: v2Result.data as T };
      }
      // Even if V2 validation has issues, return migrated data
      return {
        success: false,
        data: migrated as T,
        errors: ["V1→V2 migration applied but V2 validation had issues"],
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
