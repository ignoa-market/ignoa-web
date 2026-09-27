import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, CreditCard, LoaderCircle, MapPin, MessageSquare, Plus, Send } from "lucide-react";
import { useSearchParams } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { chatApi } from "@/api/chat";
import { itemApi } from "@/api/item";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import type { ApiError, ChatMessageResponse, ChatRoomPreview, ItemDetailResponse } from "@/types/api";
import { toast } from "sonner";

const formatRoomTime = (value: string | null, fallback: string) =>
  new Date(value ?? fallback).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });

const formatMessageTime = (value: string) =>
  new Date(value).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

export function MessagesPage() {
  const { userId } = useAuth();
  const { clearNewMessage, setMessagesPageActive, subscribe } = useChat();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedRoomId = Number(searchParams.get("chatRoomId"));
  const requestedItemId = Number(searchParams.get("itemId"));
  const hasRequestedItem = Number.isFinite(requestedItemId) && requestedItemId > 0;
  const [chats, setChats] = useState<ChatRoomPreview[]>([]);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(
    Number.isFinite(requestedRoomId) && requestedRoomId > 0 ? requestedRoomId : null
  );
  const [activeTab, setActiveTab] = useState<"all" | "buying" | "selling">("all");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [draftItem, setDraftItem] = useState<ItemDetailResponse | null>(null);
  const [isDraftLoading, setIsDraftLoading] = useState(hasRequestedItem && !selectedChat);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const selectedChatRef = useRef<number | null>(selectedChat);
  const chatsRef = useRef<ChatRoomPreview[]>([]);
  const pendingRoomIdsRef = useRef(new Set<number>());
  const messageScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const container = messageScrollRef.current;
      if (!container) return;
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const upsertMessage = useCallback((incoming: ChatMessageResponse) => {
    if (selectedChatRef.current === incoming.chat_room_id) {
      setMessages((current) => current.some((item) => item.message_id === incoming.message_id)
        ? current
        : [...current, incoming]
      );
      scrollToBottom();
    }

    setChats((current) => {
      const updated = current.map((room) => room.chat_room_id === incoming.chat_room_id
        ? { ...room, last_message: incoming.content, last_message_at: incoming.created_at }
        : room
      );
      return [...updated].sort((a, b) =>
        new Date(b.last_message_at ?? b.created_at).getTime()
        - new Date(a.last_message_at ?? a.created_at).getTime()
      );
    });

    if (!chatsRef.current.some((room) => room.chat_room_id === incoming.chat_room_id)
      && !pendingRoomIdsRef.current.has(incoming.chat_room_id)) {
      pendingRoomIdsRef.current.add(incoming.chat_room_id);
      chatApi.getChatRoom(incoming.chat_room_id)
        .then((room) => {
          setChats((current) => current.some((item) => item.chat_room_id === room.chat_room_id)
            ? current
            : [{ ...room, last_message: incoming.content, last_message_at: incoming.created_at }, ...current]
          );
        })
        .catch(() => undefined)
        .finally(() => pendingRoomIdsRef.current.delete(incoming.chat_room_id));
    }
  }, [scrollToBottom]);

  useEffect(() => {
    let stale = false;
    chatApi.getChatRooms()
      .then(async (rooms) => {
        if (stale) return;
        let nextRooms = rooms;
        if (selectedChat && !rooms.some((room) => room.chat_room_id === selectedChat)) {
          const room = await chatApi.getChatRoom(selectedChat);
          nextRooms = [room, ...rooms];
        }
        if (!stale) {
          setChats((current) => {
            const merged = new Map(nextRooms.map((room) => [room.chat_room_id, room]));
            current.forEach((room) => {
              const fetched = merged.get(room.chat_room_id);
              merged.set(room.chat_room_id, fetched ? { ...fetched, ...room } : room);
            });
            return [...merged.values()].sort((a, b) =>
              new Date(b.last_message_at ?? b.created_at).getTime()
              - new Date(a.last_message_at ?? a.created_at).getTime()
            );
          });
        }
      })
      .catch(() => {
        if (!stale) toast.error("채팅방 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!stale) setIsLoading(false);
      });
    return () => { stale = true; };
    // Only load the room list on page entry. The selected room is read from the initial URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => subscribe(upsertMessage), [subscribe, upsertMessage]);

  useEffect(() => {
    setMessagesPageActive(true);
    clearNewMessage();
    return () => setMessagesPageActive(false);
  }, [clearNewMessage, setMessagesPageActive]);

  useEffect(() => {
    if (selectedChat || !hasRequestedItem) {
      setDraftItem(null);
      setIsDraftLoading(false);
      return;
    }

    let stale = false;
    setIsDraftLoading(true);
    itemApi.getItem(requestedItemId)
      .then((item) => {
        if (stale) return;
        if (item.is_seller) {
          toast.error("본인 상품에는 채팅할 수 없습니다.");
          setSearchParams({}, { replace: true });
          return;
        }
        setDraftItem(item);
      })
      .catch(() => {
        if (!stale) {
          toast.error("상품 정보를 불러오지 못했습니다.");
          setSearchParams({}, { replace: true });
        }
      })
      .finally(() => {
        if (!stale) setIsDraftLoading(false);
      });
    return () => { stale = true; };
  }, [hasRequestedItem, requestedItemId, selectedChat, setSearchParams]);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    let stale = false;
    setIsMessagesLoading(true);
    chatApi.getMessages(selectedChat)
      .then((result) => {
        if (stale) return;
        const fetched = [...result.content].reverse();
        setMessages((current) => {
          const liveMessages = current.filter((item) => item.chat_room_id === selectedChat);
          const merged = new Map([...fetched, ...liveMessages].map((item) => [item.message_id, item]));
          return [...merged.values()].sort((a, b) => a.message_id - b.message_id);
        });
        setHasOlderMessages(result.has_next);
        scrollToBottom();
      })
      .catch(() => {
        if (!stale) toast.error("메시지를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!stale) setIsMessagesLoading(false);
      });
    return () => { stale = true; };
  }, [selectedChat, scrollToBottom]);

  const selectChat = (chatRoomId: number | null) => {
    selectedChatRef.current = chatRoomId;
    setMessages([]);
    setDraftItem(null);
    setSelectedChat(chatRoomId);
    if (chatRoomId) setSearchParams({ chatRoomId: String(chatRoomId) }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  const loadOlderMessages = async () => {
    if (!selectedChat || !messages[0] || isMessagesLoading) return;
    const requestedChatRoomId = selectedChat;
    const scrollContainer = messageScrollRef.current;
    const previousScrollHeight = scrollContainer?.scrollHeight ?? 0;
    setIsMessagesLoading(true);
    try {
      const result = await chatApi.getMessages(selectedChat, messages[0].message_id);
      if (selectedChatRef.current !== requestedChatRoomId) return;
      setMessages((current) => [...result.content].reverse().concat(current));
      setHasOlderMessages(result.has_next);
      requestAnimationFrame(() => {
        if (scrollContainer) scrollContainer.scrollTop += scrollContainer.scrollHeight - previousScrollHeight;
      });
    } catch {
      if (selectedChatRef.current === requestedChatRoomId) {
        toast.error("이전 메시지를 불러오지 못했습니다.");
      }
    } finally {
      if (selectedChatRef.current === requestedChatRoomId) {
        setIsMessagesLoading(false);
      }
    }
  };

  const handleSend = async () => {
    const content = message.trim();
    if ((!selectedChat && !draftItem) || !content || isSending) return;
    setIsSending(true);
    try {
      let chatRoomId = selectedChat;
      if (!chatRoomId && draftItem) {
        const room = await chatApi.openChatRoom(draftItem.item_id);
        chatRoomId = room.chat_room_id;
        selectedChatRef.current = chatRoomId;
        setSelectedChat(chatRoomId);
        setSearchParams({ chatRoomId: String(chatRoomId) }, { replace: true });
      }

      if (!chatRoomId) return;
      const sentMessage = await chatApi.sendMessage(chatRoomId, content);
      setMessage("");
      upsertMessage(sentMessage);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message ?? "메시지를 전송하지 못했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const selectedChatData = chats.find((chat) => chat.chat_room_id === selectedChat);
  const hasConversation = Boolean(selectedChat || draftItem || isDraftLoading);
  const partnerNickname = selectedChatData?.partner_nickname ?? draftItem?.seller.nickname;
  const partnerProfileImageUrl = selectedChatData?.partner_profile_image_url
    ?? draftItem?.seller.profile_image_url;
  const conversationItemTitle = selectedChatData?.item_title ?? draftItem?.title;
  const filteredChats = chats.filter((chat) =>
    activeTab === "all"
    || (activeTab === "buying" && chat.role === "BUYER")
    || (activeTab === "selling" && chat.role === "SELLER")
  );

  return (
    <div className="bg-white pb-10 pt-[170px]">
      <div className="mx-auto w-full max-w-[960px] px-8">
      <div className="h-[67vh] min-h-[528px] flex overflow-hidden border-x border-b border-stone-100">
        <div className={`min-h-0 w-full md:w-[264px] flex-shrink-0 border-r border-stone-100 flex-col ${hasConversation ? "hidden md:flex" : "flex"}`}>
          <div className="px-4 h-14 flex items-center gap-1 border-b border-stone-100">
            {(["all", "buying", "selling"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 h-7 rounded-full text-[11px] font-medium transition-all ${
                  activeTab === tab ? "bg-stone-800 text-white" : "text-stone-400 hover:text-stone-700"
                }`}
              >
                {{ all: "전체", buying: "구매", selling: "판매" }[tab]}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="flex h-full items-center justify-center"><LoaderCircle className="h-5 w-5 animate-spin text-stone-300" /></div>
            ) : filteredChats.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs font-normal text-stone-400">
                  {{ all: "대화가 없습니다.", buying: "구매 대화가 없습니다.", selling: "판매 대화가 없습니다." }[activeTab]}
                </p>
              </div>
            ) : filteredChats.map((chat) => (
              <button
                key={chat.chat_room_id}
                onClick={() => selectChat(chat.chat_room_id)}
                className={`w-full px-4 py-3 flex items-center gap-2.5 border-b border-stone-100 transition-colors hover:bg-stone-50 text-left relative ${
                  selectedChat === chat.chat_room_id ? "bg-stone-50" : ""
                }`}
              >
                {selectedChat === chat.chat_room_id && <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-stone-800" />}
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarImage src={chat.partner_profile_image_url ?? undefined} />
                  <AvatarFallback className="bg-stone-100 text-xs text-stone-500">{chat.partner_nickname.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="truncate text-xs font-semibold text-stone-800">{chat.partner_nickname}</span>
                    <span className="ml-2 flex-shrink-0 text-[10px] text-stone-400">{formatRoomTime(chat.last_message_at, chat.created_at)}</span>
                  </div>
                  <p className="truncate text-[11px] text-stone-500">{chat.last_message ?? chat.item_title}</p>
                </div>
                <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded bg-stone-100">
                  {chat.item_image_url
                    ? <img src={chat.item_image_url} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center"><MessageSquare className="h-4 w-4 text-stone-300" /></div>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {hasConversation ? (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="px-4 h-14 border-b border-stone-100 flex items-center gap-2.5">
              <button onClick={() => selectChat(null)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100">
                <ChevronLeft className="w-4 h-4 text-stone-500" />
              </button>
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={partnerProfileImageUrl ?? undefined} />
                <AvatarFallback className="bg-stone-100 text-sm text-stone-500">{partnerNickname?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-stone-800">{partnerNickname}</p>
                <p className="truncate text-[10px] text-stone-400">{conversationItemTitle}</p>
              </div>
            </div>

            <div ref={messageScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-4 py-5 space-y-2.5">
              {hasOlderMessages && (
                <div className="flex justify-center pb-2">
                  <button onClick={loadOlderMessages} disabled={isMessagesLoading} className="text-xs text-stone-400 hover:text-stone-700 disabled:opacity-50">이전 메시지 불러오기</button>
                </div>
              )}
              {(isMessagesLoading || isDraftLoading) && messages.length === 0 ? (
                <div className="flex h-full items-center justify-center"><LoaderCircle className="h-5 w-5 animate-spin text-stone-300" /></div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center"><p className="text-xs text-stone-300">첫 메시지를 보내보세요.</p></div>
              ) : messages.map((item) => {
                const isMe = item.sender_id === userId;
                return (
                  <div key={item.message_id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[68%] rounded-2xl px-3.5 py-2 ${
                      isMe ? "rounded-br-sm bg-stone-800 text-white" : "rounded-bl-sm bg-white text-stone-800 shadow-sm"
                    }`}>
                      <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">{item.content}</p>
                      <p className={`mt-1 text-[10px] ${isMe ? "text-white/50" : "text-stone-400"}`}>{formatMessageTime(item.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-100 bg-white px-4 py-3">
              <div className="relative flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActionMenuOpen((open) => !open)}
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                    actionMenuOpen
                      ? "border-stone-800 bg-stone-800 text-white"
                      : "border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800"
                  }`}
                  aria-label="채팅 기능 열기"
                  aria-expanded={actionMenuOpen}
                >
                  <Plus className={`h-4 w-4 transition-transform ${actionMenuOpen ? "rotate-45" : ""}`} />
                </button>

                {actionMenuOpen && (
                  <div className="absolute bottom-full left-0 z-20 mb-3 w-48 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-lg">
                    {[
                      { label: "결제 요청", icon: CreditCard },
                      { label: "배송지 요청", icon: MapPin },
                      { label: "거래 완료 요청", icon: CheckCircle2 },
                    ].map(({ label, icon: Icon }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setActionMenuOpen(false);
                          toast.info(`${label} 기능은 준비 중입니다.`);
                        }}
                        className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                      >
                        <Icon className="h-4 w-4 text-stone-400" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                <Input
                  placeholder="메시지를 입력하세요."
                  value={message}
                  maxLength={1000}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  className="h-9 flex-1 rounded-full border-stone-200 px-4 text-xs focus-visible:ring-1 focus-visible:ring-stone-400"
                />
                <button
                  onClick={() => void handleSend()}
                  disabled={!message.trim() || isSending || isDraftLoading}
                  className="w-8 h-8 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all flex-shrink-0"
                >
                  {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-[15px] w-[15px]" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-white">
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center"><MessageSquare className="w-6 h-6 text-stone-300" /></div>
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-stone-300">대화를 선택하세요</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
