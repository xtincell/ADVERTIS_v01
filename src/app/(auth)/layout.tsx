import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Sidebar from "~/components/layout/sidebar";
import Header from "~/components/layout/header";
import AuthSessionProvider from "~/components/providers/session-provider";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <AuthSessionProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-dotgrid p-6 animate-page-enter">{children}</main>
        </div>
      </div>
    </AuthSessionProvider>
  );
}
