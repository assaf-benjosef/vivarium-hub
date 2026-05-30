import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import { WebSocket } from "ws";
import { WsServer } from "./ws/server.js";
import { Router } from "./router/router.js";
import { createPool } from "./store/db.js";
import { UserStore } from "./store/users.js";
import { VivariumStore } from "./store/vivariums.js";
import { createSetupToken } from "./auth/tokens.js";
import type { ChatProvider } from "./chat/provider.js";
import type pg from "pg";

const JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
const TEST_DB_URL = process.env.TEST_DATABASE_URL ?? "postgres://viv:pass@localhost:5432/vivarium";

describe("Integration: Hub <> Vivarium", () => {
  let pool: pg.Pool;
  let users: UserStore;
  let vivariumStore: VivariumStore;
  let httpServer: Server;
  let wsServer: WsServer;
  let router: Router;
  let chatSent: Array<{ method: string; chatId: number | string; args: unknown[] }>;
  let port: number;

  beforeAll(async () => {
    pool = await createPool(TEST_DB_URL);
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE users, vivariums RESTART IDENTITY CASCADE");

    users = new UserStore(pool);
    vivariumStore = new VivariumStore(pool);
    chatSent = [];

    const chatProvider: ChatProvider = {
      start: async () => {},
      stop: async () => {},
      sendMessage: async (chatId, text) => {
        chatSent.push({ method: "sendMessage", chatId, args: [text] });
      },
      sendImage: async (chatId, image, caption) => {
        chatSent.push({ method: "sendImage", chatId, args: [image, caption] });
      },
      sendTypingAction: async (chatId) => {
        chatSent.push({ method: "sendTypingAction", chatId, args: [] });
      },
    };

    httpServer = createServer();

    router = undefined as unknown as Router;

    wsServer = new WsServer({
      jwtSecret: JWT_SECRET,
      users,
      vivariums: vivariumStore,
      onMessage: (vivariumId: string, msg: any) => router.handleVivariumEvent(vivariumId, msg),
      onConnect: (vivariumId: string, userId: number) => router.handleVivariumOnline(vivariumId, userId),
      onDisconnect: (vivariumId: string, userId: number) => router.handleVivariumOffline(vivariumId, userId),
    });

    router = new Router(wsServer, chatProvider, users, vivariumStore);

    httpServer.on("upgrade", (req, socket, head) => {
      wsServer.handleUpgrade(req, socket, head);
    });

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const addr = httpServer.address();
        port = typeof addr === "object" && addr ? addr.port : 0;
        resolve();
      });
    });
  });

  afterEach(async () => {
    wsServer.close();
    httpServer.close();
    // Let pending async callbacks (e.g. handleVivariumOffline) settle
    await new Promise((r) => setTimeout(r, 100));
  });

  afterAll(async () => {
    await pool.end();
  });

  async function connectVivarium(
    telegramUserId: number,
    name = "test-viv"
  ): Promise<{ ws: WebSocket; vivariumId: string }> {
    const user = await users.getOrCreate(telegramUserId);
    const token = await createSetupToken(user.id, JWT_SECRET);
    const ws = new WebSocket(`ws://localhost:${port}/ws`);

    await new Promise<void>((resolve, reject) => {
      ws.on("open", resolve);
      ws.on("error", reject);
    });

    ws.send(JSON.stringify({ type: "register", token, name, version: "0.1.0" }));

    const response = await new Promise<Record<string, unknown>>((resolve) => {
      ws.once("message", (data) => resolve(JSON.parse(data.toString())));
    });

    expect(response.type).toBe("registered");
    return { ws, vivariumId: response.vivariumId as string };
  }

  function simulateMockAgent(ws: WebSocket): void {
    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type !== "message") return;

      ws.send(JSON.stringify({ type: "event", msgId: msg.id, event: "typing" }));

      setTimeout(() => {
        ws.send(
          JSON.stringify({
            type: "event",
            msgId: msg.id,
            event: "text",
            content: `Built: ${msg.text}`,
          })
        );

        ws.send(
          JSON.stringify({
            type: "event",
            msgId: msg.id,
            event: "done",
            cost: 0.042,
          })
        );
      }, 50);
    });
  }

  it("should complete full message flow: Telegram > Hub > Vivarium > Hub > Telegram", { timeout: 10_000 }, async () => {
    const TELEGRAM_ID = 12345;
    const CHAT_ID = 100;

    const { ws } = await connectVivarium(TELEGRAM_ID);
    simulateMockAgent(ws);

    await router.routeUserMessage(TELEGRAM_ID, CHAT_ID, "build me a todo app");

    await new Promise((r) => setTimeout(r, 500));

    const textMessages = chatSent.filter(
      (s) => s.method === "sendMessage" && (s.args[0] as string).includes("Built:")
    );
    expect(textMessages).toHaveLength(1);
    expect(textMessages[0].args[0]).toBe("Built: build me a todo app");
    expect(textMessages[0].chatId).toBe(CHAT_ID);

    const typingActions = chatSent.filter((s) => s.method === "sendTypingAction");
    expect(typingActions.length).toBeGreaterThanOrEqual(1);

    ws.close();
  });

  it("should report offline when vivarium disconnects", async () => {
    const TELEGRAM_ID = 12345;
    const CHAT_ID = 100;

    const { ws } = await connectVivarium(TELEGRAM_ID);

    ws.close();
    await new Promise((r) => setTimeout(r, 100));

    chatSent.length = 0;
    await router.routeUserMessage(TELEGRAM_ID, CHAT_ID, "hello");

    const offlineMessages = chatSent.filter(
      (s) => s.method === "sendMessage" && (s.args[0] as string).includes("offline")
    );
    expect(offlineMessages).toHaveLength(1);
  });

  it("should handle vivarium reconnection", async () => {
    const TELEGRAM_ID = 12345;
    const CHAT_ID = 100;

    const { ws: ws1 } = await connectVivarium(TELEGRAM_ID);
    ws1.close();
    await new Promise((r) => setTimeout(r, 100));

    const { ws: ws2 } = await connectVivarium(TELEGRAM_ID);
    simulateMockAgent(ws2);

    chatSent.length = 0;
    await router.routeUserMessage(TELEGRAM_ID, CHAT_ID, "add dark mode");
    await new Promise((r) => setTimeout(r, 200));

    const textMessages = chatSent.filter(
      (s) => s.method === "sendMessage" && (s.args[0] as string).includes("Built:")
    );
    expect(textMessages).toHaveLength(1);

    ws2.close();
  });
});
