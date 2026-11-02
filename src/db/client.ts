import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "@/db/schema.sqlite";

const SQLITE_PATH = "knowledge.db";

function createDb() {
  const driver = process.env.VECTOR_STORE_DRIVER ?? "sqlite";

  if (driver === "sqlite") {
    return drizzle(new Database(SQLITE_PATH), { schema });
  }

  // TODO(H5): add the postgres branch once schema.pg.ts exists.
  throw new Error(`Unsupported VECTOR_STORE_DRIVER: ${driver}`);
}

type Db = ReturnType<typeof createDb>;

// Reuse one connection across hot reloads in dev.
const globalForDb = globalThis as unknown as { db?: Db };

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
