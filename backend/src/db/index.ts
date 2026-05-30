import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost")
    ? undefined
    : {
        rejectUnauthorized: false,
      },
});

export const db = drizzle(pool, { schema });
export { pool };
