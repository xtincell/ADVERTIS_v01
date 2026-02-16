// ADVERTIS Report Generation API Route
// POST /api/ai/reports
// Generates reports ON DEMAND (decoupled from the main pipeline).
// Available once audit R+T is complete (phase >= "audit-review").
// Does NOT advance the strategy phase — reports are optional deliverables.

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  generateReport,
  type ReportContext,
} from "~/server/services/report-generation";
import {
  REPORT_TYPES,
  REPORT_CONFIG,
  PILLAR_CONFIG,
} from "~/lib/constants";
import type { ReportType, PillarType } from "~/lib/constants";

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
  let body: { strategyId: string; reportType?: string };
  try {
    body = (await req.json()) as { strategyId: string; reportType?: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { strategyId, reportType } = body;

  if (!strategyId) {
    return NextResponse.json(
      { error: "strategyId is required" },
      { status: 400 },
    );
  }

  // If reportType is provided, validate it
  if (
    reportType &&
    !REPORT_TYPES.includes(reportType as (typeof REPORT_TYPES)[number])
  ) {
    return NextResponse.json(
      { error: `Invalid reportType: ${reportType}` },
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

  // Verify audit is complete (reports available from audit-review onwards)
  const allowedPhases = ["audit-review", "implementation", "cockpit", "complete"];
  if (!allowedPhases.includes(strategy.phase)) {
    return NextResponse.json(
      {
        error: `L'audit doit être terminé pour générer des rapports. Phase actuelle : "${strategy.phase}"`,
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

  const context: ReportContext = {
    brandName: strategy.brandName,
    sector: strategy.sector ?? "",
    interviewData,
    pillarContents,
  };

  // ---------------------------------------------------------------------------
  // 5. Determine which reports to generate
  // ---------------------------------------------------------------------------
  const typesToGenerate: ReportType[] = reportType
    ? [reportType as ReportType]
    : [...REPORT_TYPES];

  // ---------------------------------------------------------------------------
  // 6. Generate reports
  // ---------------------------------------------------------------------------
  try {
    // Mark strategy as generating
    await db.strategy.update({
      where: { id: strategyId },
      data: { status: "generating" },
    });

    const results = [];

    for (let i = 0; i < typesToGenerate.length; i++) {
      const rt = typesToGenerate[i]!;
      const config = REPORT_CONFIG[rt];

      // Create or update document record
      const existingDoc = await db.document.findUnique({
        where: { strategyId_type: { strategyId, type: rt } },
      });

      const docId = existingDoc?.id;

      if (existingDoc) {
        await db.document.update({
          where: { id: existingDoc.id },
          data: {
            status: "generating",
            errorMessage: null,
          },
        });
      } else {
        const newDoc = await db.document.create({
          data: {
            type: rt,
            title: config.title,
            status: "generating",
            strategyId,
          },
        });
        // Use newly created ID
        (existingDoc as unknown) = newDoc;
      }

      const currentDocId = docId ?? (existingDoc as { id: string })?.id;

      // Generate report section by section
      const result = await generateReport(
        rt,
        context,
        async (progress) => {
          // Save progress incrementally after each section
          if (currentDocId) {
            // Get current sections from the result being built
            // We can't easily access partial results here, so we skip incremental saves
            // The full result will be saved after completion
          }
        },
      );

      // Save completed report
      const finalDocId = currentDocId ?? docId;
      if (finalDocId) {
        await db.document.update({
          where: { id: finalDocId },
          data: {
            status: result.status,
            sections: JSON.parse(JSON.stringify(result.sections)),
            content: JSON.parse(JSON.stringify(result)),
            pageCount: result.pageCount,
            generatedAt: new Date(),
            errorMessage: result.errorMessage ?? null,
          },
        });
      }

      results.push({
        type: result.type,
        title: result.title,
        pageCount: result.pageCount,
        totalWordCount: result.totalWordCount,
        sectionCount: result.sections.length,
        status: result.status,
      });
    }

    // Reports are on-demand — no phase advancement, no Pillar I update.
    // Restore strategy status (was set to "generating" above)
    await db.strategy.update({
      where: { id: strategyId },
      data: { status: strategy.phase === "complete" ? "complete" : "generating" },
    });

    return NextResponse.json({
      success: true,
      reports: results,
    });
  } catch (error) {
    console.error("[Report Generation] Error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error during report generation";

    // Mark strategy back to implementation phase on error
    await db.strategy.update({
      where: { id: strategyId },
      data: { status: "generating" },
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
