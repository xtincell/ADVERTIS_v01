// =============================================================================
// ROUTER T.0 — Auth Router
// =============================================================================
// Authentication procedures. User registration, profile read, profile update.
//
// v3 hardening:
//   - Password complexity validation (8+ chars, 1 upper, 1 lower, 1 digit)
//   - Rate limiting on register (3/hour) and login attempts logged
//   - Centralized error messages via AppErrors
//
// Procedures:
//   register      — Register a new user (public, rate-limited)
//   getProfile    — Get current user's profile (protected)
//   updateProfile — Update current user's name/company (protected)
//
// Dependencies:
//   ~/server/api/trpc              — createTRPCRouter, publicProcedure, protectedProcedure
//   ~/server/errors                — AppErrors, throwNotFound
//   ~/server/rate-limit            — registerLimiter
//   ~/lib/validation/password      — passwordSchema
//   bcryptjs                       — Password hashing
// =============================================================================

import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { AppErrors, throwNotFound } from "~/server/errors";
import { registerLimiter } from "~/server/rate-limit";
import { passwordSchema } from "~/lib/validation/password";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
        email: z
          .string()
          .email("Email invalide")
          .transform((v) => v.toLowerCase().trim()),
        password: passwordSchema,
        company: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Rate limit — 3 registrations per hour per email domain
      const emailDomain = input.email.split("@")[1] ?? input.email;
      const rateCheck = registerLimiter.check(emailDomain);
      if (!rateCheck.success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Trop de tentatives d'inscription. Veuillez réessayer dans quelques minutes.",
        });
      }

      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: AppErrors.ALREADY_EXISTS,
        });
      }

      // Hash password (cost factor 12)
      const hashedPassword = await bcrypt.hash(input.password, 12);

      // Create user
      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          company: input.company,
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      throwNotFound(AppErrors.USER_NOT_FOUND);
    }

    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        company: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
      };
    }),

  // ── Platform preferences ────────────────────────────────────────────────
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { preferences: true },
    });
    return (user?.preferences ?? {}) as Record<string, unknown>;
  }),

  updatePreferences: protectedProcedure
    .input(
      z.object({
        language: z.enum(["fr", "en"]).optional(),
        timezone: z.string().optional(),
        defaultCurrency: z.string().optional(),
        defaultMarket: z.string().optional(),
        ai: z
          .object({
            model: z.string().optional(),
            temperature: z.number().min(0).max(1).optional(),
            generationLanguage: z.enum(["fr", "en", "both"]).optional(),
            includeMarketContext: z.boolean().optional(),
          })
          .optional(),
        notifications: z
          .object({
            emailCampaignActivation: z.boolean().optional(),
            cultIndexAlerts: z.boolean().optional(),
            cultIndexThreshold: z.number().min(0).max(100).optional(),
            missionReminders: z.boolean().optional(),
            tarsisSignals: z.boolean().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Merge with existing preferences
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { preferences: true },
      });

      const existing = (user?.preferences ?? {}) as Record<string, unknown>;
      const merged = { ...existing, ...input };

      // Deep merge nested objects
      if (input.ai) {
        merged.ai = { ...((existing.ai as Record<string, unknown>) ?? {}), ...input.ai };
      }
      if (input.notifications) {
        merged.notifications = {
          ...((existing.notifications as Record<string, unknown>) ?? {}),
          ...input.notifications,
        };
      }

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { preferences: merged },
      });

      return merged;
    }),
});
