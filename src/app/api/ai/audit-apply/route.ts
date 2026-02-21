// =============================================================================
// ROUTE R.6 — Audit Apply
// =============================================================================
// POST  /api/ai/audit-apply
// Applies audit recommendations. Analyzes R+T audit results and generates
// concrete suggestions for updating ALL 8 pillars (A-D-V-E-R-T-I-S).
// Returns field-level suggestions with current/suggested values and reasons.
// Auth:         Session required (ownership verified against strategy.userId)
// Dependencies: anthropic-client (Claude), Prisma (Strategy + Pillars)
// maxDuration:  120s (2 minutes — large-scope AI analysis)
// =============================================================================

import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { anthropic, DEFAULT_MODEL } from "~/server/services/anthropic-client";

// Allow up to 2 minutes for AI analysis (larger scope = more time)
export const maxDuration = 120;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const VALID_PILLAR_TYPES = ["A", "D", "V", "E", "R", "T", "I", "S"] as const;
type AuditPillarType = (typeof VALID_PILLAR_TYPES)[number];

interface AuditSuggestion {
  pillarType: AuditPillarType;
  field: string; // dot-path into pillar content (e.g., "identiteMarque.archetype")
  fieldLabel: string; // Human-readable label
  currentValue: string;
  suggestedValue: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  let body: { strategyId: string };
  try {
    body = (await req.json()) as { strategyId: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { strategyId } = body;
  if (!strategyId) {
    return NextResponse.json(
      { error: "strategyId is required" },
      { status: 400 },
    );
  }

  // 3. Fetch strategy + all pillars
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: { pillars: { orderBy: { order: "asc" } } },
  });

