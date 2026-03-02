// =============================================================================
// PAGE P.SERENITE — Sérénité Layout
// =============================================================================
// Server component layout for Sérénité portal (Finance & Administration).
// Checks auth + role (ADMIN or OPERATOR), then wraps content in SereniteShell.
// =============================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";
import { SereniteShell } from "~/components/shells/serenite-shell";

export default async function SereniteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role ?? "";

  if (role !== "ADMIN" && role !== "OPERATOR") {
    redirect(getHomeByRole(role));
  }

  return <SereniteShell>{children}</SereniteShell>;
}
