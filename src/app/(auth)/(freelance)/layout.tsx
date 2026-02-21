// ==========================================================================
// PAGE P.0B — Freelance Layout
// Shell for FREELANCE role: simplified navigation (missions, briefs, upload).
// ==========================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { FreelanceShell } from "~/components/shells/freelance-shell";

export default async function FreelanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role ?? "";

  // Only FREELANCE can access freelance routes
  if (role !== "FREELANCE") {
    if (role === "ADMIN" || role === "OPERATOR") redirect("/");
    if (role === "CLIENT_RETAINER" || role === "CLIENT_STATIC") redirect("/");
    redirect("/login");
  }

  return <FreelanceShell>{children}</FreelanceShell>;
}
