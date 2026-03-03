// =============================================================================
// ROUTER T.30 — MESTOR AI (AI Strategic Advisor)
// Conversation thread management for the AI copilot.
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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

      // Generate a placeholder AI response (real AI integration would go here)
      const aiResponse = generatePlaceholderResponse(input.initialMessage, input.strategyId);
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

      // Generate placeholder AI response
      const aiResponse = generatePlaceholderResponse(input.content, thread.strategyId);
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
// Placeholder AI response (to be replaced with real AI integration)
// ---------------------------------------------------------------------------
function generatePlaceholderResponse(userMessage: string, strategyId?: string | null): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("cohérence") || lower.includes("coherence") || lower.includes("score")) {
    return `📊 **Analyse du score de cohérence**\n\nPour améliorer votre score de cohérence, je recommande :\n\n1. **Alignement piliers A-D-V** — Vérifiez que votre proposition de valeur est cohérente avec votre positionnement authentique\n2. **Consistance du message** — Unifiez le ton et les messages clés à travers tous les touchpoints\n3. **Révision de l'engagement** — Assurez-vous que votre stratégie AARRR est alignée avec vos objectifs de marque\n\n${strategyId ? "Je peux approfondir l'analyse de cette stratégie spécifique." : "Sélectionnez une stratégie pour une analyse personnalisée."}`;
  }

  if (lower.includes("risque") || lower.includes("risk")) {
    return `⚠️ **Évaluation des risques**\n\nLes principaux facteurs de risque à surveiller :\n\n1. **Risque de marché** — Évolution de la concurrence et des tendances\n2. **Risque opérationnel** — Capacité d'exécution et ressources\n3. **Risque de marque** — Perception et e-réputation\n\nConsultez le radar de risque dans votre cockpit pour un suivi en temps réel.`;
  }

  if (lower.includes("budget") || lower.includes("roi")) {
    return `💰 **Recommandation budgétaire**\n\nPour optimiser votre ROI :\n\n1. **Répartition 70/20/10** — 70% sur les canaux performants prouvés, 20% en optimisation, 10% en test\n2. **Attribution multi-touch** — Suivez l'impact de chaque canal via le module d'attribution\n3. **Saisonnalité** — Adaptez les dépenses aux pics d'attention de votre audience`;
  }

  return `🤖 **MESTOR — Conseiller stratégique**\n\nJ'ai analysé votre demande. Voici mes recommandations :\n\n1. **Diagnostic** — Commencez par un audit complet de vos piliers ADVERTIS\n2. **Priorisation** — Identifiez les 3 leviers à plus fort impact\n3. **Exécution** — Utilisez le sprint 90 jours pour structurer les actions\n\nPosez-moi une question plus spécifique sur votre stratégie, vos scores, ou vos KPIs pour que je puisse vous donner des recommandations ciblées.`;
}
