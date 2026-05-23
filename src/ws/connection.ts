import type WebSocket from "ws";

export interface VivariumConnection {
  ws: WebSocket;
  vivariumId: string;
  userId: number;
  name: string;
  version: string;
  connectedAt: Date;
  lastPongAt: Date;
  isRegistered: boolean;
}
