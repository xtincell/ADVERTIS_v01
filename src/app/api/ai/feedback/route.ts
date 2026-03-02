// =============================================================================
// ROUTE R.7 — Strategy Feedback (Streaming NDJSON)
// =============================================================================
// POST  /api/ai/feedback
// Two-phase process:
//   Phase 1 (action: "analyze"): Analyze feedback → return impacted pillars
//   Phase 2 (action: "apply"):   Apply feedback → selective regeneration
//
// Returns NDJSON events:
//   {"event":"progress","step":"...","message":"..."}
//   {"event":"analysis","data":{...}}
//   {"event":"pillar_updated","pillar":"D"}
//   {"event":"complete","updatedPillars":["D","V"]}
//   {"event":"error","error":"..."}
// =============================================================================

import { type NextRequest } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { checkAiRateLimit } from "~/server/services/rate-limiter";
import { analyzeFeedback, applyFeedback } from "~/server/services/feedback-processor";
import type { FeedbackAnalysis } from "~/server/services/feedback-processor";

export const maxDuration = 300; // 5 min — feedback can regenerate multiple pillars

export async function POST(req: NextRequest) {
  // Auth
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const rateLimit = checkAiRateLimit(session.user.id);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: rateLimit.error },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rateLimit.retryAfterMs ?? 60000) / 1000)) },
      },
    );
  }

  // Parse body
  let body: {
    strategyId: string;
    feedback: string;
    action: "analyze" | "apply";
    analysis?: FeedbackAnalysis;
    pillarsToRegenerate?: string[];
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { strategyId, feedback, action } = body;

  if (!strategyId || !feedback || !action) {
    return Response.json(
      { error: "strategyId, feedback, and action are required" },
      { status: 400 },
    );
  }

  // Verify ownership
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: { userId: true },
  });
  if (!strategy || strategy.userId !== session.user.id) {
    return Response.json({ error: "Strategy not found" }, { status: 404 });
  }

  // Stream response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        } catch {
          // Client disconnected
        }
      };

      const progress = (step: string, message: string) => {
        send({ event: "progress", step, message });
      };

      try {
        if (action === "analyze") {
          // Phase 1: Analyze only
          progress("analyze", "Analyse du feedback en cours…");

          const analysis = await analyzeFeedback(strategyId, feedback, session.user.id);

          send({ event: "analysis", data: analysis });
          send({ event: "complete", analysis });
          controller.close();
        } else if (action === "apply") {
          // Phase 2: Apply changes
          if (!body.analysis || !body.pillarsToRegenerate) {
            send({ event: "error", error: "analysis and pillarsToRegenerate required for apply action" });
            controller.close();
            return;
          }

          progress("update-data", "Mise à jour des données…");

          const result = await applyFeedback(
            strategyId,
            feedback,
            body.analysis,
            body.pillarsToRegenerate,
            session.user.id,
            (step, message) => progress(step, message),
            (pillar) => send({ event: "pillar_updated", pillar }),
          );

          send({
            event: "complete",
            updatedPillars: result.updatedPillars,
            success: true,
          });
          controller.close();
        } else {
          send({ event: "error", error: `Unknown action: ${action}` });
          controller.close();
        }
      } catch (error) {
        console.error("[Feedback] Error:", error);
        send({
          event: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
