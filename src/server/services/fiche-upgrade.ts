// =============================================================================
// MODULE 10 — Fiche Upgrade Service
// =============================================================================
//
// Standalone module for upgrading legacy brand fiches to the current schema.
//
// ARCHITECTURE :
//   Schema-agnostic — dynamically compares existing data against the CURRENT
//   schema via getAllFicheVariableIds() / getFicheDeMarqueSchema().
//   No variable IDs are hardcoded. If the schema evolves (add A7, remove D7,
//   rename V3), this module adapts without modification.
//
// PIPELINE (4 steps) :
//   10.1  computeFicheDiff()          — Detect missing/empty/obsolete variables
//   10.2  fillMissingInterviewData()  — AI-powered variable completion
//   10.3  regenerateAllPillars()      — Sequential 8-pillar regeneration
//   10.4  upgradeFiche()              — Main orchestrator (diff → fill → regen)
//
// DEPENDENCIES :
//   - Module 7  (ai-generation.ts)          → generatePillarContent, generateSyntheseContent
//   - Module 8  (audit-generation.ts)       → generateRiskAudit, generateTrackAudit
//   - Module 9  (implementation-generation) → generateImplementationData
//   - Module 11 (budget-tier-generator)     → generateBudgetTiers
//   - Module 6  (score-engine)              → recalculateAllScores
//   - Module 14 (compute-engine / widgets)  → computeAllWidgets
//   - Module 5  (anthropic-client)          → resilientGenerateText
//
// CALLED BY :
//   - API Route POST /api/ai/upgrade-fiche (route.ts)
//   - UI Component: FicheUpgradeButton (fiche-upgrade-button.tsx)
//
// =============================================================================

import { db } from "~/server/db";
import {
  getAllFicheVariableIds,
  getFicheDeMarqueSchema,
} from "~/lib/interview-schema";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import {
  anthropic,
  DEFAULT_MODEL,
  resilientGenerateText,
} from "./anthropic-client";
import { generatePillarContent, generateSyntheseContent } from "./ai-generation";
import { generateRiskAudit, generateTrackAudit } from "./audit-generation";
import { generateImplementationData } from "./implementation-generation";
import { generateBudgetTiers } from "./budget-tier-generator";
import { computeAllWidgets } from "./widgets/compute-engine";
import { recalculateAllScores } from "./score-engine";
import { clearPillarStaleness } from "./stale-detector";
import { syncTrackToMarketContext } from "./track-sync";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type { RiskAuditResult, TrackAuditResult } from "~/lib/types/pillar-schemas";
import type { MarketStudySynthesis } from "~/lib/types/market-study";
import type { ImplementationData } from "~/lib/types/implementation-data";

// ---------------------------------------------------------------------------
// 10.0  Types — Exported interfaces for diff results and upgrade reports
// ---------------------------------------------------------------------------

export interface FicheDiffResult {
  /** In current schema but absent from interviewData */
  missingIds: string[];
  /** Key exists in interviewData but value is empty/whitespace */
  emptyIds: string[];
  /** In interviewData but NOT in current schema (legacy / removed) */
  obsoleteIds: string[];
  /** Present and non-empty — healthy variables */
  filledIds: string[];
  /** Total count of variables in the current schema */
  totalSchemaVars: number;
}

export interface FicheUpgradeReport {
  strategyId: string;
  variablesAdded: string[];
  variablesUpdated: string[];
  variablesObsolete: string[];
  interviewBefore: { filled: number; total: number };
  interviewAfter: { filled: number; total: number };
  pillarsRegenerated: string[];
  errors: string[];
  durationMs: number;
}

// ---------------------------------------------------------------------------
// 10.1  computeFicheDiff — Pure function, zero side-effects
//       Compares interviewData keys against getAllFicheVariableIds().
//       Returns: missingIds, emptyIds, obsoleteIds, filledIds, totalSchemaVars.
// ---------------------------------------------------------------------------

/**
 * Compares existing interviewData against the CURRENT schema.
 * Returns which variables are missing, empty, obsolete, or healthy.
 */
