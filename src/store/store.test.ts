import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase } from "./db.js";
import { UserStore } from "./users.js";
import { VivariumStore } from "./vivariums.js";
import type Database from "better-sqlite3";

describe("Store", () => {
  let db: Database.Database;
  let users: UserStore;
  let vivariums: VivariumStore;

  beforeEach(() => {
    db = createDatabase(":memory:");
    users = new UserStore(db);
    vivariums = new VivariumStore(db);
  });

  describe("UserStore", () => {
    it("should create a new user", () => {
      const user = users.getOrCreate(12345, "Alice");
      expect(user.telegram_id).toBe(12345);
      expect(user.display_name).toBe("Alice");
      expect(user.active_vivarium_id).toBeNull();
    });

    it("should return existing user on duplicate telegram_id", () => {
      const first = users.getOrCreate(12345, "Alice");
      const second = users.getOrCreate(12345, "Alice Updated");
      expect(first.id).toBe(second.id);
      expect(second.display_name).toBe("Alice");
    });

    it("should get user by telegram_id", () => {
      users.getOrCreate(12345, "Alice");
      const found = users.getByTelegramId(12345);
      expect(found).toBeDefined();
      expect(found!.display_name).toBe("Alice");
    });

    it("should return undefined for unknown telegram_id", () => {
      const found = users.getByTelegramId(99999);
      expect(found).toBeUndefined();
    });

    it("should set active vivarium", () => {
      const user = users.getOrCreate(12345);
      const viv = vivariums.register(user.id, "test", "hash123");

      users.setActiveVivarium(user.id, viv.id);

      const updated = users.getByTelegramId(12345);
      expect(updated!.active_vivarium_id).toBe(viv.id);
    });

    it("should clear active vivarium with null", () => {
      const user = users.getOrCreate(12345);
      const viv = vivariums.register(user.id, "test", "hash123");
      users.setActiveVivarium(user.id, viv.id);

      users.setActiveVivarium(user.id, null);

      const updated = users.getByTelegramId(12345);
      expect(updated!.active_vivarium_id).toBeNull();
    });
  });

  describe("VivariumStore", () => {
    let userId: number;

    beforeEach(() => {
      userId = users.getOrCreate(12345, "Alice").id;
    });

    it("should register a new vivarium", () => {
      const viv = vivariums.register(userId, "my-app", "hash123", "0.1.0");
      expect(viv.name).toBe("my-app");
      expect(viv.user_id).toBe(userId);
      expect(viv.status).toBe("online");
      expect(viv.version).toBe("0.1.0");
    });

    it("should update existing vivarium on re-register", () => {
      const first = vivariums.register(userId, "my-app", "hash1", "0.1.0");
      const second = vivariums.register(userId, "my-app", "hash2", "0.2.0");
      expect(first.id).toBe(second.id);
      expect(second.token_hash).toBe("hash2");
      expect(second.version).toBe("0.2.0");
      expect(second.status).toBe("online");
    });

    it("should set status", () => {
      const viv = vivariums.register(userId, "my-app", "hash123");
      vivariums.setStatus(viv.id, "offline");

      const updated = vivariums.getById(viv.id);
      expect(updated!.status).toBe("offline");
    });

    it("should get active vivarium for user", () => {
      const viv = vivariums.register(userId, "my-app", "hash123");
      users.setActiveVivarium(userId, viv.id);

      const active = vivariums.getActiveForUser(userId);
      expect(active).toBeDefined();
      expect(active!.name).toBe("my-app");
    });

    it("should return undefined when no active vivarium", () => {
      const active = vivariums.getActiveForUser(userId);
      expect(active).toBeUndefined();
    });

    it("should list vivariums for user", () => {
      vivariums.register(userId, "app-1", "hash1");
      vivariums.register(userId, "app-2", "hash2");

      const list = vivariums.listForUser(userId);
      expect(list).toHaveLength(2);
      expect(list.map((v) => v.name)).toEqual(["app-1", "app-2"]);
    });

    it("should enforce unique (user_id, name) constraint", () => {
      const user2Id = users.getOrCreate(67890, "Bob").id;

      vivariums.register(userId, "same-name", "hash1");
      vivariums.register(user2Id, "same-name", "hash2");

      expect(vivariums.listForUser(userId)).toHaveLength(1);
      expect(vivariums.listForUser(user2Id)).toHaveLength(1);
    });
  });
});
