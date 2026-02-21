// =============================================================================
// ROUTE R.0 — Auth
// =============================================================================
// GET, POST  /api/auth/[...nextauth]
// NextAuth.js authentication handler — delegates all auth flows (sign-in,
// sign-out, callbacks, session) to the NextAuth handlers exported from
// ~/server/auth.
// Auth:         None (this IS the auth endpoint)
// Dependencies:  ~/server/auth (NextAuth config + handlers)
// =============================================================================

import { handlers } from "~/server/auth";

export const { GET, POST } = handlers;
