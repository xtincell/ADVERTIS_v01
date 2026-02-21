// ==========================================================================
// PAGE P.0C — Client Layout
// Shell for CLIENT_RETAINER role: minimal navigation (cockpit, briefs, requests).
// ==========================================================================

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { ClientShell } from "~/components/shells/client-shell";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role ?? "";

  // Only CLIENT_RETAINER and CLIENT_STATIC can access client routes
  if (role !== "CLIENT_RETAINER" && role !== "CLIENT_STATIC") {
    if (role === "ADMIN" || role === "OPERATOR") redirect("/");
    if (role === "FREELANCE") redirect("/");
    redirect("/login");
  }

  return <ClientShell>{children}</ClientShell>;
}
