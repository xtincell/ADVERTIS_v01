// =============================================================================
// ROUTE R.11 — Export Excel
// =============================================================================
// POST  /api/export/excel
// Generates an Excel spreadsheet (.xlsx) for a strategy. Supports pillar
// selection. Returns binary XLSX with Content-Disposition: attachment.
// Auth:         Session required (ownership verified against strategy.userId)
// Dependencies: excel-generator service, Prisma (Strategy + Pillars)
// =============================================================================

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { generateStrategyExcel } from "~/server/services/excel-generator";

// Excel generation with multiple worksheets
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
  };
  try {
    body = (await req.json()) as {
      strategyId: string;
      selectedPillars?: string[];
    };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { strategyId, selectedPillars } = body;

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
  // 4. Generate Excel
  // ---------------------------------------------------------------------------
  try {
    const excelBuffer = await generateStrategyExcel(
      {
        name: strategy.name,
        brandName: strategy.brandName,
        tagline: strategy.tagline ?? undefined,
        sector: strategy.sector ?? undefined,
        coherenceScore: strategy.coherenceScore ?? undefined,
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
      },
    );

    // Sanitize brand name for filename
    const safeBrandName = strategy.brandName
      .replace(/[^a-zA-Z0-9À-\u024F-_ ]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="ADVERTIS-${safeBrandName}-Strategie.xlsx"`,
        "Content-Length": String(excelBuffer.length),
      },
    });
  } catch (error) {
    console.error("[Excel Export] Error generating Excel:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error during Excel generation";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
