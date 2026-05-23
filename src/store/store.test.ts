import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { createPool } from "./db.js";
import { UserStore } from "./users.js";
import { VivariumStore } from "./vivariums.js";
import type pg from "pg";

const TEST_DB_URL = process.env.TEST_DATABASE_URL ?? "postgres://viv:pass@localhost:5432/vivarium";

describe("Store", () => {
  let pool: pg.Pool;
  let users: UserStore;
  let vivariums: VivariumStore;

  beforeAll(async () => {
    pool = await createPool(TEST_DB_URL);
    users = new UserStore(pool);
    vivariums = new VivariumStore(pool);
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE users, vivariums RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("UserStore", () => {
    it("should create a new user", async () => {
      const user = await users.getOrCreate(12345, "Alice");
      expect(user.telegram_id).toBe(12345);
      expect(user.display_name).toBe("Alice");
      expect(user.active_vivarium_id).toBeNull();
    });

    it("should return existing user on duplicate telegram_id", async () => {
      const first = await users.getOrCreate(12345, "Alice");
      const second = await users.getOrCreate(12345, "Alice Updated");
      expect(first.id).toBe(second.id);
      expect(second.display_name).toBe("Alice");
    });

    it("should get user by telegram_id", async () => {
      await users.getOrCreate(12345, "Alice");
      const found = await users.getByTelegramId(12345);
      expect(found).toBeDefined();
      expect(found!.display_name).toBe("Alice");
    });

    it("should return undefined for unknown telegram_id", async () => {
      const found = await users.getByTelegramId(99999);
      expect(found).toBeUndefined();
    });

    it("should set active vivarium", async () => {
      const user = await users.getOrCreate(12345);
      const viv = await vivariums.register(user.id, "test", "hash123");

      await users.setActiveVivarium(user.id, viv.id);

      const updated = await users.getByTelegramId(12345);
      expect(updated!.active_vivarium_id).toBe(viv.id);
    });

    it("should clear active vivarium with null", async () => {
      const user = await users.getOrCreate(12345);
      const viv = await vivariums.register(user.id, "test", "hash123");
      await users.setActiveVivarium(user.id, viv.id);

      await users.setActiveVivarium(user.id, null);

      const updated = await users.getByTelegramId(12345);
      expect(updated!.active_vivarium_id).toBeNull();
    });
  });

  describe("VivariumStore", () => {
    let userId: number;

    beforeEach(async () => {
      userId = (await users.getOrCreate(12345, "Alice")).id;
    });

    it("should register a new vivarium", async () => {
      const viv = await vivariums.register(userId, "my-app", "hash123", "0.1.0");
      expect(viv.name).toBe("my-app");
      expect(viv.user_id).toBe(userId);
      expect(viv.version).toBe("0.1.0");
    });

    it("should update existing vivarium on re-register", async () => {
      const first = await vivariums.register(userId, "my-app", "hash1", "0.1.0");
      const second = await vivariums.register(userId, "my-app", "hash2", "0.2.0");
      expect(first.id).toBe(second.id);
      expect(second.token_hash).toBe("hash2");
      expect(second.version).toBe("0.2.0");
    });

    it("should get active vivarium for user", async () => {
      const viv = await vivariums.register(userId, "my-app", "hash123");
      await users.setActiveVivarium(userId, viv.id);

      const active = await vivariums.getActiveForUser(userId);
      expect(active).toBeDefined();
      expect(active!.name).toBe("my-app");
    });

    it("should return undefined when no active vivarium", async () => {
      const active = await vivariums.getActiveForUser(userId);
      expect(active).toBeUndefined();
    });

    it("should list vivariums for user", async () => {
      await vivariums.register(userId, "app-1", "hash1");
      await vivariums.register(userId, "app-2", "hash2");

      const list = await vivariums.listForUser(userId);
      expect(list).toHaveLength(2);
      expect(list.map((v) => v.name)).toEqual(["app-1", "app-2"]);
    });

    it("should enforce unique (user_id, name) constraint", async () => {
      const user2Id = (await users.getOrCreate(67890, "Bob")).id;

      await vivariums.register(userId, "same-name", "hash1");
      await vivariums.register(user2Id, "same-name", "hash2");

      expect(await vivariums.listForUser(userId)).toHaveLength(1);
      expect(await vivariums.listForUser(user2Id)).toHaveLength(1);
    });

    it("should get vivarium by user and name", async () => {
      await vivariums.register(userId, "my-app", "hash123");

      const found = await vivariums.getByUserAndName(userId, "my-app");
      expect(found).toBeDefined();
      expect(found!.name).toBe("my-app");

      const notFound = await vivariums.getByUserAndName(userId, "nonexistent");
      expect(notFound).toBeUndefined();
    });

    it("should delete a vivarium", async () => {
      const viv = await vivariums.register(userId, "to-delete", "hash123");
      expect(await vivariums.getById(viv.id)).toBeDefined();

      await vivariums.delete(viv.id);
      expect(await vivariums.getById(viv.id)).toBeUndefined();
      expect(await vivariums.listForUser(userId)).toHaveLength(0);
    });

    it("should clear active_vivarium_id on delete via foreign key", async () => {
      const viv = await vivariums.register(userId, "active-app", "hash123");
      await users.setActiveVivarium(userId, viv.id);

      await users.setActiveVivarium(userId, null);
      await vivariums.delete(viv.id);

      const user = await users.getByTelegramId(12345);
      expect(user!.active_vivarium_id).toBeNull();
    });
  });

  describe("UserStore - getById", () => {
    it("should get user by internal id", async () => {
      const created = await users.getOrCreate(12345, "Alice");
      const found = await users.getById(created.id);
      expect(found).toBeDefined();
      expect(found!.telegram_id).toBe(12345);
    });

    it("should return undefined for unknown id", async () => {
      const found = await users.getById(99999);
      expect(found).toBeUndefined();
    });
  });
});
