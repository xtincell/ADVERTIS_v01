// =============================================================================
// INFRA I.6 — Auth Config
// =============================================================================
// NextAuth.js providers + callbacks.
//
// v3 hardening:
//   - Credentials provider with rate limiting (5 attempts / 15 min per email)
//   - Google OAuth provider (optional — graceful if env vars not set)
//   - JWT session strategy with 30-day maxAge
//   - Role refresh from DB on every JWT rotation
//
// Exports:
//   authConfig — NextAuthConfig object
//
// Module augmentation:
//   next-auth Session — Adds id, company, role to session.user
//   next-auth User    — Adds company, role to User type
//
// Dependencies:
//   @auth/prisma-adapter             — PrismaAdapter
//   next-auth                        — NextAuthConfig, DefaultSession
//   next-auth/providers/credentials  — CredentialsProvider
//   next-auth/providers/google       — GoogleProvider
//   bcryptjs                         — Password comparison
//   ~/server/db                      — Prisma client
//   ~/server/rate-limit              — loginLimiter
// =============================================================================

import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { db } from "~/server/db";
import { loginLimiter } from "~/server/rate-limit";

/**
 * Module augmentation for `next-auth` types.
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      company?: string | null;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    company?: string | null;
    role?: string;
  }
}

// ── Providers ──────────────────────────────────────────────────────

const providers: NextAuthConfig["providers"] = [
  // Credentials (email/password) — always available
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const email = (credentials.email as string).toLowerCase().trim();

      // Rate limit — 5 attempts per 15 minutes per email
      const rateCheck = loginLimiter.check(email);
      if (!rateCheck.success) {
        // Return null (NextAuth treats as invalid credentials).
        // The error message is intentionally generic to prevent email enumeration.
        return null;
      }

      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user?.password) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.password,
      );

      if (!isPasswordValid) {
        return null;
      }

      // Successful login — reset rate limiter for this email
      loginLimiter.reset(email);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        company: user.company,
        role: user.role,
      };
    },
  }),
];

// Google OAuth — only added if env vars are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

// ── Config ─────────────────────────────────────────────────────────

/**
 * ADVERTIS NextAuth Configuration
 * - Credentials provider (email/password) — always available
 * - Google OAuth — optional (enabled via GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET)
 * - JWT session strategy (required for Credentials)
 */
export const authConfig = {
  providers,
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id;
        token.company = user.company;
        token.role = user.role;
      } else if (token.id) {
        // Refresh role from DB so admin changes propagate without re-login
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, company: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.company = dbUser.company;
        }
      }

      // For OAuth accounts linking — set role if first login
      if (account?.provider === "google" && user) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id as string },
          select: { role: true, company: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.company = dbUser.company;
        }
      }

      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        company: token.company as string | null,
        role: (token.role as string) ?? "OPERATOR",
      },
    }),
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
