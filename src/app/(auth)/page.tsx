// ==========================================================================
// PAGE P.0R — Auth Root Redirect
// Single root page for authenticated users. Reads the user role from the
// session and redirects to the correct home route for their role shell.
// ==========================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";

export default async function AuthRootPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  redirect(getHomeByRole(session.user?.role ?? ""));
}
