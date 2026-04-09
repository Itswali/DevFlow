import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { admin } from "better-auth/plugins";

await connectDB();

export const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection.db),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "user",          // role assigned on signup
      adminRoles: ["admin"],        // roles with admin privileges
    }),
  ],
  user: {
    fields: {
      name: "name",
      email: "email",
    },
  },
});
