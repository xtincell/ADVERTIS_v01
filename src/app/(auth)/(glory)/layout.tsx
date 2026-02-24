// =============================================================================
// PAGE P.GLORY — Glory Layout
// =============================================================================
// Server component layout for the GLORY section.
// Checks auth + role (ADMIN or OPERATOR), then wraps content in GloryShell.
// =============================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";
import { GloryShell } from "~/components/glory/glory-shell";

export default async function GloryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role ?? "";

  if (role !== "ADMIN" && role !== "OPERATOR") {
    redirect(getHomeByRole(role));
  }

  return <GloryShell>{children}</GloryShell>;
}
