import { api } from "@/lib/api";
import type {
  CursorResponse,
  EmailVerifyResponse,
  ItemSummary,
  LoginResponse,
  PurchaseSummary,
  SignupResponse,
  UserMeResponse,
} from "@/types/api";

const cursorQuery = (cursor?: number | null) => (cursor ? `?cursor=${cursor}` : "");

export interface SignupPayload {
  email: string;
  password: string;
  nickname: string;
  address: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/api/auth/login", { email, password }),

  recover: (email: string, password: string) =>
    api.post<LoginResponse>("/api/auth/recover", { email, password }),

  signup: (payload: SignupPayload) =>
    api.post<SignupResponse>("/api/auth/signup", payload),

  logout: () =>
    api.post<void>("/api/auth/logout"),

  sendEmailCode: (email: string) =>
    api.post<void>("/api/auth/email/send", { email }),

  verifyEmailCode: (email: string, code: string) =>
    api.post<EmailVerifyResponse>("/api/auth/email/verify", { email, code }),

  kakaoLogin: (code: string) =>
    api.post<LoginResponse>("/api/auth/oauth/kakao", { code }),
};

export const userApi = {
  checkEmailDuplicate: (email: string) =>
    api.get<void>(`/api/users/email/duplicate?email=${encodeURIComponent(email)}`),

  checkNicknameDuplicate: (nickname: string) =>
    api.get<void>(`/api/users/nickname/duplicate?nickname=${encodeURIComponent(nickname)}`),

  getMe: () =>
    api.get<UserMeResponse>("/api/users/me"),

  // 바뀐 항목만 보낸다. 보내지 않은 항목은 서버가 그대로 둔다 (bio는 ""를 보내면 삭제)
  updateProfile: (payload: { nickname?: string; address?: string; bio?: string }) =>
    api.patch<UserMeResponse>("/api/users/me", payload),

  updateProfileImage: (image: File) => {
    const formData = new FormData();
    formData.append("image", image);
    return api.patchForm<UserMeResponse>("/api/users/me/profile-image", formData);
  },

  deleteProfileImage: () =>
    api.delete<void>("/api/users/me/profile-image"),

  deleteMe: () =>
    api.delete<void>("/api/users/me"),

  // 마이페이지 목록은 서버가 20개씩 고정으로 주고, 다음 페이지는 next_cursor로 이어 받는다
  getMyItems: (cursor?: number | null) =>
    api.get<CursorResponse<ItemSummary>>(`/api/users/me/items${cursorQuery(cursor)}`),

  getMyBids: (cursor?: number | null) =>
    api.get<CursorResponse<ItemSummary>>(`/api/users/me/bids${cursorQuery(cursor)}`),

  getMyPurchases: (cursor?: number | null) =>
    api.get<CursorResponse<PurchaseSummary>>(`/api/users/me/purchases${cursorQuery(cursor)}`),
};
