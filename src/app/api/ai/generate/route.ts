// =============================================================================
// ROUTE R.1 — AI Generation (Streaming NDJSON)
// =============================================================================
// POST  /api/ai/generate
// Phase-aware pillar generation dispatch with real-time progress streaming.
// Returns NDJSON (newline-delimited JSON) events:
//   {"event":"progress","step":"prepare|context|generate|save|finalize","message":"..."}
//   {"event":"complete","success":true,"pillar":{...}}
//   {"event":"error","error":"..."}
//
// Routes to the correct AI service based on pillar type:
//   - A, D, V, E  -> generatePillarContent (ai-generation.ts)
//   - R            -> generateRiskAudit (audit-generation.ts)
//   - T            -> generateTrackAudit (audit-generation.ts)
//   - I            -> generateImplementationData (implementation-generation.ts)
//   - S            -> generateSyntheseContent (ai-generation.ts)
// Auth:         Session required (ownership verified against strategy.userId)
// maxDuration:  120s (Vercel serverless)
// =============================================================================

import { type NextRequest } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { checkAiRateLimit } from "~/server/services/rate-limiter";
import { generatePillarContent, generateSyntheseContent } from "~/server/services/ai-generation";
import type { AIUsageMetadata } from "~/server/services/ai-generation";
import {
  generateRiskAudit,
  generateTrackAudit,
} from "~/server/services/audit-generation";
import { generateImplementationData } from "~/server/services/implementation-generation";
import { trackAICall } from "~/server/services/ai-cost-tracker";
import { syncTrackToMarketContext } from "~/server/services/track-sync";
import { onPillarGenerated } from "~/server/services/pipeline-orchestrator";
import { PILLAR_TYPES, DEFAULT_PHASE_MODELS } from "~/lib/constants";
import type { SupportedCurrency, Phase } from "~/lib/constants";
import { DEFAULT_MODEL } from "~/server/services/anthropic-client";
import type { RiskAuditResult, TrackAuditResult } from "~/server/services/audit-generation";
import type { MarketStudySynthesis } from "~/lib/types/market-study";
import { parsePillarContent } from "~/lib/types/pillar-parsers";

