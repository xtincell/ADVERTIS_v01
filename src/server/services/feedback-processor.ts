// =============================================================================
// MODULE 25 — Feedback Processor
// =============================================================================
// Processes natural language feedback from clients to selectively update
// strategy pillars. Analyzes what changed (budget, country, laws, positioning)
// and triggers regeneration only on impacted pillars.
//
// Public API:
//   1. analyzeFeedback()    — AI-powered analysis of what changed & which pillars are impacted
//   2. applyFeedback()      — Update interviewData + selective pillar regeneration
//
// Dependencies:
//   - ~/server/services/anthropic-client (resilientGenerateText, anthropic, DEFAULT_MODEL)
//   - ~/server/services/ai-generation (generatePillarContent, generateSyntheseContent)
//   - ~/server/services/audit-generation (generateRiskAudit, generateTrackAudit)
//   - ~/server/services/implementation-generation (generateImplementationData)
//   - ~/server/services/ai-cost-tracker (trackAICall)
//   - ~/server/services/pipeline-orchestrator (onPillarGenerated)
//   - ~/server/db
// =============================================================================

import { anthropic, DEFAULT_MODEL, resilientGenerateText } from "./anthropic-client";
import { trackAICall } from "./ai-cost-tracker";
import { generatePillarContent, generateSyntheseContent } from "./ai-generation";
import { generateRiskAudit, generateTrackAudit } from "./audit-generation";
import { generateImplementationData } from "./implementation-generation";
import { onPillarGenerated } from "./pipeline-orchestrator";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type { RiskAuditResult, TrackAuditResult } from "./audit-generation";
import type { MarketStudySynthesis } from "~/lib/types/market-study";
import type { SupportedCurrency } from "~/lib/constants";
import { db } from "~/server/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FeedbackAnalysis {
  impactedPillars: Array<{
    pillar: string;
    reason: string;
    severity: "high" | "medium" | "low";
    sectionsToUpdate: string[];
  }>;
  changesSummary: string;
  interviewDataUpdates: Record<string, string>;
}

const PILLAR_ORDER = ["A", "D", "V", "E", "R", "T", "I", "S"] as const;

// ---------------------------------------------------------------------------
// 1. Analyze Feedback — Determine what changed
// ---------------------------------------------------------------------------

