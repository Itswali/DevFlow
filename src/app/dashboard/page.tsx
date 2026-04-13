import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { LogoutButton } from "@/components/LogoutButton";
import LeftDashboard from "@/components/LeftDashboard";
import Page from "../page";


export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Logged In State
  if (session?.user) {
    return (
      <div className="flex min-h-screen bg-[#F8F8FA]">
        <aside>
          <LeftDashboard />
        </aside>
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center border-b pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {session.user.name}
            </h1>
            <LogoutButton />
          </div>
          <div className="mt-8">{/* Content goes here */}</div>
        </main>
      </div>
    );
  }

  // 2. Logged Out State (Centering the Welcome Page)
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F8FA]">
        <Page />
    </div>
  );
}
