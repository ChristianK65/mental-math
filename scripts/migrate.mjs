import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required to run migrations.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const db = drizzle(pool);

try {
  console.log("Running Drizzle migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Drizzle migrations applied successfully.");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
} finally {
  await pool.end();
}
