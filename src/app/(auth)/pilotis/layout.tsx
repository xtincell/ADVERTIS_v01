// =============================================================================
// PAGE P.PILOTIS — Pilotis Layout
// =============================================================================
// Server component layout for Pilotis portal (Mission Operations).
// Checks auth + role (ADMIN or OPERATOR), then wraps content in PilotisShell.
// =============================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";
import { PilotisShell } from "~/components/shells/pilotis-shell";

export default async function PilotisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role ?? "";

  if (role !== "ADMIN" && role !== "OPERATOR") {
    redirect(getHomeByRole(role));
  }

  return <PilotisShell>{children}</PilotisShell>;
}
