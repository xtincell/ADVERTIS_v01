// ==========================================================================
// PAGE P.0 — Auth Layout
// Root authenticated layout. Checks auth and wraps children in session provider.
// Role-based shell routing is handled by sub-group layouts:
//   (operator)/layout.tsx  → ADMIN, OPERATOR
//   (freelance)/layout.tsx → FREELANCE
//   (client)/layout.tsx    → CLIENT_RETAINER, CLIENT_STATIC
// ==========================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import AuthSessionProvider from "~/components/providers/session-provider";
import { RoleProvider } from "~/components/providers/role-provider";
import { TooltipProvider } from "~/components/ui/tooltip";
import { OfflineBanner } from "~/components/ui/offline-banner";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <AuthSessionProvider>
      <TooltipProvider delayDuration={0}>
        <OfflineBanner />
        <RoleProvider>
          {children}
        </RoleProvider>
      </TooltipProvider>
    </AuthSessionProvider>
  );
}