  if (!strategy || strategy.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Strategy not found" },
      { status: 404 },
    );
  }

  // 4. Extract R + T audit content (required for cross-analysis)
  const pillarR = strategy.pillars.find((p) => p.type === "R");
  const pillarT = strategy.pillars.find((p) => p.type === "T");

  if (!pillarR?.content || !pillarT?.content) {
    return NextResponse.json(
      { error: "Audit R and T must be completed before applying suggestions" },
      { status: 400 },
    );
  }

  // 5. Extract ALL pillar content for comprehensive analysis
  const allPillarContent: Record<string, unknown> = {};
  for (const type of VALID_PILLAR_TYPES) {
    const pillar = strategy.pillars.find((p) => p.type === type);
    if (pillar?.content) {
      allPillarContent[type] = pillar.content;
    }
  }

  // 6. Build the AI prompt
  const systemPrompt = `Tu es un consultant stratégique senior spécialisé dans la méthodologie ADVERTIS.

Tu viens de recevoir les résultats d'un audit complet (piliers R — Risk et T — Track) d'une fiche de marque.
Ton rôle est d'analyser ces résultats et de proposer des MISES À JOUR CONCRÈTES pour TOUS les 8 piliers A-D-V-E-R-T-I-S.

PILIERS ET CHAMPS CLÉS :
- A (Authenticité) : identite (archetype, noyauIdentitaire, mission, vision, valeurs), personnalite, histoire, promesseMarque
- D (Distinction) : positionnement, promesses[], personas[], concurrents[], argumentsCles, preuves
- V (Valeur) : offreValeur, pricingStrategy, unitEconomics (cac, ltv, ratio), revenueStreams[], avantageCompetitif
- E (Engagement) : aarrr (acquisition, activation, retention, referral, revenue), canaux[], tonalite, contentStrategy
- R (Risk) : microSwots[], globalSwot, riskScore, prioritizedRisks[], mitigationPlan[], summary
- T (Track) : triangulation, hypothesisValidation[], marketReality, tamSamSom, competitiveBenchmark[], brandMarketFitScore
- I (Implementation) : brandPlatform (tagline, manifesto, tonOfVoice), copyStrategy, campaigns (annualCalendar[], budgetAllocation), strategicRoadmap, activationDispositif, sprint90Days, kpis[]
- S (Synthèse) : syntheseExecutive, visionStrategique, coherencePiliers[], axesStrategiques[], facteursClesSucces[], recommandationsPrioritaires[], scoreCoherence, sprint90Recap, campaignsSummary, kpiDashboard[]

RÈGLES STRICTES :
1. Chaque suggestion doit cibler un champ SPÉCIFIQUE d'un pilier
2. Ne propose que des améliorations DIRECTEMENT justifiées par l'audit R+T
3. Utilise le format JSON demandé — RIEN d'autre
4. Sois concret : donne la valeur actuelle ET la valeur corrigée
5. Maximum 30 suggestions (réparties de manière pertinente entre les piliers)
6. Écris en français
7. Le "field" doit être le chemin du champ JSON (ex: "brandPlatform.tagline", "campaigns.annualCalendar[0].objective")
8. Le "fieldLabel" doit être un label lisible en français (ex: "Plateforme de marque — Tagline")
9. Priorise les modifications à forte valeur ajoutée : cohérence inter-piliers, alignement stratégique, données marché
10. Pour les piliers I et S, concentre-toi sur les éléments tactiques (campagnes, sprint, KPIs) qui doivent refléter l'audit

IMPORTANT: Renvoie UNIQUEMENT un objet JSON valide, sans markdown ni commentaire.`;

  const userPrompt = `CONTEXTE DE LA MARQUE :
- Marque : ${strategy.brandName}${strategy.tagline ? `\n- Accroche : "${strategy.tagline}"` : ""}
- Secteur : ${strategy.sector ?? "Non spécifié"}

AUDIT R (Risk) — Résultats :
${JSON.stringify(pillarR.content, null, 2)}

AUDIT T (Track) — Résultats :
${JSON.stringify(pillarT.content, null, 2)}

DONNÉES ACTUELLES DE TOUS LES PILIERS :
${JSON.stringify(allPillarContent, null, 2)}

Analyse les résultats d'audit ci-dessus et propose des mises à jour concrètes pour améliorer TOUS les piliers A-D-V-E-R-T-I-S.

Réponds avec un JSON dans ce format exact :
{
  "suggestions": [
    {
      "pillarType": "A" | "D" | "V" | "E" | "R" | "T" | "I" | "S",
      "field": "chemin.du.champ",
      "fieldLabel": "Label lisible du champ",
      "currentValue": "valeur actuelle résumée",
      "suggestedValue": "nouvelle valeur proposée",
      "reason": "Justification basée sur l'audit"
    }
  ]
}`;

  // 7. Call Claude
  try {
    const result = await generateText({
      model: anthropic(DEFAULT_MODEL),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 10000,
      temperature: 0.3,
    });

    // 8. Parse response
    let responseText = result.text.trim();

    // Strip markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch?.[1]) {
      responseText = jsonMatch[1].trim();
    }

    let parsed: { suggestions: AuditSuggestion[] };
    try {
      parsed = JSON.parse(responseText) as { suggestions: AuditSuggestion[] };
    } catch {
      console.error(
        "[Audit Apply] Failed to parse AI response:",
        responseText.substring(0, 500),
      );
      return NextResponse.json(
        { error: "AI response was not valid JSON" },
        { status: 500 },
      );
    }

    // Validate structure
    if (!Array.isArray(parsed.suggestions)) {
      return NextResponse.json(
        { error: "AI response missing suggestions array" },
        { status: 500 },
      );
    }

    // Filter invalid suggestions — accept all 8 pillar types
    const validTypes = new Set<string>(VALID_PILLAR_TYPES);
    const validSuggestions = parsed.suggestions.filter(
      (s) =>
        validTypes.has(s.pillarType) &&
        typeof s.field === "string" &&
        typeof s.suggestedValue === "string" &&
        typeof s.reason === "string",
    );

    return NextResponse.json({
      success: true,
      suggestions: validSuggestions,
      totalSuggestions: validSuggestions.length,
    });
  } catch (error) {
    console.error("[Audit Apply] AI generation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "AI generation failed",
      },
      { status: 500 },
    );
  }
}
