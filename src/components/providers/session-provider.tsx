// ==========================================================================
// C.P1 — Session Provider
// Auth session context provider.
// ==========================================================================

"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
