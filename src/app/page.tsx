import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";

export default async function RootPage() {
  const session = await auth();

  if (session) {
    redirect(getHomeByRole(session.user?.role ?? ""));
  } else {
    redirect("/login");
  }
}
