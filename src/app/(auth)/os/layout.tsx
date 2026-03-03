import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";
import { BrandOSShell } from "~/components/shells/brand-os-shell";

export default async function BrandOSLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role ?? "";
  // Brand OS is accessible to ADMIN, OPERATOR (internal), and CLIENT_RETAINER (retainer clients)
  if (role !== "ADMIN" && role !== "OPERATOR" && role !== "CLIENT_RETAINER") {
    redirect(getHomeByRole(role));
  }
  return <BrandOSShell>{children}</BrandOSShell>;
}
