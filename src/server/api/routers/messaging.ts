// =============================================================================
// ROUTER T.29 — Messaging (Messagerie)
// Internal conversations between platform users.
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// ---------------------------------------------------------------------------
// Helpers — safe JSON field parsing
// ---------------------------------------------------------------------------
function parseParticipants(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === "string");
  return [];
}

function parseReadBy(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === "string");
  return [];
}

export const messagingRouter = createTRPCRouter({
  // ── List user's conversations ────────────────────────────────────────────
  listConversations: protectedProcedure
    .input(
      z.object({
        type: z.string().optional(), // DIRECT, GROUP, STRATEGY, MISSION
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Prisma doesn't support JSON array contains for all DBs,
      // so we fetch all and filter in JS for now.
      const conversations = await ctx.db.conversation.findMany({
        orderBy: { lastMessageAt: "desc" },
      });

      // Filter to conversations where user is a participant
      const userConvos = conversations.filter((c) => {
        const participants = parseParticipants(c.participants);
        return participants.includes(userId);
      });

      // Optionally filter by type
      if (input?.type) {
        return userConvos.filter((c) => c.type === input.type);
      }

      return userConvos;
    }),

  // ── Get conversation with messages ───────────────────────────────────────
  getConversation: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const convo = await ctx.db.conversation.findUnique({
        where: { id: input.id },
      });
      if (!convo) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });

      // Verify user is a participant
      const participants = parseParticipants(convo.participants);
      if (!participants.includes(ctx.session.user.id)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" });
      }

      const messages = await ctx.db.message.findMany({
        where: { conversationId: input.id },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (messages.length > input.limit) {
        const next = messages.pop();
        nextCursor = next?.id;
      }

      return {
        conversation: convo,
        messages: messages.reverse(), // Chronological
        nextCursor,
      };
    }),

  // ── Start a new conversation ─────────────────────────────────────────────
  createConversation: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        type: z.enum(["DIRECT", "GROUP", "STRATEGY", "MISSION"]).default("DIRECT"),
        participantIds: z.array(z.string()).min(1),
        strategyId: z.string().optional(),
        missionId: z.string().optional(),
        initialMessage: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const allParticipants = [...new Set([userId, ...input.participantIds])];

      // For DIRECT conversations, check if one already exists between these 2 users
      if (input.type === "DIRECT" && allParticipants.length === 2) {
        const existing = await ctx.db.conversation.findMany({
          where: { type: "DIRECT" },
        });
        const match = existing.find((c) => {
          const p = parseParticipants(c.participants);
          return (
            p.length === 2 &&
            allParticipants.every((id) => p.includes(id))
          );
        });
        if (match) {
          // Add message to existing convo
          const userName = ctx.session.user.name ?? ctx.session.user.email ?? "Utilisateur";
          const message = await ctx.db.message.create({
            data: {
              conversationId: match.id,
              senderId: userId,
              senderName: userName,
              body: input.initialMessage,
              type: "TEXT",
              readBy: [userId],
            },
          });
          await ctx.db.conversation.update({
            where: { id: match.id },
            data: {
              lastMessage: input.initialMessage.slice(0, 200),
              lastMessageAt: new Date(),
              lastMessageBy: userId,
            },
          });
          return { conversation: match, message };
        }
      }

      // Create new conversation
      const userName = ctx.session.user.name ?? ctx.session.user.email ?? "Utilisateur";
      const convo = await ctx.db.conversation.create({
        data: {
          title: input.title,
          type: input.type,
          participants: allParticipants,
          strategyId: input.strategyId,
          missionId: input.missionId,
          lastMessage: input.initialMessage.slice(0, 200),
          lastMessageAt: new Date(),
          lastMessageBy: userId,
        },
      });

      const message = await ctx.db.message.create({
        data: {
          conversationId: convo.id,
          senderId: userId,
          senderName: userName,
          body: input.initialMessage,
          type: "TEXT",
          readBy: [userId],
        },
      });

      return { conversation: convo, message };
    }),

  // ── Send message ─────────────────────────────────────────────────────────
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        body: z.string().min(1),
        type: z.enum(["TEXT", "FILE", "ACTION"]).default("TEXT"),
        attachments: z.array(z.object({
          name: z.string(),
          url: z.string(),
          type: z.string(),
          size: z.number().optional(),
        })).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userName = ctx.session.user.name ?? ctx.session.user.email ?? "Utilisateur";

      // Verify participant
      const convo = await ctx.db.conversation.findUnique({
        where: { id: input.conversationId },
      });
      if (!convo) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      const participants = parseParticipants(convo.participants);
      if (!participants.includes(userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" });
      }

      const message = await ctx.db.message.create({
        data: {
          conversationId: input.conversationId,
          senderId: userId,
          senderName: userName,
          body: input.body,
          type: input.type,
          attachments: input.attachments ?? undefined,
          readBy: [userId],
        },
      });

      // Update conversation metadata
      await ctx.db.conversation.update({
        where: { id: input.conversationId },
        data: {
          lastMessage: input.body.slice(0, 200),
          lastMessageAt: new Date(),
          lastMessageBy: userId,
        },
      });

      return message;
    }),

  // ── Mark messages as read ────────────────────────────────────────────────
  markRead: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get unread messages
      const messages = await ctx.db.message.findMany({
        where: { conversationId: input.conversationId },
      });

      // Add userId to readBy for each unread message
      for (const msg of messages) {
        const readBy = parseReadBy(msg.readBy);
        if (!readBy.includes(userId)) {
          await ctx.db.message.update({
            where: { id: msg.id },
            data: { readBy: [...readBy, userId] },
          });
        }
      }

      return { marked: messages.length };
    }),

  // ── Unread count ─────────────────────────────────────────────────────────
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all user conversations
    const conversations = await ctx.db.conversation.findMany();
    const userConvos = conversations.filter((c) => {
      const participants = parseParticipants(c.participants);
      return participants.includes(userId);
    });

    let unread = 0;
    for (const convo of userConvos) {
      // Fetch messages not from this user, then check readBy in JS
      const messages = await ctx.db.message.findMany({
        where: {
          conversationId: convo.id,
          senderId: { not: userId },
        },
        select: { readBy: true },
      });

      // Count messages where userId is NOT in readBy
      for (const msg of messages) {
        const readBy = parseReadBy(msg.readBy);
        if (!readBy.includes(userId)) {
          unread++;
        }
      }
    }

    return { unread };
  }),
});
