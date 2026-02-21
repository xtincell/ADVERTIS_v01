// =============================================================================
// MODULE 23D — Data Quality Scorer
// =============================================================================
// Computes a per-field quality / completeness score for pillars A-D-V-E.
// Pure mathematical module -- no AI calls, no side-effects on pillar data.
// Outputs a globalScore (0-100), per-pillar breakdown, and a ranked list
// of top gaps (empty fields, placeholders, too-short values).
//
// Category: compute  |  autoTrigger: true  |  outputs: [] (read-only)
//
// Public API (exported):
//   default handler  — registered with registerModule() at import time
//
// Dependencies:
//   zod                              — Output schema definition
//   ../registry                      — registerModule
//   ~/lib/types/module-system        — ModuleHandler, ModuleDescriptor, etc.
//
// Called by:
//   modules/index.ts (side-effect import triggers registration)
//   modules/executor.ts (executeModule -> handler.execute)
// =============================================================================

import { z } from "zod";
import { registerModule } from "../registry";
import type {
  ModuleHandler,
  ModuleDescriptor,
  ModuleContext,
  ModuleResult,
} from "~/lib/types/module-system";

// ---------------------------------------------------------------------------
// Output Schema
// ---------------------------------------------------------------------------

const QualityIssueSchema = z.object({
  field: z.string(),
  issue: z.enum(["empty", "too_short", "placeholder", "duplicate"]),
  severity: z.enum(["low", "medium", "high"]),
});

const PillarQualitySchema = z.object({
  score: z.number(),
  totalFields: z.number(),
  filledFields: z.number(),
  emptyFields: z.array(z.string()),
  qualityIssues: z.array(QualityIssueSchema),
});

const DataQualityOutputSchema = z.object({
  globalScore: z.number(),
  perPillar: z.record(z.string(), PillarQualitySchema),
  topGaps: z.array(
    z.object({
      pillarType: z.string(),
      field: z.string(),
      issue: z.string(),
    }),
  ),
});

// ---------------------------------------------------------------------------
// Descriptor
// ---------------------------------------------------------------------------

const descriptor: ModuleDescriptor = {
  id: "data-quality-scorer",
  name: "Score de Qualite des Donnees",
  description:
    "Calcule un score de qualite/completude par champ pour chaque pilier A-D-V-E",
  category: "compute",
  inputs: [
    { type: "pillar", pillarType: "A" },
    { type: "pillar", pillarType: "D" },
    { type: "pillar", pillarType: "V" },
    { type: "pillar", pillarType: "E" },
  ],
  outputs: [], // Read-only — produces metadata only, no pillar updates
  autoTrigger: true,
  inputSchema: z.object({
    pillar_A: z.unknown().optional(),
    pillar_D: z.unknown().optional(),
    pillar_V: z.unknown().optional(),
    pillar_E: z.unknown().optional(),
  }),
  outputSchema: DataQualityOutputSchema,
};

// ---------------------------------------------------------------------------
// Field definitions per pillar (hardcoded structure from Zod schemas)
// ---------------------------------------------------------------------------

interface FieldDef {
  /** Dot path e.g. "identite.archetype" */
  path: string;
  /** Human label */
  label: string;
  /** Expected type */
  type: "string" | "array" | "object";
  /** For arrays, minimum expected length */
  minLength?: number;
}

