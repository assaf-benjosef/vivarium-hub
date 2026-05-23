import type pg from "pg";

export interface User {
  id: number;
  telegram_id: number;
  display_name: string | null;
  active_vivarium_id: number | null;
  created_at: string;
}

export class UserStore {
  constructor(private pool: pg.Pool) {}

  async getOrCreate(telegramId: number, displayName?: string): Promise<User> {
    const result = await this.pool.query<User>(
      `INSERT INTO users (telegram_id, display_name) VALUES ($1, $2)
       ON CONFLICT (telegram_id) DO NOTHING
       RETURNING *`,
      [telegramId, displayName ?? null]
    );

    if (result.rows[0]) return result.rows[0];

    const existing = await this.pool.query<User>(
      "SELECT * FROM users WHERE telegram_id = $1",
      [telegramId]
    );
    return existing.rows[0];
  }

  async setActiveVivarium(userId: number, vivariumId: number | null): Promise<void> {
    await this.pool.query(
      "UPDATE users SET active_vivarium_id = $1 WHERE id = $2",
      [vivariumId, userId]
    );
  }

  async getById(userId: number): Promise<User | undefined> {
    const result = await this.pool.query<User>(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );
    return result.rows[0];
  }

  async getByTelegramId(telegramId: number): Promise<User | undefined> {
    const result = await this.pool.query<User>(
      "SELECT * FROM users WHERE telegram_id = $1",
      [telegramId]
    );
    return result.rows[0];
  }
}
