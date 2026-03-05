// =============================================================================
// FW-05 — Grammar Systems
// =============================================================================
// Couche 1 — IDENTITÉ
// Triple grammar that establishes a complete artistic dictionary:
// conceptual, iconographic, and transconcept.
// Produces: GS.conceptualGrammar, GS.iconographicGrammar,
//           GS.transconceptGrammar, GS.tripleAncrage,
//           GS.vocabularyAuthorized, GS.vocabularyForbidden
// =============================================================================

import { z } from "zod";
import { flexStringArray, num } from "../pillars/shared";

// ---------------------------------------------------------------------------
// GS.conceptualGrammar — Abstract symbols composing the brand's semantic field
// ---------------------------------------------------------------------------

const ConceptualSymbolSchema = z.object({
  /** Name of the symbol */
  name: z.string().default(""),
  /** Relevance score 0-10 */
  score: num,
  /** Semantic territory this symbol occupies */
  territory: z.string().default(""),
  /** How and where this symbol is used */
  usage: z.string().default(""),
  /** Contexts where this symbol must NOT be used */
  antiUsage: z.string().default(""),
  /** Related but distinct concepts */
  relatedConcepts: flexStringArray,
});

export const ConceptualGrammarSchema = z
  .object({
    /** All validated conceptual symbols (scored >= 7.0) */
    symbols: z.array(ConceptualSymbolSchema).default([]),
    /** Semantic distance matrix between symbols (0 = identical, 10 = distinct) */
    proximityMatrix: z.record(z.string(), z.record(z.string(), num)).default({}),
  })
  .default({});

// ---------------------------------------------------------------------------
// GS.iconographicGrammar — Visual & material symbols
// ---------------------------------------------------------------------------

const TextureSchema = z.object({
  name: z.string().default(""),
  narrative: z.string().default(""),
  usage: z.string().default(""),
  colorAssociation: z.string().default(""),
});

const PatternSchema = z.object({
  name: z.string().default(""),
  origin: z.string().default(""),
  narrative: z.string().default(""),
  usage: z.string().default(""),
});

const ColorSchema = z.object({
  hex: z.string().default(""),
  name: z.string().default(""),
  narrative: z.string().default(""),
  usage: z.string().default(""),
});

const MaterialSchema = z.object({
  name: z.string().default(""),
  narrative: z.string().default(""),
  physicalUsage: z.string().default(""),
  digitalTransposition: z.string().default(""),
});

export const IconographicGrammarSchema = z
  .object({
    textures: z.array(TextureSchema).default([]),
    patterns: z.array(PatternSchema).default([]),
    colors: z.array(ColorSchema).default([]),
    materials: z.array(MaterialSchema).default([]),
  })
  .default({});

// ---------------------------------------------------------------------------
// GS.transconceptGrammar — Bridge between concept and materialization
// ---------------------------------------------------------------------------

const TransconceptMappingSchema = z.object({
  /** Concept from the conceptual grammar */
  concept: z.string().default(""),
  /** How the concept materializes */
  materialization: z
    .object({
      texture: z.string().default(""),
      color: z.string().default(""),
      pattern: z.string().default(""),
      form: z.string().default(""),
    })
    .default({}),
  /** Why this materialization was chosen */
  justification: z.string().default(""),
  /** Where this transconcept mapping is applied */
  contextesUsage: flexStringArray,
});

export const TransconceptGrammarSchema = z
  .object({
    mappings: z.array(TransconceptMappingSchema).default([]),
    rules: z
      .object({
        /** Hierarchy rule (concept dictates material, never inverse) */
        hierarchy: z.string().default(""),
        /** How to test coherence of a mapping */
        coherenceTest: z.string().default(""),
        /** Cultural validation requirement */
        culturalValidation: z.string().default(""),
      })
      .default({}),
  })
  .default({});

// ---------------------------------------------------------------------------
// GS.tripleAncrage — C×F×P validation scores per symbol
// ---------------------------------------------------------------------------

const TripleAncrageScoreSchema = z.object({
  /** Symbol name (from any grammar) */
  symbolName: z.string().default(""),
  /** Cultural legitimacy score 0-10 */
  cultural: num,
  /** Functional utility score 0-10 */
  functional: num,
  /** Perceptual accuracy score 0-10 */
  perceptual: num,
  /** Whether the symbol passes (all dimensions >= 7) */
  passes: z.boolean().default(false),
  /** Rejection reason if it doesn't pass */
  rejectionReason: z.string().default(""),
});

export const TripleAncrageSchema = z
  .object({
    scores: z.array(TripleAncrageScoreSchema).default([]),
    /** Minimum score required on each dimension */
    minimumThreshold: num,
  })
  .default({});

// ---------------------------------------------------------------------------
// Complete FW-05 Output Schema
// ---------------------------------------------------------------------------

export const GrammarSystemsSchema = z
  .object({
    conceptualGrammar: ConceptualGrammarSchema,
    iconographicGrammar: IconographicGrammarSchema,
    transconceptGrammar: TransconceptGrammarSchema,
    tripleAncrage: TripleAncrageSchema,
    /** Words authorized for brand communication */
    vocabularyAuthorized: flexStringArray,
    /** Words forbidden in brand communication */
    vocabularyForbidden: flexStringArray,
  })
  .strip();

export type GrammarSystemsData = z.infer<typeof GrammarSystemsSchema>;
export type ConceptualGrammar = z.infer<typeof ConceptualGrammarSchema>;
export type IconographicGrammar = z.infer<typeof IconographicGrammarSchema>;
export type TransconceptGrammar = z.infer<typeof TransconceptGrammarSchema>;
export type TripleAncrage = z.infer<typeof TripleAncrageSchema>;
