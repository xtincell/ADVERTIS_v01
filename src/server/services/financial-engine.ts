// =============================================================================
// MODULE 20 — Financial Engine (Sérénité)
// =============================================================================
// Financial lifecycle: invoices, contracts, escrow, commissions.
// Automates the admin overhead that kills creative agencies.
//
// Public API:
//   1.  generateInvoice()         — Auto-generate from mission assignments
//   2.  updateInvoiceStatus()     — Status transitions (DRAFT→SENT→PAID)
//   3.  getInvoicesByEntity()     — By client or talent, paginated
//   4.  createContract()          — Create contract
//   5.  updateContractStatus()    — Status transitions
//   6.  getContracts()            — By party or mission, paginated
//   7.  createEscrow()            — Escrow funds for a mission
//   8.  releaseEscrow()           — Release (full/partial)
//   9.  calculateCommission()     — Calculate for one talent on a mission
//  10.  calculateAllCommissions() — Batch for entire mission
//  11.  getFinancialDashboard()   — KPIs agrégés
//  12.  generateRefNumber()       — Sequential reference numbering
//  13.  getTalentEarnings()       — Cumulative + per-period earnings
//
// Dependencies:
//   - ~/server/db (Prisma — Invoice, InvoiceItem, Contract, EscrowTransaction,
//                   Commission, MissionAssignment, TalentProfile)
//   - ~/lib/constants (COMMISSION_RATES, TALENT_LEVELS)
// =============================================================================

import { db } from "~/server/db";
import {
  COMMISSION_RATES,
  type TalentLevel,
} from "~/lib/constants";
import type {
  CreateInvoiceInput,
  UpdateInvoiceStatusInput,
  ListInvoicesInput,
  CreateContractInput,
  UpdateContractStatusInput,
  ListContractsInput,
  CreateEscrowInput,
  ReleaseEscrowInput,
  FinancialDashboardInput,
} from "~/lib/types/serenite-schemas";

// ── 1. Generate Invoice ─────────────────────────────────────────────────────

export async function generateInvoice(
  createdBy: string,
  data: CreateInvoiceInput,
) {
  const refNumber = await generateRefNumber(data.type);

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const taxAmount = subtotal * ((data.taxRate ?? 0) / 100);
  const total = subtotal + taxAmount;

  return db.invoice.create({
    data: {
      refNumber,
      type: data.type,
      clientId: data.clientId,
      talentId: data.talentId,
      missionId: data.missionId,
      subtotal,
      taxRate: data.taxRate ?? 0,
      taxAmount,
      total,
      currency: data.currency ?? "XAF",
      dueDate: data.dueDate,
      notes: data.notes,
      terms: data.terms,
      createdBy,
      items: {
        create: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity ?? 1,
          unitPrice: item.unitPrice,
          total: (item.quantity ?? 1) * item.unitPrice,
          assignmentId: item.assignmentId,
        })),
      },
    },
    include: { items: true },
  });
}

// ── 2. Update Invoice Status ────────────────────────────────────────────────

export async function updateInvoiceStatus(data: UpdateInvoiceStatusInput) {
  const update: Record<string, unknown> = { status: data.status };

  if (data.status === "SENT") {
    update.issuedAt = new Date();
  }
  if (data.status === "PAID") {
    update.paidAt = data.paidAt ?? new Date();
  }

  return db.invoice.update({
    where: { id: data.id },
    data: update,
    include: { items: true },
  });
}

// ── 3. Get Invoices ─────────────────────────────────────────────────────────

export async function getInvoicesByEntity(input: ListInvoicesInput) {
  const where: Record<string, unknown> = {};
  if (input.clientId) where.clientId = input.clientId;
  if (input.talentId) where.talentId = input.talentId;
  if (input.missionId) where.missionId = input.missionId;
  if (input.status) where.status = input.status;
  if (input.type) where.type = input.type;

  const [items, total] = await Promise.all([
    db.invoice.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    db.invoice.count({ where }),
  ]);

  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.ceil(total / input.pageSize),
  };
}

// ── 4. Create Contract ──────────────────────────────────────────────────────

export async function createContract(
  createdBy: string,
  data: CreateContractInput,
) {
  const refNumber = await generateRefNumber(data.type);

  return db.contract.create({
    data: {
      refNumber,
      type: data.type,
      partyAId: data.partyAId,
      partyBId: data.partyBId,
      missionId: data.missionId,
      title: data.title,
      content: data.content,
      templateId: data.templateId,
      startDate: data.startDate,
      endDate: data.endDate,
      createdBy,
    },
  });
}

// ── 5. Update Contract Status ───────────────────────────────────────────────

