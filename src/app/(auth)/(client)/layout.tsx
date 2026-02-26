// ==========================================================================
// PAGE P.0C — Client Layout
// Shell for CLIENT_RETAINER role: minimal navigation (cockpit, briefs, requests).
// ==========================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";
import { ClientShell } from "~/components/shells/client-shell";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role ?? "";

  // CLIENT_RETAINER, CLIENT_STATIC, and ADMIN can access client routes
  if (role !== "ADMIN" && role !== "CLIENT_RETAINER" && role !== "CLIENT_STATIC") {
    redirect(getHomeByRole(role));
  }

  return <ClientShell>{children}</ClientShell>;
}
