import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";


export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">
          Welcome, {session.user.name}
        </h1>
        <LogoutButton />
      </div>

      <div className="mt-8">
        <p className="text-muted-foreground">
          You are logged in as {session.user.email}
        </p>
      </div>
    </div>
  );
}
