// ==========================================================================
// PAGE P.0R — Auth Root Redirect
// Single root page for authenticated users. Reads the user role from the
// session and redirects to the correct home route for their role shell.
// ==========================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function AuthRootPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role ?? "";

  switch (role) {
    case "ADMIN":
    case "OPERATOR":
      redirect("/dashboard");
    case "FREELANCE":
      redirect("/my-missions");
    case "CLIENT_RETAINER":
    case "CLIENT_STATIC":
      redirect("/cockpit");
    default:
      redirect("/login");
  }
}
