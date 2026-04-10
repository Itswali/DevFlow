import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LogoutButton } from "@/components/LogoutButton";
import LeftDashboard from "@/components/LeftDashboard";


export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen bg-[#F8F8FA]">
      {/* Sidebar Section */}
      <aside className="p-4">
        <LeftDashboard />
      </aside>

      {/* Main Content Section */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center border-b pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome, {session?.user.name}
          </h1>
          <LogoutButton />
        </div>

        {/* Your dashboard content goes here */}
        <div className="mt-8">
          {/* Content cards or tables */}
        </div>
      </main>
    </div>
  );
}
