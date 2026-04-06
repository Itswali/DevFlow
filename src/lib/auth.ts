import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

/**
 * Reuse a single MongoClient instance across module reloads (Next.js HMR).
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoClient: MongoClient | undefined;
}

const client: MongoClient =
  global.mongoClient ?? new MongoClient(MONGODB_URI);

if (process.env.NODE_ENV !== "production") {
  global.mongoClient = client;
}

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  emailAndPassword: {
    enabled: true,
  },
});

