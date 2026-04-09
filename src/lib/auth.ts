import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { admin } from "better-auth/plugins";

connectDB();


export const auth = betterAuth({
  database: mongodbAdapter((await connectDB(), mongoose.connection.db!)),
  emailAndPassword: {
    enabled: true,
  },
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
