import type pg from "pg";

export interface Vivarium {
  id: number;
  user_id: number;
  name: string;
  token_hash: string;
  version: string | null;
  created_at: string;
}

export class VivariumStore {
  constructor(private pool: pg.Pool) {}

  async register(userId: number, name: string, tokenHash: string, version?: string): Promise<Vivarium> {
    const existing = await this.pool.query<Vivarium>(
      "SELECT * FROM vivariums WHERE user_id = $1 AND name = $2",
      [userId, name]
    );

    if (existing.rows[0]) {
      const result = await this.pool.query<Vivarium>(
        "UPDATE vivariums SET token_hash = $1, version = $2 WHERE id = $3 RETURNING *",
        [tokenHash, version ?? existing.rows[0].version, existing.rows[0].id]
      );
      return result.rows[0];
    }

    const result = await this.pool.query<Vivarium>(
      "INSERT INTO vivariums (user_id, name, token_hash, version) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, name, tokenHash, version ?? null]
    );

    return result.rows[0];
  }

  async getById(id: number): Promise<Vivarium | undefined> {
    const result = await this.pool.query<Vivarium>(
      "SELECT * FROM vivariums WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  async getActiveForUser(userId: number): Promise<Vivarium | undefined> {
    const result = await this.pool.query<Vivarium>(
      "SELECT v.* FROM vivariums v JOIN users u ON u.active_vivarium_id = v.id WHERE u.id = $1",
      [userId]
    );
    return result.rows[0];
  }

  async getByUserAndName(userId: number, name: string): Promise<Vivarium | undefined> {
    const result = await this.pool.query<Vivarium>(
      "SELECT * FROM vivariums WHERE user_id = $1 AND name = $2",
      [userId, name]
    );
    return result.rows[0];
  }

  async listForUser(userId: number): Promise<Vivarium[]> {
    const result = await this.pool.query<Vivarium>(
      "SELECT * FROM vivariums WHERE user_id = $1 ORDER BY created_at",
      [userId]
    );
    return result.rows;
  }

  async listAll(): Promise<Vivarium[]> {
    const result = await this.pool.query<Vivarium>(
      "SELECT * FROM vivariums ORDER BY name"
    );
    return result.rows;
  }

  async delete(vivariumId: number): Promise<void> {
    await this.pool.query("DELETE FROM vivariums WHERE id = $1", [vivariumId]);
  }
}
