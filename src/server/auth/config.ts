// =============================================================================
// INFRA I.6 — Auth Config
// =============================================================================
// NextAuth.js providers + callbacks. Credentials provider (email/password) for
// MVP with JWT session strategy (required for Credentials provider).
//
// Exports:
//   authConfig — NextAuthConfig object (providers, adapter, session, callbacks, pages)
//
// Module augmentation:
//   next-auth Session — Adds id, company, role to session.user
//   next-auth User    — Adds company, role to User type
//
// Configuration:
//   Provider     — CredentialsProvider (email/password, bcrypt verification)
//   Adapter      — PrismaAdapter (database-backed sessions/accounts)
//   Session      — JWT strategy
//   Callbacks    — jwt (attach id, company, role), session (expose to client)
//   Pages        — signIn -> /login
//
// Dependencies:
//   @auth/prisma-adapter             — PrismaAdapter
//   next-auth                        — NextAuthConfig, DefaultSession
//   next-auth/providers/credentials  — CredentialsProvider
//   bcryptjs                         — Password comparison
//   ~/server/db                      — Prisma client
// =============================================================================

import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "~/server/db";

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

/**
 * ADVERTIS NextAuth Configuration
 * - Credentials provider (email/password) for MVP
 * - JWT session strategy (required for Credentials)
 */
export const authConfig = {
  providers: [
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

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
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
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.company = user.company;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        company: token.company as string | null,
        role: (token.role as string) ?? "user",
      },
    }),
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
