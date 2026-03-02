// =============================================================================
// ROUTER T.19 — Sérénité (Finance & Admin)
// =============================================================================
// tRPC router for financial operations. Sub-routes: invoices, contracts,
// escrow, commissions, dashboard.
//
// Auth rules:
//   - Operator/Admin: full CRUD on all financial entities
//   - Freelance: read-only access to own invoices/earnings/commissions
// =============================================================================

import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  roleProtectedProcedure,
} from "~/server/api/trpc";
import {
  CreateInvoiceSchema,
  UpdateInvoiceStatusSchema,
  ListInvoicesSchema,
  CreateContractSchema,
  UpdateContractStatusSchema,
  ListContractsSchema,
  CreateEscrowSchema,
  ReleaseEscrowSchema,
  RefundEscrowSchema,
  CalculateCommissionSchema,
  CalculateAllCommissionsSchema,
  FinancialDashboardSchema,
  TalentEarningsSchema,
} from "~/lib/types/serenite-schemas";
import * as financialEngine from "~/server/services/financial-engine";

const opsProcedure = roleProtectedProcedure(["ADMIN", "OPERATOR"]);

export const sereniteRouter = createTRPCRouter({
  // ── Invoices ────────────────────────────────────────────────────────────

  /** Create an invoice (ops). */
  createInvoice: opsProcedure
    .input(CreateInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      return financialEngine.generateInvoice(ctx.session.user.id, input);
    }),

  /** Update invoice status (ops). */
  updateInvoiceStatus: opsProcedure
    .input(UpdateInvoiceStatusSchema)
    .mutation(async ({ input }) => {
      return financialEngine.updateInvoiceStatus(input);
    }),

  /** List invoices (ops: all, freelance: own). */
  listInvoices: protectedProcedure
    .input(ListInvoicesSchema)
    .query(async ({ ctx, input }) => {
      const role = ctx.session.user.role ?? "OPERATOR";
      // Freelance can only see their own invoices
      if (role === "FREELANCE") {
        return financialEngine.getInvoicesByEntity({
          ...input,
          talentId: ctx.session.user.id,
        });
      }
      return financialEngine.getInvoicesByEntity(input);
    }),

  // ── Contracts ───────────────────────────────────────────────────────────

  /** Create a contract (ops). */
  createContract: opsProcedure
    .input(CreateContractSchema)
    .mutation(async ({ ctx, input }) => {
      return financialEngine.createContract(ctx.session.user.id, input);
    }),

  /** Update contract status (ops). */
  updateContractStatus: opsProcedure
    .input(UpdateContractStatusSchema)
    .mutation(async ({ input }) => {
      return financialEngine.updateContractStatus(input);
    }),

  /** List contracts (ops). */
  listContracts: opsProcedure
    .input(ListContractsSchema)
    .query(async ({ input }) => {
      return financialEngine.getContracts(input);
    }),

  // ── Escrow ──────────────────────────────────────────────────────────────

  /** Create escrow for a mission (ops). */
  createEscrow: opsProcedure
    .input(CreateEscrowSchema)
    .mutation(async ({ ctx, input }) => {
      return financialEngine.createEscrow(ctx.session.user.id, input);
    }),

  /** Release escrow (ops). */
  releaseEscrow: opsProcedure
    .input(ReleaseEscrowSchema)
    .mutation(async ({ input }) => {
      return financialEngine.releaseEscrow(input);
    }),

  /** Refund escrow (ops). */
  refundEscrow: opsProcedure
    .input(RefundEscrowSchema)
    .mutation(async ({ input }) => {
      const { db } = await import("~/server/db");
      return db.escrowTransaction.update({
        where: { id: input.id },
        data: { status: "REFUNDED", refundedAt: new Date(), notes: input.notes },
      });
    }),

  /** List escrow transactions for a mission (ops). */
  listEscrows: opsProcedure
    .input(z.object({ missionId: z.string().optional() }))
    .query(async ({ input }) => {
      const { db } = await import("~/server/db");
      return db.escrowTransaction.findMany({
        where: input.missionId ? { missionId: input.missionId } : {},
        orderBy: { createdAt: "desc" },
      });
    }),

  // ── Commissions ─────────────────────────────────────────────────────────

  /** Calculate commission for one talent (ops). */
  calculateCommission: opsProcedure
    .input(CalculateCommissionSchema)
    .mutation(async ({ input }) => {
      return financialEngine.calculateCommission(
        input.missionId,
        input.talentId,
        input.assignmentId,
      );
    }),

  /** Calculate all commissions for a mission (ops). */
  calculateAllCommissions: opsProcedure
    .input(CalculateAllCommissionsSchema)
    .mutation(async ({ input }) => {
      return financialEngine.calculateAllCommissions(input.missionId);
    }),

  /** Get commissions for current user (freelance). */
  getMyCommissions: protectedProcedure.query(async ({ ctx }) => {
    const { db } = await import("~/server/db");
    return db.commission.findMany({
      where: { talentId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  // ── Dashboard ───────────────────────────────────────────────────────────

  /** Financial dashboard KPIs (ops). */
  dashboard: opsProcedure
    .input(FinancialDashboardSchema.optional())
    .query(async ({ input }) => {
      return financialEngine.getFinancialDashboard(input ?? undefined);
    }),

  /** Talent earnings (freelance: own, ops: any). */
  talentEarnings: protectedProcedure
    .input(TalentEarningsSchema)
    .query(async ({ ctx, input }) => {
      const role = ctx.session.user.role ?? "OPERATOR";
      const userId =
        role === "FREELANCE" ? ctx.session.user.id : input.userId;
      return financialEngine.getTalentEarnings(
        userId,
        input.periodStart,
        input.periodEnd,
      );
    }),
});
