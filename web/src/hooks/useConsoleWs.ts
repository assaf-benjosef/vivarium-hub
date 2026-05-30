import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ConsoleEvent } from "../lib/types";

export function useConsoleWs() {
  const qc = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let attempt = 0;
    let disposed = false;

    function connect() {
      if (disposed) return;

      const host = import.meta.env.DEV ? "localhost:8080" : location.host;
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${host}/ws/console`);
      wsRef.current = ws;

      ws.onopen = () => {
        attempt = 0;
        console.log("[vivarium] console WebSocket connected");
      };

      ws.onmessage = (e) => {
        try {
          const event: ConsoleEvent = JSON.parse(e.data);
          console.log("[vivarium] ws event:", event.type, event);
          if (
            event.type === "vivarium_online" ||
            event.type === "vivarium_offline"
          ) {
            qc.invalidateQueries({ queryKey: ["fleet"] });
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (disposed) return;
        const delay = Math.min(1000 * 2 ** attempt, 30_000);
        attempt++;
        reconnectTimeout = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, [qc]);
}
