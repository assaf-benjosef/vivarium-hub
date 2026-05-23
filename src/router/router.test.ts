import { describe, it, expect, beforeEach, vi } from "vitest";
import { Router } from "./router.js";
import { createDatabase } from "../store/db.js";
import { UserStore } from "../store/users.js";
import { VivariumStore } from "../store/vivariums.js";
import type { ChatProvider } from "../chat/provider.js";
import type { WsServer } from "../ws/server.js";
import type Database from "better-sqlite3";

function createMockChatProvider(): ChatProvider & {
  sent: Array<{ method: string; args: unknown[] }>;
} {
  const sent: Array<{ method: string; args: unknown[] }> = [];
  return {
    sent,
    start: vi.fn(async () => {}),
    stop: vi.fn(async () => {}),
    sendMessage: vi.fn(async (chatId, text) => {
      sent.push({ method: "sendMessage", args: [chatId, text] });
    }),
    sendImage: vi.fn(async (chatId, image, caption) => {
      sent.push({ method: "sendImage", args: [chatId, image, caption] });
    }),
    sendTypingAction: vi.fn(async (chatId) => {
      sent.push({ method: "sendTypingAction", args: [chatId] });
    }),
  };
}

function createMockWsServer(): WsServer & {
  sentMessages: Array<{ vivariumId: string; msg: unknown }>;
  connected: Set<string>;
} {
  const sentMessages: Array<{ vivariumId: string; msg: unknown }> = [];
  const connected = new Set<string>();
  return {
    sentMessages,
    connected,
    sendToVivarium: vi.fn((vivariumId: string, msg: unknown) => {
      sentMessages.push({ vivariumId, msg });
      return connected.has(vivariumId);
    }),
    isConnected: vi.fn((vivariumId: string) => connected.has(vivariumId)),
    getConnection: vi.fn(),
    close: vi.fn(),
  } as unknown as WsServer & {
    sentMessages: Array<{ vivariumId: string; msg: unknown }>;
    connected: Set<string>;
  };
}

describe("Router", () => {
  let db: Database.Database;
  let users: UserStore;
  let vivariums: VivariumStore;
  let chat: ReturnType<typeof createMockChatProvider>;
  let ws: ReturnType<typeof createMockWsServer>;
  let router: Router;

  beforeEach(() => {
    db = createDatabase(":memory:");
    users = new UserStore(db);
    vivariums = new VivariumStore(db);
    chat = createMockChatProvider();
    ws = createMockWsServer();
    router = new Router(ws, chat, users, vivariums);
  });

  function setupUserWithVivarium(telegramId = 12345) {
    const user = users.getOrCreate(telegramId, "Alice");
    const viv = vivariums.register(user.id, "test-app", "hash123");
    users.setActiveVivarium(user.id, viv.id);
    ws.connected.add(String(viv.id));
    return { user, viv };
  }

  it("should route message to connected vivarium", async () => {
    const { viv } = setupUserWithVivarium();

    await router.routeUserMessage(12345, 100, "add dark mode");

    expect(ws.sentMessages).toHaveLength(1);
    expect(ws.sentMessages[0].vivariumId).toBe(String(viv.id));

    const msg = ws.sentMessages[0].msg as { type: string; id: string; text: string };
    expect(msg.type).toBe("message");
    expect(msg.text).toBe("add dark mode");
    expect(msg.id).toMatch(/^msg_/);
  });

  it("should send typing action when routing message", async () => {
    setupUserWithVivarium();

    await router.routeUserMessage(12345, 100, "hello");

    const typingActions = chat.sent.filter((s) => s.method === "sendTypingAction");
    expect(typingActions.length).toBeGreaterThanOrEqual(1);
  });

  it("should tell user when vivarium is offline", async () => {
    const user = users.getOrCreate(12345, "Alice");
    const viv = vivariums.register(user.id, "test-app", "hash123");
    users.setActiveVivarium(user.id, viv.id);
    // Don't add to ws.connected

    await router.routeUserMessage(12345, 100, "hello");

    expect(ws.sentMessages).toHaveLength(0);
    const messages = chat.sent.filter((s) => s.method === "sendMessage");
    expect(messages).toHaveLength(1);
    expect(messages[0].args[1]).toContain("offline");
  });

  it("should tell user when no vivarium is set up", async () => {
    users.getOrCreate(12345, "Alice");

    await router.routeUserMessage(12345, 100, "hello");

    const messages = chat.sent.filter((s) => s.method === "sendMessage");
    expect(messages).toHaveLength(1);
    expect(messages[0].args[1]).toContain("set up");
  });

  it("should forward text events to chat", async () => {
    setupUserWithVivarium();
    await router.routeUserMessage(12345, 100, "hello");

    const msgId = (ws.sentMessages[0].msg as { id: string }).id;

    await router.handleVivariumEvent("1", {
      type: "event",
      msgId,
      event: "text",
      content: "Here's what I built!",
    });

    const messages = chat.sent.filter(
      (s) => s.method === "sendMessage" && (s.args[1] as string).includes("built")
    );
    expect(messages).toHaveLength(1);
  });

  it("should forward screenshot events to chat", async () => {
    setupUserWithVivarium();
    await router.routeUserMessage(12345, 100, "hello");

    const msgId = (ws.sentMessages[0].msg as { id: string }).id;

    const fakeBase64 = Buffer.from("fake-png").toString("base64");
    await router.handleVivariumEvent("1", {
      type: "event",
      msgId,
      event: "screenshot",
      image: fakeBase64,
    });

    const images = chat.sent.filter((s) => s.method === "sendImage");
    expect(images).toHaveLength(1);
  });

  it("should clear typing interval on done event", async () => {
    setupUserWithVivarium();
    await router.routeUserMessage(12345, 100, "hello");

    const msgId = (ws.sentMessages[0].msg as { id: string }).id;

    await router.handleVivariumEvent("1", {
      type: "event",
      msgId,
      event: "done",
    });

    // Sending another text for same msgId should be ignored (inFlight cleared)
    await router.handleVivariumEvent("1", {
      type: "event",
      msgId,
      event: "text",
      content: "should be ignored",
    });

    const lateTexts = chat.sent.filter(
      (s) => s.method === "sendMessage" && (s.args[1] as string).includes("ignored")
    );
    expect(lateTexts).toHaveLength(0);
  });

  it("should handle error event", async () => {
    setupUserWithVivarium();
    await router.routeUserMessage(12345, 100, "hello");

    const msgId = (ws.sentMessages[0].msg as { id: string }).id;

    await router.handleVivariumEvent("1", {
      type: "event",
      msgId,
      event: "error",
      message: "Agent crashed",
    });

    const errors = chat.sent.filter(
      (s) => s.method === "sendMessage" && (s.args[1] as string).includes("wrong")
    );
    expect(errors).toHaveLength(1);
  });

  it("should ignore events with unknown msgId", async () => {
    await router.handleVivariumEvent("1", {
      type: "event",
      msgId: "msg_unknown",
      event: "text",
      content: "orphaned",
    });

    const messages = chat.sent.filter((s) => s.method === "sendMessage");
    expect(messages).toHaveLength(0);
  });

  it("should notify user when vivarium goes offline mid-message", async () => {
    const { user } = setupUserWithVivarium();
    await router.routeUserMessage(12345, 100, "hello");

    router.handleVivariumOffline("1", user.id);

    // Give async operations a tick
    await new Promise((r) => setTimeout(r, 10));

    const offlineMessages = chat.sent.filter(
      (s) => s.method === "sendMessage" && (s.args[1] as string).includes("offline")
    );
    expect(offlineMessages).toHaveLength(1);
  });
});
