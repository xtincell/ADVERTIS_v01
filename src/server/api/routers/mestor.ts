// =============================================================================
// ROUTER T.30 — MESTOR AI (AI Strategic Advisor)
// Conversation thread management for the AI copilot.
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  resilientGenerateText,
  anthropic,
  DEFAULT_MODEL,
} from "~/server/services/anthropic-client";
import type { PrismaClient } from "@prisma/client";

export const mestorRouter = createTRPCRouter({
  // ── List threads for current user ────────────────────────────────────────
  listThreads: protectedProcedure
    .input(
      z.object({
        strategyId: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.mestorThread.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input?.strategyId ? { strategyId: input.strategyId } : {}),
        },
        orderBy: { lastMessageAt: "desc" },
        take: input?.limit ?? 20,
      });
    }),

  // ── Get thread with messages ─────────────────────────────────────────────
  getThread: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const thread = await ctx.db.mestorThread.findUnique({
        where: { id: input.threadId },
      });
      if (!thread || thread.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }

      const messages = await ctx.db.mestorMessage.findMany({
        where: { threadId: input.threadId },
        orderBy: { createdAt: "asc" },
        take: input.limit,
      });

      return { thread, messages };
    }),

  // ── Create a new thread ──────────────────────────────────────────────────
  createThread: protectedProcedure
    .input(
      z.object({
        strategyId: z.string().optional(),
        title: z.string().optional(),
        initialMessage: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.mestorThread.create({
        data: {
          userId: ctx.session.user.id,
          strategyId: input.strategyId,
          title: input.title ?? input.initialMessage.slice(0, 60),
          messageCount: 1,
          lastMessageAt: new Date(),
        },
      });

      // Save user message
      await ctx.db.mestorMessage.create({
        data: {
          threadId: thread.id,
          role: "user",
          content: input.initialMessage,
        },
      });

      // Generate real AI response via Anthropic
      const aiResponse = await generateMestorResponse(
        ctx.db,
        input.initialMessage,
        [],
        input.strategyId,
      );
      await ctx.db.mestorMessage.create({
        data: {
          threadId: thread.id,
          role: "assistant",
          content: aiResponse,
        },
      });

      await ctx.db.mestorThread.update({
        where: { id: thread.id },
        data: { messageCount: 2 },
      });

      return thread;
    }),

  // ── Send message in existing thread ──────────────────────────────────────
  sendMessage: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.mestorThread.findUnique({
        where: { id: input.threadId },
      });
      if (!thread || thread.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }

      // Save user message
      const userMsg = await ctx.db.mestorMessage.create({
        data: {
          threadId: input.threadId,
          role: "user",
          content: input.content,
        },
      });

      // Load conversation history for context
      const history = await ctx.db.mestorMessage.findMany({
        where: { threadId: input.threadId },
        orderBy: { createdAt: "asc" },
        take: 40,
      });

      // Generate real AI response via Anthropic
      const aiResponse = await generateMestorResponse(
        ctx.db,
        input.content,
        history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        thread.strategyId,
      );
      const assistantMsg = await ctx.db.mestorMessage.create({
        data: {
          threadId: input.threadId,
          role: "assistant",
          content: aiResponse,
        },
      });

      await ctx.db.mestorThread.update({
        where: { id: input.threadId },
        data: {
          messageCount: { increment: 2 },
          lastMessageAt: new Date(),
        },
      });

      return { userMsg, assistantMsg };
    }),

  // ── Delete thread ────────────────────────────────────────────────────────
  deleteThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.mestorThread.findUnique({
        where: { id: input.threadId },
      });
      if (!thread || thread.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }
      return ctx.db.mestorThread.delete({ where: { id: input.threadId } });
    }),
});