// Allow up to 2 minutes for AI generation (Vercel serverless timeout)
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // ---------------------------------------------------------------------------
  // 1. Auth check (before streaming — need to return proper HTTP status)
  // ---------------------------------------------------------------------------
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---------------------------------------------------------------------------
  // 1b. Rate limit check
  // ---------------------------------------------------------------------------
  const rateLimit = checkAiRateLimit(session.user.id);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: rateLimit.error },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.retryAfterMs ?? 60000) / 1000)),
        },
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Parse and validate body
  // ---------------------------------------------------------------------------
  let body: { strategyId: string; pillarType: string };
  try {
    body = (await req.json()) as { strategyId: string; pillarType: string };
  } catch {
    return Response.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { strategyId, pillarType } = body;

  if (!strategyId || !pillarType) {
    return Response.json(
      { error: "strategyId and pillarType are required" },
      { status: 400 },
    );
  }

  if (!PILLAR_TYPES.includes(pillarType as (typeof PILLAR_TYPES)[number])) {
    return Response.json(
      { error: `Invalid pillarType: ${pillarType}` },
      { status: 400 },
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Stream the generation with real-time progress events
  // ---------------------------------------------------------------------------
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Helper: send an NDJSON event
      const send = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        } catch {
          // Stream already closed (client disconnected) — ignore
        }
      };

      // Helper: send a progress event
      const progress = (step: string, message: string) => {
        send({ event: "progress", step, message });
      };

      try {
        // ── Step 1: Fetch strategy ──
        progress("prepare", "Vérification de la stratégie…");

        const strategy = await db.strategy.findUnique({
          where: { id: strategyId },
          include: {
            pillars: { orderBy: { order: "asc" } },
          },
        });

        if (!strategy || strategy.userId !== session.user.id) {
          send({ event: "error", error: "Strategy not found" });
          controller.close();
          return;
        }

        const currency = ((strategy as Record<string, unknown>).currency ?? "XOF") as SupportedCurrency;

        // Resolve AI model for this pillar type
        const PILLAR_TO_PHASE: Record<string, Phase> = {
          A: "fiche", D: "fiche", V: "fiche", E: "fiche",
          R: "audit-r", T: "audit-t", I: "implementation", S: "cockpit",
        };
        const phase = PILLAR_TO_PHASE[pillarType] ?? "fiche";
        const userModelConfig = (strategy.modelConfig as Record<string, string> | null) ?? {};
        const modelOverride = userModelConfig[phase] ?? DEFAULT_PHASE_MODELS[phase] ?? DEFAULT_MODEL;

        const targetPillar = strategy.pillars.find((p) => p.type === pillarType);
        if (!targetPillar) {
          send({ event: "error", error: `Pillar ${pillarType} not found in strategy` });
          controller.close();
          return;
        }

        // ── Step 2: Mark as generating + gather context ──
        progress("context", "Collecte du contexte stratégique…");

        await db.pillar.update({
          where: { id: targetPillar.id },
          data: { status: "generating", errorMessage: null },
        });

        const interviewData =
          (strategy.interviewData as Record<string, string>) ?? {};

        const previousPillars = strategy.pillars
          .filter((p) => p.status === "complete" && p.order < targetPillar.order)
          .map((p) => ({
            type: p.type,
            content:
              typeof p.content === "string"
                ? p.content
                : JSON.stringify(p.content ?? ""),
          }));

        // ── Step 3: AI generation ──
        progress("generate", "Génération IA en cours…");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let generatedContent: any;
        let summary: string;
        let usageData: AIUsageMetadata | null = null;

        if (pillarType === "R") {
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

          progress("generate", "Analyse des risques SWOT en cours…");

          const { data: riskResult, usage: riskUsage } = await generateRiskAudit(
            interviewData,
            ficheContent,
            strategy.brandName,
            strategy.sector ?? "",
            { vertical: strategy.vertical, maturityProfile: strategy.maturityProfile },
            strategy.tagline,
            currency,
            modelOverride,
          );

          generatedContent = riskResult;
          usageData = riskUsage;
          summary = `Score de risque : ${riskResult.riskScore}/100 — ${riskResult.microSwots.length} micro-SWOTs analysés. ${riskResult.summary}`;
        } else if (pillarType === "T") {
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

          const riskPillar = strategy.pillars.find(
            (p) => p.type === "R" && p.status === "complete",
          );
          const { data: riskResults } = parsePillarContent<RiskAuditResult>("R", riskPillar?.content);

          const marketStudy = await db.marketStudy.findUnique({
            where: { strategyId },
            select: { synthesis: true, status: true },
          });
          const marketStudyData = marketStudy?.synthesis
            ? (marketStudy.synthesis as unknown as MarketStudySynthesis)
            : null;

          progress("generate", "Analyse Brand-Market Fit + TAM/SAM/SOM…");

          const { data: trackResult, usage: trackUsageData } = await generateTrackAudit(
            interviewData,
            ficheContent,
            riskResults,
            strategy.brandName,
            strategy.sector ?? "",
            marketStudyData,
            { vertical: strategy.vertical, maturityProfile: strategy.maturityProfile },
            strategy.tagline,
            currency,
            modelOverride,
          );

          generatedContent = trackResult;
          usageData = trackUsageData;
          summary = `Brand-Market Fit : ${trackResult.brandMarketFitScore}/100 — TAM: ${trackResult.tamSamSom.tam.value}. ${trackResult.summary}`;

          void syncTrackToMarketContext(strategyId, trackResult);
        } else if (pillarType === "I") {
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

          const riskPillar = strategy.pillars.find(
            (p) => p.type === "R" && p.status === "complete",
          );
          const trackPillar = strategy.pillars.find(
            (p) => p.type === "T" && p.status === "complete",
          );

          const { data: riskResults } = parsePillarContent<RiskAuditResult>("R", riskPillar?.content);
          const { data: trackResults } = parsePillarContent<TrackAuditResult>("T", trackPillar?.content);

          progress("generate", "Génération des données d'implémentation cockpit…");

          const { data: implResult, usage: implUsage } = await generateImplementationData(
            interviewData,
            riskResults,
            trackResults,
            ficheContent,
            strategy.brandName,
            strategy.sector ?? "",
            { vertical: strategy.vertical, maturityProfile: strategy.maturityProfile },
            strategy.tagline,
            currency,
            (strategy as Record<string, unknown>).annualBudget as number | null ?? null,
            (strategy as Record<string, unknown>).targetRevenue as number | null ?? null,
            strategy.maturityProfile,
            modelOverride,
          );

          generatedContent = implResult;
          usageData = implUsage;
          summary = `Score de cohérence : ${implResult.coherenceScore}/100. ${implResult.executiveSummary.substring(0, 200)}`;
        } else if (pillarType === "S") {
          const allCompletedPillars = strategy.pillars
            .filter((p) => p.status === "complete" && p.type !== "S")
            .map((p) => ({
              type: p.type,
              content:
                typeof p.content === "string"
                  ? p.content
                  : JSON.stringify(p.content ?? ""),
            }));

          progress("generate", "Synthèse stratégique cross-piliers…");

          const { data: syntheseResult, usage: syntheseUsage } = await generateSyntheseContent(
            interviewData,
            allCompletedPillars,
            strategy.brandName,
            strategy.sector ?? "",
            { vertical: strategy.vertical ?? undefined, maturityProfile: strategy.maturityProfile ?? undefined },
            strategy.tagline,
            currency,
            modelOverride,
          );

          generatedContent = syntheseResult;
          usageData = syntheseUsage;
          summary = `Score cohérence : ${syntheseResult.scoreCoherence}/100. ${syntheseResult.syntheseExecutive.substring(0, 200)}`;
        } else {
          progress("generate", `Génération du pilier ${pillarType}…`);

          const { data: jsonContent, usage: pillarUsage } = await generatePillarContent(
            pillarType,
            interviewData,
            previousPillars,
            strategy.brandName,
            strategy.sector ?? "",
            { vertical: strategy.vertical ?? undefined, maturityProfile: strategy.maturityProfile ?? undefined },
            strategy.tagline,
            currency,
            modelOverride,
          );

          generatedContent = jsonContent;
          usageData = pillarUsage;

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

        // ── Step 4: Save to database ──
        progress("save", "Sauvegarde du contenu généré…");

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

        // ── Step 4b: Track AI cost ──
        if (usageData) {
          await trackAICall({
            model: usageData.model,
            tokensIn: usageData.tokensIn,
            tokensOut: usageData.tokensOut,
            generationType: `pillar-${pillarType}`,
            strategyId,
            durationMs: usageData.durationMs,
            metadata: { pillarType, brandName: strategy.brandName },
          }, session.user.id).catch(console.error);
        }

        // ── Step 5: Post-generation orchestration ──
        progress("finalize", "Calcul des scores et orchestration…");

        await onPillarGenerated(strategyId, targetPillar.id, pillarType, generatedContent);

        // ── Done ──
        send({
          event: "complete",
          success: true,
          pillar: {
            id: updatedPillar.id,
            type: updatedPillar.type,
            status: updatedPillar.status,
            content: updatedPillar.content,
          },
        });
        controller.close();
      } catch (error) {
        // ---------------------------------------------------------------------------
        // Error handling
        // ---------------------------------------------------------------------------
        console.error(
          `[AI Generation] Error generating pillar ${pillarType}:`,
          error,
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error during generation";

        // Try to mark pillar as errored in DB
        try {
          const strategy = await db.strategy.findUnique({
            where: { id: strategyId },
            include: { pillars: true },
          });
          const targetPillar = strategy?.pillars.find((p) => p.type === pillarType);
          if (targetPillar) {
            await db.pillar.update({
              where: { id: targetPillar.id },
              data: { status: "error", errorMessage },
            });
          }
        } catch {
          // Best effort — don't mask original error
        }

        send({ event: "error", error: errorMessage });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
