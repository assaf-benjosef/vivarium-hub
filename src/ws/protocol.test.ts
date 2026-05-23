import { describe, it, expect } from "vitest";
import { VivariumMessageSchema, HubMessageSchema } from "./protocol.js";

describe("VivariumMessageSchema", () => {
  it("should accept a valid register message", () => {
    const msg = { type: "register", token: "eyJ...", name: "my-viv", version: "0.1.0" };
    expect(VivariumMessageSchema.parse(msg)).toEqual(msg);
  });

  it("should accept a valid text event", () => {
    const msg = { type: "event", msgId: "msg_1", event: "text", content: "Hello!" };
    expect(VivariumMessageSchema.parse(msg)).toEqual(msg);
  });

  it("should accept a valid screenshot event", () => {
    const msg = { type: "event", msgId: "msg_1", event: "screenshot", image: "base64data" };
    expect(VivariumMessageSchema.parse(msg)).toEqual(msg);
  });

  it("should accept a done event with optional cost", () => {
    const msg = { type: "event", msgId: "msg_1", event: "done" };
    expect(VivariumMessageSchema.parse(msg)).toEqual(msg);

    const msgWithCost = { type: "event", msgId: "msg_1", event: "done", cost: 0.045 };
    expect(VivariumMessageSchema.parse(msgWithCost)).toEqual(msgWithCost);
  });

  it("should accept a typing event", () => {
    const msg = { type: "event", msgId: "msg_1", event: "typing" };
    expect(VivariumMessageSchema.parse(msg)).toEqual(msg);
  });

  it("should accept an error event", () => {
    const msg = { type: "event", msgId: "msg_1", event: "error", message: "something broke" };
    expect(VivariumMessageSchema.parse(msg)).toEqual(msg);
  });

  it("should accept a status message", () => {
    const msg = { type: "status", appRunning: true, uptime: 3600 };
    expect(VivariumMessageSchema.parse(msg)).toEqual(msg);
  });

  it("should reject unknown message types", () => {
    expect(() => VivariumMessageSchema.parse({ type: "unknown" })).toThrow();
  });

  it("should reject malformed messages", () => {
    expect(() => VivariumMessageSchema.parse({ type: "register" })).toThrow();
    expect(() => VivariumMessageSchema.parse({ type: "event", msgId: "msg_1" })).toThrow();
  });
});

describe("HubMessageSchema", () => {
  it("should accept a registered message", () => {
    const msg = { type: "registered", vivariumId: "viv_123" };
    expect(HubMessageSchema.parse(msg)).toEqual(msg);
  });

  it("should accept a message", () => {
    const msg = { type: "message", id: "msg_1", text: "add dark mode" };
    expect(HubMessageSchema.parse(msg)).toEqual(msg);
  });

  it("should accept a wake message", () => {
    const msg = { type: "wake", reason: "user switched" };
    expect(HubMessageSchema.parse(msg)).toEqual(msg);
  });

  it("should accept a health_check message", () => {
    const msg = { type: "health_check" };
    expect(HubMessageSchema.parse(msg)).toEqual(msg);
  });

  it("should reject unknown message types", () => {
    expect(() => HubMessageSchema.parse({ type: "unknown" })).toThrow();
  });

  it("should reject malformed messages", () => {
    expect(() => HubMessageSchema.parse({ type: "message" })).toThrow();
  });
});
