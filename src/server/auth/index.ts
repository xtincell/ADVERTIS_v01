// =============================================================================
// INFRA I.5 — Auth Index
// =============================================================================
// NextAuth.js configuration export. Wraps NextAuth with React cache for
// de-duplicated session resolution across server components.
//
// Exports:
//   auth     — Cached session resolver (React cache wrapper)
//   handlers — NextAuth HTTP handlers (GET, POST)
//   signIn   — Server-side sign-in function
//   signOut  — Server-side sign-out function
//
// Dependencies:
//   next-auth       — NextAuth core
//   react           — cache (for session de-duplication)
//   ./config        — authConfig (providers, callbacks, adapter)
// =============================================================================

import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
