import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { runner as migrate } from "node-pg-migrate";

// Postgres returns BIGINT (OID 20) as strings by default.
// Telegram IDs fit safely in JS numbers (< 2^53), so parse them.
pg.types.setTypeParser(20, (val) => parseInt(val, 10));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "../../migrations");

export async function createPool(databaseUrl: string): Promise<pg.Pool> {
  const pool = new pg.Pool({ connectionString: databaseUrl });

  await migrate({
    databaseUrl,
    dir: migrationsDir,
    direction: "up",
    migrationsTable: "pgmigrations",
    log: () => {},
  });

  return pool;
}