const PILLAR_FIELDS: Record<string, FieldDef[]> = {
  A: [
    { path: "identite.archetype", label: "Archetype", type: "string" },
    { path: "identite.citationFondatrice", label: "Citation fondatrice", type: "string" },
    { path: "identite.noyauIdentitaire", label: "Noyau identitaire", type: "string" },
    { path: "herosJourney.acte1Origines", label: "Origines", type: "string" },
    { path: "herosJourney.acte2Appel", label: "Appel", type: "string" },
    { path: "herosJourney.acte3Epreuves", label: "Epreuves", type: "string" },
    { path: "herosJourney.acte4Transformation", label: "Transformation", type: "string" },
    { path: "herosJourney.acte5Revelation", label: "Revelation", type: "string" },
    { path: "ikigai.aimer", label: "Ikigai : Aimer", type: "string" },
    { path: "ikigai.competence", label: "Ikigai : Competence", type: "string" },
    { path: "ikigai.besoinMonde", label: "Ikigai : Besoin du monde", type: "string" },
    { path: "ikigai.remuneration", label: "Ikigai : Remuneration", type: "string" },
    { path: "valeurs", label: "Valeurs", type: "array", minLength: 3 },
    { path: "hierarchieCommunautaire", label: "Hierarchie communautaire", type: "array", minLength: 2 },
    { path: "timelineNarrative.origines", label: "Timeline : Origines", type: "string" },
    { path: "timelineNarrative.futur", label: "Timeline : Futur", type: "string" },
  ],
  D: [
    { path: "personas", label: "Personas", type: "array", minLength: 2 },
    { path: "paysageConcurrentiel.concurrents", label: "Concurrents", type: "array", minLength: 2 },
    { path: "paysageConcurrentiel.avantagesCompetitifs", label: "Avantages competitifs", type: "string" },
    { path: "promessesDeMarque.promesseMaitre", label: "Promesse maitre", type: "string" },
    { path: "positionnement", label: "Positionnement", type: "string" },
    { path: "tonDeVoix.personnalite", label: "Personnalite de voix", type: "string" },
    { path: "tonDeVoix.onDit", label: "On dit", type: "array", minLength: 3 },
    { path: "tonDeVoix.onNeditPas", label: "On ne dit pas", type: "array", minLength: 2 },
    { path: "identiteVisuelle.directionArtistique", label: "Direction artistique", type: "string" },
    { path: "identiteVisuelle.paletteCouleurs", label: "Palette couleurs", type: "array", minLength: 3 },
    { path: "identiteVisuelle.mood", label: "Mood", type: "string" },
    { path: "assetsLinguistiques.mantras", label: "Mantras", type: "array", minLength: 2 },
    { path: "assetsLinguistiques.vocabulaireProprietaire", label: "Vocabulaire proprietaire", type: "array", minLength: 3 },
  ],
  V: [
    { path: "productLadder", label: "Product Ladder", type: "array", minLength: 2 },
    { path: "valeurMarque.tangible", label: "Valeur tangible", type: "string" },
    { path: "valeurMarque.intangible", label: "Valeur intangible", type: "string" },
    { path: "valeurClient.fonctionnels", label: "Benefices fonctionnels", type: "string" },
    { path: "valeurClient.emotionnels", label: "Benefices emotionnels", type: "string" },
    { path: "valeurClient.sociaux", label: "Benefices sociaux", type: "string" },
    { path: "coutMarque.capex", label: "CAPEX", type: "string" },
    { path: "coutMarque.opex", label: "OPEX", type: "string" },
    { path: "coutClient.frictions", label: "Frictions client", type: "array", minLength: 1 },
    { path: "unitEconomics.cac", label: "CAC", type: "string" },
    { path: "unitEconomics.ltv", label: "LTV", type: "string" },
    { path: "unitEconomics.ratio", label: "Ratio LTV/CAC", type: "string" },
    { path: "unitEconomics.pointMort", label: "Point mort", type: "string" },
    { path: "unitEconomics.marges", label: "Marges", type: "string" },
  ],
  E: [
    { path: "touchpoints", label: "Touchpoints", type: "array", minLength: 3 },
    { path: "rituels", label: "Rituels", type: "array", minLength: 2 },
    { path: "principesCommunautaires.principes", label: "Principes communautaires", type: "string" },
    { path: "principesCommunautaires.tabous", label: "Tabous", type: "string" },
    { path: "gamification", label: "Gamification", type: "array", minLength: 2 },
    { path: "aarrr.acquisition", label: "AARRR : Acquisition", type: "string" },
    { path: "aarrr.activation", label: "AARRR : Activation", type: "string" },
    { path: "aarrr.retention", label: "AARRR : Retention", type: "string" },
    { path: "aarrr.revenue", label: "AARRR : Revenue", type: "string" },
    { path: "aarrr.referral", label: "AARRR : Referral", type: "string" },
    { path: "kpis", label: "KPIs", type: "array", minLength: 3 },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /^todo$/i,
  /^tbd$/i,
  /^à définir$/i,
  /^a definir$/i,
  /^\.{3,}$/,
  /^-+$/,
  /^n\/a$/i,
];

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function isPlaceholder(val: string): boolean {
  const trimmed = val.trim();
  return PLACEHOLDER_PATTERNS.some((p) => p.test(trimmed));
}

interface QualityIssue {
  field: string;
  issue: "empty" | "too_short" | "placeholder" | "duplicate";
  severity: "low" | "medium" | "high";
}

function assessField(
  fieldDef: FieldDef,
  value: unknown,
): { filled: boolean; issues: QualityIssue[] } {
  const issues: QualityIssue[] = [];

  if (fieldDef.type === "string") {
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      issues.push({
        field: fieldDef.label,
        issue: "empty",
        severity: "high",
      });
      return { filled: false, issues };
    }
    if (typeof value === "string") {
      if (value.trim().length < 10) {
        issues.push({
          field: fieldDef.label,
          issue: "too_short",
          severity: "medium",
        });
        return { filled: true, issues };
      }
      if (isPlaceholder(value)) {
        issues.push({
          field: fieldDef.label,
          issue: "placeholder",
          severity: "high",
        });
        return { filled: false, issues };
      }
    }
    return { filled: true, issues };
  }

  if (fieldDef.type === "array") {
    if (!Array.isArray(value) || value.length === 0) {
      issues.push({
        field: fieldDef.label,
        issue: "empty",
        severity: "high",
      });
      return { filled: false, issues };
    }
    if (fieldDef.minLength && value.length < fieldDef.minLength) {
      issues.push({
        field: fieldDef.label,
        issue: "too_short",
        severity: "low",
      });
      return { filled: true, issues };
    }
    return { filled: true, issues };
  }

  // object type — just check non-null/non-empty
  if (!value || (typeof value === "object" && Object.keys(value as object).length === 0)) {
    issues.push({
      field: fieldDef.label,
      issue: "empty",
      severity: "medium",
    });
    return { filled: false, issues };
  }
  return { filled: true, issues };
}

