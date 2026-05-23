import type Database from "better-sqlite3";

export interface User {
  id: number;
  telegram_id: number;
  display_name: string | null;
  active_vivarium_id: number | null;
  created_at: string;
}

export class UserStore {
  constructor(private db: Database.Database) {}

  getOrCreate(telegramId: number, displayName?: string): User {
    const existing = this.db
      .prepare("SELECT * FROM users WHERE telegram_id = ?")
      .get(telegramId) as User | undefined;

    if (existing) return existing;

    const result = this.db
      .prepare("INSERT INTO users (telegram_id, display_name) VALUES (?, ?)")
      .run(telegramId, displayName ?? null);

    return this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(result.lastInsertRowid) as User;
  }

  setActiveVivarium(userId: number, vivariumId: number | null): void {
    this.db
      .prepare("UPDATE users SET active_vivarium_id = ? WHERE id = ?")
      .run(vivariumId, userId);
  }

  getByTelegramId(telegramId: number): User | undefined {
    return this.db
      .prepare("SELECT * FROM users WHERE telegram_id = ?")
      .get(telegramId) as User | undefined;
  }
}
