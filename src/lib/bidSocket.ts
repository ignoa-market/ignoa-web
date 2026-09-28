import { Client, type IMessage } from "@stomp/stompjs";
import { getBrokerUrl } from "@/lib/chatSocket";

export interface BidBroadcast {
  item_id: number;
  current_price: number;
  bidder_nickname: string;
  created_at: string;
}

export function createBidSocket(
  itemId: number,
  onBid: (bid: BidBroadcast) => void
) {
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
    },
  });

  return client;
}
