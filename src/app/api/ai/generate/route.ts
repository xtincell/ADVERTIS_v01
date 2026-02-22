// =============================================================================
// ROUTE R.1 — AI Generation
// =============================================================================
// POST  /api/ai/generate
// Phase-aware pillar generation dispatch. Routes to the correct AI service
// based on pillar type:
//   - A, D, V, E  -> generatePillarContent (ai-generation.ts) — structured JSON
//   - R            -> generateRiskAudit (audit-generation.ts) — micro-SWOTs + global SWOT
//   - T            -> generateTrackAudit (audit-generation.ts) — market validation + TAM/SAM/SOM
//   - I            -> generateImplementationData (implementation-generation.ts) — cockpit data
//   - S            -> generateSyntheseContent (ai-generation.ts) — strategic synthesis
// Auth:         Session required (ownership verified against strategy.userId)
// Dependencies: ai-generation, audit-generation, implementation-generation,
//               track-sync, pipeline-orchestrator, pillar-parsers
// maxDuration:  120s (Vercel serverless)
// =============================================================================

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { generatePillarContent, generateSyntheseContent } from "~/server/services/ai-generation";
import {
  generateRiskAudit,
  generateTrackAudit,
} from "~/server/services/audit-generation";
import { generateImplementationData } from "~/server/services/implementation-generation";
import { syncTrackToMarketContext } from "~/server/services/track-sync";
import { onPillarGenerated } from "~/server/services/pipeline-orchestrator";
import { PILLAR_TYPES } from "~/lib/constants";
import type { RiskAuditResult, TrackAuditResult } from "~/server/services/audit-generation";
import type { MarketStudySynthesis } from "~/lib/types/market-study";
import { parsePillarContent } from "~/lib/types/pillar-parsers";

