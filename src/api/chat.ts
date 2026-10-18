import { api } from "@/lib/api";
import type {
  ChatMessageResponse,
  ChatRoomIdResponse,
  ChatRoomPreview,
  MyChatRoomResponse,
  CursorResponse,
} from "@/types/api";

export const chatApi = {
  openChatRoom: (itemId: number) =>
    api.post<ChatRoomIdResponse>(`/api/items/${itemId}/chat-rooms`),

  getMyChatRoom: (itemId: number) =>
    api.get<MyChatRoomResponse>(`/api/items/${itemId}/chat-rooms/me`),

  getChatRooms: () =>
    api.get<ChatRoomPreview[]>("/api/chat-rooms"),

  getChatRoom: (chatRoomId: number) =>
    api.get<ChatRoomPreview>(`/api/chat-rooms/${chatRoomId}`),

  getMessages: (chatRoomId: number, cursor?: number, size = 30) => {
    const query = new URLSearchParams({ size: String(size) });
    if (cursor !== undefined) query.set("cursor", String(cursor));
    return api.get<CursorResponse<ChatMessageResponse>>(
      `/api/chat-rooms/${chatRoomId}/messages?${query}`
    );
  },

  sendMessage: (chatRoomId: number, content: string) =>
    api.post<ChatMessageResponse>(`/api/chat-rooms/${chatRoomId}/messages`, { content }),
};
