// =============================================================================
// ROUTER T.18 — Deliverables Router
// =============================================================================
// CRUD for UPGRADERS deliverables (Phase 5):
//   bigIdeaKits, creativeStrategy, operationalBudget, chrono, partners,
//   multiMarkets, funnelMapping, qualityChecklist.
// Each sub-router checks strategy ownership before mutations.
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  CreateBigIdeaKitSchema,
  UpdateBigIdeaKitSchema,
  UpsertCreativeStrategySchema,
  UpsertOperationalBudgetSchema,
  CreateChronoTaskSchema,
  UpdateChronoTaskSchema,
  CreatePartnerSchema,
  UpdatePartnerSchema,
  UpsertMarketAdaptationSchema,
  UpsertFunnelMappingSchema,
  UpsertQualityChecklistSchema,
  DEFAULT_CHECKLIST_CATEGORIES,
  CreativeStrategyDataSchema,
  FunnelMappingContentSchema,
} from "~/lib/types/deliverable-schemas";
import { db as prismaDb } from "~/server/db";
import { checkAiRateLimit } from "~/server/services/rate-limiter";
import {
  generateBigIdeaKit,
  generateCreativeStrategy,
  generateOperationalBudget,
  generateChronoTasks,
  generatePartners,
  generateMarketAdaptation,
  generateFunnelMapping,
} from "~/server/services/deliverable-generator";

// ---------------------------------------------------------------------------
// Helper — verify strategy ownership
// ---------------------------------------------------------------------------

async function verifyStrategyOwnership(
  db: typeof prismaDb,
  strategyId: string,
  userId: string,
) {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: { id: true, userId: true },
  });
  if (!strategy || strategy.userId !== userId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Stratégie non trouvée",
    });
  }
  return strategy;
}

const strategyIdInput = z.object({ strategyId: z.string().min(1) });

function enforceRateLimit(userId: string) {
  const { allowed, error } = checkAiRateLimit(userId);
  if (!allowed) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: error });
  }
}

// ---------------------------------------------------------------------------
// T04 — Big Idea Kits
// ---------------------------------------------------------------------------

const bigIdeaKitsRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(strategyIdInput)
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.bigIdeaKit.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: protectedProcedure
    .input(CreateBigIdeaKitSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.bigIdeaKit.create({
        data: {
          strategyId: input.strategyId,
          occasion: input.occasion,
          insight: input.insight,
          ideas: input.ideas,
          funnelMapping: input.funnelMapping ?? undefined,
          status: input.status,
          generatedBy: input.generatedBy,
        },
      });
    }),

  update: protectedProcedure
    .input(UpdateBigIdeaKitSchema)
    .mutation(async ({ ctx, input }) => {
      const kit = await ctx.db.bigIdeaKit.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!kit) throw new TRPCError({ code: "NOT_FOUND" });
      await verifyStrategyOwnership(ctx.db, kit.strategyId, ctx.session.user.id);

      const { id, ...data } = input;
      return ctx.db.bigIdeaKit.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const kit = await ctx.db.bigIdeaKit.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!kit) throw new TRPCError({ code: "NOT_FOUND" });
      await verifyStrategyOwnership(ctx.db, kit.strategyId, ctx.session.user.id);
      return ctx.db.bigIdeaKit.delete({ where: { id: input.id } });
    }),

  generate: protectedProcedure
    .input(z.object({
      strategyId: z.string().min(1),
      occasion: z.string().min(1).max(200),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      enforceRateLimit(ctx.session.user.id);

      const result = await generateBigIdeaKit(
        input.strategyId,
        input.occasion,
        ctx.session.user.id,
      );

      return ctx.db.bigIdeaKit.create({
        data: {
          strategyId: input.strategyId,
          occasion: result.occasion,
          insight: result.insight,
          ideas: result.ideas,
          status: "draft",
          generatedBy: "ai",
        },
      });
    }),
});

