import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("loadConfig", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  async function getLoadConfig() {
    const { loadConfig } = await import("./config.js");
    return loadConfig;
  }

  it("should throw if TELEGRAM_BOT_TOKEN is missing", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    process.env.JWT_SECRET = "a".repeat(32);

    const loadConfig = await getLoadConfig();
    expect(() => loadConfig()).toThrow();
  });

  it("should throw if JWT_SECRET is missing", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:ABC";
    delete process.env.JWT_SECRET;

    const loadConfig = await getLoadConfig();
    expect(() => loadConfig()).toThrow();
  });

  it("should throw if JWT_SECRET is too short", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:ABC";
    process.env.JWT_SECRET = "tooshort";

    const loadConfig = await getLoadConfig();
    expect(() => loadConfig()).toThrow();
  });

  it("should parse valid config with defaults", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:ABC";
    process.env.JWT_SECRET = "a".repeat(32);

    const loadConfig = await getLoadConfig();
    const config = loadConfig();

    expect(config.telegramBotToken).toBe("123:ABC");
    expect(config.jwtSecret).toBe("a".repeat(32));
    expect(config.databaseUrl).toBe("postgres://viv:pass@localhost:5432/vivarium");
    expect(config.port).toBe(8080);
    expect(config.allowedUsers).toEqual([]);
  });

  it("should parse ALLOWED_USERS", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:ABC";
    process.env.JWT_SECRET = "a".repeat(32);
    process.env.ALLOWED_USERS = "111,222,333";

    const loadConfig = await getLoadConfig();
    const config = loadConfig();

    expect(config.allowedUsers).toEqual([111, 222, 333]);
  });

  it("should handle ALLOWED_USERS with spaces and empty segments", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:ABC";
    process.env.JWT_SECRET = "a".repeat(32);
    process.env.ALLOWED_USERS = " 111 , , 222 , ";

    const loadConfig = await getLoadConfig();
    const config = loadConfig();

    expect(config.allowedUsers).toEqual([111, 222]);
  });

  it("should use custom PORT if set", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:ABC";
    process.env.JWT_SECRET = "a".repeat(32);
    process.env.PORT = "9090";

    const loadConfig = await getLoadConfig();
    const config = loadConfig();

    expect(config.port).toBe(9090);
  });
});
