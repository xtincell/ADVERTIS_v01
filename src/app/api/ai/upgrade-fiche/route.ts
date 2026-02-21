// =============================================================================
// ROUTE R.3 — Fiche Upgrade
// =============================================================================
// POST  /api/ai/upgrade-fiche
// Full fiche upgrade pipeline. Upgrades a legacy brand fiche by filling
// missing variables and regenerating all 8 pillars (A-D-V-E-R-T-I-S).
// Auth:         Session required (ownership verified inside upgradeFiche service)
// Dependencies: fiche-upgrade service
// maxDuration:  600s (10 minutes — full 8-pillar regeneration + AI fill)
// =============================================================================

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { upgradeFiche } from "~/server/services/fiche-upgrade";

// Allow up to 10 minutes for full 8-pillar regeneration + AI fill
export const maxDuration = 600;

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
  // 3. Run upgrade
  // ---------------------------------------------------------------------------
  try {
    const report = await upgradeFiche(strategyId, session.user.id);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("[Fiche Upgrade API] Error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error during upgrade";

    // Distinguish auth/not-found errors from internal errors
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
