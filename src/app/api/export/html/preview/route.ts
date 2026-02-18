// ADVERTIS HTML Preview API Route
// POST /api/export/html/preview
// Same as /api/export/html but with Content-Disposition: inline (opens in browser).

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { generateStrategyHTML } from "~/server/services/html-presentation-generator";

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
  let body: {
    strategyId: string;
    selectedPillars?: string[];
    brandAccent?: string;
    brandAccent2?: string;
    currency?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { strategyId, selectedPillars, brandAccent, brandAccent2, currency } = body;

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
  // 4. Generate HTML — inline disposition for preview
  // ---------------------------------------------------------------------------
  try {
    const html = generateStrategyHTML(
      {
        name: strategy.name,
        brandName: strategy.brandName,
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
        brandAccent,
        brandAccent2,
        currency,
      },
    );

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": "inline",
        "Content-Length": String(Buffer.byteLength(html, "utf-8")),
      },
    });
  } catch (error) {
    console.error("[HTML Preview] Error generating HTML:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error during HTML generation";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
