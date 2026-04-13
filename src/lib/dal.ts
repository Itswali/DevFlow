// lib/dal.ts  (Data Access Layer)
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function requireRole(roles: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Unauthenticated");
  }

  if (!roles.includes(session.user.role as string)) {
    throw new Error("Unauthorized");
  }

  return session;
}
