// ADVERTIS AI Generation API Route
// POST /api/ai/generate
// Phase-aware generation: dispatches to the correct service based on pillar type.
//   - A, D, V, E → generatePillarContent (ai-generation.ts) — standard content
//   - R → generateRiskAudit (audit-generation.ts) — micro-SWOTs + global SWOT
//   - T → generateTrackAudit (audit-generation.ts) — market validation + TAM/SAM/SOM
//   - I → generateImplementationData (implementation-generation.ts) — structured cockpit data
//   - S → reserved for future milestones (cockpit)

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { generatePillarContent } from "~/server/services/ai-generation";
import {
  generateRiskAudit,
  generateTrackAudit,
} from "~/server/services/audit-generation";
import { generateImplementationData } from "~/server/services/implementation-generation";
import { PILLAR_TYPES } from "~/lib/constants";
import type { RiskAuditResult, TrackAuditResult } from "~/server/services/audit-generation";
import type { MarketStudySynthesis } from "~/lib/types/market-study";

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
      );

      generatedContent = JSON.parse(JSON.stringify(riskResult));
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
      const riskResults: RiskAuditResult = riskPillar?.content
        ? (riskPillar.content as unknown as RiskAuditResult)
        : {
            microSwots: [],
            globalSwot: {
              strengths: [],
              weaknesses: [],
              opportunities: [],
              threats: [],
            },
            riskScore: 50,
            riskScoreJustification: "Audit R non disponible",
            probabilityImpactMatrix: [],
            mitigationPriorities: [],
            summary: "",
          };

      // Load market study synthesis if available (enriches Track with real data)
      const marketStudy = await db.marketStudy.findUnique({
        where: { strategyId },
        select: { synthesis: true, status: true },
      });
      const marketStudyData =
        marketStudy?.status === "complete" && marketStudy.synthesis
          ? (marketStudy.synthesis as unknown as MarketStudySynthesis)
          : null;

      const trackResult = await generateTrackAudit(
        interviewData,
        ficheContent,
        riskResults,
        strategy.brandName,
        strategy.sector ?? "",
        marketStudyData,
      );

      generatedContent = JSON.parse(JSON.stringify(trackResult));
      summary = `Brand-Market Fit : ${trackResult.brandMarketFitScore}/100 — TAM: ${trackResult.tamSamSom.tam.value}. ${trackResult.summary}`;
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

      const riskResults: RiskAuditResult = riskPillar?.content
        ? (riskPillar.content as unknown as RiskAuditResult)
        : {
            microSwots: [],
            globalSwot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
            riskScore: 50,
            riskScoreJustification: "Audit R non disponible",
            probabilityImpactMatrix: [],
            mitigationPriorities: [],
            summary: "",
          };

      const trackResults: TrackAuditResult = trackPillar?.content
        ? (trackPillar.content as unknown as TrackAuditResult)
        : {
            triangulation: { internalData: "", marketData: "", customerData: "", synthesis: "" },
            hypothesisValidation: [],
            marketReality: { macroTrends: [], weakSignals: [], emergingPatterns: [] },
            tamSamSom: {
              tam: { value: "", description: "" },
              sam: { value: "", description: "" },
              som: { value: "", description: "" },
              methodology: "",
            },
            competitiveBenchmark: [],
            brandMarketFitScore: 50,
            brandMarketFitJustification: "Audit T non disponible",
            strategicRecommendations: [],
            summary: "",
          };

      const implResult = await generateImplementationData(
        interviewData,
        riskResults,
        trackResults,
        ficheContent,
        strategy.brandName,
        strategy.sector ?? "",
      );

      generatedContent = JSON.parse(JSON.stringify(implResult));
      summary = `Score de cohérence : ${implResult.coherenceScore}/100. ${implResult.executiveSummary.substring(0, 200)}`;
    } else {
      // ── STANDARD PILLAR (A, D, V, E, S) ──
      const textContent = await generatePillarContent(
        pillarType,
        interviewData,
        previousPillars,
        strategy.brandName,
        strategy.sector ?? "",
      );

      generatedContent = textContent;
      summary = textContent.substring(0, 300);
    }

    // ---------------------------------------------------------------------------
    // 8. Save generated content and mark as complete
    // ---------------------------------------------------------------------------
    const updatedPillar = await db.pillar.update({
      where: { id: targetPillar.id },
      data: {
        content: generatedContent,
        status: "complete",
        generatedAt: new Date(),
        errorMessage: null,
        summary: summary.substring(0, 500),
      },
    });

    // ---------------------------------------------------------------------------
    // 9. Phase advancement logic (new 9-phase pipeline)
    // ---------------------------------------------------------------------------
    // R complete → advance to market-study
    if (pillarType === "R") {
      await db.strategy.update({
        where: { id: strategyId },
        data: { phase: "market-study", status: "generating" },
      });
    }

    // T complete → advance to audit-review
    if (pillarType === "T") {
      await db.strategy.update({
        where: { id: strategyId },
        data: { phase: "audit-review", status: "generating" },
      });
    }

    // I complete → advance to cockpit
    if (pillarType === "I") {
      await db.strategy.update({
        where: { id: strategyId },
        data: { phase: "cockpit", status: "generating" },
      });
    }

    // Check if all pillars are now complete (legacy + new flow)
    const allPillars = await db.pillar.findMany({
      where: { strategyId },
      select: { status: true },
    });

    const allComplete = allPillars.every((p) => p.status === "complete");

    if (allComplete) {
      await db.strategy.update({
        where: { id: strategyId },
        data: {
          status: "complete",
          generatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      pillar: {
        id: updatedPillar.id,
        type: updatedPillar.type,
        status: updatedPillar.status,
        content: updatedPillar.content,
      },
      allComplete,
    });
  } catch (error) {
    // ---------------------------------------------------------------------------
    // 10. Handle errors
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