export async function analyzeFeedback(
  strategyId: string,
  feedback: string,
  userId: string,
): Promise<FeedbackAnalysis> {
  // Load strategy context
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: {
      pillars: {
        where: { status: "complete" },
        select: { type: true, summary: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!strategy) throw new Error("Strategy not found");

  const interviewData = (strategy.interviewData as Record<string, string>) ?? {};

  // Build context of existing pillar summaries
  const pillarSummaries = strategy.pillars
    .map((p) => `- Pilier ${p.type}: ${p.summary ?? "Pas de résumé"}`)
    .join("\n");

  // Build context of existing interview data (keys only, not full values for token efficiency)
  const interviewKeys = Object.entries(interviewData)
    .filter(([, v]) => v && String(v).trim().length > 0)
    .map(([k, v]) => `- ${k}: ${String(v).substring(0, 200)}`)
    .join("\n");

  const start = Date.now();
  const result = await resilientGenerateText({
    label: "feedback-analysis",
    model: anthropic(DEFAULT_MODEL),
    system: `Tu es un analyste stratégique expert utilisant la méthodologie ADVERTIS.
Tu analyses un feedback client pour déterminer quels piliers de la stratégie sont impactés par les changements décrits.

Les 8 piliers ADVERTIS :
- A (Authenticité) : ADN de marque, valeurs, archétype, Ikigai, Hero's Journey
- D (Distinction) : Personas, positionnement, promesse, ton de voix, identité visuelle, concurrents
- V (Valeur) : Product ladder, unit economics, CAC/LTV, proposition de valeur
- E (Engagement) : Touchpoints, rituels, communauté, gamification, AARRR, KPIs
- R (Risk) : Micro-SWOTs, SWOT global, score de risque, matrice probabilité/impact, mitigations
- T (Track) : Triangulation, validation hypothèses, TAM/SAM/SOM, benchmark concurrentiel, BMF
- I (Implémentation) : Roadmap, campagnes, budget, équipe, copy strategy, big idea, activation POEM
- S (Synthèse) : Vision stratégique, axes, recommandations, score cohérence, sprint 90j

CONTEXTE DE LA STRATÉGIE :
- Marque : ${strategy.brandName}
- Secteur : ${strategy.sector ?? "Non spécifié"}

PILIERS ACTUELS :
${pillarSummaries}

DONNÉES D'ENTRETIEN ACTUELLES :
${interviewKeys}

INSTRUCTIONS :
1. Analyse le feedback du client
2. Identifie les piliers impactés avec severity (high = doit absolument être régénéré, medium = devrait être mis à jour, low = impact mineur)
3. Détermine quels champs de l'interviewData doivent être mis à jour
4. Si un pilier est impacté, tous les piliers qui en dépendent (ordre : A→D→V→E→R→T→I→S) doivent aussi être marqués

FORMAT JSON OBLIGATOIRE :
{
  "impactedPillars": [
    { "pillar": "V", "reason": "Le budget a changé, impacte le product ladder et unit economics", "severity": "high", "sectionsToUpdate": ["productLadder", "unitEconomics"] }
  ],
  "changesSummary": "Résumé structuré des changements en 2-3 phrases",
  "interviewDataUpdates": {
    "V1": "Nouvelle valeur pour la variable V1",
    "V3": "Nouvelle valeur pour V3"
  }
}

RÈGLES :
- Réponds UNIQUEMENT en JSON valide
- Si le pilier R est impacté, T, I et S le sont aussi (cascade)
- Si A ou D est impacté, potentiellement tous les suivants le sont
- interviewDataUpdates ne contient que les champs à MODIFIER, pas tous les champs
- severity "high" = le pilier est directement touché par le changement
- severity "medium" = le pilier est impacté par effet cascade
- severity "low" = impact mineur, le pilier reste valide mais pourrait être affiné`,
    prompt: `FEEDBACK DU CLIENT :\n"${feedback}"\n\nAnalyse ce feedback et identifie tous les impacts sur la stratégie.`,
    maxOutputTokens: 4000,
    temperature: 0.3,
  });

  // Track cost
  await trackAICall({
    model: DEFAULT_MODEL,
    tokensIn: result.usage?.inputTokens ?? 0,
    tokensOut: result.usage?.outputTokens ?? 0,
    generationType: "feedback-analysis",
    strategyId,
    durationMs: Date.now() - start,
    metadata: { feedbackLength: feedback.length },
  }, userId).catch(console.error);

  // Parse response
  let analysis: FeedbackAnalysis;
  try {
    const text = result.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    analysis = JSON.parse(text) as FeedbackAnalysis;
  } catch {
    throw new Error("L'analyse du feedback a échoué. Veuillez reformuler.");
  }

  // Ensure cascade: if a pillar is high, downstream pillars should be at least medium
  const impactedSet = new Set(analysis.impactedPillars.map((p) => p.pillar));
  let foundHigh = false;
  for (const p of PILLAR_ORDER) {
    if (impactedSet.has(p)) {
      const entry = analysis.impactedPillars.find((e) => e.pillar === p);
      if (entry?.severity === "high") foundHigh = true;
    } else if (foundHigh) {
      // Add cascade entry for downstream pillars that weren't explicitly listed
      const completedPillar = strategy.pillars.find((sp) => sp.type === p);
      if (completedPillar) {
        analysis.impactedPillars.push({
          pillar: p,
          reason: "Impact en cascade suite aux changements des piliers précédents",
          severity: "medium",
          sectionsToUpdate: [],
        });
      }
    }
  }

  // Sort by pillar order
  analysis.impactedPillars.sort(
    (a, b) => PILLAR_ORDER.indexOf(a.pillar as typeof PILLAR_ORDER[number]) - PILLAR_ORDER.indexOf(b.pillar as typeof PILLAR_ORDER[number]),
  );

  return analysis;
}

// ---------------------------------------------------------------------------
// 2. Apply Feedback — Update data + selective regeneration
// ---------------------------------------------------------------------------

export async function applyFeedback(
  strategyId: string,
  feedback: string,
  analysis: FeedbackAnalysis,
  pillarsToRegenerate: string[],
  userId: string,
  onProgress?: (step: string, message: string) => void,
  onPillarUpdated?: (pillar: string) => void,
): Promise<{ updatedPillars: string[] }> {
  const progress = onProgress ?? (() => {});

  // Load full strategy
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: {
      pillars: { orderBy: { order: "asc" } },
    },
  });

  if (!strategy) throw new Error("Strategy not found");
  if (strategy.userId !== userId) throw new Error("Unauthorized");

  const currency = ((strategy as Record<string, unknown>).currency ?? "XOF") as SupportedCurrency;
  const specialization = {
    vertical: strategy.vertical ?? undefined,
    maturityProfile: strategy.maturityProfile ?? undefined,
  };

  // Step 1: Update interviewData
  progress("update-data", "Mise à jour des données d'entretien…");

  const currentInterviewData = (strategy.interviewData as Record<string, string>) ?? {};
  const updatedInterviewData = {
    ...currentInterviewData,
    ...analysis.interviewDataUpdates,
    // Also inject feedback as a context variable
    __lastFeedback: feedback,
    __lastFeedbackDate: new Date().toISOString(),
  };

  await db.strategy.update({
    where: { id: strategyId },
    data: { interviewData: updatedInterviewData },
  });

  // Step 2: Selective pillar regeneration (respecting order)
  const orderedPillars = PILLAR_ORDER.filter((p) => pillarsToRegenerate.includes(p));
  const updatedPillars: string[] = [];

  // Map to store freshly generated content for cascade context
  const freshContent = new Map<string, unknown>();

  // Pre-populate with existing pillar content
  for (const pillar of strategy.pillars) {
    if (pillar.status === "complete" && pillar.content) {
      freshContent.set(pillar.type, pillar.content);
    }
  }

  for (const pillarType of orderedPillars) {
    const targetPillar = strategy.pillars.find((p) => p.type === pillarType);
    if (!targetPillar) continue;

    progress("regenerate", `Régénération du pilier ${pillarType}…`);

    try {
      // Mark as generating
      await db.pillar.update({
        where: { id: targetPillar.id },
        data: { status: "generating", errorMessage: null },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let generatedContent: any;

      if (["A", "D", "V", "E"].includes(pillarType)) {
        const previousPillars = strategy.pillars
          .filter((p) => p.order < targetPillar.order && (freshContent.has(p.type) || p.status === "complete"))
          .map((p) => ({
            type: p.type,
            content: typeof freshContent.get(p.type) === "string"
              ? freshContent.get(p.type) as string
              : JSON.stringify(freshContent.get(p.type) ?? p.content ?? ""),
          }));

        const { data } = await generatePillarContent(
          pillarType, updatedInterviewData, previousPillars,
          strategy.brandName, strategy.sector ?? "",
          specialization, strategy.tagline, currency,
        );
        generatedContent = data;
      } else if (pillarType === "R") {
        const ficheContent = ["A", "D", "V", "E"]
          .filter((t) => freshContent.has(t))
          .map((t) => ({
            type: t,
            content: typeof freshContent.get(t) === "string"
              ? freshContent.get(t) as string
              : JSON.stringify(freshContent.get(t) ?? ""),
          }));

        const { data } = await generateRiskAudit(
          updatedInterviewData, ficheContent,
          strategy.brandName, strategy.sector ?? "",
          specialization, strategy.tagline, currency,
        );
        generatedContent = data;
      } else if (pillarType === "T") {
        const ficheContent = ["A", "D", "V", "E"]
          .filter((t) => freshContent.has(t))
          .map((t) => ({
            type: t,
            content: typeof freshContent.get(t) === "string"
              ? freshContent.get(t) as string
              : JSON.stringify(freshContent.get(t) ?? ""),
          }));

        const riskData = freshContent.get("R");
        const { data: riskResults } = parsePillarContent<RiskAuditResult>("R", riskData ?? null);

        const marketStudy = await db.marketStudy.findUnique({
          where: { strategyId },
          select: { synthesis: true },
        });
        const marketStudyData = marketStudy?.synthesis
          ? (marketStudy.synthesis as unknown as MarketStudySynthesis)
          : null;

        const { data } = await generateTrackAudit(
          updatedInterviewData, ficheContent, riskResults,
          strategy.brandName, strategy.sector ?? "",
          marketStudyData, specialization, strategy.tagline, currency,
        );
        generatedContent = data;
      } else if (pillarType === "I") {
        const ficheContent = ["A", "D", "V", "E"]
          .filter((t) => freshContent.has(t))
          .map((t) => ({
            type: t,
            content: typeof freshContent.get(t) === "string"
              ? freshContent.get(t) as string
              : JSON.stringify(freshContent.get(t) ?? ""),
          }));

        const riskData = freshContent.get("R");
        const trackData = freshContent.get("T");
        const { data: riskResults } = parsePillarContent<RiskAuditResult>("R", riskData ?? null);
        const { data: trackResults } = parsePillarContent<TrackAuditResult>("T", trackData ?? null);

        const { data } = await generateImplementationData(
          updatedInterviewData, riskResults, trackResults, ficheContent,
          strategy.brandName, strategy.sector ?? "",
          specialization, strategy.tagline, currency,
        );
        generatedContent = data;
      } else if (pillarType === "S") {
        const allPillars = PILLAR_ORDER
          .filter((t) => t !== "S" && freshContent.has(t))
          .map((t) => ({
            type: t,
            content: typeof freshContent.get(t) === "string"
              ? freshContent.get(t) as string
              : JSON.stringify(freshContent.get(t) ?? ""),
          }));

        const { data } = await generateSyntheseContent(
          updatedInterviewData, allPillars,
          strategy.brandName, strategy.sector ?? "",
          specialization, strategy.tagline, currency,
        );
        generatedContent = data;
      }

      // Version snapshot
      if (targetPillar.content != null) {
        await db.pillarVersion.create({
          data: {
            pillarId: targetPillar.id,
            version: targetPillar.version,
            content: targetPillar.content,
            summary: targetPillar.summary,
            source: "ai_update",
            changeNote: `Feedback: ${feedback.substring(0, 200)}`,
            createdBy: userId,
          },
        });
      }

      // Save
      await db.pillar.update({
        where: { id: targetPillar.id },
        data: {
          content: generatedContent,
          status: "complete",
          generatedAt: new Date(),
          errorMessage: null,
          version: { increment: 1 },
        },
      });

      freshContent.set(pillarType, generatedContent);
      updatedPillars.push(pillarType);

      // Post-generation hooks
      await onPillarGenerated(strategyId, targetPillar.id, pillarType, generatedContent);

      onPillarUpdated?.(pillarType);
    } catch (err) {
      console.error(`[Feedback] Error regenerating pillar ${pillarType}:`, err);

      // Mark as error but continue with next pillars
      await db.pillar.update({
        where: { id: targetPillar.id },
        data: {
          status: "error",
          errorMessage: err instanceof Error ? err.message : "Feedback update failed",
        },
      }).catch(() => {});
    }
  }

  return { updatedPillars };
}