// Allow up to 2 minutes for AI generation (Vercel serverless timeout)
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // ---------------------------------------------------------------------------
  // 1. Auth check
  // ---------------------------------------------------------------------------
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---------------------------------------------------------------------------
  // 2. Parse and validate body
  // ---------------------------------------------------------------------------
  let body: { strategyId: string; pillarType: string };
  try {
    body = (await req.json()) as { strategyId: string; pillarType: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { strategyId, pillarType } = body;

  if (!strategyId || !pillarType) {
    return NextResponse.json(
      { error: "strategyId and pillarType are required" },
      { status: 400 },
    );
  }

  if (!PILLAR_TYPES.includes(pillarType as (typeof PILLAR_TYPES)[number])) {
    return NextResponse.json(
      { error: `Invalid pillarType: ${pillarType}` },
      { status: 400 },
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Fetch strategy and verify ownership
  // ---------------------------------------------------------------------------
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: {
      pillars: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!strategy || strategy.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Strategy not found" },
      { status: 404 },
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Find the target pillar
  // ---------------------------------------------------------------------------
  const targetPillar = strategy.pillars.find((p) => p.type === pillarType);

  if (!targetPillar) {
    return NextResponse.json(
      { error: `Pillar ${pillarType} not found in strategy` },
      { status: 404 },
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Mark pillar as generating
  // ---------------------------------------------------------------------------
  await db.pillar.update({
    where: { id: targetPillar.id },
    data: { status: "generating", errorMessage: null },
  });

  // ---------------------------------------------------------------------------
  // 6. Gather context: interview data + already generated pillars
  // ---------------------------------------------------------------------------
  const interviewData =
    (strategy.interviewData as Record<string, string>) ?? {};

  // Collect previously completed pillars for cascade context
  const previousPillars = strategy.pillars
    .filter((p) => p.status === "complete" && p.order < targetPillar.order)
    .map((p) => ({
      type: p.type,
      content:
        typeof p.content === "string"
          ? p.content
          : JSON.stringify(p.content ?? ""),
    }));

  // ---------------------------------------------------------------------------
  // 7. Generate content — phase-aware dispatch
  // ---------------------------------------------------------------------------
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let generatedContent: any;
    let summary: string;

    if (pillarType === "R") {
      // ── RISK AUDIT ──
      // Requires A-E fiche content for micro-SWOT analysis
      const ficheContent = strategy.pillars
        .filter(
          (p) =>
            ["A", "D", "V", "E"].includes(p.type) && p.status === "complete",
        )
        .map((p) => ({
          type: p.type,
          content:
            typeof p.content === "string"
              ? p.content
              : JSON.stringify(p.content ?? ""),
        }));

      const riskResult = await generateRiskAudit(
        interviewData,
        ficheContent,
        strategy.brandName,
        strategy.sector ?? "",
        { vertical: strategy.vertical, maturityProfile: strategy.maturityProfile },
        strategy.tagline,
      );

      generatedContent = riskResult;
      summary = `Score de risque : ${riskResult.riskScore}/100 — ${riskResult.microSwots.length} micro-SWOTs analysés. ${riskResult.summary}`;
    } else if (pillarType === "T") {
      // ── TRACK AUDIT ──
      // Requires A-E fiche content + R (risk) results
      const ficheContent = strategy.pillars
        .filter(
          (p) =>
            ["A", "D", "V", "E"].includes(p.type) && p.status === "complete",
        )
        .map((p) => ({
          type: p.type,
          content:
            typeof p.content === "string"
              ? p.content
              : JSON.stringify(p.content ?? ""),
        }));

      // Get Risk audit results for cross-reference
      const riskPillar = strategy.pillars.find(
        (p) => p.type === "R" && p.status === "complete",
      );
      const { data: riskResults } = parsePillarContent<RiskAuditResult>("R", riskPillar?.content);

      // Load market study synthesis if available (enriches Track with real data)
      // Accept any synthesis — even partial or AI-estimated — to enrich Track
      const marketStudy = await db.marketStudy.findUnique({
        where: { strategyId },
        select: { synthesis: true, status: true },
      });
      const marketStudyData = marketStudy?.synthesis
        ? (marketStudy.synthesis as unknown as MarketStudySynthesis)
        : null;

      const trackResult = await generateTrackAudit(
        interviewData,
        ficheContent,
        riskResults,
        strategy.brandName,
        strategy.sector ?? "",
        marketStudyData,
        { vertical: strategy.vertical, maturityProfile: strategy.maturityProfile },
        strategy.tagline,
      );

      generatedContent = trackResult;
      summary = `Brand-Market Fit : ${trackResult.brandMarketFitScore}/100 — TAM: ${trackResult.tamSamSom.tam.value}. ${trackResult.summary}`;

      // Auto-sync competitor snapshots + opportunity calendar from Track data
      void syncTrackToMarketContext(strategyId, trackResult);
    } else if (pillarType === "I") {
      // ── IMPLEMENTATION DATA ──
      // Requires validated A-E fiche content + R+T audit results
      const ficheContent = strategy.pillars
        .filter(
          (p) =>
            ["A", "D", "V", "E"].includes(p.type) && p.status === "complete",
        )
        .map((p) => ({
          type: p.type,
          content:
            typeof p.content === "string"
              ? p.content
              : JSON.stringify(p.content ?? ""),
        }));

      // Get validated R+T audit results
      const riskPillar = strategy.pillars.find(
        (p) => p.type === "R" && p.status === "complete",
      );
      const trackPillar = strategy.pillars.find(
        (p) => p.type === "T" && p.status === "complete",
      );

      const { data: riskResults } = parsePillarContent<RiskAuditResult>("R", riskPillar?.content);
      const { data: trackResults } = parsePillarContent<TrackAuditResult>("T", trackPillar?.content);

      const implResult = await generateImplementationData(
        interviewData,
        riskResults,
        trackResults,
        ficheContent,
        strategy.brandName,
        strategy.sector ?? "",
        { vertical: strategy.vertical, maturityProfile: strategy.maturityProfile },
        strategy.tagline,
      );

      generatedContent = implResult;
      summary = `Score de cohérence : ${implResult.coherenceScore}/100. ${implResult.executiveSummary.substring(0, 200)}`;
    } else if (pillarType === "S") {
      // ── SYNTHÈSE STRATÉGIQUE (Pillar S) ──
      // Requires ALL completed pillars for cross-referencing
      const allCompletedPillars = strategy.pillars
        .filter((p) => p.status === "complete" && p.type !== "S")
        .map((p) => ({
          type: p.type,
          content:
            typeof p.content === "string"
              ? p.content
              : JSON.stringify(p.content ?? ""),
        }));

      const syntheseResult = await generateSyntheseContent(
        interviewData,
        allCompletedPillars,
        strategy.brandName,
        strategy.sector ?? "",
        { vertical: strategy.vertical ?? undefined, maturityProfile: strategy.maturityProfile ?? undefined },
        strategy.tagline,
      );

      generatedContent = syntheseResult;
      summary = `Score cohérence : ${syntheseResult.scoreCoherence}/100. ${syntheseResult.syntheseExecutive.substring(0, 200)}`;
    } else {
      // ── STANDARD PILLAR (A, D, V, E) — structured JSON ──
      const jsonContent = await generatePillarContent(
        pillarType,
        interviewData,
        previousPillars,
        strategy.brandName,
        strategy.sector ?? "",
        { vertical: strategy.vertical ?? undefined, maturityProfile: strategy.maturityProfile ?? undefined },
        strategy.tagline,
      );

      generatedContent = jsonContent;

      // Extract a meaningful summary from the structured JSON
      const obj = jsonContent as Record<string, unknown>;
      if (pillarType === "A" && typeof obj.identite === "object" && obj.identite !== null) {
        const identite = obj.identite as Record<string, string>;
        summary = `Archétype : ${identite.archetype ?? "—"}. ${identite.noyauIdentitaire ?? ""}`;
      } else if (pillarType === "D" && typeof obj.positionnement === "string") {
        summary = obj.positionnement;
      } else if (pillarType === "V" && typeof obj.unitEconomics === "object" && obj.unitEconomics !== null) {
        const ue = obj.unitEconomics as Record<string, string>;
        summary = `CAC: ${ue.cac ?? "—"}, LTV: ${ue.ltv ?? "—"}, Ratio: ${ue.ratio ?? "—"}`;
      } else if (pillarType === "E" && typeof obj.aarrr === "object" && obj.aarrr !== null) {
        const aarrr = obj.aarrr as Record<string, string>;
        summary = `Acquisition: ${aarrr.acquisition?.substring(0, 100) ?? "—"}`;
      } else {
        summary = JSON.stringify(jsonContent).substring(0, 300);
      }
    }

    // ---------------------------------------------------------------------------
    // 8. Snapshot current content before overwriting (version history)
    // ---------------------------------------------------------------------------
    if (targetPillar.content != null) {
      const source = targetPillar.generatedAt ? "regeneration" : "generation";
      await db.pillarVersion.create({
        data: {
          pillarId: targetPillar.id,
          version: targetPillar.version,
          content: targetPillar.content,
          summary: targetPillar.summary,
          source,
          createdBy: session.user.id,
        },
      });
    }

    // ---------------------------------------------------------------------------
    // 9. Save generated content and mark as complete
    // ---------------------------------------------------------------------------
    const updatedPillar = await db.pillar.update({
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

    // ---------------------------------------------------------------------------
    // 10. Post-generation orchestration (phase advance, scores, widgets, etc.)
    // ---------------------------------------------------------------------------
    await onPillarGenerated(strategyId, targetPillar.id, pillarType, generatedContent);

    return NextResponse.json({
      success: true,
      pillar: {
        id: updatedPillar.id,
        type: updatedPillar.type,
        status: updatedPillar.status,
        content: updatedPillar.content,
      },
    });
  } catch (error) {
    // ---------------------------------------------------------------------------
    // 11. Handle errors
    // ---------------------------------------------------------------------------
    console.error(
      `[AI Generation] Error generating pillar ${pillarType}:`,
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error during generation";

    await db.pillar.update({
      where: { id: targetPillar.id },
      data: {
        status: "error",
        errorMessage,
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        pillar: {
          id: targetPillar.id,
          type: targetPillar.type,
          status: "error",
        },
      },
      { status: 500 },
    );
  }
}
