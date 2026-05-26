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
