"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

 const handleSignUp = async () => {
  setLoading(true);
  const { data, error } = await authClient.signUp.email({
    name,
    email,
    password,
    callbackURL: "/dashboard",
  }, {
    // This ensures the session is synced before moving on
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (ctx) => {
      alert(ctx.error.message);
    }
  });
  setLoading(false);
};

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-87.5">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your account in seconds.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5"><Label htmlFor="name">Name</Label>
               <Input
                id="name"
                placeholder="Jack"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button onClick={handleSignUp} disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
