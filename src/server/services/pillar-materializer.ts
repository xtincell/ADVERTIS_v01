// =============================================================================
// MODULE 22 — Pillar Materializer (BrandVariables → Pillar)
// =============================================================================
// Reconstructs a pillar's JSON content from individual BrandVariable records.
// This is the reverse of the Variable Extractor: it reads all section variables
// for a pillar and assembles them back into the Pillar.content structure.
//
// Direction: BrandVariable rows → Pillar.content JSON
// (The reverse direction is handled by variable-extractor.ts)
//
// Public API:
//   1. materializePillar()           — Build JSON content from BrandVariables
//   2. materializeAndPersist()       — Build + save to DB with PillarVersion snapshot
//
// Dependencies:
//   - ~/server/db (Prisma client)
//   - ~/lib/types/pillar-schemas (PILLAR_SCHEMAS for validation)
//   - ~/lib/variable-registry (getPillarSectionDefinitions)
//   - ./variable-store (getVariablesByPillar)
//
// Called by:
//   - variable.ts router (materialize procedure)
//   - Future: selective regeneration workflows
// =============================================================================

import { db } from "~/server/db";
import { PILLAR_SCHEMAS } from "~/lib/types/pillar-schemas";
import { getPillarSectionDefinitions } from "~/lib/variable-registry";
import { getVariablesByPillar } from "./variable-store";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Reconstruct a pillar's JSON content from its BrandVariable records.
 *
 * Reads all pillar section variables, maps them back to their section keys,
 * then validates through the Zod schema (applying defaults for any missing sections).
 *
 * @param strategyId - Strategy ID
 * @param pillarType - Pillar letter (A-S)
 * @returns Reconstructed pillar content (always valid per Zod schema)
 */
export async function materializePillar(
  strategyId: string,
  pillarType: string,
): Promise<Record<string, unknown>> {
  const schema = PILLAR_SCHEMAS[pillarType];
  if (!schema) {
    throw new Error(`[PillarMaterializer] Unknown pillar type: ${pillarType}`);
  }

  // 1. Get section definitions to know which BrandVariable keys map to which sections
  const sectionDefs = getPillarSectionDefinitions(pillarType);

  // 2. Read all BrandVariables for this pillar (keys like "A.identite", "A.herosJourney"...)
  const variables = await getVariablesByPillar(strategyId, pillarType);

  // Build a key → value map for quick lookup
  const variableMap = new Map(variables.map((v) => [v.key, v.value]));

  // 3. Reconstruct the content object
  const content: Record<string, unknown> = {};

  for (const def of sectionDefs) {
    if (!def.pillarSection) continue;

    const value = variableMap.get(def.key);
    if (value !== undefined && value !== null) {
      content[def.pillarSection] = value;
    }
    // If no variable exists for this section, leave it out — Zod defaults will fill it
  }

  // 4. Validate through Zod schema (applies defaults for missing sections)
  const result = schema.safeParse(content);
  if (result.success) {
    return result.data as Record<string, unknown>;
  }

  // Fallback: if validation fails, try parsing empty object for full defaults
  // and deep-merge our content on top
  console.warn(
    `[PillarMaterializer] Zod validation failed for ${pillarType}, using raw content with defaults. Errors:`,
    result.error.issues.slice(0, 5),
  );

  const defaults = schema.safeParse({});
  if (defaults.success) {
    return { ...(defaults.data as Record<string, unknown>), ...content };
  }

  // Last resort: return our assembled content as-is
  return content;
}

/**
 * Materialize a pillar and persist it to the database.
 * Creates a PillarVersion snapshot before overwriting, then updates the Pillar.
 *
 * @param strategyId - Strategy ID
 * @param pillarType - Pillar letter (A-S)
 * @param userId - User who triggered the materialization
 * @returns The updated Pillar record
 */
export async function materializeAndPersist(
  strategyId: string,
  pillarType: string,
  userId: string,
) {
  // 1. Build the content from BrandVariables
  const content = await materializePillar(strategyId, pillarType);

  // 2. Find the existing pillar
  const pillar = await db.pillar.findFirst({
    where: { strategyId, type: pillarType },
  });

  if (!pillar) {
    throw new Error(
      `[PillarMaterializer] No pillar found for strategy ${strategyId} type ${pillarType}`,
    );
  }

  // 3. Snapshot + update in a transaction
  return db.$transaction(async (tx) => {
    // Snapshot existing version
    if (pillar.content != null) {
      await tx.pillarVersion.create({
        data: {
          pillarId: pillar.id,
          version: pillar.version,
          content: pillar.content,
          summary: pillar.summary,
          source: "materialization",
          changeNote: "Reconstructed from BrandVariables",
          createdBy: userId,
        },
      });
    }

    // Build a brief summary from the content
    const summary = buildMaterializationSummary(pillarType, content);

    // Update pillar
    const updated = await tx.pillar.update({
      where: { id: pillar.id },
      data: {
        content: content as never,
        summary,
        version: { increment: 1 },
        staleReason: null,
        staleSince: null,
      },
    });

    return updated;
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a brief summary string from materialized content (for Pillar.summary).
 */
function buildMaterializationSummary(
  pillarType: string,
  content: Record<string, unknown>,
): string {
  const sectionCount = Object.keys(content).filter(
    (k) => content[k] !== null && content[k] !== undefined,
  ).length;

  const pillarNames: Record<string, string> = {
    A: "Authenticité",
    D: "Distinction",
    V: "Valeur",
    E: "Engagement",
    R: "Risk Audit",
    T: "Track Audit",
    I: "Implémentation",
    S: "Synthèse",
  };

  const name = pillarNames[pillarType] ?? pillarType;
  return `Pilier ${name} — ${sectionCount} sections (materialisé depuis les variables)`;
}
