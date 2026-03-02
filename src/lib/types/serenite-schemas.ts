// =============================================================================
// LIB L.15 — Sérénité Schemas
// =============================================================================
// Zod validation schemas for Sérénité (Finance & Admin).
// Covers: invoices, contracts, escrow, commissions.
// Exports: CreateInvoice, UpdateInvoiceStatus, CreateContract,
//   UpdateContractStatus, CreateEscrow, ReleaseEscrow, CalculateCommission
//   — schemas and inferred *Input types.
// Used by: serenite tRPC router, financial dashboard, freelance finances.
// =============================================================================

import { z } from "zod";
import {
  INVOICE_TYPES,
  INVOICE_STATUSES,
  CONTRACT_TYPES,
  CONTRACT_STATUSES,
  ESCROW_STATUSES,
} from "~/lib/constants";

// ============================================
// INVOICE SCHEMAS
// ============================================

export const CreateInvoiceSchema = z.object({
  type: z.enum(INVOICE_TYPES),
  clientId: z.string().optional(),
  talentId: z.string().optional(),
  missionId: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().min(0).default(1),
    unitPrice: z.number().min(0),
    assignmentId: z.string().optional(),
  })).min(1),
  taxRate: z.number().min(0).max(100).default(0),
  currency: z.string().default("XAF"),
  dueDate: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
  terms: z.string().max(5000).optional(),
});

export const UpdateInvoiceStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(INVOICE_STATUSES),
  paidAt: z.coerce.date().optional(),
});

export const ListInvoicesSchema = z.object({
  clientId: z.string().optional(),
  talentId: z.string().optional(),
  missionId: z.string().optional(),
  status: z.enum(INVOICE_STATUSES).optional(),
  type: z.enum(INVOICE_TYPES).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// ============================================
// CONTRACT SCHEMAS
// ============================================

export const CreateContractSchema = z.object({
  type: z.enum(CONTRACT_TYPES),
  partyAId: z.string().min(1),
  partyBId: z.string().min(1),
  missionId: z.string().optional(),
  title: z.string().min(1).max(300),
  content: z.string().optional(),
  templateId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const UpdateContractStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(CONTRACT_STATUSES),
  signedAt: z.coerce.date().optional(),
  signatureData: z.record(z.unknown()).optional(),
});

export const ListContractsSchema = z.object({
  partyId: z.string().optional(),
  missionId: z.string().optional(),
  status: z.enum(CONTRACT_STATUSES).optional(),
  type: z.enum(CONTRACT_TYPES).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// ============================================
// ESCROW SCHEMAS
// ============================================

export const CreateEscrowSchema = z.object({
  missionId: z.string().min(1),
  amount: z.number().min(0),
  currency: z.string().default("XAF"),
  releaseCondition: z.string().max(2000).optional(),
});

export const ReleaseEscrowSchema = z.object({
  id: z.string().min(1),
  amount: z.number().min(0).optional(), // partial release; omit = full
  notes: z.string().max(2000).optional(),
});

export const RefundEscrowSchema = z.object({
  id: z.string().min(1),
  notes: z.string().max(2000).optional(),
});

// ============================================
// COMMISSION SCHEMAS
// ============================================

export const CalculateCommissionSchema = z.object({
  missionId: z.string().min(1),
  talentId: z.string().min(1),
  assignmentId: z.string().optional(),
  grossAmount: z.number().min(0),
});

export const CalculateAllCommissionsSchema = z.object({
  missionId: z.string().min(1),
});

// ============================================
// FINANCIAL DASHBOARD SCHEMA
// ============================================

export const FinancialDashboardSchema = z.object({
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
});

export const TalentEarningsSchema = z.object({
  userId: z.string().min(1),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
});

// ============================================
// INFERRED TYPES
// ============================================

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof UpdateInvoiceStatusSchema>;
export type ListInvoicesInput = z.infer<typeof ListInvoicesSchema>;
export type CreateContractInput = z.infer<typeof CreateContractSchema>;
export type UpdateContractStatusInput = z.infer<typeof UpdateContractStatusSchema>;
export type ListContractsInput = z.infer<typeof ListContractsSchema>;
export type CreateEscrowInput = z.infer<typeof CreateEscrowSchema>;
export type ReleaseEscrowInput = z.infer<typeof ReleaseEscrowSchema>;
export type RefundEscrowInput = z.infer<typeof RefundEscrowSchema>;
export type CalculateCommissionInput = z.infer<typeof CalculateCommissionSchema>;
export type CalculateAllCommissionsInput = z.infer<typeof CalculateAllCommissionsSchema>;
export type FinancialDashboardInput = z.infer<typeof FinancialDashboardSchema>;
export type TalentEarningsInput = z.infer<typeof TalentEarningsSchema>;
