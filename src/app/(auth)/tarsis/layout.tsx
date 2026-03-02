// =============================================================================
// PAGE P.TARSIS — Tarsis Layout
// =============================================================================
// Server component layout for the TARSIS section.
// Checks auth + role (ADMIN or OPERATOR), then wraps content in TarsisShell.
// =============================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";
import { TarsisShell } from "~/components/tarsis/tarsis-shell";

export default async function TarsisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role ?? "";

  if (role !== "ADMIN" && role !== "OPERATOR") {
    redirect(getHomeByRole(role));
  }

  return <TarsisShell>{children}</TarsisShell>;
}
