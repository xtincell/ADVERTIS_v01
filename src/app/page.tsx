import { auth } from "~/server/auth";
import { getHomeByRole } from "~/lib/role-routing";
import { LandingPage } from "~/components/marketing/landing-page";

export default async function RootPage() {
  const session = await auth();
  const userHomeHref = session ? getHomeByRole(session.user?.role ?? "") : undefined;

  return <LandingPage userHomeHref={userHomeHref} />;
}