export function computeFicheDiff(
  interviewData: Record<string, string> | null,
): FicheDiffResult {
  const schemaIds = getAllFicheVariableIds();
  const data = interviewData ?? {};
  const dataKeys = new Set(Object.keys(data));
  const schemaSet = new Set(schemaIds);

  const missingIds: string[] = [];
  const emptyIds: string[] = [];
  const filledIds: string[] = [];

  for (const id of schemaIds) {
    if (!dataKeys.has(id)) {
      missingIds.push(id);
    } else if (!data[id]?.trim()) {
      emptyIds.push(id);
    } else {
      filledIds.push(id);
    }
  }

  // Obsolete: keys in data that don't exist in current schema
  const obsoleteIds = Array.from(dataKeys).filter((k) => !schemaSet.has(k));

  return {
    missingIds,
    emptyIds,
    obsoleteIds,
    filledIds,
    totalSchemaVars: schemaIds.length,
  };
}

// ---------------------------------------------------------------------------
// 10.2  fillMissingInterviewData — AI-powered variable completion
//       Uses resilientGenerateText (label: "upgrade-fiche-fill") to generate
//       content for missing/empty variables. Non-destructive: never overwrites
//       an existing non-empty value. ~6000 output tokens, temperature 0.3.
// ---------------------------------------------------------------------------

/**
 * Uses AI to fill missing/empty interview variables.
 * Non-destructive: never replaces a non-empty existing value.
 */
export async function fillMissingInterviewData(
  strategyId: string,
  existingData: Record<string, string>,
  diff: FicheDiffResult,
): Promise<{
  mergedData: Record<string, string>;
  filledIds: string[];
  errors: string[];
}> {
  const idsToFill = [...diff.missingIds, ...diff.emptyIds];

  // Nothing to fill
  if (idsToFill.length === 0) {
    return { mergedData: { ...existingData }, filledIds: [], errors: [] };
  }

  // Load strategy context for the prompt
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: {
      pillars: {
        where: { type: { in: ["A", "D", "V", "E"] }, status: "complete" },
        select: { type: true, content: true },
      },
    },
  });

  if (!strategy) {
    return {
      mergedData: { ...existingData },
      filledIds: [],
      errors: ["Strategy not found"],
    };
  }

  // Build context from existing pillar content
  const pillarContextParts: string[] = [];
  for (const pillar of strategy.pillars) {
    if (!pillar.content) continue;
    const cfg = PILLAR_CONFIG[pillar.type as PillarType];
    const contentStr =
      typeof pillar.content === "string"
        ? pillar.content
        : JSON.stringify(pillar.content, null, 2);
    const truncated =
      contentStr.length > 3000
        ? contentStr.substring(0, 3000) + "\n[... tronque ...]"
        : contentStr;
    pillarContextParts.push(
      `### Pilier ${pillar.type} — ${cfg?.title ?? pillar.type}\n${truncated}`,
    );
  }

  // Build schema info for the variables to fill
  const schema = getFicheDeMarqueSchema();
  const allVariables = schema.flatMap((section) =>
    section.variables.map((v) => ({
      ...v,
      pillarType: section.pillarType,
    })),
  );

  const varsToFill = allVariables.filter((v) => idsToFill.includes(v.id));
  const filledVars = allVariables.filter((v) =>
    existingData[v.id]?.trim(),
  );

  // Build prompt
  const systemPrompt = `Tu es un expert en strategie de marque utilisant la methodologie ADVERTIS.

On te fournit :
1. Les variables DEJA remplies par l'utilisateur (contexte fiable)
2. Le contenu structure des piliers A-D-V-E DEJA generes par l'IA (contexte riche)
3. La liste des variables VIDES a completer

Ta mission : generer le contenu des variables vides en t'appuyant sur TOUT le contexte disponible.

REGLES CRITIQUES :
- Reponds UNIQUEMENT avec du JSON valide : un objet { "ID": "valeur", "ID": "valeur", ... }
- Genere UNIQUEMENT les variables demandees (celles listees comme vides)
- Ne modifie JAMAIS les variables deja remplies
- Chaque valeur doit etre un texte riche, detaille et specifique a la marque (2-5 paragraphes)
- Utilise le contenu des piliers comme source principale d'information
- Utilise le francais
- Pas de commentaires, pas de markdown, pas de texte avant/apres le JSON`;

  const userLines: string[] = [
    `# Marque : ${strategy.brandName}`,
    `# Secteur : ${strategy.sector ?? "Non specifie"}`,
    "",
  ];

  if (filledVars.length > 0) {
    userLines.push("## Variables deja remplies par l'utilisateur");
    userLines.push("");
    for (const v of filledVars) {
      userLines.push(
        `**${v.id} — ${v.label}** : ${existingData[v.id]!.trim()}`,
      );
      userLines.push("");
    }
  }

  if (pillarContextParts.length > 0) {
    userLines.push("## Contenu structure des piliers (genere par l'IA)");
    userLines.push("");
    userLines.push(pillarContextParts.join("\n\n"));
    userLines.push("");
  }

  userLines.push("## Variables a completer");
  userLines.push(
    "Genere le contenu pour CHACUNE des variables suivantes :",
  );
  userLines.push("");

  for (const v of varsToFill) {
    userLines.push(`### ${v.id} — ${v.label} (Pilier ${v.pillarType})`);
    userLines.push(`Description : ${v.description}`);
    userLines.push(`Exemple attendu : ${v.placeholder}`);
    userLines.push("");
  }

  userLines.push("---");
  userLines.push(
    `Genere un objet JSON avec les ${varsToFill.length} variables manquantes.`,
  );
  userLines.push(
    'Format : { "A2": "contenu...", "D5": "contenu...", ... }',
  );
  userLines.push(
    "Reponds UNIQUEMENT avec du JSON valide, sans texte avant ou apres.",
  );

  // Call AI
  const errors: string[] = [];
  const filledIds: string[] = [];
  const mergedData = { ...existingData };

  try {
    const { text } = await resilientGenerateText({
      label: "upgrade-fiche-fill",
      model: anthropic(DEFAULT_MODEL),
      system: systemPrompt,
      prompt: userLines.join("\n"),
      maxOutputTokens: 6000,
      temperature: 0.3,
    });

    // Parse response
    let responseText = text.trim();
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch?.[1]) {
      responseText = jsonMatch[1].trim();
    }

    let generated: Record<string, string>;
    try {
      generated = JSON.parse(responseText) as Record<string, string>;
    } catch {
      errors.push(
        `JSON parse error on AI fill response: ${responseText.substring(0, 200)}`,
      );
      return { mergedData, filledIds, errors };
    }

    // Merge: only fill empty/missing vars, never overwrite existing non-empty
    const idsToFillSet = new Set(idsToFill);
    for (const [key, value] of Object.entries(generated)) {
      if (idsToFillSet.has(key) && typeof value === "string" && value.trim()) {
        mergedData[key] = value.trim();
        filledIds.push(key);
      }
    }
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Unknown AI fill error";
    errors.push(`AI fill failed: ${msg}`);
  }

  return { mergedData, filledIds, errors };
}

