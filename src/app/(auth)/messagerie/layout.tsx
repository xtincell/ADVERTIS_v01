// =============================================================================
// LAYOUT — Messagerie
// =============================================================================
// Server component layout for the Messaging section.
// Uses DashboardShell as wrapper (accessible from all operator roles).
// =============================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";
import { DashboardShell } from "~/components/shells/dashboard-shell";

export default async function MessagerieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role ?? "";

  // Allow ADMIN, OPERATOR, and FREELANCE to access messaging
  if (!["ADMIN", "OPERATOR", "FREELANCE"].includes(role)) {
    redirect(getHomeByRole(role));
  }

  return <DashboardShell>{children}</DashboardShell>;
}
