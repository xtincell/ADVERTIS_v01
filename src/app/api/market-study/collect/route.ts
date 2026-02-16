// Market Study Collection API Route
// POST /api/market-study/collect
// Launches automated data collection from all configured sources.
// Long-running: up to 5 minutes for all adapters.

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { runMarketStudyCollection } from "~/server/services/market-study/collection-orchestrator";

// Allow up to 5 minutes for data collection (multiple API calls)
export const maxDuration = 300;

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
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { strategyId } = body;
  if (!strategyId) {
    return NextResponse.json(
      { error: "strategyId is required" },
      { status: 400 },
    );
  }

  // 3. Verify strategy ownership
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: { pillars: { select: { type: true, content: true, status: true } } },
  });

  if (!strategy || strategy.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Strategy not found" },
      { status: 404 },
    );
  }

  // 4. Extract competitors from D2 pillar data (if available)
  const pillarD = strategy.pillars.find(
    (p) => p.type === "D" && p.status === "complete",
  );
  let competitors: string[] = [];

  if (pillarD?.content) {
    // Try to extract competitor names from the D pillar content
    const dContent =
      typeof pillarD.content === "string"
        ? pillarD.content
        : JSON.stringify(pillarD.content);

    // Also check interview data for D2 (competitive landscape)
    const interviewData =
      (strategy.interviewData as Record<string, string>) ?? {};
    const d2Value = interviewData["D2"] ?? "";

    // Simple extraction: split by commas, newlines, or "vs"
    if (d2Value) {
      competitors = d2Value
        .split(/[,\n;]/)
        .map((c) => c.trim())
        .filter((c) => c.length > 1 && c.length < 100);
    }

    // If no competitors from D2, try to extract from content
    if (competitors.length === 0) {
      const nameMatches = dContent.match(
        /(?:concurrent|competitor|vs\.?|versus)\s*:?\s*([^,\n.]+)/gi,
      );
      if (nameMatches) {
        competitors = nameMatches
          .map((m) =>
            m
              .replace(/(?:concurrent|competitor|vs\.?|versus)\s*:?\s*/i, "")
              .trim(),
          )
          .filter((c) => c.length > 1 && c.length < 100);
      }
    }
  }

  // 5. Run collection
  try {
    const result = await runMarketStudyCollection(
      strategyId,
      strategy.brandName,
      strategy.sector ?? "",
      competitors.slice(0, 5),
      [strategy.brandName, strategy.sector ?? ""].filter(Boolean),
    );

    return NextResponse.json({
      success: result.success,
      sourcesCompleted: result.sourcesCompleted,
      sourcesTotal: result.sourcesTotal,
      errors: result.errors,
    });
  } catch (error) {
    console.error("[MarketStudy Collection] Error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error during collection";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