// ---------------------------------------------------------------------------
// 10.3  regenerateAllPillars — Sequential 8-pillar regeneration
//       Order: A→D→V→E→R→T→I→S. Each pillar sees freshContent from previous.
//       Snapshots PillarVersion before each overwrite (source: "regeneration").
//       After I: recreates budget tiers. After all: scores + widgets refresh.
//       Non-blocking on individual errors — collects them in report.
// ---------------------------------------------------------------------------

/** Pillar generation order: A→D→V→E→R→T→I→S */
const PILLAR_ORDER = ["A", "D", "V", "E", "R", "T", "I", "S"] as const;

/**
 * Regenerates all 8 pillars sequentially, using fresh interviewData.
 * Each pillar sees the content of previously regenerated pillars.
 * Non-blocking on individual errors — collects them in the report.
 */
export async function regenerateAllPillars(
  strategyId: string,
  userId: string,
  interviewData: Record<string, string>,
): Promise<{ regenerated: string[]; errors: string[] }> {
  const regenerated: string[] = [];
  const errors: string[] = [];

  // Load strategy metadata
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: {
      pillars: { orderBy: { order: "asc" } },
    },
  });

  if (!strategy) {
    return { regenerated, errors: ["Strategy not found"] };
  }

  const specialization = {
    vertical: strategy.vertical ?? undefined,
    maturityProfile: strategy.maturityProfile ?? undefined,
  };

  // Track freshly regenerated pillar content in memory
  // so each subsequent pillar gets the latest context
  const freshContent: Map<string, unknown> = new Map();

  for (const pillarType of PILLAR_ORDER) {
    const targetPillar = strategy.pillars.find((p) => p.type === pillarType);
    if (!targetPillar) {
      errors.push(`Pillar ${pillarType} not found in strategy — skipped`);
      continue;
    }

    try {
      // Mark as generating
      await db.pillar.update({
        where: { id: targetPillar.id },
        data: { status: "generating", errorMessage: null },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let generatedContent: any;

      if (["A", "D", "V", "E"].includes(pillarType)) {
        // ── STANDARD FICHE PILLAR ──
        const previousPillars = PILLAR_ORDER
          .slice(0, PILLAR_ORDER.indexOf(pillarType as typeof PILLAR_ORDER[number]))
          .filter((pt) => ["A", "D", "V", "E"].includes(pt))
          .map((pt) => {
            const content = freshContent.get(pt);
            return content
              ? {
                  type: pt,
                  content:
                    typeof content === "string"
                      ? content
                      : JSON.stringify(content ?? ""),
                }
              : null;
          })
          .filter(Boolean) as Array<{ type: string; content: string }>;

        generatedContent = await generatePillarContent(
          pillarType,
          interviewData,
          previousPillars,
          strategy.brandName,
          strategy.sector ?? "",
          specialization,
          strategy.tagline,
        );
      } else if (pillarType === "R") {
        // ── RISK AUDIT ──
        const ficheContent = buildFicheContentFromFresh(freshContent);

        generatedContent = await generateRiskAudit(
          interviewData,
          ficheContent,
          strategy.brandName,
          strategy.sector ?? "",
          specialization,
          strategy.tagline,
        );
      } else if (pillarType === "T") {
        // ── TRACK AUDIT ──
        const ficheContent = buildFicheContentFromFresh(freshContent);

        const riskData = freshContent.get("R");
        const { data: riskResults } = parsePillarContent<RiskAuditResult>(
          "R",
          riskData ?? null,
        );

        // Load market study if available
        const marketStudy = await db.marketStudy.findUnique({
          where: { strategyId },
          select: { synthesis: true },
        });
        const marketStudyData = marketStudy?.synthesis
          ? (marketStudy.synthesis as unknown as MarketStudySynthesis)
          : null;

        generatedContent = await generateTrackAudit(
          interviewData,
          ficheContent,
          riskResults,
          strategy.brandName,
          strategy.sector ?? "",
          marketStudyData,
          specialization,
          strategy.tagline,
        );

        // Auto-sync competitor snapshots + opportunity calendar
        void syncTrackToMarketContext(strategyId, generatedContent as TrackAuditResult);
      } else if (pillarType === "I") {
        // ── IMPLEMENTATION ──
        const ficheContent = buildFicheContentFromFresh(freshContent);

        const riskData = freshContent.get("R");
        const trackData = freshContent.get("T");
        const { data: riskResults } = parsePillarContent<RiskAuditResult>(
          "R",
          riskData ?? null,
        );
        const { data: trackResults } = parsePillarContent<TrackAuditResult>(
          "T",
          trackData ?? null,
        );

        generatedContent = await generateImplementationData(
          interviewData,
          riskResults,
          trackResults,
          ficheContent,
          strategy.brandName,
          strategy.sector ?? "",
          specialization,
          strategy.tagline,
        );

        // Recreate budget tiers from fresh Implementation data
        try {
          await db.budgetTier.deleteMany({ where: { strategyId } });
          const tiers = await generateBudgetTiers(
            generatedContent as ImplementationData,
            strategy.brandName,
            strategy.sector ?? "",
          );
          await db.budgetTier.createMany({
            data: tiers.map((t) => ({ strategyId, ...t })),
          });
          console.log(
            `[Fiche Upgrade] Regenerated ${tiers.length} budget tiers for ${strategyId}`,
          );
        } catch (tierErr) {
          const msg =
            tierErr instanceof Error ? tierErr.message : "Unknown error";
          errors.push(`Budget tier regeneration failed: ${msg}`);
        }
      } else if (pillarType === "S") {
        // ── SYNTHESE ──
        const allCompletedPillars = PILLAR_ORDER
          .filter((pt) => pt !== "S" && freshContent.has(pt))
          .map((pt) => {
            const content = freshContent.get(pt);
            return {
              type: pt,
              content:
                typeof content === "string"
                  ? content
                  : JSON.stringify(content ?? ""),
            };
          });

        generatedContent = await generateSyntheseContent(
          interviewData,
          allCompletedPillars,
          strategy.brandName,
          strategy.sector ?? "",
          specialization,
          strategy.tagline,
        );
      }

      // Snapshot previous version before overwriting
      if (targetPillar.content != null) {
        await db.pillarVersion.create({
          data: {
            pillarId: targetPillar.id,
            version: targetPillar.version,
            content: targetPillar.content,
            summary: targetPillar.summary,
            source: "regeneration",
            changeNote: "Fiche upgrade",
            createdBy: userId,
          },
        });
      }

      // Build summary (same logic as route.ts)
      const summary = buildPillarSummary(pillarType, generatedContent);

      // Save content
      await db.pillar.update({
        where: { id: targetPillar.id },
        data: {
          content: generatedContent,
          status: "complete",
          generatedAt: new Date(),
          errorMessage: null,
          summary: summary.substring(0, 500),
          version: { increment: 1 },
        },
      });

      // Clear staleness
      void clearPillarStaleness(targetPillar.id);

      // Store in memory for subsequent pillars
      freshContent.set(pillarType, generatedContent);
      regenerated.push(pillarType);

      console.log(
        `[Fiche Upgrade] Pillar ${pillarType} regenerated successfully`,
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unknown generation error";
      errors.push(`Pillar ${pillarType} failed: ${msg}`);
      console.error(
        `[Fiche Upgrade] Pillar ${pillarType} failed:`,
        err,
      );

      // Mark pillar as error
      await db.pillar
        .update({
          where: { id: targetPillar.id },
          data: {
            status: "error",
            errorMessage: msg,
          },
        })
        .catch(() => {
          /* best-effort */
        });
    }
  }

  // Post-generation: recalculate scores + compute widgets (fire-and-forget)
  void recalculateAllScores(strategyId, "generation");
  void computeAllWidgets(strategyId);

  return { regenerated, errors };
}

// ---------------------------------------------------------------------------
// 10.4  upgradeFiche — Main orchestrator
//       Full pipeline: diff → fill → save interviewData → regen 8 pillars.
//       Idempotent: re-running on an up-to-date fiche → diff vide → no fill
//       → regeneration produces same output (with version snapshots).
// ---------------------------------------------------------------------------

/**
 * Full fiche upgrade pipeline:
 * 1. Compute diff against current schema
 * 2. AI-fill missing/empty variables
 * 3. Save merged interviewData
 * 4. Regenerate all 8 pillars sequentially
 * 5. Advance phase if fully complete
 */
export async function upgradeFiche(
  strategyId: string,
  userId: string,
): Promise<FicheUpgradeReport> {
  const startTime = Date.now();
  const errors: string[] = [];

  // Load strategy
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: {
      id: true,
      userId: true,
      interviewData: true,
      brandName: true,
    },
  });

  if (!strategy) {
    throw new Error("Strategy not found");
  }

  if (strategy.userId !== userId) {
    throw new Error("Unauthorized — strategy does not belong to this user");
  }

  const existingData =
    (strategy.interviewData as Record<string, string>) ?? {};

  // Step 1: Compute diff
  const diff = computeFicheDiff(existingData);

  const interviewBefore = {
    filled: diff.filledIds.length,
    total: diff.totalSchemaVars,
  };

  console.log(
    `[Fiche Upgrade] Diff: ${diff.missingIds.length} missing, ${diff.emptyIds.length} empty, ${diff.obsoleteIds.length} obsolete, ${diff.filledIds.length} filled / ${diff.totalSchemaVars} total`,
  );

  // Step 2: AI-fill missing/empty variables
  const fillResult = await fillMissingInterviewData(
    strategyId,
    existingData,
    diff,
  );

  if (fillResult.errors.length > 0) {
    errors.push(...fillResult.errors);
  }

  // Step 3: Save merged interviewData
  await db.strategy.update({
    where: { id: strategyId },
    data: { interviewData: fillResult.mergedData },
  });

  const interviewAfter = {
    filled: Object.values(fillResult.mergedData).filter((v) => v?.trim())
      .length,
    total: diff.totalSchemaVars,
  };

  console.log(
    `[Fiche Upgrade] Fill: ${fillResult.filledIds.length} variables filled by AI`,
  );

  // Step 4: Regenerate all 8 pillars
  const regenResult = await regenerateAllPillars(
    strategyId,
    userId,
    fillResult.mergedData,
  );

  if (regenResult.errors.length > 0) {
    errors.push(...regenResult.errors);
  }

  // Step 5: Advance phase if all 8 pillars regenerated
  if (regenResult.regenerated.length === 8) {
    await db.strategy.update({
      where: { id: strategyId },
      data: {
        phase: "complete",
        status: "complete",
        generatedAt: new Date(),
      },
    });
    console.log(
      `[Fiche Upgrade] All 8 pillars complete — strategy marked as complete`,
    );
  }

  // Determine which variables were truly added vs updated
  const variablesAdded = fillResult.filledIds.filter((id) =>
    diff.missingIds.includes(id),
  );
  const variablesUpdated = fillResult.filledIds.filter((id) =>
    diff.emptyIds.includes(id),
  );

  const report: FicheUpgradeReport = {
    strategyId,
    variablesAdded,
    variablesUpdated,
    variablesObsolete: diff.obsoleteIds,
    interviewBefore,
    interviewAfter,
    pillarsRegenerated: regenResult.regenerated,
    errors,
    durationMs: Date.now() - startTime,
  };

  console.log(
    `[Fiche Upgrade] Complete in ${report.durationMs}ms — ${report.pillarsRegenerated.length}/8 pillars, ${report.variablesAdded.length} added, ${report.variablesUpdated.length} updated`,
  );

  return report;
}

