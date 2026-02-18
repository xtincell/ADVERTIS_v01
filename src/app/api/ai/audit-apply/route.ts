// ADVERTIS AI Audit Apply Route
// POST /api/ai/audit-apply
// Analyzes R+T audit results and generates concrete suggestions
// for updating A-D-V-E pillar fields.

import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { anthropic, DEFAULT_MODEL } from "~/server/services/anthropic-client";

// Allow up to 90 seconds for AI analysis
export const maxDuration = 90;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuditSuggestion {
  pillarType: "A" | "D" | "V" | "E";
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

  // 4. Extract R + T audit content
  const pillarR = strategy.pillars.find((p) => p.type === "R");
  const pillarT = strategy.pillars.find((p) => p.type === "T");

  if (!pillarR?.content || !pillarT?.content) {
    return NextResponse.json(
      { error: "Audit R and T must be completed before applying suggestions" },
      { status: 400 },
    );
  }

  // 5. Extract A-D-V-E current content
  const adveContent: Record<string, unknown> = {};
  for (const type of ["A", "D", "V", "E"]) {
    const pillar = strategy.pillars.find((p) => p.type === type);
    adveContent[type] = pillar?.content ?? {};
  }

  // 6. Build the AI prompt
  const systemPrompt = `Tu es un consultant stratégique senior spécialisé dans la méthodologie ADVERTIS.

Tu viens de recevoir les résultats d'un audit complet (piliers R — Risk et T — Track) d'une fiche de marque.
Ton rôle est d'analyser ces résultats et de proposer des MISES À JOUR CONCRÈTES pour les piliers A, D, V, E.

RÈGLES STRICTES :
1. Chaque suggestion doit cibler un champ SPÉCIFIQUE d'un pilier A, D, V, E
2. Ne propose que des améliorations qui sont DIRECTEMENT justifiées par l'audit
3. Utilise le format JSON demandé — RIEN d'autre
4. Sois concret : donne la valeur actuelle ET la valeur corrigée
5. Maximum 15 suggestions
6. Écris en français
7. Le "field" doit être le nom du champ dans le contenu JSON du pilier (ex: "positioning.statement", "personas[0].motivations")
8. Le "fieldLabel" doit être un label lisible en français (ex: "Positionnement — Statement")

IMPORTANT: Renvoie UNIQUEMENT un objet JSON valide, sans markdown ni commentaire.`;

  const userPrompt = `AUDIT R (Risk) — Résultats :
${JSON.stringify(pillarR.content, null, 2)}

AUDIT T (Track) — Résultats :
${JSON.stringify(pillarT.content, null, 2)}

DONNÉES ACTUELLES DES PILIERS A-D-V-E :
${JSON.stringify(adveContent, null, 2)}

Analyse les résultats d'audit ci-dessus et propose des mises à jour concrètes pour améliorer les piliers A, D, V, E.

Réponds avec un JSON dans ce format exact :
{
  "suggestions": [
    {
      "pillarType": "A" | "D" | "V" | "E",
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
      maxOutputTokens: 6000,
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

    // Filter invalid suggestions
    const validSuggestions = parsed.suggestions.filter(
      (s) =>
        ["A", "D", "V", "E"].includes(s.pillarType) &&
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
