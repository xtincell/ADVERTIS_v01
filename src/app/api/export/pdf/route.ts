// =============================================================================
// ROUTE R.9 — Export PDF
// =============================================================================
// POST  /api/export/pdf
// Generates and downloads a PDF report for a strategy. Supports pillar
// selection and optional cover page. Returns binary PDF with
// Content-Disposition: attachment.
// Auth:         Session required (ownership verified against strategy.userId)
// Dependencies: pdf-generator service, Prisma (Strategy + Pillars)
// =============================================================================

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { generateStrategyPDF } from "~/server/services/pdf-generator";

// PDF generation can be slow for large strategies
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
  let body: {
    strategyId: string;
    selectedPillars?: string[];
    includeCover?: boolean;
  };
  try {
    body = (await req.json()) as {
      strategyId: string;
      selectedPillars?: string[];
      includeCover?: boolean;
    };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { strategyId, selectedPillars, includeCover } = body;

  if (!strategyId) {
    return NextResponse.json(
      { error: "strategyId is required" },
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
  // 4. Generate PDF
  // ---------------------------------------------------------------------------
  try {
    const pdfBuffer = await generateStrategyPDF(
      {
        name: strategy.name,
        brandName: strategy.brandName,
        tagline: strategy.tagline ?? undefined,
        sector: strategy.sector ?? undefined,
        coherenceScore: strategy.coherenceScore ?? undefined,
        createdAt: strategy.createdAt,
      },
      strategy.pillars.map((p) => ({
        type: p.type,
        title: p.title,
        content: p.content,
        summary: p.summary ?? undefined,
        status: p.status,
      })),
      {
        selectedPillars,
        includeCover: includeCover ?? true,
      },
    );

    // Sanitize brand name for filename
    const safeBrandName = strategy.brandName
      .replace(/[^a-zA-Z0-9À-\u024F-_ ]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ADVERTIS-${safeBrandName}-Strategie.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("[PDF Export] Error generating PDF:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error during PDF generation";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