// ---------------------------------------------------------------------------
// Compute
// ---------------------------------------------------------------------------

async function execute(ctx: ModuleContext): Promise<ModuleResult> {
  try {
    const perPillar: Record<
      string,
      {
        score: number;
        totalFields: number;
        filledFields: number;
        emptyFields: string[];
        qualityIssues: QualityIssue[];
      }
    > = {};

    const topGaps: Array<{
      pillarType: string;
      field: string;
      issue: string;
    }> = [];

    for (const [pillarType, fields] of Object.entries(PILLAR_FIELDS)) {
      const pillarData = ctx.inputs[`pillar_${pillarType}`];

      let filledCount = 0;
      const emptyFields: string[] = [];
      const allIssues: QualityIssue[] = [];

      for (const fieldDef of fields) {
        const value = getNestedValue(pillarData, fieldDef.path);
        const { filled, issues } = assessField(fieldDef, value);

        if (filled) filledCount++;
        else emptyFields.push(fieldDef.label);

        allIssues.push(...issues);
      }

      const totalFields = fields.length;
      // Score: base on fill ratio, with penalties
      const fillRatio = totalFields > 0 ? filledCount / totalFields : 0;
      const issuePenalty =
        allIssues.filter((i) => i.issue === "too_short").length * 2 +
        allIssues.filter((i) => i.issue === "placeholder").length * 5;
      const rawScore = Math.round(fillRatio * 100);
      const score = Math.max(0, rawScore - issuePenalty);

      perPillar[pillarType] = {
        score,
        totalFields,
        filledFields: filledCount,
        emptyFields,
        qualityIssues: allIssues,
      };

      // Collect top gaps (empty fields with high severity)
      for (const issue of allIssues.filter((i) => i.severity === "high")) {
        topGaps.push({
          pillarType,
          field: issue.field,
          issue: issue.issue === "empty" ? "Non renseigne" : "Placeholder detecte",
        });
      }
    }

    // Global score = average of 4 pillar scores
    const pillarScores = Object.values(perPillar).map((p) => p.score);
    const globalScore =
      pillarScores.length > 0
        ? Math.round(
            pillarScores.reduce((a, b) => a + b, 0) / pillarScores.length,
          )
        : 0;

    // Sort gaps by pillar priority (A, D, V, E)
    topGaps.sort((a, b) => {
      const order = ["A", "D", "V", "E"];
      return order.indexOf(a.pillarType) - order.indexOf(b.pillarType);
    });

    return {
      success: true,
      data: {
        globalScore,
        perPillar,
        topGaps: topGaps.slice(0, 20), // Top 20 gaps
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

const handler: ModuleHandler = { descriptor, execute };
registerModule(handler);
export default handler;
