// app/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AuthButtons } from "@/components/AuthButtons"; // Import the new file

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div>
      <h1 className="font-bold">Welcome to DevFlow</h1>
      {session ? (
        <p>Logged in as: {session.user.email}</p>
      ) : (
        <p>Not logged in</p>
      )}

      {/* Render the client component here */}
      <AuthButtons />
    </div>
  );
}