// ---------------------------------------------------------------------------
// T06 — Creative Strategy
// ---------------------------------------------------------------------------

const creativeStrategyRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(strategyIdInput)
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.creativeStrategy.findUnique({
        where: { strategyId: input.strategyId },
      });
    }),

  upsert: protectedProcedure
    .input(UpsertCreativeStrategySchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.creativeStrategy.upsert({
        where: { strategyId: input.strategyId },
        create: {
          strategyId: input.strategyId,
          content: input.content,
          status: input.status,
        },
        update: {
          content: input.content,
          status: input.status,
          version: { increment: 1 },
        },
      });
    }),

  generate: protectedProcedure
    .input(strategyIdInput)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      enforceRateLimit(ctx.session.user.id);

      const data = await generateCreativeStrategy(input.strategyId, ctx.session.user.id);

      return ctx.db.creativeStrategy.upsert({
        where: { strategyId: input.strategyId },
        create: {
          strategyId: input.strategyId,
          content: data as never,
          status: "draft",
        },
        update: {
          content: data as never,
          status: "draft",
          version: { increment: 1 },
        },
      });
    }),
});

// ---------------------------------------------------------------------------
// M1 — Operational Budget (3 layers)
// ---------------------------------------------------------------------------

const operationalBudgetRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(strategyIdInput)
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.operationalBudget.findUnique({
        where: { strategyId: input.strategyId },
      });
    }),

  upsert: protectedProcedure
    .input(UpsertOperationalBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.operationalBudget.upsert({
        where: { strategyId: input.strategyId },
        create: {
          strategyId: input.strategyId,
          layer1Vision: input.layer1Vision,
          layer2Detail: input.layer2Detail,
          layer3Scenarios: input.layer3Scenarios,
          currency: input.currency,
        },
        update: {
          layer1Vision: input.layer1Vision,
          layer2Detail: input.layer2Detail,
          layer3Scenarios: input.layer3Scenarios,
          currency: input.currency,
        },
      });
    }),

  generate: protectedProcedure
    .input(strategyIdInput)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      enforceRateLimit(ctx.session.user.id);

      const result = await generateOperationalBudget(input.strategyId, ctx.session.user.id);

      return ctx.db.operationalBudget.upsert({
        where: { strategyId: input.strategyId },
        create: {
          strategyId: input.strategyId,
          layer1Vision: result.layer1Vision as never,
          layer2Detail: result.layer2Detail as never,
          layer3Scenarios: result.layer3Scenarios as never,
          currency: result.currency,
        },
        update: {
          layer1Vision: result.layer1Vision as never,
          layer2Detail: result.layer2Detail as never,
          layer3Scenarios: result.layer3Scenarios as never,
          currency: result.currency,
        },
      });
    }),
});

// ---------------------------------------------------------------------------
// M2 — Chrono-Architecture
// ---------------------------------------------------------------------------

const chronoRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(strategyIdInput)
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.chronoTask.findMany({
        where: { strategyId: input.strategyId },
        orderBy: [{ week: "asc" }, { startDate: "asc" }],
      });
    }),

  create: protectedProcedure
    .input(CreateChronoTaskSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.chronoTask.create({ data: input });
    }),

  update: protectedProcedure
    .input(UpdateChronoTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.chronoTask.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!task) throw new TRPCError({ code: "NOT_FOUND" });
      await verifyStrategyOwnership(ctx.db, task.strategyId, ctx.session.user.id);

      const { id, ...data } = input;
      return ctx.db.chronoTask.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.chronoTask.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!task) throw new TRPCError({ code: "NOT_FOUND" });
      await verifyStrategyOwnership(ctx.db, task.strategyId, ctx.session.user.id);
      return ctx.db.chronoTask.delete({ where: { id: input.id } });
    }),

  generate: protectedProcedure
    .input(strategyIdInput)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      enforceRateLimit(ctx.session.user.id);

      const tasks = await generateChronoTasks(input.strategyId, ctx.session.user.id);

      // Delete existing tasks and replace with generated ones
      await ctx.db.chronoTask.deleteMany({ where: { strategyId: input.strategyId } });

      const created = await Promise.all(
        tasks.map((t) =>
          ctx.db.chronoTask.create({
            data: {
              strategyId: input.strategyId,
              title: t.title,
              description: t.description,
              startDate: new Date(t.startDate),
              endDate: new Date(t.endDate),
              week: t.week,
              phase: t.phase,
              owner: t.owner,
              status: t.status ?? "pending",
              priority: t.priority ?? "P1",
              dependencies: t.dependencies ?? [],
              isValidationMilestone: t.isValidationMilestone ?? false,
            },
          }),
        ),
      );
      return created;
    }),
});

