// ADVERTIS Template Generation API Route
// POST /api/ai/templates
// Generates UPGRADERS deliverable templates (Protocole Stratégique, Reco Campagne, Mandat 360).
// Available once Pillar I is complete (phase >= "cockpit").
// Does NOT advance the strategy phase — templates are optional deliverables.

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  generateTemplate,
  type TemplateContext,
} from "~/server/services/template-generation";
import {
  TEMPLATE_TYPES,
  TEMPLATE_CONFIG,
  PILLAR_CONFIG,
} from "~/lib/constants";
import type { TemplateType, PillarType } from "~/lib/constants";

export const maxDuration = 300; // 5 minutes max (Vercel)

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
  let body: { strategyId: string; templateType?: string };
  try {
    body = (await req.json()) as { strategyId: string; templateType?: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { strategyId, templateType } = body;

  if (!strategyId) {
    return NextResponse.json(
      { error: "strategyId is required" },
      { status: 400 },
    );
  }

  // If templateType is provided, validate it
  if (
    templateType &&
    !TEMPLATE_TYPES.includes(templateType as (typeof TEMPLATE_TYPES)[number])
  ) {
    return NextResponse.json(
      { error: `Invalid templateType: ${templateType}` },
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

  // Verify Pillar I is complete (templates require full intelligence)
  const pillarI = strategy.pillars.find((p) => p.type === "I");
  if (!pillarI || pillarI.status !== "complete") {
    return NextResponse.json(
      {
        error:
          "Le pilier I (Implémentation) doit être complet pour générer des templates. Terminez d'abord le pipeline.",
      },
      { status: 400 },
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Build context from all pillars
  // ---------------------------------------------------------------------------
  const interviewData =
    (strategy.interviewData as Record<string, string>) ?? {};

  const pillarContents = strategy.pillars
    .filter((p) => p.status === "complete")
    .map((p) => ({
      type: p.type,
      title: PILLAR_CONFIG[p.type as PillarType]?.title ?? p.type,
      content:
        typeof p.content === "string"
          ? p.content
          : JSON.stringify(p.content ?? ""),
    }));

  const context: TemplateContext = {
    brandName: strategy.brandName,
    sector: strategy.sector ?? "",
    interviewData,
    pillarContents,
    implementationData: pillarI.content
      ? JSON.stringify(pillarI.content)
      : undefined,
  };

  // ---------------------------------------------------------------------------
  // 5. Determine which templates to generate
  // ---------------------------------------------------------------------------
  const typesToGenerate: TemplateType[] = templateType
    ? [templateType as TemplateType]
    : [...TEMPLATE_TYPES];

  // ---------------------------------------------------------------------------
  // 6. Generate templates
  // ---------------------------------------------------------------------------
  try {
    const results = [];

    for (let i = 0; i < typesToGenerate.length; i++) {
      const tt = typesToGenerate[i]!;
      const config = TEMPLATE_CONFIG[tt];

      // Create or update document record (reuse the Document model)
      const existingDoc = await db.document.findUnique({
        where: { strategyId_type: { strategyId, type: tt } },
      });

      let docId: string;

      if (existingDoc) {
        await db.document.update({
          where: { id: existingDoc.id },
          data: {
            status: "generating",
            errorMessage: null,
          },
        });
        docId = existingDoc.id;
      } else {
        const newDoc = await db.document.create({
          data: {
            type: tt,
            title: config.title,
            status: "generating",
            strategyId,
          },
        });
        docId = newDoc.id;
      }

      // Generate template section by section
      const result = await generateTemplate(tt, context);

      // Save completed template
      await db.document.update({
        where: { id: docId },
        data: {
          status: result.status,
          sections: JSON.parse(JSON.stringify(result.sections)),
          content: JSON.parse(JSON.stringify(result)),
          pageCount: result.totalSlides,
          generatedAt: new Date(),
          errorMessage: result.errorMessage ?? null,
        },
      });

      results.push({
        type: result.type,
        title: result.title,
        totalSlides: result.totalSlides,
        totalWordCount: result.totalWordCount,
        sectionCount: result.sections.length,
        status: result.status,
      });
    }

    return NextResponse.json({
      success: true,
      templates: results,
    });
  } catch (error) {
    console.error("[Template Generation] Error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error during template generation";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
