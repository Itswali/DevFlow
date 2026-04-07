import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import connectionToDatabase from "@/lib/db";

await connectionToDatabase();

export const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection.db),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    fields: {
      name: "name",
      email: "email",
    },
  },
});
