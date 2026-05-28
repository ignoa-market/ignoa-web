export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface SliceResponse<T> {
  content: T[];
  has_next: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: { field: string; message: string }[];
}

export interface LoginResponse {
  user_id: number;
  access_token: string;
}

export interface SignupResponse {
  user_id: number;
  access_token: string;
}

export interface RefreshResponse {
  access_token: string;
}

export interface EmailVerifyResponse {
  verified: boolean;
}

export interface UserMeResponse {
  user_id: number;
  email: string;
  nickname: string;
  address: string;
  profile_image_url: string | null;
}

// ────────────────────────────────────────────────
// Item
// ────────────────────────────────────────────────

export type ItemStatus = "ACTIVE" | "CLOSED" | "NO_BID_CLOSED" | "BUY_NOW_CLOSED" | "CANCELED";
export type ItemCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
export type ItemViewType = "ALL" | "POPULAR" | "ENDING_SOON" | "LATEST" | "MY_ITEMS" | "MY_BIDS";

export interface ItemSummary {
  item_id: number;
  brand: string;
  title: string;
  media_url: string;
  current_price: number;
  wish_count: number;
  view_count: number;
  status: ItemStatus;
  end_at: string;
}

export interface ItemMediaInfo {
  id: number;
  url: string;
}

export interface SellerProfile {
  seller_id: number;
  nickname: string;
  profile_image_url: string | null;
  address: string;
}

export interface ItemDetailResponse {
  item_id: number;
  seller: SellerProfile;
  title: string;
  description: string;
  category: string;
  brand: string;
  item_condition: ItemCondition;
  start_price: number;
  current_price: number;
  is_top_bidder: boolean;
  is_bidder: boolean;
  is_seller: boolean;
  status: ItemStatus;
  created_at: string;
  end_at: string;
  is_wished: boolean;
  wish_count: number;
  bid_count: number;
  view_count: number;
  media_urls: ItemMediaInfo[];
}

export interface ItemResponse {
  item_id: number;
}

// ────────────────────────────────────────────────
// Bid
// ────────────────────────────────────────────────

export type BidStatus = "ACTIVE" | "WON";

export interface BidSummary {
  bid_id: number;
  bidder_nickname: string;
  price: number;
  status: BidStatus;
  created_at: string;
}

export interface BidResponse {
  bid_id: number;
  item_id: number;
  bidder_id: number;
  price: number;
  created_at: string;
}

// ────────────────────────────────────────────────
// Wish
// ────────────────────────────────────────────────

export interface WishSummary {
  wish_id: number;
  item_id: number;
  title: string;
  category: string;
  current_price: number;
  wish_count: number;
  end_at: string;
  media_url: string;
  wished_at: string;
}
