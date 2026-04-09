import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export const auth = betterAuth({
  database: mongodbAdapter(client.db(), { client }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    fields: {
      name: "name",
      email: "email",
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
});