export async function updateContractStatus(data: UpdateContractStatusInput) {
  const update: Record<string, unknown> = { status: data.status };

  if (data.status === "SENT") {
    update.sentAt = new Date();
  }
  if (data.status === "SIGNED") {
    update.signedAt = data.signedAt ?? new Date();
    if (data.signatureData) update.signatureData = data.signatureData;
  }

  return db.contract.update({
    where: { id: data.id },
    data: update,
  });
}

// ── 6. Get Contracts ────────────────────────────────────────────────────────

export async function getContracts(input: ListContractsInput) {
  const where: Record<string, unknown> = {};
  if (input.missionId) where.missionId = input.missionId;
  if (input.status) where.status = input.status;
  if (input.type) where.type = input.type;
  if (input.partyId) {
    where.OR = [{ partyAId: input.partyId }, { partyBId: input.partyId }];
  }

  const [items, total] = await Promise.all([
    db.contract.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    db.contract.count({ where: where as any }),
  ]);

  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.ceil(total / input.pageSize),
  };
}

// ── 7. Create Escrow ────────────────────────────────────────────────────────

export async function createEscrow(
  createdBy: string,
  data: CreateEscrowInput,
) {
  return db.escrowTransaction.create({
    data: {
      missionId: data.missionId,
      amount: data.amount,
      currency: data.currency ?? "XAF",
      status: "HELD",
      heldAt: new Date(),
      releaseCondition: data.releaseCondition,
      createdBy,
    },
  });
}

// ── 8. Release Escrow ───────────────────────────────────────────────────────

export async function releaseEscrow(data: ReleaseEscrowInput) {
  const escrow = await db.escrowTransaction.findUnique({
    where: { id: data.id },
  });
  if (!escrow) throw new Error("Escrow transaction not found");
  if (escrow.status !== "HELD" && escrow.status !== "PARTIALLY_RELEASED") {
    throw new Error(`Cannot release escrow in status ${escrow.status}`);
  }

  const releaseAmount = data.amount ?? escrow.amount;
  const alreadyReleased = escrow.releasedAmount ?? 0;
  const totalReleased = alreadyReleased + releaseAmount;
  const isFullRelease = totalReleased >= escrow.amount;

  return db.escrowTransaction.update({
    where: { id: data.id },
    data: {
      status: isFullRelease ? "RELEASED" : "PARTIALLY_RELEASED",
      releasedAt: isFullRelease ? new Date() : undefined,
      releasedAmount: totalReleased,
      notes: data.notes,
    },
  });
}

// ── 9. Calculate Commission ─────────────────────────────────────────────────

export async function calculateCommission(
  missionId: string,
  talentId: string,
  assignmentId?: string,
) {
  // Get talent level for commission rate
  const profile = await db.talentProfile.findUnique({
    where: { userId: talentId },
  });
  const level = (profile?.level ?? "NOVICE") as TalentLevel;
  const rate = COMMISSION_RATES[level];

  // Get assignment gross amount
  let grossAmount = 0;
  if (assignmentId) {
    const assignment = await db.missionAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (assignment) {
      grossAmount = (assignment.dayRate ?? 0) * (assignment.actualDays ?? assignment.estimatedDays ?? 0);
    }
  } else {
    // Sum all assignments for this talent on this mission
    const assignments = await db.missionAssignment.findMany({
      where: { missionId, userId: talentId },
    });
    grossAmount = assignments.reduce(
      (sum, a) => sum + (a.dayRate ?? 0) * (a.actualDays ?? a.estimatedDays ?? 0),
      0,
    );
  }

  const commissionAmount = grossAmount * rate;
  const netAmount = grossAmount - commissionAmount;

  return db.commission.upsert({
    where: { missionId_talentId: { missionId, talentId } },
    create: {
      missionId,
      talentId,
      assignmentId,
      grossAmount,
      commissionRate: rate,
      commissionAmount,
      netAmount,
    },
    update: {
      grossAmount,
      commissionRate: rate,
      commissionAmount,
      netAmount,
      assignmentId,
    },
  });
}

// ── 10. Calculate All Commissions ───────────────────────────────────────────

export async function calculateAllCommissions(missionId: string) {
  const assignments = await db.missionAssignment.findMany({
    where: { missionId },
    select: { userId: true, id: true },
  });

  const uniqueTalents = [...new Set(assignments.map((a) => a.userId))];
  const results = await Promise.all(
    uniqueTalents.map((talentId) => calculateCommission(missionId, talentId)),
  );

  return results;
}

// ── 11. Financial Dashboard ─────────────────────────────────────────────────

