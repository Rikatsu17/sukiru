"use client";

import { useEffect, useRef } from "react";
import { getWsUrl } from "@/lib/api";

interface WsMessage {
  type: string;
  payload?: Record<string, unknown>;
}

export function useLiveUpdates(onMessage: (message: WsMessage) => void, enabled: boolean) {
  const handlerRef = useRef(onMessage);

  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    function connect() {
      if (stopped) return;
      try {
        socket = new WebSocket(getWsUrl("/ws/notifications"));
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as WsMessage;
            handlerRef.current(data);
          } catch {
            // ignore malformed frames
          }
        };
        socket.onclose = () => {
          if (!stopped) retryTimer = setTimeout(connect, 4000);
        };
        socket.onerror = () => {
          socket?.close();
        };
      } catch {
        retryTimer = setTimeout(connect, 4000);
      }
    }

    connect();

    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
    };
  }, [enabled]);
}
