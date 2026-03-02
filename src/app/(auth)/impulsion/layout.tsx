import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";
import { ImpulsionShell } from "~/components/shells/impulsion-shell";

export default async function ImpulsionLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role ?? "";
  if (role !== "ADMIN" && role !== "OPERATOR") {
    redirect(getHomeByRole(role));
  }
  return <ImpulsionShell>{children}</ImpulsionShell>;
}
