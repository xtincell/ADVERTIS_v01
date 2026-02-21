// =============================================================================
// ROUTE R.10B — Export HTML Preview
// =============================================================================
// POST  /api/export/html/preview
// Preview endpoint for HTML presentation. Same generation logic as R.10
// (/api/export/html) but returns Content-Disposition: inline so the browser
// renders it directly instead of downloading.
// Auth:         Session required (ownership verified against strategy.userId)
// Dependencies: html-presentation-generator service, Prisma (Strategy +
//               Pillars + Decisions + CompetitorSnapshots + Opportunities +
//               BudgetTiers + TranslationDocuments + Signals + parent/children)
// =============================================================================

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
    userRole?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { strategyId, selectedPillars, brandAccent, brandAccent2, currency, userRole } = body;

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
      decisions: {
        orderBy: { priority: "asc" },
      },
      competitorSnapshots: true,
      opportunities: {
        orderBy: { startDate: "asc" },
      },
      budgetTiers: {
        orderBy: { minBudget: "asc" },
      },
      translationDocuments: {
        where: { status: { not: "ARCHIVED" } },
      },
      parent: {
        select: { id: true, brandName: true },
      },
      children: {
        select: { id: true, brandName: true },
      },
      signals: {
        orderBy: { detectedAt: "desc" },
        take: 50,
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
        brandAccent,
        brandAccent2,
        currency,
        decisions: strategy.decisions,
        competitors: strategy.competitorSnapshots,
        opportunities: strategy.opportunities,
        budgetTiers: strategy.budgetTiers,
        briefs: strategy.translationDocuments,
        parentBrand: strategy.parent,
        childBrands: strategy.children,
        userRole: userRole ?? session.user.role ?? undefined,
        vertical: strategy.vertical ?? undefined,
        signals: strategy.signals,
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
