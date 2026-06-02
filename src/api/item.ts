import { api } from "@/lib/api";
import type {
  SliceResponse,
  ItemSummary,
  ItemDetailResponse,
  ItemResponse,
  BuyNowResponse,
  ItemCondition,
  ItemViewType,
  BidSummary,
  BidResponse,
  WishSummary,
} from "@/types/api";

// ────────────────────────────────────────────────
// Item
// ────────────────────────────────────────────────

export interface ItemListParams {
  view?: ItemViewType;
  category?: string;
  page?: number;
  size?: number;
}

export interface ItemCreatePayload {
  title: string;
  description: string;
  category: string;
  brand: string;
  size: string;
  item_condition: ItemCondition;
  start_price: number;
  buy_now_price?: number;
  end_at: string;
}

export interface ItemUpdatePayload {
  title: string;
  description: string;
  category: string;
  brand: string;
  item_condition: ItemCondition;
  buy_now_price?: number;
  delete_media_ids?: number[];
}

export const itemApi = {
  getItems: (params: ItemListParams = {}) => {
    const query = new URLSearchParams();
    if (params.view) query.set("view", params.view);
    if (params.category) query.set("category", params.category);
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.size !== undefined) query.set("size", String(params.size));
    return api.get<SliceResponse<ItemSummary>>(`/api/items?${query}`);
  },

  getItem: (itemId: number) =>
    api.get<ItemDetailResponse>(`/api/items/${itemId}`),

  createItem: (payload: ItemCreatePayload, files: File[]) => {
    const formData = new FormData();
    formData.append(
      "request",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    files.forEach((file) => formData.append("files", file));
    return api.postForm<ItemResponse>("/api/items", formData);
  },

  updateItem: (itemId: number, payload: ItemUpdatePayload, files: File[]) => {
    const formData = new FormData();
    formData.append(
      "request",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    files.forEach((file) => formData.append("files", file));
    return api.patchForm<ItemResponse>(`/api/items/${itemId}`, formData);
  },

  cancelItem: (itemId: number) =>
    api.patch<ItemResponse>(`/api/items/${itemId}/cancel`),

  deleteItem: (itemId: number) =>
    api.delete<ItemResponse>(`/api/items/${itemId}`),

  buyNow: (itemId: number) =>
    api.post<BuyNowResponse>(`/api/items/${itemId}/buy-now`, {}),
};

// ────────────────────────────────────────────────
// Bid
// ────────────────────────────────────────────────

export const bidApi = {
  placeBid: (itemId: number, price: number) =>
    api.post<BidResponse>(`/api/items/${itemId}/bids`, { price }),

  getBids: (itemId: number, page = 0, size = 50) =>
    api.get<SliceResponse<BidSummary>>(
      `/api/items/${itemId}/bids?page=${page}&size=${size}`
    ),
};

// ────────────────────────────────────────────────
// Wish
// ────────────────────────────────────────────────

export const wishApi = {
  addWish: (itemId: number) =>
    api.post<void>(`/api/wishes/${itemId}`),

  removeWish: (itemId: number) =>
    api.delete<void>(`/api/wishes/${itemId}`),

  getWishes: (page = 0, size = 10) =>
    api.get<SliceResponse<WishSummary>>(`/api/wishes?page=${page}&size=${size}`),
};
