import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session exists, redirect to login
  if (!session) {
    redirect("/register");
  }

  return <div>Welcome to your dashboard, {session.user.email}</div>;
}
