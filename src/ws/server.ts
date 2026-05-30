import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import { VivariumMessageSchema, type VivariumMessage, type HubMessage } from "./protocol.js";
import { validateSetupToken, hashToken } from "../auth/tokens.js";
import { UserStore } from "../store/users.js";
import { VivariumStore } from "../store/vivariums.js";
import type { VivariumConnection } from "./connection.js";
import { log } from "../util/log.js";

const REGISTRATION_TIMEOUT_MS = 10_000;
const HEARTBEAT_INTERVAL_MS = 30_000;
const HEARTBEAT_TIMEOUT_MS = 60_000;

export interface WsServerOptions {
  jwtSecret: string;
  users: UserStore;
  vivariums: VivariumStore;
  onMessage: (vivariumId: string, msg: VivariumMessage) => void;
  onConnect: (vivariumId: string, userId: number) => void;
  onDisconnect: (vivariumId: string, userId: number) => void;
}

export class WsServer {
  private wss: WebSocketServer;
  private connections = new Map<string, VivariumConnection>();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private options: WsServerOptions;

  constructor(server: Server, options: WsServerOptions) {
    this.options = options;
    this.wss = new WebSocketServer({ server, path: "/ws" });
    this.wss.on("connection", (ws) => this.handleConnection(ws));
    this.startHeartbeat();
  }

  private handleConnection(ws: WebSocket): void {
    let registered = false;

    const timeout = setTimeout(() => {
      if (!registered) {
        ws.close(4001, "Registration timeout");
      }
    }, REGISTRATION_TIMEOUT_MS);

    ws.on("message", (data) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(data.toString());
      } catch {
        ws.close(4002, "Invalid JSON");
        return;
      }

      const result = VivariumMessageSchema.safeParse(parsed);
      if (!result.success) {
        ws.close(4003, "Invalid message format");
        return;
      }

      const msg = result.data;

      if (!registered) {
        if (msg.type !== "register") {
          ws.close(4004, "Must register first");
          return;
        }
        this.handleRegister(ws, msg, timeout)
          .then(() => {
            registered = true;
          })
          .catch(() => {
            ws.close(4005, "Registration failed");
          });
        return;
      }

      const conn = this.findConnectionByWs(ws);
      if (conn) {
        this.options.onMessage(conn.vivariumId, msg);
      }
    });

    ws.on("close", () => {
      clearTimeout(timeout);
      const conn = this.findConnectionByWs(ws);
      if (conn) {
        this.connections.delete(conn.vivariumId);
        this.options.onDisconnect(conn.vivariumId, conn.userId);
      }
    });

    ws.on("pong", () => {
      const conn = this.findConnectionByWs(ws);
      if (conn) {
        conn.lastPongAt = new Date();
      }
    });
  }

  private async handleRegister(
    ws: WebSocket,
    msg: Extract<VivariumMessage, { type: "register" }>,
    timeout: ReturnType<typeof setTimeout>
  ): Promise<void> {
    const { userId } = await validateSetupToken(msg.token, this.options.jwtSecret);

    const user = await this.options.users.getOrCreate(userId);
    const tokenHash = hashToken(msg.token);
    const vivarium = await this.options.vivariums.register(user.id, msg.name, tokenHash, msg.version);

    if (!user.active_vivarium_id) {
      await this.options.users.setActiveVivarium(user.id, vivarium.id);
    }

    const vivariumId = String(vivarium.id);

    // Don't close/terminate the old socket — SmolVM's TSI networking delivers
    // the TCP RST to other connections from the same guest, causing a cascade.
    // The orphaned socket will be cleaned up by the heartbeat timeout.
    const existing = this.connections.get(vivariumId);
    if (existing) {
      this.connections.delete(vivariumId);
    }

    const conn: VivariumConnection = {
      ws,
      vivariumId,
      userId: user.id,
      name: msg.name,
      version: msg.version,
      connectedAt: new Date(),
      lastPongAt: new Date(),
      isRegistered: true,
    };

    this.connections.set(vivariumId, conn);
    clearTimeout(timeout);

    const response: HubMessage = { type: "registered", vivariumId };
    ws.send(JSON.stringify(response));

    log.info("ws", `Vivarium "${msg.name}" registered (id=${vivariumId}, userId=${user.id})`);
    this.options.onConnect(vivariumId, user.id);
  }

  private findConnectionByWs(ws: WebSocket): VivariumConnection | undefined {
    for (const conn of this.connections.values()) {
      if (conn.ws === ws) return conn;
    }
    return undefined;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      for (const [id, conn] of this.connections) {
        if (now - conn.lastPongAt.getTime() > HEARTBEAT_TIMEOUT_MS) {
          log.info("ws", `Vivarium "${conn.name}" heartbeat timeout, disconnecting`);
          conn.ws.terminate();
          this.connections.delete(id);
          this.options.onDisconnect(id, conn.userId);
        } else {
          conn.ws.ping();
        }
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  sendToVivarium(vivariumId: string, msg: HubMessage): boolean {
    const conn = this.connections.get(vivariumId);
    if (!conn || conn.ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    conn.ws.send(JSON.stringify(msg));
    return true;
  }

  isConnected(vivariumId: string): boolean {
    const conn = this.connections.get(vivariumId);
    return !!conn && conn.ws.readyState === WebSocket.OPEN;
  }

  getConnection(vivariumId: string): VivariumConnection | undefined {
    return this.connections.get(vivariumId);
  }

  close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss.close();
  }
}
