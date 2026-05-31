-- Initial schema (extracted from inline CREATE TABLE statements)
-- Uses IF NOT EXISTS so this is safe to run against existing databases
-- that were created before migrations were introduced.

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
