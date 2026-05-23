import { describe, it, expect } from "vitest";
import { createSetupToken, validateSetupToken, hashToken } from "./tokens.js";

const TEST_SECRET = "test-secret-that-is-at-least-32-characters-long";

describe("JWT tokens", () => {
  it("should create and validate a token", async () => {
    const token = await createSetupToken(12345, TEST_SECRET);
    const result = await validateSetupToken(token, TEST_SECRET);
    expect(result.userId).toBe(12345);
  });

  it("should reject a token with wrong secret", async () => {
    const token = await createSetupToken(12345, TEST_SECRET);
    await expect(validateSetupToken(token, "wrong-secret-that-is-at-least-32-chars")).rejects.toThrow();
  });

  it("should reject a malformed token", async () => {
    await expect(validateSetupToken("not-a-jwt", TEST_SECRET)).rejects.toThrow();
  });
});

describe("hashToken", () => {
  it("should produce consistent hashes", () => {
    const hash1 = hashToken("test-token");
    const hash2 = hashToken("test-token");
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different tokens", () => {
    const hash1 = hashToken("token-1");
    const hash2 = hashToken("token-2");
    expect(hash1).not.toBe(hash2);
  });

  it("should return a hex string", () => {
    const hash = hashToken("test");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
