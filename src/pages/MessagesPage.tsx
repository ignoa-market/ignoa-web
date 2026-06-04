import { useState } from "react";
import { Send, ChevronLeft, MessageSquare, ImageIcon, X, Plus, Truck, CheckCircle, FileText, Banknote, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  productTitle?: string;
  productImage?: string;
}

interface Message {
  id: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  timestamp: string;
}

export function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "buying" | "selling">("all");
  const [message, setMessage] = useState("");
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [actionPanelOpen, setActionPanelOpen] = useState(false);

  const ACTION_BUTTONS = [
    { icon: Truck,        label: "택배 신청",    desc: "택배사 연동 배송 신청" },
    { icon: FileText,     label: "송장번호 전달", desc: "운송장 번호 입력 후 전달" },
    { icon: Banknote,     label: "계좌번호 전달", desc: "정산 계좌 정보 공유" },
    { icon: CheckCircle,  label: "거래 완료",    desc: "거래를 완료로 변경" },
    { icon: AlertCircle,  label: "거래 취소",    desc: "거래 취소 요청" },
  ];

  const chats: Chat[] = [
    {
      id: "1",
      name: "김민준",
      lastMessage: "혹시 직거래 가능하신가요?",
      timestamp: "11:42",
      unread: 2,
      productTitle: "Nike Air Force 1 Low '07",
      productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
    },
    {
      id: "2",
      name: "이서연",
      lastMessage: "네 확인했습니다 감사해요",
      timestamp: "어제",
      unread: 0,
      productTitle: "Stüssy 8 Ball Crewneck",
    },
  ];

  const mockMessages: Record<string, Message[]> = {
    "1": [
      { id: "m1", senderId: "other", text: "안녕하세요! 상품 문의드려도 될까요?", timestamp: "11:30" },
      { id: "m2", senderId: "me", text: "네 말씀하세요!", timestamp: "11:31" },
      { id: "m3", senderId: "other", text: "사이즈가 270인데 발볼이 좀 있는 편인데 사이즈 여유 있을까요?", timestamp: "11:33" },
      { id: "m4", senderId: "me", text: "저도 270 신는데 발볼 넓은 편이에요. 에어포스는 원래 여유롭게 나와서 괜찮을 것 같아요.", timestamp: "11:35" },
      { id: "m5", senderId: "other", text: "아 그렇군요 감사합니다! 혹시 직거래 가능하신가요?", timestamp: "11:42" },
    ],
    "2": [
      { id: "m1", senderId: "me", text: "낙찰 축하드려요! 배송 주소 알려주시면 바로 발송할게요.", timestamp: "어제 14:20" },
      { id: "m2", senderId: "other", text: "서울시 마포구 합정동 ***번지 이○○ 010-****-****", timestamp: "어제 14:35" },
      { id: "m3", senderId: "me", text: "확인했습니다! 내일 오전 중으로 발송 예정이에요.", timestamp: "어제 14:40" },
      { id: "m4", senderId: "other", text: "네 확인했습니다 감사해요", timestamp: "어제 14:41" },
    ],
  };

  const messages: Message[] = selectedChat ? (mockMessages[selectedChat] ?? []) : [];
  const selectedChatData = chats.find((c) => c.id === selectedChat);

  const handleSend = () => {
    if (!message.trim() && !mediaPreview) return;
    setMessage("");
    setMediaPreview(null);
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type });
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-white pt-[196px]">
      <div className="h-[calc(100vh-196px)] flex border-t border-stone-100">

        {/* Chat List */}
        <div className={`w-full md:w-[420px] flex-shrink-0 border-r border-stone-100 flex flex-col ${selectedChat ? "hidden md:flex" : "flex"}`}>
          <div className="px-5 h-[68px] flex items-center gap-1 border-b border-stone-100">
            {(["all", "buying", "selling"] as const).map((tab) => {
              const label = { all: "전체", buying: "구매", selling: "판매" }[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 h-8 rounded-full text-xs font-medium transition-all ${
                    activeTab === tab
                      ? "bg-stone-800 text-white"
                      : "text-stone-400 hover:text-stone-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-300">No messages</p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full px-5 py-4 flex items-center gap-3 border-b border-stone-100 transition-colors hover:bg-stone-50 text-left relative ${
                    selectedChat === chat.id ? "bg-stone-50" : ""
                  }`}
                >
                  {selectedChat === chat.id && (
                    <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-stone-800 rounded-r-full" />
                  )}
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-stone-100 text-stone-500 text-sm">
                      {chat.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-stone-800 truncate">{chat.name}</span>
                      <span className="text-[11px] text-stone-400 flex-shrink-0 ml-2">{chat.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-stone-500 truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="ml-2 flex-shrink-0 w-4 h-4 bg-stone-800 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden bg-stone-100">
                    {chat.productImage
                      ? <img src={chat.productImage} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-stone-300" />
                        </div>
                    }
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        {selectedChat ? (
          <div className={`flex flex-col flex-1 relative ${selectedChat ? "flex" : "hidden md:flex"}`}>
            {/* Header */}
            <div className="px-5 h-[68px] border-b border-stone-100 flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-stone-500" />
              </button>
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarImage src={selectedChatData?.avatar} />
                <AvatarFallback className="bg-stone-100 text-stone-500 text-sm">
                  {selectedChatData?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800">{selectedChatData?.name}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3 bg-stone-50">
              {messages.map((msg) => {
                const isMe = msg.senderId === "me";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[68%] rounded-2xl overflow-hidden ${
                      isMe
                        ? "bg-stone-800 text-white rounded-br-sm"
                        : "bg-white text-stone-800 rounded-bl-sm shadow-sm"
                    }`}>
                      {msg.mediaType === "image" && msg.mediaUrl && (
                        <img src={msg.mediaUrl} alt="" className="w-full max-w-[260px] object-cover" />
                      )}
                      {msg.mediaType === "video" && msg.mediaUrl && (
                        <video src={msg.mediaUrl} controls className="w-full max-w-[260px]" />
                      )}
                      {msg.text && (
                        <div className="px-4 py-2.5">
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                      )}
                      <div className={`px-4 pb-2 ${msg.text ? "pt-0" : "pt-1"}`}>
                        <p className={`text-[10px] ${isMe ? "text-white/50" : "text-stone-400"}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Panel */}
            <AnimatePresence>
              {actionPanelOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10"
                    onClick={() => setActionPanelOpen(false)}
                  />
                  <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 320 }}
                    className="absolute bottom-[72px] left-0 right-0 z-20 bg-white border-t border-stone-100 shadow-lg px-5 py-4"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-400 mb-3">거래 관련</p>
                    <div className="grid grid-cols-5 gap-2">
                      {ACTION_BUTTONS.map(({ icon: Icon, label }) => (
                        <button
                          key={label}
                          onClick={() => setActionPanelOpen(false)}
                          className="flex flex-col items-center gap-2 py-3 rounded-xl hover:bg-stone-50 transition-all group"
                        >
                          <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-stone-200 transition-all">
                            <Icon className="w-[17px] h-[17px] text-stone-500 group-hover:text-stone-800 transition-colors" />
                          </div>
                          <span className="text-[10px] text-stone-500 font-medium text-center leading-tight group-hover:text-stone-800 transition-colors">{label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="px-5 py-4 border-t border-stone-100 bg-white">
              {mediaPreview && (
                <div className="mb-3 relative inline-block">
                  {mediaPreview.type === "image"
                    ? <img src={mediaPreview.url} alt="" className="h-20 rounded-lg object-cover" />
                    : <video src={mediaPreview.url} className="h-20 rounded-lg" />
                  }
                  <button
                    onClick={() => setMediaPreview(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stone-800 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-4">
                {/* 왼쪽: + 버튼 */}
                <button
                  onClick={() => setActionPanelOpen((v) => !v)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-all flex-shrink-0 -ml-[10px] ${
                    actionPanelOpen ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800"
                  }`}
                >
                  <Plus className={`w-[17px] h-[17px] transition-transform duration-200 ${actionPanelOpen ? "rotate-45" : ""}`} />
                </button>

                <Input
                  placeholder="메시지를 입력하세요"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="flex-1 h-10 border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-stone-400"
                />

                {/* 오른쪽: 미디어/전송 */}
                <input
                  id="media-upload"
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const type = file.type.startsWith("video/") ? "video" : "image";
                    handleMediaSelect(e, type);
                  }}
                />
                <button
                  onClick={() => document.getElementById("media-upload")?.click()}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-all flex-shrink-0"
                >
                  <ImageIcon className="w-[17px] h-[17px]" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() && !mediaPreview}
                  className="w-9 h-9 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all flex-shrink-0"
                >
                  <Send className="w-[15px] h-[15px]" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-stone-50">
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-stone-300" />
              </div>
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-stone-300">대화를 선택하세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