export async function getFinancialDashboard(input?: FinancialDashboardInput) {
  const dateFilter: Record<string, unknown> = {};
  if (input?.periodStart) dateFilter.gte = input.periodStart;
  if (input?.periodEnd) dateFilter.lte = input.periodEnd;
  const hasDateFilter = Object.keys(dateFilter).length > 0;

  const invoiceWhere = hasDateFilter ? { createdAt: dateFilter } : {};

  const [
    totalRevenue,
    unpaidInvoices,
    paidInvoices,
    escrowHeld,
    commissionTotals,
    invoicesByStatus,
    recentInvoices,
  ] = await Promise.all([
    // Total revenue (all paid invoices)
    db.invoice.aggregate({
      _sum: { total: true },
      where: { ...invoiceWhere, status: "PAID", type: "FACTURE" },
    }),
    // Unpaid invoices total
    db.invoice.aggregate({
      _sum: { total: true },
      where: { ...invoiceWhere, status: { in: ["SENT", "ACCEPTED", "OVERDUE"] }, type: "FACTURE" },
    }),
    // Paid invoices count
    db.invoice.count({ where: { ...invoiceWhere, status: "PAID" } }),
    // Escrow held
    db.escrowTransaction.aggregate({
      _sum: { amount: true },
      where: { status: { in: ["HELD", "PARTIALLY_RELEASED"] } },
    }),
    // Commission totals
    db.commission.aggregate({
      _sum: { commissionAmount: true, netAmount: true, grossAmount: true },
    }),
    // Invoices by status
    db.invoice.groupBy({
      by: ["status"],
      _count: true,
      _sum: { total: true },
    }),
    // Recent invoices
    db.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true },
    }),
  ]);

  return {
    totalRevenue: totalRevenue._sum.total ?? 0,
    unpaidAmount: unpaidInvoices._sum.total ?? 0,
    paidInvoicesCount: paidInvoices,
    escrowHeld: escrowHeld._sum.amount ?? 0,
    totalCommissions: commissionTotals._sum.commissionAmount ?? 0,
    totalNetPaid: commissionTotals._sum.netAmount ?? 0,
    totalGross: commissionTotals._sum.grossAmount ?? 0,
    avgCommissionRate:
      commissionTotals._sum.grossAmount
        ? (commissionTotals._sum.commissionAmount ?? 0) /
          commissionTotals._sum.grossAmount
        : 0,
    invoicesByStatus: invoicesByStatus.map((g) => ({
      status: g.status,
      count: g._count,
      total: g._sum.total ?? 0,
    })),
    recentInvoices,
  };
}

// ── 12. Generate Ref Number ─────────────────────────────────────────────────

export async function generateRefNumber(type: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefixMap: Record<string, string> = {
    DEVIS: "DEV",
    FACTURE: "INV",
    AVOIR: "AVR",
    NDA: "NDA",
    PRESTATION: "CTR",
    CESSION_DROITS: "CES",
    PORTAGE: "PRT",
  };
  const prefix = prefixMap[type] ?? "REF";

  // Count existing refs for this type this year
  const pattern = `${prefix}-${year}-%`;
  const count = await db.invoice.count({
    where: { refNumber: { startsWith: `${prefix}-${year}-` } },
  });
  // Also check contracts
  const contractCount = await db.contract.count({
    where: { refNumber: { startsWith: `${prefix}-${year}-` } },
  });
  const total = count + contractCount;

  return `${prefix}-${year}-${String(total + 1).padStart(4, "0")}`;
}

// ── 13. Talent Earnings ─────────────────────────────────────────────────────

export async function getTalentEarnings(
  userId: string,
  periodStart?: Date,
  periodEnd?: Date,
) {
  const where: Record<string, unknown> = { talentId: userId };
  if (periodStart || periodEnd) {
    where.createdAt = {};
    if (periodStart) (where.createdAt as any).gte = periodStart;
    if (periodEnd) (where.createdAt as any).lte = periodEnd;
  }

  const [commissions, totals, invoices] = await Promise.all([
    db.commission.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
    }),
    db.commission.aggregate({
      _sum: { grossAmount: true, commissionAmount: true, netAmount: true },
      _count: true,
      where: where as any,
    }),
    db.invoice.findMany({
      where: {
        talentId: userId,
        ...(periodStart || periodEnd
          ? {
              createdAt: {
                ...(periodStart && { gte: periodStart }),
                ...(periodEnd && { lte: periodEnd }),
              },
            }
          : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    commissions,
    invoices,
    totalGross: totals._sum.grossAmount ?? 0,
    totalCommissions: totals._sum.commissionAmount ?? 0,
    totalNet: totals._sum.netAmount ?? 0,
    missionCount: totals._count,
  };
}
