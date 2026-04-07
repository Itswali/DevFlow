"use client";
import { authClient } from "@/lib/auth-client";

export function AuthButtons() {
  const { data: session } = authClient.useSession();

  if (session) {
    return (
      <button onClick={() => authClient.signOut()}>
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() =>
        authClient.signUp.email({
          email: "test@example.com",
          password: "password123",
          name: "Test User"
        })
      }
    >
      Sign In
    </button>
  );
}
