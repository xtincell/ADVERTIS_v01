// =============================================================================
// LIB L.GLORY — Glory Tool Types
// =============================================================================
// Type definitions for the GLORY operational tools platform.
// Used by: registry, tRPC router, frontend components.
// =============================================================================

export type GloryLayer = "CR" | "DC" | "HYBRID";

// ---------------------------------------------------------------------------
// Context categories that tools can request from strategy data
// ---------------------------------------------------------------------------

export type GloryContextCategory =
  | "budgets"
  | "competitors"
  | "opportunities"
  | "market"
  | "missions"
  | "signals";

// ---------------------------------------------------------------------------
// Field enrichment — returned by the field-enricher for smart forms
// ---------------------------------------------------------------------------

export interface FieldEnrichment {
  /** Clickable suggestion chips (e.g., campaign objectives from pillar S) */
  suggestions?: string[];
  /** Dynamic options replacing static ones (for select/multiselect fields) */
  dynamicOptions?: { value: string; label: string }[];
  /** Auto-filled default value from strategy data */
  defaultValue?: string | number | boolean;
  /** Contextual hint shown below the field (e.g., "Tier IMPACT: 150-300M FCFA") */
  contextHint?: string;
}

// ---------------------------------------------------------------------------
// Tool input field definition
// ---------------------------------------------------------------------------

export interface GloryToolInput {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "number" | "toggle";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
  helpText?: string;
  /** Whether this field can be enriched by strategy data */
  enrichable?: boolean;
  /** Key mapping to the enrichment data source (used by field-enricher) */
  enrichKey?: string;
}

// ---------------------------------------------------------------------------
// Tool descriptor — full definition of a GLORY tool
// ---------------------------------------------------------------------------

export interface GloryToolDescriptor {
  slug: string;
  name: string;
  shortName: string;
  layer: GloryLayer;
  description: string;
  icon: string;
  persistable: boolean;
  inputs: GloryToolInput[];
  requiredPillars: string[];
  requiredPhase?: string;
  outputFormat: "markdown" | "structured" | "mixed";
  tags?: string[];
  /** Which context categories to load for AI generation (beyond pillars) */
  requiredContext?: GloryContextCategory[];
  /** Number of output variations to generate (default: 1) */
  variations?: number;
}

// ---------------------------------------------------------------------------
// Layer metadata
// ---------------------------------------------------------------------------

export const GLORY_LAYER_META: Record<
  GloryLayer,
  { label: string; description: string; color: string }
> = {
  CR: {
    label: "Concepteur-Rédacteur",
    description: "Production créative : concepts, scripts, copy, dialogues",
    color: "#6C5CE7",
  },
  DC: {
    label: "Direction de Création",
    description: "Supervision créative : architecture, évaluation, pitch",
    color: "#00B894",
  },
  HYBRID: {
    label: "Hybride",
    description: "Outils opérationnels transverses : planning, budget, workflow",
    color: "#FDCB6E",
  },
};
