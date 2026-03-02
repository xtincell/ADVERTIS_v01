// =============================================================================
// LIB L.14 — La Guilde Schemas
// =============================================================================
// Zod validation schemas for La Guilde (Talent Marketplace).
// Covers: talent profiles, reviews, certifications, search & matching.
// Exports: UpsertTalentProfile, UpdateTalentCategory, SearchTalents,
//   CreateTalentReview, CreateCertification, MatchTalents, GetProgression
//   — schemas and inferred *Input types.
// Used by: guilde tRPC router, talent directory UI, matching UI.
// =============================================================================

import { z } from "zod";
import {
  TALENT_CATEGORIES,
  TALENT_LEVELS,
  TALENT_AVAILABILITY,
  TALENT_SPECIALIZATIONS,
} from "~/lib/constants";

// ============================================
// TALENT PROFILE SCHEMAS
// ============================================

export const UpsertTalentProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(2000).optional(),
  headline: z.string().max(200).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  location: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  languages: z.array(z.string()).optional(),
  specializations: z.array(z.enum(TALENT_SPECIALIZATIONS)).optional(),
  skills: z.array(z.string().max(50)).max(30).optional(),
  tools: z.array(z.string().max(50)).max(30).optional(),
  sectors: z.array(z.string().max(50)).max(15).optional(),
  portfolioUrls: z.array(z.string().url()).max(10).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  showreel: z.string().url().optional().or(z.literal("")),
  tjmMin: z.number().min(0).optional(),
  tjmMax: z.number().min(0).optional(),
  currency: z.string().default("XAF"),
  availability: z.enum(TALENT_AVAILABILITY).optional(),
});

export const UpdateTalentCategorySchema = z.object({
  userId: z.string().min(1),
  category: z.enum(TALENT_CATEGORIES),
});

// ============================================
// SEARCH & MATCHING SCHEMAS
// ============================================

export const SearchTalentsSchema = z.object({
  query: z.string().optional(),
  category: z.enum(TALENT_CATEGORIES).optional(),
  level: z.enum(TALENT_LEVELS).optional(),
  availability: z.enum(TALENT_AVAILABILITY).optional(),
  specializations: z.array(z.enum(TALENT_SPECIALIZATIONS)).optional(),
  minScore: z.number().min(0).max(5).optional(),
  tjmMin: z.number().min(0).optional(),
  tjmMax: z.number().min(0).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["level", "avgScore", "totalMissions", "tjmMin", "createdAt"]).default("level"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const MatchTalentsSchema = z.object({
  missionId: z.string().min(1),
  requiredSpecializations: z.array(z.enum(TALENT_SPECIALIZATIONS)).optional(),
  requiredSkills: z.array(z.string()).optional(),
  budgetMax: z.number().min(0).optional(),
  minLevel: z.enum(TALENT_LEVELS).optional(),
  limit: z.number().int().min(1).max(50).default(10),
});

// ============================================
// REVIEW SCHEMAS
// ============================================

export const CreateTalentReviewSchema = z.object({
  talentProfileId: z.string().min(1),
  missionId: z.string().min(1),
  assignmentId: z.string().optional(),
  qualityScore: z.number().int().min(1).max(5),
  communicationScore: z.number().int().min(1).max(5).optional(),
  deadlinesScore: z.number().int().min(1).max(5).optional(),
  creativityScore: z.number().int().min(1).max(5).optional(),
  autonomyScore: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
  isPublic: z.boolean().default(false),
});

// ============================================
// CERTIFICATION SCHEMAS
// ============================================

export const CreateCertificationSchema = z.object({
  talentProfileId: z.string().min(1),
  name: z.string().min(1).max(200),
  issuedBy: z.string().max(200).optional(),
  issuedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  score: z.number().int().min(0).max(100).optional(),
  badgeUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================
// CREATE TALENT SCHEMA (operator-initiated)
// ============================================

export const CreateTalentSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum").optional(),
  category: z.enum(TALENT_CATEGORIES).default("RESEAU"),
  specializations: z.array(z.enum(TALENT_SPECIALIZATIONS)).optional(),
  availability: z.enum(TALENT_AVAILABILITY).default("AVAILABLE"),
  displayName: z.string().max(100).optional(),
  headline: z.string().max(200).optional(),
});

// ============================================
// INFERRED TYPES
// ============================================

export type CreateTalentInput = z.infer<typeof CreateTalentSchema>;
export type UpsertTalentProfileInput = z.infer<typeof UpsertTalentProfileSchema>;
export type UpdateTalentCategoryInput = z.infer<typeof UpdateTalentCategorySchema>;
export type SearchTalentsInput = z.infer<typeof SearchTalentsSchema>;
export type MatchTalentsInput = z.infer<typeof MatchTalentsSchema>;
export type CreateTalentReviewInput = z.infer<typeof CreateTalentReviewSchema>;
export type CreateCertificationInput = z.infer<typeof CreateCertificationSchema>;
