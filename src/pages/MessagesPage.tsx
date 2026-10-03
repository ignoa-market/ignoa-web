import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, CreditCard, LoaderCircle, MapPin, MessageSquare, Plus, Send } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { chatApi } from "@/api/chat";
import { itemApi } from "@/api/item";
import { tradeApi } from "@/api/trade";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import type { ApiError, ChatMessageResponse, ChatRoomPreview, ItemDetailResponse, MyTradeResponse } from "@/types/api";
import { toast } from "sonner";

const formatRoomTime = (value: string | null, fallback: string) =>
  new Date(value ?? fallback).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });

const formatMessageTime = (value: string) =>
  new Date(value).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

const mergeMessages = (...groups: ChatMessageResponse[][]) => {
  const merged = new Map<number, ChatMessageResponse>();
  groups.flat().forEach((message) => merged.set(message.message_id, message));
  return [...merged.values()].sort((a, b) => a.message_id - b.message_id);
};

const roomActivityTime = (room: ChatRoomPreview) =>
  new Date(room.last_message_at ?? room.created_at).getTime();

const mergeChatRooms = (fetchedRooms: ChatRoomPreview[], localRooms: ChatRoomPreview[]) => {
  const merged = new Map(fetchedRooms.map((room) => [room.chat_room_id, room]));
  localRooms.forEach((localRoom) => {
    const fetchedRoom = merged.get(localRoom.chat_room_id);
    if (!fetchedRoom) {
      merged.set(localRoom.chat_room_id, localRoom);
      return;
    }
    if (roomActivityTime(localRoom) > roomActivityTime(fetchedRoom)) {
      merged.set(localRoom.chat_room_id, {
        ...fetchedRoom,
        last_message: localRoom.last_message,
        last_message_at: localRoom.last_message_at,
      });
    }
  });
  return [...merged.values()].sort((a, b) => roomActivityTime(b) - roomActivityTime(a));
};

