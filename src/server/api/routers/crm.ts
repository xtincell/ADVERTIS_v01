// =============================================================================
// ROUTER T.19 — CRM Pipeline Router
// =============================================================================
// Deal management with pipeline stages, kanban view, create/update/transition.
// Uses roleProtectedProcedure for ADMIN/OPERATOR-only mutations.
//
// Procedures:
//   getKanban     — All deals grouped by stage for kanban view
//   getById       — Single deal with full details
//   getStats      — Pipeline summary (count, weighted value, per-stage)
//   create        — Create a new deal
//   update        — Update deal fields
//   transition    — Move deal to a new stage (validates transitions)
//   delete        — Remove a deal
//
// Dependencies:
//   ~/server/api/trpc    — createTRPCRouter, protectedProcedure, roleProtectedProcedure
//   ~/lib/constants      — PIPELINE_STAGES, PIPELINE_VALID_TRANSITIONS, PIPELINE_STAGE_PROBABILITY
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  roleProtectedProcedure,
} from "~/server/api/trpc";
import {
  PIPELINE_STAGES,
  PIPELINE_VALID_TRANSITIONS,
  PIPELINE_STAGE_PROBABILITY,
  type PipelineStage,
} from "~/lib/constants";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const CreateDealSchema = z.object({
  companyName: z.string().min(1, "Nom de l'entreprise requis"),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  amount: z.number().min(0).optional(),
  currency: z.string().default("XOF"),
  source: z.string().optional(),
  sector: z.string().optional(),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionAt: z.date().optional(),
  strategyId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const UpdateDealSchema = z.object({
  id: z.string(),
  companyName: z.string().min(1).optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  amount: z.number().min(0).optional(),
  currency: z.string().optional(),
  probability: z.number().min(0).max(100).optional(),
  source: z.string().optional(),
  sector: z.string().optional(),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionAt: z.date().nullable().optional(),
  lostReason: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const TransitionDealSchema = z.object({
  id: z.string(),
  newStage: z.enum(PIPELINE_STAGES),
  lostReason: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const crmRouter = createTRPCRouter({
  // ── Kanban: Deals grouped by stage ──
  getKanban: protectedProcedure.query(async ({ ctx }) => {
    const deals = await ctx.db.deal.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    const kanban: Record<string, typeof deals> = {};
    for (const stage of PIPELINE_STAGES) {
      kanban[stage] = [];
    }
    for (const deal of deals) {
      const stage = deal.stage as string;
      if (kanban[stage]) {
        kanban[stage].push(deal);
      }
    }
    return kanban;
  }),

  // ── Get by ID ──
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const deal = await ctx.db.deal.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      if (!deal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal introuvable" });
      }
      return deal;
    }),

  // ── Pipeline stats ──
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const deals = await ctx.db.deal.findMany({
      where: { userId: ctx.session.user.id },
      select: { stage: true, amount: true, probability: true },
    });

    let totalDeals = 0;
    let totalValue = 0;
    let weightedValue = 0;
    const perStage: Record<string, { count: number; value: number }> = {};

    for (const stage of PIPELINE_STAGES) {
      perStage[stage] = { count: 0, value: 0 };
    }

    for (const deal of deals) {
      totalDeals++;
      const val = deal.amount ?? 0;
      totalValue += val;
      weightedValue += val * ((deal.probability ?? 0) / 100);
      const s = perStage[deal.stage];
      if (s) {
        s.count++;
        s.value += val;
      }
    }

    return { totalDeals, totalValue, weightedValue, perStage };
  }),

  // ── Create ──
  create: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(CreateDealSchema)
    .mutation(async ({ ctx, input }) => {
      const probability = PIPELINE_STAGE_PROBABILITY.DECOUVERTE;
      return ctx.db.deal.create({
        data: {
          userId: ctx.session.user.id,
          companyName: input.companyName,
          contactName: input.contactName ?? null,
          contactEmail: input.contactEmail || null,
          contactPhone: input.contactPhone ?? null,
          stage: "DECOUVERTE",
          amount: input.amount ?? null,
          currency: input.currency,
          probability,
          source: input.source ?? null,
          sector: input.sector ?? null,
          notes: input.notes ?? null,
          nextAction: input.nextAction ?? null,
          nextActionAt: input.nextActionAt ?? null,
          strategyId: input.strategyId ?? null,
          tags: input.tags ?? [],
        },
      });
    }),

  // ── Update ──
  update: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(UpdateDealSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      // Verify ownership
      const existing = await ctx.db.deal.findFirst({
        where: { id, userId: ctx.session.user.id },
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal introuvable" });
      }
      return ctx.db.deal.update({
        where: { id },
        data: {
          ...(data.companyName !== undefined && { companyName: data.companyName }),
          ...(data.contactName !== undefined && { contactName: data.contactName }),
          ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail || null }),
          ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.currency !== undefined && { currency: data.currency }),
          ...(data.probability !== undefined && { probability: data.probability }),
          ...(data.source !== undefined && { source: data.source }),
          ...(data.sector !== undefined && { sector: data.sector }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.nextAction !== undefined && { nextAction: data.nextAction }),
          ...(data.nextActionAt !== undefined && { nextActionAt: data.nextActionAt }),
          ...(data.lostReason !== undefined && { lostReason: data.lostReason }),
          ...(data.tags !== undefined && { tags: data.tags }),
        },
      });
    }),

  // ── Transition (move to new stage) ──
  transition: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(TransitionDealSchema)
    .mutation(async ({ ctx, input }) => {
      const deal = await ctx.db.deal.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      if (!deal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal introuvable" });
      }

      const currentStage = deal.stage as PipelineStage;
      const validNext = PIPELINE_VALID_TRANSITIONS[currentStage] ?? [];
      if (!validNext.includes(input.newStage)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Transition invalide : ${currentStage} → ${input.newStage}`,
        });
      }

      const newProbability = PIPELINE_STAGE_PROBABILITY[input.newStage];
      const isClosing = input.newStage === "GAGNE" || input.newStage === "PERDU";

      return ctx.db.deal.update({
        where: { id: input.id },
        data: {
          stage: input.newStage,
          probability: newProbability,
          ...(isClosing && { closedAt: new Date() }),
          ...(input.newStage === "PERDU" && input.lostReason && {
            lostReason: input.lostReason,
          }),
        },
      });
    }),

  // ── Delete ──
  delete: roleProtectedProcedure(["ADMIN", "OPERATOR"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deal = await ctx.db.deal.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      if (!deal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal introuvable" });
      }
      await ctx.db.deal.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
