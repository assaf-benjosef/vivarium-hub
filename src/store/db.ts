import pg from "pg";

// Postgres returns BIGINT (OID 20) as strings by default.
// Telegram IDs fit safely in JS numbers (< 2^53), so parse them.
pg.types.setTypeParser(20, (val) => parseInt(val, 10));

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    telegram_id     BIGINT UNIQUE,
    email           VARCHAR(256) UNIQUE,
    display_name    VARCHAR(128),
    active_vivarium_id  INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS vivariums (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) NOT NULL,
    name            VARCHAR(64) NOT NULL,
    token_hash      VARCHAR(128) NOT NULL,
    version         VARCHAR(16),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
  );
`;

export async function createPool(databaseUrl: string): Promise<pg.Pool> {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  await pool.query(SCHEMA);
  return pool;
}
