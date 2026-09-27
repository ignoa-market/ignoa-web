import { api } from "@/lib/api";
import type {
  ChatMessageResponse,
  ChatRoomIdResponse,
  ChatRoomPreview,
  SliceResponse,
} from "@/types/api";

export const chatApi = {
  openChatRoom: (itemId: number) =>
    api.post<ChatRoomIdResponse>(`/api/items/${itemId}/chat-rooms`),

  getChatRooms: () =>
    api.get<ChatRoomPreview[]>("/api/chat-rooms"),

  getChatRoom: (chatRoomId: number) =>
    api.get<ChatRoomPreview>(`/api/chat-rooms/${chatRoomId}`),

  getMessages: (chatRoomId: number, beforeMessageId?: number, size = 30) => {
    const query = new URLSearchParams({ size: String(size) });
    if (beforeMessageId !== undefined) query.set("beforeMessageId", String(beforeMessageId));
    return api.get<SliceResponse<ChatMessageResponse>>(
      `/api/chat-rooms/${chatRoomId}/messages?${query}`
    );
  },

  sendMessage: (chatRoomId: number, content: string) =>
    api.post<ChatMessageResponse>(`/api/chat-rooms/${chatRoomId}/messages`, { content }),
};