export function MessagesPage() {
  const { userId } = useAuth();
  const { clearNewMessage, reconnectVersion, setMessagesPageActive, subscribe } = useChat();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [payableTrade, setPayableTrade] = useState<MyTradeResponse | null>(null);
  const [canRequestPayment, setCanRequestPayment] = useState(false);
  const [draftItem, setDraftItem] = useState<ItemDetailResponse | null>(null);
  const [isDraftLoading, setIsDraftLoading] = useState(hasRequestedItem && !selectedChat);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const selectedChatRef = useRef<number | null>(selectedChat);
  const sendingRef = useRef(false);
  const chatsRef = useRef<ChatRoomPreview[]>([]);
  const messagesRef = useRef<ChatMessageResponse[]>([]);
  const pendingRoomIdsRef = useRef(new Set<number>());
  const messageLoadGenerationRef = useRef(0);
  const messageScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const container = messageScrollRef.current;
      if (!container) return;
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const upsertMessage = useCallback((incoming: ChatMessageResponse) => {
    if (selectedChatRef.current === incoming.chat_room_id) {
      setMessages((current) => mergeMessages(current, [incoming]));
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
        const currentChatId = selectedChatRef.current;
        if (currentChatId && !rooms.some((room) => room.chat_room_id === currentChatId)) {
          const room = await chatApi.getChatRoom(currentChatId);
          nextRooms = [room, ...rooms];
        }
        if (!stale) {
          setChats((current) => mergeChatRooms(nextRooms, current));
        }
      })
      .catch(() => {
        if (!stale) toast.error("채팅방 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!stale) setIsLoading(false);
      });
    return () => { stale = true; };
  }, [reconnectVersion]);

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
    const loadGeneration = ++messageLoadGenerationRef.current;
    const messageIdsAtRequestStart = new Set(
      messagesRef.current
        .filter((item) => item.chat_room_id === selectedChat)
        .map((item) => item.message_id)
    );
    setIsMessagesLoading(true);
    chatApi.getMessages(selectedChat)
      .then((result) => {
        if (stale || loadGeneration !== messageLoadGenerationRef.current) return;
        const fetched = [...result.content].reverse();
        setMessages((current) => mergeMessages(
          fetched,
          current.filter((item) =>
            item.chat_room_id === selectedChat && !messageIdsAtRequestStart.has(item.message_id)
          )
        ));
        setHasOlderMessages(result.has_next);
        scrollToBottom();
      })
      .catch(() => {
        if (!stale && loadGeneration === messageLoadGenerationRef.current) {
          toast.error("메시지를 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!stale && loadGeneration === messageLoadGenerationRef.current) {
          setIsMessagesLoading(false);
        }
      });
    return () => { stale = true; };
  }, [selectedChat, scrollToBottom, reconnectVersion]);

  const selectChat = (chatRoomId: number | null) => {
    messageLoadGenerationRef.current += 1;
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
    const loadGeneration = messageLoadGenerationRef.current;
    const scrollContainer = messageScrollRef.current;
    const previousScrollHeight = scrollContainer?.scrollHeight ?? 0;
    setIsMessagesLoading(true);
    try {
      const result = await chatApi.getMessages(selectedChat, messages[0].message_id);
      if (selectedChatRef.current !== requestedChatRoomId
        || loadGeneration !== messageLoadGenerationRef.current) return;
      setMessages((current) => mergeMessages([...result.content].reverse(), current));
      setHasOlderMessages(result.has_next);
      requestAnimationFrame(() => {
        if (scrollContainer) scrollContainer.scrollTop += scrollContainer.scrollHeight - previousScrollHeight;
      });
    } catch {
      if (selectedChatRef.current === requestedChatRoomId
        && loadGeneration === messageLoadGenerationRef.current) {
        toast.error("이전 메시지를 불러오지 못했습니다.");
      }
    } finally {
      if (selectedChatRef.current === requestedChatRoomId
        && loadGeneration === messageLoadGenerationRef.current) {
        setIsMessagesLoading(false);
      }
    }
  };

  const handleSend = async () => {
    const content = message.trim();
    if (await sendContent(content)) setMessage("");
  };

  // 입력창 메시지와 메뉴 안내 메시지가 함께 쓰는 전송 로직
  const sendContent = async (content: string) => {
    // state는 다음 렌더에야 바뀌므로 연타는 ref로 막는다
    if ((!selectedChat && !draftItem) || !content || sendingRef.current) return false;
    sendingRef.current = true;
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

      if (!chatRoomId) return false;
      const sentMessage = await chatApi.sendMessage(chatRoomId, content);
      upsertMessage(sentMessage);
      return true;
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message ?? "메시지를 전송하지 못했습니다.");
      return false;
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  // 판매자 결제 요청: 구매자에게 결제 안내 메시지를 보낸다
  const handleRequestPayment = () => {
    void sendContent("결제를 요청했습니다. 입력창 왼쪽 + 버튼의 [결제하기]로 결제해 주세요.");
  };

  const selectedChatData = chats.find((chat) => chat.chat_room_id === selectedChat);
  // 방이 생기기 전(상품에서 문의 시작)은 항상 구매자다
  const myRole = selectedChatData?.role ?? (draftItem ? "BUYER" : undefined);

  // 판매자 결제 요청: 낙찰로 끝난 상품의 채팅방(낙찰자와의 방)에서만 보여준다
  const sellerItemId = myRole === "SELLER" ? selectedChatData?.item_id : undefined;
  useEffect(() => {
    setCanRequestPayment(false);
    if (!sellerItemId) return;
    let stale = false;
    itemApi.getItem(sellerItemId)
      .then((item) => {
        if (!stale) setCanRequestPayment(item.status === "BID_CLOSED");
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [sellerItemId]);

  // 낙찰자 결제: 결제 대기 중인 경매 거래가 있을 때만 [결제하기]를 보여준다
  const payItemId = myRole === "BUYER" ? selectedChatData?.item_id : undefined;
  useEffect(() => {
    setPayableTrade(null);
    if (!payItemId) return;
    let stale = false;
    tradeApi.getMyTrade(payItemId)
      .then((trade) => {
        if (stale) return;
        const payable = trade.type === "AUCTION" && trade.status === "PAYMENT_PENDING";
        setPayableTrade(payable ? trade : null);
      })
      .catch(() => {
        // 거래가 없는 문의방(TRADE_NOT_FOUND)은 결제 버튼을 보여주지 않는다
      });
    return () => {
      stale = true;
    };
  }, [payItemId]);

  const handlePay = () => {
    if (!payableTrade) return;
    navigate(`/app/payments/checkout?tradeId=${payableTrade.trade_id}&itemId=${payableTrade.item_id}`);
  };
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
                    ? <ImageWithFallback src={chat.item_image_url} alt={chat.item_title} loading="lazy" className="h-full w-full object-cover" />
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
                    {(myRole === "BUYER"
                      ? [
                          ...(payableTrade
                            ? [{ label: "결제하기", icon: CreditCard, onSelect: handlePay }]
                            : []),
                          { label: "배송지 보내기", icon: MapPin, onSelect: undefined },
                          { label: "구매 확정", icon: CheckCircle2, onSelect: undefined },
                        ]
                      : myRole === "SELLER"
                        ? [
                            ...(canRequestPayment
                              ? [{ label: "결제 요청", icon: CreditCard, onSelect: handleRequestPayment }]
                              : []),
                            { label: "배송지 요청", icon: MapPin, onSelect: undefined },
                            { label: "발송 완료", icon: CheckCircle2, onSelect: undefined },
                          ]
                        // 역할을 아직 모르면(목록 로딩 중) 메뉴를 비워 둔다
                        : []
                    ).map(({ label, icon: Icon, onSelect }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setActionMenuOpen(false);
                          if (onSelect) {
                            onSelect();
                            return;
                          }
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
              <p className="text-[11px] font-normal text-stone-300">대화를 선택하세요.</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