// ---------------------------------------------------------------------------
// 10.H  Helpers — Internal utility functions
// ---------------------------------------------------------------------------

/**
 * Build ficheContent (A-D-V-E) from freshly regenerated in-memory content.
 */
function buildFicheContentFromFresh(
  freshContent: Map<string, unknown>,
): Array<{ type: string; content: string }> {
  return ["A", "D", "V", "E"]
    .filter((pt) => freshContent.has(pt))
    .map((pt) => {
      const content = freshContent.get(pt);
      return {
        type: pt,
        content:
          typeof content === "string"
            ? content
            : JSON.stringify(content ?? ""),
      };
    });
}

/**
 * Extract a meaningful summary string from pillar content.
 * Same logic as route.ts dispatch.
 */
function buildPillarSummary(
  pillarType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any,
): string {
  try {
    if (pillarType === "R") {
      return `Score de risque : ${content.riskScore ?? "?"}/100 — ${content.microSwots?.length ?? 0} micro-SWOTs. ${content.summary ?? ""}`;
    }
    if (pillarType === "T") {
      return `Brand-Market Fit : ${content.brandMarketFitScore ?? "?"}/100 — TAM: ${content.tamSamSom?.tam?.value ?? "?"}. ${content.summary ?? ""}`;
    }
    if (pillarType === "I") {
      return `Score de coherence : ${content.coherenceScore ?? "?"}/100. ${(content.executiveSummary ?? "").substring(0, 200)}`;
    }
    if (pillarType === "S") {
      return `Score coherence : ${content.scoreCoherence ?? "?"}/100. ${(content.syntheseExecutive ?? "").substring(0, 200)}`;
    }
    // A, D, V, E
    const obj = content as Record<string, unknown>;
    if (
      pillarType === "A" &&
      typeof obj.identite === "object" &&
      obj.identite !== null
    ) {
      const identite = obj.identite as Record<string, string>;
      return `Archetype : ${identite.archetype ?? "—"}. ${identite.noyauIdentitaire ?? ""}`;
    }
    if (pillarType === "D" && typeof obj.positionnement === "string") {
      return obj.positionnement;
    }
    if (
      pillarType === "V" &&
      typeof obj.unitEconomics === "object" &&
      obj.unitEconomics !== null
    ) {
      const ue = obj.unitEconomics as Record<string, string>;
      return `CAC: ${ue.cac ?? "—"}, LTV: ${ue.ltv ?? "—"}, Ratio: ${ue.ratio ?? "—"}`;
    }
    if (
      pillarType === "E" &&
      typeof obj.aarrr === "object" &&
      obj.aarrr !== null
    ) {
      const aarrr = obj.aarrr as Record<string, string>;
      return `Acquisition: ${aarrr.acquisition?.substring(0, 100) ?? "—"}`;
    }
    return JSON.stringify(content).substring(0, 300);
  } catch {
    return "";
  }
}
