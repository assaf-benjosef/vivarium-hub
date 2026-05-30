import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { log } from "../util/log.js";

export interface ConsoleEvent {
  type: "vivarium_online" | "vivarium_offline";
  vivariumId: string;
  name: string;
}

export class ConsoleWsServer {
  private wss: WebSocketServer;
  private clients = new Set<WebSocket>();

  constructor() {
    this.wss = new WebSocketServer({ noServer: true });
    this.wss.on("connection", (ws) => {
      this.clients.add(ws);
      log.info("console-ws", `Browser connected (${this.clients.size} total)`);

      ws.send(JSON.stringify({ type: "connected" }));

      ws.on("close", () => {
        this.clients.delete(ws);
      });

      ws.on("error", () => {
        this.clients.delete(ws);
      });
    });
  }

  handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit("connection", ws, request);
    });
  }

  broadcast(event: ConsoleEvent): void {
    const data = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  close(): void {
    this.wss.close();
  }
}
