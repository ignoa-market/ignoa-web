import type { ApiError } from "@/types/api";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    return await res.json();
  } catch {
    return { code: "UNKNOWN", message: `HTTP ${res.status}` };
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(init?.headers as Record<string, string> ?? {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && path !== "/api/auth/refresh" && path !== "/api/auth/login") {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers,
        credentials: "include",
      });
    } else {
      onUnauthorized?.();
      throw { code: "UNAUTHORIZED", message: "세션이 만료되었습니다." } satisfies ApiError;
    }
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  const json = await res.json();
  return json.data as T;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const json = await res.json();
    setAccessToken(json.data.access_token);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
  patchForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "PATCH", body: formData }),
};
