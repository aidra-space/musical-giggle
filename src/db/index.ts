import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const globalForDb = globalThis as unknown as { client?: Sql };

const isLocalDatabase =
  databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");


const client =
  globalForDb.client ??
  postgres(databaseUrl, {
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    ssl: isLocalDatabase ? false : "require",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });

export type Database = typeof db;
