import { api } from "@/lib/api";
import type { ChatRoomPreview } from "@/types/api";

export const chatApi = {
  getChatRooms: () =>
    api.get<ChatRoomPreview[]>("/api/chat-rooms"),
};
