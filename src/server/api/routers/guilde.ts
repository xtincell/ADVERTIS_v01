// =============================================================================
// ROUTER T.18 — La Guilde (Talent Marketplace)
// =============================================================================
// tRPC router for talent management. Sub-routes: profiles, reviews,
// certifications, progression, matching, directory.
//
// Auth rules:
//   - Freelance: own profile CRUD, own stats/progression
//   - Operator/Admin: full access (search, directory, category update,
//                     review creation, cert awarding, matching)
// =============================================================================

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  roleProtectedProcedure,
} from "~/server/api/trpc";
import {
  UpsertTalentProfileSchema,
  UpdateTalentCategorySchema,
  SearchTalentsSchema,
  MatchTalentsSchema,
  CreateTalentReviewSchema,
  CreateCertificationSchema,
  CreateTalentSchema,
} from "~/lib/types/guilde-schemas";
import * as talentEngine from "~/server/services/talent-engine";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const opsProcedure = roleProtectedProcedure(["ADMIN", "OPERATOR"]);
const freelanceProcedure = roleProtectedProcedure(["ADMIN", "FREELANCE"]);

export const guildeRouter = createTRPCRouter({
  // ── Profiles ────────────────────────────────────────────────────────────

  /** Get current user's talent profile (freelance self-service). */
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    return talentEngine.getProfile(ctx.session.user.id);
  }),

  /** Get any talent profile by userId (ops view). */
  getProfile: opsProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const profile = await talentEngine.getProfile(input.userId);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profil talent non trouvé" });
      }
      return profile;
    }),

  /** Upsert own profile (freelance). */
  upsertMyProfile: protectedProcedure
    .input(UpsertTalentProfileSchema)
    .mutation(async ({ ctx, input }) => {
      return talentEngine.upsertProfile(ctx.session.user.id, input);
    }),

  /** Update talent category (ops only). */
  updateCategory: opsProcedure
    .input(UpdateTalentCategorySchema)
    .mutation(async ({ input }) => {
      return talentEngine.upsertProfile(input.userId, {} as any).then(() =>
        // Direct DB update for category
        (async () => {
          const { db } = await import("~/server/db");
          return db.talentProfile.update({
            where: { userId: input.userId },
            data: { category: input.category },
          });
        })(),
      );
    }),

  // ── Talent Creation ────────────────────────────────────────────────────

  /** Create a new talent (User + TalentProfile) — ops only. */
  createTalent: opsProcedure
    .input(CreateTalentSchema)
    .mutation(async ({ ctx, input }) => {
      // Check email uniqueness
      const existing = await ctx.db.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Un compte existe déjà avec cet email",
        });
      }

      // Generate password if not provided
      const rawPassword =
        input.password ??
        crypto.randomBytes(8).toString("base64url").slice(0, 12);
      const hashedPassword = await bcrypt.hash(rawPassword, 12);

      // Create user with FREELANCE role
      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: "FREELANCE",
        },
      });

      // Create initial TalentProfile
      const profile = await talentEngine.upsertProfile(user.id, {
        displayName: input.displayName ?? input.name,
        headline: input.headline,
        specializations: input.specializations,
        availability: input.availability,
        currency: "XAF",
      });

      // Update category if not default
      if (input.category && input.category !== "RESEAU") {
        await ctx.db.talentProfile.update({
          where: { userId: user.id },
          data: { category: input.category },
        });
      }

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        generatedPassword: input.password ? undefined : rawPassword,
        profileId: profile.id,
      };
    }),

  // ── Directory & Search ──────────────────────────────────────────────────

  /** Search/filter talents (ops). */
  search: opsProcedure
    .input(SearchTalentsSchema)
    .query(async ({ input }) => {
      return talentEngine.searchTalents(input);
    }),

  /** Full directory (ops). */
  directory: opsProcedure
    .input(SearchTalentsSchema)
    .query(async ({ input }) => {
      return talentEngine.getDirectory(input);
    }),

  // ── Matching ────────────────────────────────────────────────────────────

  /** Match talents to a mission (ops). */
  match: opsProcedure
    .input(MatchTalentsSchema)
    .query(async ({ input }) => {
      return talentEngine.matchTalents(input);
    }),

  // ── Reviews ─────────────────────────────────────────────────────────────

  /** Create a review for a talent (ops). */
  createReview: opsProcedure
    .input(CreateTalentReviewSchema)
    .mutation(async ({ ctx, input }) => {
      return talentEngine.createReview(ctx.session.user.id, input);
    }),

  /** Get reviews for a talent (ops or self). */
  getReviews: protectedProcedure
    .input(z.object({ talentProfileId: z.string() }))
    .query(async ({ input }) => {
      return talentEngine.getReviews(input.talentProfileId);
    }),

  // ── Certifications ──────────────────────────────────────────────────────

  /** Award a certification (ops). */
  createCertification: opsProcedure
    .input(CreateCertificationSchema)
    .mutation(async ({ input }) => {
      return talentEngine.createCertification(input);
    }),

  /** List certifications for a talent. */
  getCertifications: protectedProcedure
    .input(z.object({ talentProfileId: z.string() }))
    .query(async ({ input }) => {
      return talentEngine.getCertifications(input.talentProfileId);
    }),

  // ── Progression ─────────────────────────────────────────────────────────

  /** Get progression path for current user. */
  getMyProgression: protectedProcedure.query(async ({ ctx }) => {
    return talentEngine.getProgressionPath(ctx.session.user.id);
  }),

  /** Get progression path for any talent (ops). */
  getProgression: opsProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return talentEngine.getProgressionPath(input.userId);
    }),

  /** Recompute level for a talent (ops). */
  recomputeLevel: opsProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      return talentEngine.computeLevel(input.userId);
    }),

  // ── Stats ───────────────────────────────────────────────────────────────

  /** Get talent stats for current user. */
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    return talentEngine.getTalentStats(ctx.session.user.id);
  }),

  /** Get talent stats for any user (ops). */
  getStats: opsProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return talentEngine.getTalentStats(input.userId);
    }),
});
