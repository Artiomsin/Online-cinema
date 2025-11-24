import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost",
    port: 5432,
    user: "cinema_admin",
    password: "cinema_pass",
    database: "online_cinema",
    ssl: false, 
  },
});
