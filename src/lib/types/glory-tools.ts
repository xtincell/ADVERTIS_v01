// =============================================================================
// LIB L.GLORY — Glory Tool Types
// =============================================================================
// Type definitions for the GLORY operational tools platform.
// Used by: registry, tRPC router, frontend components.
// =============================================================================

export type GloryLayer = "CR" | "DC" | "HYBRID";

export interface GloryToolInput {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "number" | "toggle";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
  helpText?: string;
}

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
}

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
