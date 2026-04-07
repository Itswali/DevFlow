import React from "react";
import connectionToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  await connectionToDatabase();

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
    </div>
  );
}
