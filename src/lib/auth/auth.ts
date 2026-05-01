import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { admin } from "better-auth/plugins";
import { headers } from "next/headers";

connectDB();


export const auth = betterAuth({
  database: mongodbAdapter((await connectDB(), mongoose.connection.db!)),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
        "https://dev-flow-blush-six.vercel.app",
        "https://dev-flow-np15ivihx-wali-muhammads-projects-d5754d13.vercel.app"
    ],
    // Ensure your secret is set in Vercel Env Vars
    secret: process.env.BETTER_AUTH_SECRET,
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
  user: {
    fields: {
      name: "name",
      email: "email",
    },
  },
});

export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  return result;
}
