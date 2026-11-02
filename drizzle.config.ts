import { defineConfig } from "drizzle-kit";

// SQLite only for now; the postgres config comes with phase H.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.sqlite.ts",
  dbCredentials: { url: "knowledge.db" },
});
