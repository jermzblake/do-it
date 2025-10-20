import { defineConfig } from "drizzle-kit"
// import { pg } from "drizzle-orm/pg/server"

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string || "postgres://user:password@localhost:5432/mydatabase",
  },
  verbose: true,
  strict: true,
})