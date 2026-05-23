import type Database from "better-sqlite3";

export interface Vivarium {
  id: number;
  user_id: number;
  name: string;
  token_hash: string;
  status: string;
  last_seen_at: string | null;
  version: string | null;
  created_at: string;
}

export class VivariumStore {
  constructor(private db: Database.Database) {}

  register(userId: number, name: string, tokenHash: string, version?: string): Vivarium {
    const existing = this.db
      .prepare("SELECT * FROM vivariums WHERE user_id = ? AND name = ?")
      .get(userId, name) as Vivarium | undefined;

    if (existing) {
      this.db
        .prepare(
          "UPDATE vivariums SET token_hash = ?, version = ?, status = 'online', last_seen_at = datetime('now') WHERE id = ?"
        )
        .run(tokenHash, version ?? existing.version, existing.id);

      return this.db
        .prepare("SELECT * FROM vivariums WHERE id = ?")
        .get(existing.id) as Vivarium;
    }

    const result = this.db
      .prepare(
        "INSERT INTO vivariums (user_id, name, token_hash, version, status, last_seen_at) VALUES (?, ?, ?, ?, 'online', datetime('now'))"
      )
      .run(userId, name, tokenHash, version ?? null);

    return this.db
      .prepare("SELECT * FROM vivariums WHERE id = ?")
      .get(result.lastInsertRowid) as Vivarium;
  }

  setStatus(id: number, status: "online" | "offline"): void {
    this.db
      .prepare("UPDATE vivariums SET status = ?, last_seen_at = datetime('now') WHERE id = ?")
      .run(status, id);
  }

  getById(id: number): Vivarium | undefined {
    return this.db
      .prepare("SELECT * FROM vivariums WHERE id = ?")
      .get(id) as Vivarium | undefined;
  }

  getActiveForUser(userId: number): Vivarium | undefined {
    return this.db
      .prepare(
        "SELECT v.* FROM vivariums v JOIN users u ON u.active_vivarium_id = v.id WHERE u.id = ?"
      )
      .get(userId) as Vivarium | undefined;
  }

  listForUser(userId: number): Vivarium[] {
    return this.db
      .prepare("SELECT * FROM vivariums WHERE user_id = ? ORDER BY created_at")
      .all(userId) as Vivarium[];
  }
}
