import { api } from "@/lib/api";
import type {
  EmailVerifyResponse,
  ItemSummary,
  LoginResponse,
  SignupResponse,
  UserMeResponse,
} from "@/types/api";

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

  updateProfile: (nickname: string, address: string) =>
    api.patch<UserMeResponse>("/api/users/me", { nickname, address }),

  updateProfileImage: (image: File) => {
    const formData = new FormData();
    formData.append("image", image);
    return api.patchForm<UserMeResponse>("/api/users/me/profile-image", formData);
  },

  deleteProfileImage: () =>
    api.delete<void>("/api/users/me/profile-image"),

  deleteMe: () =>
    api.delete<void>("/api/users/me"),

  getMyItems: () =>
    api.get<ItemSummary[]>("/api/users/me/items"),

  getMyBids: () =>
    api.get<ItemSummary[]>("/api/users/me/bids"),
};
