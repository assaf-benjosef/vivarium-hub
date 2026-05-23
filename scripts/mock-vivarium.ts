#!/usr/bin/env tsx
/**
 * Mock vivarium for testing the hub. Connects, registers, and echoes messages.
 *
 * Usage:
 *   HUB_URL=ws://localhost:8080/ws HUB_TOKEN=eyJ... tsx scripts/mock-vivarium.ts
 */
import { WebSocket } from "ws";

const HUB_URL = process.env.HUB_URL ?? "ws://localhost:8080/ws";
const HUB_TOKEN = process.env.HUB_TOKEN;

if (!HUB_TOKEN) {
  console.error("HUB_TOKEN env var is required");
  process.exit(1);
}

const ws = new WebSocket(HUB_URL);

ws.on("open", () => {
  console.log("[mock] Connected to hub");
  ws.send(
    JSON.stringify({
      type: "register",
      token: HUB_TOKEN,
      name: "mock-vivarium",
      version: "0.0.1",
    })
  );
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log("[mock] Received:", JSON.stringify(msg));

  if (msg.type === "registered") {
    console.log(`[mock] Registered as ${msg.vivariumId}`);
    return;
  }

  if (msg.type === "message") {
    // Echo the message back as a text event + done
    ws.send(
      JSON.stringify({
        type: "event",
        msgId: msg.id,
        event: "text",
        content: `Echo: ${msg.text}`,
      })
    );
    ws.send(
      JSON.stringify({
        type: "event",
        msgId: msg.id,
        event: "done",
      })
    );
  }
});

ws.on("close", (code, reason) => {
  console.log(`[mock] Disconnected: ${code} ${reason}`);
});

ws.on("error", (err) => {
  console.error("[mock] Error:", err.message);
});
