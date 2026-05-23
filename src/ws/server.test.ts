import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createServer, type Server } from "node:http";
import { WebSocket } from "ws";
import { WsServer } from "./server.js";
import { createDatabase } from "../store/db.js";
import { UserStore } from "../store/users.js";
import { VivariumStore } from "../store/vivariums.js";
import { createSetupToken } from "../auth/tokens.js";
import type Database from "better-sqlite3";
import type { VivariumMessage } from "./protocol.js";

const JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";

function waitForOpen(ws: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    ws.on("open", resolve);
    ws.on("error", reject);
  });
}

function waitForMessage(ws: WebSocket): Promise<unknown> {
  return new Promise((resolve) => {
    ws.once("message", (data) => {
      resolve(JSON.parse(data.toString()));
    });
  });
}

function waitForClose(ws: WebSocket): Promise<{ code: number; reason: string }> {
  return new Promise((resolve) => {
    ws.on("close", (code, reason) => {
      resolve({ code, reason: reason.toString() });
    });
  });
}

describe("WsServer", () => {
  let httpServer: Server;
  let wsServer: WsServer;
  let db: Database.Database;
  let users: UserStore;
  let vivariums: VivariumStore;
  let port: number;
  let receivedMessages: Array<{ vivariumId: string; msg: VivariumMessage }>;
  let connectedIds: string[];
  let disconnectedIds: string[];

  beforeEach(async () => {
    db = createDatabase(":memory:");
    users = new UserStore(db);
    vivariums = new VivariumStore(db);
    receivedMessages = [];
    connectedIds = [];
    disconnectedIds = [];

    httpServer = createServer();
    wsServer = new WsServer(httpServer, {
      jwtSecret: JWT_SECRET,
      users,
      vivariums,
      onMessage: (vivariumId, msg) => receivedMessages.push({ vivariumId, msg }),
      onConnect: (vivariumId) => connectedIds.push(vivariumId),
      onDisconnect: (vivariumId) => disconnectedIds.push(vivariumId),
    });

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const addr = httpServer.address();
        port = typeof addr === "object" && addr ? addr.port : 0;
        resolve();
      });
    });
  });

  afterEach(() => {
    wsServer.close();
    httpServer.close();
  });

  async function connectAndRegister(userId = 12345, name = "test-viv"): Promise<WebSocket> {
    const token = await createSetupToken(userId, JWT_SECRET);
    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    await waitForOpen(ws);

    const responsePromise = waitForMessage(ws);
    ws.send(JSON.stringify({ type: "register", token, name, version: "0.1.0" }));
    const response = await responsePromise;

    expect(response).toHaveProperty("type", "registered");
    return ws;
  }

  it("should accept a valid registration", async () => {
    const ws = await connectAndRegister();
    expect(connectedIds).toHaveLength(1);
    ws.close();
  });

  it("should reject invalid token", async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    await waitForOpen(ws);

    const closePromise = waitForClose(ws);
    ws.send(JSON.stringify({ type: "register", token: "bad-token", name: "test", version: "0.1.0" }));
    const { code } = await closePromise;

    expect(code).toBe(4005);
  });

  it("should close connection on registration timeout", async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    await waitForOpen(ws);

    const closePromise = waitForClose(ws);
    // Don't send register — wait for timeout
    const { code } = await closePromise;
    expect(code).toBe(4001);
  }, 15_000);

  it("should reject non-register message before registration", async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    await waitForOpen(ws);

    const closePromise = waitForClose(ws);
    ws.send(JSON.stringify({ type: "status", appRunning: true, uptime: 100 }));
    const { code } = await closePromise;
    expect(code).toBe(4004);
  });

  it("should forward messages after registration", async () => {
    const ws = await connectAndRegister();

    ws.send(JSON.stringify({ type: "event", msgId: "msg_1", event: "text", content: "hello" }));

    // Give it a moment to process
    await new Promise((r) => setTimeout(r, 50));

    expect(receivedMessages).toHaveLength(1);
    expect(receivedMessages[0].msg).toEqual({
      type: "event",
      msgId: "msg_1",
      event: "text",
      content: "hello",
    });

    ws.close();
  });

  it("should send messages to vivarium", async () => {
    const ws = await connectAndRegister();
    const vivariumId = connectedIds[0];

    const msgPromise = waitForMessage(ws);
    const sent = wsServer.sendToVivarium(vivariumId, {
      type: "message",
      id: "msg_1",
      text: "add dark mode",
    });

    expect(sent).toBe(true);
    const received = await msgPromise;
    expect(received).toEqual({ type: "message", id: "msg_1", text: "add dark mode" });

    ws.close();
  });

  it("should return false when sending to disconnected vivarium", () => {
    const sent = wsServer.sendToVivarium("nonexistent", {
      type: "message",
      id: "msg_1",
      text: "hello",
    });
    expect(sent).toBe(false);
  });

  it("should detect disconnect", async () => {
    const ws = await connectAndRegister();
    const vivariumId = connectedIds[connectedIds.length - 1];
    const countBefore = disconnectedIds.length;

    ws.close();
    await new Promise((r) => setTimeout(r, 50));

    expect(disconnectedIds.length - countBefore).toBe(1);
    expect(disconnectedIds).toContain(vivariumId);
  });

  it("should handle reconnection (replace old connection)", async () => {
    const ws1 = await connectAndRegister(12345, "my-viv");
    const ws2 = await connectAndRegister(12345, "my-viv");

    // ws1 should have been closed
    await new Promise((r) => setTimeout(r, 50));

    expect(ws1.readyState).toBe(WebSocket.CLOSED);
    expect(connectedIds).toHaveLength(2);

    ws2.close();
  });

  it("should report connection status correctly", async () => {
    const ws = await connectAndRegister();
    const vivariumId = connectedIds[0];

    expect(wsServer.isConnected(vivariumId)).toBe(true);
    expect(wsServer.isConnected("nonexistent")).toBe(false);

    ws.close();
    await new Promise((r) => setTimeout(r, 50));
    expect(wsServer.isConnected(vivariumId)).toBe(false);
  });

  it("should create user and vivarium records in store", async () => {
    const ws = await connectAndRegister(12345, "my-app");

    const user = users.getByTelegramId(12345);
    expect(user).toBeDefined();
    expect(user!.active_vivarium_id).not.toBeNull();

    const vivList = vivariums.listForUser(user!.id);
    expect(vivList).toHaveLength(1);
    expect(vivList[0].name).toBe("my-app");
    expect(vivList[0].status).toBe("online");

    ws.close();
  });
});