// ---------------------------------------------------------------------------
// M3 — Partners Directory
// ---------------------------------------------------------------------------

const partnersRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(strategyIdInput)
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.partner.findMany({
        where: { strategyId: input.strategyId },
        orderBy: [{ type: "asc" }, { name: "asc" }],
      });
    }),

  create: protectedProcedure
    .input(CreatePartnerSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.partner.create({ data: input });
    }),

  update: protectedProcedure
    .input(UpdatePartnerSchema)
    .mutation(async ({ ctx, input }) => {
      const partner = await ctx.db.partner.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!partner) throw new TRPCError({ code: "NOT_FOUND" });
      await verifyStrategyOwnership(ctx.db, partner.strategyId, ctx.session.user.id);

      const { id, ...data } = input;
      return ctx.db.partner.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const partner = await ctx.db.partner.findUnique({
        where: { id: input.id },
        select: { strategyId: true },
      });
      if (!partner) throw new TRPCError({ code: "NOT_FOUND" });
      await verifyStrategyOwnership(ctx.db, partner.strategyId, ctx.session.user.id);
      return ctx.db.partner.delete({ where: { id: input.id } });
    }),

  generate: protectedProcedure
    .input(z.object({
      strategyId: z.string().min(1),
      markets: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      enforceRateLimit(ctx.session.user.id);

      const partners = await generatePartners(
        input.strategyId,
        ctx.session.user.id,
        input.markets,
      );

      const created = await Promise.all(
        partners.map((p) =>
          ctx.db.partner.create({
            data: {
              strategyId: input.strategyId,
              name: p.name,
              type: p.type,
              category: p.category,
              metrics: p.metrics as never,
              costEstimate: p.costEstimate,
              currency: "XAF",
              market: p.market,
              notes: p.notes,
              status: "prospect",
            },
          }),
        ),
      );
      return created;
    }),
});

// ---------------------------------------------------------------------------
// M5 — Multi-Markets Adaptations
// ---------------------------------------------------------------------------

const multiMarketsRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(strategyIdInput)
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.marketAdaptation.findMany({
        where: { strategyId: input.strategyId },
        orderBy: { country: "asc" },
      });
    }),

  upsert: protectedProcedure
    .input(UpsertMarketAdaptationSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.marketAdaptation.upsert({
        where: {
          strategyId_country: {
            strategyId: input.strategyId,
            country: input.country,
          },
        },
        create: input,
        update: {
          linguistic: input.linguistic,
          cultural: input.cultural,
          distribution: input.distribution,
          media: input.media,
          regulatory: input.regulatory,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ strategyId: z.string().min(1), country: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.marketAdaptation.delete({
        where: {
          strategyId_country: {
            strategyId: input.strategyId,
            country: input.country,
          },
        },
      });
    }),

  generate: protectedProcedure
    .input(z.object({
      strategyId: z.string().min(1),
      countryCode: z.string().min(1).max(5),
      countryName: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      enforceRateLimit(ctx.session.user.id);

      const adaptation = await generateMarketAdaptation(
        input.strategyId,
        input.countryCode,
        input.countryName,
        ctx.session.user.id,
      );

      return ctx.db.marketAdaptation.upsert({
        where: {
          strategyId_country: {
            strategyId: input.strategyId,
            country: input.countryCode,
          },
        },
        create: {
          strategyId: input.strategyId,
          country: input.countryCode,
          linguistic: adaptation.linguistic as never,
          cultural: adaptation.cultural as never,
          distribution: adaptation.distribution as never,
          media: adaptation.media as never,
          regulatory: adaptation.regulatory as never,
        },
        update: {
          linguistic: adaptation.linguistic as never,
          cultural: adaptation.cultural as never,
          distribution: adaptation.distribution as never,
          media: adaptation.media as never,
          regulatory: adaptation.regulatory as never,
        },
      });
    }),
});

// ---------------------------------------------------------------------------
// M7 — Funnel Mapping
// ---------------------------------------------------------------------------

const funnelMappingRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(strategyIdInput)
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.funnelMapping.findUnique({
        where: { strategyId: input.strategyId },
      });
    }),

  upsert: protectedProcedure
    .input(UpsertFunnelMappingSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.funnelMapping.upsert({
        where: { strategyId: input.strategyId },
        create: {
          strategyId: input.strategyId,
          content: input.content,
        },
        update: {
          content: input.content,
        },
      });
    }),

  generate: protectedProcedure
    .input(strategyIdInput)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      enforceRateLimit(ctx.session.user.id);

      const data = await generateFunnelMapping(input.strategyId, ctx.session.user.id);

      return ctx.db.funnelMapping.upsert({
        where: { strategyId: input.strategyId },
        create: {
          strategyId: input.strategyId,
          content: data as never,
        },
        update: {
          content: data as never,
        },
      });
    }),
});

// ---------------------------------------------------------------------------
// Quality Checklist
// ---------------------------------------------------------------------------

const qualityChecklistRouter = createTRPCRouter({
  getByStrategy: protectedProcedure
    .input(strategyIdInput)
    .query(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.qualityChecklist.findUnique({
        where: { strategyId: input.strategyId },
      });
    }),

  upsert: protectedProcedure
    .input(UpsertQualityChecklistSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);
      return ctx.db.qualityChecklist.upsert({
        where: { strategyId: input.strategyId },
        create: {
          strategyId: input.strategyId,
          items: input.items,
          overallScore: input.overallScore,
        },
        update: {
          items: input.items,
          overallScore: input.overallScore,
        },
      });
    }),

  seedDefaults: protectedProcedure
    .input(strategyIdInput)
    .mutation(async ({ ctx, input }) => {
      await verifyStrategyOwnership(ctx.db, input.strategyId, ctx.session.user.id);

      const existing = await ctx.db.qualityChecklist.findUnique({
        where: { strategyId: input.strategyId },
      });
      if (existing) return existing;

      let idx = 0;
      const items = DEFAULT_CHECKLIST_CATEGORIES.flatMap((cat) =>
        cat.items.map((label) => ({
          id: `chk-${++idx}`,
          category: cat.category,
          label,
          checked: false,
        })),
      );

      return ctx.db.qualityChecklist.create({
        data: {
          strategyId: input.strategyId,
          items,
          overallScore: 0,
        },
      });
    }),
});

// ---------------------------------------------------------------------------
// Combined Deliverables Router
// ---------------------------------------------------------------------------

export const deliverablesRouter = createTRPCRouter({
  bigIdeaKits: bigIdeaKitsRouter,
  creativeStrategy: creativeStrategyRouter,
  operationalBudget: operationalBudgetRouter,
  chrono: chronoRouter,
  partners: partnersRouter,
  multiMarkets: multiMarketsRouter,
  funnelMapping: funnelMappingRouter,
  qualityChecklist: qualityChecklistRouter,
});