// ---------------------------------------------------------------------------
// Real AI response — MESTOR Strategic Advisor powered by Anthropic
// ---------------------------------------------------------------------------
async function generateMestorResponse(
  db: PrismaClient,
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  strategyId?: string | null,
): Promise<string> {
  // Load strategy context if available
  let strategyContext = "";
  if (strategyId) {
    const strategy = await db.strategy.findUnique({
      where: { id: strategyId },
      include: {
        pillars: { select: { type: true, title: true, status: true } },
      },
    });
    if (strategy) {
      const pillarsStatus = strategy.pillars
        .map((p: { type: string; title: string | null; status: string }) => `${p.type}: ${p.title ?? "—"} (${p.status})`)
        .join(", ");
      strategyContext = `
CONTEXTE DE LA MARQUE :
- Nom : ${strategy.brandName}
- Secteur : ${strategy.sector ?? "non défini"}
- Phase : ${strategy.phase}
- Score de cohérence : ${strategy.coherenceScore ?? "non calculé"}/100
- Mode de livraison : ${strategy.deliveryMode ?? "non défini"}
- Maturité : ${strategy.maturityProfile ?? "non défini"}
- Devise : ${strategy.currency ?? "XOF"}
- Budget annuel : ${strategy.annualBudget ?? "non défini"}
- CA visé : ${strategy.targetRevenue ?? "non défini"}
- Piliers : ${pillarsStatus}
`;
    }
  }

  const systemPrompt = `Tu es MESTOR, le conseiller stratégique IA intégré à la plateforme Advertis. Tu es un expert en stratégie de marque, marketing et communication, spécialisé dans la méthodologie ADVERTIS à 8 piliers (Authenticité, Distinction, Valeur, Engagement, Risques, Trajectoire, Implémentation, Stratégie).

RÔLE :
- Tu conseilles les opérateurs et clients sur leur stratégie de marque
- Tu analyses les scores, KPIs et métriques
- Tu proposes des recommandations actionnables et concrètes
- Tu t'exprimes en français de manière professionnelle mais accessible
- Tu utilises le tutoiement professionnel

MODULES ADVERTIS QUE TU CONNAIS :
- IMPULSION : Stratégie & création de marque (8 piliers A-D-V-E-R-T-I-S)
- CAMPAGNES : Gestion 360° des campagnes (statuts, approvals, budgets)
- BRAND OS : Operating system de marque en retainer (Cult Index, Superfans, Community Health)
- GLORY : Outils de production IA (38+ outils créatifs)
- TARSIS : Intelligence marché & signaux concurrentiels
- PILOTIS : Gestion des missions & freelances
- GUILDE : Talents & matching
- SÉRÉNITÉ : Finance & administration
- COCKPIT : Dashboard client partagé

MÉTHODOLOGIE :
- Cult Index = mesure 0-100 du statut culte d'une marque (engagement depth, superfan velocity, community cohesion, brand defense rate, UGC generation, ritual adoption, evangelism)
- AARRR = Acquisition, Activation, Retention, Revenue, Referral
- Scoring de cohérence = alignement entre les 8 piliers

${strategyContext}

RÈGLES :
- Réponds TOUJOURS en français
- Sois concis et structuré (bullet points, numérotation)
- Donne des recommandations opérationnelles, pas seulement théoriques
- Si une stratégie est liée, base tes analyses sur ses données réelles
- Utilise le markdown pour la mise en forme
- Maximum 400 mots par réponse sauf si l'utilisateur demande plus de détails`;

  const messages = [
    ...conversationHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  try {
    const result = await resilientGenerateText({
      model: anthropic(DEFAULT_MODEL),
      system: systemPrompt,
      messages,
      maxOutputTokens: 1500,
      temperature: 0.7,
      label: `mestor-${strategyId ?? "general"}`,
    });
    return result.text;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[MESTOR] AI generation failed: ${message}`);
    return `**MESTOR** — Je rencontre une difficulté technique temporaire. ${message}\n\nVeuillez réessayer dans quelques instants.`;
  }
}
