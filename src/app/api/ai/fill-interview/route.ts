// =============================================================================
// ROUTE R.2 — AI Fill Interview
// =============================================================================
// POST  /api/ai/fill-interview
// Auto-fills empty interview variables via AI. Uses already-generated pillar
// content (A-D-V-E) + existing interview data to infer and complete missing
// variables through Claude.
// Auth:         Session required (ownership verified against strategy.userId)
// Dependencies: anthropic-client (Claude), interview-schema, constants
// maxDuration:  90s (Vercel serverless)
// =============================================================================

import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { anthropic, DEFAULT_MODEL } from "~/server/services/anthropic-client";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { getFicheDeMarqueSchema } from "~/lib/interview-schema";

// Allow up to 90 seconds for AI fill
export const maxDuration = 90;

export async function POST(req: NextRequest) {
  // ---------------------------------------------------------------------------
  // 1. Auth check
  // ---------------------------------------------------------------------------
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---------------------------------------------------------------------------
  // 2. Parse body
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // 3. Fetch strategy + pillars
  // ---------------------------------------------------------------------------
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: {
      pillars: {
        where: { type: { in: ["A", "D", "V", "E"] } },
        select: { type: true, status: true, content: true },
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
  // 4. Identify empty variables
  // ---------------------------------------------------------------------------
  const interviewData =
    (strategy.interviewData as Record<string, string>) ?? {};
  const schema = getFicheDeMarqueSchema();
  const allVariables = schema.flatMap((section) =>
    section.variables.map((v) => ({
      ...v,
      pillarType: section.pillarType,
      pillarTitle: section.title,
    })),
  );

  const emptyVars = allVariables.filter(
    (v) => !interviewData[v.id]?.trim(),
  );
  const filledVars = allVariables.filter(
    (v) => interviewData[v.id]?.trim(),
  );

  // Nothing to fill
  if (emptyVars.length === 0) {
    return NextResponse.json({
      filledData: interviewData,
      autoFilledIds: [],
      totalFilled: allVariables.length,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Build context from generated pillar content
  // ---------------------------------------------------------------------------
  const pillarContextParts: string[] = [];
  for (const pillar of strategy.pillars) {
    if (pillar.status !== "complete" || !pillar.content) continue;
    const cfg = PILLAR_CONFIG[pillar.type as PillarType];
    const contentStr =
      typeof pillar.content === "string"
        ? pillar.content
        : JSON.stringify(pillar.content, null, 2);
    // Truncate to keep prompt size reasonable
    const truncated =
      contentStr.length > 3000
        ? contentStr.substring(0, 3000) + "\n[... tronqué ...]"
        : contentStr;
    pillarContextParts.push(
      `### Pilier ${pillar.type} — ${cfg?.title ?? pillar.type}\n${truncated}`,
    );
  }

  // ---------------------------------------------------------------------------
  // 6. Build the AI prompt
  // ---------------------------------------------------------------------------
  const systemPrompt = `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS.

On te fournit :
1. Les variables DÉJÀ remplies par l'utilisateur (contexte fiable)
2. Le contenu structuré des piliers A-D-V-E DÉJÀ générés par l'IA (contexte riche)
3. La liste des variables VIDES à compléter

Ta mission : générer le contenu des variables vides en t'appuyant sur TOUT le contexte disponible.

RÈGLES CRITIQUES :
- Réponds UNIQUEMENT avec du JSON valide : un objet { "ID": "valeur", "ID": "valeur", ... }
- Génère UNIQUEMENT les variables demandées (celles listées comme vides)
- Ne modifie JAMAIS les variables déjà remplies
- Chaque valeur doit être un texte riche, détaillé et spécifique à la marque (2-5 paragraphes)
- Utilise le contenu des piliers comme source principale d'information
- Utilise le français
- Pas de commentaires, pas de markdown, pas de texte avant/après le JSON`;

  const userPromptLines: string[] = [
    `# Marque : ${strategy.brandName}`,
    `# Secteur : ${strategy.sector ?? "Non spécifié"}`,
    "",
  ];

  // Already filled variables (user context)
  if (filledVars.length > 0) {
    userPromptLines.push("## Variables déjà remplies par l'utilisateur");
    userPromptLines.push("");
    for (const v of filledVars) {
      userPromptLines.push(
        `**${v.id} — ${v.label}** : ${interviewData[v.id]!.trim()}`,
      );
      userPromptLines.push("");
    }
  }

  // Pillar content context
  if (pillarContextParts.length > 0) {
    userPromptLines.push(
      "## Contenu structuré des piliers (généré par l'IA)",
    );
    userPromptLines.push("");
    userPromptLines.push(pillarContextParts.join("\n\n"));
    userPromptLines.push("");
  }

  // Empty variables to fill
  userPromptLines.push("## Variables à compléter");
  userPromptLines.push(
    "Génère le contenu pour CHACUNE des variables suivantes :",
  );
  userPromptLines.push("");

  for (const v of emptyVars) {
    userPromptLines.push(
      `### ${v.id} — ${v.label} (Pilier ${v.pillarType})`,
    );
    userPromptLines.push(`Description : ${v.description}`);
    userPromptLines.push(`Exemple attendu : ${v.placeholder}`);
    userPromptLines.push("");
  }

  userPromptLines.push("---");
  userPromptLines.push(
    `Génère un objet JSON avec les ${emptyVars.length} variables manquantes.`,
  );
  userPromptLines.push(
    'Format : { "A2": "contenu...", "D5": "contenu...", ... }',
  );
  userPromptLines.push(
    "Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après.",
  );

  // ---------------------------------------------------------------------------
  // 7. Call Claude
  // ---------------------------------------------------------------------------
  try {
    const result = await generateText({
      model: anthropic(DEFAULT_MODEL),
      system: systemPrompt,
      prompt: userPromptLines.join("\n"),
      maxOutputTokens: 6000,
    });

    // ---------------------------------------------------------------------------
    // 8. Parse response
    // ---------------------------------------------------------------------------
    let responseText = result.text.trim();

    // Strip markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch?.[1]) {
      responseText = jsonMatch[1].trim();
    }

    let generated: Record<string, string>;
    try {
      generated = JSON.parse(responseText) as Record<string, string>;
    } catch {
      console.error(
        "[fill-interview] Failed to parse AI response:",
        responseText.substring(0, 500),
      );
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    // ---------------------------------------------------------------------------
    // 9. Merge: only fill empty vars, never overwrite existing
    // ---------------------------------------------------------------------------
    const emptyVarIds = new Set(emptyVars.map((v) => v.id));
    const mergedData: Record<string, string> = { ...interviewData };
    const autoFilledIds: string[] = [];

    for (const [key, value] of Object.entries(generated)) {
      if (emptyVarIds.has(key) && typeof value === "string" && value.trim()) {
        mergedData[key] = value.trim();
        autoFilledIds.push(key);
      }
    }

    return NextResponse.json({
      filledData: mergedData,
      autoFilledIds,
      totalFilled: allVariables.filter(
        (v) => mergedData[v.id]?.trim(),
      ).length,
    });
  } catch (error) {
    console.error("[fill-interview] AI generation failed:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 },
    );
  }
}
