// ==========================================================================
// PAGE P.0A — Operator Layout
// Shell for ADMIN + OPERATOR roles: rail nav (desktop) + bottom nav (mobile).
// ==========================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { OperatorShell } from "~/components/shells/operator-shell";

export default async function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role ?? "";

  // Only ADMIN and OPERATOR can access operator routes
  if (role !== "ADMIN" && role !== "OPERATOR") {
    if (role === "FREELANCE") redirect("/");
    if (role === "CLIENT_RETAINER" || role === "CLIENT_STATIC") redirect("/");
    redirect("/login");
  }

  return <OperatorShell>{children}</OperatorShell>;
}
