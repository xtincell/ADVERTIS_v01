// =============================================================================
// Shared Zod helpers for pillar schemas
// =============================================================================
// Reusable preprocessors that tolerate AI-generated data quirks.
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Flex helpers: tolerate AI-generated data where a string is sent instead
// of an array (e.g., coutsCaches: "hidden costs" instead of ["hidden costs"])
// ---------------------------------------------------------------------------

/** Accepts string | string[] → always returns string[] */
export const flexStringArray = z
  .preprocess(
    (val) => {
      if (typeof val === "string") return val.trim() ? [val] : [];
      if (Array.isArray(val)) return val;
      return [];
    },
    z.array(z.string()),
  )
  .default([]);

// ---------------------------------------------------------------------------
// Helper: coerce number (AI sometimes returns "45" instead of 45)
// ---------------------------------------------------------------------------
export const num = z.coerce.number().default(0);
