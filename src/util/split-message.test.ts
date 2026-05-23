import { describe, it, expect } from "vitest";
import { splitMessage } from "./split-message.js";

describe("splitMessage", () => {
  it("should return single chunk for short messages", () => {
    const result = splitMessage("Hello");
    expect(result).toEqual(["Hello"]);
  });

  it("should not split messages under max length", () => {
    const msg = "a".repeat(3999);
    const result = splitMessage(msg);
    expect(result).toHaveLength(1);
  });

  it("should split at newlines when possible", () => {
    const line = "a".repeat(2500);
    const msg = `${line}\n${line}`;
    const result = splitMessage(msg, 3000);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(line);
    expect(result[1]).toBe(line);
  });

  it("should split at spaces when no good newline", () => {
    const word = "word ";
    const msg = word.repeat(1000);
    const result = splitMessage(msg, 4000);
    expect(result.length).toBeGreaterThan(1);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(4000);
    }
  });

  it("should hard-cut when no newline or space is available", () => {
    const msg = "x".repeat(8000);
    const result = splitMessage(msg, 4000);
    expect(result).toHaveLength(2);
    expect(result[0].length).toBe(4000);
    expect(result[1].length).toBe(4000);
  });

  it("should handle empty string", () => {
    const result = splitMessage("");
    expect(result).toEqual([""]);
  });
});
