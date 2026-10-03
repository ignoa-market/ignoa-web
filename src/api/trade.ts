import { api } from "@/lib/api";
import type {
  MyTradeResponse,
  TradeConfirmResponse,
  TradePrepareResponse,
} from "@/types/api";

export interface TradeConfirmPayload {
  order_id: string;
  payment_key: string;
  amount: number;
}

export const tradeApi = {
  preparePayment: (tradeId: number) =>
    api.post<TradePrepareResponse>(`/api/trades/${tradeId}/payments`),

  confirmPayment: (tradeId: number, payload: TradeConfirmPayload) =>
    api.post<TradeConfirmResponse>(`/api/trades/${tradeId}/payments/confirm`, payload),

  getMyTrade: (itemId: number) =>
    api.get<MyTradeResponse>(`/api/items/${itemId}/trades/me`),
};
