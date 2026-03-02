// =============================================================================
// PAGE P.GUILDE — La Guilde Layout
// =============================================================================
// Server component layout for La Guilde portal.
// Checks auth + role (ADMIN or OPERATOR), then wraps content in GuildeShell.
// =============================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";
import { GuildeShell } from "~/components/shells/guilde-shell";

export default async function GuildeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role ?? "";

  if (role !== "ADMIN" && role !== "OPERATOR") {
    redirect(getHomeByRole(role));
  }

  return <GuildeShell>{children}</GuildeShell>;
}
