// =============================================================================
// SERVICE S.ORCH — Pipeline Orchestrator
// =============================================================================
// Centralises ALL pipeline phase-transition logic in one place.
// Before this service, phase advancement was scattered across:
//   - /api/ai/generate (hard-coded if/else per pillar type)
//   - strategy.ts tRPC router (advancePhase, validateFicheReview, validateAuditReview)
//   - generate/page.tsx client callbacks (handleValidateFiche → auto-launch R)
//
// Now the single source of truth for "what happens after X" lives here.
// =============================================================================

import { db } from "~/server/db";
import { PHASES, SKIPPABLE_PHASES, LEGACY_PHASE_MAP } from "~/lib/constants";
import type { Phase } from "~/lib/constants";
import { recalculateAllScores } from "./score-engine";
import { computeAllWidgets } from "./widgets/compute-engine";
import { clearPillarStaleness } from "./stale-detector";
import { syncTrackToMarketContext } from "./track-sync";
import { extractVariablesFromPillar } from "./variable-extractor";
import type { TrackAuditResult } from "./audit-generation";
import type { ImplementationData } from "~/lib/types/implementation-data";

// ---------------------------------------------------------------------------
// Phase transition map — pillar type → phase to set after generation
// ---------------------------------------------------------------------------

const POST_GENERATION_PHASE: Partial<Record<string, Phase>> = {
  R: "market-study",
  T: "audit-review",
  I: "cockpit",
  S: "complete",
  // A, D, V, E → no auto-advance (client calls advancePhase manually)
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Called after a pillar is successfully generated and saved to the DB.
 * Handles everything that should happen post-generation:
 *   1. Advance phase (CRITICAL — done first, never fire-and-forget)
 *   2. Clear staleness flag
 *   3. Recalculate strategy scores
 *   4. Run pillar-specific side-effects
 *   5. Check legacy "all complete" flag
 *   6. Auto-compute cockpit widgets
 *
 * Phase advancement is the most important step and runs first.
 * All other side-effects are isolated so a failure in one doesn't
 * block the pipeline progression.
 */
export async function onPillarGenerated(
  strategyId: string,
  pillarId: string,
  pillarType: string,
  generatedContent: unknown,
): Promise<void> {
  // 1. Phase advancement — CRITICAL, must run first and succeed
  const nextPhase = POST_GENERATION_PHASE[pillarType];
  if (nextPhase) {
    try {
      await db.strategy.update({
        where: { id: strategyId },
        data: {
          phase: nextPhase,
          status: nextPhase === "complete" ? "complete" : "generating",
        },
      });
    } catch (error) {
      console.error(
        `[PipelineOrchestrator] CRITICAL: Phase advancement to "${nextPhase}" failed for strategy ${strategyId}:`,
        error,
      );
      // Re-throw — phase advancement failure is critical
      throw error;
    }
  }

  // --- Below this point, all operations are non-critical side-effects ---
  // Each is wrapped in its own try/catch so a failure in one doesn't
  // crash the orchestration or prevent the "complete" event from sending.

  // 2. Clear staleness
  try {
    void clearPillarStaleness(pillarId);
  } catch (error) {
    console.error("[PipelineOrchestrator] clearPillarStaleness failed:", error);
  }

  // 3. Recalculate scores (fire-and-forget)
  try {
    void recalculateAllScores(strategyId, "generation");
  } catch (error) {
    console.error("[PipelineOrchestrator] recalculateAllScores failed:", error);
  }

  // 3b. Extract BrandVariables from generated content (fire-and-forget)
  try {
    void extractVariablesFromPillar(strategyId, pillarType, generatedContent, "system");
  } catch (error) {
    console.error("[PipelineOrchestrator] extractVariablesFromPillar failed:", error);
  }

  // 4. Pillar-specific side-effects
  try {
    if (pillarType === "T") {
      void syncTrackToMarketContext(
        strategyId,
        generatedContent as TrackAuditResult,
      );
    }

    if (pillarType === "I") {
      await seedBudgetTiersIfNeeded(strategyId, generatedContent);
    }
  } catch (error) {
    console.error("[PipelineOrchestrator] Pillar-specific side-effects failed:", error);
  }

  // 5. Legacy: mark strategy complete if every pillar is done
  try {
    const allPillars = await db.pillar.findMany({
      where: { strategyId },
      select: { status: true },
    });

    if (allPillars.every((p) => p.status === "complete")) {
      await db.strategy.update({
        where: { id: strategyId },
        data: { status: "complete", generatedAt: new Date() },
      });
    }
  } catch (error) {
    console.error("[PipelineOrchestrator] Legacy completion check failed:", error);
  }

  // 6. Auto-compute cockpit widgets (fire-and-forget)
  try {
    void computeAllWidgets(strategyId);
  } catch (error) {
    console.error("[PipelineOrchestrator] computeAllWidgets failed:", error);
  }
}

// ---------------------------------------------------------------------------
// Phase transition validation
// ---------------------------------------------------------------------------

/**
 * Resolve legacy phase names (e.g. "audit" → "audit-r").
 */
export function resolvePhase(raw: string): Phase {
  return (LEGACY_PHASE_MAP[raw] ?? raw) as Phase;
}

/**
 * Validate a forward phase transition.
 * Allows skipping over SKIPPABLE_PHASES (market-study).
 */
export function validatePhaseTransition(
  currentPhaseRaw: string,
  targetPhase: Phase,
): { valid: boolean; error?: string } {
  const currentPhase = resolvePhase(currentPhaseRaw);
  const currentIndex = PHASES.indexOf(currentPhase);
  const targetIndex = PHASES.indexOf(targetPhase);

  if (currentIndex === -1) {
    return {
      valid: false,
      error: `Phase actuelle inconnue : "${currentPhaseRaw}"`,
    };
  }

  if (targetIndex <= currentIndex) {
    return {
      valid: false,
      error: `Impossible d'avancer à la phase "${targetPhase}" depuis "${currentPhase}"`,
    };
  }

  // Allow jumping over skippable phases only
  if (targetIndex > currentIndex + 1) {
    const skipped = PHASES.slice(currentIndex + 1, targetIndex);
    if (!skipped.every((p) => SKIPPABLE_PHASES.includes(p))) {
      return {
        valid: false,
        error: `Impossible de sauter directement à "${targetPhase}". Complétez d'abord la phase en cours.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate a backward phase reversion.
 */
export function validatePhaseReversion(
  currentPhaseRaw: string,
  targetPhase: Phase,
): { valid: boolean; error?: string } {
  const currentPhase = resolvePhase(currentPhaseRaw);
  const currentIndex = PHASES.indexOf(currentPhase);
  const targetIndex = PHASES.indexOf(targetPhase);

  if (currentIndex === -1) {
    return {
      valid: false,
      error: `Phase actuelle inconnue : "${currentPhaseRaw}"`,
    };
  }

  if (targetIndex >= currentIndex) {
    return {
      valid: false,
      error: `Impossible de revenir à "${targetPhase}" — la stratégie est déjà en phase "${currentPhase}" ou antérieure.`,
    };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

async function seedBudgetTiersIfNeeded(
  strategyId: string,
  content: unknown,
): Promise<void> {
  try {
    const existing = await db.budgetTier.count({ where: { strategyId } });
    if (existing > 0) return;

    const strategy = await db.strategy.findUnique({
      where: { id: strategyId },
      select: { brandName: true, sector: true, maturityProfile: true },
    });
    if (!strategy) return;

    // Read annualBudget and targetRevenue (added by Module 12 schema extension)
    const strategyFull = await db.strategy.findUnique({
      where: { id: strategyId },
      select: { annualBudget: true, targetRevenue: true },
    }) as { annualBudget?: number | null; targetRevenue?: number | null } | null;

    const { generateBudgetTiers } = await import("./budget-tier-generator");
    const implData = content as ImplementationData;
    const tiers = await generateBudgetTiers(
      implData,
      strategy.brandName,
      strategy.sector ?? "",
      strategyFull?.annualBudget,
      strategyFull?.targetRevenue,
      strategy.maturityProfile,
    );
    await db.budgetTier.createMany({
      data: tiers.map((t) => ({ strategyId, ...t })),
    });
    console.log(
      `[PipelineOrchestrator] Seeded ${tiers.length} budget tiers for ${strategyId}`,
    );
  } catch (error) {
    // Non-critical: log but don't fail
    console.error(
      "[PipelineOrchestrator] Failed to seed budget tiers:",
      error,
    );
  }
}
