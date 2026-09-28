import { Client, type IMessage } from "@stomp/stompjs";
import { refreshAccessToken } from "@/lib/api";
import type { ChatMessageResponse } from "@/types/api";

export function getBrokerUrl() {
  const configuredUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (configuredUrl) return configuredUrl;

  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? window.location.origin;
  const url = new URL(apiUrl, window.location.origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function createChatSocket(
  onMessage: (message: ChatMessageResponse) => void,
  onConnectionError?: () => void,
  onConnected?: (reconnected: boolean) => void
) {
  let connectedOnce = false;
  const client = new Client({
    brokerURL: getBrokerUrl(),
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    beforeConnect: async () => {
      const token = await refreshAccessToken();
      if (!token) {
        onConnectionError?.();
        throw new Error("채팅 연결 인증에 실패했습니다.");
      }
      client.connectHeaders = { Authorization: `Bearer ${token}` };
    },
    onConnect: () => {
      client.subscribe("/user/queue/chat", (frame: IMessage) => {
        try {
          onMessage(JSON.parse(frame.body) as ChatMessageResponse);
        } catch {
          // Ignore malformed broker messages and keep the connection alive.
        }
      });
      onConnected?.(connectedOnce);
      connectedOnce = true;
    },
    onStompError: () => onConnectionError?.(),
    onWebSocketError: () => onConnectionError?.(),
  });

  return client;
}
