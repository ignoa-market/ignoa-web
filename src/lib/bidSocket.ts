import { Client, type IMessage } from "@stomp/stompjs";
import { getBrokerUrl } from "@/lib/chatSocket";

export interface BidBroadcast {
  item_id: number;
  bid_id?: number; // 이전 서버는 보내지 않는다 — 백엔드 릴리스 후 필수로 변경
  current_price: number;
  bidder_nickname: string;
  created_at: string;
}

export function createBidSocket(
  itemId: number,
  onBid: (bid: BidBroadcast) => void,
  onConnected?: (reconnected: boolean) => void
) {
  let connectedOnce = false;
  const client = new Client({
    brokerURL: getBrokerUrl(),
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      client.subscribe(`/topic/items/${itemId}`, (frame: IMessage) => {
        try {
          const bid = JSON.parse(frame.body) as BidBroadcast;
          if (bid.item_id === itemId) onBid(bid);
        } catch {
          // Ignore malformed broker messages and keep the connection alive.
        }
      });
      onConnected?.(connectedOnce);
      connectedOnce = true;
    },
  });

  return client;
}
